import React, { useState, useEffect, useMemo, useRef } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, subMonths, addMonths, differenceInCalendarDays, addDays, isWithinInterval, max, min, getDate, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Save, Calendar as CalendarIcon, Loader2, Edit2, Lock } from "lucide-react";
import { API } from "../../../../../../constant";
import axios from "axios";
import { useProject } from "../../../../ProjectContext";
import { toast } from "react-toastify";

// --- STRICT UTC HELPER ---
const normalizeToUTC = (dateStr) => {
  if (!dateStr) return null;
  return dateStr.substring(0, 10) + "T00:00:00.000Z";
};

// --- Data Processor ---
const processData = (items) => {
  if (!Array.isArray(items)) return [];

  return items.map(item => {
    const sortedDaily = Array.isArray(item.daily) 
      ? [...item.daily].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : [];

    // FIX: Set to null if missing. Do NOT fallback to 'new Date()' to avoid fake markers.
    const originalStart = normalizeToUTC(item.start_date);
    const originalEnd = normalizeToUTC(item.end_date);
    
    // Revised defaults to Original if missing
    const revisedStart = normalizeToUTC(item.revised_start_date) || originalStart;
    const revisedEnd = normalizeToUTC(item.revised_end_date) || originalEnd;

    return {
      ...item,
      original_start_date: originalStart, 
      original_end_date: originalEnd,     
      revised_start_date: revisedStart,   
      revised_end_date: revisedEnd,       
      daily: sortedDaily
    };
  });
};

// --- Helper: Calculate Single Week Plan Badge ---
const getWeeklyPlanForLabel = (item, weekStartDay, activeStartStr, activeEndStr, monthStart) => {
  if (!activeStartStr || !activeEndStr) return null;

  const startDate = parseISO(activeStartStr);
  const endDate = parseISO(activeEndStr);
  const totalDuration = differenceInCalendarDays(endDate, startDate) + 1;
  if (totalDuration <= 0) return null;

  const dailyRate = item.quantity / totalDuration;

  const dayNum = getDate(weekStartDay);
  let weekEndDayNum;
  let weekIndex;

  if (dayNum <= 7) { weekEndDayNum = 7; weekIndex = 1; }
  else if (dayNum <= 14) { weekEndDayNum = 14; weekIndex = 2; }
  else if (dayNum <= 21) { weekEndDayNum = 21; weekIndex = 3; }
  else { weekEndDayNum = 31; weekIndex = 4; }

  const mEnd = endOfMonth(monthStart);
  let weekEnd = new Date(monthStart.getFullYear(), monthStart.getMonth(), weekEndDayNum);
  if (weekEnd > mEnd) weekEnd = mEnd;
  
  let logicalWeekStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), (weekIndex - 1) * 7 + 1);
  
  const overlapStart = max([startOfDay(logicalWeekStart), startOfDay(startDate)]);
  const overlapEnd = min([startOfDay(weekEnd), startOfDay(endDate)]);

  if (overlapStart > overlapEnd) return null;
  if (!isSameDay(weekStartDay, overlapStart)) return null;

  const overlapDays = differenceInCalendarDays(overlapEnd, overlapStart) + 1;
  const plannedQty = (overlapDays * dailyRate).toFixed(1);

  return { label: `W${weekIndex}: ${plannedQty}`, weekIndex };
};


const DailyProjects = () => {
  const { tenderId } = useProject();
  
  const [currentDate, setCurrentDate] = useState(new Date("2025-12-01")); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState({}); 
  const [revisedDateUpdates, setRevisedDateUpdates] = useState({}); 
  const [startDateUpdates, setStartDateUpdates] = useState({}); 
  const [isEditing, setIsEditing] = useState(false);

  const scrollContainerRef = useRef(null);

  const fetchWBS = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/schedule/get-daily-schedule/${tenderId}`);
      if (res.data && res.data.data) {
        setItems(processData(res.data.data));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch Schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWBS();
  }, [tenderId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [currentDate]);

  const daysInMonth = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }), [currentDate]);

  const handlePrevMonth = () => setCurrentDate(prev => startOfMonth(subMonths(prev, 1)));
  const handleNextMonth = () => setCurrentDate(prev => startOfMonth(addMonths(prev, 1)));

  const handleInputChange = (wbsId, dateStr, value) => {
    setUpdates(prev => ({ ...prev, [`${wbsId}-${dateStr}`]: value }));
  };

  const getRevisedEndDate = (item) => revisedDateUpdates[item.wbs_id] || item.revised_end_date;
  const getRevisedStartDate = (item) => startDateUpdates[item.wbs_id] || item.revised_start_date;

  const clearValuesInRange = (wbsId, rangeStart, rangeEnd) => {
    if (rangeStart > rangeEnd) return; 
    const datesToClear = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    setUpdates(prev => {
      const newUpdates = { ...prev };
      datesToClear.forEach(date => {
        // Ensure keys being cleared also match the UTC Midnight format
        const key = `${wbsId}-${normalizeToUTC(date.toISOString())}`;
        delete newUpdates[key]; 
      });
      return newUpdates;
    });
  };

  // --- Strict Bounded Logic ---
// --- Strict Constraints: OS/OE Boundaries & Choice Logic ---
  const handleCellDoubleClick = (item, dateStr) => {
    if (!isEditing) return;

    // 1. Parse Clicked Date
    const clickedDate = parseISO(dateStr);
    const normClicked = startOfDay(clickedDate);

    // 2. Get Current Dates (OS, OE, RS, RE)
    const currentRevisedStartStr = getRevisedStartDate(item);
    const currentRevisedEndStr = getRevisedEndDate(item);
    const originalStartStr = item.original_start_date;
    const originalEndStr = item.original_end_date;

    // Initialize (if empty)
    if (!currentRevisedStartStr) {
        if(window.confirm(`Set Project Start to ${format(clickedDate, 'dd MMM')}?`)) {
             setStartDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
             setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
             toast.success("Project Started");
        }
        return;
    }

    const normRevisedStart = startOfDay(parseISO(currentRevisedStartStr));
    const normRevisedEnd = startOfDay(parseISO(currentRevisedEndStr));
    const normOriginalStart = originalStartStr ? startOfDay(parseISO(originalStartStr)) : null;
    const normOriginalEnd = originalEndStr ? startOfDay(parseISO(originalEndStr)) : null;

    // =================================================================================
    // ZONE 1: BLOCKED (Below Original Start)
    // "not below to 5 like 4,3,2..."
    // =================================================================================
    if (normOriginalStart && normClicked < normOriginalStart) {
        toast.warn(`Revised Start cannot be before Original Start (${format(normOriginalStart, 'dd MMM')})`);
        return;
    }

    // =================================================================================
    // ZONE 2: END DATE LOGIC (Above Original End)
    // "on double click above OE... revise end date"
    // "can be 14, 15... but not below OE"
    // =================================================================================
    if (normOriginalEnd && normClicked > normOriginalEnd) {
        // We are strictly modifying RE here.
        if (normClicked > normRevisedEnd) {
            // Extending
            setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
            toast.info(`Revised End extended to ${format(clickedDate, "dd MMM")}`);
        } else {
            // Reducing (but still > OE)
            if (window.confirm(`Reduce Revised End Date to ${format(clickedDate, "dd MMM")}?`)) {
                clearValuesInRange(item.wbs_id, addDays(normClicked, 1), normRevisedEnd);
                setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
                toast.info(`End Date reduced`);
            }
        }
        return;
    }

    // =================================================================================
    // ZONE 3: EXACTLY ON ORIGINAL END (Ambiguous Zone)
    // "on double click on Original end date OE: ask want to revise start or end"
    // =================================================================================
    if (normOriginalEnd && isSameDay(normClicked, normOriginalEnd)) {
        // Create a custom choice flow using confirm (Binary choice)
        // OK = Revise Start | Cancel = Revise End
        
        // Note: JS confirm is limited. Ideally use a custom modal. 
        // Here we frame the question to work with OK/Cancel.
        const choice = window.confirm(
            `You clicked the Original End Date (${format(clickedDate, 'dd MMM')}).\n\n` +
            `Click OK to set REVISED START (Delay start to this date).\n` +
            `Click CANCEL to set REVISED END (Reset end to this date).`
        );

        if (choice) {
            // --- OPTION A: REVISE START (Delay RS to OE) ---
            const diffDays = differenceInCalendarDays(normClicked, normRevisedStart);
            
            // 1. Move Start
            clearValuesInRange(item.wbs_id, normRevisedStart, addDays(normClicked, -1));
            setStartDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));

            // 2. Ask to Extend RE
            if(window.confirm(`Start delayed by ${diffDays} days.\n\nExtend Revised End by ${diffDays} days?`)) {
                const newEnd = addDays(normRevisedEnd, diffDays);
                const newEndStr = format(newEnd, "yyyy-MM-dd") + "T00:00:00.000Z";
                setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: newEndStr }));
                toast.success(`Start delayed to OE & End extended`);
            } else {
                toast.success(`Start delayed to OE`);
            }
        } else {
            // --- OPTION B: REVISE END (Reset RE to OE) ---
            // If current RE is > OE, we are reducing it back to OE
            if (normRevisedEnd > normClicked) {
                clearValuesInRange(item.wbs_id, addDays(normClicked, 1), normRevisedEnd);
            }
            setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
            toast.info(`Revised End reset to Original End`);
        }
        return;
    }

    // =================================================================================
    // ZONE 4: START DATE LOGIC (Between OS and OE)
    // "RS can be from 7... to 13... not above 13"
    // =================================================================================
    if (normOriginalStart && normOriginalEnd && normClicked >= normOriginalStart && normClicked < normOriginalEnd) {
        
        // This is strictly RS modification.
        
        // Case A: Backward Shift (Early)
        // "if RS is backward one day just update RS"
        if (normClicked < normRevisedStart) {
            if (window.confirm(`Move Revised Start earlier to ${format(clickedDate, 'dd MMM')}?`)) {
                setStartDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
                toast.success(`Start Date moved earlier`);
            }
            return;
        }

        // Case B: Forward Shift (Delay)
        // "if RS delayed one day ask want to extend RE"
        if (normClicked > normRevisedStart) {
            const diffDays = differenceInCalendarDays(normClicked, normRevisedStart);
            
            if (window.confirm(`Delay Revised Start by ${diffDays} days to ${format(clickedDate, 'dd MMM')}?`)) {
                
                // 1. Update RS
                clearValuesInRange(item.wbs_id, normRevisedStart, addDays(normClicked, -1));
                setStartDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));

                // 2. Ask Update RE
                if(window.confirm(`Add these ${diffDays} days to the Revised End Date?`)) {
                    const newEnd = addDays(normRevisedEnd, diffDays);
                    const newEndStr = format(newEnd, "yyyy-MM-dd") + "T00:00:00.000Z";
                    setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: newEndStr }));
                    toast.success(`Start delayed & End extended`);
                } else {
                    toast.success(`Start delayed`);
                }
            }
            return;
        }
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
        try {
            const res = await axios.put(`${API}/schedule/update-daily-schedule/${tenderId}`, {
                daily_updates: updates,
                revised_end_dates: revisedDateUpdates,
                new_start_dates: startDateUpdates
            });
            if (res.data && res.data.status) {
                toast.success("Schedule Updated Successfully");
                setIsEditing(false);
                setUpdates({});
                setRevisedDateUpdates({});
                setStartDateUpdates({});
                fetchWBS(); 
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to Update Schedule");
        }
    } else {
        setIsEditing(true);
        toast.info("Edit Mode Enabled");
    }
  };

  const getInputValue = (item, dayStr) => {
    const key = `${item.wbs_id}-${dayStr}`;
    if (updates.hasOwnProperty(key)) return updates[key];
    const dayRecord = item.daily.find(d => isSameDay(parseISO(d.date), parseISO(dayStr)));
    return dayRecord ? dayRecord.quantity : "";
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-layout-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                Daily Progress {!isEditing && <Lock size={14} className="text-gray-400" />}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {isEditing ? "Double-click cells to adjust active timeline" : "Click 'Edit' to make changes"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><ChevronLeft size={18} /></button>
            <span className="px-4 font-semibold text-sm w-32 text-center text-gray-700 dark:text-gray-200 min-w-[140px]">{format(currentDate, "MMMM yyyy")}</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><ChevronRight size={18} /></button>
          </div>
          <button 
            onClick={handleEditToggle} 
            disabled={loading} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${isEditing ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (isEditing ? <Save size={16} /> : <Edit2 size={16} />)} 
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>

      {/* --- Legend --- */}
      <div className="flex gap-6 px-4 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-layout-dark overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-cyan-500"></span> Orig. Start (OS)</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-green-500"></span> Rev. Start (S)</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-red-500"></span> Orig. End (E)</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Rev. End (R)</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-12 h-3 rounded bg-blue-100 border border-blue-200 text-[9px] flex items-center justify-center text-blue-600 font-bold">W1: 15</span> Plan</div>
      </div>

      {/* --- Matrix --- */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto relative custom-scrollbar">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/50 dark:bg-layout-dark/50 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}

        <table className="border-collapse w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 z-40 sticky top-0">
            <tr>
              <th className="sticky left-0 z-50 bg-gray-50 dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 p-3 text-left min-w-[280px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</span></th>
              {daysInMonth.map((day) => {
                 const dayNum = getDate(day);
                 const isEvenWeek = (dayNum > 7 && dayNum <= 14) || (dayNum > 21 && dayNum <= 28);
                 const headerBg = isEvenWeek ? "bg-gray-100/50 dark:bg-gray-700/30" : "";
                 return (
                  <th key={day.toString()} className={`border-b border-r border-gray-200 dark:border-gray-700 min-w-[60px] p-2 text-center ${headerBg}`}>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase text-gray-400 font-medium">{format(day, "EEE")}</span>
                      <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? "text-blue-600 bg-blue-50 rounded-full w-6 h-6 flex items-center justify-center" : "text-gray-700 dark:text-gray-300"}`}>{format(day, "d")}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item, index) => {
              const currentRevisedStart = getRevisedStartDate(item);
              const currentRevisedEnd = getRevisedEndDate(item);
              const constantOriginalStart = item.original_start_date;
              const constantOriginalEnd = item.original_end_date;

              return (
                <tr key={item.wbs_id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="sticky left-0 z-30 bg-white dark:bg-layout-dark group-hover:bg-gray-50 dark:group-hover:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-top">
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate max-w-[280px]" title={item.description}>{index+1}. {item.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">{item.wbs_id}</span>
                        <span className="text-[10px] text-gray-500">Qty: {item.quantity} {item.unit} dt: {item.revised_duration} = {(item.quantity / item.revised_duration).toFixed(4)}</span>
                      </div>
                    </div>
                  </td>

                  {daysInMonth.map((day) => {
                    // FORCE UTC MIDNIGHT KEY GENERATION
                    const dayStr = normalizeToUTC(day.toISOString()); 
                    const dayParsed = parseISO(dayStr);
                    const normDay = startOfDay(dayParsed);

                    // --- PARSING WITH NULL SAFETY ---
                    const parsedRevStart = currentRevisedStart ? parseISO(currentRevisedStart) : null;
                    const parsedRevEnd = currentRevisedEnd ? parseISO(currentRevisedEnd) : null;
                    const parsedOrigStart = constantOriginalStart ? parseISO(constantOriginalStart) : null;
                    const parsedOrigEnd = constantOriginalEnd ? parseISO(constantOriginalEnd) : null;

                    const normRevStart = parsedRevStart ? startOfDay(parsedRevStart) : null;
                    const normRevEnd = parsedRevEnd ? startOfDay(parsedRevEnd) : null;

                    // 1. Range Check (only if dates exist)
                    const isActiveRange = (normRevStart && normRevEnd) 
                        ? isWithinInterval(normDay, { start: normRevStart, end: normRevEnd }) 
                        : false;
                    
                    // 2. Marker Checks
                    const isRevStart = parsedRevStart ? isSameDay(parsedRevStart, dayParsed) : false;
                    const isOrigStart = parsedOrigStart ? isSameDay(parsedOrigStart, dayParsed) : false;
                    const isOrigEnd = parsedOrigEnd ? isSameDay(parsedOrigEnd, dayParsed) : false;
                    const isRevEnd = parsedRevEnd ? isSameDay(parsedRevEnd, dayParsed) : false;
                    
                    const isCombinedEnd = isOrigEnd && isRevEnd;
                    const isCombinedStart = isOrigStart && isRevStart;

                    // 3. Weekly Badge
                    const weeklyPlanData = (currentRevisedStart && currentRevisedEnd)
                        ? getWeeklyPlanForLabel(item, dayParsed, currentRevisedStart, currentRevisedEnd, currentDate)
                        : null;

                    // Styling
                    const dayNum = getDate(day);
                    const isEvenWeek = (dayNum > 7 && dayNum <= 14) || (dayNum > 21 && dayNum <= 28);
                    const bgClass = isEvenWeek ? "bg-gray-50/30 dark:bg-gray-800/20" : "bg-white dark:bg-layout-dark";

                    let cellClasses = `border-r border-gray-100 dark:border-gray-800 p-1 relative min-h-[50px] align-middle cursor-pointer ${bgClass}`;
                    let inputClasses = `w-full h-8 text-center text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mt-4 ${!isEditing || !isActiveRange ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white text-gray-800"}`;

                    if (isRevStart) inputClasses += " border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 ";
                    else if (isCombinedEnd) inputClasses += " border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 ";
                    else if (isRevEnd) inputClasses += " border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 ";
                    else if (isOrigEnd) inputClasses += " border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 ";
                    else if (isOrigStart) inputClasses += " border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 "; 
                    
                    else if (isActiveRange) inputClasses += " border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white ";
                    else inputClasses += " bg-transparent border-none text-transparent pointer-events-none";

                    return (
                      <td key={dayStr} className={cellClasses} onDoubleClick={() => handleCellDoubleClick(item, dayStr)}>
                         {weeklyPlanData && (
                            <div className="absolute top-0 left-0 right-0 z-20 flex justify-center mt-1 pointer-events-none">
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                {weeklyPlanData.label}
                              </span>
                            </div>
                         )}

                        <div className="absolute bottom-1 right-1 pointer-events-none z-20 flex gap-0.5">
                             {isOrigStart && !isCombinedStart && <span className="text-[7px] w-4 h-3 flex items-center justify-center rounded-full font-bold text-white bg-cyan-500 shadow-sm" title="Original Start">OS</span>}
                             
                             {isRevStart && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-green-500 shadow-sm" title="Revised Start">S</span>}
                             
                             {isCombinedEnd ? (
                                <span className="text-[7px] w-auto px-1 h-3 flex items-center justify-center rounded-full font-bold text-white bg-purple-500 shadow-sm" title="Original & Revised End">End</span>
                             ) : (
                                <>
                                  {isOrigEnd && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-red-500 shadow-sm" title="Original End Date">E</span>}
                                  {isRevEnd && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-purple-500 shadow-sm" title="Revised End Date">R</span>}
                                </>
                             )}
                        </div>

                        <input
                          type="number"
                          step="0.01"
                          disabled={!isEditing || !isActiveRange}
                          placeholder={isActiveRange ? "-" : ""}
                          className={inputClasses}
                          value={getInputValue(item, dayStr)}
                          onChange={(e) => handleInputChange(item.wbs_id, dayStr, e.target.value)}
                          onDoubleClick={(e) => e.stopPropagation()} 
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyProjects;
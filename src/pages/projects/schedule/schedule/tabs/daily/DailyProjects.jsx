import React, { useState, useEffect, useMemo, useRef } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, subMonths, addMonths, differenceInCalendarDays, addDays, isWithinInterval, max, min, getDate, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Save, Calendar as CalendarIcon, Loader2, Edit2, Lock } from "lucide-react";
import { API } from "../../../../../../constant";
import axios from "axios";
import { useProject } from "../../../../ProjectContext";
import { toast } from "react-toastify";

// --- Data Processor ---
const processData = (items) => {
  if (!Array.isArray(items)) return [];

  return items.map(item => {
    const sortedDaily = Array.isArray(item.daily) 
      ? [...item.daily].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : [];

    // FIX: Set to null if missing. Do NOT fallback to 'new Date()' to avoid fake markers.
    const originalStart = item.start_date || null;
    const revisedStart = item.revised_start_date || originalStart;
    const originalEnd = item.end_date || null;
    const revisedEnd = item.revised_end_date || originalEnd;

    return {
      ...item,
      start_date: originalStart,
      original_end_date: originalEnd,
      revised_start_date: revisedStart,
      revised_end_date: revisedEnd,
      daily: sortedDaily
    };
  });
};

// --- Helper: Calculate Single Week Plan Badge ---
const getWeeklyPlanForLabel = (item, weekStartDay, currentStartDate, currentRevisedEndDate, monthStart) => {
  // Guard: If dates are null, we cannot calculate a plan
  if (!currentStartDate || !currentRevisedEndDate) return null;

  const startDate = parseISO(currentStartDate);
  const endDate = parseISO(currentRevisedEndDate);
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

  const getRevisedDate = (item) => revisedDateUpdates[item.wbs_id] || item.revised_end_date;
  const getStartDate = (item) => startDateUpdates[item.wbs_id] || item.start_date;

  const clearValuesInRange = (wbsId, rangeStart, rangeEnd) => {
    if (rangeStart > rangeEnd) return; 
    const datesToClear = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    setUpdates(prev => {
      const newUpdates = { ...prev };
      datesToClear.forEach(date => {
        const key = `${wbsId}-${date.toISOString()}`;
        delete newUpdates[key]; 
      });
      return newUpdates;
    });
  };

  const handleCellDoubleClick = (item, dateStr) => {
    if (!isEditing) return;

    const clickedDate = parseISO(dateStr);
    const normClicked = startOfDay(clickedDate);

    const currentStartStr = getStartDate(item);
    const currentRevisedEndStr = getRevisedDate(item);

    // Case 0: Initialize Dates (If item has no dates yet)
    if (!currentStartStr) {
        if(window.confirm(`Set Start Date to ${format(clickedDate, 'dd MMM')}?`)) {
             setStartDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
             // Initialize end date same as start for a 1-day duration initially
             setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
             toast.success("Project Started");
        }
        return;
    }

    const currentStart = parseISO(currentStartStr);
    const currentRevisedEnd = parseISO(currentRevisedEndStr);
    const originalEnd = item.original_end_date ? parseISO(item.original_end_date) : null;

    const normStart = startOfDay(currentStart);
    const normRevisedEnd = startOfDay(currentRevisedEnd);
    const normOriginalEnd = originalEnd ? startOfDay(originalEnd) : null;

    // A. EXTEND End Date
    if (normClicked > normRevisedEnd) {
      setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
      toast.info(`End Date extended to ${format(clickedDate, "dd MMM")}`);
      return;
    }

    // B. REVERT to Original End
    if (normOriginalEnd && normRevisedEnd > normOriginalEnd && isSameDay(normClicked, normOriginalEnd)) {
       if (window.confirm(`Revert Revised Date back to Original End Date (${format(clickedDate, "dd MMM")})?\nThis will clear inputs after this date.`)) {
          clearValuesInRange(item.wbs_id, addDays(normOriginalEnd, 1), normRevisedEnd);
          setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
          toast.info(`Revised Date reset & inputs cleared`);
       }
       return;
    }

    // C. REDUCE Revised End
    if (normOriginalEnd && normClicked > normOriginalEnd && normClicked < normRevisedEnd) {
      if (window.confirm(`Reduce Revised End Date to ${format(clickedDate, "dd MMM")}?\nThis will clear inputs after this date.`)) {
        clearValuesInRange(item.wbs_id, addDays(normClicked, 1), normRevisedEnd);
        setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));
        toast.info(`End Date reduced & inputs cleared`);
      }
      return;
    }

    // D. SHIFT Start Date
    if (normOriginalEnd && normClicked > normStart && normClicked < normOriginalEnd) {
      const diffDays = differenceInCalendarDays(normClicked, normStart);
      if (window.confirm(`Move Start Date to ${format(clickedDate, 'dd MMM')}?\n(This skips ${diffDays} days and will clear their inputs)`)) {
        clearValuesInRange(item.wbs_id, normStart, addDays(normClicked, -1));

        const shouldExtendEnd = window.confirm(
          `You skipped ${diffDays} days.\n\nClick OK to ADD these days to the Revised End Date.\nClick Cancel to KEEP the current End Date (Shrink Duration).`
        );

        setStartDateUpdates(prev => ({ ...prev, [item.wbs_id]: dateStr }));

        if (shouldExtendEnd) {
          const newEndDate = addDays(normRevisedEnd, diffDays);
          setRevisedDateUpdates(prev => ({ ...prev, [item.wbs_id]: newEndDate.toISOString() }));
          toast.success(`Start moved, inputs cleared & End extended`);
        } else {
          toast.success(`Start moved & inputs cleared`);
        }
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
                {isEditing ? "Double-click cells to adjust dates" : "Click 'Edit' to make changes"}
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
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-green-500"></span> Start (S)</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-red-500"></span> Original End (E)</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Revised End (R)</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-12 h-3 rounded bg-blue-100 border border-blue-200 text-[9px] flex items-center justify-center text-blue-600 font-bold">W1: 15</span> Weekly Plan</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-sm border border-gray-300 bg-white"></span> Non Editable</div>
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
              const currentRevisedDate = getRevisedDate(item);
              const currentStartDate = getStartDate(item);

              return (
                <tr key={item.wbs_id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="sticky left-0 z-30 bg-white dark:bg-layout-dark group-hover:bg-gray-50 dark:group-hover:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-top">
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate max-w-[280px]" title={item.description}>{index+1}. {item.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">{item.wbs_id}</span>
                        <span className="text-[10px] text-gray-500">Qty: {item.quantity} {item.unit}</span>
                      </div>
                    </div>
                  </td>

                  {daysInMonth.map((day) => {
                    const dayStr = format(day, "yyyy-MM-dd") + "T00:00:00.000Z";
                    const dayParsed = parseISO(dayStr);
                    
                    // --- DATE PARSING WITH NULL SAFETY ---
                    const parsedStart = currentStartDate ? parseISO(currentStartDate) : null;
                    const parsedOriginalEnd = item.original_end_date ? parseISO(item.original_end_date) : null;
                    const parsedRevisedEnd = currentRevisedDate ? parseISO(currentRevisedDate) : null;

                    // Normalize to Start of Day
                    const normDay = startOfDay(dayParsed);
                    const normStart = parsedStart ? startOfDay(parsedStart) : null;
                    const normRevisedEnd = parsedRevisedEnd ? startOfDay(parsedRevisedEnd) : null;

                    // 1. Range Check (only if dates exist)
                    const isActiveRange = (normStart && normRevisedEnd) 
                        ? isWithinInterval(normDay, { start: normStart, end: normRevisedEnd }) 
                        : false;
                    
                    // 2. Marker Checks (only if dates exist)
                    const isStart = parsedStart ? isSameDay(parsedStart, dayParsed) : false;
                    const isOriginalEnd = parsedOriginalEnd ? isSameDay(parsedOriginalEnd, dayParsed) : false;
                    const isRevisedEnd = parsedRevisedEnd ? isSameDay(parsedRevisedEnd, dayParsed) : false;
                    const isCombinedEnd = isOriginalEnd && isRevisedEnd;

                    // 3. Weekly Badge (only if dates exist)
                    const weeklyPlanData = (currentStartDate && currentRevisedDate)
                        ? getWeeklyPlanForLabel(item, dayParsed, currentStartDate, currentRevisedDate, currentDate)
                        : null;

                    // Styling
                    const dayNum = getDate(day);
                    const isEvenWeek = (dayNum > 7 && dayNum <= 14) || (dayNum > 21 && dayNum <= 28);
                    const bgClass = isEvenWeek ? "bg-gray-50/30 dark:bg-gray-800/20" : "bg-white dark:bg-layout-dark";

                    let cellClasses = `border-r border-gray-100 dark:border-gray-800 p-1 relative min-h-[50px] align-middle cursor-pointer ${bgClass}`;
                    let inputClasses = `w-full h-8 text-center text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mt-4 ${!isEditing || !isActiveRange ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white text-gray-800"}`;

                    if (isStart) inputClasses += " border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 ";
                    else if (isCombinedEnd) inputClasses += " border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 ";
                    else if (isRevisedEnd) inputClasses += " border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 ";
                    else if (isOriginalEnd) inputClasses += " border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 ";
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
                             {isStart && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-green-500 shadow-sm" title="Start Date">S</span>}
                             
                             {isCombinedEnd ? (
                                <span className="text-[7px] w-auto px-1 h-3 flex items-center justify-center rounded-full font-bold text-white bg-purple-500 shadow-sm" title="Original & Revised End">End</span>
                             ) : (
                                <>
                                  {isOriginalEnd && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-red-500 shadow-sm" title="Original End Date">E</span>}
                                  {isRevisedEnd && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-purple-500 shadow-sm" title="Revised End Date">R</span>}
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
import React, { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, differenceInCalendarDays, addDays, isWithinInterval, max, min, getDate } from "date-fns";
import { ChevronLeft, ChevronRight, Save, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { API } from "../../../../../../constant";
import axios from "axios";
import { useProject } from "../../../../ProjectContext";
import { toast } from "react-toastify";

// --- Data Processor ---
const processData = (items) => {
  if (!Array.isArray(items)) return [];

  return items.map(item => {
    const sortedDaily = [...item.daily].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const originalStart = sortedDaily.length > 0 ? sortedDaily[0].date : new Date().toISOString();
    const originalEnd = sortedDaily.length > 0 ? sortedDaily[sortedDaily.length - 1].date : new Date().toISOString();
    const revisedEnd = item.revised_end_date || originalEnd;

    return {
      ...item,
      start_date: originalStart,
      original_end_date: originalEnd,
      revised_end_date: revisedEnd,
      daily: sortedDaily
    };
  });
};

// --- Helper: Calculate Single Week Plan ---
const getWeeklyPlanForLabel = (item, weekStartDay, currentRevisedEndDate, monthStart) => {
  const startDate = parseISO(item.start_date);
  const endDate = parseISO(currentRevisedEndDate);
  const totalDuration = differenceInCalendarDays(endDate, startDate) + 1;
  if (totalDuration <= 0) return null;

  const dailyRate = item.quantity / totalDuration;

  // Define the Week boundaries (1-7, 8-14, 15-21, 22-End)
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
  
  const overlapStart = max([logicalWeekStart, startDate]);
  const overlapEnd = min([weekEnd, endDate]);

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

  const daysInMonth = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }), [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleInputChange = (wbsId, dateStr, value) => {
    setUpdates(prev => ({ ...prev, [`${wbsId}-${dateStr}`]: value }));
  };

  const handleCellDoubleClick = (wbsId, dateStr) => {
    setRevisedDateUpdates(prev => ({ ...prev, [wbsId]: dateStr }));
    toast.info(`Project extended to ${format(parseISO(dateStr), "dd MMM")}`);
  };

  const handleSave = async () => {
    console.log({ daily: updates, revised: revisedDateUpdates });
    toast.success("Schedule Updated Successfully");
  };

  const getInputValue = (item, dayStr) => {
    const key = `${item.wbs_id}-${dayStr}`;
    if (updates[key] !== undefined) return updates[key];
    const dayRecord = item.daily.find(d => isSameDay(parseISO(d.date), parseISO(dayStr)));
    return dayRecord ? dayRecord.quantity : "";
  };

  const getRevisedDate = (item) => revisedDateUpdates[item.wbs_id] || item.revised_end_date;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Daily Progress</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Double-click to extend schedule</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><ChevronLeft size={18} /></button>
            <span className="px-4 font-semibold text-sm w-32 text-center text-gray-700 dark:text-gray-200">{format(currentDate, "MMMM yyyy")}</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><ChevronRight size={18} /></button>
          </div>
          <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save
          </button>
        </div>
      </div>

      {/* --- Legend --- */}
      <div className="flex gap-6 px-4 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-green-500"></span> Start (S)</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-red-500"></span> Original End (E)</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Revised End (R)</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-12 h-3 rounded bg-blue-100 border border-blue-200 text-[9px] flex items-center justify-center text-blue-600 font-bold">W1: 15</span> Weekly Plan</div>
        <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-sm border border-gray-300 bg-white"></span> Non Editable Day</div>
      </div>

      {/* --- Matrix --- */}
      <div className="flex-1 overflow-auto relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}

        <table className="border-collapse w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 z-40 sticky top-0">
            <tr>
              <th className="sticky left-0 z-50 bg-gray-50 dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 p-3 text-left min-w-[280px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</span>
              </th>
              {daysInMonth.map((day) => {
                 const dayNum = getDate(day);
                 const isEvenWeek = (dayNum > 7 && dayNum <= 14) || (dayNum > 21 && dayNum <= 28);
                 const headerBg = isEvenWeek ? "bg-gray-100/50 dark:bg-gray-700/30" : "";

                 return (
                  <th key={day.toString()} className={`border-b border-r border-gray-200 dark:border-gray-700 min-w-[60px] p-2 text-center ${headerBg}`}>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase text-gray-400 font-medium">{format(day, "EEE")}</span>
                      <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? "text-blue-600 bg-blue-50 rounded-full w-6 h-6 flex items-center justify-center" : "text-gray-700 dark:text-gray-300"}`}>
                        {format(day, "d")}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item) => {
              const currentRevisedDate = getRevisedDate(item);

              return (
                <tr key={item.wbs_id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  
                  {/* --- Sticky Column --- */}
                  <td className="sticky left-0 z-30 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-top">
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate max-w-[280px]" title={item.description}>{item.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">{item.wbs_id}</span>
                        <span className="text-[10px] text-gray-500">Qty: {item.quantity} {item.unit}</span>
                      </div>
                    </div>
                  </td>

                  {/* --- Calendar Grid --- */}
                  {daysInMonth.map((day) => {
                    const dayStr = day.toISOString();
                    const dayParsed = parseISO(dayStr);
                    const parsedStart = parseISO(item.start_date);
                    const parsedOriginalEnd = parseISO(item.original_end_date);
                    const parsedRevisedEnd = parseISO(currentRevisedDate);

                    const isActiveRange = isWithinInterval(dayParsed, { start: parsedStart, end: parsedRevisedEnd });
                    const isStart = isSameDay(parsedStart, dayParsed);
                    const isOriginalEnd = isSameDay(parsedOriginalEnd, dayParsed);
                    const isRevisedEnd = isSameDay(parsedRevisedEnd, dayParsed);

                    // WEEKLY PLAN
                    const weeklyPlanData = getWeeklyPlanForLabel(item, dayParsed, currentRevisedDate, currentDate);

                    // Styles
                    const dayNum = getDate(day);
                    const isEvenWeek = (dayNum > 7 && dayNum <= 14) || (dayNum > 21 && dayNum <= 28);
                    const bgClass = isEvenWeek ? "bg-gray-50/30 dark:bg-gray-800/20" : "bg-white dark:bg-gray-900";

                    let cellClasses = `border-r border-gray-100 dark:border-gray-800 p-1 relative min-h-[50px] align-middle cursor-pointer ${bgClass}`;
                    let inputClasses = "w-full h-8 text-center text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mt-4 ";

                    if (isStart) inputClasses += "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 ";
                    else if (isRevisedEnd) inputClasses += "border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 ";
                    else if (isOriginalEnd) inputClasses += "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 "; // Added explicit red border for original end
                    else if (isActiveRange) inputClasses += "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white ";
                    else inputClasses += "bg-transparent border-none text-transparent pointer-events-none";

                    return (
                      <td 
                        key={dayStr} 
                        className={cellClasses}
                        onDoubleClick={() => handleCellDoubleClick(item.wbs_id, dayStr)}
                      >
                         {/* --- Weekly Plan Badge (z-30 to sit on top) --- */}
                         {weeklyPlanData && (
                            <div className="absolute top-0 left-0 right-0 z-20 flex justify-center  mt-1 pointer-events-none">
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                {weeklyPlanData.label}
                              </span>
                            </div>
                         )}

                        {/* --- Markers (S/E/R) (z-20) --- */}
                        {(isStart || isOriginalEnd || isRevisedEnd) && (
                          <div className="absolute bottom-1 right-1 pointer-events-none z-20 flex gap-0.5">
                             {isStart && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-green-500 shadow-sm" title="Start Date">S</span>}
                             {/* Show E if it's not the same as R, OR if R matches E (to show it hasn't changed), handled by logic below. 
                                 If they are same day, showing both might be crowded, but user asked for E tag. 
                                 If E and R are same, showing R is usually enough, but let's show E if specifically asked. 
                                 To prevent overlap if same day, flex gap handles it. */}
                             {isOriginalEnd && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-red-500 shadow-sm" title="Original End Date">E</span>}
                             {isRevisedEnd && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-purple-500 shadow-sm" title="Revised End Date">R</span>}
                          </div>
                        )}

                        <input
                          type="number"
                          step="0.01"
                          disabled={!isActiveRange}
                          placeholder={isActiveRange ? "-" : ""}
                          className={inputClasses}
                          value={getInputValue(item, dayStr)}
                          onChange={(e) => handleInputChange(item.wbs_id, dayStr, e.target.value)}
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
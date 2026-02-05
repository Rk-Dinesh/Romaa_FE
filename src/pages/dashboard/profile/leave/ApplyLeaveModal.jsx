import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../../../constant";
import { toast } from "react-toastify";
import { FiX, FiCalendar, FiAlertTriangle } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Or use react-icons

const ApplyLeaveModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [holidays, setHolidays] = useState(new Set()); // Store dates as a Set for O(1) lookup
  const [holidayList, setHolidayList] = useState([]); // Store full objects for tooltips
  
  // Calendar View State
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const [formData, setFormData] = useState({
    leaveType: "CL",
    requestType: "Full Day",
    fromDate: "",
    toDate: "",
    reason: "",
    totalDays: 0
  });

  const [dateError, setDateError] = useState("");

  // --- 1. Fetch Holidays on Mount ---
  useEffect(() => {
    if (isOpen) {
      const fetchHolidays = async () => {
        try {
          // Dynamic Year based on current view or selection could be better, 
          // but fetching 2026 as per your request
          const res = await axios.get(`${API}/calendar/listall?year=${viewYear}`, { withCredentials: true });
          
          if (res.data.success) {
            const holidaySet = new Set();
            res.data.data.forEach(h => {
               // Normalize to YYYY-MM-DD
               const d = new Date(h.date).toISOString().split('T')[0];
               holidaySet.add(d);
            });
            setHolidays(holidaySet);
            setHolidayList(res.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch holidays", error);
        }
      };
      fetchHolidays();
    }
  }, [isOpen, viewYear]);

  // --- 2. Calculation & Validation ---
  const calculateDays = (start, end, type) => {
    if(!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    
    // Validate Range
    if (s > e) {
        setDateError("To Date cannot be before From Date");
        return 0;
    }
    
    // Check for Holidays in Range
    let loop = new Date(s);
    let holidayHit = false;
    while(loop <= e) {
        const dateStr = loop.toISOString().split('T')[0];
        if (holidays.has(dateStr)) {
            holidayHit = true;
            break;
        }
        loop.setDate(loop.getDate() + 1);
    }

    if (holidayHit) {
        setDateError("Selection includes a Holiday! Please check the calendar.");
        return 0;
    } 

    setDateError("");
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return type !== "Full Day" ? 0.5 : diffDays;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    
    // Sync Calendar View if date changes
    if (name === "fromDate" && value) {
        const d = new Date(value);
        setViewMonth(d.getMonth());
        setViewYear(d.getFullYear());
    }

    if(name === "fromDate" || name === "toDate" || name === "requestType") {
       newData.totalDays = calculateDays(
           newData.fromDate || formData.fromDate, 
           newData.toDate || formData.toDate, 
           newData.requestType || formData.requestType
       );
    }
    
    setFormData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateError) {
        toast.error(dateError);
        return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/leave/apply`, {
        employeeId: user._id,
        ...formData
      }, { withCredentials: true });
      
      toast.success("Leave Request Submitted!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in-up flex flex-col md:flex-row">
        
        {/* --- LEFT: Form Section --- */}
        <div className="w-full md:w-1/2 p-6 border-r border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-lg">Apply for Leave</h3>
                <button onClick={onClose} className="md:hidden"><FiX className="text-gray-500" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Leave Type</label>
                        <select name="leaveType" value={formData.leaveType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="CL">Casual Leave (CL)</option>
                            <option value="SL">Sick Leave (SL)</option>
                            <option value="PL">Privilege Leave (PL)</option>
                            <option value="LWP">Loss of Pay (LWP)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Request Duration</label>
                        <select name="requestType" value={formData.requestType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="Full Day">Full Day</option>
                            <option value="First Half">First Half</option>
                            <option value="Second Half">Second Half</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">From Date</label>
                        <input type="date" name="fromDate" value={formData.fromDate} onChange={handleChange} required className={`w-full border rounded-lg p-2 text-sm ${dateError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">To Date</label>
                        <input type="date" name="toDate" value={formData.toDate} onChange={handleChange} required className={`w-full border rounded-lg p-2 text-sm ${dateError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                    </div>
                </div>

                {/* Error Message Area */}
                {dateError && (
                    <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs flex items-center gap-2">
                        <FiAlertTriangle /> {dateError}
                    </div>
                )}

                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex justify-between items-center">
                    <span>Total Days Calculated:</span>
                    <span className="font-bold text-sm">{formData.totalDays} Days</span>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Reason for Leave</label>
                    <textarea name="reason" value={formData.reason} onChange={handleChange} required rows="3" className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none" placeholder="Enter detailed reason..."></textarea>
                </div>

                <div className="pt-2 flex gap-3 justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" disabled={loading || !!dateError} className="px-6 py-2 text-sm bg-darkest-blue text-white rounded-lg hover:bg-blue-900 disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </form>
        </div>

        {/* --- RIGHT: Mini Calendar Preview --- */}
        <div className="w-full md:w-1/2 bg-gray-50/50 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-700">Calendar Preview</h4>
                <div className="flex gap-2">
                   <button onClick={() => {
                       if(viewMonth===0){ setViewMonth(11); setViewYear(y=>y-1)} else { setViewMonth(m=>m-1)}
                   }} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft size={18}/></button>
                   <span className="text-sm font-medium w-24 text-center">
                       {new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                   </span>
                   <button onClick={() => {
                       if(viewMonth===11){ setViewMonth(0); setViewYear(y=>y+1)} else { setViewMonth(m=>m+1)}
                   }} className="p-1 hover:bg-gray-200 rounded"><ChevronRight size={18}/></button>
                </div>
            </div>
            
            {/* The Custom Calendar Grid */}
            <MiniCalendar 
                month={viewMonth} 
                year={viewYear} 
                holidays={holidays}
                fromDate={formData.fromDate}
                toDate={formData.toDate}
            />

            {/* Legend */}
            <div className="mt-4 flex gap-4 text-xs justify-center">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div> Holiday</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div> Selected</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> Conflict</div>
            </div>
        </div>

      </div>
    </div>
  );
};

// --- Helper Component: Mini Calendar Grid ---
const MiniCalendar = ({ month, year, holidays, fromDate, toDate }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    
    const days = [];
    // Empty slots for start of month
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Days
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const isDateSelected = (day) => {
        if (!fromDate || !day) return false;
        const current = new Date(year, month, day);
        const start = new Date(fromDate);
        const end = toDate ? new Date(toDate) : start;
        
        // Normalize time
        current.setHours(0,0,0,0); start.setHours(0,0,0,0); end.setHours(0,0,0,0);
        
        return current >= start && current <= end;
    };

    const isHoliday = (day) => {
        if (!day) return false;
        // Construct YYYY-MM-DD manually to match API format
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateStr = `${year}-${mm}-${dd}`;
        return holidays.has(dateStr);
    };

    return (
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="font-bold text-gray-400 py-1">{d}</div>
            ))}
            
            {days.map((day, idx) => {
                if (!day) return <div key={idx}></div>;
                
                const holiday = isHoliday(day);
                const selected = isDateSelected(day);
                
                let bgClass = "bg-white text-gray-700 hover:bg-gray-100";
                
                if (holiday && selected) {
                    bgClass = "bg-red-500 text-white font-bold"; // Conflict!
                } else if (holiday) {
                    bgClass = "bg-red-100 text-red-600 font-medium border border-red-200";
                } else if (selected) {
                    bgClass = "bg-blue-100 text-blue-600 border border-blue-200";
                }

                return (
                    <div 
                        key={idx} 
                        className={`rounded py-2 transition-colors cursor-default ${bgClass}`}
                    >
                        {day}
                    </div>
                );
            })}
        </div>
    );
};

export default ApplyLeaveModal;
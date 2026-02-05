import React, { useState, useEffect, useCallback } from "react";
import { FiCalendar, FiUpload, FiSearch, FiRefreshCw } from "react-icons/fi";
import axios from "axios";
import { API } from "../../../constant";
import UploadCalendar from "./UploadCalendar";
import { toast } from "react-toastify";

const Calendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Fetch Data ---
  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/calendar/list`, { withCredentials: true });
      if (res.data && res.data.data) {
        setHolidays(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // --- Filter Logic ---
const filteredData = holidays.filter((item) => {
    const lowerSearch = searchTerm.toLowerCase();
    
    // 1. Convert Date to readable string (e.g., "26 Jan 2026")
    // This allows users to search by "Jan", "2026", or "26"
    const readableDate = new Date(item.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).toLowerCase();

    // 2. Safely handle null/undefined descriptions
    const description = item.description ? item.description.toLowerCase() : "";

    return (
      item.name.toLowerCase().includes(lowerSearch) ||
      item.type.toLowerCase().includes(lowerSearch) ||
      description.includes(lowerSearch) ||
      readableDate.includes(lowerSearch) // Check against readable date
    );
  });

  return (
    <div className=" h-full flex flex-col overflow-hidden animate-fade-in-up">
      
      {/* --- Toolbar --- */}
      <div className=" pb-3 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Title & Search */}
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><FiCalendar /></span>
              Holiday Calendar
            </h2>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchHolidays}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`text-lg ${loading ? "animate-spin" : ""}`} />
          </button>
          
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <FiUpload className="text-base" />
            <span>Bulk Upload</span>
          </button>
            <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-5 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search holidays..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Holiday Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              // Skeleton Loader
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div></td>
                </tr>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-200 font-medium">
                    {new Date(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <span className="block text-xs text-gray-400 font-normal mt-0.5">
                      {new Date(row.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-800 dark:text-white font-medium">
                    {row.name}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${row.type === 'Weekend' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : ''}
                      ${row.type === 'National' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
                      ${row.type === 'Regional' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                      ${!['Weekend', 'National', 'Regional'].includes(row.type) ? 'bg-gray-100 text-gray-600' : ''}
                    `}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {row.description || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <FiCalendar className="text-4xl text-gray-300 mb-2" />
                    <p>No holidays found matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Footer Status --- */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 flex justify-between">
        <span>Showing {filteredData.length} records</span>
        {/* Pagination could go here */}
      </div>

      {/* --- Upload Modal --- */}
      {isUploadModalOpen && (
        <UploadCalendar 
          onclose={() => setUploadModalOpen(false)} 
          onSuccess={() => {
            fetchHolidays(); // Refresh data after upload
            setUploadModalOpen(false);
          }} 
        />
      )}

    </div>
  );
};

export default Calendar;
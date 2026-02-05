import React, { useState } from "react";
import { FiCalendar, FiList, FiClock } from "react-icons/fi";
import Leave from "./Leave";
import Calendar from "./Calendar";

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("leave");

  return (
    <div className="w-full h-full flex flex-col font-layout-font">
      
      {/* --- Page Header Area (Optional, for context) --- */}
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Leave Management
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage employee leave requests and holiday schedules.
        </p>
      </div>

      {/* --- Tab Navigation Bar --- */}
      <div className="px-6 mt-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          
          {/* Tab 1: Leave Requests */}
          <TabButton 
            isActive={activeTab === "leave"} 
            onClick={() => setActiveTab("leave")}
            icon={<FiList />}
            label="Leave Requests"
          />

          {/* Tab 2: Holiday Calendar */}
          <TabButton 
            isActive={activeTab === "calendar"} 
            onClick={() => setActiveTab("calendar")}
            icon={<FiCalendar />}
            label="Holiday Calendar"
          />

          {/* Tab 3: Future Expansion (e.g., Leave Policy) */}
          <TabButton 
            isActive={activeTab === "policy"} 
            onClick={() => setActiveTab("policy")}
            icon={<FiClock />}
            label="Leave Policy"
            disabled={true} // Example of a disabled tab
          />

        </div>
      </div>

      {/* --- Tab Content Area --- */}
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        
        {/* We perform a conditional render based on state */}
        <div className="h-full animate-fade-in-up">
          {activeTab === "leave" && <Leave />}
          
          {activeTab === "calendar" && <Calendar />}

          {activeTab === "policy" && (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Leave Policy Configuration (Coming Soon)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Reusable Tab Button Component ---
const TabButton = ({ isActive, onClick, icon, label, disabled = false }) => {
  return (
    <button
      onClick={disabled ? null : onClick}
      disabled={disabled}
      className={`
        group flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-all duration-200 ease-in-out
        ${disabled ? "opacity-50 cursor-not-allowed text-gray-400 border-transparent" : "cursor-pointer"}
        ${isActive 
          ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" 
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300"
        }
      `}
    >
      <span className={`text-lg ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600"}`}>
        {icon}
      </span>
      {label}
    </button>
  );
};

export default LeaveManagement;
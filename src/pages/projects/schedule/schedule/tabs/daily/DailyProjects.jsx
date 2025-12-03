import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { API } from "../../../../../../constant";
import { useProject } from "../../../../ProjectContext";
import ScheduleTable from "../ScheduleTable";

const DailyProjects = () => {
  const { tenderId } = useProject();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState([]);

  const fetchData = async (date) => {
    if (!tenderId) return;
    const formattedDate = format(date, "yyyy-MM-dd");
    try {
      const res = await axios.get(`${API}/schedule/getschedule`, {
        params: { tenderId, particularDate: formattedDate },
      });
      // Ensure res.data.data is always an array
      setScheduleData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setScheduleData([]);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, tenderId]);

  // Generate dates for the selected month
  const monthDates = Array.from(
    {
      length: new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0
      ).getDate(),
    },
    (_, i) => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1)
  );

  return (
    <div>
      {/* Month Dropdown & Date Strip */}
      <div className="w-full bg-white dark:bg-layout-dark border-b-2 dark:border-border-dark-grey border-gray-100 rounded-t-lg px-4 py-3 flex items-center gap-4">
        {/* Month Dropdown */}
        <select
          value={selectedDate.getMonth()}
          onChange={(e) => {
            const newMonth = parseInt(e.target.value, 10);
            setSelectedDate(new Date(selectedDate.getFullYear(), newMonth, 1));
          }}
          className="bg-layout-dark rounded px-2 py-1 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {format(new Date(2000, i, 1), "MMMM")}
            </option>
          ))}
        </select>

        {/* Horizontal scrollable day strip */}
        <div className="flex overflow-x-auto no-scrollbar gap-3">
          {monthDates.map((date, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center justify-center w-10 h-8 py-6 rounded-lg cursor-pointer transition-all duration-200 ${
                format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                  ? "bg-darkest-blue text-white font-medium text-sm px-2"
                  : "hover:bg-gray-100 text-darkest-blue text-xs"
              }`}
            >
              <span>{format(date, "dd")}</span>
              <span>{format(date, "EEE")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Table: pass full array */}
      <ScheduleTable scheduleData={scheduleData} />
    </div>
  );
};

export default DailyProjects;

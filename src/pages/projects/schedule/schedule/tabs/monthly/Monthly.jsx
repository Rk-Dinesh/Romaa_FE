import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { API } from "../../../../../../constant";
import { useProject } from "../../../../ProjectContext";
import ScheduleTable from "../ScheduleTable";

const MonthlyProjects = () => {
  const { tenderId } = useProject();
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [scheduleData, setScheduleData] = useState([]);

  const fetchData = async (year, month) => {
    if (!tenderId) return;

    try {
      const monthName = format(new Date(year, month, 1), "MMM"); // e.g., Jan, Feb
      const res = await axios.get(`${API}/schedule/getschedule`, {
        params: {
          tenderId,
          month: monthName,
          year,
        },
      });
      setScheduleData(res.data.data || []);
    } catch (err) {
      console.error(err);
      setScheduleData([]);
    }
  };

  useEffect(() => {
    fetchData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, tenderId]);

  const years = Array.from(
    { length: today.getFullYear() - 2019 },
    (_, i) => 2020 + i
  );

  return (
    <div>
      {/* Year + Month dropdowns */}
      <div className="w-full bg-white dark:bg-layout-dark border-b-2 dark:border-border-dark-grey border-gray-100 rounded-t-lg px-4 py-3 flex items-center gap-3">
        {/* Year */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          className="bg-layout-dark rounded px-2 py-1 text-sm"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Month */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
          className="bg-layout-dark rounded px-2 py-1 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {format(new Date(2000, i, 1), "MMMM")}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule Table */}
      <ScheduleTable scheduleData={scheduleData} />
    </div>
  );
};

export default MonthlyProjects;

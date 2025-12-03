import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { API } from "../../../../../../constant";
import { useProject } from "../../../../ProjectContext";
import ScheduleTable from "../ScheduleTable";

const WeeklyProjects = () => {
  const { tenderId } = useProject();
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [scheduleData, setScheduleData] = useState([]);

  // Weeks for horizontal strip
  const weeks = [
    { label: "Week 1", start: 1, end: 7 },
    { label: "Week 2", start: 8, end: 14 },
    { label: "Week 3", start: 15, end: 21 },
    {
      label: "Week 4",
      start: 22,
      end: new Date(selectedYear, selectedMonth + 1, 0).getDate(),
    },
  ];

  const weekLabels = ["firstWeek", "secondWeek", "thirdWeek", "fourthWeek"];

  // Generate years from 2020 to current year
  const years = Array.from(
    { length: today.getFullYear() - 2019 },
    (_, i) => 2020 + i
  );

  const fetchData = async () => {
    if (!tenderId) return;

    const monthName = format(new Date(selectedYear, selectedMonth, 1), "MMM");
    const weekParam = weekLabels[selectedWeek]; // API expects firstWeek, secondWeek...

    try {
      const res = await axios.get(`${API}/schedule/getschedule`, {
        params: {
          tenderId,
          week: weekParam,
          month: monthName,
          year: selectedYear,
        },
      });
      setScheduleData(res.data.data || []);
    } catch (err) {
      console.error(err);
      setScheduleData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth, selectedWeek, tenderId]);

  return (
    <div>
      {/* Year + Month dropdowns + Weeks horizontal strip */}
      <div className="w-full bg-white dark:bg-layout-dark border-b-2 dark:border-border-dark-grey border-gray-100 rounded-t-lg px-4 py-3 flex items-center gap-3">
        {/* Year */}
        <select
          value={selectedYear}
          onChange={(e) => {
            const year = parseInt(e.target.value, 10);
            setSelectedYear(year);
            setSelectedWeek(0);
          }}
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
          onChange={(e) => {
            const month = parseInt(e.target.value, 10);
            setSelectedMonth(month);
            setSelectedWeek(0);
          }}
          className="bg-layout-dark rounded px-2 py-1 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {format(new Date(2000, i, 1), "MMMM")}
            </option>
          ))}
        </select>

        {/* Week horizontal strip */}
        <div className="flex overflow-x-auto no-scrollbar gap-3">
          {weeks.map((week, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedWeek(idx)}
              className={`flex flex-col items-center justify-center w-20 h-12 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedWeek === idx
                  ? "bg-darkest-blue text-white font-medium text-sm px-2"
                  : "hover:bg-gray-100 text-darkest-blue text-xs"
              }`}
            >
              <span>{week.label}</span>
              <span>{`${week.start}-${week.end}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Table */}
      <ScheduleTable scheduleData={scheduleData} />
    </div>
  );
};

export default WeeklyProjects;

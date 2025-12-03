import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../../../../../../constant";
import { useProject } from "../../../../ProjectContext";
import ScheduleTable from "../ScheduleTable";
import { TbFileExport } from "react-icons/tb";
import UploadModal from "../../UploadModal";

const ProjectSchedule = () => {
  const { tenderId } = useProject();
  const today = new Date();
  const currentYear = today.getFullYear();

  const [scheduleData, setScheduleData] = useState([]);
  const [upload, setUpload] = useState(false); // Upload modal state

  // Filters
  const [selectedYear, setSelectedYear] = useState(""); // empty initially
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Example: years from 2020 to current year
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);

  // Fetch data function
  const fetchData = async (filters = {}) => {
    if (!tenderId) return;

    try {
      const params = { tenderId };

      // If date range is selected
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      } else {
        // No date range, pass year (selected or default to current year)
        params.year = filters.year || currentYear;
      }

      const res = await axios.get(`${API}/schedule/getschedule`, { params });
      setScheduleData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setScheduleData([]);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData(); // API will get current year by default
  }, [tenderId]);

  // Handlers
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setStartDate("");
    setEndDate("");
    fetchData({ year });
  };

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setSelectedYear(""); // reset year when using date range
    if (start && end) fetchData({ startDate: start, endDate: end });
  };

  return (
    <div>
      {/* Upload Button */}
      <p className="cursor-pointer flex justify-end mb-2">
        <span
          onClick={() => setUpload(true)}
          className="flex items-center dark:bg-layout-dark bg-white px-2 py-2 rounded-md text-sm"
        >
          <TbFileExport size={22} />
          <span className="px-1">Upload</span>
        </span>
      </p>

      {/* Horizontal strip style header */}
      <div className="w-full bg-white dark:bg-layout-dark border-b-2 dark:border-border-dark-grey border-gray-100 rounded-t-lg px-4 py-3 flex items-center gap-4 overflow-x-auto no-scrollbar">
        {/* Year Dropdown */}
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className="bg-layout-dark rounded px-2 py-1 text-sm"
        >
          <option value="">Select Year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Start Date */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleDateChange(e.target.value, endDate)}
          className="border border-border-dark-grey rounded px-2 py-1 text-sm"
        />

        {/* End Date */}
        <input
          type="date"
          value={endDate}
          onChange={(e) => handleDateChange(startDate, e.target.value)}
          className="border border-border-dark-grey rounded px-2 py-1 text-sm"
        />

        {/* Reset Button */}
        <button
          onClick={() => {
            setSelectedYear("");
            setStartDate("");
            setEndDate("");
            fetchData(); // current year by default
          }}
          className="bg-darkest-blue px-3 py-1 rounded text-sm"
        >
          Reset
        </button>
      </div>

      {/* Schedule Table */}
      <ScheduleTable scheduleData={scheduleData} />

      {/* Upload Modal */}
      {upload && <UploadModal onclose={() => setUpload(false)} />}
    </div>
  );
};

export default ProjectSchedule;

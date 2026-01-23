import React, { useEffect, useState } from "react";
import Title from "../../../../components/Title";
import { TbFileExport } from "react-icons/tb";
import ButtonBg from "../../../../components/Button";
import { BiFilterAlt } from "react-icons/bi";
import { AttendanceData } from "../../../../components/Data";
import { Check, X } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";
import Pagination from "../../../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../../../context/SearchBar";
import Filters from "../../../../components/Filters";

const getDaysInMonth = (month, year) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push({
      date: date.getDate().toString(),
      day: date
        .toLocaleDateString("en-US", { weekday: "short" })
        .charAt(0)
        .toUpperCase(),
    });
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const Leave = () => {
  const { searchTerm } = useSearch();
  const [attendance, setAttendance] = useState(AttendanceData);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterModal, setFilterModal] = useState(false);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const navigate = useNavigate();
  const itemsPerPage = 10;

  const handleFilter = ({ fromdate, todate }) => {
    setFilterParams({ fromdate, todate });
    setFilterModal(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    setDays(getDaysInMonth(month, year));
  }, [month, year]);

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toString().toLowerCase();
    const fromDate = filterParams.fromdate
      ? new Date(filterParams.fromdate)
      : null;
    const toDate = filterParams.todate ? new Date(filterParams.todate) : null;

    const filtered = attendance.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(lowerSearchTerm);
      const matchesDate = true;

      return matchesSearch && matchesDate;
    });

    setFilteredData(filtered);
  }, [searchTerm, filterParams, attendance]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <>
      <div className="overflow-auto no-scrollbar">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr className="text-sm bg-white border-b-4 border-light-blue">
              <th className="rounded-l-md px-2 pl-5 py-1">S.No</th>
              <th className="px-2 py-1 flex items-center justify-center gap-1 pt-[14px]">
                Name <HiArrowsUpDown size={18} />
              </th>
              {days.map((d, i) => (
                <th key={i} className="px-2 py-1">
                  {d.date}
                  <br />
                  <p className="font-light">{d.day}</p>
                </th>
              ))}
              <th className="rounded-r-md px-2 py-1 pr-5">Total</th>
            </tr>
          </thead>
          <tbody className="text-greyish bg-white text-sm">
            {days.length > 0 && paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr className="border-light-blue border-b-[3px]" key={idx}>
                  <td className="rounded-l-md text-center px-2 py-1">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="px-2 py-1">{row.name}</td>
                  {days.map((day, i) => (
                    <td key={i} className="px-4 py-3">
                      {row.attendance[day.date] ? (
                        <Check className="text-green-600 font-bold" size={23} />
                      ) : (
                        <X className="text-red-600" size={23} />
                      )}
                    </td>
                  ))}
                  <td className="rounded-r-md px-2 py-1">
                    {days.reduce(
                      (acc, day) => acc + (row.attendance[day.date] ? 1 : 0),
                      0
                    )}
                    /{days.length}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={days.length + 3}
                  className="text-center text-gray-400 py-4 font-medium"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Leave;

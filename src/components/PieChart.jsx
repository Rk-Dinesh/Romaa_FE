import { HiChevronDown } from "react-icons/hi";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DonutChart = ({
  title,
  data = [],
  colors = [],
  height = 180,
  outerRadius = 70,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Month");

  const options = ["Month", "Quarter", "Year"];

  return (
    <div className="dark:bg-layout-dark bg-white p-4 rounded-xl">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{title}</h3>

        {/* Custom Dropdown */}
        <div className="relative w-36 text-sm">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-full h-10 flex justify-between items-center pl-3 border dark:border-border-dark-grey border-[#cdd3ff] rounded-md   dark:text-white text-gray-600"
          >
            {selected}
            <span className=" flex items-center justify-center rounded-md dark:bg-overall_bg-dark bg-[#D0D6FF] w-10 h-10">
              <HiChevronDown
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                size={18}
              />
            </span>
          </button>
          {isOpen && (
            <ul className="absolute z-10 mt-1 w-full dark:bg-layout-dark bg-white border dark:border-border-dark-grey border-[#cdd3ff] rounded-md shadow dark:text-white text-gray-700">
              {options.map((option) => (
                <li
                  key={option}
                  onClick={() => {
                    setSelected(option);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 dark:hover:bg-overall_bg-dark hover:bg-[#eef0ff] cursor-pointer ${
                    option === selected ? "font-semibold text-[#4c52ff]" : ""
                  }`}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Donut Chart */}
      <div className="flex justify-evenly items-center whitespace-nowrap">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={outerRadius}
              paddingAngle={2}
              cornerRadius={8}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={colors[index % colors.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex flex-col gap-2 mr-10">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></span>
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;

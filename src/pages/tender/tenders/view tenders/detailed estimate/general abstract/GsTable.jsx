import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";

const GsTable = ({ isEditing, tableData, setTableData, headings }) => {
  const [expandedRow, setExpandedRow] = useState(false);
  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };



  // Handle cell edit
  const handleCellChange = (rowIdx, key, value) => {
    const updated = [...tableData];
    updated[rowIdx][key] = value;
    setTableData(updated);
  };

  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <div className="mt-4 overflow-y-auto no-scrollbar ">
        <div className="overflow-auto no-scrollbar">
          <table className="w-full whitespace-nowrap ">
            <thead>
              <tr className="font-semibold text-sm dark:bg-layout-dark bg-white border-b-4 dark:border-border-dark-grey border-light-blue">
                <th className="p-3.5 rounded-l-lg">S.no</th>
                {headings.map((heading, idx) => (
                  <th key={heading} className="p-3">
                
                      <h1 className="flex items-center justify-center gap-2">
                        {heading} <HiArrowsUpDown size={18} />
                      </h1>
                   
                  </th>
                ))}
                <th className="pr-2 rounded-r-lg"></th>
              </tr>
            </thead>

            <tbody className="text-greyish  text-sm font-light ">
              {tableData.length > 0
                ? tableData.map((data, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b-[3px] dark:bg-layout-dark bg-white  dark:border-border-dark-grey border-light-blue text-center">
                        <td className="rounded-l-lg py-3">{index + 1}</td>
                        <td className="px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={data.description}
                              onChange={e =>
                                handleCellChange(index, "description", e.target.value)
                              }
                              className=" border px-1.5 py-1.5 text-xs w-full"
                            />
                          ) : (
                            data.description
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={data.amount}
                              onChange={e =>
                                handleCellChange(index, "amount", e.target.value)
                              }
                              className="border px-1.5 py-1.5 text-xs w-full"
                            />
                          ) : (
                            data.amount
                          )}
                        </td>
                        <td     onClick={() => toggleRow(index)} className="rounded-r-lg">
                          <button
                        
                            className="cursor-pointer bg-blue-200  text-lg mr-2 rounded-sm p-0.5 text-blue-600"
                          >
                            {expandedRow === index ? <ChevronUp /> : <ChevronDown />}
                          </button>
                        </td>
                      </tr>

                      {expandedRow === index && (
                        <tr>
                          <td colSpan="5" className="px-10 py-1 ">
                            <div className=" dark:bg-layout-dark bg-white p-2 text-center py-4 rounded-md ">
                              <table className="w-full  text-sm ">
                                <tbody className="dark:bg-overall_bg-dark bg-gray-200   ">
                                  {data.details && data.details.length > 0 ? (
                                    data.details.map((detail, i) => (
                                      <tr
                                        key={i}
                                        className="border-b-4 dark:border-border-dark-grey border-white"
                                      >
                                        <td className="py-2 grid grid-cols-4">
                                          {detail.item}{" "}
                                          <p> {detail.formula}</p>
                                        </td>
                                        <td className="py-2">
                                          {data.amount}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan="3"
                                        className="text-center py-4 text-red-500"
                                      >
                                        No data available
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                : ""}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GsTable;
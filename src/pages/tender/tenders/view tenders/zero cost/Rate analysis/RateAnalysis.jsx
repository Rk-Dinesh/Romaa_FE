import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";
import { TbFileExport } from "react-icons/tb";
import UploadRateAnalysis from "./UploadRateAnalysis";
import axios from "axios";
import { API } from "../../../../../../constant";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const sample = [
  {
    itemNo: 1,
    workItem: "Earthwork",
    unit: "Cum",
    output: 855.36,
    finalRate: 663.35,
    lines: [
      {
        category: "MACHINERIES",
        sub: [
          {
            description: "Hire JCB",
            unit: "Month",
            quantity: 2,
            output: null,
            rate: 80000,
            amount: 160000,
            finalRate: 239.67,
          },
          {
            description: "Tractor",
            unit: "Month",
            quantity: 1,
            output: null,
            rate: 45000,
            amount: 45000,
            finalRate: 239.67,
          },
        ],
      },
      {
        category: "FUEL",
        sub: [
          {
            description: "Diesel",
            unit: "Lit",
            quantity: 1275,
            output: null,
            rate: 96,
            amount: 122400,
            finalRate: 143.1,
          },
        ],
      },
      {
        category: "SUBCONTRACTOR",
        sub: [
          {
            description: "Blasting",
            unit: "Points",
            quantity: 1100,
            output: null,
            rate: 180,
            amount: 198000,
            finalRate: 231.48,
          },
        ],
      },
      {
        category: "MANPOWER",
        sub: [
          {
            description: "Helpers",
            unit: "Nos",
            quantity: 60,
            output: null,
            rate: 700,
            amount: 42000,
            finalRate: 49.1,
          },
        ],
      },
    ],
  },
  {
    itemNo: 2,
    workItem: "Refilling",
    unit: "Cum",
    output: 684.288,
    finalRate: 89.58,
    lines: [
      {
        category: "MACHINERIES",
        sub: [
          {
            description: "Hire JCB",
            unit: "Month",
            quantity: 0.5,
            output: null,
            rate: 80000,
            amount: 40000,
            finalRate: 58.45,
          },
        ],
      },
      {
        category: "FUEL",
        sub: [
          {
            description: "Diesel",
            unit: "Lit",
            quantity: 112.5,
            output: null,
            rate: 96,
            amount: 10800,
            finalRate: 15.78,
          },
        ],
      },
      {
        category: "MANPOWER",
        sub: [
          {
            description: "Helpers",
            unit: "Nos",
            quantity: 15,
            output: null,
            rate: 700,
            amount: 10500,
            finalRate: 15.34,
          },
        ],
      },
    ],
  },
  {
    itemNo: 3,
    workItem: "Gravel Filling",
    unit: "Cum",
    output: 543.54,
    finalRate: 301.03,
    lines: [
      {
        category: "MATERIALS",
        sub: [
          {
            description: "Water Load",
            unit: "Load",
            quantity: 30,
            output: null,
            rate: 700,
            amount: 21000,
            finalRate: 38.62,
          },
        ],
      },
      {
        category: "MACHINERIES",
        sub: [
          {
            description: "Hire JCB",
            unit: "Month",
            quantity: 1,
            output: null,
            rate: 80000,
            amount: 80000,
            finalRate: 147.4,
          },
        ],
      },
      {
        category: "FUEL",
        sub: [
          {
            description: "Diesel",
            unit: "Lit",
            quantity: 375,
            output: null,
            rate: 96,
            amount: 36000,
            finalRate: 66.27,
          },
        ],
      },
      {
        category: "MANPOWER",
        sub: [
          {
            description: "Helpers",
            unit: "Nos",
            quantity: 60,
            output: null,
            rate: 700,
            amount: 42000,
            finalRate: 48.74,
          },
        ],
      },
    ],
  },
  {
    itemNo: 0,
    workItem: "",
    unit: null,
    output: null,
    finalRate: null,
    lines: [],
  },
];

const RateAnalysis = ({ data = sample }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };
  const [showUpload, setShowUpload] = useState(false);
  const [rateAnalysis, setRateAnalysis] = useState([]);
  const { tender_id } = useParams();
  console.log(tender_id);

  const fetchRateAnalysis = async () => {
    try {
      const res = await axios.get(
        `${API}/rateanalysis/getbytenderId?tenderId=${tender_id}`
      )
      setRateAnalysis(res.data.data.work_items || []);
    } catch (err) {
      toast.error("Failed to fetch Rate Analysis ");
    } finally {
    }
  };

  useEffect(() => {
    fetchRateAnalysis();
  }, []);

  const columns = [
    { label: "Description" },
    { label: "Unit" },
    { label: "Quantity" },
    { label: "Rate" },
    { label: "Amount" },
    { label: "Final Rate" },
  ];
  const TableHeader = ({ columns }) => {
    return (
      <table className="w-full   text-sm">
        <thead className=" bg-indigo-200">
          <tr className="">
            {columns.map((col, idx) => (
              <th key={idx} className="p-2 ">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
      </table>
    );
  };

  return (
    <>
      <p
        onClick={() => setShowUpload(true)}
        className=" cursor-pointer flex justify-end  "
      >
        <span className="flex  items-center dark:bg-layout-dark bg-white px-2 py-2 rounded-md text-sm">
          <TbFileExport size={22} />
          <span className="px-1">Upload RA</span>
        </span>
      </p>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className="mt-4 overflow-y-auto no-scrollbar">
          <div className="overflow-auto no-scrollbar">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="font-semibold text-sm dark:bg-layout-dark bg-white border-b-4 dark:border-border-dark-grey border-light-blue">
                  <th className="p-3.5 rounded-l-lg">S.no</th>
                  <th className="p-3">Work Item</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Final Rate</th>
                  <th className="p-3">Output</th>
                  <th className="pr-2 rounded-r-lg"></th>
                </tr>
              </thead>

              <tbody className="text-greyish text-sm font-light">
                {rateAnalysis && rateAnalysis.length > 0 ? (
                  rateAnalysis.map((workItem, index) => (
                    <React.Fragment key={workItem.itemNo}>
                      <tr
                        className="border-b-[3px] dark:bg-layout-dark bg-white dark:border-border-dark-grey border-light-blue text-center cursor-pointer"
                        onClick={() => toggleRow(index)}
                      >
                        <td className="rounded-l-lg py-3">{index + 1}</td>
                        <td>{workItem.workItem}</td>
                        <td>{workItem.unit || "-"}</td>
                        <td>{workItem.finalRate || "-"}</td>
                        <td>{workItem.output || "-"}</td>
                        <td className="rounded-r-lg">
                          <button
                            onClick={() => toggleRow(index)}
                            className="cursor-pointer bg-blue-200  text-lg mr-2 rounded-sm p-0.5 text-blue-600"
                          >
                            {expandedRow === index ? (
                              <ChevronUp />
                            ) : (
                              <ChevronDown />
                            )}
                          </button>
                        </td>
                      </tr>

                      {expandedRow === index && (
                        <tr>
                          <td colSpan="7" className="px-10 py-4 ">
                            <div className="dark:bg-layout-dark bg-white p-4 text-center rounded-md">
                              <TableHeader columns={columns} />
                              {workItem.lines && workItem.lines.length > 0 ? (
                                workItem.lines.map((categoryGroup) => (
                                  <div
                                    key={categoryGroup.category}
                                    className="mb-4 rounded-lg bg-white shadow dark:bg-layout-dark"
                                  >
                                    <div className="p-3 font-semibold border-b-2 dark:border-border-dark-grey border-white text-left">
                                      {categoryGroup.category}
                                    </div>

                                    <table className="w-full text-sm">
                                      {/* <thead className="bg-indigo-200 text-center">
                                      <tr>
                                        <th className="p-2">
                                          Description
                                        </th>
                                        <th className=" ">Unit</th>
                                        <th className="">
                                          Quantity
                                        </th>
                                        <th className=" ">Rate</th>
                                        <th className=" ">
                                          Amount
                                        </th>

                                        <th className="">
                                          Final Rate
                                        </th>
                                      </tr>
                                    </thead> */}

                                      <tbody>
                                        {categoryGroup.sub.map((line, idx2) => (
                                          <tr
                                            key={idx2}
                                            className="border-b-2 dark:border-gray-500 border-white bg-gray-300 dark:bg-layout-dark"
                                          >
                                            <td className="p-2 ">
                                              {line.description}
                                            </td>
                                            <td className="text-left">
                                              {line.unit || "-"}
                                            </td>
                                            <td className="text-left">
                                              {line.quantity ?? "-"}
                                            </td>
                                            <td className="">
                                              {line.rate ?? "-"}
                                            </td>
                                            <td className="">
                                              {line.amount ?? "-"}
                                            </td>
                                            <td className="">
                                              {line.finalRate ?? "-"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ))
                              ) : (
                                <div className="text-red-500 py-4 text-center">
                                  No detail lines available
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-red-500 py-4 text-center">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showUpload && (
        <UploadRateAnalysis onclose={() => setShowUpload(false)} onSuccess={fetchRateAnalysis} />
      )}
    </>
  );
};

export default RateAnalysis;

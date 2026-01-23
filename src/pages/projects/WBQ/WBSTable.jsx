import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import axios from "axios";
import AddPhaseModal from "./AddWBS";

import { API } from "../../../constant";
import { toast } from "react-toastify";
import { useProject } from "../../../context/ProjectContext";

const WBSTable = ({ name }) => {
  console.log(name);
  
  const { tenderId } = useProject();
  const [expandedRow, setExpandedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRowIdx, setSelectedRowIdx] = useState(null);
  const [wbsData, setWbsData] = useState([]);

  // Fetch WBS data from API
  const fetchWBS = async () => {
    try {
      const res = await axios.get(
        `${API}/detailedestimate/getdatacustomhead?tender_id=${tenderId}&nametype=${name}`
      );
      setWbsData(res.data.data || []);
    } catch (error) {
      console.error("Error fetching WBS data:", error);
    }
  };

  useEffect(() => {
    fetchWBS();
  }, [tenderId,name]);

  const toggleRow = (idx) => setExpandedRow(expandedRow === idx ? null : idx);

  const openAddModal = (idx, e) => {
    e.stopPropagation(); // Prevent row toggle
    setSelectedRowIdx(idx);
    setShowModal(true);
  };

  const closeAddModal = () => {
    setShowModal(false);
    setSelectedRowIdx(null);
  };

  const getRemainingQuantity = (row) => {
    const usedQuantity =
      row.phase_breakdown?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
    return row.quantity - usedQuantity;
  };

  const getColorByUtilization = (row) => {
    const usedQuantity =
      row.phase_breakdown?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
    const utilization = (usedQuantity / row.quantity) * 100;

    if (utilization >= 100) return "#dc2626"; // 🔴 red – fully used
    if (utilization >= 40 &&utilization<=90) return "#facc15"; // 🟡 yellow – 80% used
    return "#22c55e"; // 🟢 green – still available
  };

  const handleSavePhase = async (newPhase) => {
    if (selectedRowIdx === null) return;
    const row = wbsData[selectedRowIdx];
    const payload = {
      description: row.description,
      phase: newPhase.phase,
      quantity: newPhase.quantity,
    };

    try {
      await axios.post(
        `${API}/detailedestimate/addphasebreakdown?tender_id=${tenderId}&nametype=${name}`,
        payload
      );
      toast.success("Phase added successfully");
      closeAddModal();
      await fetchWBS(); // Refresh table data
    } catch (error) {
      console.error("Error adding phase:", error);
    }
  };

  return (
    <div className="font-roboto-flex flex flex-col transition-colors duration-300 min-h-[40vh] rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="font-semibold text-sm dark:bg-layout-dark bg-white border-b-4 dark:border-border-dark-grey border-light-blue transition-colors">
              <th className="px-3 py-3.5 rounded-l-lg">S.no</th>
              <th className="px-3 py-3.5">Item Description</th>
              <th className="px-3 py-3.5">Unit</th>
              <th className="px-3 py-3.5">Quantity</th>
              <th className="px-3 py-3.5">Rate</th>
              <th className="px-3 py-3.5">Amount</th>
              <th className="px-3 py-3.5">Balance Qty</th>
              <th className="px-3 py-3.5 rounded-r-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {wbsData.length > 0 ? (
              wbsData.map((row, idx) => {
                const remainingQty = getRemainingQuantity(row);
                return (
                  <React.Fragment key={idx}>
                    <tr
                      className="border-b-[3px] dark:bg-layout-dark bg-white dark:border-border-dark-grey border-light-blue text-center cursor-pointer"
                      onClick={() => toggleRow(idx)}
                      tabIndex="0"
                      aria-expanded={expandedRow === idx}
                    >
                      <td className="rounded-l-lg py-3 px-2">{idx + 1}</td>
                      <td className="px-2">{row.description || "-"}</td>
                      <td className="px-2">{row.unit || "-"}</td>
                      <td className="px-2">{row.quantity ?? "-"}</td>
                      <td className="px-2">{row.rate ?? "-"}</td>
                      <td className="px-2">{row.amount ?? "-"}</td>
                      <td
                        className="px-2"
                        style={{
                          color:getColorByUtilization(row),
                        }}
                      >
                        {remainingQty}
                      </td>

                      <td
                        className="rounded-r-lg px-4 flex justify-center items-center mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleRow(idx)}
                          aria-label={
                            expandedRow === idx
                              ? "Hide Details"
                              : "Show Details"
                          }
                          className="cursor-pointer bg-blue-200 text-lg mr-4 rounded-sm p-0.5 text-blue-600"
                        >
                          {expandedRow === idx ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </button>
                        <button
                          onClick={(e) => openAddModal(idx, e)}
                          aria-label="Add phase"
                          className="transition-all bg-darkest-blue text-lg rounded p-0.5 text-white"
                          title="Add phase"
                          disabled={remainingQty <= 0} // Disable if no remaining quantity
                        >
                          <Plus size={22} />
                        </button>
                      </td>
                    </tr>
                    {expandedRow === idx && (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-10 py-4 transition-colors"
                        >
                          <div className="bg-white dark:bg-layout-dark p-4 rounded-md shadow-inner text-center">
                            <div className="mb-2 font-semibold text-base text-left">
                              Phase Breakdown
                            </div>
                            {row.phase_breakdown &&
                            row.phase_breakdown.length > 0 ? (
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-indigo-200 dark:text-black">
                                    <th className="px-2 py-1">Phase</th>
                                    <th className="px-2 py-1">Quantity</th>
                                    <th className="px-2 py-1">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {row.phase_breakdown.map(
                                    (phase, phaseIdx) => (
                                      <tr
                                        key={phaseIdx}
                                        className="border-b-2 dark:border-gray-500 border-white bg-gray-300 dark:bg-layout-dark"
                                      >
                                        <td className="p-2">{phase.phase}</td>
                                        <td className="p-2">
                                          {phase.quantity ?? "-"}
                                        </td>
                                        <td className="p-2">
                                          {phase.amount ?? "-"}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            ) : (
                              <div className="text-red-500 dark:text-red-300 py-6 font-semibold">
                                No phase data available
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="py-8 text-center text-red-500 dark:text-red-300 bg-white dark:bg-layout-dark"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Phase Modal */}
      {selectedRowIdx !== null && (
        <AddPhaseModal
          isOpen={showModal}
          onclose={closeAddModal}
          onSave={handleSavePhase}
          maxQuantity={getRemainingQuantity(wbsData[selectedRowIdx])} // Pass remaining quantity
        />
      )}
    </div>
  );
};

export default WBSTable;

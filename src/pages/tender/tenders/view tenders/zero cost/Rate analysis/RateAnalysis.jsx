import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TbFileExport } from "react-icons/tb";
import UploadRateAnalysis from "./UploadRateAnalysis";
import axios from "axios";
import { API } from "../../../../../../constant";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

// Group backend "lines" by category
const groupLinesByCategory = (lines = []) => {
  const grouped = {};
  lines.forEach((line) => {
    if (!grouped[line.category]) {
      grouped[line.category] = [];
    }
    grouped[line.category].push({
      description: line.description,
      unit: line.unit,
      quantity: line.quantity,
      rate: line.rate,
      amount: line.amount,
      finalRate: line.total_rate,
    });
  });

  return Object.entries(grouped).map(([category, sub]) => ({
    category,
    sub,
  }));
};

const RateAnalysis = () => {
  const { tender_id } = useParams();
  const [rateAnalysis, setRateAnalysis] = useState([]);
  const [openSections, setOpenSections] = useState(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSection = (index) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const fetchRateAnalysis = async () => {
    if (!tender_id) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/rateanalysis/getbytenderId?tenderId=${tender_id}`
      );
      const apiData = res.data?.data;

      const transformed = (apiData?.work_items || []).map((item) => ({
        itemNo: item.itemNo,
        workItem: item.workItem,
        unit: item.unit || "-",
        output: item.working_quantity || "-",
        finalRate: item.final_rate,
        MY_M_rate: item.MY_M_rate,
        MY_F_rate: item.MY_F_rate,
        MP_C_rate: item.MP_C_rate,
        MP_NMR_rate: item.MP_NMR_rate,
        MT_CM_rate: item.MT_CM_rate,
        MT_BL_rate: item.MT_BL_rate,
        lines: groupLinesByCategory(item.lines || []),
      }));

      setRateAnalysis(transformed);

      // Set all sections open by default
      setOpenSections(new Set(transformed.map((_, i) => i)));
    } catch (err) {
      toast.error("Failed to fetch Rate Analysis");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRateAnalysis();
  }, [tender_id]);

  const DetailHeaderRow = () => (
    <div className="grid grid-cols-6 gap-2 text-[11px] font-semibold bg-indigo-100 px-3 py-2 rounded-t-md dark:text-black">
      <span>Description</span>
      <span>Unit</span>
      <span className="text-right">Quantity</span>
      <span className="text-right">Rate</span>
      <span className="text-right">Amount</span>
      <span className="text-right">Rate / Unit</span>
    </div>
  );

  return (
    <>
      {/* Upload button */}
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1 dark:bg-layout-dark bg-white px-3 py-2 rounded-md text-sm shadow"
        >
          <TbFileExport size={18} />
          <span>Upload RA</span>
        </button>
      </div>

      <div className="font-roboto-flex flex flex-col h-full">
        <div className="mt-2 overflow-y-auto no-scrollbar">
          <div className="overflow-x-auto no-scrollbar border border-gray-200 dark:border-border-dark-grey rounded-md bg-white dark:bg-layout-dark">
            <table className="w-full text-sm">
              <thead>
                <tr className="font-semibold text-xs md:text-sm dark:bg-layout-dark bg-gray-50 border-b border-gray-200 dark:border-border-dark-grey">
                  <th className="p-3 text-left">S.no</th>
                  <th className="p-3 text-left">Work Item</th>
                  <th className="p-3 text-center">Unit</th>
                  <th className="p-3 text-right">Working Qty</th>
                  <th className="p-3 text-right">Final Rate</th>
                  <th className="p-3 text-center w-12"></th>
                </tr>
              </thead>

              <tbody className="text-xs md:text-sm text-gray-700 dark:text-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500 text-sm">
                      Loading rate analysis...
                    </td>
                  </tr>
                ) : rateAnalysis && rateAnalysis.length > 0 ? (
                  rateAnalysis.map((workItem, index) => (
                    <React.Fragment key={workItem.itemNo || index}>
                      {/* Main row */}
                      <tr className="border-b border-gray-100 dark:border-border-dark-grey">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">
                          <div className="font-medium">
                            {workItem.workItem || workItem.itemNo}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            Item ID: {workItem.itemNo}
                          </div>
                        </td>
                        <td className="p-3 text-center">{workItem.unit || "-"}</td>
                        <td className="p-3 text-right">{workItem.output ?? "-"}</td>
                        <td className="p-3 text-right font-semibold">{workItem.finalRate ?? "-"}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSection(index)}
                            className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-sm p-1"
                          >
                            {openSections.has(index) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>

                      {/* Detail row (accordion) */}
                      {openSections.has(index) && (
                        <tr>
                          <td colSpan={6} className="px-6 pb-4 pt-1">
                            <div className="rounded-md border border-gray-200 dark:border-border-dark-grey dark:bg-layout-dark bg-white shadow-sm">
                              {workItem.lines && workItem.lines.length > 0 ? (
                                <div className="space-y-3 p-3">
                                  <DetailHeaderRow />

                                  {workItem.lines.map((categoryGroup) => (
                                    <div
                                      key={categoryGroup.category}
                                      className="border border-gray-100 dark:border-border-dark-grey rounded-md overflow-hidden"
                                    >
                                      <div className="px-3 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-left">
                                        {(() => {
                                          switch (categoryGroup.category) {
                                            case "MY-M":
                                              return "Machinery (MY-M)";
                                            case "MY-F":
                                              return "Fuel (MY-F)";
                                            case "MP-C":
                                              return "Contractor (MP-C)";
                                            case "MP-NMR":
                                              return "NMR (MP-NMR)";
                                            case "MT-CM":
                                              return "Consumable (MT-CM)";
                                            case "MT-BL":
                                              return "Bulk (MT-BL)";
                                            default:
                                              return categoryGroup.category;
                                          }
                                        })()}
                                      </div>

                                      <div className="divide-y divide-gray-100 dark:divide-border-dark-grey">
                                        {categoryGroup.sub.map((line, idx2) => (
                                          <div
                                            key={idx2}
                                            className="grid grid-cols-6 gap-2 px-3 py-1.5 text-[11px] md:text-xs bg-gray-50/60 dark:bg-layout-dark"
                                          >
                                            <span className="text-left">{line.description}</span>
                                            <span>{line.unit || "-"}</span>
                                            <span className="text-right">{line.quantity ?? "-"}</span>
                                            <span className="text-right">{line.rate ?? "-"}</span>
                                            <span className="text-right">{line.amount ?? "-"}</span>
                                            <span className="text-right">{line.finalRate ?? "-"}</span>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Show total rate for this category */}
                                      <div className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 dark:text-black font-medium text-right">
                                        {categoryGroup.category === "MY-M" && (
                                          <span className="bg-yellow-200 py-1.5 px-3">Total Machinery Rate: {workItem.MY_M_rate || 0}</span>
                                        )}
                                        {categoryGroup.category === "MY-F" && (
                                          <span className="bg-yellow-200 py-1.5 px-3">Total Fuel Rate: {workItem.MY_F_rate || 0}</span>
                                        )}
                                        {categoryGroup.category === "MP-C" && (
                                          <span className="bg-yellow-200 py-1.5 px-3">Total Contractor Rate: {workItem.MP_C_rate || 0}</span>
                                        )}
                                        {categoryGroup.category === "MP-NMR" && (
                                          <span className="bg-yellow-200 py-1.5 px-3">Total NMR Rate: {workItem.MP_NMR_rate || 0}</span>
                                        )}
                                        {categoryGroup.category === "MT-CM" && (
                                          <span className="bg-yellow-200 py-1.5 px-3">Total Consumable Rate: {workItem.MT_CM_rate || 0}</span>
                                        )}
                                        {categoryGroup.category === "MT-BL" && (
                                          <span className="bg-yellow-200 py-1.5 px-3">Total Bulk Rate: {workItem.MT_BL_rate || 0}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  {/* Show final rate for the work item */}
                                  <div className="px-3 py-2 text-sm font-semibold bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-border-dark-grey text-right">
                                    Final Rate: {workItem.finalRate}
                                  </div>
                                </div>
                              ) : (
                                <div className="py-4 text-center text-xs text-red-500">
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
                    <td colSpan={6} className="py-4 text-center text-red-500 text-sm">
                      No rate analysis data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showUpload && (
        <UploadRateAnalysis
          onclose={() => setShowUpload(false)}
          onSuccess={fetchRateAnalysis}
        />
      )}
    </>
  );
};

export default RateAnalysis;

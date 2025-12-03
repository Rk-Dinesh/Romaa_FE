import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FiEye } from "react-icons/fi";
import { PiLinkBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../constant";
import { set } from "react-hook-form";

const WORequest = () => {
  const projectId = localStorage.getItem("tenderId");
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewQuote, setViewQuote] = useState(null);

  

  // ✅ Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/workorderrequest/api/getbyId/${projectId}`);
        
        if (res.data.data && Array.isArray(res.data.data)) {
          setData(res.data.data);
        } else {
          toast.error("No Work Order Requests found");
        }
      } catch (error) {
        console.error("Error fetching WorkOrderRequests:", error);
        toast.error("Failed to fetch Work Order Requests");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const toggleRow = (index) => setExpandedRow(expandedRow === index ? null : index);

  // ✅ Generate Work Order link
  const handleGenerateWO = (item) => {
    const link = `${window.location.origin}/projects/woissuance/requestform/${projectId}/${item.requestId}`;
    navigator.clipboard.writeText(link);
    toast.success("Work Order link copied to clipboard!");
  };

  const handleAction = async (requestId, quotationId, action) => {
    try {
      await axios.put(
        `${API}/workorderrequest/api/workorder-requests/${requestId}/approve-vendor`,
        { quotationId, action }
      );

      toast.success(`Quotation ${action.toLowerCase()} successfully!`);

      setData((prev) =>
        prev.map((req) =>
          req._id === requestId
            ? {
                ...req,
                vendorQuotations: req.vendorQuotations.map((q) =>
                  q.quotationId === quotationId ? { ...q, approvalStatus: action } : q
                ),
              }
            : req
        )
      );
    } catch (err) {
      console.error("Error approving/rejecting quotation:", err);
      toast.error("Failed to update quotation status");
    }
  };

  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <div className="mt-4 overflow-y-auto no-scrollbar">
        <div className="overflow-auto no-scrollbar">
          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading...</div>
          ) : (
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="font-semibold text-sm dark:bg-layout-dark bg-white border-b-4 dark:border-border-dark-grey border-light-blue">
                  <th className="p-3.5 rounded-l-lg">S.no</th>
                  {["Contractor", "Unit Cost", "Unit", "Date", "Total", "Level", "Credit Days"].map(
                    (heading) => (
                      <th key={heading} className="p-3">
                        <h1 className="flex items-center justify-center gap-2">
                          {heading} <HiArrowsUpDown size={18} />
                        </h1>
                      </th>
                    )
                  )}
                  <th className="pr-2 rounded-r-lg">Action</th>
                </tr>
              </thead>

              <tbody className="text-greyish dark:text-gray-200 text-sm font-light">
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <React.Fragment key={index}>
                      {/* 📦 Main Row */}
                      <tr className="border-b-[3px] dark:bg-layout-dark dark:border-border-dark-grey bg-white border-light-blue text-center">
                        <td className="rounded-l-lg py-3">{index + 1}</td>
                        <td className="first-letter:uppercase">{item.title || "—"}</td>
                        <td></td><td></td><td></td><td></td><td></td><td></td>

                        <td className="rounded-r-lg flex items-center justify-center gap-2 mt-2">
                          <p
                            onClick={() => navigate("viewworequest", { state: { item } })}
                            className="cursor-pointer bg-green-200 rounded-sm p-1.5 text-green-600"
                            title="View Work Order"
                          >
                            <FiEye />
                          </p>

                          <p
                            onClick={() => handleGenerateWO(item)}
                            className="cursor-pointer bg-cyan-200 p-1.5 rounded text-cyan-700"
                            title="Copy Work Order Link"
                          >
                            <PiLinkBold />
                          </p>

                          <p
                            onClick={() => toggleRow(index)}
                            className="cursor-pointer bg-blue-200 rounded p-0.5 text-blue-600"
                            title="View Quotations"
                          >
                            {expandedRow === index ? <ChevronUp /> : <ChevronDown />}
                          </p>
                        </td>
                      </tr>

                      {/* 🔽 Expanded Quotations */}
                      {expandedRow === index && (
                        <tr>
                          <td colSpan="9" className="px-6 py-1">
                            <div className="dark:bg-layout-dark bg-white px-4 py-4 rounded-md">
                              {item.vendorQuotations?.length > 0 ? (
                                item.vendorQuotations.map((quote, i) => (
                                  <div
                                    key={i}
                                    className="border border-gray-300 dark:border-slate-700 rounded-lg mb-4 overflow-hidden"
                                  >
                                    <div className="bg-gray-100 dark:bg-slate-800 p-3 flex justify-between">
                                      <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                                          {String.fromCharCode(97 + i)}) {quote.vendorName}
                                        </p>
                                        {/* <p className="text-xs text-gray-500">
                                          Vendor ID: {quote.vendorId} | Status:{" "}
                                          <span
                                            className={`font-medium ${
                                              quote.approvalStatus === "Approved"
                                                ? "text-green-600"
                                                : quote.approvalStatus === "Rejected"
                                                ? "text-red-600"
                                                : "text-yellow-600"
                                            }`}
                                          >
                                            {quote.approvalStatus || "Pending"}
                                          </span>
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Delivery:{" "}
                                          {quote.deliveryPeriod
                                            ? new Date(quote.deliveryPeriod).toLocaleDateString(
                                                "en-GB"
                                              )
                                            : "—"}
                                        </p> */}
                                      </div>
                                      {/* <p className="text-xs text-gray-500">
                                        Quote ID: {quote.quotationId}
                                      </p> */}
                                    </div>

                                    {/* Nested Items Table */}
                                    <table className="w-full text-xs border-t">
                                      <thead className="bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
                                        <tr>
                                          <th className="border px-2 py-1">S.No</th>
                                          <th className="border px-2 py-1 text-left">Work</th>
                                          <th className="border px-2 py-1">Qty</th>
                                          <th className="border px-2 py-1">Unit</th>
                                          <th className="border px-2 py-1">Rate (₹)</th>
                                          <th className="border px-2 py-1">Amount (₹)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {quote.quoteItems?.map((q, j) => (
                                          <tr key={j}>
                                            <td className="border px-2 py-1 text-center">{j + 1}</td>
                                            <td className="border px-2 py-1">{q.materialName}</td>
                                            <td className="border px-2 py-1 text-center">{q.quantity}</td>
                                            <td className="border px-2 py-1 text-center">{q.unit}</td>
                                            <td className="border px-2 py-1 text-right">{q.quotedUnitRate}</td>
                                            <td className="border px-2 py-1 text-right text-green-700 font-medium">
                                              {q.totalAmount}
                                            </td>
                                          </tr>
                                        ))}
                                        <tr className="bg-gray-100 dark:bg-slate-800 font-semibold">
                                          <td colSpan="5" className="text-right border px-2 py-1">
                                            Total
                                          </td>
                                          <td className="border px-2 py-1 text-right text-green-700">
                                            ₹
                                            {quote.quoteItems
                                              .reduce((sum, q) => sum + (q.totalAmount || 0), 0)
                                              .toLocaleString("en-IN")}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-6 p-2">
                                      {quote.approvalStatus === "Approved" ? (
                                        <span className="text-green-700 italic font-medium">
                                          Approved
                                        </span>
                                      ) : quote.approvalStatus === "Rejected" ? (
                                        <span className="text-red-600 italic font-medium">
                                          Rejected
                                        </span>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() =>
                                              handleAction(item._id, quote.quotationId, "Approved")
                                            }
                                            className="text-green-700 underline decoration-2 underline-offset-4 text-sm font-medium"
                                          >
                                            Accept
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleAction(item._id, quote.quotationId, "Rejected")
                                            }
                                            className="text-red-500 underline decoration-2 underline-offset-4 text-sm font-medium"
                                          >
                                            Reject
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-red-500 py-4">
                                  No quotations available
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-6 text-gray-500">
                      No Work Order Requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default WORequest;

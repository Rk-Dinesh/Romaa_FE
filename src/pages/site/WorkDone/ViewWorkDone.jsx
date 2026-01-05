import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API } from "../../../constant";
import { 
  ArrowLeft, 
  Printer, 
  CalendarDays, 
  User, 
  Hash, 
  FileText,
  MapPin
} from "lucide-react";
import Button from "../../../components/Button";

const ViewWorkDone = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Robustly handle state access
  const workDoneId = location.state?.item?.workDoneId || "";
  const tenderId = location.state?.item?.tender_id || "";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!workDoneId || !tenderId) return;
        const res = await axios.get(`${API}/workdone/api/details/${tenderId}/${workDoneId}`);
        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workDoneId, tenderId]);

  // --- Helpers ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const totalQuantitySum = useMemo(() => {
    return (data?.dailyWorkDone || []).reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [data]);

  const StatusBadge = ({ status }) => {
    const colorClass = status === "Submitted" ? "bg-blue-100 text-blue-700 border-blue-200" : 
                       status === "Approved" ? "bg-green-100 text-green-700 border-green-200" : 
                       "bg-gray-100 text-gray-700 border-gray-200";
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
        {status || "Draft"}
      </span>
    );
  };

  if (loading) return <div className="p-8 flex justify-center text-gray-500">Loading details...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Report details not found.</div>;

  return (
    <div className="font-roboto-flex min-h-screen dark:bg-[#0b0f19] p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* --- 1. Header & Actions --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Daily Progress Report</h1>
                <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs font-mono font-semibold text-gray-600 dark:text-gray-300">
                  #{data.workDoneId}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin size={12} /> {data.tender_id}
              </p>
            </div>
          </div>

        
        </div>

        {/* --- 2. Info Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700  flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Report Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">{formatDate(data.report_date)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Site Engineer</p>
              <p className="font-semibold text-gray-900 dark:text-white">{data.created_by || "Unknown"}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
              <Hash size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Total Items</p>
              <p className="font-semibold text-gray-900 dark:text-white">{data.dailyWorkDone?.length || 0} Entries</p>
            </div>
          </div>
        </div>

        {/* --- 3. Main Data Table --- */}
        <div className="bg-white dark:bg-gray-800 rounded-mdshadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
              <FileText size={16} className="text-blue-500" /> Work Done Entries
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 uppercase font-bold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 w-16">#</th>
                  <th className="px-6 py-3 min-w-[180px]">Description</th>
                  <th className="px-3 py-3 text-center w-16 text-gray-400">L</th>
                  <th className="px-3 py-3 text-center w-16 text-gray-400">B</th>
                  <th className="px-3 py-3 text-center w-16 text-gray-400">H</th>
                  <th className="px-6 py-3 text-right">Quantity</th>
                  <th className="px-6 py-3 w-24">Unit</th>
                  <th className="px-6 py-3">Contractor</th>
                  <th className="px-6 py-3 min-w-[150px]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {data.dailyWorkDone?.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50/10 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                      {item.item_description}
                    </td>
                    <td className="px-3 py-4 text-center text-gray-500 ">
                      {item.dimensions?.length || "-"}
                    </td>
                    <td className="px-3 py-4 text-center text-gray-500 ">
                      {item.dimensions?.breadth || "-"}
                    </td>
                    <td className="px-3 py-4 text-center text-gray-500 ">
                      {item.dimensions?.height || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium uppercase">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {item.contractor_details || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs italic">
                      {item.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-right font-bold text-gray-500 uppercase text-xs tracking-wider">
                    Total Quantity
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white text-base">
                    {totalQuantitySum.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewWorkDone;
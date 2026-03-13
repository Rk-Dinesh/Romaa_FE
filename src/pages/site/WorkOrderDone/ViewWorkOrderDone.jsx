import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Hash,
  FileText,
  ClipboardList,
} from "lucide-react";
import { useWorkDoneByDate } from "./hooks/useWorkOrderDone";
import { useProject } from "../../../context/ProjectContext";

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const ViewWorkOrderDone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenderId } = useProject();

  const reportDate = location.state?.item?.report_date || "";

  const { data: records = [], isLoading } = useWorkDoneByDate(
    tenderId,
    reportDate,
  );

  const totalItems = useMemo(
    () => records.reduce((sum, r) => sum + (r.dailyWorkDone?.length || 0), 0),
    [records],
  );

  if (isLoading)
    return (
      <div className="p-10 flex justify-center items-center text-gray-400 text-sm gap-2">
        <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        Loading report...
      </div>
    );

  if (!records.length)
    return (
      <div className="p-10 text-center text-red-500 text-sm">
        No records found for this date.
      </div>
    );

  return (
    <div className="font-roboto-flex min-h-screen dark:bg-[#0b0f19] p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Daily Progress Report
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Project: {tenderId}</p>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoCard
            icon={<CalendarDays size={20} />}
            color="blue"
            label="Report Date"
            value={formatDate(reportDate)}
          />
          <InfoCard
            icon={<ClipboardList size={20} />}
            color="orange"
            label="Work Orders"
            value={`${records.length} order${records.length !== 1 ? "s" : ""}`}
          />
          <InfoCard
            icon={<Hash size={20} />}
            color="emerald"
            label="Total Items"
            value={`${totalItems} entr${totalItems !== 1 ? "ies" : "y"}`}
          />
        </div>

        {/* ── One card per work order ── */}
        {records.map((record) => (
          <WorkOrderCard
            key={record.workDoneId || record.workOrder_id}
            record={record}
          />
        ))}
      </div>
    </div>
  );
};

// ── Work Order Card ────────────────────────────────────────────────────────────

const WorkOrderCard = ({ record }) => {
  const totalQty = useMemo(
    () =>
      (record.dailyWorkDone || []).reduce(
        (sum, i) => sum + (i.quantity || 0),
        0,
      ),
    [record],
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Card header */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={15} className="text-blue-500" />
          <span className="font-bold text-gray-800 dark:text-white text-sm">
            Work Order: <span className="font-mono">{record.workOrder_id}</span>
          </span>
          <span className="text-xs text-gray-400 font-mono">
            {record.workDoneId}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">By: {record.created_by}</span>
        </div>
      </div>

      {/* Items table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 uppercase font-bold border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-2 w-10">#</th>
              <th className="px-4 py-2 min-w-[180px]">Description</th>
              <th className="px-3 py-2 text-center w-16">L</th>
              <th className="px-3 py-2 text-center w-16">B</th>
              <th className="px-3 py-2 text-center w-16">H</th>
              <th className="px-4 py-2 text-right w-28">Quantity</th>
              <th className="px-4 py-2 w-20">Unit</th>
              <th className="px-4 py-2 min-w-[140px]">Contractor</th>
              <th className="px-4 py-2 min-w-[150px]">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {record.dailyWorkDone?.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="py-8 text-center text-gray-400 text-sm"
                >
                  No items.
                </td>
              </tr>
            ) : (
              record.dailyWorkDone?.map((item, i) => (
                <tr
                  key={i}
                  className="hover:bg-blue-50/20 dark:hover:bg-gray-700/20 transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                    {item.item_description}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {item.dimensions?.length || "—"}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {item.dimensions?.breadth || "—"}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {item.dimensions?.height || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-medium uppercase">
                    {item.unit}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {item.contractor_details || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs italic">
                    {item.remarks || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700">
            <tr>
              <td colSpan="4" />
              <td className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Qty
              </td>
              <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-white">
                {totalQty.toLocaleString("en-IN")}
              </td>
              <td colSpan="3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// ── Info Card ──────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  blue: { wrap: "bg-blue-50 dark:bg-blue-900/20", icon: "text-blue-600" },
  orange: {
    wrap: "bg-orange-50 dark:bg-orange-900/20",
    icon: "text-orange-500",
  },
  emerald: {
    wrap: "bg-emerald-50 dark:bg-emerald-900/20",
    icon: "text-emerald-600",
  },
};

const InfoCard = ({ icon, color, label, value }) => {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3 shadow-sm">
      <div className={`p-2 rounded-lg ${c.wrap} ${c.icon}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
          {label}
        </p>
        <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
};

export default ViewWorkOrderDone;

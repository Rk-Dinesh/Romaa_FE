import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { MdArrowBackIosNew } from "react-icons/md";
import {
  IoSearchOutline,
} from "react-icons/io5";
import {
  LayoutList,
  CircleDollarSign,
  BarChart3,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { API } from "../../../../../constant";
import Loader from "../../../../../components/Loader";

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(val || 0);

function SummaryCard({ icon: Icon, label, value, sub, colorClass, bgColor }) {
  return (
    <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center gap-3 transition-all hover:shadow-md grow group">
      <div
        className={`p-2.5 rounded-lg ${bgColor} shrink-0 group-hover:scale-105 transition-transform`}
      >
        {Icon && <Icon size={18} className={colorClass} />}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 text-nowrap">
          {label}
        </p>
        <h3 className="text-base font-black text-gray-900 dark:text-white tabular-nums leading-none tracking-tight">
          {value}
        </h3>
        {sub && (
          <p className="text-[10px] font-bold text-gray-500 mt-1 truncate">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

const BOQ = ({ onBack }) => {
  const { tender_id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [gstPercent, setGstPercent] = useState(18);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchItems = useCallback(async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/bid/get?tender_id=${tender_id}`);
      setItems(res.data.data.items || []);
      if (res.data.data.gst) setGstPercent(res.data.data.gst);
    } catch {
      // toast.error("Failed to load BOQ items");
    } finally {
      setLoading(false);
    }
  }, [tender_id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const sortedItems = useMemo(() => {
    let baseItems = [...items];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      baseItems = baseItems.filter(
        (it) =>
          it.item_name?.toLowerCase().includes(q) ||
          it.item_id?.toLowerCase().includes(q) ||
          it.description?.toLowerCase().includes(q)
      );
    }
    if (sortConfig.key) {
      baseItems.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return baseItems;
  }, [items, searchTerm, sortConfig]);

  const totals = useMemo(() => {
    const base = sortedItems.reduce((acc, it) => acc + (it.n_amount || 0), 0);
    const gstAmt = (base * gstPercent) / 100;
    return {
      base,
      gst: gstAmt,
      total: base + gstAmt,
    };
  }, [sortedItems, gstPercent]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="font-roboto-flex h-full flex flex-col gap-4 animate-fade-in pb-10">
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <IoSearchOutline
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Filter BOQ Items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white shadow-sm"
          />
        </div>

        {/* Global Actions Removed */}
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={Package}
          label="Total Items"
          value={items.length}
          sub="BOQ Line Items"
          colorClass="text-slate-600"
          bgColor="bg-slate-100"
        />
        <SummaryCard
          icon={CircleDollarSign}
          label="Base Total"
          value={fmt(totals.base)}
          sub="Owner Estimate"
          colorClass="text-blue-600"
          bgColor="bg-blue-50"
        />
        <SummaryCard
          icon={BarChart3}
          label="GST Amount"
          value={fmt(totals.gst)}
          sub={`${gstPercent}% Tax Rate`}
          colorClass="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <SummaryCard
          icon={CircleDollarSign}
          label="Grand Total"
          value={fmt(totals.total)}
          sub="Final Baseline Value"
          colorClass="text-emerald-600"
          bgColor="bg-emerald-50"
        />
      </div>

      {/* --- TABLE AREA --- */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col grow">
        {/* Table Header/Controls */}
        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">
            Showing {sortedItems.length} of {items.length} records
          </div>
          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
            {tender_id}
          </div>
        </div>

        {/* Custom Grid */}
        <div className="overflow-auto relative max-h-[70vh] no-scrollbar rounded-b-3xl">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader />
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                Synchronizing BOQ...
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead className="sticky top-0 z-50 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <tr className="bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md">
                  <th className="w-16 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-0 z-20 bg-gray-50 dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700">
                    S.No
                  </th>
                  <th 
                    onClick={() => requestSort('item_id')}
                    className="w-24 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-16 z-20 bg-gray-50 dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    Item ID
                  </th>
                  <th 
                    onClick={() => requestSort('item_name')}
                    className="min-w-[100px] px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-[160px] z-20 bg-gray-50 dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 shadow-[2px_0_10px_rgba(0,0,0,0.02)] cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    Item Name
                  </th>
                  <th 
                    onClick={() => requestSort('quantity')}
                    className="w-24 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    Qty
                  </th>
                  <th className="w-24 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Unit
                  </th>
                  <th 
                    onClick={() => requestSort('n_rate')}
                    className="w-32 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    Rate
                  </th>
                  <th 
                    onClick={() => requestSort('n_amount')}
                    className="w-40 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right bg-blue-50/30 dark:bg-blue-400/5 cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {sortedItems.map((item, idx) => (
                  <React.Fragment key={item.item_id || idx}>
                    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all group">
                      <td className="px-6 py-4 text-xs font-bold text-gray-400 tabular-nums sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 text-center">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-blue-600 dark:text-blue-400 tabular-nums sticky left-16 z-10 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
                        {item.item_id || "-"}
                      </td>
                      <td className="px-6 py-4 sticky left-[160px] z-10 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-[2px_0_10px_rgba(0,0,0,0.02)] hover:z-50">
                        <div className="relative group/tip flex flex-col">
                          <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                            {item.item_name}
                          </span>
                          
                          {/* Tooltip - Downward position to avoid clipping */}
                          <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-[10px] leading-relaxed rounded-xl shadow-2xl opacity-0 -translate-y-2 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:translate-y-0 transition-all z-50">
                            <p className="font-black mb-1 text-blue-400 uppercase tracking-widest">Description</p>
                            {item.description || "No specs available."}
                            <div className="absolute bottom-full left-4 -mb-1 border-4 border-transparent border-b-gray-900" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-gray-900 dark:text-white text-center tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-400 text-center uppercase tracking-widest">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-gray-900 dark:text-white text-right tabular-nums">
                        {fmt(item.n_rate)}
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-blue-700 dark:text-blue-300 text-right tabular-nums bg-blue-50/10 dark:bg-blue-400/5">
                        {fmt(item.n_amount)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>

              {/* Financial Summary Footer */}
              <tfoot className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-900/50">
                <tr className="text-nowrap border-b border-gray-100 dark:border-gray-800/50">
                  <td className="w-16 px-6 py-3 sticky left-0 z-20 bg-gray-50 dark:bg-slate-900 border-r border-gray-100 dark:border-gray-800" />
                  <td className="w-24 px-6 py-3 sticky left-16 z-20 bg-gray-50 dark:bg-slate-900 border-r border-gray-100 dark:border-gray-800" />
                  <td className="min-w-[100px] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 sticky left-[160px] z-20 bg-gray-50 dark:bg-slate-900 border-r border-gray-100 dark:border-gray-700">
                    Subtotal (Excl. Tax)
                  </td>
                  <td colSpan={3} className="px-6 py-3 text-right" />
                  <td className="px-6 py-3 text-sm text-blue-600/70 dark:text-blue-400/70 tabular-nums text-right font-bold">
                    {fmt(totals.base)}
                  </td>
                </tr>
                {/* Tax */}
                <tr className="text-nowrap border-b border-gray-100 dark:border-gray-800/50">
                  <td className="w-16 px-6 py-2 sticky left-0 z-20 bg-gray-50 dark:bg-slate-900 border-r border-gray-100 dark:border-gray-800" />
                  <td className="w-24 px-6 py-2 sticky left-16 z-20 bg-gray-50 dark:bg-slate-900 border-r border-gray-100 dark:border-gray-800" />
                  <td className="min-w-[100px] px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 sticky left-[160px] z-20 bg-gray-50 dark:bg-slate-900 border-r border-gray-100 dark:border-gray-700">
                    Tax (GST {gstPercent}%)
                  </td>
                  <td colSpan={3} className="px-6 py-2 text-right" />
                  <td className="px-6 py-2 text-sm text-indigo-500/50 dark:text-indigo-400/50 tabular-nums text-right font-medium italic">
                    {fmt(totals.gst)}
                  </td>
                </tr>
                {/* Grand Total */}
                <tr className="text-nowrap bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
                  <td className="w-16 px-6 py-4 sticky left-0 z-20 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800" />
                  <td className="w-24 px-6 py-4 sticky left-16 z-20 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800" />
                  <td className="min-w-[100px] px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-white sticky left-[160px] z-20 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-700 ">
                    Baseline Grand Total
                  </td>
                  <td colSpan={3} className="px-6 py-4 text-right" />
                  <td className="px-6 py-4 text-base text-gray-900 dark:text-white tabular-nums text-right font-black">
                    {fmt(totals.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* --- BOTTOM ACTIONS --- */}
      <div className="flex items-center justify-between mt-2 px-2">
        <button
          onClick={() => onBack && onBack()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-bold transition-all group"
        >
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <MdArrowBackIosNew size={14} />
          </div>
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Baseline Validity Secured <LayoutList size={14} />
        </div>
      </div>
    </div>
  );
};

export default BOQ;

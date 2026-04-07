import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { MdArrowBackIosNew } from "react-icons/md";
import {
  IoAlertCircleOutline,
  IoClose,
  IoSearchOutline,
} from "react-icons/io5";
import {
  LayoutList,
  CircleDollarSign,
  BarChart3,
  Package,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck,
} from "lucide-react";
import { GiArrowFlights } from "react-icons/gi";
import axios from "axios";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";
import UploadBid from "./UploadBid";
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

const Bid = ({ onBack }) => {
  const { tender_id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bidfreezed, setbidfreezed] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [gstPercent, setGstPercent] = useState(18);

  const fetchBoqItems = useCallback(async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/bid/get?tender_id=${tender_id}`);
      setItems(res.data.data.items || []);
      setbidfreezed(res.data.data.freezed);
      if (res.data.data.gst) setGstPercent(res.data.data.gst);
    } catch (err) {
      toast.info(`${err.response?.data?.message || "Error fetching items"}`);
    } finally {
      setLoading(false);
    }
  }, [tender_id]);

  useEffect(() => {
    fetchBoqItems();
  }, [fetchBoqItems]);

  const totals = useMemo(() => {
    const base = items.reduce(
      (acc, curr) => {
        acc.basic += Number(curr.base_amount) || 0;
        acc.quoted += Number(curr.q_amount) || 0;
        acc.negotiated += Number(curr.n_amount) || 0;
        return acc;
      },
      { basic: 0, quoted: 0, negotiated: 0 },
    );

    const calc = (val) => {
      const gAmount = val * (gstPercent / 100);
      return {
        base: val,
        gst: gAmount,
        total: val + gAmount,
      };
    };

    return {
      basic: calc(base.basic),
      quoted: calc(base.quoted),
      negotiated: calc(base.negotiated),
      percent: gstPercent,
    };
  }, [items, gstPercent]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (it) =>
        it.item_name?.toLowerCase().includes(q) ||
        it.item_id?.toLowerCase().includes(q) ||
        it.description?.toLowerCase().includes(q),
    );
  }, [items, searchTerm]);

 

  const handlefreeze = async () => {
    setIsFreezing(true);
    try {
      await axios.put(`${API}/bid/freeze/${tender_id}`);
      toast.success("Bid submission locked successfully");
      setbidfreezed(true);
      setShowFreezeModal(false);
    } catch {
      toast.error("Process failed. Please try again.");
    } finally {
      setIsFreezing(false);
    }
  };

  return (
    <div className="font-roboto-flex h-full flex flex-col gap-4 animate-fade-in pb-10">
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <IoSearchOutline
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 outline-none"
            size={18}
          />
          <input
            type="text"
            placeholder="Filter by Name, ID or Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white shadow-sm"
          />
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          {!bidfreezed && (
            <button
              onClick={() => setShowUpload(true)}
              className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-black rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              <ArrowUpRight size={18} />
              Upload BOQ
            </button>
          )}
          <button
            onClick={bidfreezed ? null : () => setShowFreezeModal(true)}
            disabled={items.length === 0 || loading || bidfreezed}
            className={`px-5 py-2.5 text-white text-sm font-black rounded-xl shadow-lg transition-all flex items-center gap-2 ${
              bidfreezed
                ? "bg-emerald-600 shadow-emerald-600/20"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            }`}
          >
            {bidfreezed ? (
              <CircleDollarSign size={18} />
            ) : (
              <GiArrowFlights size={18} />
            )}
            {bidfreezed ? "Submission Locked" : "Freeze Bid"}
          </button>
        </div>
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
          label="Basic Total"
          value={fmt(totals.basic.base)}
          sub="Owner Estimate"
          colorClass="text-blue-600"
          bgColor="bg-blue-50"
        />
        <SummaryCard
          icon={LayoutList}
          label="Quoted Total"
          value={fmt(totals.quoted.base)}
          sub={
            <div className="flex items-center gap-1.5">
              <span>
                {totals.quoted.base > totals.basic.base
                  ? "Above Est."
                  : "Below Est."}
              </span>
              {totals.basic.base > 0 && (
                <span
                  className={
                    totals.quoted.base > totals.basic.base
                      ? "text-rose-600"
                      : "text-emerald-600 truncate"
                  }
                >
                  ( {totals.quoted.base > totals.basic.base ? "+" : ""}
                  {(
                    ((totals.quoted.base - totals.basic.base) /
                      totals.basic.base) *
                    100
                  ).toFixed(1)}
                  % )
                </span>
              )}
            </div>
          }
          colorClass={
            totals.quoted.base > totals.basic.base
              ? "text-amber-600"
              : "text-emerald-600"
          }
          bgColor={
            totals.quoted.base > totals.basic.base
              ? "bg-amber-50"
              : "bg-emerald-50"
          }
        />
        <SummaryCard
          icon={BarChart3}
          label="Negotiated"
          value={fmt(totals.negotiated.base)}
          sub={
            <div className="flex items-center gap-1.5">
              <span>Final Award</span>
              {totals.basic.base > 0 && (
                <span
                  className={
                    totals.negotiated.base > totals.basic.base
                      ? "text-rose-600"
                      : "text-emerald-600"
                  }
                >
                  ( {totals.negotiated.base > totals.basic.base ? "+" : ""}
                  {(
                    ((totals.negotiated.base - totals.basic.base) /
                      totals.basic.base) *
                    100
                  ).toFixed(1)}
                  % )
                </span>
              )}
            </div>
          }
          colorClass="text-indigo-600"
          bgColor="bg-indigo-50"
        />
      </div>

      {/* --- TABLE AREA --- */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col grow">
        {/* Table Controls (Simplified) */}
        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">
            Showing {filteredItems.length} of {items.length} records
          </div>
          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
            GST Applied: {totals.percent}%
          </div>
        </div>

        {/* The Grid - Now with Vertical Scroll Handling */}
        <div className="overflow-auto relative max-h-[70vh] no-scrollbar rounded-b-3xl">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-50">
              <Loader />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-30">
              <Package size={64} className="mb-4" />
              <p className="font-black uppercase tracking-widest">
                No Line Items Found
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-50 shadow-sm">
                {/* Tier 1: Grouping */}
                <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                  <th
                    colSpan={4}
                    className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-0 z-20 bg-gray-100 dark:bg-gray-800"
                  >
                    Item Baseline Information
                  </th>
                  <th
                    colSpan={3}
                    className="px-6 py-4 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30"
                  >
                    Original Basic Details
                  </th>
                  <th
                    colSpan={2}
                    className="px-6 py-4 text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/30"
                  >
                    Quoted Analysis
                  </th>
                  <th
                    colSpan={2}
                    className="px-6 py-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 border-l border-gray-100 dark:border-gray-800"
                  >
                    Negotiated Final
                  </th>
                </tr>
                {/* Tier 2: Details */}
                <tr className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-md">
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 sticky left-0 z-40 bg-white dark:bg-gray-900 w-12 text-center">
                    S.No
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-500 sticky left-12 z-40 bg-white dark:bg-gray-900 w-24">
                    ID
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-500 sticky left-36 z-40 bg-white dark:bg-gray-900 min-w-[200px]">
                    Item Name
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-500 min-w-[100px]">
                    Spec
                  </th>

                  {/* Basic */}
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-blue-600 bg-blue-50/10">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-blue-600 bg-blue-50/10">
                    Rate
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-blue-600 bg-blue-50/10">
                    Amount
                  </th>

                  {/* Quoted */}
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-amber-600 bg-amber-50/10">
                    Rate
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-amber-600 bg-amber-50/10">
                    Amount
                  </th>

                  {/* Negotiated */}
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-indigo-600 bg-indigo-50/10 border-l border-gray-100 dark:border-gray-800">
                    Rate
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-indigo-600 bg-indigo-50/10">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filteredItems.map((item, idx) => {
                  const isDiff =
                    (item.n_amount || 0) !== (item.base_amount || 0);
                  const variance = item.base_amount
                    ? (
                        ((item.n_amount - item.base_amount) /
                          item.base_amount) *
                        100
                      ).toFixed(1)
                    : 0;

                  return (
                    <React.Fragment key={item.item_id || idx}>
                      <tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* S.No */}
                        <td className="px-6 py-5 text-[11px] font-black text-gray-400 sticky left-0 z-10 bg-white dark:bg-gray-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/30 text-center border-r border-gray-50/50 dark:border-gray-800/50 shadow-sm">
                          {idx + 1}
                        </td>
                        {/* ID */}
                        <td className="px-6 py-5 text-xs font-mono font-bold text-slate-500 sticky left-12 z-10 bg-white dark:bg-gray-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/30">
                          {item.item_id}
                        </td>
                        {/* Name */}
                        <td className="px-6 py-5 sticky left-36 z-10 bg-white dark:bg-gray-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/30 hover:z-60 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="relative group/name max-w-[250px]">
                              <span className="text-sm font-black text-gray-800 dark:text-gray-200 min-w-[300px] block truncate">
                                {item.item_name}
                              </span>
                              {/* Sleek Downward Tooltip */}
                              {item.description && (
                                <div className="absolute left-0 top-full mt-2 hidden group-hover/name:block z-100 animate-scaleIn pointer-events-none">
                                  <div className="bg-slate-900 text-white text-[10px] font-medium px-3 py-2 rounded-xl border border-slate-700 shadow-2xl whitespace-normal min-w-[200px] max-w-[350px] leading-relaxed ring-1 ring-white/10">
                                    <span className="block font-black text-blue-400 uppercase text-[9px] mb-1 tracking-widest">
                                      Detail Specification
                                    </span>
                                    {item.description}
                                    <div className="absolute bottom-full left-4 -mb-1 border-4 border-transparent border-b-slate-900" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Unit */}
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-black px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 uppercase tracking-widest italic">
                            {item.unit || "NOS"}
                          </span>
                        </td>

                        {/* Basic Info */}
                        <td className="px-6 py-5 text-sm font-bold text-gray-600 dark:text-gray-400 tabular-nums">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-500 tabular-nums lowercase">
                          {fmt(item.base_rate)}
                        </td>
                        <td className="px-6 py-5 text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">
                          {fmt(item.base_amount)}
                        </td>

                        {/* Quoted */}
                        <td className="px-6 py-5 text-sm font-bold text-slate-500 tabular-nums">
                          {fmt(item.q_rate)}
                        </td>
                        <td className="px-6 py-5 text-sm font-black text-amber-600 tabular-nums">
                          {fmt(item.q_amount)}
                        </td>

                        {/* Negotiated */}
                        <td className="px-6 py-5 text-sm font-bold text-slate-500 tabular-nums border-l border-gray-100 dark:border-gray-800">
                          {fmt(item.n_rate)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                              {fmt(item.n_amount)}
                            </span>
                            {isDiff && Number(variance) !== 0 && (
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                                  Number(variance) > 0
                                    ? "bg-rose-50 text-rose-600"
                                    : "bg-emerald-50 text-emerald-600"
                                }`}
                              >
                                {Number(variance) > 0 ? (
                                  <ArrowUpRight size={10} />
                                ) : (
                                  <ArrowDownRight size={10} />
                                )}
                                {Math.abs(variance)}%
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* Financial Summary Footer - Simplified Design */}
              <tfoot className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/10 dark:bg-gray-800/10">
                <tr className="text-nowrap border-b border-gray-100 dark:border-gray-800/50">
                  <td
                    colSpan={4}
                    className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 sticky left-0 z-20 bg-gray-50 dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700"
                  >
                    Subtotal (Excl. Tax)
                  </td>
                  <td colSpan={2} className="px-6 py-2"></td>
                  <td className="px-6 py-2 text-xs text-blue-600/70 dark:text-blue-400/70 tabular-nums text-right font-bold">
                    {fmt(totals.basic.base)}
                  </td>
                  <td className="px-6 py-2 text-[9px] text-right">
                    {totals.basic.base > 0 && totals.quoted.base > 0 && (
                      <span
                        className={
                          totals.quoted.base > totals.basic.base
                            ? "text-rose-500 font-bold"
                            : "text-emerald-500 font-bold"
                        }
                      >
                        ( {totals.quoted.base > totals.basic.base ? "+" : ""}
                        {(
                          ((totals.quoted.base - totals.basic.base) /
                            totals.basic.base) *
                          100
                        ).toFixed(2)}
                        % )
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-2 text-xs text-amber-600/70 dark:text-amber-400/70 tabular-nums text-right font-bold">
                    {fmt(totals.quoted.base)}
                  </td>
                  <td className="px-6 py-2 border-l border-gray-100 dark:border-gray-700 text-[9px] text-right">
                    {totals.basic.base > 0 && totals.negotiated.base > 0 && (
                      <span
                        className={
                          totals.negotiated.base > totals.basic.base
                            ? "text-rose-500 font-bold"
                            : "text-emerald-500 font-bold"
                        }
                      >
                        ({" "}
                        {totals.negotiated.base > totals.basic.base ? "+" : ""}
                        {(
                          ((totals.negotiated.base - totals.basic.base) /
                            totals.basic.base) *
                          100
                        ).toFixed(1)}
                        % )
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-2 text-xs text-indigo-600/70 dark:text-indigo-400/70 tabular-nums text-right font-bold">
                    {fmt(totals.negotiated.base)}
                  </td>
                </tr>
                <tr className="text-nowrap border-b border-gray-100 dark:border-gray-800/50">
                  <td
                    colSpan={4}
                    className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 sticky left-0 z-20 bg-gray-50 dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700"
                  >
                    Tax (GST {totals.percent}%)
                  </td>
                  <td colSpan={2} className="px-6 py-2"></td>
                  <td className="px-6 py-2 text-xs text-blue-500/50 dark:text-blue-400/50 tabular-nums text-right font-medium italic">
                    {fmt(totals.basic.gst)}
                  </td>
                  <td className="px-6 py-2" />
                  <td className="px-6 py-2 text-xs text-amber-500/50 dark:text-amber-400/50 tabular-nums text-right font-medium italic">
                    {fmt(totals.quoted.gst)}
                  </td>
                  <td className="px-6 py-2 border-l border-gray-100 dark:border-gray-700" />
                  <td className="px-6 py-2 text-xs text-indigo-500/50 dark:text-indigo-400/50 tabular-nums text-right font-medium italic">
                    {fmt(totals.negotiated.gst)}
                  </td>
                </tr>
                <tr className="text-nowrap bg-white dark:bg-gray-900 border-t-2 border-gray-100 dark:border-gray-800">
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-white sticky left-0 z-20 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700"
                  >
                    Grand Total
                  </td>
                  <td colSpan={2} className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400 tabular-nums text-right font-black">
                    {fmt(totals.basic.total)}
                  </td>
                  <td className="px-6 py-4" />
                  <td className="px-6 py-4 text-sm text-amber-600 dark:text-amber-400 tabular-nums text-right font-black">
                    {fmt(totals.quoted.total)}
                  </td>
                  <td className="px-6 py-4 border-l border-gray-100 dark:border-gray-700" />
                  <td className="px-6 py-4 text-sm text-indigo-700 dark:text-indigo-400 tabular-nums text-right font-black">
                    {fmt(totals.negotiated.total)}
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
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-bold transition-all group"
        >
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <MdArrowBackIosNew size={14} />
          </div>
          Back to Boq
        </button>

        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Financial Validity Verified <BarChart3 size={14} />
        </div>
      </div>

      {/* --- MODALS --- */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Action Required
              </h3>
              <button
                onClick={() => setShowFreezeModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
              >
                <IoClose size={22} />
              </button>
            </div>
            <div className="p-10 text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-amber-50 dark:bg-amber-900/20 mb-6">
                <IoAlertCircleOutline className="h-12 w-12 text-amber-600 drop-shadow-sm" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                Finalize Bid?
              </h4>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Reference Identifier
              </p>
              <code className="block bg-slate-100 dark:bg-slate-800 py-3 px-6 rounded-2xl font-mono text-lg font-black tracking-widest mb-6 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                {tender_id}
              </code>
              <div className="bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 p-5 rounded-2xl text-left">
                <p className="text-sm text-slate-600 dark:text-emerald-100/80 leading-relaxed font-medium">
                  Executing this command will{" "}
                  <strong className="text-slate-900 dark:text-white underline decoration-emerald-500/40">
                    permanently lock
                  </strong>{" "}
                  all BOQ items. No further edits allowed.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowFreezeModal(false)}
                className="px-5 py-2 text-sm font-bold text-slate-500 transition-all hover:text-slate-900"
              >
                Go Back
              </button>
              <button
                onClick={handlefreeze}
                disabled={isFreezing}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                {isFreezing ? "Processing..." : "Confirm & Freeze"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <UploadBid
          onclose={() => setShowUpload(false)}
          onSuccess={fetchBoqItems}
        />
      )}
    </div>
  );
};

export default Bid;

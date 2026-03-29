import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Search, RefreshCw, TrendingUp,
  AlertCircle, Building2, Users,
  ChevronRight, ArrowUpRight, ArrowDownLeft,
  BarChart3, Filter,
} from "lucide-react";
import { useLedgerSummary } from "./hooks/useLedger";
import Loader from "../../../components/Loader";

/* ── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ── Balance chip ────────────────────────────────────────────────────────── */
const BalanceChip = ({ balance }) => {
  if (balance === 0)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        NIL
      </span>
    );
  if (balance > 0)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800">
        <ArrowUpRight size={10} />
        ₹{fmt(balance)} Cr
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
      <ArrowDownLeft size={10} />
      ₹{fmt(Math.abs(balance))} Dr
    </span>
  );
};

/* ── Summary card ────────────────────────────────────────────────────────── */
const SummaryCard = ({ icon, label, value, sub, color }) => {
  const c = {
    red:     { wrap: "bg-red-50 dark:bg-red-900/20",     icon: "text-red-600 dark:text-red-400",     val: "text-red-700 dark:text-red-300",     border: "border-red-100 dark:border-red-800/50" },
    blue:    { wrap: "bg-blue-50 dark:bg-blue-900/20",   icon: "text-blue-600 dark:text-blue-400",   val: "text-blue-700 dark:text-blue-300",   border: "border-blue-100 dark:border-blue-800/50" },
    amber:   { wrap: "bg-amber-50 dark:bg-amber-900/20", icon: "text-amber-600 dark:text-amber-400", val: "text-amber-700 dark:text-amber-300", border: "border-amber-100 dark:border-amber-800/50" },
    slate:   { wrap: "bg-slate-100 dark:bg-slate-800",   icon: "text-slate-600 dark:text-slate-400", val: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" },
  }[color] || {};
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${c.border} p-4 flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${c.wrap} shrink-0`}>
        <span className={c.icon}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-extrabold mt-0.5 tabular-nums ${c.val}`}>{value}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const LedgerEntry = () => {
  const navigate = useNavigate();

  const [supplierType, setSupplierType]       = useState(""); // "" | "Vendor" | "Contractor"
  const [onlyOutstanding, setOnlyOutstanding] = useState(false);
  const [search, setSearch]                   = useState("");

  const queryParams = useMemo(() => {
    const p = {};
    if (supplierType)    p.supplier_type     = supplierType;
    if (onlyOutstanding) p.only_outstanding  = "true";
    return p;
  }, [supplierType, onlyOutstanding]);

  const { data: summary = [], isLoading, isFetching, refetch } = useLedgerSummary(queryParams);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    if (!search) return summary;
    const q = search.toLowerCase();
    return summary.filter(
      s =>
        (s.supplier_name || "").toLowerCase().includes(q) ||
        (s.supplier_id   || "").toLowerCase().includes(q),
    );
  }, [summary, search]);

  /* ── Totals ── */
  const totalOutstanding = useMemo(
    () => summary.filter(s => s.balance > 0).reduce((a, s) => a + s.balance, 0),
    [summary],
  );
  const vendorCount      = summary.filter(s => s.supplier_type === "Vendor").length;
  const contractorCount  = summary.filter(s => s.supplier_type === "Contractor").length;
  const zeroBalanceCount = summary.filter(s => s.balance === 0).length;

  return (
    <div className="font-roboto-flex min-h-screen bg-gray-50 dark:bg-[#0b0f19] pb-24">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <BookOpen size={17} className="text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                Ledger
              </h1>
              <p className="text-xs text-gray-400 mt-1 leading-none">
                Finance · Supplier Outstanding Register
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Only Outstanding toggle */}
            <button
              onClick={() => setOnlyOutstanding(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                onlyOutstanding
                  ? "bg-red-600 border-red-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400"
              }`}
            >
              <AlertCircle size={13} />
              Outstanding Only
            </button>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <SummaryCard
            icon={<BarChart3 size={20} />}
            color="red"
            label="Total Outstanding"
            value={`₹${fmt(totalOutstanding)}`}
            sub="payable to suppliers"
          />
          <SummaryCard
            icon={<TrendingUp size={20} />}
            color="slate"
            label="Total Suppliers"
            value={summary.length}
            sub="in ledger"
          />
          <SummaryCard
            icon={<Building2 size={20} />}
            color="blue"
            label="Vendors"
            value={vendorCount}
            sub="with ledger entries"
          />
          <SummaryCard
            icon={<Users size={20} />}
            color="amber"
            label="Contractors"
            value={contractorCount}
            sub={`${zeroBalanceCount} fully settled`}
          />
        </div>

        {/* ── Filter bar ── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3.5 mb-4 flex items-center gap-3 flex-wrap relative z-10">
          <Filter size={14} className="text-gray-400 shrink-0" />

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search supplier name or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>

          {/* Supplier type pills */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
            {[["", "All"], ["Vendor", "Vendors"], ["Contractor", "Contractors"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSupplierType(val)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  supplierType === val
                    ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <BookOpen size={44} className="opacity-20" />
            <p className="text-sm font-semibold">
              {summary.length === 0 ? "No ledger entries yet." : "No suppliers match current filters."}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {["#", "Supplier", "Type", "Last Transaction", "Total Credit (Cr)", "Total Debit (Dr)", "Net Balance", ""].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filtered.map((s, i) => (
                    <tr
                      key={s.supplier_id}
                      onClick={() =>
                        navigate(`/finance/ledgerentry/viewledgerentry/${s.supplier_id}`, {
                          state: { supplier: s },
                        })
                      }
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5 text-xs text-gray-400">{i + 1}</td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            s.supplier_type === "Vendor"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}>
                            {(s.supplier_name || s.supplier_id || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                              {s.supplier_name || "—"}
                            </p>
                            <code className="text-[10px] text-gray-400 font-mono">{s.supplier_id}</code>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.supplier_type === "Vendor"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                        }`}>
                          {s.supplier_type || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {fmtDate(s.last_txn_date)}
                      </td>

                      {/* Credit column — liability (what you owe) */}
                      <td className="px-4 py-3.5 tabular-nums text-right">
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          ₹{fmt(s.total_credit)}
                        </span>
                      </td>

                      {/* Debit column — what has been cleared */}
                      <td className="px-4 py-3.5 tabular-nums text-right">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{fmt(s.total_debit)}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-3.5 text-right">
                        <BalanceChip balance={s.balance} />
                      </td>

                      <td className="px-4 py-3.5">
                        <ChevronRight size={15} className="text-gray-300 group-hover:text-slate-500 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 bg-gray-50/40 dark:bg-gray-800/20">
              <span>
                Showing <strong className="text-gray-600 dark:text-gray-300">{filtered.length}</strong> of{" "}
                <strong className="text-gray-600 dark:text-gray-300">{summary.length}</strong> suppliers
                <span className="ml-2 text-gray-300">· Click a row to open full ledger</span>
              </span>
              <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                Total Outstanding: ₹{fmt(totalOutstanding)}
              </span>
            </div>
          </div>
        )}

        {/* ── Accounting note ── */}
        <div className="mt-4 flex items-start gap-2 text-[11px] text-gray-400 dark:text-gray-500">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>
            <strong className="text-red-500">Cr balance</strong> = you owe the supplier (outstanding payable).{" "}
            <strong className="text-blue-500">Dr balance</strong> = supplier owes you (overpayment / excess credit note).{" "}
            Entries are auto-posted when vouchers are approved — this register is read-only.
          </span>
        </div>
      </div>
    </div>
  );
};

export default LedgerEntry;

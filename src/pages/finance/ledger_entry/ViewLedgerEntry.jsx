import { useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Calendar, RefreshCw,
  ChevronDown, ChevronUp, AlertCircle,
  Building2, TrendingUp, TrendingDown,
  FileText, Printer,
} from "lucide-react";
import { useSupplierLedger, useSupplierBalance, useSupplierStatement } from "./hooks/useLedger";

/* ── Helpers ────────────────────────────────────────────────────────────── */
const fmtMoney = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

const FY_RANGES = [
  { label: "FY 2024-25", from: "2024-04-01", to: "2025-03-31" },
  { label: "FY 2025-26", from: "2025-04-01", to: "2026-03-31" },
  { label: "FY 2026-27", from: "2026-04-01", to: "2027-03-31" },
];

/* ── Voucher type meta ───────────────────────────────────────────────────── */
const VCH_META = {
  PurchaseBill: { label: "Purchase Bill", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",   dot: "bg-blue-500"   },
  WeeklyBill:   { label: "Weekly Bill",   color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400", dot: "bg-indigo-500" },
  CreditNote:   { label: "Credit Note",   color: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",   dot: "bg-teal-500"   },
  DebitNote:    { label: "Debit Note",    color: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400", dot: "bg-violet-500" },
  Payment:      { label: "Payment",       color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", dot: "bg-emerald-500" },
  Receipt:      { label: "Receipt",       color: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400",       dot: "bg-sky-500"    },
  Journal:      { label: "Journal",       color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", dot: "bg-slate-500"  },
};
const VCH_TYPES = Object.keys(VCH_META);

/* ── VCH badge ───────────────────────────────────────────────────────────── */
const VchBadge = ({ type }) => {
  const m = VCH_META[type] || VCH_META.Journal;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

/* ── Balance display with Dr/Cr indicator ────────────────────────────────── */
const BalanceDisplay = ({ balance }) => {
  if (balance === 0)
    return <span className="tabular-nums font-semibold text-gray-400 text-xs">NIL</span>;
  if (balance > 0)
    return (
      <span className="tabular-nums font-bold text-red-600 dark:text-red-400 text-xs">
        {fmtMoney(balance)}{" "}
        <span className="text-[9px] font-extrabold uppercase tracking-wider">Cr</span>
      </span>
    );
  return (
    <span className="tabular-nums font-bold text-blue-600 dark:text-blue-400 text-xs">
      {fmtMoney(Math.abs(balance))}{" "}
      <span className="text-[9px] font-extrabold uppercase tracking-wider">Dr</span>
    </span>
  );
};

/* ── Statement breakdown card ────────────────────────────────────────────── */
const StatementBreakdown = ({ statement, isOpen, onToggle }) => {
  if (!statement) return null;

  const rows = [
    { label: "Purchase Bills",  key: "PurchaseBill", sign: +1, colorCr: "text-red-600 dark:text-red-400"     },
    { label: "Weekly Bills",    key: "WeeklyBill",   sign: +1, colorCr: "text-red-600 dark:text-red-400"     },
    { label: "Credit Notes",    key: "CreditNote",   sign: -1, colorDr: "text-emerald-600 dark:text-emerald-400" },
    { label: "Debit Notes",     key: "DebitNote",    sign: -1, colorDr: "text-emerald-600 dark:text-emerald-400" },
    { label: "Payments Made",   key: "Payment",      sign: -1, colorDr: "text-emerald-600 dark:text-emerald-400" },
    { label: "Receipts",        key: "Receipt",      sign: -1, colorDr: "text-emerald-600 dark:text-emerald-400" },
    { label: "Journal Entries", key: "Journal",      sign:  0 },
  ];

  const getBreakdown = (vchType) =>
    statement.breakdown?.find(b => b.vch_type === vchType) || null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-4">
      <button
        onClick={onToggle}
        className="w-full px-5 py-3 flex items-center justify-between bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 bg-slate-700 rounded-md flex items-center justify-center">
            <TrendingUp size={13} className="text-white" />
          </span>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
            Account Statement — Breakdown by Voucher Type
          </span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {isOpen && (
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Document Type</th>
                  <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Count</th>
                  <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-red-400">Credit (Cr)</th>
                  <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-500">Debit (Dr)</th>
                  <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Net Effect</th>
                  <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Last Entry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {rows.map(({ key }) => {
                  const b = getBreakdown(key);
                  if (!b) return null;
                  const netPositive = b.net > 0;
                  return (
                    <tr key={key} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30">
                      <td className="py-2.5 px-3">
                        <VchBadge type={key} />
                      </td>
                      <td className="py-2.5 px-3 text-center text-xs text-gray-500 tabular-nums">{b.count}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-sm">
                        {b.total_credit > 0
                          ? <span className="font-semibold text-red-600 dark:text-red-400">₹{fmtMoney(b.total_credit)}</span>
                          : <span className="text-gray-300 dark:text-gray-600">—</span>
                        }
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-sm">
                        {b.total_debit > 0
                          ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{fmtMoney(b.total_debit)}</span>
                          : <span className="text-gray-300 dark:text-gray-600">—</span>
                        }
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-sm">
                        <span className={`font-bold ${netPositive ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {netPositive ? "+" : ""}₹{fmtMoney(Math.abs(b.net))}
                          <span className="text-[9px] ml-1 font-extrabold uppercase">{netPositive ? "Cr" : "Dr"}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-xs text-gray-400">{fmtDate(b.last_date)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Net Outstanding Balance
                  </td>
                  <td className="py-3 px-3 text-right">
                    <BalanceDisplay balance={statement.balance} />
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const ViewLedgerEntry = () => {
  const { supplierId } = useParams();
  const location       = useLocation();
  const navigate       = useNavigate();

  /* Restore supplier info from navigation state if available */
  const navSupplier = location.state?.supplier || null;

  /* ── Filters ── */
  const [fromDate, setFromDate]         = useState("");
  const [toDate, setToDate]             = useState("");
  const [vchTypeFilter, setVchTypeFilter] = useState("");
  const [showStatement, setShowStatement] = useState(true);

  const ledgerParams = useMemo(() => {
    const p = {};
    if (fromDate)      p.from_date = fromDate;
    if (toDate)        p.to_date   = toDate;
    if (vchTypeFilter) p.vch_type  = vchTypeFilter;
    if (navSupplier?.supplier_type) p.supplier_type = navSupplier.supplier_type;
    return p;
  }, [fromDate, toDate, vchTypeFilter, navSupplier?.supplier_type]);

  const { data: balance,   isLoading: balanceLoading, refetch: refetchBalance } = useSupplierBalance(supplierId, navSupplier?.supplier_type ? { supplier_type: navSupplier.supplier_type } : {});
  const { data: entries = [], isLoading: entriesLoading, isFetching, refetch: refetchEntries } = useSupplierLedger(supplierId, ledgerParams);
  const { data: statement, isLoading: statementLoading }  = useSupplierStatement(supplierId, navSupplier?.supplier_type ? { supplier_type: navSupplier.supplier_type } : {});

  const isLoading = balanceLoading || entriesLoading;

  /* ── Supplier info (prefer live balance data) ── */
  const supplier = balance || navSupplier || {};

  /* ── Computed totals from visible entries ── */
  const periodTotals = useMemo(() => {
    const txnEntries = entries.filter(e => !e.is_opening_balance);
    return {
      totalDr: txnEntries.reduce((s, e) => s + (e.debit_amt  || 0), 0),
      totalCr: txnEntries.reduce((s, e) => s + (e.credit_amt || 0), 0),
    };
  }, [entries]);

  const closingBalance = entries.length > 0 ? entries[entries.length - 1]?.balance ?? 0 : (balance?.balance ?? 0);

  const handleRefresh = () => { refetchBalance(); refetchEntries(); };

  const applyFY = (fy) => {
    setFromDate(fy.from);
    setToDate(fy.to);
  };

  const clearPeriod = () => { setFromDate(""); setToDate(""); };

  return (
    <div className="font-roboto-flex min-h-screen bg-gray-50 dark:bg-[#0b0f19] pb-24">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-4">
          <button
            onClick={() => navigate("/finance/ledgerentry")}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center gap-3 flex-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
              supplier.supplier_type === "Vendor"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}>
              {(supplier.supplier_name || supplierId || "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                {supplier.supplier_name || supplierId}
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 leading-none">
                <code className="font-mono">{supplierId}</code>
                {supplier.supplier_type && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span>{supplier.supplier_type}</span>
                  </>
                )}
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <BookOpen size={10} />
                Ledger Account
              </p>
            </div>
          </div>

          {/* Current balance badge */}
          {!balanceLoading && balance && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${
              balance.balance > 0
                ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30"
                : balance.balance < 0
                  ? "bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30"
                  : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
            }`}>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Current Balance
              </span>
              <BalanceDisplay balance={balance.balance} />
            </div>
          )}

          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>

          <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <Printer size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5">

        {/* ── Supplier Info Cards ── */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            {
              label: "Total Billed",
              value: `₹${fmtMoney(balance?.total_credit || 0)}`,
              sub:   "purchase + weekly bills",
              icon:  <TrendingUp size={18} />,
              cls:   "text-red-600 dark:text-red-400",
              bg:    "bg-red-50 dark:bg-red-900/20",
            },
            {
              label: "Total Cleared",
              value: `₹${fmtMoney(balance?.total_debit || 0)}`,
              sub:   "CN + DN + payments",
              icon:  <TrendingDown size={18} />,
              cls:   "text-emerald-600 dark:text-emerald-400",
              bg:    "bg-emerald-50 dark:bg-emerald-900/20",
            },
            {
              label: "Net Outstanding",
              value: balance?.balance > 0 ? `₹${fmtMoney(balance.balance)}` : balance?.balance < 0 ? `₹${fmtMoney(Math.abs(balance?.balance || 0))}` : "NIL",
              sub:   balance?.balance > 0 ? "Cr — you owe supplier" : balance?.balance < 0 ? "Dr — supplier owes you" : "fully settled",
              icon:  <BookOpen size={18} />,
              cls:   balance?.balance > 0 ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400",
              bg:    balance?.balance > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              label: "Transactions",
              value: entries.filter(e => !e.is_opening_balance).length,
              sub:   fromDate ? `${fmtDate(fromDate)} – ${fmtDate(toDate)}` : "all time",
              icon:  <FileText size={18} />,
              cls:   "text-slate-600 dark:text-slate-400",
              bg:    "bg-slate-100 dark:bg-slate-800",
            },
          ].map(c => (
            <div key={c.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
              <div className={`p-2.5 rounded-xl ${c.bg} shrink-0`}>
                <span className={c.cls}>{c.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{c.label}</p>
                <p className={`text-base font-extrabold mt-0.5 tabular-nums ${c.cls}`}>{c.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Statement Breakdown ── */}
        {!statementLoading && (
          <StatementBreakdown
            statement={statement}
            isOpen={showStatement}
            onToggle={() => setShowStatement(v => !v)}
          />
        )}

        {/* ── Period & Filter controls ── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 mb-4 space-y-3 relative z-10">
          {/* FY quick picks */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <Calendar size={12} />
              Period
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {FY_RANGES.map(fy => (
                <button
                  key={fy.label}
                  onClick={() => applyFY(fy)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    fromDate === fy.from && toDate === fy.to
                      ? "bg-slate-800 dark:bg-slate-600 border-slate-800 dark:border-slate-600 text-white shadow-sm"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400"
                  }`}
                >
                  {fy.label}
                </button>
              ))}
              {(fromDate || toDate) && (
                <button
                  onClick={clearPeriod}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:text-red-500 hover:border-red-300 transition-all"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Custom date range */}
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Voucher type filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Voucher Type</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setVchTypeFilter("")}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                  vchTypeFilter === ""
                    ? "bg-slate-800 dark:bg-slate-600 border-slate-800 text-white"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400"
                }`}
              >
                All
              </button>
              {VCH_TYPES.map(t => {
                const m = VCH_META[t];
                return (
                  <button
                    key={t}
                    onClick={() => setVchTypeFilter(t === vchTypeFilter ? "" : t)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                      vchTypeFilter === t
                        ? `${m.color} border-current shadow-sm`
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── THE LEDGER TABLE ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <span className="animate-spin h-9 w-9 border-[3px] border-slate-500 border-t-transparent rounded-full" />
            <p className="text-sm font-medium">Loading ledger entries…</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">

            {/* Ledger header bar */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                  Ledger Account
                </span>
                {(fromDate || toDate) && (
                  <span className="text-[10px] text-gray-400 font-medium ml-2">
                    {fromDate ? `From ${fmtDate(fromDate)}` : ""}
                    {fromDate && toDate ? " to " : ""}
                    {toDate ? fmtDate(toDate) : ""}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400">
                {entries.filter(e => !e.is_opening_balance).length} transaction{entries.filter(e => !e.is_opening_balance).length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Supplier name header (classic ledger style) */}
            <div className="px-6 py-3 border-b border-dashed border-gray-200 dark:border-gray-700 bg-slate-800 dark:bg-slate-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Account Name</p>
                <p className="text-sm font-bold mt-0.5">{supplier.supplier_name || supplierId}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Account ID</p>
                <code className="text-sm font-bold mt-0.5 font-mono">{supplierId}</code>
              </div>
            </div>

            {entries.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-semibold">No entries for the selected period.</p>
                {(fromDate || toDate || vchTypeFilter) && (
                  <button
                    onClick={() => { clearPeriod(); setVchTypeFilter(""); }}
                    className="mt-2 text-xs text-slate-600 dark:text-slate-400 underline underline-offset-2"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  {/* Classic double-entry ledger columns */}
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-28">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Particulars
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-32">
                        Vch Type
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-36">
                        Vch No.
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 w-36">
                        Debit (Dr)
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-red-500 dark:text-red-400 w-36">
                        Credit (Cr)
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-40">
                        Balance
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {entries.map((entry, i) => {
                      const isOB    = entry.is_opening_balance;
                      const isCr = entry.credit_amt > 0;

                      /* Opening Balance B/F row */
                      if (isOB) {
                        return (
                          <tr key={`ob-${i}`} className="bg-amber-50/60 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30">
                            <td className="px-4 py-3 text-xs text-amber-700 dark:text-amber-400 font-semibold whitespace-nowrap">
                              {fmtDate(entry.vch_date)}
                            </td>
                            <td className="px-4 py-3" colSpan={3}>
                              <span className="italic text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">B/F</span>
                                Opening Balance — brought forward from prior period
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-xs">
                              {entry.debit_amt > 0
                                ? <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{fmtMoney(entry.debit_amt)}</span>
                                : <span className="text-gray-300 dark:text-gray-600">—</span>
                              }
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-xs">
                              {entry.credit_amt > 0
                                ? <span className="font-bold text-red-600 dark:text-red-400">₹{fmtMoney(entry.credit_amt)}</span>
                                : <span className="text-gray-300 dark:text-gray-600">—</span>
                              }
                            </td>
                            <td className="px-4 py-3 text-right">
                              <BalanceDisplay balance={entry.balance} />
                            </td>
                          </tr>
                        );
                      }

                      /* Regular transaction row */
                      return (
                        <tr
                          key={entry._id || i}
                          className={`border-b border-gray-50 dark:border-gray-800/60 transition-colors ${
                            isCr
                              ? "hover:bg-red-50/20 dark:hover:bg-red-900/5"
                              : "hover:bg-emerald-50/20 dark:hover:bg-emerald-900/5"
                          }`}
                        >
                          {/* Date */}
                          <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {fmtDate(entry.vch_date)}
                          </td>

                          {/* Particulars */}
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-100 text-sm leading-tight">
                                {entry.particulars || "—"}
                              </p>
                              {entry.tender_id && (
                                <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                  <Building2 size={9} />
                                  <code className="font-mono">{entry.tender_id}</code>
                                  {entry.tender_name && (
                                    <span className="truncate max-w-[160px]">— {entry.tender_name}</span>
                                  )}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Vch Type */}
                          <td className="px-4 py-3.5">
                            <VchBadge type={entry.vch_type} />
                          </td>

                          {/* Vch No. */}
                          <td className="px-4 py-3.5">
                            {entry.vch_no ? (
                              <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                {entry.vch_no}
                              </code>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Debit column — clearances (green) */}
                          <td className="px-4 py-3.5 text-right tabular-nums">
                            {entry.debit_amt > 0 ? (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                ₹{fmtMoney(entry.debit_amt)}
                              </span>
                            ) : (
                              <span className="text-gray-200 dark:text-gray-700 text-xs select-none">—</span>
                            )}
                          </td>

                          {/* Credit column — liabilities (red) */}
                          <td className="px-4 py-3.5 text-right tabular-nums">
                            {entry.credit_amt > 0 ? (
                              <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                                ₹{fmtMoney(entry.credit_amt)}
                              </span>
                            ) : (
                              <span className="text-gray-200 dark:text-gray-700 text-xs select-none">—</span>
                            )}
                          </td>

                          {/* Running Balance */}
                          <td className="px-4 py-3.5 text-right">
                            <BalanceDisplay balance={entry.balance} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Period totals + closing balance */}
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
                      <td colSpan={4} className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {fromDate ? "Period Totals" : "Grand Totals"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹{fmtMoney(periodTotals.totalDr)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="font-extrabold text-red-600 dark:text-red-400">
                          ₹{fmtMoney(periodTotals.totalCr)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <BalanceDisplay balance={closingBalance} />
                      </td>
                    </tr>

                    {/* Closing Balance C/F row */}
                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                      <td className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {fromDate ? fmtDate(toDate || new Date().toISOString()) : "Closing"}
                      </td>
                      <td colSpan={5} className="px-4 py-2.5">
                        <span className="text-xs font-bold text-slate-300 italic flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider bg-slate-600 px-1.5 py-0.5 rounded">C/F</span>
                          Closing Balance — carried forward
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <BalanceDisplay balance={closingBalance} />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Accounting legend ── */}
        <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Accounting Reference</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { type: "PurchaseBill", effect: "Cr — increases your payable (you owe more)" },
              { type: "CreditNote",   effect: "Dr — reduces your payable (material return, discount)" },
              { type: "DebitNote",    effect: "Dr — reduces your payable (penalty, price diff)" },
              { type: "Payment",      effect: "Dr — clears outstanding payable (money sent)" },
            ].map(({ type, effect }) => (
              <div key={type} className="flex flex-col gap-1.5 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                <VchBadge type={type} />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">{effect}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1.5">
            <AlertCircle size={11} className="shrink-0" />
            This register is read-only. Entries are automatically posted when vouchers (Purchase Bill, Payment Voucher, Credit/Debit Note) are approved.
            <strong className="text-red-500 ml-1">Cr balance</strong> = you owe the supplier.
            <strong className="text-blue-500 ml-1">Dr balance</strong> = supplier owes you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewLedgerEntry;

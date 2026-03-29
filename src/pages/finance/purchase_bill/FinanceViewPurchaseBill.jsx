import { useState, useMemo } from "react";
import { ChevronDown, RefreshCw, FileText, Search, SlidersHorizontal, X, Link2, Truck } from "lucide-react";
import { useBillsByTender } from "../../purchase/purchase bill/hooks/usePurchaseBill";
import SearchableSelect from "../../../components/SearchableSelect";
import Loader from "../../../components/Loader";

/* ─── Formatters ─────────────────────────────────────────────── */
const fmt = (n) =>
  n != null
    ? "₹\u202f" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "₹\u202f0.00";

const fmtCompact = (n) => {
  if (n == null || n === 0) return "₹\u202f0";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹\u202f${(n / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹\u202f${(n / 1e5).toFixed(2)} L`;
  return "₹\u202f" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_CFG = {
  draft:    { dot: "bg-slate-400",    ring: "ring-slate-200 dark:ring-slate-700",   border: "border-l-slate-400",    header: "from-slate-50 dark:from-slate-800/60",  badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700", label: "Draft" },
  pending:  { dot: "bg-amber-500",    ring: "ring-amber-200 dark:ring-amber-800",   border: "border-l-amber-500",    header: "from-amber-50 dark:from-amber-900/40",  badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700", label: "Pending" },
  approved: { dot: "bg-blue-500",     ring: "ring-blue-200 dark:ring-blue-800",     border: "border-l-blue-500",     header: "from-blue-50 dark:from-blue-900/40",    badge: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700", label: "Approved" },
  paid:     { dot: "bg-emerald-600",  ring: "ring-emerald-200 dark:ring-emerald-800",border:"border-l-emerald-600",  header: "from-emerald-50 dark:from-emerald-900/40",badge:"bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700", label: "Paid" },
};

const Badge = ({ value, cls }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${cls || "bg-gray-100 text-gray-500 border-gray-200"}`}>
    {value ?? "-"}
  </span>
);

/* ─── Mini Table Helpers ─────────────────────────────────────── */
const MiniTable = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
    <table className="w-full text-[11px]">
      <thead>
        <tr className="bg-gray-100/50 dark:bg-gray-800/50">
          {headers.map((h) => (
            <th key={h} className="px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap border-b border-gray-200 dark:border-gray-700">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-transparent divide-y divide-gray-100 dark:divide-gray-800">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} className="px-2.5 py-3 text-center text-[11px] text-gray-400 italic">
              No data
            </td>
          </tr>
        ) : (
          rows.map((cells, ri) => (
            <tr key={ri} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
              {cells.map((cell, ci) => (
                <td key={ci} className="px-2.5 py-2 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const DetailSection = ({ icon, title, count, children }) => (
  <div className="col-span-1">
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</span>
      {count !== undefined && count !== null && (
        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200/50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 tabular-nums">
          {count}
        </span>
      )}
    </div>
    {count === 0 ? (
      <p className="text-[11px] text-gray-400 italic">None</p>
    ) : (
      children
    )}
  </div>
);

/* ─── Bill Card ──────────────────────────────────────────────── */
const PurchaseBillCard = ({ item, isLast }) => {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[item.status] || STATUS_CFG.pending;

  const addlNet = (item.additional_charges || []).reduce(
    (s, c) => s + (c.is_deduction ? -(c.net || 0) : (c.net || 0)), 0
  );

  return (
    <div className="relative flex gap-3 sm:gap-5">
      <div className="flex flex-col items-center pt-4">
        <div className={`w-3.5 h-3.5 rounded-full ${cfg.dot} border-2 border-white dark:border-gray-950 shadow ring-2 ${cfg.ring} shrink-0 z-10`} />
        {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-800 mt-1.5" />}
      </div>

      <div className="flex-1 mb-6">
        <div className={`rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border-l-4 ${cfg.border}`}>
          
          <div className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${cfg.header} to-transparent border-b border-gray-100 dark:border-gray-700/60`}>
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                {item.doc_id}
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-white tracking-tight">{item.invoice_no || "No Invoice"}</span>
              <span className="hidden sm:inline text-[11px] text-gray-400 font-medium">{fmtDate(item.doc_date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge value={cfg.label} cls={cfg.badge} />
            </div>
          </div>

          <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-2">
              <Truck size={13} className="text-gray-400 shrink-0" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{item.vendor_name ?? "—"}</span>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 rounded">{item.vendor_gstin}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold">
              <span className={`px-1.5 py-0.5 rounded ${item.tax_mode === "instate" ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"}`}>
                {item.tax_mode === "instate" ? "IN-STATE" : "INTER-STATE"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-700/60">
            {[
              { label: "Base Amount", value: fmtCompact(item.grand_total),  full: fmt(item.grand_total),  cls: "text-gray-800 dark:text-white" },
              { label: "Tax",         value: fmtCompact(item.total_tax),    full: fmt(item.total_tax),    cls: "text-indigo-600 dark:text-indigo-400" },
              { label: "Others",      value: fmtCompact(Math.abs(addlNet)), full: (addlNet < 0 ? "-" : "") + fmt(Math.abs(addlNet)), cls: addlNet === 0 ? "text-gray-400" : addlNet < 0 ? "text-red-500" : "text-emerald-500" },
              { label: "Net Payable", value: fmtCompact(item.net_amount),   full: fmt(item.net_amount),   cls: "text-emerald-600 dark:text-emerald-400" },
            ].map(({ label, value, full, cls }) => (
              <div key={label} className="px-3 py-3 text-center group/cell relative">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className={`text-sm font-bold tabular-nums leading-tight ${cls}`} title={full}>{value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-t border-gray-100 dark:border-gray-700/60"
          >
            {open ? <ChevronDown size={14} className="rotate-180 transition-transform" /> : <ChevronDown size={14} className="transition-transform" />}
            <span className="font-medium">{open ? "Hide Details" : "Show Details"}</span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[2000px]" : "max-h-0"}`}>
            <div className="px-5 py-4 flex flex-col gap-5 bg-gray-50/60 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700/60">
               
              <DetailSection icon={<Link2 size={13} />} title="Line Items" count={item.line_items?.length}>
                {item.tax_mode === "instate" ? (
                  <MiniTable
                    headers={["Item", "Unit", "Qty", "Rate", "Gross", "CGST%", "CGST Amt", "SGST%", "SGST Amt", "Net Amt"]}
                    rows={(item.line_items || []).map((it) => [
                      <span key="i" className="font-medium text-gray-800 dark:text-gray-100">{it.item_description}</span>,
                      it.unit || "—",
                      <span key="q" className="tabular-nums">{it.accepted_qty}</span>,
                      `₹${fmt(it.unit_price)}`,
                      `₹${fmt(it.gross_amt)}`,
                      `${it.cgst_pct ?? 0}%`,
                      `₹${fmt(it.cgst_amt)}`,
                      `${it.sgst_pct ?? 0}%`,
                      `₹${fmt(it.sgst_amt)}`,
                      <span key="n" className="tabular-nums font-semibold text-gray-900 dark:text-white">₹{fmt(it.net_amt)}</span>,
                    ])}
                  />
                ) : (
                  <MiniTable
                    headers={["Item", "Unit", "Qty", "Rate", "Gross", "IGST%", "IGST Amt", "Net Amt"]}
                    rows={(item.line_items || []).map((it) => [
                      <span key="i" className="font-medium text-gray-800 dark:text-gray-100">{it.item_description}</span>,
                      it.unit || "—",
                      <span key="q" className="tabular-nums">{it.accepted_qty}</span>,
                      `₹${fmt(it.unit_price)}`,
                      `₹${fmt(it.gross_amt)}`,
                      `${it.igst_pct ?? 0}%`,
                      `₹${fmt(it.igst_amt)}`,
                      <span key="n" className="tabular-nums font-semibold text-gray-900 dark:text-white">₹{fmt(it.net_amt)}</span>,
                    ])}
                  />
                )}
              </DetailSection>

              {(item.grn_rows?.length > 0) && (
                <DetailSection icon={<Link2 size={13} />} title="GRN References" count={item.grn_rows?.length}>
                  <MiniTable
                    headers={["GRN No.", "Date", "GRN Qty"]}
                    rows={(item.grn_rows || []).map((g) => [
                      <code key="g" className="font-mono text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">{g.grn_no}</code>,
                      fmtDate(g.ref_date),
                      <span key="q" className="tabular-nums font-semibold text-gray-800 dark:text-gray-100">{g.grn_qty}</span>,
                    ])}
                  />
                </DetailSection>
              )}

              {(item.additional_charges?.length > 0) && (
                <DetailSection icon={<Truck size={13} />} title="Additional Charges" count={item.additional_charges?.length}>
                  <MiniTable
                    headers={["Type", "Amount", "GST%", "Net", "Deduction"]}
                    rows={(item.additional_charges || []).map((c) => [
                      c.type,
                      `₹${fmt(c.amount)}`,
                      `${c.gst_pct}%`,
                      <span key="n" className={`tabular-nums font-semibold ${c.is_deduction ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {c.is_deduction ? "−" : "+"}₹{fmt(c.net)}
                      </span>,
                      c.is_deduction
                        ? <span key="d" className="text-red-500 text-[10px] font-semibold bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">Yes</span>
                        : <span key="d" className="text-gray-400 text-[10px]">No</span>,
                    ])}
                  />
                </DetailSection>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 20;

/* ═══════════════════════════════════════════════════════════════════════════ */
const FinanceViewPurchaseBill = ({ tenderId }) => {
  /* filters */
  const [search,     setSearch]     = useState("");
  const [statusTab,  setStatusTab]  = useState("");
  const [fromDate,   setFromDate]   = useState("");
  const [toDate,     setToDate]     = useState("");
  const [vendorQ,    setVendorQ]    = useState("");
  const [docIdQ,     setDocIdQ]     = useState("");
  const [invoiceQ,   setInvoiceQ]   = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [page,       setPage]       = useState(1);

  const { data: bills = [], isLoading, isFetching, refetch } = useBillsByTender(tenderId);

  /* derived vendor list for dropdown */
  const vendors = useMemo(
    () => [...new Map(bills.map((b) => [b.vendor_id, b.vendor_name])).entries()]
            .map(([id, name]) => ({ id, name })),
    [bills],
  );

  /* client-side filtering */
  const filtered = useMemo(() => {
    const q         = search.toLowerCase();
    const fromTs    = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0)    : null;
    const toTs      = toDate   ? new Date(toDate).setHours(23, 59, 59, 999) : null;

    return bills.filter((b) => {
      if (statusTab && b.status !== statusTab) return false;

      const docDate = b.doc_date ? new Date(b.doc_date).getTime() : null;
      if (fromTs && docDate && docDate < fromTs) return false;
      if (toTs   && docDate && docDate > toTs)   return false;

      if (vendorQ  && b.vendor_id   !== vendorQ)                                       return false;
      if (docIdQ   && !b.doc_id?.toLowerCase().includes(docIdQ.toLowerCase()))         return false;
      if (invoiceQ && !b.invoice_no?.toLowerCase().includes(invoiceQ.toLowerCase()))   return false;

      if (q) {
        return (
          b.doc_id?.toLowerCase().includes(q)      ||
          b.invoice_no?.toLowerCase().includes(q)  ||
          b.vendor_name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bills, search, statusTab, fromDate, toDate, vendorQ, docIdQ, invoiceQ]);

  /* aggregates from filtered set */
  const totals = useMemo(() => filtered.reduce(
    (a, b) => ({
      net:      a.net      + (b.net_amount  || 0),
      tax:      a.tax      + (b.total_tax   || 0),
      grand:    a.grand    + (b.grand_total || 0),
      pending:  a.pending  + (b.status === "pending"  ? (b.net_amount || 0) : 0),
      approved: a.approved + (b.status === "approved" ? (b.net_amount || 0) : 0),
      paid:     a.paid     + (b.status === "paid"     ? (b.net_amount || 0) : 0),
    }),
    { net: 0, tax: 0, grand: 0, pending: 0, approved: 0, paid: 0 },
  ), [filtered]);

  /* pagination */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const resetPage = () => setPage(1);

  const hasAdvFilter = !!(fromDate || toDate || vendorQ || docIdQ || invoiceQ);

  const clearAll = () => {
    setSearch(""); setStatusTab(""); setFromDate(""); setToDate("");
    setVendorQ(""); setDocIdQ(""); setInvoiceQ(""); setPage(1);
  };

  /* status tab counts */
  const countByStatus = useMemo(() => {
    const map = {};
    bills.forEach((b) => { map[b.status] = (map[b.status] || 0) + 1; });
    return map;
  }, [bills]);

  /* ── render ── */
  return (
    <div className="font-roboto-flex flex flex-col h-[75vh] w-full overflow-hidden bg-white dark:bg-[#0b0f19] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative">

      {/* ══ Topbar (Actions) ════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-3 w-1/3">
           <div className="relative w-full max-w-sm">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input
               type="text"
               value={search}
               onChange={(e) => { setSearch(e.target.value); resetPage(); }}
               placeholder="Search bill, invoice, vendor…"
               className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700/80 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
             />
           </div>
        </div>

        <div className="flex items-center gap-2">
          {(search || statusTab || hasAdvFilter) && (
            <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <X size={14} /> Clear filters
            </button>
          )}
          <button
            onClick={() => setShowFilter((v) => !v)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
              hasAdvFilter
                ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters{hasAdvFilter && " ●"}
          </button>
          <button
            onClick={refetch}
            disabled={isFetching}
            title="Refresh"
            className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-40 transition-colors"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin text-blue-500" : ""} />
          </button>
        </div>
      </div>

      {/* ══ Advanced filter panel ════════════════════════════════════════════ */}
      {showFilter && (
        <div className="shrink-0 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <FilterField label="Doc ID">
            <input
              type="text"
              value={docIdQ}
              onChange={(e) => { setDocIdQ(e.target.value); resetPage(); }}
              placeholder="e.g. PB/25-26/0001"
              className={inputCls}
            />
          </FilterField>
          <FilterField label="Invoice No.">
            <input
              type="text"
              value={invoiceQ}
              onChange={(e) => { setInvoiceQ(e.target.value); resetPage(); }}
              placeholder="e.g. INV0023"
              className={inputCls}
            />
          </FilterField>
          <FilterField label="Vendor">
            <SearchableSelect
              value={vendorQ}
              onChange={(val) => { setVendorQ(val); resetPage(); }}
              options={[{ value: "", label: "All Vendors" }, ...vendors.map((v) => ({ value: v.id, label: v.name }))]}
              placeholder="All Vendors"
            />
          </FilterField>
          <FilterField label="From Date">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); resetPage(); }}
              className={inputCls}
            />
          </FilterField>
          <FilterField label="To Date">
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => { setToDate(e.target.value); resetPage(); }}
              className={inputCls}
            />
          </FilterField>
        </div>
      )}

      {/* ══ Status tabs ════════════════════════════════════════════════━━━━━━ */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {[["", "All"], ["pending", "Pending"], ["approved", "Approved"], ["paid", "Paid"], ["draft", "Draft"]].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => { setStatusTab(val); resetPage(); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              statusTab === val
                ? "bg-gray-800 text-white dark:bg-blue-600 shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700/80"
            }`}
          >
            {lbl}
            {val && countByStatus[val] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${statusTab === val ? "bg-white/20 dark:bg-white/20" : "bg-gray-100 dark:bg-gray-900 text-gray-500"}`}>
                {countByStatus[val]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ Summary strip ════════════════════════════════════════════════════ */}
      <div className="shrink-0 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/60 px-6 py-3.5 flex items-center justify-between border-b-2 border-b-gray-100 dark:border-b-gray-800/80">
        <div className="flex divide-x divide-gray-200 dark:divide-gray-700">
          <StatCell label="Total Match"    value={filtered.length} />
          <StatCell label="Base Amount"    value={`₹${fmt(totals.grand)}`} />
          <StatCell label="Total Tax"      value={`₹${fmt(totals.tax)}`} />
          <StatCell label="Net Payable"    value={`₹${fmt(totals.net)}`}      bold />
        </div>
      </div>

      {/* ══ Timeline View ════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 p-6 rounded-b-xl bg-slate-50/50 dark:bg-[#0b0f19]">
        {isLoading ? (
          <div className="h-full flex flex-col justify-center items-center">
             <Loader />
             <p className="mt-4 text-sm text-gray-400">Loading purchase bills for this project...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 opacity-60">
             <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                <FileText size={36} />
             </div>
            <p className="text-base font-semibold text-gray-600 dark:text-gray-300">No purchase bills matched your timeline</p>
            {(search || statusTab || hasAdvFilter) && (
              <button onClick={clearAll} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:shadow-sm transition-all">Clear active filters</button>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto pb-8">
             {paginated.map((bill, i) => (
                <PurchaseBillCard 
                   key={bill._id} 
                   item={bill} 
                   isLast={i === paginated.length - 1} 
                />
             ))}
          </div>
        )}
      </div>

      {/* ══ Footer / Pagination ══════════════════════════════════════════════ */}
      {!isLoading && filtered.length > 0 && (
        <div className="shrink-0 absolute bottom-0 w-full bg-white/80 backdrop-blur-md dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between z-20">
          <span className="text-xs text-gray-500 font-medium tracking-wide">
            Showing{" "}
            <strong className="text-gray-800 dark:text-gray-200">
              {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}
            </strong>{" "}
             of <strong className="text-gray-800 dark:text-gray-200">{filtered.length}</strong> cards
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <PgBtn onClick={() => setPage(1)} disabled={page === 1}>«</PgBtn>
              <PgBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</PgBtn>
              {Array.from({ length: totalPages }, (_, k) => k + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <PgBtn key={p} onClick={() => setPage(p)} active={p === page}>{p}</PgBtn>
                ))}
              <PgBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</PgBtn>
              <PgBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PgBtn>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
const inputCls = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-all placeholder:text-gray-400";

const FilterField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</label>
    {children}
  </div>
);

const StatCell = ({ label, value, bold, color = "text-gray-700 dark:text-gray-200" }) => (
  <div className="px-5 first:pl-0 last:pr-0">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
    <p className={`text-base tracking-tight tabular-nums ${bold ? "font-bold" : "font-semibold"} ${color}`}>{value}</p>
  </div>
);

const PgBtn = ({ children, onClick, disabled, active }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[28px] h-7 px-1.5 rounded-md text-xs font-bold transition-all ${
      active   ? "bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white"
      : disabled ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
      : "text-gray-500 dark:text-gray-400 hover:bg-white hover:shadow-sm dark:hover:bg-gray-700"
    }`}
  >
    {children}
  </button>
);

export default FinanceViewPurchaseBill;

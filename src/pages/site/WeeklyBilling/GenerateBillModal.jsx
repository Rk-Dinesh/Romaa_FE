import { useState, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { FiCalendar } from "react-icons/fi";
import {
  Receipt,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Percent,
  TrendingUp,
  Info,
} from "lucide-react";
import { useSiteVendors, useGenerateBill, useVendorWorkSummary } from "./hooks/useWeeklyBilling";
import { useProject } from "../../../context/ProjectContext";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// Add/subtract one day from a YYYY-MM-DD string
const addDay = (dateStr) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};
const subtractDay = (dateStr) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

// Returns array of unbilled {from, to} segments within [fromDate, toDate] for a vendor.
// Empty array = fully billed. Single element = one gap. Multiple = multiple gaps.
const computeUnbilledSegments = (fromDate, toDate, existingBills, vendorName) => {
  const overlap = existingBills
    .filter(
      (b) =>
        b.vendor_name === vendorName &&
        b.status !== "Cancelled" &&
        b.from_date.split("T")[0] <= toDate &&
        b.to_date.split("T")[0] >= fromDate,
    )
    .map((b) => ({ from: b.from_date.split("T")[0], to: b.to_date.split("T")[0] }))
    .sort((a, b) => a.from.localeCompare(b.from));

  if (overlap.length === 0) return [{ from: fromDate, to: toDate }];

  const gaps = [];
  let cursor = fromDate;

  for (const bill of overlap) {
    if (cursor < bill.from) {
      const gapTo = subtractDay(bill.from);
      if (gapTo >= cursor) gaps.push({ from: cursor, to: gapTo });
    }
    if (bill.to >= cursor) cursor = addDay(bill.to);
  }
  if (cursor <= toDate) gaps.push({ from: cursor, to: toDate });

  return gaps;
};

// ── Root ───────────────────────────────────────────────────────────────────────
const GenerateBillModal = ({ onClose, onSuccess, existingBills = [] }) => {
  const { tenderId } = useProject();

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(weekAgo);
  const [toDate, setToDate] = useState(today);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [gstPct, setGstPct] = useState("18");

  // All vendors permitted for this site/tender
  const { data: siteVendors = [], isLoading: vendorsLoading } = useSiteVendors(tenderId);

  // Derive the full vendor object from the selected id
  const selectedVendorObj = useMemo(
    () => siteVendors.find((v) => v.vendor_id === selectedVendorId) || null,
    [siteVendors, selectedVendorId],
  );
  const selectedVendorName = selectedVendorObj?.vendor_name || "";

  // ── Compute unbilled date gaps for the selected vendor ──────────────────────
  const unbilledSegments = useMemo(() => {
    if (!selectedVendorName || !fromDate || !toDate) return null;
    return computeUnbilledSegments(fromDate, toDate, existingBills, selectedVendorName);
  }, [existingBills, selectedVendorName, fromDate, toDate]);

  // The first (earliest) unbilled segment is what we'll fetch & bill
  const effectiveFrom = unbilledSegments?.[0]?.from ?? fromDate;
  const effectiveTo   = unbilledSegments?.[0]?.to   ?? toDate;

  const fullyBilled   = unbilledSegments !== null && unbilledSegments.length === 0;
  const rangeAdjusted =
    unbilledSegments !== null &&
    unbilledSegments.length > 0 &&
    (effectiveFrom !== fromDate || effectiveTo !== toDate);

  // Which existing bills caused the trim (for the notice UI)
  const overlappingBills = useMemo(() => {
    if (!selectedVendorName || !fromDate || !toDate) return [];
    return existingBills.filter(
      (b) =>
        b.vendor_name === selectedVendorName &&
        b.status !== "Cancelled" &&
        b.from_date.split("T")[0] <= toDate &&
        b.to_date.split("T")[0] >= fromDate,
    );
  }, [existingBills, selectedVendorName, fromDate, toDate]);

  // Fetch vendor work summary for only the effective (unbilled) window
  const { data: vendorSummaryList = [], isLoading: workDoneLoading } = useVendorWorkSummary(
    tenderId,
    effectiveFrom,
    effectiveTo,
  );

  const { mutate: generateBill, isPending: generating } = useGenerateBill({
    onSuccess,
    onClose,
  });

  // Find this vendor's aggregated data from the summary response
  const vendorData = useMemo(() => {
    if (!selectedVendorName || fullyBilled) return null;
    const match = vendorSummaryList.find(
      (v) => v.vendor_name?.trim() === selectedVendorName.trim(),
    );
    return match && (match.sub_bills?.length ?? 0) > 0 ? match : null;
  }, [vendorSummaryList, selectedVendorName, fullyBilled]);

  // Flatten all line items across sub_bills for table display
  const allItems = useMemo(
    () => vendorData?.sub_bills?.flatMap((sb) => sb.items) ?? [],
    [vendorData],
  );

  const baseAmount = vendorData?.base_amount || 0;
  const gstRate    = Number(gstPct) || 0;
  const gstAmt     = (baseAmount * gstRate) / 100;
  const cgstPct    = gstRate / 2;
  const sgstPct    = gstRate / 2;
  const cgstAmt    = gstAmt / 2;
  const sgstAmt    = gstAmt / 2;
  const grandTotal = baseAmount + gstAmt;

  const hasWorkInPeriod = !!vendorData && baseAmount > 0;
  const canGenerate    = !!selectedVendorId && !fullyBilled && hasWorkInPeriod && gstRate >= 0;

  const handleGenerate = () => {
    if (!canGenerate) return;
    generateBill({
      tender_id:   tenderId,
      vendor_id:   selectedVendorId,
      vendor_name: selectedVendorName,
      from_date:   effectiveFrom,
      to_date:     effectiveTo,
      gst_pct:     gstRate,
      sub_bills:   vendorData?.sub_bills || [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">

        {/* ── Header ── */}
        <div className="px-7 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Receipt size={18} className="text-emerald-600 dark:text-emerald-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white leading-tight">
                Generate Weekly Bill
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Select date range → vendor → enter GST → generate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">

          {/* ── Step 1: Date Range + Vendor ── */}
          <div className="px-7 py-5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">
              Step 1 — Select Period &amp; Vendor
            </p>
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* From */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  From Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiCalendar size={13} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate}
                    onChange={(e) => { setFromDate(e.target.value); setSelectedVendorId(""); }}
                    className="w-full pl-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* To */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  To Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiCalendar size={13} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    onChange={(e) => { setToDate(e.target.value); setSelectedVendorId(""); }}
                    className="w-full pl-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Vendor Select */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  disabled={vendorsLoading || siteVendors.length === 0}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {vendorsLoading ? "Loading vendors…" : siteVendors.length === 0 ? "No vendors for this site" : "Select vendor"}
                  </option>
                  {siteVendors.map((v) => (
                    <option key={v.vendor_id} value={v.vendor_id}>
                      {v.vendor_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Fully Billed Warning ── */}
          {fullyBilled && (
            <div className="mx-7 mt-4 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  Entire period already billed
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  All dates from <strong>{fmtDate(fromDate)}</strong> to{" "}
                  <strong>{fmtDate(toDate)}</strong> are covered by existing bill(s) for{" "}
                  <strong>{selectedVendorName}</strong>. Cancel the existing bill(s) to re-generate.
                </p>
              </div>
            </div>
          )}

          {/* ── Partial Overlap Notice — show effective (trimmed) range ── */}
          {rangeAdjusted && (
            <div className="mx-7 mt-4 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Some dates already billed — showing unbilled work only
                </p>
                {/* Existing bills pills */}
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {overlappingBills.map((b) => (
                    <span
                      key={b.bill_no || b._id}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-2.5 py-0.5 rounded-full"
                    >
                      <AlertTriangle size={10} />
                      {b.bill_no} &nbsp;·&nbsp; {fmtDate(b.from_date)} – {fmtDate(b.to_date)}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">
                  Generating bill for unbilled period:{" "}
                  <strong>{fmtDate(effectiveFrom)} – {fmtDate(effectiveTo)}</strong>
                </p>
              </div>
            </div>
          )}

          {/* ── No work in the effective period ── */}
          {selectedVendorId && !workDoneLoading && !fullyBilled && !vendorData && (
            <div className="mx-7 mt-4 flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No work done by <strong>{selectedVendorName}</strong> in{" "}
                {rangeAdjusted
                  ? <>the unbilled period <strong>{fmtDate(effectiveFrom)} – {fmtDate(effectiveTo)}</strong></>
                  : "the selected period"
                }.
              </p>
            </div>
          )}

          {/* ── Step 2: Preview ── */}
          {vendorData && (
            <div className="px-7 py-5">
              <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">
                Step 2 — Work Done Preview
              </p>

              {/* Items Table */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-5">
                <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-blue-50/60 dark:bg-blue-900/10">
                  <Building2 size={15} className="text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-sm text-gray-800 dark:text-white">
                    {vendorData.vendor_name}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    {fmtDate(effectiveFrom)} — {fmtDate(effectiveTo)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        {["#", "Work Order", "Item Description", "Detailed Description", "Qty", "Unit", "Rate (₹)", "Amount (₹)"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {allItems.map((item, i) => {
                        const amount = (item.quantity || 0) * (item.quoted_rate || 0);
                        return (
                          <tr key={i} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                            <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                            <td className="px-4 py-2.5">
                              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono text-gray-600 dark:text-gray-300">
                                {item.work_order_id}
                              </code>
                            </td>
                            <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-100">
                              {item.item_description}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs max-w-[200px]">
                              {item.description || <span className="text-gray-300 dark:text-gray-600">—</span>}
                            </td>
                            <td className="px-4 py-2.5 tabular-nums text-blue-600 dark:text-blue-400 font-semibold">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                              {item.unit}
                            </td>
                            <td className="px-4 py-2.5 tabular-nums text-gray-700 dark:text-gray-300">
                              ₹{fmt(item.quoted_rate)}
                            </td>
                            <td className="px-4 py-2.5 tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                              ₹{fmt(amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Step 3: GST + Totals ── */}
              <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">
                Step 3 — GST &amp; Total
              </p>
              <div className="grid grid-cols-2 gap-6 items-start">
                {/* GST input */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                    <Percent size={13} className="text-indigo-500" />
                    GST Percentage <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={gstPct}
                        onChange={(e) => setGstPct(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 pr-8"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm font-bold">%</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {[0, 5, 12, 18, 28].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setGstPct(String(pct))}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                          String(gstPct) === String(pct)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  {gstRate > 0 && (
                    <p className="mt-3 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                      Split: CGST {cgstPct}% + SGST {sgstPct}%
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Base Amount</span>
                    <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-100">
                      ₹{fmt(baseAmount)}
                    </span>
                  </div>

                  {gstRate > 0 ? (
                    <>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                        <span>CGST ({cgstPct}%)</span>
                        <span className="font-medium tabular-nums text-indigo-500 dark:text-indigo-400">
                          + ₹{fmt(cgstAmt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                        <span>SGST ({sgstPct}%)</span>
                        <span className="font-medium tabular-nums text-indigo-500 dark:text-indigo-400">
                          + ₹{fmt(sgstAmt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-0.5">
                        <span>Total GST ({gstRate}%)</span>
                        <span className="font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                          + ₹{fmt(gstAmt)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>GST (0%)</span>
                      <span className="font-semibold tabular-nums text-gray-400">₹0.00</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-emerald-500" />
                      Grand Total
                    </span>
                    <span className="text-lg font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                      ₹{fmt(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-7 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-400">
            {vendorData ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 size={14} />
                {allItems.length} item{allItems.length !== 1 ? "s" : ""} across{" "}
                {(vendorData.sub_bills || []).length} work order{(vendorData.sub_bills || []).length !== 1 ? "s" : ""}
                {rangeAdjusted && (
                  <span className="ml-1 text-blue-500 font-normal">
                    · {fmtDate(effectiveFrom)} – {fmtDate(effectiveTo)}
                  </span>
                )}
              </span>
            ) : (
              "Select a vendor to preview work done"
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={generating}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              className="px-6 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Receipt size={15} />
              )}
              {generating ? "Generating…" : "Generate Bill"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateBillModal;

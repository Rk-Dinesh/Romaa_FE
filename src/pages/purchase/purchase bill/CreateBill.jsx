import { useState, useMemo, useRef, useEffect } from "react";
import { useForm }     from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup        from "yup";
import { IoClose }     from "react-icons/io5";
import { FiSave, FiFileText, FiSettings, FiChevronDown } from "react-icons/fi";
import { useTenderIds, usePermittedVendors, useCreateBill, useGRNForBilling } from "./hooks/usePurchaseBill";

/* ── Schema ─────────────────────────────────────────────────────────────── */
const schema = yup.object().shape({
  bill_date:    yup.string().required("Bill Date is required"),
  bill_no:      yup.string().required("Bill No is required"),
  invoice_no:   yup.string().required("Invoice No is required"),
  invoice_date: yup.string().required("Invoice Date is required"),
  credit_days:  yup.number().typeError("Must be a number").min(0).nullable().optional(),
  narration:    yup.string().nullable(),
});

/* ── Row factories ──────────────────────────────────────────────────────── */
const emptyGrnRow  = () => ({ grn_no: "", grn_ref_no: "", ref_date: "", grn_qty: "" });
const emptyItemRow = () => ({ item_id: "", unit: "", accepted_qty: "", amt: "0.00", unit_price: "", gross_amt: "0.00", net_amt: "0.00" });

/* ── Amount-in-words ────────────────────────────────────────────────────── */
const ones    = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const tensArr = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
const toWords = (n) => {
  if (n === 0) return "Zero";
  if (n >= 100000) return toWords(Math.floor(n / 100000)) + " Lakh"     + (n % 100000 ? " " + toWords(n % 100000) : "");
  if (n >= 1000)   return toWords(Math.floor(n / 1000))   + " Thousand" + (n % 1000   ? " " + toWords(n % 1000)   : "");
  if (n >= 100)    return ones[Math.floor(n / 100)]        + " Hundred"  + (n % 100    ? " " + toWords(n % 100)    : "");
  if (n >= 20)     return tensArr[Math.floor(n / 10)]      + (n % 10     ? " " + ones[n % 10] : "");
  return ones[n];
};
const toWordsRupees = (n) => "Rupees " + toWords(n) + " Only";

/* ── Shared class strings ───────────────────────────────────────────────── */
const inputCls    = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all";
const tblInputCls = "w-full border border-gray-200 dark:border-gray-600 rounded px-1.5 py-1 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 min-w-[64px]";
const sectionHdr  = "text-xs font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-3 flex items-center gap-2 uppercase tracking-wider";

/* ── SearchableSelect ───────────────────────────────────────────────────── */
const SearchableSelect = ({ options = [], value, onChange, placeholder = "Search...", disabled = false, isLoading = false }) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // when new options arrive while open, keep dropdown open (no reset needed)
  const filtered = (options || []).filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  const selected = (options || []).find(o => o.value === value);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setOpen(o => !o); setSearch(""); } }}
        className={`${inputCls} flex items-center justify-between text-left ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`truncate ${selected ? "text-gray-800 dark:text-white" : "text-gray-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        {isLoading
          ? <span className="shrink-0 ml-1 w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          : <FiChevronDown className={`text-gray-400 shrink-0 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
        }
      </button>

      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-56 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type to search..."
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="overflow-y-auto">
            {isLoading ? (
              <p className="text-xs text-gray-400 px-3 py-2 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin inline-block" />
                Loading...
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-400 px-3 py-2">No results found</p>
            ) : (
              filtered.map(o => (
                <div
                  key={o.value}
                  onClick={() => { onChange(o); setOpen(false); setSearch(""); }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                    o.value === value
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {o.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Component ──────────────────────────────────────────────────────────── */
const CreateBill = ({ onclose, onSuccess }) => {
  const [grnRows,  setGrnRows]  = useState([emptyGrnRow()]);
  const [itemRows, setItemRows] = useState([emptyItemRow()]);

  // Tender & vendor selection (stored separately from RHF)
  const [selectedTenderId, setSelectedTenderId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");

  // Other charges
  const [otherCharges,       setOtherCharges]       = useState("");
  const [otherChargesAmt,    setOtherChargesAmt]     = useState("");
  const [otherChargesGstPct, setOtherChargesGstPct] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { credit_days: "" },
  });

  const [showGrnPicker, setShowGrnPicker] = useState(false);

  const [watchBillDate, watchBillNo, watchInvoiceNo, watchInvoiceDate, watchCreditDays] =
    watch(["bill_date", "bill_no", "invoice_no", "invoice_date", "credit_days"]);

  /* ── Hooks ──────────────────────────────────────────────────────────── */
  const { data: tendersRaw = [],  isLoading: loadingTenders  } = useTenderIds();
  const { data: vendorsRaw = [],  isLoading: loadingVendors  } = usePermittedVendors(selectedTenderId);
  const { data: grnData = [],     isLoading: loadingGrn      } = useGRNForBilling(selectedTenderId, selectedVendorId);
  const createBillMutation = useCreateBill({ onSuccess, onClose: onclose });

  /* ── Build dropdown options ─────────────────────────────────────────── */
  const tenderOptions = tendersRaw.map(t => ({
    value:      t.tender_id,
    label:      t.tender_project_name ? `${t.tender_id} – ${t.tender_project_name}` : t.tender_id,
  }));

  const vendorOptions = vendorsRaw.map(v => ({
    value:      v.vendor_id,
    label:      `${v.vendor_id} – ${v.vendor_name}`,
    credit_day: v.credit_day,
  }));

  /* ── Selection handlers ─────────────────────────────────────────────── */
  const handleTenderSelect = (option) => {
    if (option.value === selectedTenderId) return;   // no-op if same tender
    setSelectedTenderId(option.value);
    setSelectedVendorId("");
    setValue("credit_days", null);
  };

  const handleVendorSelect = (option) => {
    setSelectedVendorId(option.value);
    const days = option.credit_day != null ? Number(option.credit_day) : null;
    setValue("credit_days", days, { shouldDirty: true, shouldTouch: true });
  };

  /* ── Enter key on identity/config sections → open GRN picker ───────── */
  const handleSectionKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (e.target.tagName === "BUTTON" || e.target.tagName === "TEXTAREA") return;
    const identityOk = selectedTenderId && selectedVendorId &&
      watchBillDate && watchBillNo && watchInvoiceNo && watchInvoiceDate;
    const configOk = watchCreditDays !== "" && watchCreditDays !== null && watchCreditDays !== undefined;
    if (!identityOk || !configOk) return;
    e.preventDefault();
    setShowGrnPicker(true);
  };

  /* ── GRN picker confirm → populate GRN rows + line items ────────────── */
  const handleGrnPickerConfirm = (entries) => {
    setGrnRows(entries.map(e => ({
      grn_no:     e.grn_bill_no       || "",
      grn_ref_no: e.party_bill_no     || e.invoice_challan_no || "",
      ref_date:   e.date ? e.date.split("T")[0] : "",
      grn_qty:    String(e.quantity   ?? ""),
    })));

    setItemRows(entries.map(e => {
      const qty   = parseFloat(e.quantity)    || 0;
      const price = parseFloat(e.quoted_rate) || 0;
      const gross = parseFloat((qty * price).toFixed(2));
      return {
        item_id:      e.item_description || "",
        unit:         e.unit || "",
        accepted_qty: String(e.quantity   ?? ""),
        amt:          "0.00",
        unit_price:   String(e.quoted_rate ?? ""),
        gross_amt:    gross.toFixed(2),
        net_amt:      gross.toFixed(2),
      };
    }));

    setShowGrnPicker(false);
  };

  /* ── Auto due date = today + credit_days ────────────────────────────── */
  const computedDueDate = useMemo(() => {
    const days = Number(watchCreditDays);
    if (isNaN(days) || days < 0) return "";
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }, [watchCreditDays]);

  /* ── Derived totals ─────────────────────────────────────────────────── */
  const grandTotal         = itemRows.reduce((acc, r) => acc + (parseFloat(r.gross_amt) || 0), 0);
  const sgst               = parseFloat((grandTotal * 0.025).toFixed(2));
  const cgst               = sgst;
  const otherChargesAmtNum = parseFloat(otherChargesAmt) || 0;

  const otherChargesGst = useMemo(() => {
    if (!otherCharges) return 0;
    const pct = parseFloat(otherChargesGstPct) || 0;
    return parseFloat((otherChargesAmtNum * pct / 100).toFixed(2));
  }, [otherCharges, otherChargesAmtNum, otherChargesGstPct]);

  const roundOff  = 0.10;
  const netAmount = parseFloat((grandTotal + sgst + cgst + otherChargesAmtNum + otherChargesGst + roundOff).toFixed(2));

  const fixedTaxRows = [
    { desc: "Inward supply 5%", amt: grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }), account: "INWARD SUPPLY" },
    { desc: "SGST @ 2.5%",      amt: sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 }),       account: "SGST INPUT TAX @ 2.5%" },
    { desc: "CGST @ 2.5%",      amt: cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 }),       account: "CGST INPUT TAX @ 2.5%" },
    { desc: "TCS receivable",   amt: "0.00",                                                            account: "TCS RECEIVABLE" },
    { desc: "Round off",        amt: roundOff.toFixed(2),                                               account: "Round off" },
  ];

  /* ── Submit ─────────────────────────────────────────────────────────── */
  const onSubmit = (data) => {
    if (!selectedTenderId) { import("react-toastify").then(m => m.toast.warning("Please select a tender")); return; }
    if (!selectedVendorId) { import("react-toastify").then(m => m.toast.warning("Please select a vendor"));  return; }

    createBillMutation.mutate({
      ...data,
      tender_id:             selectedTenderId,
      vendor_id:             selectedVendorId,
      due_date:              computedDueDate,
      grn_rows:              grnRows,
      line_items:            itemRows,
      other_charges:         otherCharges || null,
      other_charges_amount:  otherChargesAmtNum,
      other_charges_gst_pct: parseFloat(otherChargesGstPct) || 0,
      grand_total:           grandTotal,
      net_amount:            netAmount,
    });
  };

  const isSaving = createBillMutation.isPending;

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-6xl h-[97vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="px-8 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FiFileText className="text-xl" />
              </span>
              Purchase Bill — New Entry
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Amount in Rupees</p>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
            <IoClose size={24} />
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900 space-y-6">

          {/* Sections 1 + 2 wrapped for Enter key detection */}
          <div onKeyDown={handleSectionKeyDown}>

          {/* Section 1 — Bill Identity */}
          <div>
            <div className={sectionHdr}><FiFileText /> Bill Identity</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

              <Field label="Tender" required>
                <SearchableSelect
                  options={tenderOptions}
                  value={selectedTenderId}
                  onChange={handleTenderSelect}
                  placeholder="Select tender..."
                  isLoading={loadingTenders}
                />
              </Field>

              <Field label="Bill Date" required error={errors.bill_date}>
                <input type="date" {...register("bill_date")} className={inputCls} />
              </Field>

              <Field label="Bill No" required error={errors.bill_no}>
                <input type="text" {...register("bill_no")} className={inputCls} placeholder="e.g. RF/C2/25-26/PB/01019" />
              </Field>

              <div className="md:col-span-2">
                <Field label="Vendor / Supplier" required>
                  <SearchableSelect
                    key={selectedTenderId || "__no_tender__"}
                    options={vendorOptions}
                    value={selectedVendorId}
                    onChange={handleVendorSelect}
                    placeholder={!selectedTenderId ? "Select a tender first" : "Select vendor..."}
                    disabled={!selectedTenderId}
                    isLoading={loadingVendors}
                  />
                </Field>
              </div>

              <Field label="Invoice No" required error={errors.invoice_no}>
                <input type="text" {...register("invoice_no")} className={inputCls} placeholder="e.g. RA/Q1/04200" />
              </Field>

              <Field label="Invoice Date" required error={errors.invoice_date}>
                <input type="date" {...register("invoice_date")} className={inputCls} />
              </Field>

            </div>
          </div>

          {/* Section 2 — Bill Configuration */}
          <div>
            <div className={sectionHdr}><FiSettings /> Bill Configuration</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

              <Field label="Credit Days" error={errors.credit_days}>
                <input type="number" {...register("credit_days")} className={inputCls} placeholder="Auto-filled from vendor" min={0} />
              </Field>

              <Field label="Due Date">
                <input
                  type="date"
                  value={computedDueDate}
                  readOnly
                  className={`${inputCls} !bg-gray-100 dark:!bg-gray-700 cursor-default`}
                />
              </Field>

              <Field label="Other Charges">
                <select
                  value={otherCharges}
                  onChange={e => { setOtherCharges(e.target.value); setOtherChargesAmt(""); setOtherChargesGstPct(""); }}
                  className={inputCls}
                >
                  <option value="">—</option>
                  <option>Supplier</option>
                  <option>Loading Unloading</option>
                </select>
              </Field>
            </div>
          </div>

          </div>{/* end Enter-key wrapper */}

          {/* Section 3 — GRN Linkage + Line Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* GRN Linkage */}
            <div>
              <p className={sectionHdr}>GRN Linkage</p>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        {["S No", "GRN No", "GRN Ref No", "Ref Date", "GRN Qty"].map(h => (
                          <th key={h} className="px-2 py-2 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grnRows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-blue-50/30">
                          <td className="px-2 py-1.5 text-gray-400">{i + 1}</td>
                          <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300 font-medium">{row.grn_no || "—"}</td>
                          <td className="px-2 py-1.5 text-gray-500 dark:text-gray-400">{row.grn_ref_no || "—"}</td>
                          <td className="px-2 py-1.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.ref_date || "—"}</td>
                          <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{row.grn_qty || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <p className={sectionHdr}>Line Items</p>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        {["S No", "Item", "Unit", "Accepted Qty", "Amt", "Unit Price", "Gross Amt", "Net Amt"].map(h => (
                          <th key={h} className="px-2 py-2 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {itemRows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-blue-50/30">
                          <td className="px-2 py-1.5 text-gray-400">{i + 1}</td>
                          <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{row.item_id || "—"}</td>
                          <td className="px-2 py-1.5 text-gray-500 dark:text-gray-400">{row.unit || "—"}</td>
                          <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{row.accepted_qty || "—"}</td>
                          <td className="px-2 py-1.5 text-right text-gray-500 dark:text-gray-400">{row.amt}</td>
                          <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{row.unit_price || "—"}</td>
                          <td className="px-2 py-1.5 text-right font-medium text-gray-700 dark:text-gray-300">{row.gross_amt}</td>
                          <td className="px-2 py-1.5 text-right font-medium text-gray-700 dark:text-gray-300">{row.net_amt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 — Tax & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Tax table + Narration */}
            <div>
              <p className={sectionHdr}>Tax &amp; Additions / Deductions</p>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      {["S No", "Description", "Amount (₹)", "Account / GST %"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fixedTaxRows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.desc}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">{row.amt}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{row.account}</td>
                      </tr>
                    ))}

                    {otherCharges && (
                      <tr className="border-t-2 border-blue-100 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-900/10">
                        <td className="px-3 py-2 text-gray-400">{fixedTaxRows.length + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{otherCharges}</td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            value={otherChargesAmt}
                            onChange={e => setOtherChargesAmt(e.target.value)}
                            placeholder="0.00"
                            className={`${tblInputCls} text-right`}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={otherChargesGstPct}
                              onChange={e => setOtherChargesGstPct(e.target.value)}
                              placeholder="GST %"
                              className={`${tblInputCls} w-16`}
                              min={0}
                              max={100}
                            />
                            <span className="text-gray-400 text-[10px] shrink-0">%</span>
                            {otherChargesGstPct && (
                              <span className="text-gray-500 text-[10px] shrink-0">= ₹{otherChargesGst.toFixed(2)}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <Field label="Narration" error={errors.narration}>
                  <input type="text" {...register("narration")} className={inputCls} placeholder="e.g. Purchase for: INFRA" />
                </Field>
              </div>
            </div>

            {/* Summary */}
            <div>
              <p className={sectionHdr}>Summary</p>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 w-40">Grand Total</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-white">
                        ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    {otherCharges && (
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 w-40">
                          {otherCharges}{otherChargesGstPct ? ` (GST ${otherChargesGstPct}%)` : ""}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                          ₹{(otherChargesAmtNum + otherChargesGst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <td className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 w-40">Net Amount</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600 text-base">
                        ₹{netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                Amount in words:<br />
                <span className="text-gray-800 dark:text-white font-semibold">
                  {toWordsRupees(Math.round(netAmount))}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onclose}
            disabled={isSaving}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving
              ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              : <FiSave />}
            {isSaving ? "Saving..." : "Save Bill"}
          </button>
        </div>

      </div>

      {/* ── GRN Picker Modal ─────────────────────────────────────────── */}
      {showGrnPicker && (
        <GRNPickerModal
          data={grnData}
          isLoading={loadingGrn}
          onClose={() => setShowGrnPicker(false)}
          onConfirm={handleGrnPickerConfirm}
        />
      )}
    </div>
  );
};

/* ── GRN Picker Modal ───────────────────────────────────────────────────── */
const GRNPickerModal = ({ data = [], isLoading, onClose, onConfirm }) => {
  const [filter,   setFilter]   = useState("");
  const [selected, setSelected] = useState(new Set());

  const filtered = data.filter(e =>
    !filter || (e.purchase_request_ref || "").toLowerCase().includes(filter.toLowerCase())
  );

  const allChecked  = filtered.length > 0 && filtered.every(e => selected.has(e._id));
  const someChecked = filtered.some(e => selected.has(e._id));

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allChecked) filtered.forEach(e => next.delete(e._id));
      else            filtered.forEach(e => next.add(e._id));
      return next;
    });
  };

  const toggleOne = (id) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleOk = () => {
    if (selected.size === 0) return;
    onConfirm(data.filter(e => selected.has(e._id)));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800" style={{ maxHeight: "82vh" }}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Select GRN Entries</h3>
            <p className="text-xs text-gray-400 mt-0.5">Press Enter or click OK to fill GRN Linkage and Line Items</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
            <IoClose size={20} />
          </button>
        </div>

        {/* Filter */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
          <input
            autoFocus
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && selected.size > 0) handleOk(); }}
            placeholder="Filter by Purchase Request Ref..."
            className={inputCls}
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-sm text-gray-400">
              <span className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              Loading GRN entries...
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No GRN entries found</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 py-2.5 text-center w-8">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={toggleAll}
                      className="accent-blue-600 cursor-pointer"
                    />
                  </th>
                  {["GRN Bill No", "Party Bill No", "Item", "Site", "Qty", "Rate", "PO Ref", "Date"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr
                    key={e._id}
                    onClick={() => toggleOne(e._id)}
                    className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
                      selected.has(e._id)
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    }`}
                  >
                    <td className="px-3 py-2 text-center" onClick={ev => ev.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(e._id)}
                        onChange={() => toggleOne(e._id)}
                        className="accent-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">{e.grn_bill_no}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">{e.party_bill_no}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{e.item_description}</td>
                    <td className="px-3 py-2 text-gray-500">{e.site_name}</td>
                    <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 font-medium">{e.quantity}</td>
                    <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">₹{e.quoted_rate}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                        {e.purchase_request_ref}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                      {e.date ? new Date(e.date).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center rounded-b-2xl bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {selected.size > 0
              ? <span className="font-semibold text-blue-600">{selected.size} entr{selected.size === 1 ? "y" : "ies"} selected</span>
              : "Select GRN entries to populate the bill"}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleOk}
              disabled={selected.size === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              OK — Fill Bill
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ── Field wrapper ──────────────────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[10px] mt-0.5">{error.message}</p>}
  </div>
);

export default CreateBill;

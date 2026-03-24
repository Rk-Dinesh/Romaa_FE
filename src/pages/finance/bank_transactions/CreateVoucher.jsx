import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import {
  FiSave, FiFileText, FiUser, FiCreditCard,
  FiList, FiChevronDown, FiPlus, FiTrash2,
  FiArrowUpRight, FiArrowDownLeft,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  useNextPVNo, useNextRVNo,
  useCreatePV, useCreateRV,
  useTenderIds, useVendors, useContractors,
} from "./hooks/useVouchers";

/* ── Schema ─────────────────────────────────────────────────────────────── */
const schema = yup.object().shape({
  doc_no:      yup.string().required("Voucher number is required"),
  doc_date:    yup.string().required("Date is required"),
  bank_name:   yup.string().nullable(),
  bank_ref:    yup.string().nullable(),
  cheque_no:   yup.string().nullable(),
  cheque_date: yup.string().nullable(),
  amount:      yup.number().typeError("Must be a number").positive("Must be positive").required("Amount is required"),
  against_no:  yup.string().nullable(),
  narration:   yup.string().nullable(),
});

/* ── Constants ───────────────────────────────────────────────────────────── */
const PAYMENT_MODES = ["Cash", "Cheque", "NEFT", "RTGS", "UPI", "DD"];
const emptyEntry    = () => ({ dr_cr: "Dr", account_name: "", debit_amt: "", credit_amt: "" });
const emptyBillRef  = () => ({ bill_no: "", settled_amt: "" });

/* ── Shared class strings ────────────────────────────────────────────────── */
const inputCls    = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-all placeholder:text-gray-400";
const readonlyCls = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 dark:text-gray-400 text-gray-500 cursor-default";
const selectCls   = `${inputCls} appearance-none cursor-pointer`;

/* ── Field wrapper ───────────────────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500 mt-0.5">{error.message}</p>}
  </div>
);

/* ── Section card ────────────────────────────────────────────────────────── */
const accentColors = {
  slate:  "bg-slate-700",
  blue:   "bg-blue-600",
  emerald:"bg-emerald-600",
  amber:  "bg-amber-500",
  violet: "bg-violet-600",
  indigo: "bg-indigo-600",
};
const SectionCard = ({ iconEl, title, accent = "slate", children, overflow = false, className = "" }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${overflow ? "overflow-hidden" : ""} ${className}`}>
    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 rounded-t-xl">
      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[13px] text-white ${accentColors[accent]}`}>
        {iconEl}
      </span>
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ── Searchable Select ───────────────────────────────────────────────────── */
const SearchableSelect = ({ options = [], value, onChange, placeholder = "Search...", disabled = false, isLoading = false }) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

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
        <div className="absolute z-[200] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-56 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              autoFocus type="text" value={search}
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
              <p className="text-xs text-gray-400 px-3 py-2">No results</p>
            ) : (
              filtered.map(o => (
                <div
                  key={o.value}
                  onClick={() => { onChange(o); setOpen(false); setSearch(""); }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                    o.value === value
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 font-medium"
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

/* ═══════════════════════════════════════════════════════════════════════════ */
const CreateVoucher = ({ onclose, onSuccess }) => {

  /* ── Voucher type toggle ── */
  const [voucherType, setVoucherType] = useState("PV"); // "PV" | "RV"
  const isPV = voucherType === "PV";

  /* ── Payment / Receipt mode ── */
  const [txMode, setTxMode] = useState("NEFT");

  /* ── Supplier type ── */
  const [supplierType, setSupplierType] = useState("Vendor");

  /* ── Tender / Supplier selections ── */
  const [selectedTenderId,   setSelectedTenderId]   = useState("");
  const [selectedTenderRef,  setSelectedTenderRef]  = useState("");
  const [selectedTenderName, setSelectedTenderName] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  /* ── PV: bill references ── */
  const [billRefs, setBillRefs] = useState([emptyBillRef()]);

  /* ── Dr/Cr entries ── */
  const [entries, setEntries] = useState([emptyEntry(), emptyEntry()]);

  /* ── Save status (draft vs pending) ── */
  const saveStatusRef = useRef("pending");

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      doc_no: "", doc_date: "", bank_name: "", bank_ref: "",
      cheque_no: "", cheque_date: "", amount: "", against_no: "", narration: "",
    },
  });

  /* ── Data hooks ── */
  const { data: nextPVNo } = useNextPVNo();
  const { data: nextRVNo } = useNextRVNo();
  const { data: tendersRaw = [],     isLoading: loadingTenders     } = useTenderIds();
  const { data: vendorsRaw = [],     isLoading: loadingVendors     } = useVendors(supplierType === "Vendor" ? selectedTenderId : null);
  const { data: contractorsRaw = [], isLoading: loadingContractors } = useContractors(supplierType === "Contractor" ? selectedTenderId : null);

  const createPV = useCreatePV({ onSuccess, onClose: onclose });
  const createRV = useCreateRV({ onSuccess, onClose: onclose });

  /* ── Auto-fill voucher number ── */
  useEffect(() => {
    if (isPV && nextPVNo) setValue("doc_no", nextPVNo, { shouldDirty: false });
  }, [nextPVNo, isPV, setValue]);

  useEffect(() => {
    if (!isPV && nextRVNo) setValue("doc_no", nextRVNo, { shouldDirty: false });
  }, [nextRVNo, isPV, setValue]);

  /* ── Reset supplier when tender or type changes ── */
  useEffect(() => {
    setSelectedSupplierId("");
  }, [supplierType, selectedTenderId]);

  /* ── Options ── */
  const tenderOptions = tendersRaw.map(t => ({
    value:       t.tender_id,
    label:       t.tender_project_name ? `${t.tender_id} – ${t.tender_project_name}` : t.tender_id,
    _id:         t._id || "",
    tender_name: t.tender_project_name || t.tender_id,
  }));

  const supplierOptions = (supplierType === "Vendor" ? vendorsRaw : contractorsRaw).map(s => ({
    value: s.vendor_id || s.contractor_id || s.id || "",
    label: `${s.vendor_id || s.contractor_id || s.id || ""} – ${s.vendor_name || s.contractor_name || s.name || ""}`,
  }));

  const isLoadingSuppliers = supplierType === "Vendor" ? loadingVendors : loadingContractors;

  /* ── Handlers ── */
  const handleTenderSelect = (option) => {
    setSelectedTenderId(option.value);
    setSelectedTenderRef(option._id || "");
    setSelectedTenderName(option.tender_name || "");
    setSelectedSupplierId("");
  };

  const handleVoucherTypeChange = (type) => {
    if (type === voucherType) return;
    setVoucherType(type);
    setSelectedTenderId("");
    setSelectedTenderRef("");
    setSelectedTenderName("");
    setSelectedSupplierId("");
    setTxMode("NEFT");
    setBillRefs([emptyBillRef()]);
    setEntries([emptyEntry(), emptyEntry()]);
    reset({
      doc_no: "", doc_date: "", bank_name: "", bank_ref: "",
      cheque_no: "", cheque_date: "", amount: "", against_no: "", narration: "",
    });
  };

  /* ── Bill ref helpers (PV only) ── */
  const addBillRef    = () => setBillRefs(prev => [...prev, emptyBillRef()]);
  const removeBillRef = (idx) => setBillRefs(prev => prev.filter((_, i) => i !== idx));
  const updateBillRef = (idx, field, val) =>
    setBillRefs(prev => prev.map((b, i) => i === idx ? { ...b, [field]: val } : b));

  const billRefsTotal = billRefs.reduce((s, b) => s + (parseFloat(b.settled_amt) || 0), 0);

  /* ── Entry row helpers ── */
  const addEntry    = () => setEntries(prev => [...prev, emptyEntry()]);
  const removeEntry = (idx) => setEntries(prev => prev.filter((_, i) => i !== idx));
  const updateEntry = (idx, field, val) =>
    setEntries(prev => prev.map((e, i) => {
      if (i !== idx) return e;
      const updated = { ...e, [field]: val };
      if (field === "dr_cr") {
        updated.debit_amt  = val === "Dr" ? e.debit_amt  : "";
        updated.credit_amt = val === "Cr" ? e.credit_amt : "";
      }
      return updated;
    }));

  /* ── Entry totals ── */
  const totalDr  = entries.reduce((s, e) => s + (parseFloat(e.debit_amt)  || 0), 0);
  const totalCr  = entries.reduce((s, e) => s + (parseFloat(e.credit_amt) || 0), 0);
  const balanced = Math.abs(totalDr - totalCr) < 0.005;

  /* ── Submit ── */
  const onSubmit = (data) => {
    if (!selectedTenderId)   { toast.warning("Please select a tender");   return; }
    if (!selectedSupplierId) { toast.warning("Please select a supplier");  return; }
    const validEntries = entries.filter(e => e.account_name.trim());
    if (validEntries.length === 0) { toast.warning("Add at least one voucher entry"); return; }

    const commonPayload = {
      supplier_type: supplierType,
      supplier_id:   selectedSupplierId,
      tender_id:     selectedTenderId,
      tender_ref:    selectedTenderRef  || undefined,
      tender_name:   selectedTenderName || undefined,
      bank_name:     data.bank_name     || undefined,
      bank_ref:      data.bank_ref      || undefined,
      cheque_no:     txMode === "Cheque" ? (data.cheque_no   || undefined) : undefined,
      cheque_date:   txMode === "Cheque" ? (data.cheque_date || undefined) : undefined,
      amount:        Number(data.amount),
      entries: validEntries.map(e => ({
        dr_cr:        e.dr_cr,
        account_name: e.account_name,
        debit_amt:    parseFloat(e.debit_amt)  || 0,
        credit_amt:   parseFloat(e.credit_amt) || 0,
      })),
      narration: data.narration || undefined,
      status:    saveStatusRef.current,
    };

    if (isPV) {
      const validBillRefs = billRefs.filter(b => b.bill_no.trim());
      createPV.mutate({
        pv_no:      data.doc_no,
        pv_date:    data.doc_date,
        payment_mode: txMode,
        bill_refs: validBillRefs.map(b => ({
          bill_no:     b.bill_no,
          settled_amt: parseFloat(b.settled_amt) || 0,
        })),
        ...commonPayload,
      });
    } else {
      createRV.mutate({
        rv_no:         data.doc_no,
        rv_date:       data.doc_date,
        receipt_mode:  txMode,
        against_no:    data.against_no || undefined,
        ...commonPayload,
      });
    }
  };

  const isSaving = createPV.isPending || createRV.isPending;

  /* ── Theme ── */
  const theme = isPV
    ? { accent: "blue",    saveBg: "bg-blue-600 hover:bg-blue-700",       badge: "bg-blue-500",    ring: "ring-blue-400"    }
    : { accent: "emerald", saveBg: "bg-emerald-600 hover:bg-emerald-700", badge: "bg-emerald-500", ring: "ring-emerald-400" };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-gray-950 font-layout-font overflow-hidden">

      {/* ══ Top bar ══════════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-slate-800 dark:bg-gray-900 px-6 py-3 flex items-center justify-between border-b border-slate-700 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPV ? "bg-blue-500/20" : "bg-emerald-500/20"}`}>
            {isPV
              ? <FiArrowUpRight className="text-blue-400 text-base" />
              : <FiArrowDownLeft className="text-emerald-400 text-base" />
            }
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              {isPV ? "PAYMENT VOUCHER" : "RECEIPT VOUCHER"} — NEW ENTRY
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isPV
                ? "Outgoing payment to a supplier — settles purchase bill or weekly billing"
                : "Incoming receipt from a supplier — advance refund, deposit return, overpayment"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Voucher type toggle */}
          <div className="flex bg-slate-700/60 rounded-lg p-1 gap-1">
            {[["PV", "Payment Voucher"], ["RV", "Receipt Voucher"]].map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => handleVoucherTypeChange(type)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  voucherType === type
                    ? `${type === "PV" ? "bg-blue-500" : "bg-emerald-500"} text-white shadow`
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onclose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <IoClose size={18} />
          </button>
        </div>
      </div>

      {/* ══ Scrollable body ══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-5 space-y-4">

          {/* ── Row 1: Voucher Identity | Party Details ──────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Voucher Identity */}
            <SectionCard iconEl={<FiFileText />} title="Voucher Identity" accent="slate">
              <div className="grid grid-cols-2 gap-3">
                <Field label={isPV ? "PV No." : "RV No."} required error={errors.doc_no}>
                  <input
                    type="text"
                    {...register("doc_no")}
                    readOnly
                    className={readonlyCls}
                    placeholder="Auto-generated..."
                  />
                </Field>

                <Field label="Date" required error={errors.doc_date}>
                  <input type="date" {...register("doc_date")} className={inputCls} />
                </Field>

                {/* Payment / Receipt mode pills */}
                <Field label={isPV ? "Payment Mode" : "Receipt Mode"} required>
                  <div className="flex flex-wrap gap-1.5">
                    {PAYMENT_MODES.map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTxMode(mode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          txMode === mode
                            ? isPV
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                              : "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* RV only: Against document */}
                {!isPV && (
                  <Field label="Against Document No." error={errors.against_no}>
                    <input
                      type="text"
                      {...register("against_no")}
                      className={inputCls}
                      placeholder="e.g. ADV/25-26/0001"
                    />
                  </Field>
                )}
              </div>
            </SectionCard>

            {/* Party Details */}
            <SectionCard iconEl={<FiUser />} title="Party Details" accent="blue">
              <div className="space-y-3">

                <Field label="Supplier Type" required>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1 w-fit">
                    {["Vendor", "Contractor"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSupplierType(type)}
                        className={`px-5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          supplierType === type
                            ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Project / Tender" required>
                  <SearchableSelect
                    options={tenderOptions}
                    value={selectedTenderId}
                    onChange={handleTenderSelect}
                    placeholder="Select tender..."
                    isLoading={loadingTenders}
                  />
                </Field>

                <Field label={supplierType} required>
                  <SearchableSelect
                    options={supplierOptions}
                    value={selectedSupplierId}
                    onChange={(o) => setSelectedSupplierId(o.value)}
                    placeholder={selectedTenderId ? `Select ${supplierType.toLowerCase()}...` : "Select a tender first"}
                    disabled={!selectedTenderId}
                    isLoading={isLoadingSuppliers}
                  />
                </Field>

              </div>
            </SectionCard>
          </div>

          {/* ── Row 2: Payment Instrument | Amount & Narration ───────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Payment Instrument */}
            <SectionCard iconEl={<FiCreditCard />} title="Payment Instrument" accent={theme.accent}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bank Account Name" error={errors.bank_name}>
                  <input
                    type="text"
                    {...register("bank_name")}
                    className={inputCls}
                    placeholder="e.g. HDFC Current A/c"
                  />
                </Field>

                <Field label={txMode === "Cheque" ? "Cheque / UTR Ref." : "UTR / Transaction Ref."} error={errors.bank_ref}>
                  <input
                    type="text"
                    {...register("bank_ref")}
                    className={inputCls}
                    placeholder={txMode === "Cheque" ? "Cheque number" : "UTR reference"}
                  />
                </Field>

                {/* Cheque-specific fields */}
                {txMode === "Cheque" && (
                  <>
                    <Field label="Cheque No." error={errors.cheque_no}>
                      <input
                        type="text"
                        {...register("cheque_no")}
                        className={inputCls}
                        placeholder="e.g. 000123"
                      />
                    </Field>
                    <Field label="Cheque Date" error={errors.cheque_date}>
                      <input type="date" {...register("cheque_date")} className={inputCls} />
                    </Field>
                  </>
                )}

                {/* Mode badge */}
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                    isPV
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                      : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800"
                  }`}>
                    {isPV ? <FiArrowUpRight size={13} /> : <FiArrowDownLeft size={13} />}
                    {isPV ? "Payment going out via" : "Receipt coming in via"} <strong>{txMode}</strong>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Amount & Narration */}
            <SectionCard iconEl={<FiFileText />} title="Amount & Narration" accent="amber">
              <div className="space-y-3">
                <Field label="Total Amount" required error={errors.amount}>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-400 font-semibold">₹</span>
                    <input
                      type="number" step="0.01" min="0"
                      {...register("amount")}
                      className={`${inputCls} pl-7`}
                      placeholder="0.00"
                    />
                  </div>
                </Field>

                {/* PV: show bill refs total hint */}
                {isPV && billRefsTotal > 0 && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                    Bill refs total: <strong>₹{billRefsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                    — amount should match if fully settling
                  </div>
                )}

                <Field label="Narration" error={errors.narration}>
                  <textarea
                    {...register("narration")}
                    rows={isPV ? 3 : 4}
                    className={`${inputCls} resize-none`}
                    placeholder={
                      isPV
                        ? "e.g. Net payment after CN and DN deductions — PB/25-26/0001"
                        : "e.g. Advance refund — excess amount returned by vendor"
                    }
                  />
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* ── PV only: Bill References ─────────────────────────────────── */}
          {isPV && (
            <SectionCard iconEl={<FiList />} title="Bills Being Settled" accent="indigo" overflow>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {["#", "Bill No.", "Settled Amount (₹)", ""].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                    {billRefs.map((ref, i) => (
                      <tr key={i} className="group">
                        <td className="px-3 py-2.5 w-10 text-xs text-gray-400">{i + 1}</td>

                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            value={ref.bill_no}
                            onChange={e => updateBillRef(i, "bill_no", e.target.value)}
                            className={inputCls}
                            placeholder="e.g. PB/25-26/0001 or WB/25-26/0001"
                          />
                        </td>

                        <td className="px-3 py-2.5 w-52">
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-semibold">₹</span>
                            <input
                              type="number" step="0.01" min="0"
                              value={ref.settled_amt}
                              onChange={e => updateBillRef(i, "settled_amt", e.target.value)}
                              className={`${inputCls} pl-6`}
                              placeholder="0.00"
                            />
                          </div>
                        </td>

                        <td className="px-3 py-2.5 w-10">
                          {billRefs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBillRef(i)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={addBillRef}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    <FiPlus size={13} /> Add Bill Row
                  </button>
                  {billRefsTotal > 0 && (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold tabular-nums">
                      Total settling: ₹{billRefsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── Voucher Entries (Dr/Cr table) ─────────────────────────────── */}
          <SectionCard iconEl={<FiList />} title="Voucher Entries" accent="violet" overflow>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Dr / Cr", "Account Name", "Debit Amount (₹)", "Credit Amount (₹)", ""].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {entries.map((entry, i) => (
                    <tr key={i} className="group">

                      {/* Dr / Cr toggle */}
                      <td className="px-3 py-2.5 w-28">
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                          {["Dr", "Cr"].map(side => (
                            <button
                              key={side}
                              type="button"
                              onClick={() => updateEntry(i, "dr_cr", side)}
                              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                                entry.dr_cr === side
                                  ? side === "Dr"
                                    ? "bg-red-500 text-white shadow-sm"
                                    : "bg-blue-500 text-white shadow-sm"
                                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              }`}
                            >
                              {side}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Account Name */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={entry.account_name}
                          onChange={e => updateEntry(i, "account_name", e.target.value)}
                          className={inputCls}
                          placeholder={
                            i === 0
                              ? isPV ? "e.g. ABC Suppliers Pvt Ltd (Supplier A/c)" : "e.g. HDFC Current A/c (Bank A/c)"
                              : isPV ? "e.g. HDFC Current A/c (Bank A/c)"         : "e.g. ABC Suppliers Pvt Ltd (Supplier A/c)"
                          }
                        />
                      </td>

                      {/* Debit Amount */}
                      <td className="px-3 py-2.5 w-44">
                        <input
                          type="number" step="0.01" min="0"
                          value={entry.debit_amt}
                          onChange={e => updateEntry(i, "debit_amt", e.target.value)}
                          disabled={entry.dr_cr === "Cr"}
                          className={entry.dr_cr === "Cr" ? readonlyCls : inputCls}
                          placeholder="0.00"
                        />
                      </td>

                      {/* Credit Amount */}
                      <td className="px-3 py-2.5 w-44">
                        <input
                          type="number" step="0.01" min="0"
                          value={entry.credit_amt}
                          onChange={e => updateEntry(i, "credit_amt", e.target.value)}
                          disabled={entry.dr_cr === "Dr"}
                          className={entry.dr_cr === "Dr" ? readonlyCls : inputCls}
                          placeholder="0.00"
                        />
                      </td>

                      {/* Remove row */}
                      <td className="px-3 py-2.5 w-10">
                        {entries.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEntry(i)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer: add row + balance indicator */}
              <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addEntry}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <FiPlus size={13} /> Add Entry Row
                </button>

                <div className="flex items-center gap-5 text-xs">
                  <span className="text-gray-400">
                    Total Dr:{" "}
                    <strong className="text-red-600 dark:text-red-400 tabular-nums">
                      {totalDr.toFixed(2)}
                    </strong>
                  </span>
                  <span className="text-gray-400">
                    Total Cr:{" "}
                    <strong className="text-blue-600 dark:text-blue-400 tabular-nums">
                      {totalCr.toFixed(2)}
                    </strong>
                  </span>
                  {(totalDr > 0 || totalCr > 0) && (
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      balanced
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                    }`}>
                      {balanced ? "✓ Balanced" : `Diff: ${Math.abs(totalDr - totalCr).toFixed(2)}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ledger effect hint */}
            <div className="mt-4 mx-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Expected Ledger Effect</p>
              {isPV ? (
                <div className="text-xs space-y-0.5 font-mono">
                  <div className="flex gap-6">
                    <span className="text-red-500 font-semibold w-5">Dr</span>
                    <span className="text-gray-600 dark:text-gray-300">Supplier A/c</span>
                    <span className="text-gray-400 ml-auto">← liability cleared</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-blue-500 font-semibold w-5">Cr</span>
                    <span className="text-gray-600 dark:text-gray-300">Bank / Cash A/c</span>
                    <span className="text-gray-400 ml-auto">← money leaves</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs space-y-0.5 font-mono">
                  <div className="flex gap-6">
                    <span className="text-red-500 font-semibold w-5">Dr</span>
                    <span className="text-gray-600 dark:text-gray-300">Bank / Cash A/c</span>
                    <span className="text-gray-400 ml-auto">← money arrives</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-blue-500 font-semibold w-5">Cr</span>
                    <span className="text-gray-600 dark:text-gray-300">Supplier A/c</span>
                    <span className="text-gray-400 ml-auto">← reduces advance or creates credit</span>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

        </div>
      </div>

      {/* ══ Footer bar ═══════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between gap-3">
        <div className="text-xs text-gray-400">
          {isPV
            ? "Payment Voucher — Dr Supplier A/c, Cr Bank A/c"
            : "Receipt Voucher — Dr Bank A/c, Cr Supplier A/c"}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onclose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              saveStatusRef.current = "draft";
              handleSubmit(onSubmit)();
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              saveStatusRef.current = "pending";
              handleSubmit(onSubmit)();
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 ${theme.saveBg}`}
          >
            {isSaving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : <><FiSave size={14} /> Save as Pending</>
            }
          </button>
        </div>
      </div>

    </div>
  );
};

export default CreateVoucher;

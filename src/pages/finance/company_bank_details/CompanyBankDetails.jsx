import { useState, useMemo } from "react";
import {
  Building2, Plus, RefreshCw, Pencil, Trash2,
  Loader2, X, Search, AlertTriangle, CreditCard,
  Landmark, TrendingUp,
} from "lucide-react";
import {
  useCompanyBankDetails,
  useCreateBankDetail,
  useUpdateBankDetail,
  useDeleteBankDetail,
} from "./hooks/useCompanyBankDetails";

/* ── Constants ───────────────────────────────────────────────────────────── */
const ACCOUNT_TYPES = ["Savings", "Current", "OD", "CC", "Fixed Deposit"];

const EMPTY_FORM = {
  account_code:        "",
  account_name:        "",
  bank_name:           "",
  account_number:      "",
  ifsc_code:           "",
  bank_address:        "",
  account_holder_name: "",
  account_type:        "Current",
  interest_pct:        "",
  credit_limit:        "",
  debit_limit:         "",
  discount_limit:      "",
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const inputCls =
  "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition";

const fmt = (n) =>
  n != null && n !== "" && Number(n) !== 0
    ? Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })
    : "—";

const Field = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-gray-400 dark:text-gray-500">{hint}</p>}
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 pb-1.5 border-b border-gray-100 dark:border-gray-800">
      {title}
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

const AccountTypeBadge = ({ type }) => {
  const colors = {
    Savings:         "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800",
    Current:         "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800",
    OD:              "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800",
    CC:              "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-800",
    "Fixed Deposit": "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-100 dark:border-sky-800",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colors[type] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {type}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   FORM MODAL
══════════════════════════════════════════════════════════════════════════ */
const BankFormModal = ({ onClose, editData }) => {
  const isEdit = !!editData;

  const [form, setForm] = useState(() =>
    isEdit
      ? {
          account_code:        editData.account_code        ?? "",
          account_name:        editData.account_name        ?? "",
          bank_name:           editData.bank_name           ?? "",
          account_number:      editData.account_number      ?? "",
          ifsc_code:           editData.ifsc_code           ?? "",
          bank_address:        editData.bank_address        ?? "",
          account_holder_name: editData.account_holder_name ?? "",
          account_type:        editData.account_type        ?? "Current",
          interest_pct:        editData.interest_pct        ?? "",
          credit_limit:        editData.credit_limit        ?? "",
          debit_limit:         editData.debit_limit         ?? "",
          discount_limit:      editData.discount_limit      ?? "",
        }
      : EMPTY_FORM
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const createMutation = useCreateBankDetail({ onClose });
  const updateMutation = useUpdateBankDetail({ onClose });
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    ["interest_pct", "credit_limit", "debit_limit", "discount_limit"].forEach(k => {
      if (payload[k] !== "" && payload[k] != null) payload[k] = Number(payload[k]);
      else delete payload[k];
    });
    Object.keys(payload).forEach(k => payload[k] === "" && delete payload[k]);

    if (isEdit) updateMutation.mutate({ id: editData._id, ...payload });
    else        createMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
              <Landmark size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {isEdit ? "Edit Bank Account" : "Add Bank Account"}
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Company bank details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          <Section title="Account Identity">
            <Field label="Account Code" required hint="Convention: 1020-HDFC-001, 1020-SBI-001">
              <input
                className={inputCls}
                placeholder="e.g. 1020-HDFC-001"
                value={form.account_code}
                onChange={e => set("account_code", e.target.value)}
                required
                disabled={isEdit}
              />
            </Field>
            <Field label="Account Name" required>
              <input
                className={inputCls}
                placeholder="e.g. HDFC Current Account"
                value={form.account_name}
                onChange={e => set("account_name", e.target.value)}
                required
              />
            </Field>
          </Section>

          <Section title="Bank Information">
            <Field label="Bank Name" required>
              <input
                className={inputCls}
                placeholder="e.g. HDFC Bank, SBI, ICICI"
                value={form.bank_name}
                onChange={e => set("bank_name", e.target.value)}
                required
              />
            </Field>
            <Field label="Account Type">
              <select
                className={inputCls}
                value={form.account_type}
                onChange={e => set("account_type", e.target.value)}
              >
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Account Number" required>
              <input
                className={inputCls}
                placeholder="e.g. 50100123456789"
                value={form.account_number}
                onChange={e => set("account_number", e.target.value)}
                required
              />
            </Field>
            <Field label="IFSC Code">
              <input
                className={inputCls}
                placeholder="e.g. HDFC0001234"
                value={form.ifsc_code}
                onChange={e => set("ifsc_code", e.target.value.toUpperCase())}
              />
            </Field>
            <Field label="Account Holder Name">
              <input
                className={inputCls}
                placeholder="e.g. Romaa Construction Pvt Ltd"
                value={form.account_holder_name}
                onChange={e => set("account_holder_name", e.target.value)}
              />
            </Field>
            <Field label="Branch Address">
              <input
                className={inputCls}
                placeholder="e.g. MG Road Branch, Bengaluru"
                value={form.bank_address}
                onChange={e => set("bank_address", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Limits & Rates">
            <Field label="Interest %" hint="For OD / CC accounts">
              <input
                type="number" step="0.01" min="0"
                className={inputCls}
                placeholder="e.g. 10.5"
                value={form.interest_pct}
                onChange={e => set("interest_pct", e.target.value)}
              />
            </Field>
            <Field label="Credit Limit (₹)">
              <input
                type="number" min="0"
                className={inputCls}
                placeholder="e.g. 5000000"
                value={form.credit_limit}
                onChange={e => set("credit_limit", e.target.value)}
              />
            </Field>
            <Field label="Daily Debit Limit (₹)">
              <input
                type="number" min="0"
                className={inputCls}
                placeholder="e.g. 200000"
                value={form.debit_limit}
                onChange={e => set("debit_limit", e.target.value)}
              />
            </Field>
            <Field label="Discount Limit (₹)" hint="Bill discounting limit">
              <input
                type="number" min="0"
                className={inputCls}
                placeholder="e.g. 1000000"
                value={form.discount_limit}
                onChange={e => set("discount_limit", e.target.value)}
              />
            </Field>
          </Section>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 transition-colors"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Save Changes" : "Add Bank Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   DELETE MODAL
══════════════════════════════════════════════════════════════════════════ */
const DeleteModal = ({ bank, onClose }) => {
  const { mutate, isPending } = useDeleteBankDetail({ onClose });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-orange-400" />
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 flex items-center justify-center mb-4">
            <Trash2 size={20} className="text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Delete Bank Account</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 dark:text-gray-200">{bank.account_name}</strong>?
          </p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 mb-4">
            <CreditCard size={13} className="text-gray-400 shrink-0" />
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{bank.account_code}</span>
            {bank.account_number && (
              <>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{bank.account_number}</span>
              </>
            )}
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 mb-5">
            <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              This will also deactivate the linked account in the Chart of Accounts.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => mutate(bank._id)}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   BANK CARD
══════════════════════════════════════════════════════════════════════════ */
const BankCard = ({ bank, onEdit, onDelete }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
    <div className="p-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center shrink-0">
            <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{bank.bank_name}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{bank.account_name}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {!bank.is_active && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400">INACTIVE</span>
          )}
          {bank.account_type && <AccountTypeBadge type={bank.account_type} />}
        </div>
      </div>

      {/* Details grid */}
      <div className="space-y-2 text-[11px] mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-medium">Account No</span>
          <span className="text-gray-700 dark:text-gray-200 font-mono font-semibold">{bank.account_number || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-medium">Code</span>
          <span className="text-gray-700 dark:text-gray-200 font-mono">{bank.account_code}</span>
        </div>
        {bank.ifsc_code && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">IFSC</span>
            <span className="text-gray-700 dark:text-gray-200 font-mono">{bank.ifsc_code}</span>
          </div>
        )}
        {bank.account_holder_name && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400 font-medium shrink-0">Holder</span>
            <span className="text-gray-600 dark:text-gray-300 truncate text-right">{bank.account_holder_name}</span>
          </div>
        )}
        {bank.bank_address && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400 font-medium shrink-0">Branch</span>
            <span className="text-gray-600 dark:text-gray-300 truncate text-right">{bank.bank_address}</span>
          </div>
        )}
      </div>

      {/* Limits row — only shown if any limit exists */}
      {(bank.credit_limit > 0 || bank.debit_limit > 0 || bank.discount_limit > 0 || bank.interest_pct > 0) && (
        <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-4">
          {bank.interest_pct > 0 && (
            <div>
              <p className="text-gray-400">Interest</p>
              <p className="font-semibold text-gray-700 dark:text-gray-200">{bank.interest_pct}%</p>
            </div>
          )}
          {bank.credit_limit > 0 && (
            <div>
              <p className="text-gray-400">Credit Limit</p>
              <p className="font-semibold text-gray-700 dark:text-gray-200">₹{fmt(bank.credit_limit)}</p>
            </div>
          )}
          {bank.debit_limit > 0 && (
            <div>
              <p className="text-gray-400">Daily Debit</p>
              <p className="font-semibold text-gray-700 dark:text-gray-200">₹{fmt(bank.debit_limit)}</p>
            </div>
          )}
          {bank.discount_limit > 0 && (
            <div>
              <p className="text-gray-400">Discount</p>
              <p className="font-semibold text-gray-700 dark:text-gray-200">₹{fmt(bank.discount_limit)}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
        <button
          onClick={() => onEdit(bank)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={() => onDelete(bank)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
const CompanyBankDetails = () => {
  const [search, setSearch]         = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editBank, setEditBank]     = useState(null);
  const [deleteBank, setDeleteBank] = useState(null);

  const { data: banks = [], isLoading, isFetching, refetch } = useCompanyBankDetails();

  const filtered = useMemo(() => {
    if (!search) return banks;
    const q = search.toLowerCase();
    return banks.filter(b =>
      (b.bank_name           || "").toLowerCase().includes(q) ||
      (b.account_name        || "").toLowerCase().includes(q) ||
      (b.account_code        || "").toLowerCase().includes(q) ||
      (b.account_number      || "").toLowerCase().includes(q) ||
      (b.ifsc_code           || "").toLowerCase().includes(q) ||
      (b.account_holder_name || "").toLowerCase().includes(q)
    );
  }, [banks, search]);

  const activeCount   = banks.filter(b => b.is_active).length;
  const totalCredit   = banks.reduce((s, b) => s + (Number(b.credit_limit)   || 0), 0);
  const totalDebit    = banks.reduce((s, b) => s + (Number(b.debit_limit)    || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19]">

      {/* ═══ HEADER ═══ */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
              <Building2 size={17} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">Company Bank Accounts</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Finance · Company Bank Details</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                className="pl-8 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-52 transition"
                placeholder="Search bank, account, IFSC…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-none transition-colors"
            >
              <Plus size={14} /> Add Bank Account
            </button>
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div className="max-w-screen-xl mx-auto px-6 pt-6 pb-24">

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Accounts",     value: banks.length,            icon: Building2,  color: "text-indigo-600 dark:text-indigo-400",  bg: "bg-indigo-50 dark:bg-indigo-900/30" },
            { label: "Active",             value: activeCount,             icon: Landmark,   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
            { label: "Total Credit Limit", value: `₹${fmt(totalCredit)}`,  icon: CreditCard, color: "text-sky-600 dark:text-sky-400",        bg: "bg-sky-50 dark:bg-sky-900/30",       small: true },
            { label: "Total Daily Debit",  value: `₹${fmt(totalDebit)}`,   icon: TrendingUp, color: "text-violet-600 dark:text-violet-400",  bg: "bg-violet-50 dark:bg-violet-900/30", small: true },
          ].map(({ label, value, icon: Icon, color, bg, small }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</p>
                <p className={`font-bold text-gray-900 dark:text-white mt-0.5 ${small ? "text-xs" : "text-lg"}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <span className="block w-8 h-8 border-[3px] border-gray-200 dark:border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs font-medium">Loading bank accounts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Building2 size={28} className="text-gray-300 dark:text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {search ? "No accounts match your search" : "No bank accounts added yet"}
              </p>
              {!search && (
                <p className="text-xs text-gray-400 mt-1">Add your company's bank accounts to get started</p>
              )}
            </div>
            {!search && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <Plus size={13} /> Add Bank Account
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(bank => (
              <BankCard
                key={bank._id}
                bank={bank}
                onEdit={setEditBank}
                onDelete={setDeleteBank}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && <BankFormModal onClose={() => setShowCreate(false)} />}
      {editBank   && <BankFormModal onClose={() => setEditBank(null)} editData={editBank} />}
      {deleteBank && <DeleteModal  bank={deleteBank} onClose={() => setDeleteBank(null)} />}
    </div>
  );
};

export default CompanyBankDetails;

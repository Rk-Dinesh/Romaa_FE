import { useState } from "react";
import { CheckCircle, RefreshCw, Plus, X, Check, Clock, AlertCircle } from "lucide-react";
import {
  useApprovalPendingForMe, useApprovalRequests, useApprovalRules,
  useApproveRequest, useRejectRequest, useWithdrawRequest, useCreateApprovalRule,
} from "./hooks/useApprovals";

const STATUS_BADGE = {
  pending:  { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: <Clock size={10} /> },
  approved: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", icon: <Check size={10} /> },
  rejected: { cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", icon: <X size={10} /> },
  withdrawn:{ cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400", icon: <AlertCircle size={10} /> },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_BADGE[status?.toLowerCase()] || STATUS_BADGE.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${s.cls}`}>
      {s.icon}{status}
    </span>
  );
};

/* ── Rule Row ───────────────────────────────────────────────────── */
const RuleRow = ({ rule }) => (
  <tr className="border-b border-gray-50 dark:border-gray-800">
    <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 capitalize">{rule.source_type?.replace(/_/g, " ")}</td>
    <td className="px-4 py-2 tabular-nums text-right text-gray-600 dark:text-gray-300">
      {rule.min_amount != null ? `₹${Number(rule.min_amount).toLocaleString("en-IN")}` : "—"}
    </td>
    <td className="px-4 py-2 tabular-nums text-right text-gray-600 dark:text-gray-300">
      {rule.max_amount != null ? `₹${Number(rule.max_amount).toLocaleString("en-IN")}` : "—"}
    </td>
    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{(rule.approver_roles || []).join(", ")}</td>
    <td className="px-4 py-2 text-right text-gray-500">{rule.approvals_required ?? 1}</td>
  </tr>
);

/* ── Request Row ────────────────────────────────────────────────── */
const RequestRow = ({ req, onApprove, onReject, onWithdraw, isMine }) => (
  <tr className="border-b border-gray-50 dark:border-gray-800">
    <td className="px-4 py-2">
      <p className="font-semibold text-gray-700 dark:text-gray-200 font-mono text-[11px]">{req.request_no}</p>
      <p className="text-[10px] text-gray-400 capitalize">{req.source_type?.replace(/_/g, " ")}</p>
    </td>
    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{req.source_ref}</td>
    <td className="px-4 py-2 tabular-nums text-right font-semibold text-gray-700 dark:text-gray-200">
      {req.amount != null ? `₹${Number(req.amount).toLocaleString("en-IN")}` : "—"}
    </td>
    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{req.requested_by}</td>
    <td className="px-4 py-2"><StatusBadge status={req.status} /></td>
    <td className="px-4 py-2 text-right">
      <div className="flex items-center justify-end gap-1.5">
        {isMine && req.status === "pending" && (
          <>
            <button onClick={() => onApprove(req._id || req.request_no)}
              className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold">
              Approve
            </button>
            <button onClick={() => onReject(req._id || req.request_no)}
              className="px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded text-[10px] font-semibold">
              Reject
            </button>
          </>
        )}
        {!isMine && req.status === "pending" && (
          <button onClick={() => onWithdraw(req._id || req.request_no)}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-[10px] font-semibold">
            Withdraw
          </button>
        )}
      </div>
    </td>
  </tr>
);

/* ── New Rule Modal ─────────────────────────────────────────────── */
const NewRuleModal = ({ onClose }) => {
  const [form, setForm] = useState({ source_type: "", min_amount: "", max_amount: "", approver_roles: "", approvals_required: 1 });
  const create = useCreateApprovalRule({ onSuccess: onClose });
  const submit = () => {
    create.mutate({
      ...form,
      min_amount: form.min_amount ? +form.min_amount : undefined,
      max_amount: form.max_amount ? +form.max_amount : undefined,
      approver_roles: form.approver_roles.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-3">
        <p className="text-sm font-bold text-gray-800 dark:text-white">New Approval Rule</p>
        {[
          { label: "Source Type", key: "source_type", placeholder: "e.g. purchase_bill" },
          { label: "Min Amount", key: "min_amount", placeholder: "0" },
          { label: "Max Amount", key: "max_amount", placeholder: "leave blank for unlimited" },
          { label: "Approver Roles (comma separated)", key: "approver_roles", placeholder: "admin, finance_manager" },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
            <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
          </div>
        ))}
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Approvals Required</label>
          <input type="number" min={1} value={form.approvals_required} onChange={(e) => setForm({ ...form, approvals_required: +e.target.value })}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={submit} disabled={create.isPending} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
            {create.isPending ? "Saving…" : "Save Rule"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────── */
const Approvals = () => {
  const [tab, setTab] = useState("mine");
  const [showNewRule, setShowNewRule] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  const { data: mine = [], isLoading: mineLoading, refetch: refetchMine } = useApprovalPendingForMe();
  const { data: all = [], isLoading: allLoading, refetch: refetchAll } = useApprovalRequests();
  const { data: rules = [], isLoading: rulesLoading, refetch: refetchRules } = useApprovalRules();

  const approve = useApproveRequest();
  const reject = useRejectRequest({ onSuccess: () => { setRejectId(null); setRejectNote(""); } });
  const withdraw = useWithdrawRequest();

  const safeAll = Array.isArray(all) ? all : [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={18} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Enterprise</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Approval Workflows</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1">
            {[{ key: "mine", label: "My Approvals" }, { key: "all", label: "All Requests" }, { key: "rules", label: "Policies" }].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === key ? "bg-indigo-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700"}`}>
                {label}
                {key === "mine" && Array.isArray(mine) && mine.length > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white rounded-full text-[9px] px-1.5 py-0.5">{mine.length}</span>
                )}
              </button>
            ))}
          </div>
          {tab === "rules" && (
            <button onClick={() => setShowNewRule(true)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg ml-2">
              <Plus size={12} />New Rule
            </button>
          )}
          <button onClick={() => tab === "mine" ? refetchMine() : tab === "all" ? refetchAll() : refetchRules()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 ml-1"><RefreshCw size={15} /></button>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* My Approvals */}
        {tab === "mine" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            {mineLoading && <div className="py-10 text-center text-sm text-gray-400">Loading…</div>}
            {!mineLoading && (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Request", "Reference", "Amount", "Requested By", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {(Array.isArray(mine) ? mine : []).map((req) => (
                    <RequestRow key={req._id || req.request_no} req={req} isMine
                      onApprove={(id) => approve.mutate({ id })}
                      onReject={(id) => setRejectId(id)}
                      onWithdraw={() => {}}
                    />
                  ))}
                  {!Array.isArray(mine) || mine.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">No pending approvals.</td></tr> : null}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* All Requests */}
        {tab === "all" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            {allLoading && <div className="py-10 text-center text-sm text-gray-400">Loading…</div>}
            {!allLoading && (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Request", "Reference", "Amount", "Requested By", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {safeAll.map((req) => (
                    <RequestRow key={req._id || req.request_no} req={req} isMine={false}
                      onApprove={() => {}} onReject={() => {}}
                      onWithdraw={(id) => withdraw.mutate({ id })}
                    />
                  ))}
                  {!safeAll.length && <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">No requests found.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Policies / Rules */}
        {tab === "rules" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            {rulesLoading && <div className="py-10 text-center text-sm text-gray-400">Loading…</div>}
            {!rulesLoading && (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Source Type", "Min Amount", "Max Amount", "Approver Roles", "Required"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {(Array.isArray(rules) ? rules : []).map((r, i) => <RuleRow key={i} rule={r} />)}
                  {(!Array.isArray(rules) || !rules.length) && <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400">No approval rules configured.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showNewRule && <NewRuleModal onClose={() => setShowNewRule(false)} />}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-3">
            <p className="text-sm font-bold text-gray-800 dark:text-white">Reject Request</p>
            <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason (required)" rows={3}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectId(null)} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => reject.mutate({ id: rejectId, note: rejectNote })} disabled={!rejectNote || reject.isPending}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                {reject.isPending ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;

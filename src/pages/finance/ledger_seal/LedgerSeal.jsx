import { useState } from "react";
import { Lock, RefreshCw, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { useLedgerSealStatus, useLedgerSealList, useLedgerSealVerify, useSealApproved } from "./hooks/useLedgerSeal";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const TABS = [
  { key: "status", label: "Status" },
  { key: "verify", label: "Verify Range" },
  { key: "chain", label: "Chain Ledger" },
];

/* ── Status Tab ─────────────────────────────────────────────────── */
const StatusTab = ({ onSeal }) => {
  const { data: status, isLoading, refetch } = useLedgerSealStatus();
  const seal = useSealApproved();

  if (isLoading) return <div className="py-12 text-center text-sm text-gray-400">Loading…</div>;

  const isSealed = status?.last_sealed_at != null;
  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-6 flex items-center gap-5 ${isSealed ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700" : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"}`}>
        {isSealed ? <ShieldCheck size={36} className="text-emerald-600 shrink-0" /> : <ShieldAlert size={36} className="text-amber-600 shrink-0" />}
        <div>
          <p className={`text-sm font-extrabold ${isSealed ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
            {isSealed ? "Ledger Sealed" : "Unsealed Entries Present"}
          </p>
          {isSealed ? (
            <p className="text-xs text-gray-500 mt-1">Last sealed: {status?.last_sealed_at?.slice(0, 10)} · JEs in chain: {status?.sealed_count ?? "—"}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Pending approved JEs: {status?.pending_count ?? "—"}</p>
          )}
          {status?.last_hash && (
            <p className="text-[10px] font-mono text-gray-400 mt-1 truncate max-w-xs">Last hash: {status.last_hash}</p>
          )}
        </div>
        <div className="ml-auto">
          <button onClick={() => seal.mutate()} disabled={seal.isPending}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl">
            <Lock size={14} />{seal.isPending ? "Sealing…" : "Seal Approved JEs"}
          </button>
        </div>
      </div>

      {status?.stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total JEs Sealed", value: status.stats.total_sealed },
            { label: "Pending (Approved, Unsealed)", value: status.stats.pending_seal },
            { label: "Tamper Alerts", value: status.stats.tamper_alerts, alert: (status.stats.tamper_alerts || 0) > 0 },
          ].map(({ label, value, alert }) => (
            <div key={label} className={`bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-4 ${alert && value ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-800"}`}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className={`text-xl font-extrabold tabular-nums mt-1 ${alert && value ? "text-red-600" : "text-gray-800 dark:text-white"}`}>{value ?? "—"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Verify Tab ─────────────────────────────────────────────────── */
const VerifyTab = () => {
  const [params, setParams] = useState({ from_date: "", to_date: "" });
  const [applied, setApplied] = useState({});
  const { data, isLoading } = useLedgerSealVerify(applied);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input type="date" value={params.from_date} onChange={(e) => setParams({ ...params, from_date: e.target.value })}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
        <input type="date" value={params.to_date} onChange={(e) => setParams({ ...params, to_date: e.target.value })}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
        <button onClick={() => setApplied({ ...params })} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg">Verify</button>
      </div>
      {isLoading && <div className="py-8 text-center text-sm text-gray-400">Verifying chain integrity…</div>}
      {!isLoading && data && (
        <div className={`rounded-xl border p-5 ${data.all_valid ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"}`}>
          <div className="flex items-center gap-3 mb-3">
            {data.all_valid ? <ShieldCheck size={22} className="text-emerald-600" /> : <AlertTriangle size={22} className="text-red-600" />}
            <p className={`text-sm font-bold ${data.all_valid ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-400"}`}>
              {data.all_valid ? "All entries verified — chain intact" : `${data.tampered_count} tampered entries detected`}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              ["Checked", data.checked],
              ["Valid", data.valid_count],
              ["Tampered", data.tampered_count],
            ].map(([lbl, v]) => (
              <div key={lbl}><p className="text-gray-400">{lbl}</p><p className="font-bold text-gray-700 dark:text-gray-200">{v ?? 0}</p></div>
            ))}
          </div>
          {Array.isArray(data.tampered_entries) && data.tampered_entries.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Tampered JEs:</p>
              {data.tampered_entries.map((e, i) => (
                <p key={i} className="text-xs font-mono text-red-600 dark:text-red-400">{e.je_no} — {e.reason}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Chain Tab ──────────────────────────────────────────────────── */
const ChainTab = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useLedgerSealList({ page });
  const rows = Array.isArray(data?.data) ? data.data : [];
  const totalPages = data?.totalPages || 1;
  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
        {isLoading && <div className="py-8 text-center text-sm text-gray-400">Loading…</div>}
        {!isLoading && (
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              {["JE No.", "Date", "Amount", "Sealed At", "Hash (truncated)"].map((h) => (
                <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id || r.je_no} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400">{r.je_no}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{r.date?.slice(0, 10)}</td>
                  <td className="px-4 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.amount)}</td>
                  <td className="px-4 py-2 text-gray-400">{r.sealed_at?.slice(0, 16)?.replace("T", " ")}</td>
                  <td className="px-4 py-2 text-right font-mono text-gray-400 text-[10px]">{r.hash?.slice(0, 16)}…</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">No sealed entries.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40">Prev</button>
          <span className="text-xs text-gray-500 py-1">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────── */
const LedgerSeal = () => {
  const [tab, setTab] = useState("status");

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={18} className="text-slate-600 dark:text-slate-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Enterprise</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Ledger Seal — Tamper-Proof Chain</h1>
          </div>
        </div>
        <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1 w-fit">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === key ? "bg-slate-700 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {tab === "status" && <StatusTab />}
        {tab === "verify" && <VerifyTab />}
        {tab === "chain" && <ChainTab />}
      </div>
    </div>
  );
};

export default LedgerSeal;

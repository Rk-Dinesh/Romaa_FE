import { useState } from "react";
import { Archive, RefreshCw, CheckCircle, RotateCcw, ChevronRight, ChevronDown } from "lucide-react";
import {
  useYearEndCloseList, useYearEndCloseDetail, useYearEndClosePreview,
  useYearEndCloseOpeningBalances, usePerformYearEndClose, useReopenYearEnd,
} from "./hooks/useYearEndClose";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtCompact = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e7) return `₹${((n || 0) / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${((n || 0) / 1e5).toFixed(2)} L`;
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const currentFY = (() => {
  const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
})();

/* ── Preview Panel ──────────────────────────────────────────────── */
const PreviewPanel = ({ fy }) => {
  const { data, isLoading } = useYearEndClosePreview(fy);
  const d = data || {};
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 space-y-4">
      {isLoading && <p className="text-sm text-gray-400 text-center py-4">Loading preview…</p>}
      {!isLoading && (
        <>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">FY {fy} — Year-End Preview</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { label: "Net Profit / (Loss)", value: fmtCompact(d.net_profit), cls: (d.net_profit || 0) >= 0 ? "text-emerald-600" : "text-red-500" },
              { label: "Total Revenue", value: fmtCompact(d.total_income), cls: "text-gray-700 dark:text-gray-200" },
              { label: "Total Expenses", value: fmtCompact(d.total_expense), cls: "text-gray-700 dark:text-gray-200" },
              { label: "Retained Earnings (Opening)", value: fmtCompact(d.opening_retained_earnings), cls: "text-gray-700 dark:text-gray-200" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400">{label}</p>
                <p className={`font-bold mt-0.5 ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
          {Array.isArray(d.accounts_to_close) && d.accounts_to_close.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Accounts to be Closed</p>
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                  {["Account", "Type", "Balance"].map((h) => (
                    <th key={h} className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {d.accounts_to_close.map((a, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-3 py-1.5 text-gray-700 dark:text-gray-200">{a.account_name}</td>
                      <td className="px-3 py-1.5 text-gray-400 capitalize">{a.account_type}</td>
                      <td className="px-3 py-1.5 tabular-nums text-right font-semibold text-gray-700 dark:text-gray-200">₹{fmt(a.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Opening Balances Panel ─────────────────────────────────────── */
const OpeningBalancesPanel = ({ fy }) => {
  const { data: rows = [], isLoading } = useYearEndCloseOpeningBalances(fy);
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30">
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Opening Balances for next FY</span>
        <span className="ml-auto text-xs text-gray-400">{Array.isArray(rows) ? rows.length : 0} accounts</span>
      </button>
      {open && (
        <div className="overflow-x-auto">
          {isLoading ? <div className="py-6 text-center text-sm text-gray-400">Loading…</div> : (
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 dark:bg-gray-800/30">
                {["Account Code", "Account", "Type", "Opening Balance"].map((h) => (
                  <th key={h} className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(Array.isArray(rows) ? rows : []).map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="px-4 py-2 font-mono text-gray-400">{r.account_code}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{r.account_name}</td>
                    <td className="px-4 py-2 text-gray-400 capitalize">{r.account_type}</td>
                    <td className="px-4 py-2 tabular-nums text-right font-semibold text-gray-700 dark:text-gray-200">₹{fmt(r.opening_balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Confirm Dialog ─────────────────────────────────────────────── */
const ConfirmCloseDialog = ({ fy, onClose, onDone }) => {
  const [typed, setTyped] = useState("");
  const perform = usePerformYearEndClose({ onSuccess: onDone });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
        <p className="text-sm font-bold text-gray-800 dark:text-white">Confirm Year-End Close</p>
        <p className="text-xs text-gray-500">This will post the closing journal entry for <strong>FY {fy}</strong> and lock the period. This action is significant and requires confirmation.</p>
        <div>
          <p className="text-xs text-gray-500 mb-1">Type <strong className="text-gray-800 dark:text-white">{fy}</strong> to confirm:</p>
          <input value={typed} onChange={(e) => setTyped(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={() => perform.mutate({ financial_year: fy })} disabled={typed !== fy || perform.isPending}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40">
            {perform.isPending ? "Closing…" : "Close FY"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Reopen Dialog ──────────────────────────────────────────────── */
const ReopenDialog = ({ fy, onClose, onDone }) => {
  const [reason, setReason] = useState("");
  const reopen = useReopenYearEnd({ onSuccess: onDone });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
        <p className="text-sm font-bold text-gray-800 dark:text-white">Reopen FY {fy}</p>
        <p className="text-xs text-gray-500">A reversing journal entry will be posted to re-open this period.</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" rows={3}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none resize-none" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={() => reopen.mutate({ financial_year: fy, reason })} disabled={!reason || reopen.isPending}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40">
            {reopen.isPending ? "Reopening…" : "Reopen"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────── */
const YearEndClose = () => {
  const [fy, setFy] = useState(currentFY);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmReopen, setConfirmReopen] = useState(null);

  const { data: list = [], isLoading: listLoading, refetch } = useYearEndCloseList();
  const { data: detail } = useYearEndCloseDetail(fy);
  const safeList = Array.isArray(list) ? list : [];

  const isClosed = detail?.status === "closed";

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Archive size={18} className="text-purple-600 dark:text-purple-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Enterprise</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Year-End Close</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">FY</span>
            <input value={fy} onChange={(e) => setFy(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-24" placeholder="25-26" />
          </div>
          {!isClosed ? (
            <button onClick={() => setConfirmClose(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg">
              <Archive size={13} />Close FY {fy}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={14} />FY {fy} Closed — JE: {detail?.closing_je_no}
              </span>
              <button onClick={() => setConfirmReopen(fy)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-400 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20">
                <RotateCcw size={12} />Reopen
              </button>
            </div>
          )}
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Preview & Opening Balances */}
        <PreviewPanel fy={fy} />
        <OpeningBalancesPanel fy={fy} />

        {/* Past year-end closes */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Previous Year-End Closes</p>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            {listLoading && <div className="py-8 text-center text-sm text-gray-400">Loading…</div>}
            {!listLoading && (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Financial Year", "Status", "Closing JE", "Closed On", "Net Profit"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {safeList.map((r) => (
                    <tr key={r.financial_year} className="border-b border-gray-50 dark:border-gray-800 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30" onClick={() => setFy(r.financial_year)}>
                      <td className="px-4 py-2 font-bold text-gray-700 dark:text-gray-200">{r.financial_year}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.status === "closed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400">{r.closing_je_no || "—"}</td>
                      <td className="px-4 py-2 text-gray-400">{r.closed_at?.slice(0, 10) || "—"}</td>
                      <td className={`px-4 py-2 tabular-nums text-right font-semibold ${(r.net_profit || 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {r.net_profit != null ? fmtCompact(r.net_profit) : "—"}
                      </td>
                    </tr>
                  ))}
                  {!safeList.length && <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">No year-end closes recorded.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {confirmClose && <ConfirmCloseDialog fy={fy} onClose={() => setConfirmClose(false)} onDone={() => setConfirmClose(false)} />}
      {confirmReopen && <ReopenDialog fy={confirmReopen} onClose={() => setConfirmReopen(null)} onDone={() => setConfirmReopen(null)} />}
    </div>
  );
};

export default YearEndClose;

import { useState, useEffect, useCallback } from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Title from "../../../components/Title";
import Button from "../../../components/Button";

// Import exact shared components
import ComparativeTable from "../../projects/client_billing/components/ComparativeTable";
import BillAbstractTable from "../../projects/client_billing/components/BillAbstractTable";
import BillSummaryTab from "../../projects/client_billing/components/BillSummaryTab";

// Import finance-specific read-only clones
import FinanceBillDetailedTable from "./FinanceBillDetailedTable";
import FinanceSteelDetailedTable from "./FinanceSteelDetailedTable";
import { API } from "../../../constant";

const TABS = ["Bill Summary", "Comparative", "Bill Abstract", "Bill Detailed", "Steel"];

const STATUS_CLS = {
  Draft:     "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  Submitted: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
  Checked:   "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700",
  Approved:  "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
  Paid:      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
  Rejected:  "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
};

function ViewFinanceClientBill() {
  const navigate = useNavigate();
  const location = useLocation();
  const rowData = location.state?.item;

  const tenderId = rowData?.tender_id;
  const billId   = rowData?.bill_id;

  const [activeTab,   setActiveTab]   = useState("Bill Summary");
  const [billData,    setBillData]    = useState(null);

  const fetchBill = useCallback(async () => {
    if (!tenderId || !billId) return;
    try {
      const res = await axios.get(
        `${API}/clientbilling/api/details?tender_id=${tenderId}&bill_id=${billId}`,
        { withCredentials: true }
      );
      if (res.data.status || res.data.success) {
        setBillData(res.data.data);
      }
    } catch {
      // silent
    }
  }, [tenderId, billId]);

  useEffect(() => { fetchBill(); }, [fetchBill]);

  const status = billData?.status ?? rowData?.status;

  /* ── Tab content ── */
  const renderTab = () => {
    switch (activeTab) {
      case "Bill Summary":
        return <BillSummaryTab tenderId={tenderId} billId={billId} />;
      case "Bill Abstract":
        return <BillAbstractTable tenderId={tenderId} billId={billId} />;
      case "Comparative":
        return <ComparativeTable tenderId={tenderId} billId={billId} />;
      case "Bill Detailed":
        return <FinanceBillDetailedTable tenderId={tenderId} billId={billId} />;
      case "Steel":
        return <FinanceSteelDetailedTable tenderId={tenderId} billId={billId} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-1">
        <Title
          title="Finance Management"
          sub_title="Client Billing"
          active_title="View Client Billing"
        />
      </div>

      {status && (
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_CLS[status] ?? STATUS_CLS.Draft}`}>
            {status}
          </span>
          {billData?.bill_id && (
            <span className="text-xs text-gray-400">{billData.bill_id} · {billData.client_name}</span>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide gap-2 py-2 px-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
              activeTab === tab
                ? "bg-slate-800 text-white shadow-md scale-105 dark:bg-blue-600 ring-2 ring-offset-1 ring-slate-300 dark:ring-offset-gray-900 dark:ring-blue-800"
                : "bg-white text-gray-600 hover:bg-gray-100 hover:-translate-y-0.5 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="min-h-[400px] overflow-auto animate-fade-in">
        {renderTab()}
      </div>

      <div className="flex justify-end py-4">
        <Button onClick={() => navigate("..")} button_name="Back" button_icon={<IoChevronBackSharp />} />
      </div>
    </div>
  );
}

export default ViewFinanceClientBill;

import React from "react";
import { useParams } from "react-router-dom";
import Table from "../../../components/Table";
import { useEMDTracking } from "../tenders/hooks/useTenders";


// ✅ Static Columns
const trackingColumns = [
  { label: "Note", key: "emd_note" },
  {
    label: "Amount Collected",
    key: "amount_collected",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value || 0),
  },
  {
    label: "Pending Amount",
    key: "amount_pending",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value || 0),
  },
  {
    label: "Collected Date",
    key: "amount_collected_date",
    render: (item) =>
      item.amount_collected_date
        ? new Date(item.amount_collected_date).toLocaleDateString("en-GB")
        : "-",
  },
  { label: "Collected Time", key: "amount_collected_time" },
];

const EMDTrackingTable = () => {
  const { tender_id } = useParams();

  // 1. Fetch Data (Cached)
  const { data: tracking = [], isLoading } = useEMDTracking(tender_id);

  return (
    <Table
      title="EMD Tracking"
      subtitle={tender_id}
      pagetitle="EMD Collection History"
      
      // Data
      loading={isLoading}
      endpoint={tracking}
      columns={trackingColumns}
      
      // Disable unrelated features for this view
      addButtonLabel={null} // Hides Add button
      search={""} // Hides search if not needed, or add state back if you want search
    />
  );
};

export default EMDTrackingTable;
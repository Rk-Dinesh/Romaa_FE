import { IoCartOutline } from "react-icons/io5";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import CreateBill from "./CreateBill";
import { useAllTendersSummary } from "./hooks/usePurchaseBill";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const Columns = [
  { label: "Tender ID",       key: "tender_id" },
  { label: "Tender Name",     key: "tender_name" },
  { label: "Total Bills",     key: "total_bills" },
  { label: "Base Amount",     key: "total_grand",      formatter: (v) => `₹${fmt(v)}` },
  { label: "Total Tax",       key: "total_tax",        formatter: (v) => `₹${fmt(v)}` },
  { label: "Total Net",       key: "total_net",        formatter: (v) => `₹${fmt(v)}` },
  { label: "Latest Bill",     key: "latest_bill_date", formatter: fmtDate },
];

const PurchaseBill = () => {
  const { data: summary = [], isLoading } = useAllTendersSummary();

  return (
    <Table
      title="Purchase Management"
      subtitle="Purchase Bill"
      pagetitle="Purchase Bill"
      endpoint={summary}
      loading={isLoading}
      columns={Columns}
      AddModal={CreateBill}
      ViewModal={true}
      routepoint={"viewpurchasebill"}
      FilterModal={Filters}
      addButtonLabel="Create Bill"
      addButtonIcon={<IoCartOutline size={24} />}
    />
  );
};

export default PurchaseBill;

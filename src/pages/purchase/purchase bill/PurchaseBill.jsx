import { IoCartOutline } from "react-icons/io5";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { purchasebilldata } from "../../../components/Data";
import CreateBill from "./CreateBill";

const Columns = [
  { label: "Date", key: "date" },
  { label: "Vendor & Supplier", key: "vs" },
  { label: "Invoice no", key: "invoiceno" },
  { label: "Particle", key: "particle" },
  { label: "Total", key: "total" },
  { label: "Tax", key: "tax" },
  { label: "Grand Total", key: "grandtotal" },
];

const PurchaseBill = () => {
  return (
    <Table
      title="Purchase Management"
      subtitle="Purchase Bill"
      pagetitle="Purchase Bill"
      endpoint={purchasebilldata}
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

import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { goodsreceiptdata } from "../../../components/Data";

const Columns = [
  { label: "Project Name", key: "projectname" },
  { label: "Project ID", key: "projectid" },
  { label: "Purchase order ID", key: "orderid" },
  { label: " Received Date", key: "recdate" },
  { label: "Supplier Name", key: "suppliername" },
];

const GoodsReceipt = () => {
  return (
    <Table
      title="Purchase Management"
      subtitle="Goods Receipt"
      pagetitle="Goods Receipt"
      endpoint={goodsreceiptdata}
      columns={Columns}
      EditModal={true}
      routepoint={"viewgoodreceipt"}
      ViewModal={true}
      FilterModal={Filters}
    />
  );
};

export default GoodsReceipt;

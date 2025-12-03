
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { POdata } from "../../../components/Data";


const Columns = [

  { label: "Project Name", key: "projectname" },
    { label: "Project ID", key: "projectid" },
  { label: "location", key: "location" },
    { label: "Supplier ID", key: "supplierid" },
  { label: "Date", key: "date" },
  { label: "Project Value", key: "projectvalue" },
  { label: "Due Date", key: "duedate" },
];

const PurchaseOrder = () => {
  return (
    <Table
      title="Purchase Management"
      subtitle="Purchase Order"
      pagetitle="Purchase Order"
      endpoint={POdata}
      columns={Columns}
      routepoint={"viewpurchaseorder"}
      FilterModal={Filters}

    />
  );
};

export default PurchaseOrder;

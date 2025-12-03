import { clientbillingProjectdata } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";




const Columns = [
  { label: "Invoice No", key: "invoiceno" },
  { label: "Particles", key: "particles" },
    { label: "Date", key: "date" },
  { label: "Due Date", key: "duedate" },
  { label: "Tax ", key: "tax" },
  { label: "Amount ", key: "amount" },
];

const ClientBillingProject = () => {
  return (
    <Table
      title="Projects Management"
      subtitle="Client Billing"
      pagetitle="Client Billing"
      columns={Columns}
      endpoint={clientbillingProjectdata}
     routepoint="viewclbillproject"
      FilterModal={Filters}
    
    />
  );
};

export default ClientBillingProject;

import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { ClientBillingeData } from "../../../components/Data";

const clientBillingColumns = [
  { label: "Invoice No", key: "invoiceNo" },
  { label: "Particles", key: "particles" },
  { label: "Date", key: "date" },
  { label: "Due Date", key: "dueDate" },
  { label: "Tax", key: "tax" },
  { label: "Amount", key: "amount" },
];

const ClientBilling = () => {
  return (
    <Table
      title="Finance"
      subtitle="Client Billing"
      pagetitle="Client Billing"
      endpoint={ClientBillingeData}
      columns={clientBillingColumns}
      EditModal={true}
      ViewModal={true}
      FilterModal={Filters}
    />
  );
};

export default ClientBilling;

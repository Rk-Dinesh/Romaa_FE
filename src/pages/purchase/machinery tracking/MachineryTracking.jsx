import { MachinerybillingData } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";

const Columns = [
  { label: "Bill no", key: "billno" },
  { label: "Bill Date", key: "billdate" },
  { label: "Project", key: "project" },
  { label: "Description", key: "description" },
  { label: "Amount", key: "amount" },
  { label: "Due Date", key: "duedate" },
  { label: "Status", key: "status" },
];

const MachineryTracking = () => {
  return (
    <Table
      title="Purchase Management"
      subtitle="Machinery Tracking"
      pagetitle="Machinery Tracking"
      endpoint={MachinerybillingData}
      columns={Columns}
      FilterModal={Filters}
    />
  );
};

export default MachineryTracking;

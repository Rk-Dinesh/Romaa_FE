import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { contractorbillData } from "../../../components/Data";

const contractorbillcolumns = [
  { key: "invoiceNo", label: "Invoice no" },
  { key: "particles", label: "Particles" },
  { key: "site", label: "Site" },
  { key: "date", label: "Date" },
  { key: "dueDate", label: "Due date" },
  { key: "tax", label: "Tax" },
  { key: "amount", label: "Amount" },
];


const ContractorBill = () => {
  return (
    <Table
      title="Finance"
      subtitle="Contractor Bill"
      pagetitle="Contractor Bill"
      endpoint={contractorbillData}
      columns={contractorbillcolumns}
      EditModal={true}
      ViewModal={true}
      FilterModal={Filters}
    />
  );
};

export default ContractorBill;

import { DebitCreditNoteData } from "../../../components/Data";
import Table from "../../../components/Table";
import Filters from "../../../components/Filters";
import { TbDoorExit } from "react-icons/tb";

const DebitCreditNoteColumns = [
  { label: "Date", key: "date" },
  { label: "Invoice No", key: "invoiceNo" },
  { label: "Particles", key: "particle" },
  { label: "Actual Quantity", key: "actualQuantity" },
  { label: "Received Quantity", key: "receivedQuantity" },
  { label: "Actual Amount", key: "actualAmount" },
  { label: "Variance", key: "variance" },
  { label: "Credit Debit", key: "creditDebit" },
];

const Debit_CreditNote = () => {


  return (
  <div className="font-roboto-flex flex flex-col h-full">
      <Table
        title="Finance"
        subtitle="Debit, Credit Note"
        pagetitle="Debit, Credit Note"
        endpoint={DebitCreditNoteData}
        columns={DebitCreditNoteColumns}
        AddModal={true}
        FilterModal={Filters}
        addButtonLabel="Add"
        addButtonIcon={<TbDoorExit size={23} />}
      />
    </div>
  );
};

export default Debit_CreditNote;

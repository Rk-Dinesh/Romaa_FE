import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { internalBankTransferData } from "../../../components/Data"; // <- update this reference

const internalBankTransferColumns = [
  { key: "date", label: "Date" },
  { key: "fromBank", label: "From Bank" },
  { key: "toBank", label: "To Bank" },
  { key: "amount", label: "Amount" },
  { key: "transactionNote", label: "Transaction Note" },
  { key: "fromBalance", label: "From Balance" },
  { key: "toBalance", label: "To Balance" },
  { key: "transferredBy", label: "Transferred By" },
];

const InternalBankTransfer = () => {
  return (
    <Table
      title="Finance"
      subtitle="Internal Bank Transfer"
      pagetitle="Internal Bank Transfer"
      endpoint={internalBankTransferData} // replace with your actual data source
      columns={internalBankTransferColumns}
      EditModal={true}
      ViewModal={true}
      FilterModal={Filters}
    />
  );
};

export default InternalBankTransfer;

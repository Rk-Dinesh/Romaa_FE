import React from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { viewledgerData } from "../../../components/Data";
import { MdLocalAtm } from "react-icons/md";
import AddEntry from "./AddEntry";
const viewledgerColumns = [
  { label: "S.no", key: "sNo" },
  { label: "Vehicle date", key: "vehicleDate" },
  { label: "Vehicle no", key: "vehicleNo" },
  { label: "Cheque no", key: "chequeNo" },
  { label: "Particulars", key: "particulars" },
  { label: "Debit Amount", key: "debitAmount" },
  { label: "Credit Amount", key: "creditAmount" },
  { label: "Balance", key: "balance" },
]; 

const ViewLedgerEntry = () => {
  return (
    <div><Table
      title="Finance"
      subtitle="Ledger Entry"
      pagetitle="Ledger Entry"
      endpoint={viewledgerData}
      columns={viewledgerColumns}
      exportModal={false}
      AddModal={AddEntry}
     addButtonIcon={<MdLocalAtm size={20}/>}
     addButtonLabel="Add Entry"
    /></div>
  )
}

export default ViewLedgerEntry
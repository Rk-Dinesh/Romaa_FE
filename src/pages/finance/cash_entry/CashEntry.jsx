import React from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { CashEntryData } from "../../../components/Data";

const TDSColumns = [
  { label: "Date", key: "date" },
  { label: "Amount", key: "amount" },
  { label: "Reason", key: "reason" },
  { label: "Credit / Debit", key: "type" },
];

const CashEntry = () => {
  return (
    <Table
      title="Finance"
      subtitle="Cash Entry"
      pagetitle="Cash Entry"
      endpoint={CashEntryData}
      columns={TDSColumns}
      FilterModal={Filters}
    />
  );
};

export default CashEntry;

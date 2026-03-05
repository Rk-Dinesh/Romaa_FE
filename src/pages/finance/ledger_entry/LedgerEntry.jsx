import React from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { ledgerData } from "../../../components/Data";

const ledgerColumns = [
  { label: "Vendor / Supplier", key: "vendor" },
  { label: "Total Credit", key: "credit" },
  { label: "Total Debit", key: "debit" },
  { label: "Balance", key: "balance" },
];


const LedgerEntry = () => {
  return (
    <Table
      title="Finance"
      subtitle="Ledger Entry"
      pagetitle="Ledger Entry"
      endpoint={ledgerData}
      columns={ledgerColumns}
      FilterModal={Filters}
      ViewModal={true}
      routepoint={"/finance/ledgerentry/viewledgerentry"}
    />
  );
};

export default LedgerEntry


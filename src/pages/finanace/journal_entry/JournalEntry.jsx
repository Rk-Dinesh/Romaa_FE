import React from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { JournalData } from "../../../components/Data";
import { CiBank } from "react-icons/ci";
import { useState } from "react";
import AddExpenses from "./AddExpenses";
import { Workflow } from "lucide-react";

const JournalEntryColumns = [
  { label: "Details", key: "details" },
  { label: "Amount", key: "amount" },
  { label: "Person Name", key: "personName" },
  { label: "Date", key: "date" },
  { label: "From Account", key: "fromAccount" },
];

const JournalEntry = () => {
  return (
    <Table
      title="Finance"
      subtitle="Journal Entry"
      pagetitle="Journal Entry "
      endpoint={JournalData}
      columns={JournalEntryColumns}
      AddModal={AddExpenses}
      FilterModal={Filters}
      addButtonLabel="Add Expenses"
      addButtonIcon={<Workflow size={23} />}
    />
  );
};

export default JournalEntry;

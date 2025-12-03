import React from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { BankTransactionData } from "../../../components/Data";
import AddTransactions from "./AddTransactions";
import { useState } from "react";
import { TbReportMoney } from "react-icons/tb";

const BankTransactionsColumns = [
  { label: "Date", key: "date" },
  { label: "From Bank", key: "fromBank" },
  { label: "To Bank", key: "toBank" },
  { label: "Amount", key: "amount" },
  { label: "Transaction Note", key: "transactionNote" },
  { label: "From Balance", key: "fromBalance" },
  { label: "To Balance", key: "toBalance" },
  { label: "Transferred By", key: "transferredBy" },
];

const BankTransactions = () => {
  return (
    <Table
      title="Finance"
      subtitle="Bank Transactions"
      pagetitle="Bank Transactions"
      endpoint={BankTransactionData}
      columns={BankTransactionsColumns}
      AddModal={AddTransactions}
      FilterModal={Filters}
      addButtonLabel="Add Transcations"
      addButtonIcon={<TbReportMoney size={23} />}
    />
  );
};

export default BankTransactions;

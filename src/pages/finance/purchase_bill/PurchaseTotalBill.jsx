import React from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { PurchaseBillData } from "../../../components/Data";

const purchaseBillColumns = [
  { label: "Date", key: "date" },
  { label: "Vendor & Supplier", key: "vendor" },
  { label: "Invoice No", key: "invoiceNo" },
  { label: "Particle", key: "particle" },
  { label: "Total", key: "total" },
  { label: "Tax", key: "tax" },
  { label: "Grand Total", key: "grandTotal" },
];

const PurchaseTotalBill = () => {
  return (
    <Table
      title="Finance"
      subtitle="Purchase Bill"
      pagetitle="Purchase Bill"
      endpoint={PurchaseBillData}
      columns={purchaseBillColumns}
      ViewModal={true}
      FilterModal={Filters}

    />
  );
};

export default PurchaseTotalBill;

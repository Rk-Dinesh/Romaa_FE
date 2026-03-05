import React from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { BanksData } from "../../../components/Data";
import { CiBank } from "react-icons/ci";
import DeleteModal from "../../../components/DeleteModal";

const BanksColumns = [
  { label: "Account Name", key: "accountName" },
  { label: "Bank Name", key: "bankName" },
  { label: "Pan No", key: "panNo" },
  { label: "IFSC Code", key: "ifscCode" },
  { label: "Swift Code", key: "swiftCode" },
  { label: "Branch", key: "branch" },
  { label: "Opening Balance", key: "openingBalance" },
  { label: "Current Balance", key: "currentBalance" },
];

const Banks = () => {
  return (
    <Table
      title="Finance"
      subtitle="Banks "
      pagetitle="Banks"
      endpoint={BanksData}
      columns={BanksColumns}
      AddModal={true}
      EditModal={true}
      DeleteModal={DeleteModal}
      deletetitle="banks"
      FilterModal={Filters}
      addButtonLabel="Add Bank"
      addButtonIcon={<CiBank size={23} />}
    />
  );
};

export default Banks;

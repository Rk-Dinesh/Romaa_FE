import { contractData } from "../../../../components/Data";
import Table from "../../../../components/Table";

const ContractorColumns = [
  { label: "Contractor Name", key: "contractorname" },
  { label: "Contractor Type", key: "contractortype" },
  { label: "Start Date", key: "startdate" },
  { label: "End Date", key: "enddate" },
  { label: "Contractor Value", key: "contractorvalue" },
  { label: "Status", key: "status" },
];

const Contract = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={contractData}
      columns={ContractorColumns}
      exportModal={false}
    />
  );
};

export default Contract;

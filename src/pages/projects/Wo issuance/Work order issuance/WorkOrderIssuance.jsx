import {  WOIssuancedata } from "../../../../components/Data";
import Table from "../../../../components/Table";

const Columns = [
  { label: "Contractor", key: "contract" },
  { label: "Unit Cost", key: "unitcost" },
  { label: "Unit", key: "unit" },
  {
    label: "Date",
    key: "date",
  },
  { label: "Total", key: "total" },
  { label: "Level", key: "level" },
];

const WorkOrderIssuance = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={WOIssuancedata}
      columns={Columns}
      routepoint={"viewwoissuance"}
      exportModal={false}
    />
  );
};

export default WorkOrderIssuance;

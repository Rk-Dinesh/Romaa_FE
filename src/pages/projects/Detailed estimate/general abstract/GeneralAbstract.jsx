import { GeneralAbstractdata } from "../../../../components/Data";
import Table from "../../../../components/Table";

const Columns = [
  { label: "Item Description", key: "itemdesc" },
  { label: "Quantity", key: "quantity" },
  { label: "Unit", key: "unit" },
  {
    label: "Rate",
    key: "rate",
  },
  { label: "Amount", key: "amount" },
];

const GeneralAbstract = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={GeneralAbstractdata}
      columns={Columns}
      routepoint={"Viewgs"}
      exportModal={false}
    />
  );
};

export default GeneralAbstract;

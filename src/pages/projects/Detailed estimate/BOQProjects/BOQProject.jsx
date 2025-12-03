import { BoqProjectdata} from "../../../../components/Data";
import Table from "../../../../components/Table";


const BoqProjectsColumns = [
  { label: "Item Description", key: "itemdesc" },
  { label: "Quantity", key: "quantity" },
  { label: "Unit", key: "unit" },
  { label: "Rate", key: "rate" },
  { label: "Amount", key: "amount" },
];

const BOQProject = () => {
  return (
    <Table
    contentMarginTop="mt-0"
      endpoint={BoqProjectdata}
      columns={BoqProjectsColumns}
      routepoint={"viewboqproject"}
      exportModal={false}
    />
  );
};

export default BOQProject;

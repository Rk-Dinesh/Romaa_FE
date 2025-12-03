import Table from "../../../components/Table";
import { BOQSplitData } from "../../../components/Data";
import Filters from "../../../components/Filters";
const Columns = [
  { label: "Item Description", key: "itemdesc" },
  { label: "Quantity", key: "quantity" },
  { label: "Unit", key: "unit" },
  { label: "Rate", key: "rate" },
  { label: "Amount", key: "amount" },
  { label: "Materials", key: "materials" },
  { label: "Machinery", key: "machinery" },
{
  label: "Fuel",
  key: "fuel",
  render: (item) =>
    item.fuel !== undefined && item.fuel !== null && item.fuel !== ""
      ? <span>₹{item.fuel}</span>
      : <span>-</span>,
},
];

const ProjectMaterailQty = () => {
  return (
    <Table
      title={"Projects Management"}
      subtitle={"Basic Material Quantity"}
      pagetitle={" Material Quantity"}
      endpoint={BOQSplitData}
      columns={Columns}
      FilterModal={Filters}
    />
  );
};

export default ProjectMaterailQty;

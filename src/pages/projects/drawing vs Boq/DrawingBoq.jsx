import { DrawingBoqData } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";

const DrawingBoqColumns = [
  { label: "Item Description", key: "desc" },
  { label: "BOQ Qty", key: "boqqty" },
  { label: "Drawing Qty", key: "drawqty" },
  { label: "Variable Qty", key: "varqty" },
  { label: "Unit", key: "unit" },
  {
    label: "Price",
    key: "price",
    render: (item) => (
      <span
        className={` ${item.varqty < 0 ? "text-red-500 font-semibold" : ""}`}
      >
        {`₹ ${item.price}`}
      </span>
    ),
  },
];

const DrawingBoq = () => {
  return (
    <Table
      title="Projects Management"
      subtitle="Drawing vs BOQ"
      pagetitle="Drawing vs BOQ Management"
      endpoint={DrawingBoqData}
      columns={DrawingBoqColumns}
      routepoint={"viewdrawingboq"}
      FilterModal={Filters}
    />
  );
};

export default DrawingBoq;

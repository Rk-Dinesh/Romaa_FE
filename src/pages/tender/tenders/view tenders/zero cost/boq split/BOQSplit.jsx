import axios from "axios";
import { BOQSplitData } from "../../../../../../components/Data";
import Table from "../../../../../../components/Table";
import { API } from "../../../../../../constant";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ViewBoqSplit from "./ViewBoqSplit";

const Columns = [
  { label: "Item Description", key: "item_name" },
  { label: "Quantity", key: "quantity" },
  { label: "Unit", key: "unit" },
  { label: "Rate", key: "zero_cost_unit_rate" },
  { label: "Amount", key: "zero_cost_final_amount" },
  { label: "Materials", key: "material_amount" },
  { label: "Machinery", key: "machinery_amount" },
  {
    label: "Fuel",
    key: "fuel_amount",
    render: (item) =>
      item.fuel_amount !== undefined &&
      item.fuel_amount !== null &&
      item.fuel_amount !== "" ? (
        <span>₹ {item.fuel_amount}</span>
      ) : (
        <span>-</span>
      ),
  },
];

const BOQSplit = () => {
  const { tender_id } = useParams(); // 📌 Get tender_id from URL
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBoqSplit();
  }, [tender_id]);
  const fetchBoqSplit = async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/boq/items/${tender_id}`);
      console.log(res);
      
      setItems(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch BOQ items");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={items}
      columns={Columns}
      loading={loading}
      exportModal={false}
      ViewModal={ViewBoqSplit}
    />
  );
};

export default BOQSplit;

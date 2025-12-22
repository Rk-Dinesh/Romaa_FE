import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useProject } from "../ProjectContext";
import { API } from "../../../constant";
import Table from "../../../components/Table";
import UploadWBS from "./UploadWBS";

const customerColumns = [
  { label: "Item ID", key: "wbs_id" },
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Units", key: "unit" },
];


const WBS = () => {
   const { tenderId } = useProject();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWBS = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/schedule/get-schedule/${tenderId}`)
      setItems(res.data.data.items || []);
    } catch (err) {
        toast.error("Failed to fetch WBS items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWBS();
  }, [tenderId]);

  return (
    <>
      <Table
        endpoint={items}
        columns={customerColumns}
        loading={loading}
        exportModal={false}
        UploadModal={UploadWBS}
        onUpdated={fetchWBS}
        onSuccess={fetchWBS}
        pagination={false}

      />

    </>
  );
};

export default WBS;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // ✅ get tender_id from URL
import DeleteModal from "../../../../../components/DeleteModal";
import Table from "../../../../../components/Table";
import axios from "axios";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";
import UploadBid from "./UploadBid";
import { GiArrowFlights } from "react-icons/gi";

const customerColumns = [
  { label: "Item ID", key: "item_id" },
  { label: "Item Name", key: "item_name" },
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Units", key: "unit" },
  { label: "Basic Rate", key: "base_rate", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
  { label: "Basic Amount", key: "base_amount", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
  { label: "Q-Rate", key: "q_rate", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
  { label: "Q-Amount", key: "q_amount", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
  { label: "N-Rate", key: "n_rate", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
  { label: "N-Amount", key: "n_amount", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
];


const Bid = () => {
  const { tender_id } = useParams(); // 📌 Get tender_id from URL

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bidfreezed, setbidfreezed] = useState(false)

  const fetchBoqItems = async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/bid/get?tender_id=${tender_id}`)
      setItems(res.data.data.items || []);
      setbidfreezed(res.data.data.freezed)
    } catch (err) {
      //toast.error("Failed to fetch Bid items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoqItems();
  }, [tender_id]);

  const handlefreeze = async () => {
    try {
      await axios.put(`${API}/bid/freeze/${tender_id}`);
      toast.success("Bid frozen successfully");
      setbidfreezed(true)
    } catch (error) {
      console.error(error);
      toast.error("Failed to freeze Bid");
    }
  };

  return (
    <>
      <Table
        endpoint={items}
        columns={customerColumns}
        loading={loading}
        exportModal={false}
        freeze={true}
        freezeButtonIcon={<GiArrowFlights size={18} />}
        freezeButtonLabel={bidfreezed ? "Freezed" : "Freeze"}
        onfreeze={bidfreezed ? null : handlefreeze}
        UploadModal={bidfreezed ? false : UploadBid}
        onUpdated={fetchBoqItems}
        onSuccess={fetchBoqItems}
        idKey="item_code"
        pagination={false}
      />

    </>
  );
};

export default Bid;

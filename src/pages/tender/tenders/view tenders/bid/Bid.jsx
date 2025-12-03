import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // ✅ get tender_id from URL
import DeleteModal from "../../../../../components/DeleteModal";
import Table from "../../../../../components/Table";
import axios from "axios";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";
import { LuUserRoundSearch } from "react-icons/lu";
import UploadBid from "./UploadBid";

const customerColumns = [
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Units", key: "unit" },
  { label: "Basic Rate", key: "base_rate" },
  { label: "Basic Amount", key: "base_amount" },
  { label: "Q-Rate", key: "q_rate" },
  { label: "Q-Amount", key: "q_amount" },
  { label: "N-Rate", key: "n_rate" },
  { label: "N-Amount", key: "n_amount" },
];

const Bid = () => {
  const { tender_id } = useParams(); // 📌 Get tender_id from URL

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [bidId, setbidId] = useState([])

  const handleUploadSuccess = () => {
    setShowModal(false);
    fetchBoqItems();
  };

  const fetchBoqItems = async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/bid/get?tender_id=${tender_id}`, {
        params: {
          page: currentPage,
          limit: 10,
        },
      });

      setItems(res.data.data.items || []);
      setbidId(res.data.data.bid_id)
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch Bid items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoqItems();
  }, [tender_id, currentPage]);

  const handleDeleteBoqItem = async (item_code) => {
    try {
      await axios.delete(`${API}/bid/removeitem/${bidId}/${item_code}`);
      toast.success("Item deleted successfully");
      fetchBoqItems(); // refresh table
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete Bid item");
    }
  };

  return (
    <>
      <Table
        endpoint={items}
        columns={customerColumns}
        loading={loading}
        exportModal={false}
        UploadModal={UploadBid}
        DeleteModal={DeleteModal}
        deletetitle="BOQ"
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onUpdated={fetchBoqItems}
        onSuccess={fetchBoqItems}
        onDelete={handleDeleteBoqItem}
        idKey="item_code"
      />
      {/* {showModal && (
        <UploadBoq
          onClose={() => setShowModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )} */}
    </>
  );
};

export default Bid;

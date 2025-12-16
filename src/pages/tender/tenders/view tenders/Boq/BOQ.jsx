import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // ✅ get tender_id from URL
import DeleteModal from "../../../../../components/DeleteModal";
import Table from "../../../../../components/Table";
import axios from "axios";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";
import { LuUserRoundSearch } from "react-icons/lu";
import AddBoq from "./AddBoq";
import UploadBoq from "./UploadBoq";

const customerColumns = [
  { label: "Item Name", key: "item_name" },
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Units", key: "unit" },
  { label: " Rate",key: "n_rate", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },,
  { label: "Amount", key: "n_amount", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
];

const BOQ = () => {
  const { tender_id } = useParams(); // 📌 Get tender_id from URL

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);

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
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      //toast.error("Failed to fetch Bid items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoqItems();
  }, [tender_id, currentPage]);

  const handleDeleteBoqItem = async (item_code) => {
    try {
      await axios.delete(`${API}/boq/removeitem/${tender_id}/${item_code}`);
      toast.success("Item deleted successfully");
      fetchBoqItems(); // refresh table
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete BOQ item");
    }
  };

  return (
    <>
      <Table
        title="Bill Of Quantity"
        subtitle={`Tender: ${tender_id}`}
        endpoint={items}
        columns={customerColumns}
        //EditModal={true}
        exportModal={false}
       // UploadModal={UploadBoq}
        // DeleteModal={DeleteModal}
        // deletetitle="BOQ"
       // AddModal={AddBoq}
       // addButtonLabel="Add Boq"
      //  addButtonIcon={<LuUserRoundSearch size={24} />}
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

export default BOQ;

import { useEffect, useState } from "react";
import { BoqSitedata } from "../../../components/Data";
import DeleteModal from "../../../components/DeleteModal";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { useProject } from "../../projects/ProjectContext";
import EditBOQSite from "./EditBOQSite";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";

const BoqSiteColumns = [
  { label: "Item Name", key: "item_name" },
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Units", key: "unit" },
  { label: "Final Rate", key: "final_unit_rate" },
  { label: "Amount", key: "final_amount" },
];

const BOQSite = () => {
  const { tenderId } = useProject(); // 📌 Get tender_id from URL

  

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const fetchBoqItems = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/boq/items/${tenderId}`, {
        params: {
          page: currentPage,
          limit: 10,
        },
      });
console.log(res);

      setItems(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch BOQ items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoqItems();
  }, [tenderId, currentPage]);

  const handleDeleteBoqItem = async (item_code) => {
    try {
      await axios.delete(`${API}/boq/removeitem/${tenderId}/${item_code}`);
      toast.success("Item deleted successfully");
      fetchBoqItems(); // refresh table
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete BOQ item");
    }
  };

  return (
    <Table
      title="Site"
      subtitle="BOQ"
      pagetitle="BOQ"
      endpoint={items}
      columns={BoqSiteColumns}
      EditModal={EditBOQSite}
      ViewModal={true}
      DeleteModal={DeleteModal}
      deletetitle="BOQ"
      FilterModal={Filters}
      onExport={() => console.log("Exporting...")}
      totalPages={totalPages}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      onUpdated={fetchBoqItems}
      onSuccess={fetchBoqItems}
      onDelete={handleDeleteBoqItem}
      idKey="item_code"
    />
  );
};

export default BOQSite;

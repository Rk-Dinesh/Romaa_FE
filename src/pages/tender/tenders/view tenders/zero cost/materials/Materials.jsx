import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Table from "../../../../../../components/Table";
import { API } from "../../../../../../constant";
import UploadMaterial from "./UploadMaterial";

const Columns = [
  { label: "Item Description", key: "item_description" },
  { label: "Unit", key: "unit" },
  { label: "Quantity", key: "quantity" },
  { label: "Rate/Unit", key: "unit_rate" },
  { label: "Rate Inc Tax", key: "rate_tax" },
  { label: "Total Amount", key: "total_amount" },
  { label: "Total Material %", key: "total_material" },
];

const Materials = () => {
  const { tender_id } = useParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Fetch materials from API
  const fetchMaterials = async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/material/getall/${tender_id}`, {
        params: { page: currentPage, limit: 10 },
      });

      if (res.data.success) {
        setItems(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      } else {
        toast.error(res.data.message || "Failed to fetch materials");
      }
    } catch (err) {
      toast.error("Error fetching materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [tender_id, currentPage]);

  return (
    <Table
      contentMarginTop="mt-0"
      exportModal={false}
      UploadModal={UploadMaterial}
      endpoint={items} // ✅ dynamic data from backend
      columns={Columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage} // ✅ pagination support
      onSuccess={fetchMaterials} // ✅ refresh data on upload
    />
  );
};

export default Materials;

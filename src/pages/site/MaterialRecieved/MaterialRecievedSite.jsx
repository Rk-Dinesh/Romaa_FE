import React, { useEffect, useState } from "react";
import Table from "../../../components/Table";
import { TbPlus } from "react-icons/tb";
import Filters from "../../../components/Filters";
import AddMaterial from "./AddMaterial";
import axios from "axios";
import { API } from "../../../constant";

const MaterialRecievedSite = () => {
  const tenderId = localStorage.getItem("tenderId");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const materialRecievedColumns = [
   {label: "Request ID", key: "requestId" },
     { label: "Site Name", key: "site_name" },
    { label: "Material", key: "item_description" },
      { label: "Received Qty", key: "received_quantity" },
    { label: "Unit", key: "unit" },
    {
      label: "Received Date",
      key: "received_date",
      render: (row) => formatDate(row.received_date),
    },
  ];

  // Helper: Format date to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("en-GB"); // → 20/11/2025
  };


  const fetchMaterials = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/material/getall/${tenderId}`);
      const data = res.data.data || [];

      // 🔥 Filter only items that have issued records > 0
      const filtered = data.filter(
        (item) => Array.isArray(item.received) && item.received.length > 0
      );

      // Flatten issued array → one row per issue entry
      const expanded = [];

      filtered.forEach((item) => {
        item.received.forEach((received) => {
          expanded.push({
            item_description: item.item_description,
            unit: item.unit,
            requestId:received.requestId,
            site_name: received.site_name
              ? received.site_name.charAt(0).toUpperCase() +
                received.site_name.slice(1)
              : "",
            received_quantity: received.received_quantity,
            received_date: received.received_date,
            received_by: received.received_by,
          });
        });
      });

      setMaterials(expanded);
    } catch (err) {
      console.error("Error fetching issued materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) fetchMaterials();
  }, [tenderId]);
  return (
    <Table
      title="Site Management"
      subtitle="Material Received"
      pagetitle="Material Received"
      endpoint={materials}
      loading={loading}
      columns={materialRecievedColumns}
      EditModal={true}
      routepoint="viewmaterialrecieved"
      FilterModal={Filters}
      AddModal={AddMaterial}
      addButtonIcon={<TbPlus className="text-2xl text-primary" />}
      addButtonLabel="Add Material Received"
      onSuccess={fetchMaterials}
    />
  );
};

export default MaterialRecievedSite;

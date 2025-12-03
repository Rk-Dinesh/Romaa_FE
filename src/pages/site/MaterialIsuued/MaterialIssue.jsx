import React, { useEffect, useState } from "react";
import Filters from "../../../components/Filters";
import { TbPlus } from "react-icons/tb";
import Table from "../../../components/Table";
import AddMaterialIssue from "./AddMaterialIssue";
import axios from "axios";
import { API } from "../../../constant";

const MaterialIssue = () => {
  const tenderId = localStorage.getItem("tenderId");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const materialIssueColumns = [
    { label: "Site Name", key: "site_name" },
    { label: "Material", key: "item_description" },
    { label: "Unit", key: "unit" },
    { label: "Issued Qty", key: "issued_quantity" },
    { label: "Work Location", key: "work_location" },
    { label: "Issued By", key: "issued_by" },
  ];

  // Fetch data
  const fetchMaterials = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/material/getall/${tenderId}`);
      const data = res.data.data || [];

      // 🔥 Filter only items that have issued records > 0
      const filtered = data.filter(
        (item) => Array.isArray(item.issued) && item.issued.length > 0
      );

      // Flatten issued array → one row per issue entry
      const expanded = [];

      filtered.forEach((item) => {
        item.issued.forEach((issue) => {
          expanded.push({
            item_description: item.item_description,
            unit: item.unit,
            site_name: issue.site_name
              ? issue.site_name.charAt(0).toUpperCase() +
                issue.site_name.slice(1)
              : "",
            issued_quantity: issue.issued_quantity,
            work_location: issue.work_location,
            issued_by: issue.issued_by,
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
      subtitle="Material Issue"
      pagetitle="Material Issue"
      endpoint={materials}
      loading={loading}
      columns={materialIssueColumns}
      EditModal={true}
      routepoint="viewmaterialissued"
      FilterModal={Filters}
      AddModal={AddMaterialIssue}
      addButtonIcon={<TbPlus className="text-2xl text-primary" />}
      addButtonLabel="Add Material Issue"
      onSuccess={fetchMaterials}
    />
  );
};

export default MaterialIssue;

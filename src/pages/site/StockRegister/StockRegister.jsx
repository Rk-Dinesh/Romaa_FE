import React, { useEffect, useState } from 'react'
import Table from '../../../components/Table'
import Filters from '../../../components/Filters'
import axios from "axios";
import { API } from "../../../constant";


const StockRegister = () => {
    const tenderId = localStorage.getItem("tenderId");
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const stockRegisterColumns = [
        {label: "Material", key: "item_description"},
        {label: "Unit", key: "unit"},
        {label:"Opening Stock", key: "quantity"},
        {label:"Received",key: "received_quantity"},
        {label:"Issued", key: "issued_quantity"},
        {label:"Balance", key: "pending_quantity"},
        {label:"Status", key: "status"},
    ]


      // Helper: Format date to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("en-GB"); // → 20/11/2025
  };

  // Fetch materials for tenderId

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/material/getall/${tenderId}`);

      // Filter to show only materials with received quantity
      const filtered = (res.data.data || []).filter(
        (item) => Number(item.received_quantity) > 0
      );

      setMaterials(filtered);
    } catch (error) {
      console.error("Error fetching materials:", error);
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
      subtitle="Stock Register"
      pagetitle="Stock Register"
      endpoint={materials}
      loading={loading}
      columns={stockRegisterColumns}
      EditModal={true}
      routepoint="viewstockregistersite"
      FilterModal={Filters}
      onSuccess={fetchMaterials}
    />
  )
}

export default StockRegister

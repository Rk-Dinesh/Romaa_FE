import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";
import Table from "../../../components/Table";

const Columns = [
  { label: "Project ID", key: "tender_id" },
  { label: "Project Name", key: "project_name" },
  { label: "Tender Name", key: "tender_name" },
  { label: "Total GRN Entries", key: "total_grn_entries" },
  {
    label: "Last GRN Date",
    key: "last_grn_date",
    formatter: (v) => (v ? new Date(v).toLocaleDateString("en-GB") : "—"),
  },
  
];

const GoodsReceipt = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/material/grn/projects`);
        setData(res.data?.data || []);
      } catch {
        toast.error("Failed to load GRN projects");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <Table
      title="Purchase Management"
      subtitle="Goods Receipt"
      pagetitle="Goods Receipt Note (GRN)"
      endpoint={data}
      columns={Columns}
      loading={loading}
      ViewModal={true}
      routepoint="viewgoodreceipt"
    />
  );
};

export default GoodsReceipt;

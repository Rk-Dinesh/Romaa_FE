import { useEffect, useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { useProject } from '../ProjectContext';
import axios from "axios";
import { API } from "../../../constant";
import ViewClBillProjects from "./ViewClBillProjects";
import UploadBill from "./UploadBill";




const Columns = [
  { label: "Bill No", key: "bill_id" },

  { label: "Date", key: "bill_date",
    render: (item) => item.bill_date ? new Date(item.bill_date).toLocaleDateString("en-GB").replace(/\//g, "-") : "-"
   },
  { label: "Total", key: "grand_total",
    render: (item) => item.grand_total ? item.grand_total.toFixed(2) : "-"
   },
  { label: "Total Upto Date Amount ", key: "total_upto_date_amount",
    render: (item) => item.total_upto_date_amount ? item.total_upto_date_amount.toFixed(2) : "-"
   },
  { label: "Status ", key: "status" },
];

const ClientBillingProject = () => {

  const { tenderId } = useProject();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);


  const fetchBilling = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/clientbilling/api/history/${tenderId}`);

      setItems(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch  items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [tenderId]);

  return (
    <Table
      title="Projects Management"
      subtitle="Client Billing"
      pagetitle="Client Billing"
      columns={Columns}
      endpoint={items}
      routepoint="viewclbillproject"
      ViewModal={true}
      FilterModal={Filters}
      UploadModal={UploadBill}
      onSuccess={fetchBilling}
    />
  );
};

export default ClientBillingProject;

import { useEffect, useState } from "react";
import { EMDdata } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import axios from "axios";
import { API } from "../../../constant";
import EditEMDModal from "./EditEMDModal";
import { toast } from "react-toastify";

const Columns = [
  { label: "Tender ID", key: "tender_id" },
  { label: "Project Name", key: "tender_name" ,className:"text-left"},
  {
    label: "EMD",
    key: "emd.approved_emd_details[0].emd_approved_amount",
    render: (item) =>
      item.emd?.approved_emd_details?.[0]?.emd_approved_amount ?? "-",
    formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value),
  },
  {
    label: "Expiry Date",
    key: "emd.emd_validity",
    render: (item) =>
      item.emd?.emd_validity
        ? new Date(item.emd.emd_validity).toLocaleDateString("en-GB")
        : "-",
  },
  {
    label: "Amount Collected",
    key: "emd.approved_emd_details[0].emd_deposit_amount_collected",
    render: (item) =>
      item.emd?.approved_emd_details?.[0]?.emd_deposit_amount_collected ?? "-",
    formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value),
  },
  {
    label: "Balance",
    key: "emd.approved_emd_details[0].emd_deposit_pendingAmount",
    render: (item) =>
      item.emd?.approved_emd_details?.[0]?.emd_deposit_pendingAmount ?? "-",
    formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value),
  },
];

const EMD = () => {
  const [EMD, setEMD] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const fetchTendersEMDSD = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/tender/gettendersemdsd`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });
      setEMD(res.data.data);

      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch tenders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTendersEMDSD();
  }, [currentPage, searchTerm, filterParams]);

  return (
    <Table
      title="Tender Management"
      subtitle="EMD"
      loading={loading}
      pagetitle="EMD(Earnest Money Deposit)"
      endpoint={EMD}
      columns={Columns}
      EditModal={EditEMDModal}
      FilterModal={Filters}
      onExport={() => console.log("Exporting...")}
      onUpdated={fetchTendersEMDSD}
      idKey='tender_id'
      routepoint={'viewemd'}
    />
  );
};

export default EMD;

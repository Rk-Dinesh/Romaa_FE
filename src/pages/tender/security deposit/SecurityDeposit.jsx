import { useEffect, useState } from "react";
import { securitydepositdata } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import axios from "axios";
import { API } from "../../../constant";
import EditSecurityDeposit from "./EditSecurityDeposit";



const Columns = [
  { label: "Tender ID", key: "tender_id" },
  { label: "Project Name", key: "tender_name" },
  {
    label: "Security Deposit",
    key: "emd.approved_emd_details[0].security_deposit_amount",
    render: (item) =>
      item.emd?.approved_emd_details?.[0]?.security_deposit_amount ?? "-"
  },
  {
    label: "Expiry Date",
    key: "emd.security_deposit_validity",
    render: (item) =>
      item.emd?.approved_emd_details?.[0]?.security_deposit_validity
        ? new Date(item.emd.approved_emd_details?.[0]?.security_deposit_validity).toLocaleDateString("en-GB")
        : "-"
  },
  {
    label: "Amount Collected",
    key: "emd.approved_emd_details[0].security_deposit_amount_collected",
    render: (item) =>
      item.emd?.approved_emd_details?.[0]?.security_deposit_amount_collected ?? "-"
  },
  {
    label: "Balance",
    key: "emd.approved_emd_details[0].security_deposit_pendingAmount",
    render: (item) =>
      item.emd?.approved_emd_details?.[0]?.security_deposit_pendingAmount ?? "-"
  },
  {
    label: "Note",
    key: "emd.approved_emd_details[0].security_deposit_note",
    render: (item) =>
      item.emd?.approved_emd_details?.[0]?.security_deposit_note ?? "-"
  }
];

const SecurityDeposit = () => {
  
  const [deposit, setDeposit] = useState([])
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
        setDeposit(res.data.data);
        console.log(res.data.data);
        
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
      subtitle="Security Deposit"
      pagetitle="Security Deposit"
      loading={loading}
      endpoint={deposit}
      columns={Columns}
      FilterModal={Filters}
      EditModal={EditSecurityDeposit}
       onUpdated={fetchTendersEMDSD}
    />
  );
};

export default SecurityDeposit;

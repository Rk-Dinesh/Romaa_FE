import { AiOutlineFileAdd } from "react-icons/ai";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddContractor from "./AddContractor";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../constant";

const ContractColumns = [
  { label: "Contractor ID", key: "contractor_id" },
  { label: "Vendor", key: "company_name" },
  {
    label: "Contract Start",
    key: "contract_start_date",
    render: (item) =>
      item.contract_start_date
        ? new Date(item.contract_start_date).toLocaleDateString("en-GB")
        : "-",
  },
  {
    label: "End Date",
    key: "contract_end_date",
    render: (item) =>
      item.contract_end_date
        ? new Date(item.contract_end_date).toLocaleDateString("en-GB")
        : "-",
  },
  { label: "Business Type", key: "business_type" },
  {
    label: "Address",
    key: "address",
    render: (item) =>
      `${item.address?.city || ""}, ${item.address?.state || ""}, ${
        item.address?.country || ""
      } - ${item.address?.pincode || ""}`,
  },
  { label: "Status", key: "status" },
];

const ContractNmr = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/contractor/contractorlist`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });
    
      setContracts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch contract workers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [currentPage, searchTerm, filterParams]);

  return (
    <Table
      title="HR Management"
      subtitle="Contract & NMR"
      pagetitle="Contract & NMR"
      columns={ContractColumns}
      endpoint={contracts}
      AddModal={AddContractor}
      editroutepoint={"editcontractor"}
      routepoint="viewcontractor"
      FilterModal={Filters}
      addButtonLabel="Add Contractor"
      addButtonIcon={<AiOutlineFileAdd size={23} />}
      totalPages={totalPages}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      onUpdated={fetchContracts}
      onSuccess={fetchContracts}
      loading={loading}
    />
  );
};

export default ContractNmr;

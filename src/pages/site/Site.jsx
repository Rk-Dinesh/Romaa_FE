import { sitedata } from "../../components/Data";
import Filters from "../../components/Filters";
import Table from "../../components/Table";
import { LuLandPlot } from "react-icons/lu";
import AddSite from "./AddSite";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProject } from "../projects/ProjectContext";
import { toast } from "react-toastify";
import { API } from "../../constant";
import axios from "axios";
const Columns = [
  { label: "Project ID", key: "workOrder_id" },
  { label: "Site Name", key: "tender_project_name" },
  { label: "Category", key: "tender_type" },
  { label: "Date", key: "tender_start_date",
     render: (item) => item.tender_start_date ? new Date(item.tender_start_date).toLocaleDateString() : "-"
   },
  { label: "Assigned To", key: "tender_contact_person" },
  { label: "Status", key: "tender_status" },
];

const Site = () => {
  const { setTenderId } = useProject();
  const navigate = useNavigate();

  // States
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  // Fetch Sites
  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/tender/gettendersworkorder`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });

      setSites(res.data.data || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      toast.error("Failed to fetch site data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [currentPage, searchTerm, filterParams]);

  // Handle Row Click
  const handleRowClick = (site) => {
    setTenderId(site.tender_id);
    toast.success(`Selected Project: ${site.tender_project_name}`);
    navigate("boqsite");
  };

  return (
    <Table
      title="Site Management"
      subtitle="Site"
      pagetitle="Site Management"
      columns={Columns}
      endpoint={sites}
      AddModal={AddSite}
      onRowClick={handleRowClick}
      EditModal={true}
      routepoint={"boqsite"}
      FilterModal={Filters}
      addButtonLabel="New site Problem"
      addButtonIcon={<LuLandPlot size={24} />}
    />
  );
};

export default Site;

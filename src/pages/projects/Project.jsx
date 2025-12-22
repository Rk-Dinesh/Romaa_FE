import { useEffect, useState } from "react";
import { projectdata } from "../../components/Data";
import Filters from "../../components/Filters";
import ProgressBar from "../../components/ProgressBar";
import Table from "../../components/Table";
import { API } from "../../constant";
import axios from "axios";
import { toast } from "react-toastify";
import { useProject } from "./ProjectContext";
import { useNavigate } from "react-router-dom";

const Columns = [
  { label: "Project ID", key: "workOrder_id" },
  { label: "Name", key: "tender_project_name" },
  {
    label: "Location",
    key: "tender_location",
    render: (item) => `${item.tender_location?.city || ""}`,
  },
  {
    label: "Status",
    key: "status",

    render: (percentage) => <ProgressBar percentage={percentage.status} />,
  },
  { label: "Budget", key: "tender_value" },
];

const Project = () => {
const { setTenderId } = useProject();

  const navigate = useNavigate();
  const [projects, SetProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const fetchProjects = async () => {
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

      SetProjects(res.data.data);

      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch tenders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchTerm, filterParams]);
  const handleRowClick = (project) => {
  setTenderId(project.tender_id);
  toast.success(`Selected Project: ${project.tender_project_name}`);
};

  return (
    <Table
      loading={loading}
      title="Projects Management"
      subtitle="Project"
      pagetitle="Project Table"
      endpoint={projects}
      columns={Columns}
      routepoint={"zerocost"}
      FilterModal={Filters}
      onRowClick={handleRowClick}
    />
  );
};

export default Project;

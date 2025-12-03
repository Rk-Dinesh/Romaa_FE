import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddNMR from "./AddNMR";
import { LuNotebookText } from "react-icons/lu";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../constant";

const columns = [
  { label: "NMR ID", key: "worker_id" },
  { label: "Name", key: "employee_name" },
  { label: "Role", key: "role" },
  { label: "Department", key: "department" },
  { label: "Contractor", key: "contractor_name" },
  { label: "Status", key: "status" },
];

const NMR = () => {
  const [nmrData, setNmrData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const fetchNMRs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/contractworker/getcontractworker`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });
      setNmrData(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Failed to fetch NMR data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNMRs();
  }, [currentPage, searchTerm, filterParams]);

  return (
    <Table
      title="HR Management"
      subtitle="NMR"
      pagetitle="NMR"
      columns={columns}
      endpoint={nmrData}
      AddModal={AddNMR}
      editroutepoint={"editnmr"}
      routepoint={"viewnmr"}
      FilterModal={Filters}
      addButtonLabel="Add NMR"
      addButtonIcon={<LuNotebookText size={23} />}
      totalPages={totalPages}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      onUpdated={fetchNMRs}
      onSuccess={fetchNMRs}
      loading={loading}
    />
  );
};

export default NMR;

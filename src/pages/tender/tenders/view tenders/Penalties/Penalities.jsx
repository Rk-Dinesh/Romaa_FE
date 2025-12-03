import { LuUserRoundSearch } from "react-icons/lu";
import DeleteModal from "../../../../../components/DeleteModal";
import Table from "../../../../../components/Table";
import axios from "axios";
import { API } from "../../../../../constant";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AddPenalty from "./AddPenalities";

const penaltyColumns = [
  { label: "Penalty_id", key: "penalty_id" },
  { label: "Penalty Type", key: "penalty_type" },
  { label: "Penalty Amount", key: "penalty_amount" },
  { label: "Penalty Date", key: "penalty_date" ,
    render: (item) => item.penalty_date ? new Date(item.penalty_date).toLocaleDateString() : "-"
  },
  { label: "Description", key: "description" },
  { label: "Status", key: "status" },
];

const Penalities = () => {
  const { tender_id } = useParams(); 
  const [penalty, setPenalty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  // Fetch penalty list
  const fetchPenalty = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/penalty/penalties/${tender_id}`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });

      setPenalty(res.data.data);
      console.log(res.data.data);
      
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch penalty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalty();
  }, [currentPage, searchTerm, filterParams]);

  // Handle delete contract
  const handleDeletePenalty = async (penalty_id) => {
    try {
      await axios.delete(`${API}/penalty/remove/${tender_id}/${penalty_id}`);
      toast.success("Contract was successfully removed!");
      fetchPenalty();
    } catch (error) {
      toast.error("Failed to remove penalty.");
    }
  };

  return (
    <>
      <Table
        contentMarginTop="mt-0"
        endpoint={penalty}
        columns={penaltyColumns}
        ViewModal={true}
        AddModal={AddPenalty}
        addButtonLabel="Add Penalty"
        addButtonIcon={<LuUserRoundSearch size={24} />}
        exportModal={false}
        DeleteModal={DeleteModal}
        deletetitle="Penalty"
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        onUpdated={fetchPenalty}
        onSuccess={fetchPenalty}
        onDelete={handleDeletePenalty}
        idKey="penalty_id" 
      />
    </>
  );
};

export default Penalities;

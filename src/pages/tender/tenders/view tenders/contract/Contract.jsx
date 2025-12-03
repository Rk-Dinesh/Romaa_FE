import { LuUserRoundSearch } from "react-icons/lu";
import DeleteModal from "../../../../../components/DeleteModal";
import Table from "../../../../../components/Table";
import AddContractWorker from "./AddContract";
import axios from "axios";
import { API } from "../../../../../constant";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const customerColumns = [
  { label: "Contractor_id", key: "contractWorker_id" },
  { label: "Company Name", key: "contractWorker_name" },
  { label: "Contract Start", key: "contractStart_date" ,
     render: (item) => item.contractStart_date ? new Date(item.contractStart_date).toLocaleDateString() : "-"
  },
  { label: "End Date", key: "contractEnd_date" ,
     render: (item) => item.contractEnd_date ? new Date(item.contractEnd_date).toLocaleDateString() : "-"
  },
  { label: "Site", key: "contratctSite" },
  { label: "Status", key: "contractStatus" },
];

const Contract = () => {
  const { tender_id } = useParams(); 
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  // Fetch contracts list
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/permittedcontractor/permitted-contractor/${tender_id}`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });

      setContracts(res.data.data);
      console.log(res.data.data);
      
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [currentPage, searchTerm, filterParams]);

  // Handle delete contract
  const handleDeleteContract = async (contract_id) => {
    try {
      await axios.delete(`${API}/permittedcontractor/remove/${tender_id}/${contract_id}`);
      toast.success("Contract was successfully removed!");
      fetchContracts();
    } catch (error) {
      toast.error("Failed to remove contract.");
    }
  };

  return (
    <>
      <Table
        contentMarginTop="mt-0"
        endpoint={contracts}
        columns={customerColumns}
        ViewModal={true}
        AddModal={AddContractWorker}
        addButtonLabel="Add Contractor"
        addButtonIcon={<LuUserRoundSearch size={24} />}
        exportModal={false}
        DeleteModal={DeleteModal}
        deletetitle="Contract"
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        onUpdated={fetchContracts}
        onSuccess={fetchContracts}
        onDelete={handleDeleteContract}
        idKey="contractWorker_id" 
      />
    </>
  );
};

export default Contract;

import { useEffect, useState } from "react";
import { Projectpenaltydata, securitydepositdata } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import axios from "axios";
import { API } from "../../../constant";


const ProjectPenaltyColumns = [
  { label: "Tender ID", key: "tender_id" },
   { label: "Project Name", key: "tender_name" },
  // { label: "Deposit", key: "deposit", render: (row) => `₹${row.deposit.toLocaleString("en-IN")}` },
 
  // { label: "Expiry Date", key: "teb" },
  // { label: "Amount Collected", key: "amntcollected", render: (row) => `₹${row.amntcollected.toLocaleString("en-IN")}` },
  // { label: "Balance", key: "balance", render: (row) => `₹${row.balance.toLocaleString("en-IN")}` },
  // { label: "Note", key: "Note" },
    { label: "Work order ID", key: "workOrder_id" },
  { label: "Tender Start Date", key: "tender_start_date" ,
     render: (item) => item.tender_start_date ? new Date(item.tender_start_date).toLocaleDateString() : "-"
  },
  { label: "Tender End Date", key: "tender_end_date" ,
     render: (item) => item.tender_end_date ? new Date(item.tender_end_date).toLocaleDateString() : "-"
  },
 
//  {
//     label: "Location",
//     key: "tender_location",
//     render: (item) =>
//       `${item.tender_location?.city || ""}, ${item.tender_location?.state || ""}, ${
//         item.tender_location?.country || ""
//       } - ${item.tender_location?.pincode || ""}`,
//   },
  { label: "Amount", key: "tender_value" },
   { label: "Project Penalty", key: "penalty_final_value",  },
];

const ProjectPenalty = () => {
    const [penalty, setPenalty] = useState([]);
      const [loading, setLoading] = useState(false);
      const [searchTerm, setSearchTerm] = useState("");
      const [currentPage, setCurrentPage] = useState(1);
      const [totalPages, setTotalPages] = useState(0);
      const [filterParams, setFilterParams] = useState({
        fromdate: "",
        todate: "",
      });
    
      const fetchPenalty = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API}/tender/gettendersworkorder`, {
            params: {
              page: currentPage,
              limit: 10,
              search: searchTerm,
              fromdate: filterParams.fromdate,
              todate: filterParams.todate
            }
          });
          setPenalty(res.data.data);
          setTotalPages(res.data.totalPages);
        } catch (err) {
          toast.error("Failed to fetch tenders");
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        fetchPenalty();
      }, [currentPage, searchTerm, filterParams]);
  return (
    <Table
      title="Tender Management"
      subtitle="Project Penalty"
      pagetitle="Project Penalty"
      loading = {loading}
      endpoint={penalty}
      columns={ProjectPenaltyColumns}
      FilterModal={Filters}
       routepoint={"viewpenalty"}
       idKey="tender_id"

    />
  );
};

export default ProjectPenalty;

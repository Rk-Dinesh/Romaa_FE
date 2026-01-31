import { HiOutlineClipboardList } from "react-icons/hi";
import { useEffect, useState } from "react";
import { API } from "../../../constant";
import { toast } from "react-toastify";
import axios from "axios";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddTender from "./AddTender";
import EditTender from "./EditTender";

// ✅ Columns - match TenderModel fields
const TenderColumns = [
  { label: "Tender ID", key: "tender_id" },
  { label: "Name", key: "tender_name" ,className: "text-left"},
  {
    label: "Location",
    key: "tender_location",
    className: "text-left",
    render: (item) =>
      `${item.tender_location?.city || ""}, ${item.tender_location?.state || ""}, ${
        item.tender_location?.country || ""
      } - ${item.tender_location?.pincode || ""}`,
  },
  {
    label: "Submission Date",
    key: "tender_start_date",
    render: (item) => item.tender_start_date ? new Date(item.tender_start_date).toLocaleDateString("en-GB").replace(/\//g, "-") : "-"
  },
  { label: "Budget", key: "tender_value" , formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
  {
    label: "Status",
    key: "tender_status",
    // render: (item) => {
    //   let colorClass = "text-gray-700"; // default
    //   if (item.tender_status === "APPROVED") colorClass = "text-green-600";
    //   else if (item.tender_status === "REJECTED") colorClass = "text-red-600";
    //   else if (item.tender_status === "PENDING") colorClass = "text-blue-600 " ;

    //   return (
    //     <span className={colorClass}>
    //       {item.tender_status?.charAt(0).toUpperCase() + item.tender_status?.slice(1).toLowerCase() || "-"}
    //     </span>
    //   );
    // }
  }
];

const Tender = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/tender/gettenders`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate
        }
      });
      setTenders(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch tenders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [currentPage, searchTerm, filterParams]);

  return (
    <Table
      title="Tender Management"
      subtitle="Tender"
      pagetitle="Tenders Management"
      loading={loading}
      endpoint={tenders}
      columns={TenderColumns}
      AddModal={AddTender}
      EditModal={EditTender}
      routepoint={"viewtender"}
      FilterModal={Filters}
      addButtonLabel="Add Tender"
      addButtonIcon={<HiOutlineClipboardList size={24} />}
      totalPages={totalPages}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      onUpdated={fetchTenders} // so table reloads after add/edit/delete
      onSuccess={fetchTenders}
      idKey='tender_id'
    />
  );
};

export default Tender;

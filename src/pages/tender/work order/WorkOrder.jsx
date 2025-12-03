import { LiaClipboardListSolid } from "react-icons/lia";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { Workorderdata } from "../../../components/Data";
import AddWorkOrder from "./AddWorkOrder";
import EditWorkOrder from "./EditWorkOrder";
import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../../../constant";

const Columns = [
  { label: "Work order ID", key: "workOrder_id" },
  { label: "Date", key: "workOrder_issued_date" ,
     render: (item) => item.workOrder_issued_date ? new Date(item.workOrder_issued_date).toLocaleDateString() : "-"
  },
  { label: "Client Name", key: "client_name" },
  { label: "Project Name", key: "tender_name" },
 {
    label: "Location",
    key: "tender_location",
    render: (item) =>
      `${item.tender_location?.city || ""}, ${item.tender_location?.state || ""}, ${
        item.tender_location?.country || ""
      } - ${item.tender_location?.pincode || ""}`,
  },
  { label: "Amount", key: "tender_value" },
];

const WorkOrder = () => {
  const [workOrder, setWorkOrder] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filterParams, setFilterParams] = useState({
      fromdate: "",
      todate: "",
    });
  
    const fetchWOTenders = async () => {
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
        setWorkOrder(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        toast.error("Failed to fetch tenders");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchWOTenders();
    }, [currentPage, searchTerm, filterParams]);
  
  return (
    <Table
      title="Tender Management"
      subtitle="Work Order"
      pagetitle="Work Order"
      loading = {loading}
      endpoint={workOrder}
      columns={Columns}
      // AddModal={AddWorkOrder}
     // EditModal={EditWorkOrder}
      routepoint={"viewworkorder"}
      FilterModal={Filters}
      idKey='tender_id'
      id2Key='workOrder_id'
    />
  );
};

export default WorkOrder;

import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddEmployee from "./AddEmployee";
import EditEmployee from "./EditEmployee";
import { AiOutlineFileAdd } from "react-icons/ai";

import { toast } from "react-toastify";
import axios from "axios";
import { useEffect, useState } from "react";
import { API } from "../../../constant";

const EmployeeColumns = [
  { label: "Employee ID", key: "employee_id" },
  { label: "Name", key: "name" },
  { label: "Role", key: "role" },
//  { label: "Department", key: "department" },  // If department exists in your schema/backend
  { label: "Site Assigned", key: "site_assigned" },
  { label: "Status", key: "status" },
  {
    label: "Address",
    key: "address",
    render: (item) =>
      `${item.address?.city || ""}, ${item.address?.state || ""}, ${
        item.address?.country || ""
      } - ${item.address?.pincode || ""}`,
  },
  { label: "Phone", key: "contact_phone" },
  { label: "Email", key: "contact_email" },
];


const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/employee/getemployees`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });
      setEmployees(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm, filterParams]);

  return (
    <Table
      title="HR Management"
      subtitle="Employee"
      pagetitle="Employee Management"
      endpoint={employees}
      columns={EmployeeColumns}
      AddModal={AddEmployee}
      editroutepoint={"editemployee"}
      routepoint="viewemployee"
      FilterModal={Filters}
      addButtonLabel="Add Employee"
      addButtonIcon={<AiOutlineFileAdd size={23} />}
      totalPages={totalPages}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      onUpdated={fetchEmployees}
      onSuccess={fetchEmployees}
      loading={loading}
    />
  );
};

export default Employee;

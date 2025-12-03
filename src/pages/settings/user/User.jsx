import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { UsersData } from "../../../components/Data";
import { RiUserAddLine } from "react-icons/ri";
import DeleteModal from "../../../components/DeleteModal";
import AddUser from "./AddUser";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";
import TrashToast from "./TrashToast";

const UserColumns = [
  { label: "Name", key: "name" },
  { label: "Role", key: "role" },
  { label: "Phone Number", key: "contact_phone" },
  { label: "Email ID", key: "contact_email" },
  { label: "Status ", key: "status" },
  { label: "Created By", key: "created_by_user" },
];

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/employee/getallemployees`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });

      const usersWithRole = res.data.data.filter(
        (user) => user.role_id && user.role // or user.role_name if that's your field
      );
      setUsers(usersWithRole);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterParams]);

  const handleDelete = async (employee_id) => {
    const payload = {
      role_id: "",
      role: "",
    };
    try {
      setLoading(false);
      await axios.put(
        `${API}/employee/updateemployee/${employee_id}`, // <-- employee_id in URL
        payload
      );
      fetchUsers();
      toast(
        ({ closeToast }) => (
          <TrashToast
            onUndo={() => restoreUser(employee_id)}
            closeToast={closeToast}
          />
        ),
        { autoClose: 4000, theme: "dark" }
      );
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setLoading(false);
    }
  };

  const restoreUser = async (employee_id) => {
    try {
      const userToRestore = users.find((u) => u.employee_id === employee_id);
      if (!userToRestore) return;

      const payload = {
        role_id: userToRestore.role_id,
        role: userToRestore.role,
      };

      await axios.put(`${API}/employee/updateemployee/${employee_id}`, payload);

      toast.success("User restored ✅");
      fetchUsers(); // refresh list
    } catch (err) {
      console.error("Error restoring user:", err);
      toast.error("Failed to restore user ❌");
    }
  };

  return (
    <div>
      <Table
        title="Settings"
        subtitle="User "
        pagetitle="User"
        endpoint={users}
        columns={UserColumns}
        AddModal={AddUser}
        EditModal={true}
        editroutepoint={"edituser"}
        DeleteModal={DeleteModal}
        deletetitle="user"
        idKey="employee_id"
        onDelete={handleDelete}
        FilterModal={Filters}
        addButtonLabel="Add User"
        addButtonIcon={<RiUserAddLine size={23} />}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        onUpdated={fetchUsers}
        onSuccess={fetchUsers}
        loading={loading}
      />
    </div>
  );
};

export default User;

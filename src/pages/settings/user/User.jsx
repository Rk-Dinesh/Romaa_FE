import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { RiUserAddLine } from "react-icons/ri";
import AddUser from "./AddUser";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";

const UserColumns = [
 { label: "Employee ID", key: "employeeId" },
  { label: "Name", key: "name" },
  { label: "Designation", key: "designation" },
  { label: "Role Id", key: "role_id", 
    render: (item) =>
      `${item.role?.role_id || ""}`,
  },
  { label: "Role Name", key: "roleName", 
    render: (item) =>
      `${item.role?.roleName || ""}`,
  },
  
  { label: "Email", key: "email"  },
  { label: "Status", key: "status" },
];

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/employee/with-roles`);
      setUsers(res.data.data);
 
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <Table
        title="Settings"
        subtitle="User "
        pagetitle="User"
        endpoint={users}
        columns={UserColumns}
        AddModal={AddUser}
        EditModal={EditUser}
        DeleteModal={DeleteUser}
        FilterModal={Filters}
        addButtonLabel="Add User"
        addButtonIcon={<RiUserAddLine size={23} />}
        onUpdated={fetchUsers}
        onSuccess={fetchUsers}
        onDelete={fetchUsers}
        loading={loading}
      
      />
    </div>
  );
};

export default User;

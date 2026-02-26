import React from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { RiUserAddLine } from "react-icons/ri";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";
import { useUsers } from "./hooks/useUsers";


const UserColumns = [
  { label: "Employee ID", key: "employeeId" },
  { label: "Name", key: "name" },
  { label: "Designation", key: "designation" },
  { 
    label: "Role Id", 
    key: "role_id", 
    render: (item) => `${item.role?.role_id || ""}`,
  },
  { 
    label: "Role Name", 
    key: "roleName", 
    render: (item) => `${item.role?.roleName || ""}`,
  },
  { 
    label: "Access Mode", 
    key: "accessMode", 
    render: (item) => `${item.accessMode || ""}`,
  },
  { label: "Email", key: "email"  },
  { label: "Status", key: "status" },
];

const User = () => {
  // Fetch data using TanStack Query
  const { data: users = [], isLoading, isFetching, refetch } = useUsers();

  return (
    <div>
      <Table
        title="Settings"
        subtitle="User "
        pagetitle="User"
        
        // Data and Loading States
        endpoint={users}
        loading={isLoading}
        isRefreshing={isFetching}
        
        // Config
        columns={UserColumns}
        ViewModal={true}
        routepoint={"viewuser"}
        FilterModal={Filters}
        
        // Modals
        AddModal={AddUser}
        EditModal={EditUser}
        DeleteModal={DeleteUser}
        
        // Add Button Config
        addButtonLabel="Add User"
        addButtonIcon={<RiUserAddLine size={23} />}
        
        // Triggers (Refetch data when a user is added, updated, or deleted)
        onUpdated={refetch}
        onSuccess={refetch}
        onDelete={refetch}
      />
    </div>
  );
};

export default User;
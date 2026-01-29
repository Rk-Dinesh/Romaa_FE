import React, { useEffect, useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { RiUserAddLine } from "react-icons/ri";
import DeleteModal from "../../../components/DeleteModal";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";
import { FiLayers, FiShield } from "react-icons/fi";

const RoleColumns = [
  { label: "Role ID", key: "role_id" },
  { label: "Name", key: "roleName" },
  { label: "Description", key: "description" },
  { label: "Modules", key: "moduleAccess" ,render: (row) => getModule(row.moduleAccess)},
  { label: "Permissions", key: "totalPermissions" ,render: (row) => getPermission(row.totalPermissions)},
];

const getModule = (moduleAccess) => {
  // Logic: If it's an object, count the keys. If number, use it.
  const count = typeof moduleAccess === 'object' && moduleAccess !== null 
    ? Object.keys(moduleAccess).length 
    : (moduleAccess || 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300">
        <FiLayers size={14} className="flex-shrink-0" />
        <span className="text-xs font-bold">{count}</span>
        <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide ml-0.5">Modules</span>
      </div>
    </div>
  );
};

const getPermission = (permissionAccess) => {
  const count = permissionAccess || 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300">
        <FiShield size={14} className="flex-shrink-0" />
        <span className="text-xs font-bold">{count}</span>
        <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide ml-0.5">Access</span>
      </div>
    </div>
  );
};

const Roles = () => {
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/role/list`);

      setRoles(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (role_id) => {
    try {
      await axios.delete(`${API}/role/delete/${role_id}`);
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (err) {
      toast.error("Failed to delete role");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Table
      title="Settings"
      subtitle="Roles "
      loading={loading}
      pagetitle="Roles"
      endpoint={roles}
      columns={RoleColumns}
      AddModal={true}
      addroutepoint={"addroles"}
      EditModal={true}
      editroutepoint={"editroles"}
      // DeleteModal={DeleteModal}
      // deletetitle="role"
      idKey="role_id"
      // onDelete={handleDelete}
      FilterModal={Filters}
      addButtonLabel="Add Roles"
      addButtonIcon={<RiUserAddLine size={23} />}
      onUpdated={fetchRoles}
      onSuccess={fetchRoles}
    />
  );
};

export default Roles;

import React, { useEffect, useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { RiUserAddLine } from "react-icons/ri";
import DeleteModal from "../../../components/DeleteModal";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";

const RoleColumns = [
  { label: "Role ID", key: "role_id" },
  { label: "Name", key: "roleName" },
  { label: "Description", key: "description" },
  { label: "Modules", key: "moduleAccess" },
  { label: "Permissions", key: "totalPermissions" },
];

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

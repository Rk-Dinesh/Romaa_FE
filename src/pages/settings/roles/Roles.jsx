import React, { useEffect, useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { RoleData } from "../../../components/Data";
import { RiUserAddLine } from "react-icons/ri";
import DeleteModal from "../../../components/DeleteModal";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";

const RoleColumns = [
  { label: "Name", key: "name" },
  { label: "Role", key: "role_name" },
  { label: "Created By", key: "created_by_user" },
];

const Roles = () => {
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/role/getallroles`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });

      setRoles(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [currentPage, searchTerm, filterParams]);

  const handleDelete = async (roleId) => {
    try {
      await axios.delete(`${API}/role/deletebyroleid?roleId=${roleId}`);
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (err) {
      toast.error("Failed to delete role");
      console.error(err);
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
      DeleteModal={DeleteModal}
      deletetitle="role"
      idKey="role_id"
      onDelete={handleDelete}
      FilterModal={Filters}
      addButtonLabel="Add Roles"
      addButtonIcon={<RiUserAddLine size={23} />}
      totalPages={totalPages}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      onUpdated={fetchRoles}
      onSuccess={fetchRoles}
    />
  );
};

export default Roles;

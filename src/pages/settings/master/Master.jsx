import React, { useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { RoleData } from "../../../components/Data";
import { CiBank } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../../components/DeleteModal";

const RoleColumns = [
  { label: "Name", key: "name" },
  { label: "Role", key: "role" },
  { label: "Created By", key: "createdBy" },
];

const Master = () => {



  return (
    <div>
      <Table
        title="Settings"
        subtitle="Master "
        pagetitle="Master"
        endpoint={RoleData}
        columns={RoleColumns}
        EditModal={true}
        DeleteModal={DeleteModal}
        deletetitle="roles"
        FilterModal={Filters}
       
        addButtonLabel="Add Roles"
        addButtonIcon={<CiBank size={23} />}
      />
        
    </div>
  );
};

export default Master;

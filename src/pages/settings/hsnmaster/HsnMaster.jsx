import React, { useEffect, useState } from 'react'
import Table from '../../../components/Table'
import { RiUserAddLine } from 'react-icons/ri';
import axios from 'axios'
import { API } from '../../../constant'
import { toast } from 'react-toastify'
import UploadHSN from './UploadHSN';

const HSNColumns = [
  { label: "HSN Code", key: "code" },
  { label: "Name", key: "shortDescription" },
  { label: "Type", key: "type" },
  { label: "Description", key: "description" },
  { label: "TaxStructure", key: "taxStructure", render: (item) =>
      item.taxStructure
        ? `${item.taxStructure.igst || ""} %, ${item.taxStructure.cgst || ""} %, ${item.taxStructure.sgst || ""} %`
        : "-",},
];

const HsnMaster = () => {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]); 
    const fetchRoles = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API}/hsn/getall`);
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
  return (
   <Table
      title="Settings"
      subtitle="HSN "
      loading={loading}
      pagetitle="HSN"
      endpoint={roles}
      columns={HSNColumns}
      EditModal={true}
    //  editroutepoint={"editroles"}
      // DeleteModal={DeleteModal}
      // deletetitle="role"
      idKey="role_id"
      // onDelete={handleDelete}
      //FilterModal={Filters}
      UploadModal={UploadHSN}
      // onUpdated={fetchRoles}
     // onSuccess={fetchRoles}
    />
  )
}

export default HsnMaster
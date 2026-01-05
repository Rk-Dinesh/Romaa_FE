import React, { useEffect, useState } from 'react'
import Table from '../../../components/Table'
import Filters from '../../../components/Filters'
import { TbPencil } from 'react-icons/tb'
import { workDoneData } from '../../../components/Data'
import AddWorkDoneSite from './AddWorkDoneSite'
import axios from 'axios'
import { API } from '../../../constant'

const WorkDoneSite = () => {
  const tenderId = localStorage.getItem("tenderId");
  const workDoneColumns = [
    { label: "Work Done ID", key: "workDoneId" },
    { label: "Tender ID", key: "tender_id" },
    { label: "Report Date", key: "report_date" },
    { label: "Total Work Done", key: "totalWorkDone" },
    { label: "Created By", key: "created_by" },
    { label: "Status", key: "status" },
  ]

  

  const [data, setData] = useState([]);
  const fetchRequests = async () => {
    try {


      const res = await axios.get(
        `${API}/workdone/api/list/${tenderId}`
      );

      const formatted = res.data?.data?.map((item) => ({
        workDoneId: item.workDoneId,
        tender_id: item.tender_id,
        report_date: item.report_date
          ? new Date(item.report_date).toLocaleDateString("en-GB")
          : "-",

        totalWorkDone: item.totalWorkDone,
        created_by: item.created_by,
        status: item.status,

      }));

      setData(formatted || []);
    } catch (err) {
      console.error("Error fetching PR list", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <Table
      title={"DPR Work Done"}
      subtitle={"Work Done"}
      pagetitle={"Work Done"}
      columns={workDoneColumns}
      endpoint={data}
      EditModal={false}
      routepoint={"viewworkDoneSite"}
      FilterModal={Filters}
      AddModal={AddWorkDoneSite}
      onSuccess={fetchRequests}
      addButtonIcon={<TbPencil className="text-2xl text-primary" />}
      addButtonLabel={"Add Work Done"}
    />
  )
}

export default WorkDoneSite

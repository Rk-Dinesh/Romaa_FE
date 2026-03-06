import React, { useEffect, useState } from 'react'
import Table from '../../../components/Table'
import Filters from '../../../components/Filters'
import axios from 'axios'
import { API } from '../../../constant'

const ProjectWorkProgress = () => {
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
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
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
      loading={loading}
      EditModal={false}
      routepoint={"viewprojectworkprogress"}
      FilterModal={Filters}
      onSuccess={fetchRequests}
    />
  )
}

export default ProjectWorkProgress;

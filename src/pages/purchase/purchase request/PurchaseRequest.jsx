import React, { useEffect, useState } from "react";
import axios from "axios";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { AiOutlineFileAdd } from "react-icons/ai";
import RequestRegister from "./RequestRegister";
import { API } from "../../../constant";
import { date } from "yup";

const PurchaseRequest = () => {
  const [data, setData] = useState([]);

  const Columns = [
    { label: "Request ID", key: "requestId" },
    { label: "Date", key: "requestDate" },
    { label: "Project", key: "projectName" },
    { label: "Date of Requirements", key: "requiredOn" },
    { label: "Requested by", key: "siteIncharge" },
  ];

  const fetchRequests = async () => {
    try {
      const tenderId = localStorage.getItem("tenderId");

      const res = await axios.get(
        `${API}/purchaseorderrequest/api/getbyId/${tenderId}`
      );


      const formatted = res.data?.data?.map((item) => ({
        requestId: item.requestId,
        requestDate: item.requestDate
          ? new Date(item.requestDate).toLocaleDateString("en-GB")
          : "-",

        projectName: item.projectId,
        requiredOn: item.requiredByDate
          ? new Date(item.requiredByDate).toLocaleDateString("en-GB")
          : "-",

        siteIncharge: item.siteDetails?.siteIncharge || "N/A",
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
      title="Purchase Management"
      subtitle="Purchase Request"
      pagetitle="Purchase Request"
      endpoint={data}
      columns={Columns}
      AddModal={RequestRegister}
      routepoint="viewpurchaserequest"
      FilterModal={Filters}
      addButtonLabel="Request Register"
      addButtonIcon={<AiOutlineFileAdd size={24} />}
      id2Key="requestId"
    />
  );
};

export default PurchaseRequest;

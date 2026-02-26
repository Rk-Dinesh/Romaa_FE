import React from "react";
import { LuFileCheck } from "react-icons/lu";
import Table from "../../../../components/Table";
import Filters from "../../../../components/Filters";
import CreateRequest from "./CreateRequest";
import { useWORequests } from "../../hooks/useProjects";


const WORequest = () => {
  const projectId = localStorage.getItem("tenderId");
  
  // --- TanStack Query Hooks ---
  const { data = [], isLoading, isFetching, refetch } = useWORequests(projectId);

  const getStatusBadge = (status) => {
    const styles = {
      "Request Raised": "px-3 bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      "Quotation Requested": "px-3 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      "Quotation Received": "px-3 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      "Vendor Approved": "px-3 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
      "Purchase Order Issued": "px-3 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      "Completed": "px-3 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    };

    // Default style if status doesn't match
    const activeStyle = styles[status] || "bg-gray-50 text-gray-500 border-gray-200";

    return (
      <span className={`py-1 rounded-full text-xs font-semibold border ${activeStyle}`}>
        {status}
      </span>
    );
  };

  const Columns = [
    { label: "Request ID", key: "requestId" },
    { label: "Project", key: "projectId" },
    { label: "Project Name", key: "tender_project_name" },
    { label: "Request Date", key: "requestDate" },
    { label: "Date of Requirements", key: "requiredByDate" },
    { label: "Requested by", key: "siteIncharge" },
    {
      label: "Status",
      key: "status",
      // Render the badge here
      render: (row) => getStatusBadge(row.status)
    },
  ];


  return (
    <Table
      // Passes fetching state directly to your Table component
      loading={isLoading}
      isRefreshing={isFetching}
      
      AddModal={CreateRequest}
      addButtonLabel="Create Enquiry"
      addButtonIcon={<LuFileCheck size={22} />}
      
      // Hook refetch triggers when modal confirms success
      onSuccess={refetch} 
      onUpdated={refetch}
      
      endpoint={data}
      columns={Columns}
      routepoint="viewworequest"
      FilterModal={Filters}
      id2Key="requestId"
    />
  );
};

export default WORequest;
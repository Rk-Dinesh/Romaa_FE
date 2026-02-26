import React from "react";
import Filters from "../../../../components/Filters";
import Table from "../../../../components/Table";
import { useQuotationApprovedRequests } from "../../hooks/useProjects";


const WorkOrderIssuance = () => {
  const projectId = localStorage.getItem("tenderId");

  // Fetch formatted data using TanStack Query
  const { data = [], isLoading, isFetching } = useQuotationApprovedRequests(projectId);

  const getStatusBadge = (status) => {
    const styles = {
      "Request Raised": " px-4 bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      "Quotation Requested": "px-3 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      "Quotation Received": "px-3 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      "Vendor Approved": "px-3 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
      "Work Order Issued": "px-3 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      "Completed": "px-3 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    };

    // Default style if status doesn't match
    const activeStyle = styles[status] || "bg-gray-50 text-gray-500 border-gray-200";

    return (
      <span className={` py-1 rounded-full text-xs font-semibold border ${activeStyle}`}>
        {status}
      </span>
    );
  };

  const Columns = [
    { label: "Request ID", key: "requestId" },
    { label: "Project", key: "projectId" },
    { label: "Project Name", key: "tender_project_name" },
    { label: "Request Date", key: "requestDate" },
    { label: "Date of Requirements", key: "requiredOn" },
    { label: "Requested by", key: "siteIncharge" },
    { 
      label: "Status", 
      key: "status",
      render: (row) => getStatusBadge(row.status) 
    },
  ];

  return (
    <Table
      // Pass loading states to the Table component
      loading={isLoading}
      isRefreshing={isFetching}
      
      endpoint={data}
      columns={Columns}
      routepoint={"viewwoissuance"}
      FilterModal={Filters}
    />
  );
};

export default WorkOrderIssuance;
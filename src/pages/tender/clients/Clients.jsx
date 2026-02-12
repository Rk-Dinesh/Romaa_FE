import React, { useState } from "react";
import { LuUserRoundSearch } from "react-icons/lu";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddClients from "./AddClients";
import EditClients from "./EditClients";
import ViewClients from "./ViewClients";
import { useClients } from "./hooks/useClients";
import { useDebounce } from "../../../hooks/useDebounce";

const ClientColumns = [
  { label: "Client ID", key: "client_id" },
  { label: "Name", key: "client_name" },
  {
    label: "Address",
    key: "address",
    render: (item) =>
      item.address
        ? `${item.address.city || ""}, ${item.address.state || ""}`
        : "-",
  },
  { label: "Phone", key: "contact_phone" },
  { label: "Email", key: "contact_email" },
];

const Clients = () => {
  // 1. Local State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });

  // 2. Debounce Search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 3. Fetch Data (Cached & Optimized)
  const { 
    data, 
    isLoading, 
    isFetching, 
    refetch 
  } = useClients({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  return (
    <Table
      title="Tender Management"
      subtitle="Client"
      pagetitle="Clients Management"
      
      // Data Props
      loading={isLoading}
      isRefreshing={isFetching}
      endpoint={data?.data || []}
      totalPages={data?.totalPages || 0}
      
      // Controls
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={searchTerm}
      setSearch={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      
      // Modals & Actions
      columns={ClientColumns}
      AddModal={AddClients}
      EditModal={EditClients}
      ViewModal={ViewClients}
      FilterModal={Filters}
      addButtonLabel="Add Client"
      addButtonIcon={<LuUserRoundSearch size={24} />}
      
      // Refresh Trigger
      onUpdated={refetch}
      onSuccess={refetch}
    />
  );
};

export default Clients;
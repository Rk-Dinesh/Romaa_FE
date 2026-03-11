import { useState } from "react";
import { TbPlus } from "react-icons/tb";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddDailyLabourSite from "./AddDailyLabourSite";
import { useDLPList } from "./hooks/useDailyLabourReport";
import { useProject } from "../../../context/ProjectContext";
import { useDebounce } from "../../../hooks/useDebounce";

const statusRender = (val) => {
  const map = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[val] || "bg-gray-100 text-gray-600"}`}>
      {val}
    </span>
  );
};

const columns = [
  { label: "Report Date", key: "report_date", formatter: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
  { label: "Contractor", key: "contractor_id" },
  { label: "Headcount", key: "grand_total_headcount" },
  { label: "Total Amount", key: "grand_total_amount", formatter: (v) => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—" },
  { label: "Status", key: "status", render: (row) => statusRender(row.status) },
  { label: "Remark", key: "remark" },
];

const DailyLabourReport = () => {
  const { tenderId } = useProject();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching, refetch } = useDLPList(tenderId, {
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    from: filterParams.fromdate,
    to: filterParams.todate,
  });

  return (
    <Table
      title="Site Management"
      subtitle="Daily Labour Report"
      pagetitle="Daily Labour Report"
      columns={columns}
      endpoint={data?.data || []}
      totalPages={data?.totalPages || 1}
      loading={isLoading}
      isRefreshing={isFetching}
      AddModal={AddDailyLabourSite}
      routepoint="viewdailylabourReport"
      FilterModal={Filters}
      addButtonIcon={<TbPlus className="text-2xl text-primary" />}
      addButtonLabel="Add Daily Labour"
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={searchTerm}
      setSearch={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      onSuccess={refetch}
    />
  );
};

export default DailyLabourReport;

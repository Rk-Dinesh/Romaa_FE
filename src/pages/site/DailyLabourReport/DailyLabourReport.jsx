import { TbPlus } from "react-icons/tb";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddDailyLabourSite from "./AddDailyLabourSite";
import { useDLPSummary } from "./hooks/useDailyLabourReport";
import { useProject } from "../../../context/ProjectContext";

const columns = [
  {
    label: "Report Date",
    key: "report_date",
    formatter: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—",
  },
  { label: "Project Name",   key: "project_name" },
  { label: "Total Reports",  key: "total_reports" },
  {
    label: "Man Days",
    key: "total_man_days",
    formatter: (v) => v != null ? Number(v).toFixed(1) : "—",
  },
  {
    label: "Total Amount",
    key: "total_amount",
    formatter: (v) => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—",
  },
];

const DailyLabourReport = () => {
  const { tenderId } = useProject();

  const { data, isLoading, isFetching, refetch } = useDLPSummary(tenderId);

  return (
    <Table
      title="Site Management"
      subtitle="Daily Labour Report"
      pagetitle="Daily Labour Report"
      columns={columns}
      endpoint={data || []}
      loading={isLoading}
      isRefreshing={isFetching}
      AddModal={AddDailyLabourSite}
      EditModal={false}
      routepoint="viewdailylabourReport"
      FilterModal={Filters}
      addButtonIcon={<TbPlus className="text-2xl text-primary" />}
      addButtonLabel="Add Daily Labour"
      onSuccess={refetch}
    />
  );
};

export default DailyLabourReport;

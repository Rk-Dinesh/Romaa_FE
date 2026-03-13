import { TbPlus } from "react-icons/tb";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddWorkDone from "./AddWorkDone";
import { useProject } from "../../../context/ProjectContext";
import { useWorkDoneList } from "./hooks/useWorkDone";

const STATUS_COLORS = {
  Draft: "bg-gray-100 text-gray-600",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};

const columns = [
  { label: "Report ID", key: "workId" },
  {
    label: "Report Date",
    key: "report_date",
    formatter: (v) => (v ? new Date(v).toLocaleDateString("en-IN") : "—"),
  },
  { label: "Total Qty", key: "totalWorkDone" },
  { label: "Created By", key: "created_by" },
  {
    label: "Status",
    key: "status",
    render: (row) => (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-600"}`}
      >
        {row.status || "—"}
      </span>
    ),
  },
];

const WorkDone = () => {
  const { tenderId } = useProject();
  const { data, isLoading, isFetching, refetch } = useWorkDoneList(tenderId);

  return (
    <Table
      title="Site Management"
      subtitle="Work Done"
      pagetitle="Daily Progress Report"
      columns={columns}
      endpoint={data || []}
      loading={isLoading}
      isRefreshing={isFetching}
      AddModal={AddWorkDone}
      EditModal={false}
      routepoint="viewworkdone"
      FilterModal={Filters}
      addButtonIcon={<TbPlus className="text-2xl text-primary" />}
      addButtonLabel="Add Work Done"
      onSuccess={refetch}
    />
  );
};

export default WorkDone;

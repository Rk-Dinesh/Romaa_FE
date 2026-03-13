import { TbPlus } from "react-icons/tb";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddWorkDoneSite from "./AddWorkDoneSite";
import { useWorkDoneSummary } from "./hooks/useWorkDone";
import { useProject } from "../../../context/ProjectContext";

const columns = [
  {
    label: "Report Date",
    key: "report_date",
    formatter: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—",
  },
  { label: "Tender ID",         key: "tender_id" },
  { label: "Project Name",     key: "project_name" },
  { label: "Total Work Orders", key: "total_work_orders" },
];

const WorkDoneSite = () => {
  const { tenderId } = useProject();

  const { data, isLoading, isFetching, refetch } = useWorkDoneSummary(tenderId);

  return (
    <Table
      title="Site Management"
      subtitle="Work Done"
      pagetitle="Daily Progress Report"
      columns={columns}
      endpoint={data || []}
      loading={isLoading}
      isRefreshing={isFetching}
      AddModal={AddWorkDoneSite}
      EditModal={false}
      routepoint="viewworkDoneSite"
      FilterModal={Filters}
      addButtonIcon={<TbPlus className="text-2xl text-primary" />}
      addButtonLabel="Add Work Done"
      onSuccess={refetch}
    />
  );
};

export default WorkDoneSite;

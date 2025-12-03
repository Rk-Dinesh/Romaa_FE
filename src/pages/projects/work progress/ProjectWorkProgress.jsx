
import { Projectworkprogressdata } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";

const Columns = [
  { label: "Date & Time ", key: "datetime" },
  { label: "Work", key: "work" },
  { label: "Man Power", key: "manpower" },
  { label: "Machinery", key: "machinery" },
  { label: "Actual plan ", key: "actualplan" },
  { label: "Completion ", key: "completion" },
  { label: "Variance ", key: "variance" },
  { label: "Delay Reason ", key: "delayreason" },
];

const ProjectWorkProgress = () => {
  return (
    <Table
      title="Projects Management"
      subtitle="Work Progress"
      pagetitle="Work Progress"
      columns={Columns}
      endpoint={Projectworkprogressdata}
      routepoint="viewprojectworkprogress"
      FilterModal={Filters}
    />
  );
};

export default ProjectWorkProgress;

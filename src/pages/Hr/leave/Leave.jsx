import { Leavedata } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { TbDoorExit } from "react-icons/tb";

const Columns = [
  { label: "Employee name", key: "empname" },
  { label: "Role", key: "role" },
  { label: "Leave Type", key: "leavetype" },
  { label: " Date", key: "date" },
  { label: "Reason ", key: "reason" },
  { label: "Status", key: "status" },
];

const Leave = () => {
  return (
    <Table
      title="HR Management"
      subtitle="Leave"
      pagetitle="Leave"
      columns={Columns}
      endpoint={Leavedata}
      Datecontent={true}
      AddModal={true}
      EditModal={true}
      ViewModal={true}
      FilterModal={Filters}
      addButtonLabel="Request Leave"
      addButtonIcon={<TbDoorExit size={24}/>}
    />
  );
};

export default Leave;

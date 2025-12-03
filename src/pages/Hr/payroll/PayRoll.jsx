import { payrolldata } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";

const Columns = [
  { label: "Employee name", key: "empname" },
  { label: "Month", key: "month" },
  { label: "Salary ", key: "salary" },
  { label: " Deductions", key: "deductions" },
  { label: "Overtime ", key: "overtime" },
  { label: "Net Pay", key: "netpay" },
];

const PayRoll = () => {
  return (
    <Table
      title="HR Management"
      subtitle="Payroll"
      pagetitle="Payroll"
      columns={Columns}
      endpoint={payrolldata}
      EditModal={true}
      routepoint={"viewpayroll"}
      FilterModal={Filters}
    />
  );
};

export default PayRoll;

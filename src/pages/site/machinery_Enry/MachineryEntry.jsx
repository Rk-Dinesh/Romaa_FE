
import Table from "../../../components/Table";
import { MachineryEntryData } from "../../../components/Data";
import Filters from "../../../components/Filters";

const machineproductivityColumns =[
  { label: "Date", key: "Date" },
  { label: "Machine", key: "Machine" },
  { label: "Start Reading", key: "StartReading" },
  { label: "End Reading", key: "EndReading" },
  { label: "Attachments", key: "Attachments" },
  { label: "Action by", key: "ActionBy" }
];



const MachineryEntry = () => {
  return (
    
      <Table
        title="Site"
        subtitle="Machinery Entry"
        pagetitle="Machinery Entry"
        endpoint={MachineryEntryData}
        columns={machineproductivityColumns}
        exportModal={true}
        FilterModal={Filters}
      />
   
  );
};

export default MachineryEntry;

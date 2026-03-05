import React from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { TDSBData } from "../../../components/Data";

const TDSColumns = [
  { label: "Person / Company", key: "personCompany" },
  { label: "Pan No", key: "panNo" },
  { label: "Bill Date", key: "billDate" },
  { label: "Bill Amount", key: "billAmount" },
  { label: "TDS Director", key: "tdsDirector" },
  { label: "TDS Status", key: "tdsStatus" },
];

const TDS = () => {
  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <Table
        title="Finance"
        subtitle="TDS "
        pagetitle="TDS "
        endpoint={TDSBData}
        columns={TDSColumns}
        FilterModal={Filters}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
      />
    </div>
  );
};

export default TDS;

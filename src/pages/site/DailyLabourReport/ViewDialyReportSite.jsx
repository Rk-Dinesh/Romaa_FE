import React, { useState } from "react";
import Title from "../../../components/Title";

const ViewDialyReportSite = () => {

      const [mainFields, setMainFields] = useState([
        {
          label: "Name",
          value: `John Doe`,
          tooltip: "Name of the person",
        },
       {label: "Reporting To",
          value: `Jane Smith`,
          tooltip: "Person to whom the individual reports",
        },
        {
          label: "Site Location",
          value: `123 Main St, Springfield`,
          tooltip: "Location of the site",
        },
        {
          label: "Type",
          value: `Full-time`,
          tooltip: "Type of employment",
        },
        {
          label: "Date",
          value: `2023-10-01`,
          tooltip: "Date of the report",
        },
       
      ]);

  return (
    <div>
 
        <Title
          title="Site Management"
          active_title="Daily Labour Report"
        />
      <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm mt-3">
            <p className="font-semibold text-center text-lg ">
             Daily Labour Report
            </p>
    
            <div className="grid grid-cols-12 gap-2 items-start mt-3">
              {mainFields.map((field) => (
                <React.Fragment key={field.key}>
                  <p className="col-span-6 font-medium">{field.label}</p>
                  <div className="col-span-6">{field.value}</div>
                </React.Fragment>
              ))}
    
             
            </div>
          </div>
    </div>
  );
};

export default ViewDialyReportSite;

import React, { useState } from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../components/Title";
import Button from "../../../components/Button";

const ViewProjectWorkProgress = () => {
  const location = useLocation();
  const rowData = location.state?.item;
  const navigate = useNavigate();

  const [data, setData] = useState(
    rowData
      ? {
          0: [
            {
              label: "Date & Time",
              value: rowData.datetime,
              key: "datetime",
            },
            { label: "Work", value: rowData.work, key: "work" },
            { label: "Man Power", value: rowData.manpower, key: "manpower" },
            { label: "Machinery", value: rowData.machinery, key: "machinery" },
            { label: "Actual Plan", value: rowData.actualplan, key: "actualplan" },
            { label: "Completion", value: rowData.completion, key: "completion" },
            { label: "Variance", value: rowData.variance, key: "variance" },
            { label: "Delay Reason", value: rowData.delayreason, key: "delayreason" },
            { label: "Note", value: "note", key: "note" },
            { label: "Attachment", value: "link", key: "link" },

            { label: "Action By", value: "name", key: "name" },
          ],
        }
      : {}
  );

  const renderField = (field) => {
    return <p className="text-xs opacity-50">{field.value}</p>;
  };

  return (
    <>
      <div className="  h-full ">
        <div className="h-1/12">
          <Title
            title="Projects Management"
            sub_title="Work Progress" 
            active_title={" View Work Progress"}
          />
        </div>
        <div className="overflow-auto h-11/12 no-scrollbar">
          <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm mt-6">
            <div className="grid grid-cols-12 gap-2 items-start">
              {Object.entries(data).map(([section, fields]) => (
                <React.Fragment key={section}>
                  {fields.map((field) => (
                    <React.Fragment key={field.key}>
                      <p className="col-span-4 font-medium">{field.label}</p>
                      <div className="col-span-8">
                        {renderField(field, section)}
                      </div>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
     

          <div className="flex justify-end py-2 ">
            <Button
              onClick={() => navigate("..")}
              button_name="Back"
              button_icon={<IoChevronBackSharp />}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewProjectWorkProgress;

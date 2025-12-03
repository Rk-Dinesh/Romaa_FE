import React, { useState } from "react";
import { TbPencil } from "react-icons/tb";
import { IoCheckmark } from "react-icons/io5";
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Button";
import Title from "../../../../components/Title";
import GsTable from "./GsTable";
import { AiOutlineSave } from "react-icons/ai";
import { Summarydata } from "../../../../components/Data";

const ViewGs = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState(Summarydata);
  const [headings, setHeadings] = useState(["Description", "Amount"]);
  const [isEditing, setIsEditing] = useState(false);
  const [projectInfo, setProjectInfo] = useState([
    {
      label: "Project",
      key: "project",
      value: `Rehabilitation of drainage inlets in Kannanar drain and Jeepable
track from LS. 31.00 Km to 33.00 Km in Right Bank of Kannanar
drain in Keelakurichi, Periyakkottai and Puliyakudi Villages of
Pattukkottai Taluk in Thanjavur District`,
    },
    { label: "Client", key: "client", value: "WRO" },
    {
      label: "Location",
      key: "location",
      value: "Pattukkottai Taluk in Thanjavur District",
    },
    {
      label: "Contractual Completion Duration",
      key: "contractDuration",
      value: "12 months",
    },
    {
      label: "Considered Completion Duration",
      key: "consideredDuration",
      value: "05 months",
    },
  ]);

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => {
    setIsEditing(false);
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <Title
            title="Projects Management"
            sub_title="Detailed Estimate"
            active_title="GS(General Abstract)"
          />
          {!isEditing ? (
            <Button
              button_name="Edit"
              button_icon={<TbPencil size={23} />}
              onClick={handleEditClick}
            />
          ) : (
            <Button
              button_name="Save"
              button_icon={<AiOutlineSave size={23} />}
              onClick={handleSaveClick}
            />
          )}
        </div>

        <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm">
          <p className="font-semibold">Gs (General Abstract)</p>
          <div className="grid grid-cols-12 gap-1 items-center">
            {projectInfo.map((item, index) => (
              <React.Fragment key={item.key}>
                <p className="col-span-4 font-medium">{item.label}</p>
                <div className="col-span-8">
                  {isEditing ? (
                    item.key === "project" ? (
                      <textarea
                        value={item.value}
                        onChange={(e) => {
                          const updated = [...projectInfo];
                          updated[index].value = e.target.value;
                          setProjectInfo(updated);
                        }}
                        className="border dark:border-border-dark-grey outline-none border-input-bordergrey rounded px-2 py-1 text-xs w-full min-h-[80px]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => {
                          const updated = [...projectInfo];
                          updated[index].value = e.target.value;
                          setProjectInfo(updated);
                        }}
                        className="border dark:border-border-dark-grey outline-none border-input-bordergrey rounded px-2 py-1 text-xs w-full"
                      />
                    )
                  ) : (
                    <p className="text-xs opacity-50 whitespace-pre-wrap">
                      {item.value}
                    </p>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <GsTable
          isEditing={isEditing}
          tableData={tableData}
          setTableData={setTableData}
          headings={headings}
        />

        <div className="flex justify-end mt-4">
          <Button
            onClick={() => navigate("..?tab=1")}
            button_name="Back"
            button_icon={<IoChevronBackSharp />}
          />
        </div>
      </div>
    </>
  );
};

export default ViewGs;

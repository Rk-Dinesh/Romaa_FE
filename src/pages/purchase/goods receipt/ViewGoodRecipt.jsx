import React, { useState } from "react";
import { TbPencil } from "react-icons/tb";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSave } from "react-icons/ai";
import Title from "../../../components/Title";
import Button from "../../../components/Button";

const ViewGoodRecipt = () => {
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
  const rowData = location.state?.item;
  const navigate = useNavigate();

const [data, setData] = useState(
  rowData
    ? {
        0: [
          { label: "Project Name", value: rowData.projectname, key: "projectName" },
          { label: "Project ID", value: rowData.projectid, key: "projectId" },
          { label: "Purchase Order ID", value: rowData.orderid, key: "purchaseOrderId" },
          { label: "Supplier Name", value: rowData.recdate, key: "supplierName" },
          { label: "Material Received Date", value: rowData.suppliername, key: "materialReceivedDate" },
          { label: "Location", value: "chennai", key: "location" },
          { label: "Variance", value: "varience", key: "variance" },
        ],
      }
    : {}
);

  const updateField = (key, newValue, section) => {
    setData((prevData) => ({
      ...prevData,
      [section]: prevData[section].map((item) =>
        item.key === key ? { ...item, value: newValue } : item
      ),
    }));
  };

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = (data) => {
    setIsEditing(false);
  };

  const renderField = (field, section) => {
    if (isEditing) {
       if (field.key === "materialReceivedDate") {
  return (
    <input
      type="date"
      className="w-full p-1 border dark:border-border-dark-grey border-input-bordergrey rounded text-xs"
      value={field.value}
      onChange={(e) => updateField(field.key, e.target.value, section)}
    />
  );
}
      return (
        <input
          type="text"
          className="w-full p-1 border dark:border-border-dark-grey border-input-bordergrey rounded text-xs"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value, section)}
        />
      );
    }
    const varqty = data[section]?.find((f) => f.key === "varqty")?.value;
    if (field.key === "amount" && Number(varqty) < 0) {
      return (
        <p className="text-xs font-semibold text-red-500">{field.value}</p>
      );
    }

    return <p className="text-xs opacity-50">{field.value}</p>;
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center my-2">
          <Title
            title="Purchase"
            sub_title="Good Recipts "
            active_title={
              isEditing ? "Edit Good Recipts" : "View Good Recipts"
            }
          />
          {!isEditing ? (
            <Button
              button_name="Edit"
              button_icon={<TbPencil size={23} />}
              onClick={handleEditClick}
            />
          ) : (
            <div className="flex gap-2 items-center">
              <Button
                button_name="Save"
                button_icon={<AiOutlineSave size={23} />}
                onClick={handleSaveClick}
              />
            </div>
          )}
        </div>

        <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm">            <p className=" text-lg font-semibold flex justify-center items-center">Good Reciptes</p>
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
    </>
  );
};

export default ViewGoodRecipt;


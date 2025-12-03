import React, { useState } from "react";
import Button from "../../../components/Button";
import Title from "../../../components/Title";
import { TbPencil } from "react-icons/tb";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

const ViewMaterialIssue = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 GET DATA FROM MATERIAL ISSUE LIST PAGE
  const materialData = location.state?.item || {};

  // 🔥 DYNAMIC FIELDS BASED ON materialData
  const [fields, setFields] = useState([
    {
      label: "Site Name",
      value: materialData.site_name || "",
      type: "text",
      key: "site_name",
      tooltip: "Name of the site where material is issued",
    },
    {
      label: "Material",
      value: materialData.item_description || "",
      type: "text",
      key: "item_description",
      tooltip: "Material issued to the site",
    },
    {
      label: "Unit",
      value: materialData.unit || "",
      type: "text",
      key: "unit",
      tooltip: "Measurement unit for the material",
    },
    {
      label: "Issued Qty",
      value: materialData.issued_quantity || "",
      type: "number",
      key: "issued_quantity",
      tooltip: "Quantity of material issued",
    },
    {
      label: "Work Location",
      value: materialData.work_location || "",
      type: "text",
      key: "work_location",
      tooltip: "Location where the material is used",
    },
    {
      label: "Priority Level",
      value: materialData.priority_level || "",
      type: "text",
      key: "priority_level",
      tooltip: "Priority level of this issued material",
    },
    {
      label: "Requested By",
      value: materialData.requested_by || "",
      type: "text",
      key: "requested_by",
      tooltip: "Person who requested the material",
    },
  ]);

  const updateField = (key, newValue) => {
    setFields((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, value: newValue } : item
      )
    );
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = () => {
    setIsEditing(false);

    // Prepare payload to send API
    const updatedData = fields.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {});

    console.log("Updated Material Issue:", updatedData);

    // TODO: API save call here
  };

  const TooltipWrapper = ({ tooltip, children }) => {
    if (!tooltip) return children;
    return (
      <div className="relative group inline-block cursor-help">
        {children}
        <div className="absolute z-10 hidden group-hover:block bg-indigo-100 text-black text-xs font-semibold px-3 py-1 rounded shadow-md -top-6 left-36 -translate-x-1/2 w-52 whitespace-normal">
          {tooltip}
          <div className="absolute -bottom-1 left-1 w-3.5 h-3 bg-indigo-100 transform rotate-45"></div>
        </div>
      </div>
    );
  };

  const renderField = (field) => {
    if (isEditing) {
      return (
        <input
          type={field.type || "text"}
          className="w-full p-1 border border-input-bordergrey dark:border-border-dark-grey rounded text-xs"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        />
      );
    }

    return (
      <TooltipWrapper tooltip={field.tooltip}>
        <p className="text-xs opacity-50">{field.value}</p>
      </TooltipWrapper>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center my-2">
        <Title
          title="Site Management"
          sub_title="Material Issue"
          active_title={isEditing ? "Edit Material Issued" : "View Material Issued"}
        />

        {!isEditing ? (
          <Button
            button_name="Edit"
            button_icon={<TbPencil size={23} />}
            onClick={handleEditClick}
          />
        ) : (
          <Button button_name="Save" onClick={handleSaveClick} />
        )}
      </div>

      <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm">
        <p className="font-semibold text-center text-lg">Material Issue Details</p>

        <div className="grid grid-cols-12 gap-2 items-start">
          {fields.map((field) => (
            <React.Fragment key={field.key}>
              <p className="col-span-4 font-medium">{field.label}</p>
              <div className="col-span-8">{renderField(field)}</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex justify-end py-2">
        <Button
          onClick={() => navigate("..")}
          button_name="Back"
          button_icon={<IoChevronBackSharp />}
        />
      </div>
    </div>
  );
};

export default ViewMaterialIssue;

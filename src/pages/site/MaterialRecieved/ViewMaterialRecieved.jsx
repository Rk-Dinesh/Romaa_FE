import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Title from "../../../components/Title";
import { TbPencil } from "react-icons/tb";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

const ViewMaterialRecieved = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const materialData = location.state?.item || {}; // ✅ Comes from navigate(..., { state: { item } })

  const [fields, setFields] = useState([]);

  // Helper — format date as DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("en-GB").replaceAll("/", "-");
  };

  // ✅ Populate fields from materialData
  useEffect(() => {
    if (Object.keys(materialData).length > 0) {
      setFields([
         {
          label: "Request ID",
          value: materialData.requestId || "-",
          type: "text",
          key: "requestId",
          tooltip: "Request identifier for the material received",
        },
        {
          label: "Material",
          value: materialData.item_description || "-",
          type: "text",
          key: "item_description",
          tooltip: "Name of the material received",
        },
        {
          label: "Unit",
          value: materialData.unit || "-",
          type: "text",
          key: "unit",
          tooltip: "Measurement unit for the material",
        },
        {
          label: "Received Qty",
          value: materialData.received_quantity ?? 0,
          type: "number",
          key: "received_quantity",
          tooltip: "Quantity of material received",
        },
         {
          label: "Site ",
          value: materialData.site_name ?? 0,
          type: "number",
          key: "site_name",
          tooltip: "Site Name",
        },

        {
          label: "Recieved Date",
          value: formatDate(materialData.received_date),
          type: "date",
          key: "received_date",
          tooltip: "Date when the material was Received",
        },

      ]);
    }
  }, [materialData]);

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
    console.log("Saved Fields:", fields);
    // You can call API PUT/POST here with updated field values
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

  if (!materialData || Object.keys(materialData).length === 0) {
    return <p className="text-center mt-4 text-sm">No material data found</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center my-2">
        <Title
          title="Site Management"
          sub_title="Material Received"
          active_title={
            isEditing ? "Edit Material Received" : "View Material Received"
          }
        />
        {/* {!isEditing ? (
          <Button
            button_name="Edit"
            button_icon={<TbPencil size={23} />}
            onClick={handleEditClick}
          />
        ) : (
          <Button button_name="Save" onClick={handleSaveClick} />
        )} */}
      </div>

      <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm">
        <p className="font-semibold text-center text-lg">
          Material Received Details
        </p>
        <div className="grid grid-cols-12 gap-2 items-start">
          {fields.map((field) => (
            <React.Fragment key={field.key}>
              <p className="col-span-4 font-medium">{field.label}</p>
              <div className="col-span-8">{renderField(field)}</div>
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
  );
};

export default ViewMaterialRecieved;

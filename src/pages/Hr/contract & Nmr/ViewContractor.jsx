import React, { useState } from "react";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";
import { Pencil } from "lucide-react";
import { useLocation } from "react-router-dom";
import EditContractor from "./EditContractor";

const contractorFields = [
  { label: "Company Name", key: "company_name" },
  { label: "Contact Person", key: "contact_person" },
  { label: "Contact Phone", key: "contact_phone" },
  { label: "Contact Email", key: "contact_email" },
  {
    label: "Address",
    key: "address",
    render: (item) =>
      `${item.address?.city || ""}, ${item.address?.state || ""}, ${item.address?.country || ""} - ${item.address?.pincode || ""}`,
  },
  { 
    label: "Business Type", 
    key: "business_type",
  },
  { 
    label: "License Number", 
    key: "license_number",
  },
  { 
    label: "Contract Start Date", 
    key: "contract_start_date",
    render: (item) => item.contract_start_date
      ? new Date(item.contract_start_date).toLocaleDateString("en-GB")
      : "-"
  },
  { 
    label: "Contract End Date", 
    key: "contract_end_date",
    render: (item) => item.contract_end_date
      ? new Date(item.contract_end_date).toLocaleDateString("en-GB")
      : "-"
  },
  { label: "Status", key: "status" },
  { label: "Remarks", key: "remarks" },
];

const ViewContractor = () => {
  const { state } = useLocation();
  const contractor = state?.item || {};
  const [onEdit, setOnEdit] = useState(false);

  if (!contractor || Object.keys(contractor).length === 0) {
    return <div className="p-4 text-red-600">No contractor data found.</div>;
  }

  return (
    <>
      {!onEdit ? (
        <>
          <div className="sm:my-2 flex sm:items-center flex-col sm:flex-row items-start sm:justify-between space-y-1.5 my-4">
            <Title
              title="HR Management"
              sub_title="Contractor"
              page_title="Contractor"
            />
            <ButtonBg
              button_name="Edit"
              button_icon={<Pencil size={16} />}
              onClick={() => setOnEdit(true)}
            />
          </div>
          <div className="dark:bg-layout-dark bg-white w-full flex flex-col sm:grid grid-cols-2 gap-y-2 rounded-md px-4 py-6">
            <div className="col-span-2 flex justify-center items-center mb-4 ">
              <p className="text-xl font-semibold">View Contractor</p>
            </div>
            <div className="flex flex-col col-span-2 sm:grid grid-cols-2 w-full space-y-2">
              {contractorFields.map((field) => (
                <React.Fragment key={field.key}>
                  <p className="text-sm col-span-1 font-bold dark:text-gray-200 text-gray-800">
                    {field.label}
                  </p>
                  <p className="text-sm col-span-1 dark:text-gray-400 text-gray-600">
                    {field.render
                      ? field.render(contractor)
                      : contractor[field.key] || "-"}
                  </p>
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      ) : (
        <EditContractor />
      )}
    </>
  );
};

export default ViewContractor;

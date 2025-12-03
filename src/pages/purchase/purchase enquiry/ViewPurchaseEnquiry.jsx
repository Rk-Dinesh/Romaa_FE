import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { purchaseRequestData, purchaseRequestdataview } from "../../../components/Data";
import Button from "../../../components/Button";
import Title from "../../../components/Title";
import { useState } from "react";

const requestFields = [
  { label: "Request ID", key: "requestid" },
  { label: "Date", key: "date" },
  { label: "Project", key: "project" },
  { label: "Date of Requirements", key: "dateofrequirements" },
  { label: "Requested by", key: "requestedby" },
];

const ViewPurchaseEnquiry = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="h-full">
        <div className="flex justify-between items-center h-1/12">
          <Title
            title="Purchase Management"
            sub_title="Purchase Enquiry"
            page_title="Purchase Enquiry"
          />
        </div>
        <div className="h-full overflow-auto space-y-2 mt-2">
          <div className="dark:bg-layout-dark bg-white w-full gap-y-2 rounded-md px-6 py-6">
            <p className="text-xl text-center font-semibold pb-4">
              Purchase Enquiry
            </p>
            <div className="flex flex-col col-span-2 sm:grid grid-cols-7 w-full space-y-2">
              {requestFields.map(field => (
                <React.Fragment key={field.key}>
                  <p className="text-sm col-span-3 font-bold dark:text-gray-200 text-gray-800">{field.label}</p>
                  <p className="text-sm col-span-2  dark:text-gray-400 text-gray-600">
                    {purchaseRequestData[field.key] || "-"}
                  </p>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="dark:bg-layout-dark bg-white w-full gap-y-2 rounded-md px-6 py-6">
            <table className="w-full text-center">
              <thead className="dark:bg-indigo-400 dark:text-black bg-[#E3ECFF]">
                <tr>
                  <th className="p-2.5 rounded-l-md">S.no</th>
                  <th>Material</th>
                  <th>Units</th>
                  <th className="rounded-r-md">Quantity</th>
                </tr>
              </thead>
              <tbody className="text-sm opacity-60">
                {purchaseRequestdataview.map((item, index) => (
                  <tr key={index}>
                    <td className="p-1">{index + 1}</td>
                    <td>{item.material}</td>
                    <td>{item.units}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="my-4 flex justify-end">
        <Button
          button_name="Back"
          button_icon={<ChevronLeft />}
          onClick={() => navigate("..")}
        />
      </div>
    </>
  );
};

export default ViewPurchaseEnquiry;
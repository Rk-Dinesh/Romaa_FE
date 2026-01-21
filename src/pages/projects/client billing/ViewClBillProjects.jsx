import React, { useState } from "react";
import { TbPencil } from "react-icons/tb";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSave } from "react-icons/ai";
import Title from "../../../components/Title";
import Button from "../../../components/Button";
import ComparativeTable from "./ComparativeTable";
import BillAbstractTable from "./BillAbstractTable";
import BillDetailedTable from "./BillDetailedTable";

// Define the tabs list
const TABS = [
  "Comparative",
  "Bill Abstract",
  "Bill Detailed",
  "Steel 1000MT",
  "Steel 1000MT Detailed",
  "Steel 1500MT",
  "Steel 1500MT Detailed",
];

const ViewClBillProjects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Comparative");
  const rowData = location.state?.item;
  console.log(rowData);
  const tenderId = rowData.tender_id;
  const billId = rowData.bill_id;
  const billSequence = rowData.bill_sequence;

  const renderTabContent = () => {
    switch (activeTab) {
      case "Bill Abstract":
       return (
        <div className="animate-fade-in">
           {/* Replace the old grid layout with the new component */}
           <BillAbstractTable tenderId={tenderId} billId={billId} />
        </div>
      );

      case "Comparative":
        return (
          <div className="animate-fade-in">
            {/* Pass IDs to the Table Component */}
            <ComparativeTable tenderId={tenderId} billId={billId} />
          </div>
        );

      case "Bill Detailed":
        return (
          <div className="animate-fade-in">
            {/* Pass IDs to the Table Component */}
            <BillDetailedTable tenderId={tenderId} billId={billId} abstractName="Abstract Estimate" billSequence={billSequence}/>
          </div>
        );
      case "Steel 1000MT":
        return (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 animate-fade-in">
            <div className="text-4xl mb-2 opacity-20">📄</div>
            <p>Content for <span className="font-bold">{activeTab}</span> will go here.</p>
          </div>
        );
      case "Steel 1000MT Detailed":
        return (
          <div className="animate-fade-in">
            {/* Pass IDs to the Table Component */}
            <BillDetailedTable tenderId={tenderId} billId={billId} abstractName="Steel 1000MT" billSequence={billSequence}/>
          </div>
        );
      case "Steel 1500MT":
        return (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 animate-fade-in">
            <div className="text-4xl mb-2 opacity-20">📄</div>
            <p>Content for <span className="font-bold">{activeTab}</span> will go here.</p>
          </div>
        );
      case "Steel 1500MT Detailed":
        return (
          <div className="animate-fade-in">
            {/* Pass IDs to the Table Component */}
            <BillDetailedTable tenderId={tenderId} billId={billId} abstractName="Steel 1500MT" billSequence={billSequence}/>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 animate-fade-in">
            <div className="text-4xl mb-2 opacity-20">📄</div>
            <p>Content for <span className="font-bold">{activeTab}</span> will go here.</p>
          </div>
        );
    }
  };

  return (
    <>
      <div>
        <Title
          title="Projects Management"
          sub_title="Client Billing "
          active_title="View Client Billing"
        />

        <div className="w-full mb-4">
          <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide gap-3 py-2 px-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-out shadow-sm
                  ${activeTab === tab
                    ? "bg-slate-800 text-white shadow-md transform scale-105 dark:bg-blue-600 ring-2 ring-offset-1 ring-slate-300 dark:ring-offset-gray-900 dark:ring-blue-800"
                    : "bg-white text-gray-600 hover:bg-gray-100 hover:-translate-y-0.5 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className=" min-h-[400px] overflow-auto">
          {renderTabContent()}
        </div>

        <div className="flex justify-end py-4">
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

export default ViewClBillProjects;
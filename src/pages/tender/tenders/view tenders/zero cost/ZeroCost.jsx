import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Summary from "./summary/Summary";
import BOQSplit from "./boq split/BOQSplit";
import RateAnalysis from "./Rate analysis/RateAnalysis";
import SiteOverHead from "./Site overheads/SiteOverHead";
import Materials from "./materials/Materials";
import AddMaterial from "./materials/AddMaterial";
import EditMaterial from "./materials/EditMaterial";
import Machines from "./machines/Machines";
import ManPower from "./man power/ManPower";
import { IoChevronBackSharp } from "react-icons/io5";
import Button from "../../../../../components/Button";


  const tabs = [
  {
    id: "1",
    label: " Summary",
    component:<Summary/>,

  },
  {
    id: "2",
    label: "BOQ Split",
    component:<BOQSplit/>,

  },
   {
    id: "3",
    label: " Rate Analysis",
    component:<RateAnalysis/>,

  },
   {
    id: "4",
    label: " Site Overheads",
    component:<SiteOverHead/>,
   

  
  },
   {
    id: "5",
    label: " Materials",
    component:<Materials/>,
  
  },

     {
    id: "6",
    label: " Machine",
    component:<Machines/>,

  },
     {
    id: "7",
    label: " Man Power",
    component:<ManPower/>,
  
  },
];


const ZeroCost = () => {
  const navigate =  useNavigate();
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className=" font-roboto-flex  cursor-pointer flex justify-between items-center  ">
          <div className="flex flex-wrap gap-2 py-2.5 ">
            {tabs.map(({ id, label }) => (
              <p
                key={id}
                className={`flex gap-2 items-center px-4 py-2.5 font-medium rounded-lg text-sm whitespace-nowrap ${
                  activeTab === id
                    ? "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue"
                    : "dark:text-white text-darkest-blue"
                }`}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </p>
            ))}
          </div>
        </div>
        <div className=" h-full overflow-y-auto  no-scrollbar">
          {activeTabData?.component}
        </div>
                   {/* <div className="flex justify-end py-2 ">
          <Button
            onClick={() => navigate("..")}
            button_name="Back"
            button_icon={<IoChevronBackSharp/>}
          />
        </div> */}
      </div>
    </>
  );
};

export default ZeroCost;

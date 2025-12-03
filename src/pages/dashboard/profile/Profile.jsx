import React, { useState } from "react";
import Title from "../../../components/Title";
import Filters from "../../../components/Filters";
import Profile_Tab from "./profile/Profile_Tab";
import Leave from "./leave/Leave";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [filter, setFilter] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "leave", label: "Leave" },
    { id: "document", label: "Document" },
  ];
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const handleFilter = ({ fromdate, todate }) => {
    setFilterParams({ fromdate, todate });
    setFilter(false);
    setCurrentPage(1);
  };
  const currentTabLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <div className="flex flex-col h-full">
      <div className="sticky  top-0 z-20 w-full pb-2">
        <div className="flex justify-between py-2 pb-3">
          <Title
            title="Dashboard"
            sub_title="Profile"
            page_title={currentTabLabel}
          />
        </div>
        
          <div className="flex justify-between mt-2 ">
            <div className="flex gap-2  ">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`py-2 px-3 rounded-md text-sm font-medium ${
                    activeTab === tab.id
                      ? " text-white bg-darkest-blue font-light   font-roboto-flex"
                      : "text-black bg-white font-light font-roboto-flex"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
           </div>
          <div className=" overflow-y-auto no-scrollbar">
            {activeTab === "profile" && (
              <>
                <Profile_Tab />
              </>
            )}
            {activeTab === "leave" && <><Leave /></>}
            {activeTab === "document" && <>
            <p>Screens under developement</p></>}
          </div>
        
     
      {filter && (
        <Filters onclose={() => setFilter(false)} onFilter={handleFilter} />
      )}
    </div>
  );
};

export default Profile;

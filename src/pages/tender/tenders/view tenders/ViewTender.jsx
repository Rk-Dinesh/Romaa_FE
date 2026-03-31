import React, { useEffect, useState } from "react";
import Title from "../../../../components/Title";
import { TbFileExport } from "react-icons/tb";
import { LuFileCheck } from "react-icons/lu";
import { MdArrowBackIosNew } from "react-icons/md";
import TenderOverView from "./tender overview/TenderOverView";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Plan from "./plans/Plan";
import BOQ from "./Boq/BOQ";
import ZeroCost from "./zero cost/TenderZeroCost";
import Contract from "./contract/Contract";
import Vendor from "./vendor/Vendors";
import EMD from "./Emd/EMD";
import axios from "axios";
import { API } from "../../../../constant";
import Penalities from "./Penalties/Penalities";
import Bid from "./bid/Bid";
import Loader from "../../../../components/Loader";
import TenderDetailedEstimate from "./detailed estimate/TenderDetailedEstimate";
import GeneralSetup from "./Setup/GeneralSetup";
import { toast } from "react-toastify";
import { useRef } from "react";

const ViewTender = () => {
  const { tender_id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isApproved, setIsApproved] = useState(false);
  const [activeTabLoading, setActiveTabLoading] = useState(true);
  const tabContainerRef = useRef(null);
  const activeTabRef = useRef(null);

  const tabs = [
    {
      id: "1",
      label: "Tender Overview",
      component: <TenderOverView />,
      buttons: [
        {
          label: "Approve Tender",
          icon: <LuFileCheck size={23} />,
          className: "bg-darkest-blue text-white",
        },
        {
          label: "Export",
          icon: <TbFileExport size={23} />,
          className: "bg-white text-darkest-blue",
        },
      ],
    },
    { id: "2", label: "Tender Documents", component: <Plan /> },
    { id: "3", label: "Bid", component: <Bid /> },

    // 👉 Route-based tabs
    {
      id: "4",
      label: "Detailed Estimate",
      type: "route",
      path: `/tender/tenders/${tender_id}/detailedestimate`,
    },

    { id: "5", label: "BOQ", component: <BOQ /> },

    {
      id: "6",
      label: "Zero Cost",
      type: "route",
      path: `/tender/tenders/${tender_id}/zerocost`,
    },

    { id: "7", label: "EMD", component: <EMD /> },
    { id: "8", label: "Vendor", component: <Vendor /> },
    { id: "9", label: "Contract", component: <Contract /> },
    { id: "10", label: "Penalties", component: <Penalities /> },
    { id: "11", label: "SetUp", component: <GeneralSetup /> },
  ];

  

  const defaultTab = tabs[0].id;
  const activeTab = searchParams.get("tab") || defaultTab;
  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const checkApprovalStatus = async () => {
    try {
      const res = await axios.get(`${API}/tender/approval-status/${tender_id}`);
      if (res.data.success) {
        setIsApproved(res.data.approved);
      }
    } catch (error) {
      toast.error("Error checking approval status");
    } finally {
      setActiveTabLoading(false);
    }
  };

  useEffect(() => {
    setActiveTabLoading(true);
    checkApprovalStatus();
  }, [tender_id]);

  const handleTabChange = (tab) => {
    if (tab.type === "route") {
      navigate(tab.path);
    } else {
      setSearchParams({ tab: tab.id });
    }
  };

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeTab]);

  const handleBack = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1]);
    } else {
      navigate("..");
    }
  };

  return (
    <div className="font-roboto-flex flex flex-col h-full overflow-hidden">
      {/* Fixed Header Balance with Top Back Arrow */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-darkest-blue dark:text-white border border-gray-200 dark:border-slate-700 shadow-sm"
            title="Go Back"
          >
            <MdArrowBackIosNew size={18} className="translate-x-0.5" />
          </button>
          <Title
            title="Tender Management"
            sub_title="Tender"
            active_title={activeTabData?.label}
          />
        </div>

      {/* Tabs */}
      <div 
        ref={tabContainerRef}
        className="flex overflow-x-auto no-scrollbar gap-2 py-2 scroll-smooth"
      >
        {tabs.map((tab) => (
          <p
            key={tab.id}
            ref={activeTab === tab.id ? activeTabRef : null}
            className={`px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap flex-shrink-0 transition-opacity ${
              activeTab === tab.id
                ? "bg-darkest-blue text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-darkest-blue dark:text-slate-300 hover:opacity-80"
            }`}
            onClick={() => handleTabChange(tab)}
          >
            {tab.label}
          </p>
        ))}
      </div>
      </div>

      {/* Content Area with Transparent Scroll Effect */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar relative">
        {/* Transparent Fade Overlay */}
        <div className="sticky top-0 left-0 right-0 h-10 z-10 pointer-events-none bg-gradient-to-b from-light-blue dark:from-overall_bg-dark to-transparent" />
        
        <div className="-mt-6">
          {activeTabLoading ? (
            <Loader />
          ) : (
            activeTabData?.type !== "route" && 
            activeTabData?.component && 
            React.cloneElement(activeTabData.component, { onBack: handleBack })
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTender;
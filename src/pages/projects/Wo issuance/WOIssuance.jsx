import React, { useEffect, useState } from "react";
import Title from "../../../components/Title";
import { TbFileExport, TbFilter } from "react-icons/tb";
import { LuFileCheck } from "react-icons/lu";
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";
import WORequest from "./work order request/WORequest";
import CreateRequest from "./work order request/CreateRequest";
import WorkOrderIssuance from "./Work order issuance/WorkOrderIssuance";

const tabs = [
  {
    id: "1",
    label: "Work Order Request",
    component: (reloadTrigger) => <WORequest reloadTrigger={reloadTrigger} />,
    buttons: [
      {
        label: "Create Request",
        icon: <LuFileCheck size={23} />,
        className: "bg-darkest-blue text-white",
      },
      {
        label: "Export",
        icon: <TbFileExport size={23} />,
        className:
          " dark:bg-layout-dark  dark:text-white bg-white text-darkest-blue",
      },
      {
        label: "Filter",
        icon: <TbFilter size={23} />,
        className:
          " dark:bg-layout-dark  dark:text-white  bg-white text-darkest-blue",
      },
    ],
  },
  {
    id: "2",
    label: "Work Order Issuance",
    component: () => <WorkOrderIssuance />,
    buttons: [
      {
        label: "Export",
        icon: <TbFileExport size={23} />,
        className:
          "  dark:bg-layout-dark  dark:text-white bg-white text-darkest-blue",
      },
      {
        label: "Filter",
        icon: <TbFilter size={23} />,
        className:
          " dark:bg-layout-dark  dark:text-white bg-white text-darkest-blue",
      },
    ],
  },
];

const WoIssuance = () => {
  const navigate = useNavigate();
  const [reloadWORequest, setReloadWORequest] = useState(0);

  const [openModal, setOpenModal] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = tabs[0].id;
  const activeTab = searchParams.get("tab") || defaultTab;

  const handleTabChange = (id) => {
    setSearchParams({ tab: id });
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const buttonsWithHandlers = activeTabData.buttons.map((button) => {
    const modalMap = {
      "Create Request": "createrequest",
    };

    if (modalMap[button.label]) {
      return {
        ...button,
        onClick: () => setOpenModal(modalMap[button.label]),
      };
    }
    return button;
  });

  return (
    <>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className="font-roboto-flex flex justify-between items-center ">
          <Title
            title="Projects Management"
            sub_title="WOR"
            active_title={activeTabData?.label}
          />
          <div className="flex gap-2">
            {buttonsWithHandlers.map((button, index) => (
              <button
                key={index}
                className={`cursor-pointer w-fit text-sm flex items-center gap-2 px-4 py-2 rounded-md ${button.className}`}
                onClick={button.onClick}
              >
                {button.icon} {button.label}
              </button>
            ))}
          </div>
        </div>
        <div className=" font-roboto-flex  cursor-pointer flex justify-between items-center ">
          <div className="flex flex-wrap gap-2 py-2.5 ">
            {tabs.map(({ id, label }) => (
              <p
                key={id}
                className={`flex gap-2 items-center px-4 py-2.5 font-medium rounded-lg text-sm  whitespace-nowrap ${
                  activeTab === id
                    ? "bg-darkest-blue text-white"
                    : "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue "
                }`}
                onClick={() => handleTabChange(id)}
              >
                {label}
              </p>
            ))}
          </div>
        </div>
        <div className=" h-full overflow-y-auto  no-scrollbar">
          {activeTabData?.component(
            activeTab === "1" ? reloadWORequest : undefined
          )}
        </div>

        {openModal === "createrequest" && (
          <CreateRequest
            onclose={() => setOpenModal(null)}
            onSuccess={() => {
              // Trigger reload in WORequest
              setReloadWORequest((prev) => prev + 1);
              setOpenModal(null);
            }}
          />
        )}
      </div>
    </>
  );
};

export default WoIssuance;

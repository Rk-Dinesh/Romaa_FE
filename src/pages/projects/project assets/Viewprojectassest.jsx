import React, { useEffect, useState } from "react";
import Title from "../../../components/Title";
import { useLocation } from "react-router-dom";

const ViewProjectAssest = () => {
  const location = useLocation();
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Load selected asset from state or fallback to localStorage
  useEffect(() => {
    if (location.state?.item) {
      setSelectedAsset(location.state.item);
    } else {
      // fallback if navigated directly
      const storedItem = localStorage.getItem("selectedAsset");
      if (storedItem) setSelectedAsset(JSON.parse(storedItem));
    }
  }, [location.state]);

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

  if (!selectedAsset) {
    return (
      <div className="p-4 text-center text-gray-500">No asset selected</div>
    );
  }

  const fields = [
    { label: "Asset Name", value: selectedAsset.assetName, tooltip: "Name of the asset" },
    { label: "Asset Type", value: selectedAsset.assetType, tooltip: "Type/category of the asset" },
    { label: "Unit", value: selectedAsset.unit || "-", tooltip: "Unit of measurement for the asset" },
    { label: "Alloted To", value: selectedAsset.currentSite?.siteName || "-", tooltip: "Person to whom the asset is allotted" },
    { label: "Site Location", value: selectedAsset.currentSite?.location || "-", tooltip: "Location where the asset is deployed" },
    { label: "Date", value: selectedAsset.currentSite?.assignedDate ? new Date(selectedAsset.currentSite.assignedDate).toLocaleDateString() : "-", tooltip: "Date of allotment or record" },
    { label: "Status", value: selectedAsset.currentStatus, tooltip: "Current status of the asset" },
  ];

  return (
    <div>
      <Title title="Site Management" active_title="Site Asset Details" />
      <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm mt-3">
        <p className="font-semibold text-center text-lg">Site Asset Details</p>
        <div className="grid grid-cols-12 gap-2 items-start mt-3">
          {fields.map((field, idx) => (
            <React.Fragment key={idx}>
              <p className="col-span-6 font-medium">{field.label}</p>
              <div className="col-span-6">
                <TooltipWrapper tooltip={field.tooltip}>
                  <span className="text-xs opacity-70">{field.value}</span>
                </TooltipWrapper>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewProjectAssest;

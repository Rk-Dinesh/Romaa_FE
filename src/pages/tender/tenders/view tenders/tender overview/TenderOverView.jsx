import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import AddFollowUp from "./AddFollowUp";
import { MdCancel } from "react-icons/md";
import { IoMdSave } from "react-icons/io";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../../../../../constant";
import TenderProcessStepper from "./TenderProcessStepper";
import PreliminaryProcessStepper from "./PreliminaryProcessStepper";

const tenderProcessDataTemplate = [
  { label: "Site Investigation", key: "site_investigation" },
  { label: "Pre bid Meeting", key: "pre_bid_meeting" },
  { label: "Bid Submit", key: "bid_submission" },
  { label: "Technical Bid Opening", key: "technical_bid_opening" },
  { label: "Commercial Bid Opening", key: "commercial_bid_opening" },
  { label: "Negotiations", key: "negotiation" },
  { label: "Work Order", key: "work_order" },
  { label: "Agreement", key: "agreement" },
];

const preliminarySiteWorkTemplate = [
  { label: "Site Visit & Reconnaissance", key: "site_visit_reconnaissance" },
  {
    label: "Site Approach & Accessibility",
    key: "site_approach_accessibility",
  },
  { label: "Site Hurdles Identification", key: "site_hurdles_identification" },
  {
    label: "Labour Shed Location and Feasibility",
    key: "labour_shed_location_feasibility",
  },
  { label: "Temporary EB Connection", key: "temporary_eb_connection" },
  {
    label: "Water Source Identification & Connection",
    key: "water_source_identification_connection",
  },
  {
    label: "Office, Labour and Materials Shed Setup",
    key: "office_labour_materials_shed_setup",
  },
  {
    label: "Yard for Steel and Bulk Materials",
    key: "yard_steel_bulk_materials",
  },
  { label: "Office Setup & Facilities", key: "office_setup_facilities" },
  {
    label: "Sub Contractors Identification",
    key: "sub_contractors_identification",
  },
  { label: "Vendor Identification", key: "vendor_identification" },
];

const TenderOverView = () => {
  const { tender_id } = useParams();
  const [addFollowup, setAddFollowup] = useState(false);

  const [customerDetails, setCustomerDetails] = useState([]);
  const [tenderDetailsState, setTenderDetailsState] = useState([]);
  const [tenderProcessState, setTenderProcessState] = useState([]);
  const [tenderPreliminary, setTenderPreliminary] = useState([]);

  const [isEditingTender, setIsEditingTender] = useState(false);

  const fetchTenderOverview = async () => {
    try {
      const res = await axios.get(`${API}/tender/getoverview/${tender_id}`);
      const data = res.data.data;

      setCustomerDetails([
        { label: "Customer ID", value: data.customerDetails?.client_id },
        { label: "Customer Name", value: data.customerDetails?.client_name },
        { label: "PAN no", value: data.customerDetails?.pan_no },
        { label: "CIN no", value: data.customerDetails?.cin_no },
        { label: "GSTIN", value: data.customerDetails?.gstin },
        //  { label: "VAT no", value: "Infrastructure" },
        { label: "Phone Number", value: data.customerDetails?.contact_phone },
        { label: "Email ID", value: data.customerDetails?.contact_email },
        {
          label: "Address",
          value: `${data.customerDetails?.address?.city || ""}, ${data.customerDetails?.address?.state || ""
            }`,
        },
      ]);

      setTenderDetailsState([

        { label: "Tender Name", value: data.tenderDetails?.tender_name },
        { label: "Tender ID", value: data.tenderDetails?.tender_id },
        {
          label: "Tender Published Date",
          value: data.tenderDetails?.tender_published_date
            ? new Date(
              data.tenderDetails.tender_published_date
            ).toLocaleDateString("en-GB")
            : "",
        },
        {
          label: "Tender Process Type",
          value: data.tenderDetails?.tender_type,
        },
        {
          label: "Project Location",
          value: `${data.tenderDetails?.project_location?.city || ""}, ${data.tenderDetails?.project_location?.state || ""
            }`,
        },
        { label: "Contact Person", value: data.tenderDetails?.contact_person },
        { label: "Contact Number", value: data.tenderDetails?.contact_phone },
        { label: "Email ID", value: data.tenderDetails?.contact_email },
        {
          label: "Tender Value",
          value: data.tenderDetails?.tender_value ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(data.tenderDetails?.tender_value) : "-",
        },
      ]);

      setTenderProcessState(
        tenderProcessDataTemplate.map((item) => ({
          ...item,
          checked: !!data.tenderProcess?.[item.key],
          value: !!data.tenderProcess?.[item.key],
        }))
      );
    } catch (err) {
      console.error("Error fetching overview:", err);
    }
  };

  const fetchProcessData = async () => {
    try {
      const res = await axios.get(`${API}/tender/process/${tender_id}`);
      const savedData = Array.isArray(res.data?.processData) ? res.data.processData : [];

      const initialData = tenderProcessDataTemplate.map((step) => {
        const savedStep = savedData.find((d) => d.key === step.key) || {};
        return {
          ...step,
          notes: savedStep.notes || "",
          date: savedStep.date || "",
          time: savedStep.time || "",
          completed: savedStep.completed === true,
          file_name: savedStep.file_name || "",
          file_url: savedStep.file_url || "",
        };
      });

      setTenderProcessState(initialData);
    } catch (error) {
      console.error("Error fetching process data:", error);
    }
  };


  const fetchPreliminaryData = async () => {
    try {
      const res = await axios.get(`${API}/tender/preliminary/${tender_id}`);
      const savedData = Array.isArray(res.data?.processData) ? res.data.processData : [];

      const initialData = preliminarySiteWorkTemplate.map((step) => {
        const savedStep = savedData.find((d) => d.key === step.key);
        return {
          ...step,
          notes: savedStep?.notes || "",
          date: savedStep?.date || "",
          time: savedStep?.time || "",
          completed: savedStep?.completed === true,
          file_name: savedStep?.file_name || "",
          file_url: savedStep?.file_url || "",
        };
      });
      setTenderPreliminary(initialData);
    } catch (error) {
      console.error("Error fetching process data:", error);
    }
  };

  useEffect(() => {
    if (tender_id) fetchTenderOverview();
    fetchProcessData();
    fetchPreliminaryData();
  }, [tender_id]);

  const handleCancel = () => {
    setTenderDetailsState(tenderDetails);
    setIsEditingTender(false);
  };

  const handleSave = () => {
    setIsEditingTender(false);
  };

  const handleTenderChange = (idx, value) => {
    setTenderDetailsState((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, value } : item))
    );
  };

  const handleUploadSuccess = () => {
    fetchProcessData();
  };

  const handleUploadSuccessPreliminary = () => {
    fetchPreliminaryData();
  };

  return (
    <>
      <div className="font-roboto-flex grid grid-cols-12 h-full gap-3  overflow-y-auto no-scrollbar py-2">

        <div className="col-span-6 dark:bg-layout-dark bg-white rounded-lg shadow p-4">
          {" "}
          <div className="flex justify-between items-center px-2 py-2">
            <p className="font-semibold text-lg">Tender Details</p>
            {!isEditingTender ? (
              <button
                className="bg-gray-400 text-gray-600 rounded-full px-1.5 py-1.5"
                onClick={() => setIsEditingTender(true)}
              >
                <Pencil size={14} />
              </button>
            ) : (
              <button
                className="px-4 py-1.5 rounded dark:bg-overall_bg-dark dark:text-white text-gray-700"
                onClick={handleCancel}
              >
                <MdCancel />
              </button>
            )}
          </div>
          <div className="grid grid-cols-12 gap-2  text-xs font-semibold px-2 py-2 ">

            {tenderDetailsState.map((item, idx) => {
              const isTenderName = item.label === "Tender Name";

              if (isTenderName) {
                return (
                  <React.Fragment key={idx}>
                    {/* Label – first line */}
                    <p className="col-span-12 font-semibold">{item.label}</p>

                    {/* Value – second line, editable when isEditingTender */}
                    <div className="col-span-12 opacity-70">
                      {isEditingTender ? (
                        <textarea
                          value={item.value}
                          onChange={(e) => handleTenderChange(idx, e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-left resize-none"
                          rows={2} // adjust as needed
                        />
                      ) : (
                        <p className="whitespace-pre-line">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </React.Fragment>
                );
              }

              // default layout for other fields
              return (
                <React.Fragment key={idx}>
                  <p className="col-span-6">{item.label}</p>
                  <div className="col-span-6 text-end opacity-50 font-light">
                    {isEditingTender ? (
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => handleTenderChange(idx, e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-right"
                      />
                    ) : (
                      item.value
                    )}
                  </div>
                </React.Fragment>
              );
            })}

          </div>
          {isEditingTender && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-4 py-1.5 rounded bg-darkest-blue text-white"
                onClick={handleSave}
              >
                <IoMdSave />
              </button>
            </div>
          )}
        </div>
        <div className="col-span-6 dark:bg-layout-dark bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center px-2 py-2">
            <p className="font-semibold text-lg">Customer Details</p>
          </div>
          <div className="grid grid-cols-12 gap-2  text-xs font-semibold px-2 py-2 ">
            {customerDetails.map((item, index) => (
              <React.Fragment key={index}>
                <p className="col-span-6">{item.label}</p>
                <p className="col-span-6 text-end  opacity-50 font-light">
                  {item.value}
                </p>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="col-span-6 dark:bg-layout-dark bg-white rounded-lg shadow p-4 ">
          <TenderProcessStepper onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className="col-span-6 dark:bg-layout-dark bg-white rounded-lg shadow p-4 ">
          <PreliminaryProcessStepper onUploadSuccess={handleUploadSuccessPreliminary} />
        </div>

        <div className="col-span-6 dark:bg-layout-dark bg-white rounded-lg shadow p-4 space-y-4">
          <p className="font-semibold text-lg mb-4">Tender Process Overview</p>

          {tenderProcessState.filter((step) => step.completed).length === 0 ? (
            <p className="text-center text-gray-500">
              No tender process data available.
            </p>
          ) : (
            <div className="p-6 rounded-lg border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
              {tenderProcessState
                .filter((step) => step.completed)
                .map((step, idx) => (
                  <div key={step.key} className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        {idx + 1}. {step.label}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-600 text-white">
                        Completed
                      </span>
                    </div>
                    {step.notes && (
                      <p className="text-sm mb-1 whitespace-pre-wrap">
                        <strong>Notes:</strong> {step.notes}
                      </p>
                    )}
                    <div className="flex gap-6 items-center mb-2">
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                        <strong>Date:</strong>{" "}
                        {step.date ? new Date(step.date).toLocaleDateString() : "-"}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                        <strong>Time:</strong> {step.time || "-"}
                      </p>
                    </div>

                    {step.file_name && step.file_url ? (
                      <p className="text-sm mb-1 truncate">
                        <strong>File:</strong>{" "}
                        <a
                          href={step.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dark:text-white text-black hover:underline truncate"
                          title={step.file_name}
                        >
                          {step.file_name}
                        </a>
                      </p>
                    ) : (
                      ""
                    )}

                  </div>
                ))}
            </div>

          )}
        </div>

        <div className="col-span-6 dark:bg-layout-dark bg-white rounded-lg shadow p-4 space-y-4">
          <p className="font-semibold text-lg mb-4">Preliminary Process Overview</p>

          {tenderPreliminary.filter((step) => step.completed).length === 0 ? (
            <p className="text-center text-gray-500">
              No tender process data available.
            </p>
          ) : (
            <div className="p-6 rounded-lg border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
              {tenderPreliminary
                .filter((step) => step.completed)
                .map((step, idx) => (
                  <div key={step.key} className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        {idx + 1}. {step.label}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-600 text-white">
                        Completed
                      </span>
                    </div>
                    <div className="flex gap-6 items-center mb-2">
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                        <strong>Date:</strong>{" "}
                        {step.date ? new Date(step.date).toLocaleDateString() : "-"}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                        <strong>Time:</strong> {step.time || "-"}
                      </p>
                    </div>
                    {step.file_name && step.file_url ? (
                      <p className="text-sm">
                        <strong>File:</strong>{" "}
                        <a
                          href={step.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:underline dark:text-slate-400"
                        >
                          {step.file_name}
                        </a>
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                ))}
            </div>

          )}
        </div>


      </div>
      {addFollowup && (
        <AddFollowUp
          onclose={() => setAddFollowup(false)}
          onSuccess={() => {
            fetchTenderOverview();
          }}
        />
      )}
    </>
  );
};

export default TenderOverView;

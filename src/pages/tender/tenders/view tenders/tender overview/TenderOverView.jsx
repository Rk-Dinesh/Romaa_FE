import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import AddFollowUp from "./AddFollowUp";
import { MdCancel, MdArrowBackIosNew } from "react-icons/md";
import { IoMdSave } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../../../../../constant";
import TenderProcessStepper from "./TenderProcessStepper";
import PreliminaryProcessStepper from "./PreliminaryProcessStepper";
import Loader from "../../../../../components/Loader";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Calendar, 
  FileText, 
  Briefcase, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ClipboardList,
  Target,
  Upload
} from "lucide-react";

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
  const navigate = useNavigate();
  const [addFollowup, setAddFollowup] = useState(false);

  const [customerDetails, setCustomerDetails] = useState([]);
  const [tenderDetailsState, setTenderDetailsState] = useState([]);
  const [tenderProcessState, setTenderProcessState] = useState([]);
  const [tenderPreliminary, setTenderPreliminary] = useState([]);

  const [isEditingTender, setIsEditingTender] = useState(false);
  const [loading, setLoading] = useState(true);

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

        { label: "Project Name", value: data.tenderDetails?.tender_project_name },
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
        {label:"Agreement Value",value:data.tenderDetails?.agreement_value ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(data.tenderDetails?.agreement_value) : "-"}
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
    const loadAll = async () => {
      setLoading(true);
      if (tender_id) await fetchTenderOverview();
      await fetchProcessData();
      await fetchPreliminaryData();
      setLoading(false);
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tender_id]);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Construct update object from tenderDetailsState array
      const updateData = {};
      tenderDetailsState.forEach(item => {
        if (item.label === "Tender Name") updateData.tender_name = item.value;
        if (item.label === "Tender ID") updateData.tender_id = item.value;
        if (item.label === "Tender Published Date") updateData.tender_published_date = item.value;
        if (item.label === "Tender Process Type") updateData.tender_type = item.value;
        if (item.label === "Contact Person") updateData.contact_person = item.value;
        if (item.label === "Contact Number") updateData.contact_phone = item.value;
        if (item.label === "Email ID") updateData.contact_email = item.value;
        if (item.label === "Tender Value") updateData.tender_value = item.value.replace(/[^0-9.-]+/g,"");
        if (item.label === "Agreement Value") updateData.agreement_value = item.value.replace(/[^0-9.-]+/g,"");
      });
      
      await axios.put(`${API}/tender/updateoverview/${tender_id}`, updateData);
      setIsEditingTender(false);
      fetchTenderOverview();
    } catch (err) {
      console.error("Error saving tender overview:", err);
      setIsEditingTender(false);
    } finally {
      setLoading(false);
    }
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

  const calculateProgress = () => {
    const totalSteps = tenderProcessDataTemplate.length + preliminarySiteWorkTemplate.length;
    const completedSteps = 
      tenderProcessState.filter(s => s.completed).length + 
      tenderPreliminary.filter(s => s.completed).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  if (loading) return <Loader />;

  const progress = calculateProgress();
  const projectName = tenderDetailsState.find(i => i.label === "Project Name")?.value || "Project Overview";
  const tenderId = tenderDetailsState.find(i => i.label === "Tender ID")?.value || "-";

  return (
    <div className="flex flex-col gap-5 max-w-[1550px] mx-auto pb-10">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none">
          <Activity size={180} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                Active Project
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                ID: {tenderId}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight italic decoration-blue-500/30">
              {projectName}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400 text-sm italic">
              <span className="flex items-center gap-1.5 font-bold tracking-tight uppercase text-[11px]">
                <MapPin size={16} className="text-blue-500" />
                {tenderDetailsState.find(i => i.label === "Project Location")?.value || "Location TBD"}
              </span>
              <span className="flex items-center gap-1.5 font-bold tracking-tight uppercase text-[11px]">
                <Calendar size={16} className="text-blue-500" />
                Published: {tenderDetailsState.find(i => i.label === "Tender Published Date")?.value || "N/A"}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 min-w-[280px] bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Progress Overview</span>
              <span className="text-2xl font-black text-blue-600 italic leading-none">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-white dark:bg-slate-900 rounded-full overflow-hidden shadow-inner flex">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20"
              />
            </div>
          </div>
        </div>
      </div>

    <div className="grid grid-cols-12 gap-5 items-start">
        {/* Row 1: High Level Metadata (Parallel Columns) */}
        <div className="col-span-12 lg:col-span-6 h-full">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative group h-full">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shadow-sm">
                  <FileText size={18} />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 italic tracking-tight leading-none">Financial Meta</h3>
              </div>
              <div className="flex items-center gap-2">
                {isEditingTender ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      <IoMdSave size={14} /> Save
                    </button>
                    <button
                      onClick={() => { setIsEditingTender(false); fetchTenderOverview(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider transition-colors"
                    >
                      <MdCancel size={14} /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingTender(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5">
              {tenderDetailsState.map((item, idx) => (
                  <div key={idx} className="flex items-baseline justify-between py-2 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-2 rounded transition-colors group">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-8">{item.label}</p>
                     
                     {isEditingTender ? (
                       <input 
                         type="text"
                         value={item.value || ""}
                         onChange={(e) => handleTenderChange(idx, e.target.value)}
                         className="text-[12px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border-b border-blue-500/30 outline-none px-2 py-0.5 rounded-md w-full max-w-[240px] text-end italic transition-all focus:bg-white dark:focus:bg-slate-900 focus:shadow-sm"
                       />
                     ) : (
                       <p className={`text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-tight text-end ${item.label === "Email ID" ? "break-all" : ""}`}>
                          {item.value || "-"}
                       </p>
                     )}
                  </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 h-full">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm">
                <User size={18} />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 italic tracking-tight leading-none">Client Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5">
              {customerDetails.map((item, idx) => (
                  <div key={idx} className="flex items-baseline justify-between py-2 border-b border-slate-50 dark:border-slate-800/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 px-2 rounded transition-colors">
                      <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest shrink-0 mr-8">{item.label}</p>
                      <p className={`text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-tight text-end ${item.label === "Email ID" ? "break-all" : ""}`}>
                         {item.value || "-"}
                      </p>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase 1 Overlay Card: ACTION + HISTORY */}
        <div className="col-span-12">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="font-black text-lg italic leading-none">P1</span>
                </div>
                <div>
                   <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">Tender Lifecycle</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Workflow Action & Track</p>
                </div>
              </div>
              <Activity size={20} className="text-blue-500 opacity-30 animate-pulse" />
            </div>
            
            <div className="grid grid-cols-12">
              {/* Stepper Part */}
              <div className="col-span-12 lg:col-span-7 p-8 lg:border-r border-slate-100 dark:border-slate-800">
                <div className="mb-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic underline decoration-blue-500/30 underline-offset-4">Workflow Action</div>
                <TenderProcessStepper onUploadSuccess={handleUploadSuccess} />
              </div>
              
              {/* History Part */}
              <div className="col-span-12 lg:col-span-5 bg-slate-50/30 dark:bg-slate-800/10 p-8">
                <div className="mb-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic underline decoration-blue-500/30 underline-offset-4">Lifecycle Log Feed</div>
                
                <div className="relative space-y-8 pl-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                  {tenderProcessState.filter(s => s.completed).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-50 space-y-3 italic text-center">
                       <Clock size={48} strokeWidth={1} />
                       <p className="text-sm font-black uppercase tracking-widest">Waiting for Activity</p>
                    </div>
                  ) : (
                    tenderProcessState.filter(s => s.completed).map((step) => (
                      <motion.div 
                        key={step.key} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative pl-10"
                      >
                        <div className="absolute left-[-23px] top-1 w-[22px] h-[22px] rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 z-10 flex items-center justify-center shadow-md">
                          <CheckCircle2 size={12} className="text-blue-500" />
                        </div>
                        
                        <div className="group space-y-3 bg-white dark:bg-slate-900/50 p-5 rounded-3xl border border-transparent shadow-sm hover:border-blue-500/20 hover:shadow-xl transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm italic group-hover:text-blue-600 transition-colors tracking-tight">
                              {step.label}
                            </h4>
                            <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 uppercase italic tracking-tighter shadow-inner leading-none">
                              {step.date ? new Date(step.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' }) : "-"}
                            </span>
                          </div>
                          {step.notes && (
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold italic text-slate-500 dark:text-slate-400 leading-relaxed border-l-4 border-blue-500/30">
                              {step.notes}
                            </div>
                          )}
                          {step.file_name && (
                            <a href={step.file_url} target="_blank" className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-600 hover:text-blue-700 tracking-[0.1em] pl-1 italic">
                              <Upload size={12} /> <span className="underline decoration-blue-200">View Document Attachment</span>
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2: Action + History Grouped Below Lifecycle */}
        <div className="col-span-12">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col">
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 px-8 py-5 border-b border-emerald-100 dark:border-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="font-black text-lg italic leading-none">P2</span>
                </div>
                <div>
                   <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">Preliminary Site Work</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Project Site Ground Feed</p>
                </div>
              </div>
              <ClipboardList size={20} className="text-emerald-500 opacity-30 animate-pulse" />
            </div>

            <div className="grid grid-cols-12">
               {/* Stepper Part */}
               <div className="col-span-12 lg:col-span-7 p-8 lg:border-r border-slate-100 dark:border-slate-800">
                <div className="mb-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic underline decoration-emerald-500/30 underline-offset-4">Site Operations Workflow</div>
                <PreliminaryProcessStepper onUploadSuccess={handleUploadSuccessPreliminary} />
              </div>

               {/* History Part */}
               <div className="col-span-12 lg:col-span-5 bg-emerald-50/20 dark:bg-emerald-800/10 p-8">
                <div className="mb-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic underline decoration-emerald-500/30 underline-offset-4">Operations Log feed</div>
                
                <div className="relative space-y-8 pl-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                  {tenderPreliminary.filter(s => s.completed).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-50 space-y-3 italic text-center">
                       <Target size={48} strokeWidth={1} />
                       <p className="text-sm font-black uppercase tracking-widest">Site Work Pending</p>
                    </div>
                  ) : (
                    tenderPreliminary.filter(s => s.completed).map((step) => (
                      <motion.div 
                        key={step.key} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative pl-10"
                      >
                        <div className="absolute left-[-23px] top-1 w-[22px] h-[22px] rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 z-10 flex items-center justify-center shadow-md">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                        </div>
                        
                        <div className="group space-y-3 bg-white dark:bg-slate-900/50 p-5 rounded-3xl border border-transparent shadow-sm hover:border-emerald-500/20 hover:shadow-xl transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm italic group-hover:text-emerald-600 transition-colors tracking-tight leading-tight">
                              {step.label}
                            </h4>
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5 shadow-sm" />
                          </div>
                          {step.notes && (
                            <div className="p-4 rounded-2xl bg-emerald-50/30 dark:bg-emerald-900/10 text-[11px] font-bold italic text-slate-500 dark:text-slate-400 border-l-4 border-emerald-500/30 leading-relaxed transition-colors">
                              {step.notes}
                            </div>
                          )}
                           {step.file_name && (
                            <a href={step.file_url} target="_blank" className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-600 hover:text-emerald-700 tracking-[0.1em] pl-1 italic">
                              <Upload size={12} /> <span className="underline decoration-emerald-200">View Site Attachment</span>
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default TenderOverView;

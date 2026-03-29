import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../../../../constant";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  Upload,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  Settings,
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

const getStepSchema = () =>
  yup.object().shape({
    notes: yup.string().required("Notes are required"),
    date: yup
      .string()
      .required("Date is required")
      .test("not-future", "Future dates not allowed", (v) => 
        !v || new Date(v).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)
      ),
    time: yup.string().required("Time is required"),
  });

const getWorkOrderSchema = () =>
  yup.object().shape({
    workOrder_id: yup.string().required("Work Order ID is required"),
    workOrder_issued_date: yup
      .string()
      .required("Work Order Issued Date is required")
      .test("not-future", "Future dates not allowed", (v) => 
        !v || new Date(v).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)
      ),
  });

const getAgreementSchema = () =>
  yup.object().shape({
    agreement_id: yup.string().required("Agreement ID is required"),
    agreement_value: yup
      .number()
      .typeError("Must be a number")
      .required("Agreement Value is required"),
    agreement_issued_date: yup
      .string()
      .required("Agreement Issued Date is required")
      .test("not-future", "Future dates not allowed", (v) => 
        !v || new Date(v).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)
      ),
  });

const TenderProcessStepper = ({ onUploadSuccess }) => {
  const { tender_id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processData, setProcessData] = useState([]);
  const [file, setFile] = useState(null);

  const getSchema = () => {
    const step = processData[currentStep];
    if (step?.key === "work_order") return getWorkOrderSchema();
    if (step?.key === "agreement") return getAgreementSchema();
    return getStepSchema();
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(getSchema()),
    mode: "onBlur",
  });

  useEffect(() => {
    const fetchSavedProgress = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/tender/process/${tender_id}`);
        const savedData = res.data?.processData || [];

        const initialData = tenderProcessDataTemplate.map((step) => {
          const savedStep = savedData.find((d) => d.key === step.key);
          const formattedDate = savedStep?.date ? savedStep.date.split("T")[0] : "";
          return {
            ...step,
            notes: savedStep?.notes || "",
            date: formattedDate,
            time: savedStep?.time || "",
            completed: savedStep?.completed === true,
          };
        });

        const firstUncompletedIndex = initialData.findIndex(
          (step) => !step.completed,
        );
        const startStep =
          firstUncompletedIndex === -1
            ? initialData.length - 1
            : firstUncompletedIndex;

        setProcessData(initialData);
        setCurrentStep(startStep);

        reset({
          notes: initialData[startStep]?.notes || "",
          date: initialData[startStep]?.date || "",
          time: initialData[startStep]?.time || "",
        });
      } catch (err) {
        console.error("Error fetching progress:", err);
      } finally {
        setLoading(false);
      }
    };
    if (tender_id) fetchSavedProgress();
  }, [tender_id, reset]);

  const [tenderPublishedDate, _setTenderPublishedDate] = useState(null);



  useEffect(() => {
    if (processData.length > 0) {
      const step = processData[currentStep];
      reset({
        notes: step.notes || "",
        date: step.date || "",
        time: step.time || "",
        workOrder_id: step.workOrder_id || "",
        workOrder_issued_date: step.workOrder_issued_date || "",
        agreement_id: step.agreement_id || "",
        agreement_value: step.agreement_value || "",
        agreement_issued_date: step.agreement_issued_date || "",
      });
      setFile(null);
    }
  }, [currentStep, processData, reset]);

  const onNext = async (data) => {
    const step = processData[currentStep];
    setLoading(true);
    try {
      const defaultDate = new Date().toISOString().split("T")[0];
      const defaultTime = new Date().toTimeString().slice(0, 5);

      let payload = {
        tender_id,
        step_key: step.key,
        notes: data.notes || "Completed",
        date: data.date || defaultDate,
        time: data.time || defaultTime,
      };

      const formData = new FormData();
      formData.append("tender_id", tender_id);
      formData.append("step_key", step.key);
      formData.append("notes", payload.notes);
      formData.append("date", payload.date);
      formData.append("time", payload.time);
      if (file) formData.append("file", file);

      if (step.key === "work_order") {
        await axios.post(`${API}/tender/processaws/step`, formData);
        await axios.put(`${API}/tender/update-workorder/${tender_id}`, {
          workOrder_id: data.workOrder_id,
          workOrder_issued_date: data.workOrder_issued_date,
        });
      } else if (step.key === "agreement") {
        await axios.post(`${API}/tender/processaws/step`, formData);
        await axios.put(`${API}/tender/update-agreement/${tender_id}`, {
          agreement_id: data.agreement_id,
          agreement_value: data.agreement_value,
          agreement_issued_date: data.agreement_issued_date,
        });
      } else {
        await axios.post(`${API}/tender/processaws/step`, formData);
      }

      setProcessData((prev) =>
        prev.map((s, i) => 
          i === currentStep 
            ? { ...s, ...data, completed: true } 
            : s
        ),
      );
      if (onUploadSuccess) onUploadSuccess();
      if (currentStep < processData.length - 1) setCurrentStep(currentStep + 1);
    } catch (err) {
      console.error("Error saving step:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && processData.length === 0)
    return (
      <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
    );

  const step = processData[currentStep];
  const allCompleted = processData.every((s) => s.completed);

  return (
    <div className="select-none h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
          <Settings size={20} />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 italic">
          Tender Lifecycle
        </h3>
      </div>
       
      {/* Date Constraint Context */}
      {/* <div className="mb-4 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2 text-blue-600">
          <Calendar size={12} />
          <span>
            Select date between:{" "}
            {currentStep > 0 && processData[currentStep - 1]?.date
              ? new Date(processData[currentStep - 1].date.split("T")[0]).toLocaleDateString("en-GB")
              : tenderPublishedDate 
                ? new Date(tenderPublishedDate.split("T")[0]).toLocaleDateString("en-GB")
                : "Start"}{" "}
            ↔ Today
          </span>
        </div>
      </div> */} 

      <div className="flex gap-4 mb-10 pb-4 overflow-hidden relative">
        {processData.slice(currentStep, currentStep + 4).map((s, idx) => {
          const absoluteIndex = currentStep + idx;
          const isCurrent = absoluteIndex === currentStep;
          
          return (
            <div
              key={s.key}
              className="flex flex-col items-center flex-1 transition-all duration-300"
            >
              <div className="relative flex items-center justify-center w-full my-3">
                {/* Connector Line */}
                {idx !== 0 && (
                  <div className="absolute left-0 right-1/2 top-1/2 -translate-y-1/2 h-0.5 w-full -z-10 bg-slate-200 dark:bg-slate-700" />
                )}
                {idx !== 3 && absoluteIndex < processData.length - 1 && (
                  <div className="absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-0.5 w-full -z-10 bg-slate-200 dark:bg-slate-700" />
                )}
                
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    isCurrent 
                      ? "bg-blue-600 text-white ring-4 ring-blue-500/20 scale-110" 
                      : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400"
                  }`}
                >
                  <span className="text-sm font-bold">{absoluteIndex + 1}</span>
                </div>
              </div>
              <p className={`text-[10px] font-bold text-center uppercase tracking-tight transition-colors duration-200 ${
                isCurrent ? "text-blue-600" : "text-slate-400"
              }`}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {!allCompleted ? (
            <motion.form
              key={step?.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit(onNext)}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                  <span className="text-lg font-bold text-blue-600">
                    {currentStep + 1}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">
                    {step?.label}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Step {currentStep + 1} of {processData.length}
                  </p>
                </div>
              </div>

              {step?.key === "work_order" ? (
                <div className="grid grid-cols-2 gap-6">
                  <FormInput
                    label="Work Order ID"
                    name="workOrder_id"
                    register={register}
                    error={errors.workOrder_id}
                    icon={FileText}
                  />
                  <FormInput
                    label="Issued Date"
                    name="workOrder_issued_date"
                    type="date"
                    register={register}
                    error={errors.workOrder_issued_date}
                    icon={Calendar}
                    min={currentStep > 0 ? (processData[currentStep - 1]?.date ? processData[currentStep - 1].date.split("T")[0] : undefined) : (tenderPublishedDate ? tenderPublishedDate.split("T")[0] : undefined)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              ) : step?.key === "agreement" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormInput
                      label="Agreement ID"
                      name="agreement_id"
                      register={register}
                      error={errors.agreement_id}
                      icon={FileText}
                    />
                    <FormInput
                      label="Agreement Value"
                      name="agreement_value"
                      type="number"
                      register={register}
                      error={errors.agreement_value}
                      icon={Settings}
                    />
                  </div>
                  <FormInput
                    label="Issued Date"
                    name="agreement_issued_date"
                    type="date"
                    register={register}
                    error={errors.agreement_issued_date}
                    icon={Calendar}
                    min={currentStep > 0 ? (processData[currentStep - 1]?.date ? processData[currentStep - 1].date.split("T")[0] : undefined) : (tenderPublishedDate ? tenderPublishedDate.split("T")[0] : undefined)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormInput
                      label="Completion Date"
                      name="date"
                      type="date"
                      register={register}
                      error={errors.date}
                      icon={Calendar}
                      min={currentStep > 0 ? (processData[currentStep - 1]?.date ? processData[currentStep - 1].date.split("T")[0] : undefined) : (tenderPublishedDate ? tenderPublishedDate.split("T")[0] : undefined)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    <FormInput
                      label="Completion Time"
                      name="time"
                      type="time"
                      register={register}
                      error={errors.time}
                      icon={Clock}
                    />
                  </div>
                  <FormTextArea
                    label="Notes / Remarks"
                    name="notes"
                    register={register}
                    error={errors.notes}
                    placeholder="Enter any specific details..."
                  />
                </div>
              )}

              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                  Attachments
                </label>
                <div className="group relative">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className={`p-4 rounded-xl border-2 border-dashed transition-all flex items-center gap-4 ${
                      file
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-400"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${file ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}
                    >
                      <Upload size={18} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`text-sm font-semibold truncate ${file ? "text-blue-600" : "text-slate-600"}`}
                      >
                        {file ? file.name : "Click to upload files"}
                      </p>
                      <p className="text-[10px] text-slate-400 italic">
                        Optional doc, pdf, jpg up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="group relative px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center gap-2 overflow-hidden"
                >
                  <span className="relative z-10">
                    {currentStep < processData.length - 1
                      ? "Proceed to Next"
                      : "Complete Process"}
                  </span>
                  <ChevronRight
                    size={16}
                    className="relative z-10 group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                <Check size={40} strokeWidth={3} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Process Completed!
              </h4>
              <p className="text-slate-500 text-sm max-w-xs">
                All steps in the tender lifecycle have been successfully
                recorded.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FormInput = ({
  label,
  name,
  register,
  error,
  type = "text",
  icon: Icon,
  min,
  max,
}) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon size={16} />
        </div>
      )}
      <input
        type={type}
        min={min}
        max={max}
        {...register(name)}
        className={`w-full ${Icon ? "pl-10" : "px-4"} pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm ${
          error
            ? "border-red-500 bg-red-50/50"
            : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
        }`}
      />
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[10px] text-red-500 font-bold flex items-center gap-1 leading-none"
      >
        <AlertCircle size={10} />
        {error.message}
      </motion.p>
    )}
  </div>
);

const FormTextArea = ({ label, name, register, error, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
      {label}
    </label>
    <textarea
      {...register(name)}
      rows={4}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm resize-none ${
        error
          ? "border-red-500 bg-red-50/50"
          : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
      }`}
    />
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[10px] text-red-500 font-bold flex items-center gap-1"
      >
        <AlertCircle size={10} />
        {error.message}
      </motion.p>
    )}
  </div>
);

export default TenderProcessStepper;

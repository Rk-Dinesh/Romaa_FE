import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams } from "react-router-dom";
import { API } from "../../../../../constant";
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
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import { TenderProcessContext, useTenderProcess } from "./TenderProcessContext";
import { 
  tenderProcessDataTemplate, 
  getTenderStepSchema, 
  getWorkOrderSchema, 
  getAgreementSchema 
} from "./StepperConstants";

// ── Provider Component ─────────────────────────────────────────────────────────
export const TenderProcessProvider = ({ onUploadSuccess, children }) => {
  const { tender_id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processData, setProcessData] = useState([]);
  const [file, setFile] = useState(null);

  const getSchema = (data, step) => {
    if (data[step]?.key === "work_order") return getWorkOrderSchema();
    if (data[step]?.key === "agreement") return getAgreementSchema();
    return getTenderStepSchema();
  };

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(getSchema(processData, currentStep)),
    mode: "onBlur",
  });

  useEffect(() => {
    const fetchSavedProgress = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/tender/process/${tender_id}`);
        const savedData = res.data?.processData || [];
        const initialData = tenderProcessDataTemplate.map((step) => {
          const saved = savedData.find((d) => d.key === step.key);
          return {
            ...step,
            notes: saved?.notes || "",
            date: saved?.date ? saved.date.split("T")[0] : "",
            time: saved?.time || "",
            completed: saved?.completed === true,
            file_name: saved?.file_name || "",
            file_url: saved?.file_url || "",
          };
        });
        const firstUncompleted = initialData.findIndex((s) => !s.completed);
        const startStep = firstUncompleted === -1 ? initialData.length - 1 : firstUncompleted;
        setProcessData(initialData);
        setCurrentStep(startStep);
        reset({ notes: initialData[startStep]?.notes || "", date: initialData[startStep]?.date || "", time: initialData[startStep]?.time || "" });
      } catch (err) {
        console.error("Error fetching progress:", err);
      } finally {
        setLoading(false);
      }
    };
    if (tender_id) fetchSavedProgress();
  }, [tender_id, reset]);

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
      const formData = new FormData();
      formData.append("tender_id", tender_id);
      formData.append("step_key", step.key);
      formData.append("notes", data.notes || "Completed");
      formData.append("date", data.date || defaultDate);
      formData.append("time", data.time || defaultTime);
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

      setProcessData((prev) => prev.map((s, i) => i === currentStep ? { ...s, ...data, completed: true } : s));
      if (onUploadSuccess) onUploadSuccess();
      if (currentStep < processData.length - 1) setCurrentStep(currentStep + 1);
    } catch (err) {
      console.error("Error saving step:", err);
    } finally {
      setLoading(false);
    }
  };

  const allCompleted = processData.every((s) => s.completed);
  const completedSteps = processData.filter((s) => s.completed);
  const step = processData[currentStep];

  return (
    <TenderProcessContext.Provider value={{
      currentStep, loading, processData, file, setFile,
      allCompleted, completedSteps, step,
      register, handleSubmit, errors, isSubmitting, onNext,
    }}>
      {children}
    </TenderProcessContext.Provider>
  );
};

// ── StepLogList (shared helper) ────────────────────────────────────────────────
const StepLogList = ({ rows, processData }) => (
  <div className="flex flex-col gap-2">
    {rows.map((s) => (
      <div key={s.key} className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 flex flex-col gap-2 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 leading-none">
              {processData.indexOf(s) + 1}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 size={12} className="text-blue-500 shrink-0" />
              <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{s.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {s.date && (
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                {new Date(s.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
              </span>
            )}
            {s.time && (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md whitespace-nowrap tabular-nums">
                {s.time}
              </span>
            )}
          </div>
        </div>
        {s.notes && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-7 border-l-2 border-blue-200 dark:border-blue-800 ml-0.5">{s.notes}</p>
        )}
        {s.file_url && (
          <a href={s.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 pl-7 text-blue-600 hover:text-blue-700 transition-colors w-fit">
            <Paperclip size={11} className="shrink-0" />
            <span className="text-[10px] font-bold underline decoration-blue-300 underline-offset-2 leading-tight break-all">{s.file_name || "Attachment"}</span>
          </a>
        )}
      </div>
    ))}
  </div>
);

// ── Entry Form Sub-Component ───────────────────────────────────────────────────
export const TenderProcessEntry = () => {
  const { allCompleted, loading, processData, currentStep, step, file, setFile, register, handleSubmit, errors, isSubmitting, onNext } = useTenderProcess();

  if (loading && processData.length === 0)
    return <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />;

  return (
    <AnimatePresence>
      {!allCompleted && (
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16, transition: { duration: 0.25 } }}
          transition={{ duration: 0.3 }}
          className="  bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step Entry</span>
            <span className="text-[10px] font-black text-blue-600 tabular-nums">{currentStep + 1} / {processData.length}</span>
          </div>
          <div className="p-5 flex flex-col gap-5">
            {/* Step bubbles */}
            <div className="flex gap-3 overflow-hidden relative">
              {processData.slice(currentStep, currentStep + 4).map((s, idx) => {
                const absoluteIndex = currentStep + idx;
                const isCurrent = absoluteIndex === currentStep;
                return (
                  <div key={s.key} className="flex flex-col items-center flex-1">
                    <div className="relative flex items-center justify-center w-full my-2">
                      {idx !== 0 && <div className="absolute left-0 right-1/2 top-1/2 -translate-y-1/2 h-0.5 w-full -z-10 bg-slate-200 dark:bg-slate-700" />}
                      {idx !== 3 && absoluteIndex < processData.length - 1 && <div className="absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-0.5 w-full -z-10 bg-slate-200 dark:bg-slate-700" />}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm text-sm font-bold ${isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-500/20 scale-110" : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400"}`}>
                        {absoluteIndex + 1}
                      </div>
                    </div>
                    <p className={`text-[9px] font-bold text-center uppercase tracking-tight ${isCurrent ? "text-blue-600" : "text-slate-400"}`}>{s.label}</p>
                  </div>
                );
              })}
            </div>
            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form key={step?.key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} onSubmit={handleSubmit(onNext)} className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <span className="text-base font-black text-blue-600">{currentStep + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{step?.label}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Step {currentStep + 1} of {processData.length}</p>
                  </div>
                </div>

                {step?.key === "work_order" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Work Order ID" name="workOrder_id" register={register} error={errors.workOrder_id} icon={FileText} />
                    <FormInput label="Issued Date" name="workOrder_issued_date" type="date" register={register} error={errors.workOrder_issued_date} icon={Calendar}
                      min={currentStep > 0 ? processData[currentStep - 1]?.date?.split("T")[0] : undefined}
                      max={new Date().toISOString().split("T")[0]} />
                  </div>
                ) : step?.key === "agreement" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput label="Agreement ID" name="agreement_id" register={register} error={errors.agreement_id} icon={FileText} />
                      <FormInput label="Agreement Value" name="agreement_value" type="number" register={register} error={errors.agreement_value} icon={Settings} />
                    </div>
                    <FormInput label="Issued Date" name="agreement_issued_date" type="date" register={register} error={errors.agreement_issued_date} icon={Calendar}
                      min={currentStep > 0 ? processData[currentStep - 1]?.date?.split("T")[0] : undefined}
                      max={new Date().toISOString().split("T")[0]} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput label="Completion Date" name="date" type="date" register={register} error={errors.date} icon={Calendar}
                        min={currentStep > 0 ? processData[currentStep - 1]?.date?.split("T")[0] : undefined}
                        max={new Date().toISOString().split("T")[0]} />
                      <FormInput label="Completion Time" name="time" type="time" register={register} error={errors.time} icon={Clock} />
                    </div>
                    <FormTextArea label="Notes / Remarks" name="notes" register={register} error={errors.notes} placeholder="Enter any specific details..." />
                  </div>
                )}

                <div className="group relative">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Attachment</label>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 top-6" />
                  <div className={`p-3.5 rounded-xl border-2 border-dashed flex items-center gap-3 transition-all ${file ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${file ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                      <Upload size={16} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-sm font-semibold truncate ${file ? "text-blue-600" : "text-slate-500"}`}>{file ? file.name : "Click to upload"}</p>
                      <p className="text-[10px] text-slate-400">pdf, doc, jpg · max 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={loading || isSubmitting}
                    className="group px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow shadow-blue-500/30 disabled:opacity-50 flex items-center gap-2">
                    {currentStep < processData.length - 1 ? "Proceed to Next" : "Complete Process"}
                    <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Log Sub-Component ──────────────────────────────────────────────────────────
export const TenderProcessLog = () => {
  const { allCompleted, completedSteps, processData, loading } = useTenderProcess();

  if (loading && processData.length === 0)
    return <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lifecycle Log</span>
        {allCompleted ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shadow shadow-emerald-500/30">
            <Check size={9} strokeWidth={3} /> Completed
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow shadow-blue-500/20">
            {completedSteps.length} / {processData.length}
          </span>
        )}
      </div>
      <div className="p-5">
        {completedSteps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-300 dark:text-slate-600">
            <Clock size={36} strokeWidth={1.5} />
            <p className="text-[11px] font-black uppercase tracking-widest">Awaiting first step</p>
          </div>
        ) : (
          <StepLogList rows={allCompleted ? processData : completedSteps} processData={processData} />
        )}
      </div>
    </div>
  );
};

// ── Form Helper Components ─────────────────────────────────────────────────────
const FormInput = ({ label, name, register, error, type = "text", icon: Icon, min, max }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon size={16} />
        </div>
      )}
      <input type={type} min={min} max={max} {...register(name)}
        className={`w-full ${Icon ? "pl-10" : "px-4"} pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm ${error ? "border-red-500 bg-red-50/50" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"}`} />
    </div>
    {error && (
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
        className="text-[10px] text-red-500 font-bold flex items-center gap-1 leading-none">
        <AlertCircle size={10} />{error.message}
      </motion.p>
    )}
  </div>
);

const FormTextArea = ({ label, name, register, error, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    <textarea {...register(name)} rows={4} placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm resize-none ${error ? "border-red-500 bg-red-50/50" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"}`} />
    {error && (
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
        className="text-[10px] text-red-500 font-bold flex items-center gap-1">
        <AlertCircle size={10} />{error.message}
      </motion.p>
    )}
  </div>
);

// ── Default Export (backward compat) ───────────────────────────────────────────
const TenderProcessStepper = ({ onUploadSuccess }) => (
  <TenderProcessProvider onUploadSuccess={onUploadSuccess}>
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <TenderProcessEntry />
      <TenderProcessLog />
    </div>
  </TenderProcessProvider>
);

export default TenderProcessStepper;

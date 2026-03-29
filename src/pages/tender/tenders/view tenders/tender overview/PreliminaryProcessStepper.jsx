import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../../../../constant";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Upload, FileText, AlertCircle, ClipboardList } from "lucide-react";

const preliminarySiteWorkTemplate = [
  { label: "Site Visit & Reconnaissance", key: "site_visit_reconnaissance" },
  { label: "Site Approach & Accessibility", key: "site_approach_accessibility" },
  { label: "Site Hurdles Identification", key: "site_hurdles_identification" },
  { label: "Labour Shed Location and Feasibility", key: "labour_shed_location_feasibility" },
  { label: "Temporary EB Connection", key: "temporary_eb_connection" },
  { label: "Water Source Identification & Connection", key: "water_source_identification_connection" },
  { label: "Office, Labour and Materials Shed Setup", key: "office_labour_materials_shed_setup" },
  { label: "Yard for Steel and Bulk Materials", key: "yard_steel_bulk_materials" },
  { label: "Office Setup & Facilities", key: "office_setup_facilities" },
  { label: "Sub Contractors Identification", key: "sub_contractors_identification" },
  { label: "Vendor Identification", key: "vendor_identification" },
];

const getStepSchema = () =>
  yup.object().shape({
    notes: yup.string().required("Notes are required"),
  });

const PreliminaryProcessStepper = ({ onUploadSuccess }) => {
  const { tender_id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processData, setProcessData] = useState([]);
  const [file, setFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(getStepSchema()),
    mode: "onBlur",
  });

  useEffect(() => {
    const fetchSavedProgress = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/tender/preliminary/${tender_id}`);
        const savedData = res.data?.processData || [];

        const initialData = preliminarySiteWorkTemplate.map((step) => {
          const savedStep = savedData.find((d) => d.key === step.key);
          return {
            ...step,
            notes: savedStep?.notes || "",
            completed: savedStep?.completed === true,
          };
        });

        const firstUncompletedIndex = initialData.findIndex((step) => !step.completed);
        const startStep = firstUncompletedIndex === -1 ? initialData.length - 1 : firstUncompletedIndex;

        setProcessData(initialData);
        setCurrentStep(startStep);

        reset({
          notes: initialData[startStep]?.notes || "",
        });
      } catch (err) {
        console.error("Error fetching preliminary progress:", err);
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
      });
      setFile(null);
    }
  }, [currentStep, processData, reset]);

  const onNext = async (data) => {
    const step = processData[currentStep];
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tender_id", tender_id);
      formData.append("step_key", step.key);
      formData.append("notes", data.notes);
      if (file) formData.append("file", file);

      await axios.post(`${API}/tender/preliminaryaws/step`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProcessData(prev => prev.map((s, i) => i === currentStep ? { ...s, completed: true } : s));
      if (onUploadSuccess) onUploadSuccess();
      if (currentStep < processData.length - 1) setCurrentStep(currentStep + 1);
    } catch (err) {
      console.error("Error saving preliminary step:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && processData.length === 0) return <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />;

  const step = processData[currentStep];
  const allCompleted = processData.every(s => s.completed);

  return (
    <div className="select-none h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
          <ClipboardList size={20} />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 italic">Preliminary Site Work</h3>
      </div>

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
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-500/20 scale-110" 
                      : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400"
                  }`}
                >
                  <span className="text-sm font-bold">{absoluteIndex + 1}</span>
                </div>
              </div>
              <p className={`text-[10px] font-bold text-center uppercase tracking-tight transition-colors duration-200 ${
                isCurrent ? "text-emerald-600" : "text-slate-400"
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
                  <span className="text-lg font-bold text-emerald-600">{currentStep + 1}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{step?.label}</h4>
                  <p className="text-xs text-slate-500">Step {currentStep + 1} of {processData.length}</p>
                </div>
              </div>

              <div className="space-y-6">
                <FormTextArea label="Observations & Notes" name="notes" register={register} error={errors.notes} placeholder="Enter site observations..." />
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Site Documents / Photos</label>
                <div className="group relative">
                  <input type="file" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`p-4 rounded-xl border-2 border-dashed transition-all flex items-center gap-4 ${
                    file ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                  }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${file ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                      <Upload size={18} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-sm font-semibold truncate ${file ? "text-emerald-600" : "text-slate-600"}`}>
                        {file ? file.name : "Upload site media"}
                      </p>
                      <p className="text-[10px] text-slate-400 italic">Optional doc, pdf, jpg up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="group relative px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center gap-2 overflow-hidden"
                >
                  <span className="relative z-10">{currentStep < processData.length - 1 ? "Next Step" : "Complete Work"}</span>
                  <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
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
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Work Completed!</h4>
              <p className="text-slate-500 text-sm max-w-xs">All preliminary site work steps have been successfully recorded.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FormTextArea = ({ label, name, register, error, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    <textarea
      {...register(name)}
      rows={4}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm resize-none ${
        error ? "border-red-500 bg-red-50/50" : "border-slate-200 dark:border-slate-700 focus:border-emerald-500"
      }`}
    />
    {error && (
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold flex items-center gap-1">
        <AlertCircle size={10} />
        {error.message}
      </motion.p>
    )}
  </div>
);

export default PreliminaryProcessStepper;

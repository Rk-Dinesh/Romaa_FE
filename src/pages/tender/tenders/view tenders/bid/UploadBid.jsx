import axios from "axios";
import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { IoClose, IoCloudUploadOutline, IoDocumentTextOutline, IoTrashOutline, IoCheckmarkCircle } from "react-icons/io5";
import { API } from "../../../../../constant";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../../../context/AuthContext";
import SampleBidExcel from "./NewBid.xlsx";


const UploadBid = ({ onclose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [gst, setGst] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const { tender_id } = useParams();
  const { user } = useAuth();

  const handleFiles = (selectedFiles) => {
    const incoming = Array.from(selectedFiles);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...incoming.filter((f) => !existingNames.has(f.name))];
    });
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };


  const onSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.info("Please select at least one file to upload.");
      return;
    }

    try {
      setSaving(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("tender_id", tender_id);
      formData.append("gst", gst || 18);
      formData.append("created_by_user", user?.id || "unknown");

      // Logic for adding multiple files
      files.forEach((file) => {
        formData.append("file", file);
      });

      await axios.post(`${API}/bid/uploadcsv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploadComplete(true);
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        if (onclose) onclose();
        toast.success("Files uploaded successfully");
      }, 1500);

    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload files");
    } finally {
      setSaving(false);
    }
  };

const downloadSampleFile = () => {
    const link = document.createElement("a");
    link.href = SampleBidExcel;
    link.setAttribute("download", "New Bid.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isBusy = saving || uploadComplete;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-md bg-black/30 animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-gray-100 dark:border-slate-800">
        
        {/* UPLOADING OVERLAY */}
        {saving && (
          <div className="absolute inset-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/50 animate-ping opacity-75"></div>
              <div className="relative w-24 h-24 bg-blue-50 dark:bg-blue-900/80 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                <IoCloudUploadOutline size={48} className="animate-bounce" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Uploading Boq</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">
              Please wait while we process and upload your bid data.
            </p>
            <div className="w-full max-w-xs h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-8 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">{uploadProgress}%</p>
          </div>
        )}

        {/* SUCCESS OVERLAY */}
        {uploadComplete && (
          <div className="absolute inset-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 text-green-500 mb-6 animate-in zoom-in duration-500 ease-out-back">
              <IoCheckmarkCircle size="100%" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Upload Successful!</h3>
            <p className="text-sm text-slate-500 mt-2">Your Boq files have been added to the tender successfully.</p>
          </div>
        )}

        {/* HEADER */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-50 dark:border-slate-800 transition-opacity duration-300 ${isBusy ? "opacity-0" : "opacity-100"}`}>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Upload Boq Bid</h2>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">
              Tender Reference: {tender_id}
            </p>
          </div>
          <button
            onClick={onclose}
            disabled={isBusy}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors disabled:opacity-30"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={onSubmit}
          className={`p-6 transition-all duration-300 ${isBusy ? "opacity-10 dark:opacity-20 pointer-events-none blur-[2px]" : "opacity-100"}`}
        >
          {/* GST Input */}
          <div className="mb-6 group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-500 transition-colors">
              GST Percentage (%)
            </label>
            <input
              type="number"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
              placeholder="e.g. 18"
              className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 dark:text-white shadow-sm"
            />
          </div>

          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current.click()}
            className="group relative border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl py-12 px-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-200"
          >
            <input
              type="file"
              multiple
              ref={inputRef}
              onChange={(e) => e.target.files.length && handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <IoCloudUploadOutline size={32} />
              </div>
              <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Excel (.xlsx) files are supported</p>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Selected Files ({files.length})
              </p>
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="group/row flex items-center justify-between bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700 animate-in slide-in-from-left-2 shadow-sm"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg">
                      <IoDocumentTextOutline size={18} />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                  >
                    <IoTrashOutline size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            <button
              type="button"
              onClick={downloadSampleFile}
              className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Sample File
            </button>
            <button
              type="submit"
              disabled={files.length === 0}
              className="px-4 py-3 bg-darkest-blue text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Upload Bid
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default UploadBid;

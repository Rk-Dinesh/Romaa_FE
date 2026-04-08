import React, { useState, useRef } from "react";
import Modal from "../../../../../components/Modal";
import { 
  IoCloudUploadOutline, IoTrashOutline, 
} from "react-icons/io5";
import { 
  TbFileTypePdf, TbFileTypeDoc, TbPhoto, TbFile, TbFileSpreadsheet,
} from "react-icons/tb";

const getFileIcon = (filename = "") => {
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "pdf")               return { Icon: TbFileTypePdf, color: "text-red-500",     bg: "bg-red-50 dark:bg-red-900/20" };
  if (["doc","docx"].includes(ext))return { Icon: TbFileTypeDoc, color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20" };
  if (["xlsx","xls","csv"].includes(ext))
                                   return { Icon: TbFileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
  if (["png","jpg","jpeg","svg","webp"].includes(ext))
                                   return { Icon: TbPhoto,       color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
  return                                  { Icon: TbFile,        color: "text-slate-400",   bg: "bg-slate-50 dark:bg-slate-800" };
};

const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const UploadModal = ({ onclose }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

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
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <Modal
      widthClassName="lg:w-[600px] md:w-[500px] w-full mx-4"
      onclose={onclose}
      title="Upload Assets"
      child={
        <div className="flex flex-col gap-6 p-2">
          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current.click()}
            className={`group relative border-2 border-dashed rounded-2xl py-10 px-4 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 scale-[1.01]"
                : "border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
            }`}
          >
            <input
              type="file"
              multiple
              ref={inputRef}
              onChange={(e) => e.target.files.length && handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center pointer-events-none">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200 ${
                isDragging
                  ? "bg-blue-100 dark:bg-blue-900/60 text-blue-600 scale-110"
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 group-hover:scale-110"
              }`}>
                <IoCloudUploadOutline size={28} className={isDragging ? "animate-bounce" : ""} />
              </div>
              <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                {isDragging ? "Drop files here" : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Any document or image supported</p>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar animate-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Selected Files ({files.length})
              </p>
              {files.map((file, idx) => {
                const { Icon, color, bg } = getFileIcon(file.name);
                return (
                  <div
                    key={idx}
                    className="group/row flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-2 ${bg} ${color} rounded-lg`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{formatSize(file.size)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover/row:opacity-100 active:scale-90"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end items-center gap-3 mt-2">
            <button
              onClick={onclose}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              className="px-8 py-2.5 bg-darkest-blue text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-[0.98] transition-all"
              disabled={files.length === 0}
            >
              Save Assets
            </button>
          </div>
        </div>
      }
    />
  );
};

export default UploadModal;

import axios from "axios";
import React, { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { useProject } from "../ProjectContext";
import { API } from "../../../constant";

// const sampleCSv = `description,unit,quantity
// Foundation Excavation,m³,70
// Concrete Pour,m³,140
// Brick Laying,m²,210
// Wall Laying,m²,80
// Floor Laying,m²,46
// Roof Laying,m²,78
// painting,m²,453
// plumbing,m²,143
// electrical,m²,68
// `;

const sampleCSv = `
Code,Description,Unit,Quantity
A,SITE ESTABLISHMENT,,
1,Soil Cutting,cum,10400
B,LHS-Side-Hight Portion,,
1,D/S Cut off Wall,,
1.1,Earthwork +49.2,,
1.1.1,ch 0-20,Rmt,100
1.1.2,ch 20-30,Rmt,15
1.1.3,ch 30-40,Rmt,10
,,,
1.2,PCC Top +49.3,,
1.2.1,ch 40-50,Rmt,55
1.2.2 ,ch 50-60,Rmt,60
2,Concrete Works,,
2.1,PCC,,
2.1.1,ch 60-85,Rmt,90
2.1.2,ch 85-120,Rmt,200
2.1.3,ch 120-125,Rmt,20
2.1.4,ch 125-130,Rmt,40
`;

const UploadWBS = ({ onclose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
 const { tenderId } = useProject(); 

  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    setFiles((prev) => [...prev, ...fileArray]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files.length) {
      handleFiles(e.target.files);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      // Append required fields (replace with actual values or props)
      formData.append("tender_id", tenderId);
      formData.append("created_by_user", "user_id_here");

      if (files.length === 1) {
        // Single file upload
        formData.append("file", files[0]);
        await axios.post(`${API}/schedulelite/upload-csv`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      if (onSuccess) onSuccess();
      if (onclose) onclose();
      toast.success("Files uploaded successfully");
      setSaving(false);
    } catch (error) {
      console.error("Upload error:", error);
      //  alert("Failed to upload files");
    }
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCSv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_wbs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50  drop-shadow-lg z-20">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full md:w-[600px] p-6 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onclose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <IoClose size={24} className="text-gray-700" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4 select-none">
          Upload Files
        </h2>

        <form
          onSubmit={onSubmit}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col"
        >
          {/* Drag & Drop Area */}
          <div
            onClick={() => inputRef.current.click()}
            className="border-4 border-dashed border-gray-300 rounded-lg py-16 px-6 mb-4 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === " " || e.key === "Enter"
                ? inputRef.current.click()
                : null
            }
            role="button"
            aria-label="File upload drop zone"
          >
            <p className="text-gray-500 text-lg mb-2 select-none">
              Drag & drop files here or{" "}
              <span className="text-blue-600 font-medium underline">
                click to select
              </span>
            </p>
            <input
              type="file"
              multiple
              ref={inputRef}
              onChange={handleInputChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="overflow-y-auto max-h-48 border border-gray-200 rounded-md p-3 bg-gray-50 mb-4">
              <p className="text-gray-700 font-semibold text-sm mb-0.5 select-none">
                Selected file{files.length > 1 ? "s" : ""}:
              </p>
              <ul className="space-y-1 text-gray-600 text-xs">
                {files.map((file, idx) => (
                  <li
                    key={idx}
                    className="truncate"
                    title={`${file.name} (${(file.size / 1024).toFixed(2)} KB)`}
                  >
                    {file.name}{" "}
                    <span className="text-gray-400 text-xs">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {" "}
              Download Sample CSV{" "}
            </button>
            <button
              type="button"
              onClick={onclose}
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={files.length === 0}
              className=" py-2 cursor-pointer px-6 bg-darkest-blue text-white rounded  disabled:opacity-50 disabled:cursor-not-allowed "
            >
              {saving ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadWBS;

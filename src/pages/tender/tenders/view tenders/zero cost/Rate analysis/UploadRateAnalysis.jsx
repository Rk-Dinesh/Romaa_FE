import axios from "axios";
import React, { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { API } from "../../../../../../constant";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const sampleCSv = `itemNo,workItem,category,Sub_Category,description,unit,quantity,rate,amount,finalRate,output
1,Earthwork,MAIN_ITEM,,Earthwork,Cum,,,,663.35,855.36
1,Earthwork,MACHINERIES,Equipment,Hire JCB,Month,2,80000,160000,239.67,
1,Earthwork,MACHINERIES,Equipment,Tractor,Month,1,45000,45000,239.67,
1,Earthwork,FUEL,Fuel,Diesel,Lit,1275,96,122400,143.1,
1,Earthwork,SUBCONTRACTOR,S/C Work,Blasting,Points,1100,180,198000,231.48,
1,Earthwork,MANPOWER,Labor,Helpers,Nos,60,700,42000,49.1,
,,,,,,,,,,
2,Refilling,MAIN_ITEM,,Refilling,Cum,,,,89.58,684.288
2,Refilling,MACHINERIES,Equipment,Hire JCB,Month,0.5,80000,40000,58.45,
2,Refilling,FUEL,Fuel,Diesel,Lit,112.5,96,10800,15.78,
2,Refilling,MANPOWER,Labor,Helpers,Nos,15,700,10500,15.34,
,,,,,,,,,,
3,Gravel Filling,MAIN_ITEM,,Gravel Filling,Cum,,,,301.03,543.54
3,Gravel Filling,MATERIALS,Material,Water Load,Load,30,700,21000,38.62,
3,Gravel Filling,MACHINERIES,Equipment,Hire JCB,Month,1,80000,80000,147.4,
3,Gravel Filling,FUEL,Fuel,Diesel,Lit,375,96,36000,66.27,
3,Gravel Filling,MANPOWER,Labor,Helpers,Nos,60,700,42000,48.74,`;

const UploadRateAnalysis = ({ onclose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const { tender_id } = useParams();

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
      formData.append("tender_id", tender_id);
      formData.append("created_by_user", "user_id_here");

      if (files.length === 1) {
        // Single file upload
        formData.append("file", files[0]);
        await axios.post(`${API}/rateanalysis/uploadcsv`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success("File Upload Successfully")
      if (onSuccess) onSuccess();
      if (onclose) onclose();
      setSaving(false);
    } catch (error) {
      toast.error("File Upload Failed")
      console.error("Upload error:", error);
      //  alert("Failed to upload files");
    }
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCSv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_boq.csv");
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

export default UploadRateAnalysis;

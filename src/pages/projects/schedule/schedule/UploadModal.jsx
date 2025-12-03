import axios from "axios";
import { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { API } from "../../../../constant";
import { useProject } from "../../ProjectContext";
import { toast } from "react-toastify";

const sampleCSv = `MajorHeading,CustomWorks,SubWorkName,SubWorkUnit,SubWorkQty,SubWorkStartDate,SubWorkEndDate,Description,Unit,Qty,ExecutedQty,BalanceQty,StartDate,EndDate,Duration,Delay,Status,DaysRemaining,Notes
A - Preliminary and Common Works,Soil Cutting,Soil Cutting,Cum,10400,2025-09-22,2025-10-11,,,,,,,,,,,,
A - Preliminary and Common Works,Initial Embankment Formation,Initial Embankment,Cum,10400,2025-09-24,2025-10-13,,,,,,,,,,,,
B - LHS Side - High Portion - Shed Side,D/S Cut off Wall,Earthwork +49.2,Rmt,125,,,Ch 0 - 7.2,Rmt,7.2,0,7.2,2025-10-06,2025-10-06,1,0,pending,11,
B - LHS Side - High Portion - Shed Side,D/S Cut off Wall,Earthwork +49.2,Rmt,125,,,Ch 7.2 - 30,Rmt,22.8,0,22.8,2025-10-07,2025-10-08,2,0,pending,13,
B - LHS Side - High Portion - Shed Side,PCC - Top +49.3,PCC Segment,Rmt,125,,,Ch 0 - 7.2,Rmt,7.2,0,7.2,2025-10-07,2025-10-07,1,0,pending,12,`;

const UploadModal = ({ onclose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const { tenderId } = useProject();

  // Form fields state
  const [formDataValues, setFormDataValues] = useState({
    workOrderDate: "",
    aggDate: "",
    agreementValue: "",
    projectEndDate: "",
    plannedCompletionDate: "",
    reportDate: "",
    projectName: "",
    tenderId: tenderId,
    notes: "",
  });

  const handleFiles = (selectedFiles) => {
    if (selectedFiles.length > 0) setFiles([selectedFiles[0]]); // only single file
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files.length) handleFiles(e.target.files);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormDataValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) return toast.error("Please select a CSV file");

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("file", files[0]);
      Object.keys(formDataValues).forEach((key) =>
        formData.append(key, formDataValues[key])
      );

      const res = await axios.post(`${API}/schedule/uploadcsv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "File uploaded successfully");
      if (onSuccess) onSuccess();
      onclose();
    } catch (err) {
      toast.error(err.response?.data?.error || "File upload failed");
      console.error("Upload error:", err);
    } finally {
      setSaving(false);
    }
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCSv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 grid justify-center items-center backdrop-blur-xs z-20">
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
          Upload Schedule CSV
        </h2>

        <form
          onSubmit={onSubmit}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col gap-4 text-black"
        >
          {/* Required fields */}
          <div className="grid grid-cols-2 gap-3">
            <label>
              Work Order Date
              <input
                type="date"
                name="workOrderDate"
                value={formDataValues.workOrderDate}
                onChange={handleFieldChange}
                required
                className="border rounded px-2 py-1 w-full"
              />
            </label>
            <label>
              Agreement Date
              <input
                type="date"
                name="aggDate"
                value={formDataValues.aggDate}
                onChange={handleFieldChange}
                required
                className="border rounded px-2 py-1 w-full"
              />
            </label>
            <label>
              Agreement Value
              <input
                type="number"
                name="agreementValue"
                value={formDataValues.agreementValue}
                onChange={handleFieldChange}
                required
                className="border rounded px-2 py-1 w-full"
              />
            </label>
            <label>
              Project End Date
              <input
                type="date"
                name="projectEndDate"
                value={formDataValues.projectEndDate}
                onChange={handleFieldChange}
                required
                className="border rounded px-2 py-1 w-full"
              />
            </label>
            <label>
              Planned Completion Date
              <input
                type="date"
                name="plannedCompletionDate"
                value={formDataValues.plannedCompletionDate}
                onChange={handleFieldChange}
                required
                className="border rounded px-2 py-1 w-full"
              />
            </label>
            <label>
              Report Date
              <input
                type="date"
                name="reportDate"
                value={formDataValues.reportDate}
                onChange={handleFieldChange}
                required
                className="border rounded px-2 py-1 w-full"
              />
            </label>
            <label>
              Project Name
              <input
                type="text"
                name="projectName"
                value={formDataValues.projectName}
                onChange={handleFieldChange}
                required
                className="border rounded px-2 py-1 w-full"
              />
            </label>
          </div>

          {/* Drag & Drop CSV */}
          <div
            onClick={() => inputRef.current.click()}
            className="border-4 border-dashed border-gray-300 rounded-lg py-12 px-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50"
          >
            <p className="text-gray-500">
              Drag & drop CSV here or{" "}
              <span className="text-blue-600 underline">click to select</span>
            </p>
            <input
              type="file"
              accept=".csv"
              ref={inputRef}
              onChange={handleInputChange}
              className="hidden"
            />
            {files.length > 0 && <p className="mt-2 text-gray-700">{files[0].name}</p>}
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Download Sample CSV
            </button>
            <button
              type="submit"
              disabled={saving || !files.length}
              className="px-6 py-2 bg-blue-700 text-white rounded disabled:opacity-50"
            >
              {saving ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;

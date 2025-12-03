import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";

const initialMaterial = { materialName: "", quantity: "", unit: "" };

const CreateEnquiry = ({ onclose, onSuccess }) => {
  const [entryType, setEntryType] = useState(""); // manual / existing

  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);

  // Selected values
  const [projectId, setProjectId] = useState("");
  const [requestId, setRequestId] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [siteIncharge, setSiteIncharge] = useState("");
  const [requiredByDate, setRequiredByDate] = useState("");

  const [materials, setMaterials] = useState([{ ...initialMaterial }]);

  // 🔥 READONLY FLAG
  const isReadOnly = entryType === "existing" && requestId;

  /** LOAD PROJECTS */
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await axios.get(`${API}/tender/all`);
      setProjects(res.data?.data || []);
    } catch {
      toast.error("Failed to load projects");
    }
  };

  /** RESET FORM FIELDS */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSiteName("");
    setSiteLocation("");
    setSiteIncharge("");
    setRequiredByDate("");
    setMaterials([{ ...initialMaterial }]);
  };

  /** PROJECT SELECTION */
  const handleProjectSelect = async (id) => {
    setProjectId(id);
    setRequestId("");
    setRequests([]);
    resetForm();

if (entryType !== "existing") return;

try {
  const res = await axios.get(
    `${API}/purchaseorderrequest/api/getbyId/${id}`
  );

  // Filter requests with status "Request Raised"
  const pendingRequests = (res.data?.data || []).filter(
    (r) => r.status === "Request Raised"
  );

  setRequests(pendingRequests);
} catch {
  toast.error("No Purchase Requests Found");
}
  };

  /** REQUEST AUTO FILL */
  const handleRequestSelect = async (id) => {
    setRequestId(id);

    try {
      const res = await axios.get(
        `${API}/purchaseorderrequest/api/getdetailbyId/${projectId}/${id}`
      );

      const d = res.data?.data || {};

      setTitle(d.title || "");
      setDescription(d.description || "");
      setSiteName(d.siteDetails?.siteName || "");
      setSiteLocation(d.siteDetails?.location || "");
      setSiteIncharge(d.siteDetails?.siteIncharge || "");
      setRequiredByDate(d.requiredByDate?.substring(0, 10) || "");
      setMaterials(d.materialsRequired || [{ ...initialMaterial }]);
    } catch {
      toast.error("Failed to load request details");
    }
  };

  /** MATERIAL ROW HANDLERS */
  const handleAddRow = () =>
    setMaterials([...materials, { ...initialMaterial }]);

  const handleDeleteRow = (index) => {
    if (materials.length === 1) return;
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (i, field, value) => {
    const updated = [...materials];
    updated[i][field] = value;
    setMaterials(updated);
  };

  /** SUBMIT */
  const handleSubmit = async () => {
    if (!projectId) return toast.warning("Project is required");

    const payload = {
      projectId,
      title,
      description,
      siteDetails: {
        siteName,
        location: siteLocation,
        siteIncharge,
      },
      requiredByDate,
      materialsRequired: materials,
      status: "Quotation Requested",
    };

    try {
      if (entryType === "existing") {
        if (!requestId)
          return toast.warning("Select Request ID for existing entry");

        await axios.put(
          `${API}/purchaseorderrequest/api/updateStatus/${requestId}`,
          { status: "Quotation Requested" }
        );
      } else {
        await axios.post(`${API}/purchaseorderrequest/api/create`, payload);
      }

      toast.success("Saved successfully");
      onSuccess && onSuccess();
      onclose();
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-layout-dark w-full max-w-3xl rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4">
          <p className="text-2xl text-white font-semibold">Create Enquiry</p>
          <button
            className="text-gray-400 hover:text-red-500"
            onClick={onclose}
          >
            <IoClose size={26} />
          </button>
        </div>

        <div className="p-6">
          {/* ENTRY TYPE */}
          <label className="text-white text-sm">Entry Type</label>
          <select
            value={entryType}
            onChange={(e) => {
              setEntryType(e.target.value);
              setProjectId("");
              setRequestId("");
              resetForm();
              setRequests([]);
            }}
            className="w-full border bg-layout-dark border-border-dark-grey rounded px-3 py-2 mt-1 text-white mb-4"
          >
            <option value="">Select</option>
            <option value="manual">Manual Entry</option>
            <option value="existing">Existing Request</option>
          </select>

          {/* PROJECT */}
          <label className="text-white text-sm">Project</label>
          <select
            value={projectId}
            onChange={(e) => handleProjectSelect(e.target.value)}
            disabled={isReadOnly}
            className="w-full border bg-layout-dark border-border-dark-grey rounded px-3 py-2 mt-1 text-white mb-4"
          >
            <option value="">Select Project</option>
            {projects.map((p, i) => (
              <option key={i} value={p.tender_id}>
                {p.tender_id}
              </option>
            ))}
          </select>

          {/* REQUEST */}
          {entryType === "existing" && projectId && (
            <>
              <label className="text-white text-sm">Request ID</label>
              <select
                value={requestId}
                onChange={(e) => handleRequestSelect(e.target.value)}
                className="w-full border bg-layout-dark border-border-dark-grey rounded px-3 py-2 mt-1 text-white mb-4"
              >
                <option value="">Select Request</option>
                {requests.map((r, i) => (
                  <option key={i} value={r.requestId}>
                    {r.requestId}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* TITLE */}
          <label className="text-white text-sm">Title</label>
          <input
            className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white mb-3"
            value={title}
            readOnly={isReadOnly}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* DESCRIPTION */}
          <label className="text-white text-sm">Description</label>
          <textarea
            className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white mb-3"
            value={description}
            readOnly={isReadOnly}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* SITE DETAILS */}
          <h2 className="text-lg font-semibold text-white mt-4 mb-2">
            Site Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="text-white text-sm">Site Name</label>
              <input
                value={siteName}
                readOnly={isReadOnly}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm">Location</label>
              <input
                value={siteLocation}
                readOnly={isReadOnly}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm">Site Incharge</label>
              <input
                value={siteIncharge}
                readOnly={isReadOnly}
                onChange={(e) => setSiteIncharge(e.target.value)}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm">Required By Date</label>
              <input
                type="date"
                value={requiredByDate}
                readOnly={isReadOnly}
                onChange={(e) => setRequiredByDate(e.target.value)}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
              />
            </div>
          </div>

          {/* MATERIALS */}
          <h2 className="text-lg font-semibold text-white mb-2">
            Materials Required
          </h2>

          {/* HIDE ADD ROW IN EXISTING */}
          {!isReadOnly && (
            <button
              className="bg-darkest-blue text-white px-6 py-2 rounded mb-4"
              onClick={handleAddRow}
            >
              + Add Row
            </button>
          )}

          {isReadOnly ? (
            // Display as plain table for existing request
            <table className="w-full text-white text-sm border border-border-dark-grey">
              <thead>
                <tr className="bg-[#1f1f1f]">
                  <th className="px-3 py-2 border">#</th>
                  <th className="px-3 py-2 border">Material</th>
                  <th className="px-3 py-2 border">Qty</th>
                  <th className="px-3 py-2 border">Unit</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 border">{i + 1}</td>
                    <td className="px-3 py-2 border">{row.materialName}</td>
                    <td className="px-3 py-2 border">{row.quantity}</td>
                    <td className="px-3 py-2 border">{row.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Editable table for manual entry
            <table className="w-full text-white text-sm border border-border-dark-grey">
              <thead>
                <tr className="bg-[#1f1f1f]">
                  <th className="px-3 py-2 border">#</th>
                  <th className="px-3 py-2 border">Material</th>
                  <th className="px-3 py-2 border">Qty</th>
                  <th className="px-3 py-2 border">Unit</th>
                  <th className="px-3 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 border">{i + 1}</td>
                    <td className="px-3 py-2 border">
                      <input
                        value={row.materialName}
                        onChange={(e) =>
                          handleMaterialChange(
                            i,
                            "materialName",
                            e.target.value
                          )
                        }
                        className="bg-transparent w-full outline-none text-white"
                      />
                    </td>
                    <td className="px-3 py-2 border">
                      <input
                        value={row.quantity}
                        onChange={(e) =>
                          handleMaterialChange(i, "quantity", e.target.value)
                        }
                        className="bg-transparent w-full outline-none text-white"
                      />
                    </td>
                    <td className="px-3 py-2 border">
                      <input
                        value={row.unit}
                        onChange={(e) =>
                          handleMaterialChange(i, "unit", e.target.value)
                        }
                        className="bg-transparent w-full outline-none text-white"
                      />
                    </td>
                    <td className="px-3 py-2 border">
                      {materials.length > 1 && (
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => handleDeleteRow(i)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              className="px-6 py-3 border border-gray-500 text-gray-300 rounded"
              onClick={onclose}
            >
              Cancel
            </button>

            <button
              className="px-6 py-3 bg-[#142e56] text-white rounded"
              onClick={handleSubmit}
            >
              Save Enquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEnquiry;

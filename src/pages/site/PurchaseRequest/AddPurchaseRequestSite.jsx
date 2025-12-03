import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";

const initialMaterial = { materialName: "", quantity: "", unit: "" };

const AddPurchaseRequestSite = ({ onclose, onSuccess }) => {
  const projectId = localStorage.getItem("tenderId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [siteIncharge, setSiteIncharge] = useState("");
  const [requiredByDate, setRequiredByDate] = useState("");
  const [materials, setMaterials] = useState([{ ...initialMaterial }]);
  const [materialNames, setMaterialNames] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${API}/material/getall/${projectId}`);
        setMaterialNames(res.data.data || []);
      } catch (err) {
        console.error("Error fetching materials:", err);
        toast.error("Failed to load materials");
      }
    };
    fetchMaterials();
  }, [projectId]);

  const handleAddRow = () =>
    setMaterials([...materials, { ...initialMaterial }]);

  const handleDeleteRow = (i) => {
    if (materials.length === 1) return;
    setMaterials(materials.filter((_, idx) => idx !== i));
  };

  const handleChange = (i, field, value) => {
    const updated = [...materials];

    if (field === "materialName") {
      const selectedMaterial = materialNames.find(
        (m) => m.item_description === value
      );
      updated[i].materialName = value;
      updated[i].unit = selectedMaterial?.unit || "";
      updated[i].allowedQty = selectedMaterial?.request_quantity || "";
    } else {
      updated[i][field] = value;
    }

    setMaterials(updated);
  };

  const handleSubmit = async () => {
    if (!title || !description || !siteName || !siteLocation) {
      toast.warning("Please fill all required fields!");
      return;
    }

    const empty = materials.some(
      (m) => !m.materialName || !m.quantity || !m.unit
    );
    if (empty) {
      toast.warning("Fill all material rows completely!");
      return;
    }

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
      materialsRequired: materials.map((m) => ({
        materialName: m.materialName,
        quantity: Number(m.quantity),
        unit: m.unit,
        // include allowedQty if your backend expects it
      })),
    };

    try {
      await axios.post(`${API}/purchaseorderrequest/api/create`, payload);
      toast.success("Purchase Request Created!");
      const updatePromises = materials.map((m) => {
        const material = materialNames.find(
          (mat) => mat.item_description === m.materialName
        );
        const currentQty = material?.request_quantity ?? 0;
        const updatedQty = currentQty - Number(m.quantity);
        return axios.put(
          `${API}/material/updaterequestquantity/${projectId}/${encodeURIComponent(
            m.materialName
          )}`,
          { request_quantity: updatedQty }
        );
      });

      await Promise.all(updatePromises);

      toast.success("Purchase Request Created & Quantities Updated!");
      onSuccess && onSuccess();
      onclose();
    } catch (err) {
      toast.error("Failed to create Purchase Request");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-layout-dark w-full max-w-3xl rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4">
          <p className="text-2xl text-white font-semibold">
            Add Purchase Request
          </p>
          <button
            onClick={onclose}
            className="text-gray-400 hover:text-red-500"
          >
            <IoClose size={28} />
          </button>
        </div>

        <div className="p-6">
          {/* PROJECT ID - AUTO */}
          <div className="mb-4">
            <label className="text-white text-sm">Project ID</label>
            <input
              value={projectId}
              readOnly
              className="w-full border bg-gray-800 border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
            />
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="text-white text-sm">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
              placeholder="Enter title"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-white text-sm">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
              rows={3}
            />
          </div>

          {/* SITE DETAILS */}
          <h2 className="text-lg font-semibold text-white mb-2">
            Site Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-white text-sm">Site Name</label>
              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm">Location</label>
              <input
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm">Site Incharge</label>
              <input
                value={siteIncharge}
                onChange={(e) => setSiteIncharge(e.target.value)}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm">Required By Date</label>
              <input
                type="date"
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mt-1 text-white"
              />
            </div>
          </div>

          {/* MATERIAL TABLE */}
          <h2 className="text-lg font-semibold text-white mb-2">
            Materials Required
          </h2>
          <button
            onClick={handleAddRow}
            className="bg-darkest-blue text-white px-6 py-2 rounded mb-4"
          >
            + Add Row
          </button>

          <table className="w-full text-white text-sm border border-border-dark-grey">
            <thead>
              <tr className="bg-[#1f1f1f]">
                <th className="px-3 py-2 border">#</th>
                <th className="px-3 py-2 border">Material</th>
                <th className="px-3 py-2 border">Allowed Qty</th>
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
                    <select
                      value={row.materialName}
                      onChange={(e) =>
                        handleChange(i, "materialName", e.target.value)
                      }
                      className="bg-transparent w-full outline-none text-white"
                    >
                      <option value="">Select Material</option>
                      {materialNames.map((mat) => (
                        <option
                          key={mat._id || mat.item_description}
                          value={mat.item_description}
                        >
                          {mat.item_description}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-2 border">
                    <input
                      value={row.allowedQty || ""}
                      readOnly
                      className="bg-transparent w-full outline-none text-white"
                    />
                  </td>

                  <td className="px-3 py-2 border">
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) =>
                        handleChange(i, "quantity", e.target.value)
                      }
                      className="bg-transparent w-full outline-none text-white"
                    />
                    {row.allowedQty &&
                      row.quantity &&
                      Number(row.quantity) > Number(row.allowedQty) && (
                        <p className="text-xs text-red-400 mt-1">
                          Exceeds allowed: {row.allowedQty}
                        </p>
                      )}
                  </td>

                  <td className="px-3 py-2 border">
                    <input
                      value={row.unit || ""}
                      readOnly
                      className="bg-transparent w-full outline-none text-white"
                    />
                  </td>

                  <td className="px-3 py-2 border text-center">
                    {materials.length > 1 && (
                      <button
                        onClick={() => handleDeleteRow(i)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={onclose}
              className="px-6 py-3 border border-gray-500 text-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-[#142e56] text-white rounded"
            >
              Save Purchase Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPurchaseRequestSite;

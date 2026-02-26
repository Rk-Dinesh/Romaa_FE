import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useAllowedQuantities, useCreateWorkOrderRequest, usePermittedVendors } from "../../hooks/useProjects";

/* ---------------- Validation Schema ---------------- */
const workOrderSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  siteDetails: yup.object().shape({
    siteName: yup.string().required("Site name required"),
    location: yup.string().required("Location required"),
    siteIncharge: yup.string().required("Site incharge required"),
  }),
  requiredByDate: yup.string().required("Required by date is required"),
});

const defaultValues = {
  title: "",
  description: "",
  siteDetails: { siteName: "", location: "", siteIncharge: "" },
  requiredByDate: "",
};

const CreateRequest = ({ onclose, onSuccess }) => {
  const tenderId = localStorage.getItem("tenderId");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(workOrderSchema),
    defaultValues,
  });

  // --- Fetch Data using TanStack Query ---
  const { data: vendors = [] } = usePermittedVendors(tenderId);
  const { data: availableItems = [] } = useAllowedQuantities(tenderId);
  const { mutateAsync: createRequest, isPending: loading } = useCreateWorkOrderRequest();

  // --- State ---
  const [materials, setMaterials] = useState([]);
  
  // Vendor Selection State
  const [selectedVendors, setSelectedVendors] = useState([{ vendorId: "", vendorName: "" }]);

  // Material Input State
  const [materialInput, setMaterialInput] = useState({
    materialName: "",
    quantity: "",
    unit: "",
    maxQuantity: 0 // To track limit
  });

  /* ---------------- Vendor Handlers ---------------- */
  const handleAddVendor = () => {
    setSelectedVendors([...selectedVendors, { vendorId: "", vendorName: "" }]);
  };

  const handleRemoveVendor = (index) => {
    if (selectedVendors.length === 1) return;
    setSelectedVendors(selectedVendors.filter((_, i) => i !== index));
  };

  const handleVendorChange = (index, field, value) => {
    const updated = [...selectedVendors];
    updated[index][field] = value;

    if (field === "vendorId") {
      const found = vendors.find(v => v.vendor_id === value);
      if (found) updated[index].vendorName = found.vendor_name;
    } else if (field === "vendorName") {
      const found = vendors.find(v => v.vendor_name === value);
      if (found) updated[index].vendorId = found.vendor_id;
    }

    setSelectedVendors(updated);
  };

  /* ---------------- Material Handlers (Enhanced) ---------------- */
  
  // Handle Material Selection from Dropdown
  const handleMaterialSelect = (e) => {
    const selectedName = e.target.value;
    const item = availableItems.find(i => i.item_description === selectedName);

    if (item) {
      setMaterialInput({
        materialName: item.item_description,
        quantity: "", // Reset quantity
        unit: item.unit,
        maxQuantity: item.ex_quantity // Set Limit
      });
    } else {
      // Reset if "Select" chosen
      setMaterialInput({ materialName: "", quantity: "", unit: "", maxQuantity: 0 });
    }
  };

  // Handle Quantity Change with Validation
  const handleQuantityChange = (e) => {
    const val = parseFloat(e.target.value);
    const max = materialInput.maxQuantity;

    if (val > max) {
      toast.warning(`Quantity cannot exceed available limit: ${max}`);
    }
    
    setMaterialInput({ ...materialInput, quantity: e.target.value });
  };

  const handleMaterialAdd = () => {
    const { materialName, quantity, unit, maxQuantity } = materialInput;
    
    if (!materialName || !quantity || !unit) {
      toast.warning("Please fill all material fields.");
      return;
    }

    if (parseFloat(quantity) > maxQuantity) {
        toast.error(`Quantity exceeds available limit (${maxQuantity} ${unit})`);
        return;
    }

    setMaterials((prev) => [...prev, materialInput]);
    
    // Reset input
    setMaterialInput({ materialName: "", quantity: "", unit: "", maxQuantity: 0 });
  };

  const handleMaterialDelete = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- Submit ---------------- */
  const onSubmit = async (data) => {
    if (materials.length === 0) {
      toast.warning("Please add at least one material.");
      return;
    }

    const validVendors = selectedVendors.filter(v => v.vendorId && v.vendorName);
    if (validVendors.length === 0) {
      toast.warning("Please select at least one valid vendor.");
      return;
    }

    const finalData = {
      ...data,
      projectId: tenderId,
      materialsRequired: materials.map(({ ...rest }) => rest), 
      permittedVendor: validVendors.map(v => ({
        vendorId: v.vendorId,
        vendorName: v.vendorName
      })), 
    };

    try {
      await createRequest(finalData); // Using TanStack Query mutation
      toast.success("Request created successfully!");
      reset();
      setMaterials([]);
      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create request.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Create Work Order Request
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Submit a new purchase request for approval
            </p>
          </div>
          <button
            onClick={onclose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          {/* SECTION 1: REQUEST DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Title</label>
              <input
                {...register("title")}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="E.g. Cement Procurement"
              />
              <p className="text-xs text-red-500 mt-1">{errors.title?.message}</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Required By Date</label>
              <input
                type="date"
                {...register("requiredByDate")}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-red-500 mt-1">{errors.requiredByDate?.message}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Description</label>
              <textarea
                rows={2}
                {...register("description")}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Brief details about the requirement..."
              />
              <p className="text-xs text-red-500 mt-1">{errors.description?.message}</p>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* SECTION 2: SITE DETAILS */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span> Site Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Site Name</label>
                <input
                  {...register("siteDetails.siteName")}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Site Name"
                />
                <p className="text-xs text-red-500 mt-1">{errors.siteDetails?.siteName?.message}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</label>
                <input
                  {...register("siteDetails.location")}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Location"
                />
                <p className="text-xs text-red-500 mt-1">{errors.siteDetails?.location?.message}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Site Incharge</label>
                <input
                  {...register("siteDetails.siteIncharge")}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Incharge Name"
                />
                <p className="text-xs text-red-500 mt-1">{errors.siteDetails?.siteIncharge?.message}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* SECTION 3: VENDOR SELECTION */}
          <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <span className="w-1 h-4 bg-green-500 rounded-full"></span> Select Vendors
                </h3>
                <button
                  type="button"
                  onClick={handleAddVendor}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  + Add Vendor
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Vendor ID</th>
                    <th className="px-4 py-3">Vendor Name</th>
                    <th className="px-4 py-3 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {selectedVendors.map((row, i) => (
                    <tr key={i} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <select
                          value={row.vendorId}
                          onChange={(e) => handleVendorChange(i, "vendorId", e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 outline-none text-gray-800 dark:text-gray-200 py-1 transition-colors"
                        >
                          <option value="" className="dark:bg-gray-800">Select ID</option>
                          {vendors.map((v) => (
                            <option key={v.vendor_id} value={v.vendor_id} className="dark:bg-gray-800">{v.vendor_id}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.vendorName}
                          onChange={(e) => handleVendorChange(i, "vendorName", e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 outline-none text-gray-800 dark:text-gray-200 py-1 transition-colors"
                        >
                          <option value="" className="dark:bg-gray-800">Select Name</option>
                          {vendors.map((v) => (
                            <option key={v.vendor_id} value={v.vendor_name} className="dark:bg-gray-800">{v.vendor_name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {selectedVendors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVendor(i)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <IoClose size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* SECTION 4: MATERIALS */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
              <span className="w-1 h-4 bg-purple-500 rounded-full"></span> Material Requirements
            </h3>
            
            {/* Material Input Row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Item Description</label>
                <select
                  value={materialInput.materialName}
                  onChange={handleMaterialSelect}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="" className="dark:bg-gray-800">Select Item</option>
                  {availableItems.map((item, idx) => (
                    <option key={idx} value={item.item_description} className="dark:bg-gray-800">
                      {item.item_description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                   Qty {materialInput.maxQuantity > 0 && <span className="text-blue-500">(Max: {materialInput.maxQuantity})</span>}
                </label>
                <input
                  type="number"
                  value={materialInput.quantity}
                  onChange={handleQuantityChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div className="w-24">
                <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                <input
                  value={materialInput.unit}
                  readOnly // Unit comes from API
                  className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-500 cursor-not-allowed outline-none"
                  placeholder="Unit"
                />
              </div>

              <button
                type="button"
                onClick={handleMaterialAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-10"
              >
                Add
              </button>
            </div>

            {/* Materials Table */}
            {materials.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2 w-12 text-center">#</th>
                      <th className="px-4 py-2">Material</th>
                      <th className="px-4 py-2 w-24">Qty</th>
                      <th className="px-4 py-2 w-24">Unit</th>
                      <th className="px-4 py-2 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {materials.map((mat, i) => (
                      <tr key={i} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-2 text-center text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{mat.materialName}</td>
                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{mat.quantity}</td>
                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{mat.unit}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleMaterialDelete(i)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
                          >
                            <IoClose size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onclose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md transition-all flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
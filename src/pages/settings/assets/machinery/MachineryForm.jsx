import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { API } from "../../../../constant";
import axios from "axios";

// --- 1. Updated Validation Schema ---
const schema = Yup.object().shape({
  // Identity
  assetId: Yup.string().required("Asset ID is required"),
  assetName: Yup.string().required("Asset Name is required"),
  assetCategory: Yup.string().required("Category is required"),
  assetType: Yup.string().required("Type is required"),

  // Technical
  serialNumber: Yup.string().required("Serial No. is required"),
  modelNumber: Yup.string().required("Model No. is required"),
  chassisNumber: Yup.string().required("Chassis No. is required"),
  engineNumber: Yup.string().required("Engine No. is required"),
  manufacturingYear: Yup.number()
    .typeError("Must be a year")
    .min(1900, "Invalid year")
    .max(new Date().getFullYear(), "Cannot be in future"),
  fuelType: Yup.string().required("Fuel Type is required"),
  fuelTankCapacity: Yup.number().typeError("Must be number").positive(),

  // Tracking
  trackingMode: Yup.string().required("Tracking Mode is required"),
  lastReading: Yup.number().typeError("Must be number").min(0).default(0),
  
  // Operational
  projectId: Yup.string().required("Project ID is required"),
  currentSite: Yup.string().required("Current Site is required"),

  // GPS (Conditional validation handled in UI logic usually, or loose here)
  gps: Yup.object().shape({
    isInstalled: Yup.boolean(),
    deviceId: Yup.string().when('isInstalled', {
      is: true,
      then: (schema) => schema.required("Device ID is required"),
    }),
    provider: Yup.string(),
  }),

  // Compliance (Dates)
  compliance: Yup.object().shape({
    insurancePolicyNo: Yup.string(),
    insuranceExpiry: Yup.date().nullable().typeError("Invalid Date"),
    fitnessCertExpiry: Yup.date().nullable().typeError("Invalid Date"),
    pollutionCertExpiry: Yup.date().nullable().typeError("Invalid Date"),
    roadTaxExpiry: Yup.date().nullable().typeError("Invalid Date"),
  }),

  // Financials
  purchaseCost: Yup.number().typeError("Must be a number").required("Required"),
  purchaseDate: Yup.date().required("Purchase Date is required"),
  supplierName: Yup.string(),
  invoiceNumber: Yup.string(),
});

const Machinery = ({ onclose }) => {
  const [gpsEnabled, setGpsEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      gps: { isInstalled: false },
      trackingMode: "HOURS",
      fuelType: "Diesel",
      assetCategory: "Heavy Earthmover"
    }
  });

  // Watch GPS toggle to show/hide fields
  const isGpsInstalled = watch("gps.isInstalled");

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mt-1 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500";
  const labelClass = "font-medium text-xs text-gray-700 dark:text-gray-300";
  const errorClass = "text-red-500 text-[10px] mt-0.5";
  const sectionHeaderClass = "col-span-full text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mt-4 mb-2";

  const handleCreateAsset = async (formData) => {
    try {
      // Show loading toast
    

      // Prepare Payload (Ensure types match Schema)
      const payload = {
        ...formData,
        // Convert Number fields explicitly if needed
        manufacturingYear: Number(formData.manufacturingYear),
        fuelTankCapacity: Number(formData.fuelTankCapacity),
        purchaseCost: Number(formData.purchaseCost),
        lastReading: Number(formData.lastReading || 0),
        
        // Handle GPS Object Structure
        gps: {
          isInstalled: formData.gps?.isInstalled || false,
          deviceId: formData.gps?.deviceId || "",
          provider: formData.gps?.provider || ""
        },
        
        // Handle Dates (Ensure valid Date objects or ISO strings)
        compliance: {
          insurancePolicyNo: formData.compliance?.insurancePolicyNo,
          insuranceExpiry: formData.compliance?.insuranceExpiry || null,
          fitnessCertExpiry: formData.compliance?.fitnessCertExpiry || null,
          pollutionCertExpiry: formData.compliance?.pollutionCertExpiry || null,
          roadTaxExpiry: formData.compliance?.roadTaxExpiry || null,
        }
      };

      // API Call
      const response = await axios.post(`${API}/machineryasset/createasset`,payload );

      if (response.status) {
        toast.success("Asset created successfully!" , { toastId });
        onclose(); // Close Modal
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to create asset");
    }
  };

  return (
    <div className="font-roboto-flex fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/30 z-50 overflow-y-auto py-10">
      <div className="dark:bg-gray-900 bg-white rounded-xl shadow-2xl w-[900px] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Add New Machinery Asset</h2>
          <button onClick={onclose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <IoClose className="size-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleCreateAsset)} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* --- 1. Basic Identity --- */}
          <div className={sectionHeaderClass}>1. Basic Identity & Location</div>
          
          <div>
            <label className={labelClass}>Asset ID *</label>
            <input {...register("assetId")} placeholder="e.g. EX-01" className={inputClass} />
            <p className={errorClass}>{errors.assetId?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Asset Name *</label>
            <input {...register("assetName")} placeholder="e.g. Hitachi Zaxis" className={inputClass} />
            <p className={errorClass}>{errors.assetName?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <select {...register("assetCategory")} className={inputClass}>
              <option value="Heavy Earthmover">Heavy Earthmover</option>
              <option value="Transport Vehicle">Transport Vehicle</option>
              <option value="Stationary Equipment">Stationary Equipment</option>
              <option value="Lifting">Lifting</option>
            </select>
            <p className={errorClass}>{errors.assetCategory?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Asset Type *</label>
            <input {...register("assetType")} placeholder="e.g. Excavator" className={inputClass} />
            <p className={errorClass}>{errors.assetType?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Project ID *</label>
            <input {...register("projectId")} placeholder="Project Code" className={inputClass} />
            <p className={errorClass}>{errors.projectId?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Current Site *</label>
            <input {...register("currentSite")} placeholder="Location Name" className={inputClass} />
            <p className={errorClass}>{errors.currentSite?.message}</p>
          </div>

          {/* --- 2. Technical Specifications --- */}
          <div className={sectionHeaderClass}>2. Technical Specifications</div>

          <div>
            <label className={labelClass}>Serial Number *</label>
            <input {...register("serialNumber")} className={inputClass} />
            <p className={errorClass}>{errors.serialNumber?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Model Number *</label>
            <input {...register("modelNumber")} className={inputClass} />
            <p className={errorClass}>{errors.modelNumber?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Chassis Number *</label>
            <input {...register("chassisNumber")} className={inputClass} />
            <p className={errorClass}>{errors.chassisNumber?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Engine Number *</label>
            <input {...register("engineNumber")} className={inputClass} />
            <p className={errorClass}>{errors.engineNumber?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Mfg Year</label>
            <input type="number" {...register("manufacturingYear")} className={inputClass} />
            <p className={errorClass}>{errors.manufacturingYear?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Fuel Type</label>
            <select {...register("fuelType")} className={inputClass}>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Tank Capacity (L)</label>
            <input type="number" {...register("fuelTankCapacity")} className={inputClass} />
          </div>

          {/* --- 3. Tracking & GPS --- */}
          <div className={sectionHeaderClass}>3. Tracking & GPS</div>

          <div>
            <label className={labelClass}>Tracking Mode</label>
            <select {...register("trackingMode")} className={inputClass}>
              <option value="HOURS">Hours (HMR)</option>
              <option value="KILOMETERS">Kilometers (Odometer)</option>
              <option value="UNITS">Units (Production)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Initial Reading</label>
            <input type="number" {...register("lastReading")} className={inputClass} />
          </div>

          <div className="flex items-center mt-6">
            <input 
              type="checkbox" 
              id="gpsCheck"
              {...register("gps.isInstalled")} 
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="gpsCheck" className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">GPS Installed?</label>
          </div>

          {isGpsInstalled && (
            <>
              <div>
                <label className={labelClass}>GPS Device ID</label>
                <input {...register("gps.deviceId")} className={inputClass} />
                <p className={errorClass}>{errors.gps?.deviceId?.message}</p>
              </div>
              <div>
                <label className={labelClass}>GPS Provider</label>
                <input {...register("gps.provider")} className={inputClass} />
              </div>
            </>
          )}

          {/* --- 4. Compliance (Dates) --- */}
          <div className={sectionHeaderClass}>4. Compliance & Expiry Dates</div>

          <div>
            <label className={labelClass}>Insurance Policy No</label>
            <input {...register("compliance.insurancePolicyNo")} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Insurance Expiry</label>
            <input type="date" {...register("compliance.insuranceExpiry")} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Fitness Cert (FC) Expiry</label>
            <input type="date" {...register("compliance.fitnessCertExpiry")} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Pollution (PUC) Expiry</label>
            <input type="date" {...register("compliance.pollutionCertExpiry")} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Road Tax Expiry</label>
            <input type="date" {...register("compliance.roadTaxExpiry")} className={inputClass} />
          </div>

          {/* --- 5. Financials --- */}
          <div className={sectionHeaderClass}>5. Financials</div>

          <div>
            <label className={labelClass}>Purchase Date *</label>
            <input type="date" {...register("purchaseDate")} className={inputClass} />
            <p className={errorClass}>{errors.purchaseDate?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Purchase Cost *</label>
            <input type="number" {...register("purchaseCost")} className={inputClass} />
            <p className={errorClass}>{errors.purchaseCost?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Supplier Name</label>
            <input {...register("supplierName")} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Invoice No</label>
            <input {...register("invoiceNumber")} className={inputClass} />
          </div>

        </form>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button"
            onClick={onclose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(handleCreateAsset)}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 shadow-md"
          >
            Save Asset
          </button>
        </div>

      </div>
    </div>
  );
};

export default Machinery;


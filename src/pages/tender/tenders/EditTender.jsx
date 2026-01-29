import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";
import { InputFieldTender } from "../../../components/InputFieldTender";

// --- VALIDATION SCHEMA (Same as AddTender) ---
const schema = yup.object().shape({
  tender_name: yup.string().required("Tender Name is required"),
  tender_start_date: yup.date().required("Published Date is required"),
  tender_type: yup.string().required("Tender Type is required"),
  client_id: yup.string().required("Client ID is required"),
  client_name: yup.string().required("Client Name is required"),
  tender_contact_person: yup.string().required("Contact Person is required"),
  tender_contact_phone: yup.string().matches(/^[0-9]{10}$/, "10 digits required").required("Phone is required"),
  tender_contact_email: yup.string().email("Invalid email").required("Email is required"),
  tender_location: yup.object({
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    country: yup.string().required("Country is required"),
    pincode: yup.string().matches(/^[0-9]{6}$/, "6 digits required").required("Pincode is required"),
  }),
  tender_duration: yup.string().required("Duration is required"),
  consider_completion_duration: yup.string().required("Completion Duration is required"),
  tender_value: yup.number().typeError("Must be a number").positive().required("Cost is required"),
  tender_end_date: yup.date().required("Due Date is required"),
  emd: yup.object({
    emd_amount: yup.number().typeError("Must be a number").required("EMD is required"),
    emd_validity: yup.date().required("Expiry Date is required"),
  }),
  tender_description: yup.string().max(500).required("Description is required"),
  site_location: yup.object({
    latitude: yup.number().typeError("Num required").required("Lat required"),
    longitude: yup.number().typeError("Num required").required("Lng required"),
  }),
});

// --- TEXT-ONLY HEADER ---
const SectionHeader = ({ title }) => (
  <div className="col-span-2 mt-4 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
    <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
      {title}
    </h3>
  </div>
);

// Helper to format date for input (YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

const EditTender = ({ item, onclose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);

  // 1. Fetch Clients (Needed for Dropdowns & Auto-fill)
  useEffect(() => {
    axios.get(`${API}/client/getallclients`)
      .then((res) => setClients(res.data.data))
      .catch((err) => console.error("Error fetching clients", err));
  }, []);

  // 2. Initialize Form with Default Values from 'item'
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tender_name: item.tender_name,
      tender_type: item.tender_type,
      tender_value: item.tender_value,
      tender_description: item.tender_description,
      
      client_id: item.client_id,
      client_name: item.client_name,
      tender_contact_person: item.tender_contact_person,
      tender_contact_phone: item.tender_contact_phone,
      tender_contact_email: item.tender_contact_email,

      // Dates
      tender_start_date: formatDate(item.tender_start_date),
      tender_end_date: formatDate(item.tender_end_date),
      
      tender_duration: item.tender_duration,
      consider_completion_duration: item.consider_completion_duration,

      // Nested Objects
      tender_location: {
        city: item.tender_location?.city,
        state: item.tender_location?.state,
        country: item.tender_location?.country,
        pincode: item.tender_location?.pincode,
      },
      emd: {
        emd_amount: item.emd?.emd_amount,
        emd_validity: formatDate(item.emd?.emd_validity),
      },
      site_location: {
        latitude: item.site_location?.latitude,
        longitude: item.site_location?.longitude,
      }
    }
  });

  // 3. Client Auto-fill Logic (Same as AddTender)
  const selectedClientId = watch("client_id");
  const selectedClientName = watch("client_name");

  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      const found = clients.find((c) => c.client_id === selectedClientId);
      if (found && found.client_name !== selectedClientName) {
        setValue("client_name", found.client_name, { shouldValidate: true });
      }
    }
  }, [selectedClientId, clients, setValue]);

  useEffect(() => {
    if (selectedClientName && clients.length > 0) {
      const found = clients.find((c) => c.client_name === selectedClientName);
      if (found && found.client_id !== selectedClientId) {
        setValue("client_id", found.client_id, { shouldValidate: true });
      }
    }
  }, [selectedClientName, clients, setValue]);

  // 4. Submit Handler
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axios.put(`${API}/tender/updatetender/${item.tender_id}`, data);
      toast.success("Tender updated successfully ✅");
      if (onUpdated) onUpdated();
      onclose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update tender");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">
      
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
        
        {/* --- Header --- */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Edit Tender Details</h1>
            <p className="text-xs text-gray-500 mt-0.5">Update project information</p>
          </div>
          <button onClick={onclose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        {/* --- Form Body --- */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <form id="editTenderForm" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-8 gap-y-4">
            
            {/* 1. Project Info */}
            <SectionHeader title="Project Details" />
            
            <div className="col-span-2">
              <InputFieldTender label="Tender Name" name="tender_name" placeholder="Enter tender name" register={register} errors={errors} />
            </div>
            
            <div className="col-span-1">
              <InputFieldTender 
                label="Tender Type" 
                type="select" 
                name="tender_type" 
                register={register} 
                errors={errors}
                options={[
                  { value: "item rate contarct", label: "Item Rate" },
                  { value: "percentage", label: "Percentage" },
                  { value: "lumpsum", label: "Lumpsum" },
                ]}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender label="Estimated Value (₹)" name="tender_value" type="number" register={register} errors={errors} />
            </div>

            <div className="col-span-2">
               <InputFieldTender label="Description" type="textarea" name="tender_description" placeholder="Scope of work..." register={register} errors={errors} />
            </div>

            {/* 2. Client Info */}
            <SectionHeader title="Client Information" />
            
            <div className="col-span-1">
              <InputFieldTender 
                label="Client ID" 
                type="select" 
                name="client_id" 
                register={register} 
                errors={errors}
                options={clients.map(c => ({ value: c.client_id, label: c.client_id }))}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender 
                label="Client Name" 
                type="select" 
                name="client_name" 
                register={register} 
                errors={errors}
                options={clients.map(c => ({ value: c.client_name, label: c.client_name }))}
              />
            </div>

            <div className="col-span-1">
              <InputFieldTender label="Contact Person" name="tender_contact_person" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
              <InputFieldTender label="Phone Number" name="tender_contact_phone" type="number" register={register} errors={errors} />
            </div>
            <div className="col-span-2">
              <InputFieldTender label="Email Address" name="tender_contact_email" type="email" register={register} errors={errors} />
            </div>

            {/* 3. Timeline & Finance */}
            <SectionHeader title="Schedule & EMD" />

            <div className="col-span-1">
               <InputFieldTender label="Published Date" name="tender_start_date" type="date" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="Bid Submission Due" name="tender_end_date" type="date" register={register} errors={errors} />
            </div>

            <div className="col-span-1">
               <InputFieldTender label="Duration" name="tender_duration" placeholder="e.g. 12 Months" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="Completion Target" name="consider_completion_duration" placeholder="e.g. 10 Months" register={register} errors={errors} />
            </div>

            <div className="col-span-1">
               <InputFieldTender label="EMD Amount (₹)" name="emd.emd_amount" type="number" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="EMD Validity" name="emd.emd_validity" type="date" register={register} errors={errors} />
            </div>

            {/* 4. Location */}
            <SectionHeader title="Site Location" />

            <div className="col-span-1">
               <InputFieldTender label="City" name="tender_location.city" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="State" name="tender_location.state" register={register} errors={errors} />
            </div>

            <div className="col-span-1">
               <InputFieldTender label="Pincode" name="tender_location.pincode" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="Country" name="tender_location.country" register={register} errors={errors} />
            </div>

            <div className="col-span-1">
               <InputFieldTender label="Latitude" name="site_location.latitude" type="number" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="Longitude" name="site_location.longitude" type="number" register={register} errors={errors} />
            </div>

          </form>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onclose}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editTenderForm"
            disabled={loading}
            className="px-8 py-2 text-sm font-bold text-white bg-darkest-blue hover:bg-blue-900 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : (
              <>
                 <IoSaveOutline size={16} /> Update Tender
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditTender;
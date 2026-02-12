import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import { InputFieldTender } from "../../../components/InputFieldTender";
import { useEditClient } from "./hooks/useClients";


// --- VALIDATION SCHEMA (Unchanged) ---
const schema = yup.object().shape({
  client_name: yup.string().required("Client Name is required"),
  pan_no: yup.string().required("PAN Number is required"),
  cin_no: yup.string().required("CIN Number is required"),
  gstin: yup.string().required("GSTIN is required"),
  contact_phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone Number is required"),
  contact_email: yup
    .string()
    .email("Invalid Email")
    .required("Email ID is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  country: yup.string().required("Country is required"),
  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
});

// --- SECTION HEADER ---
const SectionHeader = ({ title }) => (
  <div className="col-span-2 mt-4 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
    <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
      {title}
    </h3>
  </div>
);

const EditClients = ({ item, onclose, onUpdated }) => {
  
  // 1. Setup Mutation Hook
  const { mutate: updateClient, isPending } = useEditClient({
    onSuccess: onUpdated,
    onClose: onclose
  });

  // 2. Initialize Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      client_name: item.client_name,
      pan_no: item.pan_no,
      cin_no: item.cin_no,
      gstin: item.gstin,
      contact_phone: item.contact_phone,
      contact_email: item.contact_email,
      // Map nested address object to flat form fields
      city: item.address?.city,
      state: item.address?.state,
      country: item.address?.country,
      pincode: item.address?.pincode,
    },
  });

  // 3. Submit Handler
  const onSubmit = (data) => {
    const payload = {
      client_name: data.client_name,
      pan_no: data.pan_no,
      cin_no: data.cin_no,
      gstin: data.gstin,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      address: {
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
      },
    };

    // Trigger the mutation
    updateClient({ id: item.client_id, payload });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">
      
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
        
        {/* --- Header --- */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Edit Client Details</h1>
            <p className="text-xs text-gray-500 mt-0.5">Update business information</p>
          </div>
          <button onClick={onclose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        {/* --- Form Body --- */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <form id="editClientForm" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-8 gap-y-4">
            
            {/* 1. Corporate Identity */}
            <SectionHeader title="Corporate Identity" />
            
            <div className="col-span-2">
              <InputFieldTender label="Client Name" name="client_name" placeholder="Enter full client name" register={register} errors={errors} />
            </div>
            
            <div className="col-span-1">
               <InputFieldTender label="PAN Number" name="pan_no" placeholder="Enter PAN" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="GST Number" name="gstin" placeholder="Enter GSTIN" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="CIN Number" name="cin_no" placeholder="Enter CIN" register={register} errors={errors} />
            </div>

            {/* 2. Contact Details */}
            <SectionHeader title="Contact Information" />

            <div className="col-span-1">
               <InputFieldTender label="Phone Number" name="contact_phone" type="number" placeholder="10-digit mobile" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="Email Address" name="contact_email" type="email" placeholder="official@company.com" register={register} errors={errors} />
            </div>

            {/* 3. Address Details */}
            <SectionHeader title="Billing Address" />

            <div className="col-span-1">
               <InputFieldTender label="City" name="city" placeholder="Enter city" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="State" name="state" placeholder="Enter state" register={register} errors={errors} />
            </div>

            <div className="col-span-1">
               <InputFieldTender label="Pincode" name="pincode" placeholder="6-digit pincode" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
               <InputFieldTender label="Country" name="country" placeholder="Enter country" register={register} errors={errors} />
            </div>

          </form>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onclose}
            disabled={isPending}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editClientForm"
            disabled={isPending}
            className="px-8 py-2 text-sm font-bold text-white bg-darkest-blue hover:bg-blue-900 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? "Updating..." : (
              <>
                 <IoSaveOutline size={16} /> Update Client
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditClients;
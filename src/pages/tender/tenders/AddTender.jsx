import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import { InputFieldTender } from "../../../components/InputFieldTender";
import { useAddTender } from "./hooks/useTenders";
import { useAllClients } from "../clients/hooks/useClients";


// --- VALIDATION SCHEMA (Unchanged) ---
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

const SectionHeader = ({ title }) => (
  <div className="col-span-2 mt-4 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
    <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
      {title}
    </h3>
  </div>
);

const AddTender = ({ onclose, onSuccess }) => {
  // 1. Fetch Clients (Cached)
  const { data: clients = [] } = useAllClients();

  // 2. Setup Mutation
  const { mutate: addTender, isPending } = useAddTender({ 
    onSuccess, 
    onClose: onclose 
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // 3. Auto-fill Logic (Using cached clients)
  const selectedClientId = watch("client_id");
  const selectedClientName = watch("client_name");

  useEffect(() => {
    if (selectedClientId) {
      const found = clients.find((c) => c.client_id === selectedClientId);
      if (found) setValue("client_name", found.client_name, { shouldValidate: true });
    }
  }, [selectedClientId, setValue, clients]);

  useEffect(() => {
    if (selectedClientName) {
      const found = clients.find((c) => c.client_name === selectedClientName);
      if (found) setValue("client_id", found.client_id, { shouldValidate: true });
    }
  }, [selectedClientName, setValue, clients]);

  const onSubmit = (data) => {
    addTender(data); // Trigger the mutation
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">New Tender Entry</h1>
          <button onClick={onclose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <form id="tenderForm" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-8 gap-y-4">
            
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

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onclose}
            disabled={isPending}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="tenderForm"
            disabled={isPending}
            className="px-8 py-2 text-sm font-bold text-white bg-darkest-blue hover:bg-blue-900 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : (
              <>
                 <IoSaveOutline size={16} /> Save Tender
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddTender;
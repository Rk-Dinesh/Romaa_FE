import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { API } from "../../../constant";
import { InputField } from "../../../components/InputField";
import { toast } from "react-toastify";

// ✅ Validation Schema (matches AddTender)
const schema = yup.object().shape({
  tender_name: yup.string().required("Tender Name is required"),
  tender_start_date: yup.date().required("Published Date is required"),
  tender_type: yup
    .string()
    .oneOf(["item rate contarct", "percentage", "lumpsum"], "Invalid Tender Type")
    .required("Tender Type is required"),
  client_id: yup.string().required("Client ID is required"),
  client_name: yup.string().required("Client Name is required"),
  tender_contact_person: yup.string().required("Contact Person is required"),
  tender_contact_phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone Number must be exactly 10 digits")
    .required("Phone Number is required"),
  tender_contact_email: yup
    .string()
    .email("Invalid email")
    .required("Contact Email is required"),

  // Nested location schema
  tender_location: yup.object({
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    country: yup.string().required("Country is required"),
    pincode: yup
      .string()
      .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
      .required("Pincode is required"),
  }),

  tender_duration: yup.string().required("Project Duration is required"),
  tender_value: yup
    .number()
    .typeError("Proposal Cost must be a number")
    .positive("Proposal Cost must be a positive number")
    .required("Proposal Cost is required"),
  tender_end_date: yup.date().required("Due Date is required"),

  // Nested EMD schema
  emd: yup.object({
    emd_amount: yup
      .number()
      .typeError("EMD must be a number")
      .required("EMD is required"),
    emd_validity: yup.date().required("EMD Expiry Date is required"),
  }),

  tender_description: yup
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .required("Description is required"),
});

const EditTender = ({ item, onclose, onUpdated }) => {
  const [loading, setLoading] = useState(false);

  // Pre-fill values from item
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tender_name: item.tender_name,
      tender_start_date: item.tender_start_date
        ? new Date(item.tender_start_date).toISOString().split("T")[0]
        : "",
      tender_type: item.tender_type,
      client_id: item.client_id,
      client_name: item.client_name,
      tender_contact_person: item.tender_contact_person,
      tender_contact_phone: item.tender_contact_phone,
      tender_contact_email: item.tender_contact_email,
      tender_location: {
        city: item.tender_location?.city,
        state: item.tender_location?.state,
        country: item.tender_location?.country,
        pincode: item.tender_location?.pincode,
      },
      tender_duration: item.tender_duration,
      tender_value: item.tender_value,
      tender_end_date: item.tender_end_date
        ? new Date(item.tender_end_date).toISOString().split("T")[0]
        : "",
      emd: {
        emd_amount: item.emd?.emd_amount,
        emd_validity: item.emd?.emd_validity
          ? new Date(item.emd.emd_validity).toISOString().split("T")[0]
          : "",
      },
      tender_description: item.tender_description,
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axios.put(`${API}/tender/updatetender/${item.tender_id}`, data);
      if (onUpdated) onUpdated();
      onclose();
      toast.success("Tender updated successfully ✅");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update tender. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-20"
      onClick={onclose}
    >
      <div
        className="mx-2 shadow-lg py-2 dark:bg-overall_bg-dark bg-white rounded-md lg:w-[900px] md:w-[600px] w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onclose}
          disabled={loading}
          className="place-self-end cursor-pointer dark:bg-overall_bg-dark bg-white rounded-full -mx-2 -my-3"
        >
          <IoClose className="size-[24px]" />
        </button>

        <h1 className="text-center font-medium text-2xl py-2">Edit Tender</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-4 px-6 py-6">
            {/* Left column */}
            <div className="space-y-4">
              <InputField label="Tender Name" name="tender_name" register={register} errors={errors} placeholder="Enter tender name" />
              <InputField label="Tender Published Date" name="tender_start_date" type="date" register={register} errors={errors} />
              <InputField
                label="Tender Type"
                type="select"
                name="tender_type"
                register={register}
                errors={errors}
                options={[
                  { value: "item rate contarct", label: "Item Rate contract" },
                  { value: "percentage", label: "Percentage" },
                  { value: "lumpsum", label: "Lumpsum" },
                ]}
              />
              <InputField label="Client ID" name="client_id" register={register} errors={errors} placeholder="Enter client ID" />
              <InputField label="Client Name" name="client_name" register={register} errors={errors} placeholder="Enter client name" />
              <InputField label="Contact Person" name="tender_contact_person" register={register} errors={errors} placeholder="Enter contact person" />
              <InputField label="Phone Number" name="tender_contact_phone" register={register} errors={errors} placeholder="Enter phone number" type="number"/>
              <InputField label="Contact Email" name="tender_contact_email" type="email" register={register} errors={errors} placeholder="Enter contact email" />
              <InputField label="City" name="tender_location.city" register={register} errors={errors} placeholder="Enter city" />
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <InputField label="State" name="tender_location.state" register={register} errors={errors} placeholder="Enter state" />
              <InputField label="Country" name="tender_location.country" register={register} errors={errors} placeholder="Enter country" />
              <InputField label="Pincode" name="tender_location.pincode" register={register} errors={errors} placeholder="Enter pincode" />
              <InputField label="Project Duration" name="tender_duration" register={register} errors={errors} placeholder="Enter duration" />
              <InputField label="Tender Value" name="tender_value" register={register} errors={errors} placeholder="Enter cost" type="number"/>
              <InputField label="Due Date" name="tender_end_date" type="date" register={register} errors={errors} />
              <InputField label="EMD Value" name="emd.emd_amount" register={register} errors={errors} placeholder="Enter EMD Value" type="number"/>
              <InputField label="EMD Expiry Date" name="emd.emd_validity" type="date" register={register} errors={errors} />
              <InputField label="Description" type="textarea" name="tender_description" register={register} errors={errors} placeholder="Enter description" />
            </div>
          </div>

          {/* Actions */}
          <div className="mx-5 text-xs flex lg:justify-end gap-2 mb-4">
            <button
              type="button"
              onClick={onclose}
              disabled={loading}
              className="cursor-pointer border border-darkest-blue dark:border-white px-6 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`cursor-pointer px-6 text-white rounded ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-darkest-blue"}`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTender;

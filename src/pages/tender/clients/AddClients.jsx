import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-toastify";
import { InputField } from "../../../components/InputField";
import { API } from "../../../constant";

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

const AddClients = ({ onclose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [saving, setSaving] = useState(false);

  const onSubmit = async (data) => {
    const payload = {
      client_name: data.client_name,
      pan_no: data.pan_no,
      cin_no: data.cin_no,
      gstin: data.gstin,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      address: {
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
      },
      status: "ACTIVE",
      created_by_user: "admin",
    };

    setSaving(true);
    try {
      const res = await axios.post(
       `${API}/client/addclient`,
        payload
      );
      toast.success("Client added successfully ✅");
      reset();
      if (onSuccess) onSuccess(); 
      onclose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add client ❌");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50  drop-shadow-lg z-20">
      <div className="mx-2 shadow-lg py-2 dark:bg-overall_bg-dark bg-white rounded-md lg:w-[900px] md:w-[500px] w-96">
        <div className="grid">
          <button
            onClick={onclose}
            className="cursor-pointer place-self-end dark:bg-overall_bg-dark bg-white rounded-full lg:-mx-4 md:-mx-4 -mx-2 lg:-my-6 md:-my-5 -my-3 lg:shadow-md md:shadow-md shadow-none lg:py-2.5 md:py-2.5 py-0 lg:px-2.5 md:px-2.5 px-0 "
          >
            <IoClose className="size-[24px]" />
          </button>
          <h1 className="text-center font-medium text-2xl py-2">Add Client</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-4 px-6 py-6">
              <div className="space-y-4">
                <InputField label="Client Name" name="client_name" register={register} errors={errors} placeholder="Enter client name" />
                <InputField label="PAN no" name="pan_no" register={register} errors={errors} placeholder="Enter pan.no" />
                <InputField label="CIN no" name="cin_no" register={register} errors={errors} placeholder="Enter cin.no" />
                <InputField label="GST" name="gstin" register={register} errors={errors} placeholder="Enter gst.no" />
                <InputField label="Phone number" name="contact_phone" type="number" register={register} errors={errors} placeholder="Enter phone.no" />
                <InputField label="Email" name="contact_email" type="email" register={register} errors={errors} placeholder="Enter email ID" />
              </div>
              <div className="space-y-4">
                <InputField label="City" name="city" register={register} errors={errors} placeholder="Enter city" />
                <InputField label="State" name="state" register={register} errors={errors} placeholder="Enter state" />
                <InputField label="Country" name="country" register={register} errors={errors} placeholder="Enter country" />
                <InputField label="Pincode" name="pincode" register={register} errors={errors} placeholder="Enter pincode" />
              </div>
            </div>
            <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={onclose}
                className="cursor-pointer border dark:border-white border-darkest-blue dark:text-white text-darkest-blue px-6 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer px-6 bg-darkest-blue text-white rounded"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClients;

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { API } from "../../../constant";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  client_name: yup.string().required("Client Name is required"),
  pan_no: yup.string().required("PAN Number is required"),
  cin_no: yup.string().required("CIN Number is required"),
  gstin: yup.string().required("GSTIN is required"),
  contact_phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone Number is required"),
  contact_email: yup.string().email("Invalid email").required("Email ID is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  country: yup.string().required("Country is required"),
  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
});

const InputField = ({ label, name, register, errors, placeholder, type = "text" }) => (
  <div className="grid grid-cols-8 items-center gap-4">
    <label className="col-span-3 text-sm font-medium">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      {...register(name)}
      className={`col-span-5 border dark:border-border-dark-grey border-input-bordergrey rounded-lg outline-none py-2 px-2 placeholder:text-xs placeholder:font-light placeholder-black dark:placeholder-white ${
        errors[name] ? "border-red-500" : ""
      }`}
    />
    {errors[name] && (
      <p className="text-red-500 text-xs col-span-8 text-end">{errors[name].message}</p>
    )}
  </div>
);

const EditClients = ({ item, onclose, onUpdated }) => {
   const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      client_name: item.client_name,
      pan_no: item.pan_no,
      cin_no: item.cin_no,
      gstin: item.gstin,
      contact_phone: item.contact_phone,
      contact_email: item.contact_email,
      city: item.address?.city,
      state: item.address?.state,
      country: item.address?.country,
      pincode: item.address?.pincode,
    },
  });

  const onSubmit = async (data) => {
    try {
       setLoading(true);
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

      await axios.put(`${API}/client/updateclient/${item.client_id}`, payload);
     
      if (onUpdated) onUpdated(); 
      onclose();
      toast.success("Client updated successfully ✅");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update client. Please try again.");
    }finally {
      setLoading(false); 
    }
  };

  return (
    <div
      className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-20"
      onClick={onclose} 
    >

      <div
        className="mx-2 shadow-lg py-2 dark:bg-overall_bg-dark bg-white rounded-md lg:w-[900px] md:w-[500px] w-96"
        onClick={(e) => e.stopPropagation()} 
      >

        <p
          onClick={onclose}
          className="place-self-end cursor-pointer dark:bg-overall_bg-dark bg-white rounded-full lg:-mx-4 md:-mx-4 -mx-2 lg:-my-6 md:-my-5 -my-3 lg:shadow-md md:shadow-md shadow-none lg:py-2.5 md:py-2.5 py-0 lg:px-2.5 md:px-2.5 px-0"
        >
          <IoClose className="size-[24px]" />
        </p>

        <h1 className="text-center font-medium text-2xl py-2">Edit Client</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-4 px-6 py-6">
            <div className="space-y-4">
              <InputField label="Client Name" name="client_name" register={register} errors={errors} placeholder="Enter client name" />
              <InputField label="PAN no" name="pan_no" register={register} errors={errors} placeholder="Enter PAN no" />
              <InputField label="CIN no" name="cin_no" register={register} errors={errors} placeholder="Enter CIN no" />
              <InputField label="GSTIN" name="gstin" register={register} errors={errors} placeholder="Enter GSTIN" />
              <InputField label="Phone number" name="contact_phone" type="text" register={register} errors={errors} placeholder="Enter phone number" />
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
              className="cursor-pointer border border-darkest-blue dark:border-white dark:text-white text-darkest-blue px-6 py-2 rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading} 
              className={`cursor-pointer px-6 rounded text-white ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-darkest-blue"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClients;

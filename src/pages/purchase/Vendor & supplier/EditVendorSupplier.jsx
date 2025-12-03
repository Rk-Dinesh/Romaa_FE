import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";
import { API } from "../../../constant";

// ✅ Validation Schema
const schema = yup.object().shape({
  type: yup
    .string()
    .oneOf(
      [
        "Cement Supplier",
        "Steel Supplier",
        "Sand Supplier",
        "Aggregate Supplier",
        "Bricks Supplier",
        "Electrical Contractor",
        "Plumbing Contractor",
        "Paint Supplier",
        "Tiles Supplier",
        "Wood Supplier",
      ],
      "Select a valid Vendor Type"
    )
    .required("Vendor Type is required"),
  company_name: yup.string().required("Company name is required"),
  contact_person: yup.string().required("Contact Person is required"),
  contact_phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Contact Phone is required"),
  contact_email: yup.string().email("Invalid email").required("Contact Email is required"),
  address_street: yup.string().required("Street is required"),
  address_city: yup.string().required("City is required"),
  address_state: yup.string().required("State is required"),
  address_country: yup.string().required("Country is required"),
  address_pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
  gstin: yup.string().required("GSTIN is required"),
  pan_no: yup.string().required("PAN Number is required"),
  account_name: yup.string().required("Account Name is required"),
  account_number: yup.string().required("Account Number is required"),
  bank_name: yup.string().required("Bank Name is required"),
  ifsc_code: yup.string().required("IFSC Code is required"),
  branch: yup.string().required("Branch is required"),
  status: yup.string().required("Status is required"),
});

const EditVendorSupplier = ({ onclose, onUpdated, item }) => {
  const [loading, setLoading] = useState(false);

  // Pre-fill values from item
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: item.type,
      company_name: item.company_name,
      contact_person: item.contact_person,
      contact_phone: item.contact_phone,
      contact_email: item.contact_email,
      address_street: item.address?.street,
      address_city: item.address?.city,
      address_state: item.address?.state,
      address_country: item.address?.country,
      address_pincode: item.address?.pincode,
      gstin: item.gstin,
      pan_no: item.pan_no,
      account_name: item.bank_details?.account_name,
      account_number: item.bank_details?.account_number,
      bank_name: item.bank_details?.bank_name,
      ifsc_code: item.bank_details?.ifsc_code,
      branch: item.bank_details?.branch,
      status: item.status,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        type: data.type,
        company_name: data.company_name,
        contact_person: data.contact_person,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          country: data.address_country,
          pincode: data.address_pincode,
        },
        gstin: data.gstin,
        pan_no: data.pan_no,
        bank_details: {
          account_name: data.account_name,
          account_number: data.account_number,
          bank_name: data.bank_name,
          ifsc_code: data.ifsc_code,
          branch: data.branch,
        },
        status: data.status,
      };

      await axios.put(`${API}/vendor/updatevendor/${item.vendor_id}`, payload);

      if (onUpdated) onUpdated(); // refresh vendor list
      onclose();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update vendor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Vendor"
      widthClassName="lg:w-[800px] md:w-[700px] w-96"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 px-6 py-6">
            {/* Vendor Type */}
            <InputField
              label="Vendor Type"
              name="type"
              type="select"
              register={register}
              errors={errors}
              options={[
                { label: "Cement Supplier", value: "Cement Supplier" },
                { label: "Steel Supplier", value: "Steel Supplier" },
                { label: "Sand Supplier", value: "Sand Supplier" },
                { label: "Aggregate Supplier", value: "Aggregate Supplier" },
                { label: "Bricks Supplier", value: "Bricks Supplier" },
                { label: "Electrical Contractor", value: "Electrical Contractor" },
                { label: "Plumbing Contractor", value: "Plumbing Contractor" },
                { label: "Paint Supplier", value: "Paint Supplier" },
                { label: "Tiles Supplier", value: "Tiles Supplier" },
                { label: "Wood Supplier", value: "Wood Supplier" },
              ]}
            />
            <InputField label="Company Name" name="company_name" register={register} errors={errors} placeholder="Enter company name" />
            <InputField label="Contact Person" name="contact_person" register={register} errors={errors} placeholder="Enter contact person" />
            <InputField label="Contact Phone" name="contact_phone" register={register} errors={errors} placeholder="Enter phone number" />
            <InputField label="Contact Email" name="contact_email" type="email" register={register} errors={errors} placeholder="Enter email" />

            {/* Address Info */}
            <InputField label="Street" name="address_street" register={register} errors={errors} placeholder="Enter street" />
            <InputField label="City" name="address_city" register={register} errors={errors} placeholder="Enter city" />
            <InputField label="State" name="address_state" register={register} errors={errors} placeholder="Enter state" />
            <InputField label="Country" name="address_country" register={register} errors={errors} placeholder="Enter country" />
            <InputField label="Pincode" name="address_pincode" register={register} errors={errors} placeholder="Enter pincode" />

            {/* Tax Info */}
            <InputField label="GSTIN" name="gstin" register={register} errors={errors} placeholder="Enter GSTIN" />
            <InputField label="PAN No" name="pan_no" register={register} errors={errors} placeholder="Enter PAN No" />

            {/* Bank Info */}
            <InputField label="Account Name" name="account_name" register={register} errors={errors} placeholder="Enter account name" />
            <InputField label="Account Number" name="account_number" register={register} errors={errors} placeholder="Enter account number" />
            <InputField label="Bank Name" name="bank_name" register={register} errors={errors} placeholder="Enter bank name" />
            <InputField label="IFSC Code" name="ifsc_code" register={register} errors={errors} placeholder="Enter IFSC code" />
            <InputField label="Branch" name="branch" register={register} errors={errors} placeholder="Enter branch" />

            {/* Status */}
            <InputField
              label="Status"
              name="status"
              type="select"
              register={register}
              errors={errors}
              options={[
                { label: "ACTIVE", value: "ACTIVE" },
                { label: "INACTIVE", value: "INACTIVE" },
                { label: "BLACKLISTED", value: "BLACKLISTED" },
              ]}
            />
          </div>

          {/* Actions */}
          <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={onclose}
              disabled={loading}
              className={`cursor-pointer border dark:border-white dark:text-white border-darkest-blue text-darkest-blue px-6 py-2 rounded ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`cursor-pointer px-6 text-white rounded ${
                loading ? "bg-gray-500 cursor-not-allowed" : "bg-darkest-blue"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      }
    />
  );
};

export default EditVendorSupplier;

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";
import { useState } from "react";
import axios from "axios";

import { toast } from "react-toastify";
import { API } from "../../../constant";

// Validation schema matching contractor fields
const schema = yup.object().shape({
  company_name: yup.string().required("Company name is required"),
  contact_person: yup.string().required("Contact person is required"),
  contact_phone: yup.string().required("Contact phone is required"),
  contact_email: yup.string().email("Invalid email").required("Contact email is required"),
  address_street: yup.string().required("Street is required"),
  address_city: yup.string().required("City is required"),
  address_state: yup.string().required("State is required"),
  address_country: yup.string().required("Country is required"),
  address_pincode: yup.string().required("Pincode is required"),
  business_type: yup.string().required("Business type is required"),
  license_number: yup.string().required("License number is required"),
  contract_start_date: yup.date().required("Contract start date is required"),
  contract_end_date: yup.date().required("Contract end date is required"),
  status: yup.string().required("Status is required"),
  remarks: yup.string(),
});

const AddContractor = ({ onclose, onSuccess, createdByUser }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const payload = {
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
      business_type: data.business_type,
      license_number: data.license_number,
      contract_start_date: data.contract_start_date,
      contract_end_date: data.contract_end_date,
      status: data.status,
      remarks: data.remarks,
      created_by_user: createdByUser || "Admin",
    };

    try {
      setLoading(true);
      await axios.post(`${API}/contractor/add`, payload); // Your backend route
      toast.success("Contractor created successfully");
      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      console.error("Error creating contractor:", error);
      toast.error(error.response?.data?.message || "Failed to create contractor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Contractor"
      widthClassName="lg:w-[800px] md:w-[700px] w-96"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 px-6 py-6">
            <InputField label="Company Name" name="company_name" register={register} errors={errors} placeholder="Enter company name" />
            <InputField label="Contact Person" name="contact_person" register={register} errors={errors} placeholder="Enter contact person" />
            <InputField label="Contact Phone" name="contact_phone" register={register} errors={errors} placeholder="Enter contact phone" />
            <InputField label="Contact Email" type="email" name="contact_email" register={register} errors={errors} placeholder="Enter contact email" />

            <InputField label="Street" name="address_street" register={register} errors={errors} placeholder="Enter street" />
            <InputField label="City" name="address_city" register={register} errors={errors} placeholder="Enter city" />
            <InputField label="State" name="address_state" register={register} errors={errors} placeholder="Enter state" />
            <InputField label="Country" name="address_country" register={register} errors={errors} placeholder="Enter country" />
            <InputField label="Pincode" name="address_pincode" register={register} errors={errors} placeholder="Enter pincode" />

            <InputField label="Business Type" name="business_type" register={register} errors={errors} placeholder="Enter business type" />
            <InputField label="License Number" name="license_number" register={register} errors={errors} placeholder="Enter license number" />
            <InputField label="Contract Start Date" name="contract_start_date" type="date" register={register} errors={errors} />
            <InputField label="Contract End Date" name="contract_end_date" type="date" register={register} errors={errors} />

            <InputField label="Status" name="status" type="select" register={register} errors={errors}
              options={[
                { label: "ACTIVE", value: "ACTIVE" },
                { label: "INACTIVE", value: "INACTIVE" },
                { label: "SUSPENDED", value: "SUSPENDED" },
                { label: "BLACKLISTED", value: "BLACKLISTED" }
              ]}
            />
            <InputField label="Remarks" name="remarks" register={register} errors={errors} placeholder="Enter remarks (optional)" />
          </div>

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

export default AddContractor;

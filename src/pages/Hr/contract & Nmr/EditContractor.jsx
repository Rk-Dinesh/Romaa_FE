import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../constant";
import ButtonBg from "../../../components/Button";
import Title from "../../../components/Title";
import { Save } from "lucide-react";
import { InputField } from "../../../components/InputField";

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

const EditContractor = ({ onUpdated, onclose }) => {
  const { state } = useLocation();
  const contractor = state?.item;
 
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      company_name: contractor?.company_name || "",
      contact_person: contractor?.contact_person || "",
      contact_phone: contractor?.contact_phone || "",
      contact_email: contractor?.contact_email || "",
      address_street: contractor?.address?.street || "",
      address_city: contractor?.address?.city || "",
      address_state: contractor?.address?.state || "",
      address_country: contractor?.address?.country || "",
      address_pincode: contractor?.address?.pincode || "",
      business_type: contractor?.business_type || "",
      license_number: contractor?.license_number || "",
      contract_start_date: contractor?.contract_start_date
        ? contractor.contract_start_date.substring(0, 10)
        : "",
      contract_end_date: contractor?.contract_end_date
        ? contractor.contract_end_date.substring(0, 10)
        : "",
      status: contractor?.status || "ACTIVE",
      remarks: contractor?.remarks || "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
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
      };

      await axios.put(`${API}/contractor/update/${contractor.contractor_id}`, payload);

      toast.success("Contractor updated successfully");
      if (onUpdated) onUpdated();
      if (onclose) onclose();
      navigate("/hr/contractnmr");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update contractor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!contractor) {
    return <div className="p-4 text-red-600">No contractor data found.</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="sm:my-2 flex sm:items-center flex-col sm:flex-row items-start sm:justify-between space-y-1.5 my-4">
        <Title title="HR Management" sub_title="Edit Contractor" page_title="Contractor" />
        <ButtonBg
          type="submit"
          button_name="Save"
          button_icon={<Save size={16} />}
          loading={loading}
        />
      </div>
      <div className="dark:bg-layout-dark bg-white w-full grid grid-cols-2 gap-4 rounded-md px-4 py-6">
        <InputField label="Company Name" name="company_name" register={register} errors={errors} placeholder="Enter company name" />
        <InputField label="Contact Person" name="contact_person" register={register} errors={errors} placeholder="Enter contact person" />
        <InputField label="Contact Phone" name="contact_phone" register={register} errors={errors} placeholder="Enter phone number" />
        <InputField label="Contact Email" name="contact_email" type="email" register={register} errors={errors} placeholder="Enter email" />

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
            { label: "BLACKLISTED", value: "BLACKLISTED" },
          ]}
        />
        <InputField label="Remarks" name="remarks" register={register} errors={errors} placeholder="Enter remarks (optional)" />
      </div>
    </form>
  );
};

export default EditContractor;

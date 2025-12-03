import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";
import { useState } from "react";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";

// ✅ Validation Schema
const schema = yup.object().shape({

  name: yup.string().required("Employee name is required"),
  site_assigned: yup.string().required("Site assignment is required"),
  contact_phone: yup.string().required("Phone is required"),
  contact_email: yup.string().email().required("Email is required"),
  address_street: yup.string().required("Street is required"),
  address_city: yup.string().required("City is required"),
  address_state: yup.string().required("State is required"),
  address_country: yup.string().required("Country is required"),
  address_pincode: yup.string().required("Pincode is required"),
  date_of_joining: yup.date().required("Joining date is required"),
  emergency_name: yup.string().required("Emergency contact name required"),
  emergency_relationship: yup.string().required("Relationship is required"),
  emergency_phone: yup.string().required("Emergency phone required"),
  id_proof_type: yup.string().required("ID proof type is required"),
  id_proof_number: yup.string().required("ID proof number is required"),
});

const AddEmployee = ({ onclose, onSuccess, createdByUser }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // ✅ When user submits form
  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      site_assigned: data.site_assigned,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      address: {
        street: data.address_street,
        city: data.address_city,
        state: data.address_state,
        country: data.address_country,
        pincode: data.address_pincode,
      },
      date_of_joining: data.date_of_joining,
      emergency_contact: {
        name: data.emergency_name,
        relationship: data.emergency_relationship,
        phone: data.emergency_phone,
      },
      id_proof_type: data.id_proof_type,
      id_proof_number: data.id_proof_number,
      created_by_user: createdByUser || "Admin", // 🟢 will come from auth
    };

    try {
      setLoading(true);
      await axios.post(`${API}/employee/add`, payload); // 👈 your backend route
      toast.success("Employee created successfully");
      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error(error.response?.data?.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Employee"
      widthClassName="lg:w-[800px] md:w-[700px] w-96"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 px-6 py-6">
            {/* Employee Basic Info */}
            <InputField label="Name" name="name" register={register} errors={errors} placeholder="Enter employee name" />
            <InputField label="Site Assigned" name="site_assigned" register={register} errors={errors} placeholder="Enter site" />

            {/* Contact Info */}
            <InputField label="Phone" name="contact_phone" register={register} errors={errors} placeholder="Enter phone" />
            <InputField label="Email" type="email" name="contact_email" register={register} errors={errors} placeholder="Enter email" />

            {/* Address */}
            <InputField label="Street" name="address_street" register={register} errors={errors} placeholder="Enter street" />
            <InputField label="City" name="address_city" register={register} errors={errors} placeholder="Enter city" />
            <InputField label="State" name="address_state" register={register} errors={errors} placeholder="Enter state" />
            <InputField label="Country" name="address_country" register={register} errors={errors} placeholder="Enter country" />
            <InputField label="Pincode" name="address_pincode" register={register} errors={errors} placeholder="Enter pincode" />

            {/* Joining Date */}
            <InputField label="Joining Date" type="date" name="date_of_joining" register={register} errors={errors} />

            {/* Emergency Contact */}
            <InputField label="Emergency Name" name="emergency_name" register={register} errors={errors} placeholder="Enter name" />
            <InputField label="Relationship" name="emergency_relationship" register={register} errors={errors} placeholder="Enter relationship" />
            <InputField label="Emergency Phone" name="emergency_phone" register={register} errors={errors} placeholder="Enter phone" />

            {/* ID Proof */}
            <InputField
              label="ID Proof Type"
              type="select"
              name="id_proof_type"
              register={register}
              errors={errors}
              options={[
                { label: "Aadhar", value: "Aadhar" },
                { label: "PAN", value: "PAN" },
                { label: "Voter ID", value: "Voter ID" },
                { label: "Driving License", value: "Driving License" },
                { label: "Passport", value: "Passport" },
              ]}
            />
            <InputField label="ID Proof Number" name="id_proof_number" register={register} errors={errors} placeholder="Enter ID proof number" />
          </div>

          {/* Action Buttons */}
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

export default AddEmployee;

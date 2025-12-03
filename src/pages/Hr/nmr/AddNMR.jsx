import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";
import { useState } from "react";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";

// Validation schema matching contract worker fields
const schema = yup.object().shape({
  employee_name: yup.string().required("Employee name is required"),
  contractor_name: yup.string().required("Contractor name is required"),
  site_assigned: yup.string().required("Site assigned is required"),
  department: yup.string().required("Department is required"),
  role: yup.string().required("Role is required"),
  nmr_number: yup.string().required("NMR number is required"),
  daily_wage: yup.string().required("Daily wage is required"),
  status: yup.string().required("Status is required"),
  contact_phone: yup.string().required("Contact phone is required"),
  gender: yup.string().required("Gender is required"),
  age: yup.number().typeError("Age must be a number").required("Age is required"),
  address_street: yup.string().required("Street is required"),
  address_city: yup.string().required("City is required"),
  address_state: yup.string().required("State is required"),
  address_country: yup.string().required("Country is required"),
  address_pincode: yup.string().required("Pincode is required"),
  id_proof_type: yup.string().required("ID proof type is required"),
  id_proof_number: yup.string().required("ID proof number is required"),
});

const AddContractEmployee = ({ onclose, onSuccess, createdByUser }) => {
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
      employee_name: data.employee_name,
      contractor_name: data.contractor_name,
      site_assigned: data.site_assigned,
      department: data.department,
      role: data.role,
      nmr_number: data.nmr_number,
      daily_wage: data.daily_wage,
      status: data.status,
      contact_phone: data.contact_phone,
      gender: data.gender,
      age: data.age,
      address: {
        street: data.address_street,
        city: data.address_city,
        state: data.address_state,
        country: data.address_country,
        pincode: data.address_pincode,
      },
      id_proof_type: data.id_proof_type,
      id_proof_number: data.id_proof_number,
      created_by_user: createdByUser || "Admin",
    };

    try {
      setLoading(true);
      await axios.post(`${API}/contractworker/addworker`, payload); // Your backend route
      toast.success("Contract worker created successfully");
      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      console.error("Error creating contract worker:", error);
      toast.error(error.response?.data?.message || "Failed to create contract worker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Contract Employee"
      widthClassName="lg:w-[900px] md:w-[800px] w-96"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 px-6 py-6">
            <InputField label="Employee Name" name="employee_name" register={register} errors={errors} placeholder="Enter employee name" />
            <InputField label="Contractor Name" name="contractor_name" register={register} errors={errors} placeholder="Enter contractor name" />
            <InputField label="Site Assigned" name="site_assigned" register={register} errors={errors} placeholder="Enter site assigned" />
            <InputField label="Department" name="department" register={register} errors={errors} placeholder="Enter department" />
            <InputField label="Role" name="role" register={register} errors={errors} placeholder="Enter role" />
            <InputField label="NMR Number" name="nmr_number" register={register} errors={errors} placeholder="Enter NMR number" />
            <InputField label="Daily Wage" name="daily_wage" register={register} errors={errors} placeholder="Enter daily wage"  />
            <InputField label="Status" name="status" register={register} errors={errors} placeholder="Enter status" />
            <InputField label="Contact Phone" name="contact_phone" register={register} errors={errors} placeholder="Enter contact phone" />
            <InputField label="Gender" name="gender" register={register} errors={errors} placeholder="Enter gender" />
            <InputField label="Age" name="age" register={register} errors={errors} placeholder="Enter age" type="number" />

            <InputField label="Street" name="address_street" register={register} errors={errors} placeholder="Enter street" />
            <InputField label="City" name="address_city" register={register} errors={errors} placeholder="Enter city" />
            <InputField label="State" name="address_state" register={register} errors={errors} placeholder="Enter state" />
            <InputField label="Country" name="address_country" register={register} errors={errors} placeholder="Enter country" />
            <InputField label="Pincode" name="address_pincode" register={register} errors={errors} placeholder="Enter pincode" />

            <InputField label="ID Proof Type" name="id_proof_type" register={register} errors={errors} placeholder="Enter ID proof type" />
            <InputField label="ID Proof Number" name="id_proof_number" register={register} errors={errors} placeholder="Enter ID proof number" />
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

export default AddContractEmployee;

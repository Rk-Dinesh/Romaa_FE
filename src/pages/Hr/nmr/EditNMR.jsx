import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ButtonBg from "../../../components/Button";
import Title from "../../../components/Title";
import { Save } from "lucide-react";
import { InputField } from "../../../components/InputField";
import axios from "axios";
import { API } from "../../../constant";

const schema = yup.object().shape({
  employee_name: yup.string().required("Employee name is required"),
  contractor_name: yup.string().required("Contractor name is required"),
  site_assigned: yup.string().required("Site assigned is required"),
  department: yup.string().required("Department is required"),
  role: yup.string().required("Role is required"),
  nmr_number: yup.string().required("NMR number is required"),
  daily_wage: yup
    .string()
    .required("Daily wage is required"),
  status: yup.string().required("Status is required"),
  contact_phone: yup.string().required("Contact phone is required"),
  gender: yup.string().required("Gender is required"),
  age: yup
    .number()
    .typeError("Age must be a number")
    .required("Age is required"),
  address_street: yup.string().required("Street is required"),
  address_city: yup.string().required("City is required"),
  address_state: yup.string().required("State is required"),
  address_country: yup.string().required("Country is required"),
  address_pincode: yup.string().required("Pincode is required"),
  id_proof_type: yup.string().required("ID proof type is required"),
  id_proof_number: yup.string().required("ID proof number is required"),
});

const EditNMR = ({ onUpdated, onclose }) => {
  const { state } = useLocation();
  const nmr = state?.item;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      employee_name: nmr?.employee_name || "",
      contractor_name: nmr?.contractor_name || "",
      site_assigned: nmr?.site_assigned || "",
      department: nmr?.department || "",
      role: nmr?.role || "",
      nmr_number: nmr?.nmr_number || "",
      daily_wage: nmr?.daily_wage || "",
      status: nmr?.status || "",
      contact_phone: nmr?.contact_phone || "",
      gender: nmr?.gender || "",
      age: nmr?.age || "",
      address_street: nmr?.address?.street || "",
      address_city: nmr?.address?.city || "",
      address_state: nmr?.address?.state || "",
      address_country: nmr?.address?.country || "",
      address_pincode: nmr?.address?.pincode || "",
      id_proof_type: nmr?.id_proof_type || "",
      id_proof_number: nmr?.id_proof_number || "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      
       await axios.put(`${API}/contractworker/updateworker/${nmr.worker_id}`, data);

      //console.log("Updated NMR Data:", data);

      if (onUpdated) onUpdated();
      if (onclose) onclose();
      navigate("/hr/nmr");
    } catch (error) {
      console.error("Failed to update NMR", error);
      // Show toast or error message here
    } finally {
      setLoading(false);
    }
  };

  if (!nmr) {
    return <div className="p-4 text-red-600">No NMR data found.</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="sm:my-2 flex sm:items-center flex-col sm:flex-row items-start sm:justify-between space-y-1.5 my-4">
        <Title title="HR Management" sub_title="NMR" page_title="Edit NMR" />
        <ButtonBg
          type="submit"
          button_name={loading ? "Saving..." : "Save"}
          button_icon={<Save size={16} />}
          disabled={loading}
        />
      </div>
      <div className="dark:bg-layout-dark bg-white w-full grid grid-cols-2 gap-4 rounded-md px-4 py-6">
        <InputField
          label="Employee Name"
          name="employee_name"
          register={register}
          errors={errors}
          placeholder="Enter employee name"
        />
        <InputField
          label="Contractor Name"
          name="contractor_name"
          register={register}
          errors={errors}
          placeholder="Enter contractor name"
        />
        <InputField
          label="Site Assigned"
          name="site_assigned"
          register={register}
          errors={errors}
          placeholder="Enter site assigned"
        />
        <InputField
          label="Department"
          name="department"
          register={register}
          errors={errors}
          placeholder="Enter department"
        />
        <InputField
          label="Role"
          name="role"
          register={register}
          errors={errors}
          placeholder="Enter role"
        />
        <InputField
          label="NMR Number"
          name="nmr_number"
          register={register}
          errors={errors}
          placeholder="Enter NMR number"
        />
        <InputField
          label="Daily Wage"
          name="daily_wage"
          register={register}
          errors={errors}
          placeholder="Enter daily wage"
        />
        <InputField
          label="Status"
          name="status"
          register={register}
          errors={errors}
          placeholder="Enter status"
        />
        <InputField
          label="Contact Phone"
          name="contact_phone"
          register={register}
          errors={errors}
          placeholder="Enter contact phone"
        />
        <InputField
          label="Gender"
          name="gender"
          register={register}
          errors={errors}
          placeholder="Enter gender"
        />
        <InputField
          label="Age"
          name="age"
          register={register}
          errors={errors}
          placeholder="Enter age"
          type="number"
        />
        <InputField
          label="Street"
          name="address_street"
          register={register}
          errors={errors}
          placeholder="Enter street"
        />
        <InputField
          label="City"
          name="address_city"
          register={register}
          errors={errors}
          placeholder="Enter city"
        />
        <InputField
          label="State"
          name="address_state"
          register={register}
          errors={errors}
          placeholder="Enter state"
        />
        <InputField
          label="Country"
          name="address_country"
          register={register}
          errors={errors}
          placeholder="Enter country"
        />
        <InputField
          label="Pincode"
          name="address_pincode"
          register={register}
          errors={errors}
          placeholder="Enter pincode"
        />
        <InputField
          label="ID Proof Type"
          name="id_proof_type"
          register={register}
          errors={errors}
          placeholder="Enter ID proof type"
        />
        <InputField
          label="ID Proof Number"
          name="id_proof_number"
          register={register}
          errors={errors}
          placeholder="Enter ID proof number"
        />
      </div>
    </form>
  );
};

export default EditNMR;

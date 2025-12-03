import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../constant";
import ButtonBg from "../../../components/Button";
import Title from "../../../components/Title";
import { Save } from "lucide-react";
import { InputField } from "../../../components/InputField";
import * as yup from "yup";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  //  department: yup.string().required("Department is required"),
  site_assigned: yup.string().required("Site assigned is required"),
  status: yup.string().required("Status is required"),
  contact_phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),
  contact_email: yup
    .string()
    .email("Invalid email")
    .required("Email is required"),
  address_street: yup.string().required("Street is required"),
  address_city: yup.string().required("City is required"),
  address_state: yup.string().required("State is required"),
  address_country: yup.string().required("Country is required"),
  address_pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
  date_of_joining: yup.date().required("Date of joining is required"),
  emergency_name: yup.string().required("Emergency contact name is required"),
  emergency_relationship: yup.string().required("Relationship is required"),
  emergency_phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Emergency phone is required"),
  id_proof_type: yup.string().required("ID proof type is required"),
  id_proof_number: yup.string().required("ID proof number is required"),
});

const EditEmployee = ({ onUpdated, onclose }) => {
  const { state } = useLocation();
  const employee = state?.item;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: employee?.name || "",

      //   department: employee?.department || "",
      site_assigned: employee?.site_assigned || "",
      status: employee?.status || "",
      contact_phone: employee?.contact_phone || "",
      contact_email: employee?.contact_email || "",
      address_street: employee?.address?.street || "",
      address_city: employee?.address?.city || "",
      address_state: employee?.address?.state || "",
      address_country: employee?.address?.country || "",
      address_pincode: employee?.address?.pincode || "",
      date_of_joining: employee?.date_of_joining?.substring(0, 10) || "",
      emergency_name: employee?.emergency_contact?.name || "",
      emergency_relationship: employee?.emergency_contact?.relationship || "",
      emergency_phone: employee?.emergency_contact?.phone || "",
      id_proof_type: employee?.id_proof_type || "",
      id_proof_number: employee?.id_proof_number || "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,

        department: data.department,
        site_assigned: data.site_assigned,
        status: data.status,
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
      };

      await axios.put(
        `${API}/employee/updateemployee/${employee.employee_id}`,
        payload
      );

      toast.success("Employee updated successfully");
      if (onUpdated) onUpdated();
      if (onclose) onclose();
      navigate("/hr/employee");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!employee) {
    return <div className="p-4 text-red-600">No employee data found.</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="sm:my-2 flex sm:items-center flex-col sm:flex-row items-start sm:justify-between space-y-1.5 my-4">
        <Title
          title="HR Management"
          sub_title="Edit Employee"
          page_title="Employee"
        />
        <ButtonBg
          type="submit"
          button_name="Save"
          button_icon={<Save size={16} />}
          loading={loading}
        />
      </div>
      <div className="dark:bg-layout-dark bg-white w-full grid grid-cols-2 gap-x-4 gap-y-2 rounded-md px-4 py-6 ">
        <div className="col-span-2 flex justify-center items-center mb-4">
          <p className="text-xl font-semibold">Edit Employee</p>
        </div>
        <InputField
          label="Name"
          name="name"
          register={register}
          errors={errors}
          placeholder="Enter employee name"
        />

        {/* <InputField
          label="Role"
          name="role"
          type="select"
          register={register}
          placeholder="select role"
          errors={errors}
          options={[
            { label: "Engineer", value: "Engineer" },
            { label: "Manager", value: "Manager" },
            { label: "Technician", value: "Technician" },
          ]}
        />

        <InputField
          label="Department"
          name="department"
          type="select"
          placeholder="select department"
          register={register}
          errors={errors}
          options={[
            { label: "Engineering", value: "Engineering" },
            { label: "Maintenance", value: "Maintenance" },
            { label: "Operations", value: "Operations" },
          ]}
        /> */}

        <InputField
          label="Site Assigned"
          name="site_assigned"
          register={register}
          errors={errors}
          placeholder="Site assigned"
        />

        <InputField
          label="Status"
          name="status"
          type="select"
          register={register}
          errors={errors}
          options={[
            { label: "ACTIVE", value: "ACTIVE" },
            { label: "INACTIVE", value: "INACTIVE" },
            { label: "ON LEAVE", value: "ON_LEAVE" },
          ]}
        />

        <InputField
          label="Contact Phone"
          name="contact_phone"
          register={register}
          errors={errors}
          placeholder="Phone"
        />

        <InputField
          label="Contact Email"
          name="contact_email"
          type="email"
          register={register}
          errors={errors}
          placeholder="Email"
        />

        <InputField
          label="Street"
          name="address_street"
          register={register}
          errors={errors}
          placeholder="Street"
        />
        <InputField
          label="City"
          name="address_city"
          register={register}
          errors={errors}
          placeholder="City"
        />
        <InputField
          label="State"
          name="address_state"
          register={register}
          errors={errors}
          placeholder="State"
        />
        <InputField
          label="Country"
          name="address_country"
          register={register}
          errors={errors}
          placeholder="Country"
        />
        <InputField
          label="Pincode"
          name="address_pincode"
          register={register}
          errors={errors}
          placeholder="Pincode"
        />

        <InputField
          label="Date Of Joining"
          name="date_of_joining"
          type="date"
          register={register}
          errors={errors}
        />

        <InputField
          label="Emergency Contact Name"
          name="emergency_name"
          register={register}
          errors={errors}
          placeholder="Emergency Name"
        />
        <InputField
          label="Emergency Relationship"
          name="emergency_relationship"
          register={register}
          errors={errors}
          placeholder="Relationship"
        />
        <InputField
          label="Emergency Contact Phone"
          name="emergency_phone"
          register={register}
          errors={errors}
          placeholder="Emergency Phone"
        />

        <InputField
          label="ID Proof Type"
          name="id_proof_type"
          type="select"
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
        <InputField
          label="ID Proof Number"
          name="id_proof_number"
          register={register}
          errors={errors}
          placeholder="ID Proof Number"
        />
      </div>
    </form>
  );
};

export default EditEmployee;

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";
import {
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiShield,
  FiSave,
  FiPhone
} from "react-icons/fi";
import { toast } from "react-toastify";
import { API } from "../../../constant";
import axios from "axios";

// --- Schema ---
const schema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),

  userType: Yup.string().oneOf(["Office", "Site"]).required("User Type required"),
  assignedProject: Yup.string().when("userType", {
    is: "Site",
    then: (schema) => schema.required("Project is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  designation: Yup.string().required("Designation required"),
  dateOfJoining: Yup.date().required("Date required"),

  address_street: Yup.string().required("Street required"),
  address_city: Yup.string().required("City required"),
  address_state: Yup.string().required("State required"),
  address_pincode: Yup.string().required("Pincode required"),

  id_proof_type: Yup.string().required("ID Type required"),
  id_proof_number: Yup.string().required("ID Number required"),

  emergency_name: Yup.string().required("Contact Name required"),
  emergency_relationship: Yup.string().required("Relation required"),
  emergency_phone: Yup.string().required("Phone required"),
});

const AddEmployee = ({ onclose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Mock Data
  const [projects] = useState([
    { _id: "prj001", name: "Skyline Towers" },
    { _id: "prj002", name: "Metro Phase 1" }
  ]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { userType: "Office" }
  });

  const userType = useWatch({ control, name: "userType" });

  const sectionHeaderClass = "col-span-full text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mt-4 mb-2 flex items-center gap-2";

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        status: "Active",
        userType: data.userType,
        dateOfJoining: data.dateOfJoining,
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          pincode: data.address_pincode
        },
        idProof: {
          type: data.id_proof_type,
          number: data.id_proof_number
        },
        emergencyContact: {
          name: data.emergency_name,
          relationship: data.emergency_relationship,
          phone: data.emergency_phone
        }
      };

      await axios.post(`${API}/employee/register`, payload, { withCredentials: true });
      toast.success("Employee onboarded successfully!");
      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">

        {/* --- Header --- */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiUser className="text-xl" /></span>
              New Employee Onboarding
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Register new staff details</p>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
            <IoClose size={24} />
          </button>
        </div>

        {/* --- Scrollable Form Area --- */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* 1. Identity Section */}
            <div className={sectionHeaderClass}>
              <FiShield /> Identity & Access
            </div>

            <Input label="Full Name *" name="name" register={register} error={errors.name} placeholder="John Doe" />
            <Input label="Email ID *" type="email" name="email" register={register} error={errors.email} placeholder="john@company.com" />
            <Input label="Mobile No *" type="phone" name="phone" register={register} error={errors.phone} placeholder="9876543210" />

            {/* 2. Job Profile Section */}
            <div className={sectionHeaderClass}>
              <FiBriefcase /> Job Profile
            </div>

            <Input label="Designation *" name="designation" register={register} error={errors.designation} placeholder="e.g. Site Engineer" />
            <Input label="Date of Joining *" type="date" name="dateOfJoining" register={register} error={errors.dateOfJoining} />
            <Select label="Work Type *" name="userType" register={register} error={errors.userType} options={["Office", "Site"]} />

            {/* Conditional Project Field */}
            {userType === "Site" ? (
              <Select label="Assign Project *" name="assignedProject" register={register} error={errors.assignedProject}
                options={projects.map(p => ({ label: p.name, value: p._id }))}
                isObject={true}
              />
            ) : (
              <div className="hidden md:block"></div> // Spacer to keep grid alignment
            )}

            {/* 3. Address Section */}
            <div className={sectionHeaderClass}>
              <FiMapPin /> Residential Address
            </div>

            <div className="md:col-span-2">
              <Input label="Street / Building *" name="address_street" register={register} error={errors.address_street} placeholder="Flat No, Street Name" />
            </div>
            <Input label="City *" name="address_city" register={register} error={errors.address_city} />
            <Input label="Pincode *" name="address_pincode" register={register} error={errors.address_pincode} />

            {/* Just filling the row nicely */}
            <div className="md:col-span-1">
              <Input label="State *" name="address_state" register={register} error={errors.address_state} />
            </div>

            {/* 4. Legal & Emergency Section */}
            <div className={sectionHeaderClass}>
              <FiShield /> Legal Document
            </div>

            <Select label="ID Proof Type *" name="id_proof_type" register={register} error={errors.id_proof_type} options={["Aadhar", "PAN", "Passport", "Voter ID"]} />
            <Input label="ID Proof Number *" name="id_proof_number" register={register} error={errors.id_proof_number} placeholder="XXXX-XXXX-XXXX" />

            <div className="md:col-span-2"></div> {/* Spacer */}

            <div className={sectionHeaderClass}>
              <FiPhone />  Emergency Contact
            </div>
            <Input label="Emergency Contact Name *" name="emergency_name" register={register} error={errors.emergency_name} />
            <Input label="Relationship *" name="emergency_relationship" register={register} error={errors.emergency_relationship} placeholder="Father/Spouse" />
            <Input label="Emergency Phone *" name="emergency_phone" register={register} error={errors.emergency_phone} />

          </form>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onclose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <FiSave />}
            {loading ? "Creating..." : "Confirm & Create"}
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Reusable Components (Same style as Machinery) ---
const Input = ({ label, name, type = "text", register, error, placeholder }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      {...register(name)}
      placeholder={placeholder}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
    />
    {error && <p className="text-red-500 text-[10px] mt-0.5">{error.message}</p>}
  </div>
);

const Select = ({ label, name, register, error, options, isObject = false }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <select
      {...register(name)}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
    >
      <option value="">Select...</option>
      {options.map((opt, i) => (
        <option key={i} value={isObject ? opt.value : opt}>{isObject ? opt.label : opt}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-[10px] mt-0.5">{error.message}</p>}
  </div>
);

export default AddEmployee;
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../constant";
import { IoClose } from "react-icons/io5";
import { 
  FiUser, 
  FiBriefcase, 
  FiMapPin, 
  FiShield, 
  FiPhone,
  FiSave
} from "react-icons/fi";
import * as yup from "yup";

// --- 1. Schema (Removed Status, Site, Role, Password) ---
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  designation: yup.string().required("Designation is required"),
  
  contact_phone: yup.string().required("Phone is required"),
  contact_email: yup.string().email("Invalid email").required("Email is required"),
  
  address_street: yup.string().required("Street is required"),
  address_city: yup.string().required("City is required"),
  address_state: yup.string().required("State is required"),
  address_country: yup.string().required("Country is required"),
  address_pincode: yup.string().required("Pincode is required"),
  
  dateOfJoining: yup.date().required("Date of joining is required"),
  
  emergency_name: yup.string().required("Emergency contact name is required"),
  emergency_relationship: yup.string().required("Relationship is required"),
  emergency_phone: yup.string().required("Emergency phone is required"),
  
  id_proof_type: yup.string().required("ID type is required"),
  id_proof_number: yup.string().required("ID number is required"),
});

const EditEmployee = ({ onUpdated, onclose }) => {
  const { state } = useLocation();
  // Safe navigation fallback if state is missing
  const employee = state?.item || {}; 
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: employee.name || "",
      designation: employee.designation || "",
      contact_phone: employee.phone || "", // Mapped from 'phone' in view
      contact_email: employee.email || "", // Mapped from 'email' in view
      
      // Address Flattening
      address_street: employee.address?.street || "",
      address_city: employee.address?.city || "",
      address_state: employee.address?.state || "",
      address_country: employee.address?.country || "India",
      address_pincode: employee.address?.pincode || "",
      
      dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : "",
      
      // Emergency Contact Flattening
      emergency_name: employee.emergencyContact?.name || "",
      emergency_relationship: employee.emergencyContact?.relationship || "",
      emergency_phone: employee.emergencyContact?.phone || "",
      
      // ID Proof Flattening
      id_proof_type: employee.idProof?.type || "",
      id_proof_number: employee.idProof?.number || "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Constructing Payload (Nesting data back for backend)
      const payload = {
        name: data.name,
        designation: data.designation,
        phone: data.contact_phone,
        email: data.contact_email,
        
        // Note: Not sending status, site, role, or password
        
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          country: data.address_country,
          pincode: data.address_pincode,
        },
        dateOfJoining: data.dateOfJoining,
        emergencyContact: {
          name: data.emergency_name,
          relationship: data.emergency_relationship,
          phone: data.emergency_phone,
        },
        idProof: {
            type: data.id_proof_type,
            number: data.id_proof_number
        }
      };

      // Assuming backend uses _id for updates. Adjust to employeeId if needed.
      await axios.put(
        `${API}/employee/update/${employee.employeeId}`, 
        payload,
        { withCredentials: true }
      );

      toast.success("Employee details updated successfully");
      if (onUpdated) onUpdated();
      if (onclose) {
          onclose();
      } else {
          // Fallback if not opened in modal
          navigate("/hr/employee"); 
      }
    } catch (err) {
      console.error("Update failed", err);
      toast.error(err.response?.data?.message || "Failed to update employee.");
    } finally {
      setLoading(false);
    }
  };

  // --- Styles ---
  const sectionHeaderClass = "col-span-full text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mt-4 mb-2 flex items-center gap-2";

  if (!employee._id) {
    return <div className="p-6 text-red-500 text-center">Error: No employee data loaded.</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        
        {/* --- Header --- */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiUser className="text-xl" /></span>
              Edit Employee Profile
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Update details for <span className="font-semibold text-gray-700">{employee.name}</span></p>
          </div>
          <button 
            type="button"
            onClick={() => onclose ? onclose() : navigate(-1)} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* --- Scrollable Form Area --- */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-5">
            
            {/* 1. Identity Section */}
            <div className={sectionHeaderClass}>
                <FiUser /> Personal Info
            </div>
            
            <Input label="Full Name" name="name" register={register} error={errors.name} />
            <Input label="Email ID" name="contact_email" register={register} error={errors.contact_email} />
            <Input label="Mobile No" name="contact_phone" register={register} error={errors.contact_phone} />
            

            {/* 2. Job Info */}
            <div className={sectionHeaderClass}>
                <FiBriefcase /> Job Details
            </div>
            <Input label="Designation" name="designation" register={register} error={errors.designation} />
            <Input label="Date of Joining" type="date" name="dateOfJoining" register={register} error={errors.dateOfJoining} />
            
            {/* 3. Address Section */}
            <div className={sectionHeaderClass}>
                <FiMapPin /> Residential Address
            </div>

            <div className="md:col-span-2">
                <Input label="Street / Building" name="address_street" register={register} error={errors.address_street} />
            </div>
            <Input label="City" name="address_city" register={register} error={errors.address_city} />
            <Input label="State" name="address_state" register={register} error={errors.address_state} />
            <Input label="Country" name="address_country" register={register} error={errors.address_country} />
            <Input label="Pincode" name="address_pincode" register={register} error={errors.address_pincode} />

            {/* 4. Legal & Emergency Section */}
            <div className={sectionHeaderClass}>
                <FiShield /> Legal & Emergency Contact
            </div>

            <Select label="ID Proof Type" name="id_proof_type" register={register} error={errors.id_proof_type} options={["Aadhar", "PAN", "Passport", "Voter ID"]} />
            <Input label="ID Proof Number" name="id_proof_number" register={register} error={errors.id_proof_number} />
            
            <div className="md:col-span-2 hidden md:block"></div>

            <Input label="Contact Name" name="emergency_name" register={register} error={errors.emergency_name} />
            <Input label="Relationship" name="emergency_relationship" register={register} error={errors.emergency_relationship} />
            <Input label="Emergency Phone" name="emergency_phone" register={register} error={errors.emergency_phone} />

          </form>
        </div>

        {/* --- Footer Actions --- */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button"
            onClick={() => onclose ? onclose() : navigate(-1)}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <FiSave />}
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Reusable Components ---
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

const Select = ({ label, name, register, error, options }) => (
    <div className="w-full">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <select 
            {...register(name)} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        >
            <option value="">Select...</option>
            {options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
        {error && <p className="text-red-500 text-[10px] mt-0.5">{error.message}</p>}
    </div>
);

export default EditEmployee;
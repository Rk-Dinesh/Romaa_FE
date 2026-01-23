import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";
import { 
  FiUser, 
  FiBriefcase, 
  FiMapPin, 
  FiShield, 
  FiPhone, 
  FiSave,
  FiArrowLeft,
  FiActivity
} from "react-icons/fi";

// --- Validation Schema ---
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  role: yup.string().required("Role is required"), // Stores Role ID
  status: yup.string().required("Status is required"),
  
  designation: yup.string().required("Designation is required"),
  dateOfJoining: yup.string().required("Date is required"),
  
  // Flattened Address
  address_street: yup.string().required("Street is required"),
  address_city: yup.string().required("City is required"),
  address_state: yup.string().required("State is required"),
  address_pincode: yup.string().required("Pincode is required"),

  // Flattened Emergency
  emergency_name: yup.string().required("Contact Name is required"),
  emergency_relationship: yup.string().required("Relation is required"),
  emergency_phone: yup.string().required("Emergency Phone is required"),

  // Flattened ID Proof
  id_proof_type: yup.string().required("ID Type is required"),
  id_proof_number: yup.string().required("ID Number is required"),
});

const EditUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.item;

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // --- 1. Fetch Roles for Dropdown ---
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(`${API}/role/listForDropdown`, { withCredentials: true });
        setRoles(res.data.data || []);
      } catch (err) {
        console.error("Error fetching roles", err);
      }
    };
    fetchRoles();
  }, []);

  // --- 2. Populate Form Data ---
  useEffect(() => {
    if (userData) {
      // Convert ISO Date to YYYY-MM-DD for input field
      const formattedDate = userData.dateOfJoining 
        ? new Date(userData.dateOfJoining).toISOString().split('T')[0] 
        : "";

      reset({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        
        // Map the Role Object to just the ID for the dropdown
        role: userData.role?._id || "", 
        status: userData.status,
        
        designation: userData.designation,
        dateOfJoining: formattedDate,

        // Flatten Address
        address_street: userData.address?.street,
        address_city: userData.address?.city,
        address_state: userData.address?.state,
        address_pincode: userData.address?.pincode,

        // Flatten Emergency
        emergency_name: userData.emergencyContact?.name,
        emergency_relationship: userData.emergencyContact?.relationship,
        emergency_phone: userData.emergencyContact?.phone,

        // Flatten ID Proof
        id_proof_type: userData.idProof?.type,
        id_proof_number: userData.idProof?.number,
      });
    }
  }, [userData, reset]);

  // --- 3. Submit Handler ---
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Re-structure data for backend
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role, // Sending the Role ID
        status: data.status,
        designation: data.designation,
        dateOfJoining: data.dateOfJoining,
        
        address: {
            street: data.address_street,
            city: data.address_city,
            state: data.address_state,
            pincode: data.address_pincode
        },
        emergencyContact: {
            name: data.emergency_name,
            relationship: data.emergency_relationship,
            phone: data.emergency_phone
        },
        idProof: {
            type: data.id_proof_type,
            number: data.id_proof_number
        }
      };

      await axios.put(`${API}/employee/update/${userData.employeeId}`, payload, { withCredentials: true });
      
      toast.success("User updated successfully");
      navigate(-1); // Go back
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return <div className="p-10 text-center">No user data found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-overall_bg-dark font-layout-font pb-20">
      
      {/* --- Sticky Header --- */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-layout-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FiArrowLeft className="text-xl text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">Edit User</h1>
            <p className="text-xs text-gray-500 mt-1">Updating profile for {userData.employeeId}</p>
          </div>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="px-6 py-2.5 bg-darkest-blue hover:bg-blue-900 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <FiSave size={18} />}
          <span>Save Changes</span>
        </button>
      </div>

      {/* --- Form Content --- */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Column 1: Identity & Role */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-layout-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-5 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
                  <FiUser /> Identity
               </h3>
               <div className="space-y-4">
                  <Input label="Full Name" name="name" register={register} error={errors.name} />
                  <Input label="Email Address" name="email" register={register} error={errors.email} />
                  <Input label="Phone Number" name="phone" register={register} error={errors.phone} />
               </div>
            </div>

            <div className="bg-white dark:bg-layout-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-5 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
                  <FiShield /> Access Control
               </h3>
               <div className="space-y-4">
                  {/* Role Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">System Role</label>
                    <select 
                      {...register("role")}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>{role.roleName}</option>
                      ))}
                    </select>
                    {errors.role && <p className="text-red-500 text-[10px] mt-1">{errors.role.message}</p>}
                  </div>

                  <Select 
                    label="Account Status" 
                    name="status" 
                    register={register} 
                    error={errors.status}
                    options={["Active", "Inactive", "Suspended"]} 
                  />
               </div>
            </div>
          </div>

          {/* Column 2: Job & Address */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-layout-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-5 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
                  <FiBriefcase /> Job Details
               </h3>
               <div className="space-y-4">
                  <Input label="Designation" name="designation" register={register} error={errors.designation} />
                  <Input label="Date of Joining" type="date" name="dateOfJoining" register={register} error={errors.dateOfJoining} />
                  <Input label="Employee ID" value={userData.employeeId} disabled={true} />
               </div>
            </div>

            <div className="bg-white dark:bg-layout-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-5 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
                  <FiMapPin /> Address
               </h3>
               <div className="space-y-4">
                  <Input label="Street / Building" name="address_street" register={register} error={errors.address_street} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" name="address_city" register={register} error={errors.address_city} />
                    <Input label="Pincode" name="address_pincode" register={register} error={errors.address_pincode} />
                  </div>
                  <Input label="State" name="address_state" register={register} error={errors.address_state} />
               </div>
            </div>
          </div>

          {/* Column 3: Emergency & ID */}
          <div className="space-y-6">
             <div className="bg-white dark:bg-layout-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-5 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
                  <FiActivity /> Emergency Contact
               </h3>
               <div className="space-y-4">
                  <Input label="Contact Name" name="emergency_name" register={register} error={errors.emergency_name} />
                  <Input label="Relationship" name="emergency_relationship" register={register} error={errors.emergency_relationship} />
                  <Input label="Phone Number" name="emergency_phone" register={register} error={errors.emergency_phone} />
               </div>
            </div>

            <div className="bg-white dark:bg-layout-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-5 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
                  <FiShield /> Legal ID
               </h3>
               <div className="space-y-4">
                  <Select 
                    label="ID Type" 
                    name="id_proof_type" 
                    register={register} 
                    error={errors.id_proof_type}
                    options={["Aadhar", "PAN", "Passport", "Voter ID"]} 
                  />
                  <Input label="ID Number" name="id_proof_number" register={register} error={errors.id_proof_number} />
               </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

// --- Reusable Input Component ---
const Input = ({ label, name, type = "text", register, error, disabled, value }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input 
      type={type} 
      {...(register ? register(name) : {})} 
      disabled={disabled}
      defaultValue={value}
      className={`w-full border rounded-lg px-3 py-2.5 text-sm transition-all outline-none
        ${disabled 
          ? "bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed" 
          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        }
      `}
    />
    {error && <p className="text-red-500 text-[10px] mt-1">{error.message}</p>}
  </div>
);

// --- Reusable Select Component ---
const Select = ({ label, name, register, error, options }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <select 
      {...register(name)} 
      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
    >
      <option value="">Select...</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-[10px] mt-1">{error.message}</p>}
  </div>
);

export default EditUser;
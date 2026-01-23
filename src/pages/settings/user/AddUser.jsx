import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { API } from "../../../constant";
import axios from "axios";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { 
  FiUserPlus, 
  FiShield, 
  FiUserCheck, 
  FiSave, 
  FiChevronDown,
  FiAlertCircle,
  FiLock,
  FiEye,
  FiEyeOff
} from "react-icons/fi";

// --- Validation Schema ---
const schema = yup.object().shape({
  employeeId: yup.string().required("Please select an employee"),
  password: yup.string().required("Password is required").min(6, "Min 6 characters"),
  role: yup.string().required("Please assign a role"),
});

const AddUser = ({ onclose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle State
  
  // Data State
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // --- 1. Watch Values ---
  const selectedEmployeeId = useWatch({ control, name: "employeeId" });
  const selectedRoleId = useWatch({ control, name: "role" }); 

  // --- 2. Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get(`${API}/employee/unassigned`, { withCredentials: true }),
          axios.get(`${API}/role/listForDropdown`, { withCredentials: true })
        ]);

        setUnassignedUsers(usersRes.data.data || []);
        setRoles(rolesRes.data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  // --- 3. Update User Preview Card ---
  useEffect(() => {
    if (selectedEmployeeId) {
      const user = unassignedUsers.find(u => u.employeeId === selectedEmployeeId);
      setSelectedUserDetails(user || null);
    } else {
      setSelectedUserDetails(null);
    }
  }, [selectedEmployeeId, unassignedUsers]);

  // --- 4. Submit Handler ---
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = { 
        role: data.role, 
        password: data.password, // Added Password to Payload
        status: "Active" 
      };

      await axios.put(
        `${API}/employee/update-access/${data.employeeId}`, 
        payload, 
        { withCredentials: true }
      );

      toast.success("User access granted successfully!");
      if (onSuccess) onSuccess();
      onclose();
    } catch (err) {
      console.error("Error adding user:", err);
      toast.error(err.response?.data?.message || "Failed to grant access");
    } finally {
      setLoading(false);
    }
  };

  // Helper for Role Description
  const selectedRoleDescription = roles.find(r => r._id === selectedRoleId)?.description;

  return (
    // --- 1. Overlay (Backdrop) ---
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font animation-fade-in">
      
      {/* --- 2. Modal Container --- */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all scale-100">
        
        {/* --- Header --- */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                <FiUserPlus size={20} />
              </span>
              Assign Role Access
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Grant system login to an employee</p>
          </div>
          
          <button 
            onClick={onclose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* --- Body (Scrollable Form) --- */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Field 1: Select Employee */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                Select Staff Member
              </label>
              <div className="relative group">
                  <select 
                      {...register("employeeId")}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-gray-400"
                  >
                      <option value="">-- Choose Unassigned Staff --</option>
                      {unassignedUsers.map((user) => (
                          <option key={user._id} value={user.employeeId}>
                              {user.name} — {user.employeeId}
                          </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400 group-hover:text-gray-600">
                      <FiChevronDown />
                  </div>
              </div>
              {errors.employeeId && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <FiAlertCircle /> {errors.employeeId.message}
                </p>
              )}
            </div>

            {/* Verification Card (Conditional) */}
            {selectedUserDetails && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                        <FiUserCheck size={22} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{selectedUserDetails.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUserDetails.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                           <span className="h-2 w-2 rounded-full bg-green-500"></span>
                           <span className="text-[10px] uppercase font-bold text-green-600 tracking-wide">Ready for Access</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Field 2: Password (NEW) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <FiLock /> Set Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter secure password"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all hover:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <FiAlertCircle /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Field 3: Assign Role */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <FiShield className="text-emerald-500" /> Assign System Role
              </label>
              <div className="relative group">
                  <select 
                      {...register("role")}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer hover:border-gray-400"
                  >
                      <option value="">-- Select Authority Level --</option>
                      {roles.map((role) => (
                          <option key={role._id} value={role._id}>
                              {role.roleName}
                          </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400 group-hover:text-gray-600">
                      <FiChevronDown />
                  </div>
              </div>
              {errors.role && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <FiAlertCircle /> {errors.role.message}
                </p>
              )}
              
              {/* Role Hint */}
              {selectedRoleDescription && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 italic">
                      "<span className="font-semibold not-italic text-gray-700 dark:text-gray-300">{selectedRoleDescription}</span>"
                  </div>
              )}
            </div>

            {/* --- Footer Buttons --- */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onclose}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="px-8 py-2.5 text-sm font-bold text-white bg-darkest-blue rounded-xl hover:bg-blue-900 shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <FiSave size={16} />
                )}
                {loading ? "Granting..." : "Grant Access"}
              </button>
            </div>

          </form>
        </div>
        
      </div>
    </div>
  );
};

export default AddUser;
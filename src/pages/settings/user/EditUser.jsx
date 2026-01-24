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
  FiUser,
  FiMail,
  FiBriefcase
} from "react-icons/fi";

// --- Validation Schema ---
const schema = yup.object().shape({
  role: yup.string().required("Please select a new role"),
});

// ✅ Receive 'item' directly from the Table component
const EditUser = ({ item, onclose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  // Use 'item' passed from parent, fallback to empty object to prevent crashes
  const user = item || {};

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset // Need reset to update form when item changes
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: user.role?._id || user.role || "" 
    }
  });

  // --- 1. Reset Form when Modal Opens/Item Changes ---
  useEffect(() => {
    if (user) {
      reset({
        role: user.role?._id || user.role || "" 
      });
    }
  }, [user, reset]);

  const selectedRoleId = useWatch({ control, name: "role" }); 

  // --- 2. Fetch Roles ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/role/listForDropdown`, { withCredentials: true });
        setRoles(res.data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load roles");
      }
    };
    fetchData();
  }, []);

  // --- 3. Submit Handler ---
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = { 
        employeeId: user.employeeId, 
        roleId: data.role 
      };

      await axios.put(
        `${API}/employee/role/re-assign`, 
        payload, 
        { withCredentials: true }
      );

      toast.success("User role updated successfully!");
      if (onUpdated) onUpdated();
      onclose();
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  // Helper for Role Description
  const selectedRoleDescription = roles.find(r => r._id === selectedRoleId)?.description;

  if (!user.employeeId) return null; // Don't render if no data

  return (
    // --- 1. Overlay (Fixed Modal Wrapper) ---
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font animation-fade-in">
      
      {/* --- 2. Modal Container --- */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all scale-100">
        
        {/* --- Header --- */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                <FiUserPlus size={20} />
              </span>
              Reassign User Role
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Modify system access level</p>
          </div>
          
          <button 
            onClick={onclose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* 1. User Identity Card (Read Only) */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 min-w-[3rem] rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xl font-bold text-gray-500 dark:text-gray-300">
                        {user.name?.charAt(0).toUpperCase() || <FiUser />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-3">{user.employeeId}</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700">
                                <FiBriefcase className="text-gray-400" />
                                <span className="truncate">{user.designation || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700">
                                <FiShield className="text-gray-400" />
                                {/* Show Role Name safely */}
                                <span className="truncate font-medium text-blue-600 dark:text-blue-400">
                                    {user.role?.roleName || "No Role"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500">
                    <FiMail /> {user.email}
                </div>
            </div>

            {/* 2. Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  Assign New Role
              </label>
              <div className="relative group">
                  <select 
                      {...register("role")}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-gray-400"
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
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 italic">
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
                disabled={loading}
                className="px-8 py-2.5 text-sm font-bold text-white bg-darkest-blue rounded-xl hover:bg-blue-900 shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <FiSave size={16} />
                )}
                {loading ? "Updating..." : "Update Access"}
              </button>
            </div>

          </form>
        </div>
        
      </div>
    </div>
  );
};

export default EditUser;
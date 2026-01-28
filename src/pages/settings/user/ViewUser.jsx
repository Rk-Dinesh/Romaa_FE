import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../../../constant";
import {
    FiArrowLeft,
    FiMapPin,
    FiShield,
    FiActivity,
    FiPhone,
    FiMail,
    FiCalendar,
    FiCheckCircle,
    FiEye,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiLayers,
    FiCornerDownRight,
    FiUser,
    FiGlobe,
} from "react-icons/fi";
import AssignSitesModal from "./AssignSiteModal";
import { toast } from "react-toastify";

const ViewUser = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState(location.state?.item || null);
    const [loading, setLoading] = useState(!location.state?.item);
    const [showSiteModal, setShowSiteModal] = useState(false);
    const [error, setError] = useState(null);

    const fetchUserData = async () => {
        const targetId = location.state?.item?.employeeId;

        if (!targetId) {
            setError("No user ID provided");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${API}/employee/getbyId/${targetId}`, {
                withCredentials: true
            });
            setUser(response.data.data);
        } catch (err) {
            console.error("Error fetching user:", err);
            setError("Failed to load user details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [location.state]);

    // --- Helpers ---
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "numeric", month: "long", year: "numeric"
        });
    };

    const hasActivePermissions = (data) => {
        if (!data) return false;
        if (data.read || data.create || data.edit || data.delete) return true;
        return Object.values(data).some(val => typeof val === 'object' && hasActivePermissions(val));
    };

    // 2. Handle Saving Sites
    const handleAssignSites = async (selectedSiteIds) => {
        try {
            // API call to update employee with new list of site IDs
            await axios.put(`${API}/employee/assign-projects`, { // Replace with your actual endpoint
                employeeId: user.employeeId,
                assignedProject: selectedSiteIds // Sending array of _ids
            }, { withCredentials: true });

            // Refresh User Data locally to reflect changes immediately
            setUser(prev => ({ ...prev, assignedProject: selectedSiteIds })); // Or fetch fresh data

            fetchUserData();
            toast.success("Sites assigned successfully!");
            setShowSiteModal(false);

            // Optional: Trigger a re-fetch if you want full object details immediately
            // fetchUserData(); 
        } catch (err) {
            console.error(err);
            toast.error("Failed to assign sites");
        }
    };

    // Extract initial IDs for the modal (handle if assignedProject is objects or strings)
    const getInitialSiteIds = () => {
        if (!user?.assignedProject) return [];
        if (Array.isArray(user.assignedProject)) {
            // If it's an array of objects, map to _id. If array of strings, return as is.
            return user.assignedProject.map(p => typeof p === 'object' ? p._id : p);
        }
        // If it's a single object (legacy data)
        return typeof user.assignedProject === 'object' ? [user.assignedProject._id] : [user.assignedProject];
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div></div>;
    if (error || !user) return <div className="flex h-screen items-center justify-center text-red-500 font-medium">{error || "User not found"}</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-overall_bg-dark font-layout-font pb-20">

            <div className="sticky top-0 z-30 bg-white/80 dark:bg-layout-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
                                <FiArrowLeft size={20} />
                            </button>

                            <div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {user.name}
                                    {user.status === 'Active'
                                        ? <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">ACTIVE</span>
                                        : <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200">INACTIVE</span>
                                    }
                                    
                                </h1>

                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    <span className="font-mono">{user.employeeId}</span>
                                    <span>•</span>
                                    <span>{user.designation}</span>
                                    <span className="font-semibold text-xs italic text-gray-900 dark:text-white">{user.accessMode || "No Access Mode"}</span>
                                </div>
                            </div>

                        </div>

                        <div className="hidden sm:flex items-center gap-3">




                            <button
                                onClick={() => setShowSiteModal(true)}
                                className=" flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-white bg-darkest-blue font-light   font-roboto-flex"
                            >
                                <FiMapPin /> Assign Sites
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">

                {/* --- Top Row: Profile & Contact --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                    {/* 1. Main Profile Card */}
                    <div className="lg:col-span-2 bg-white dark:bg-layout-dark rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Avatar */}
                            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>

                            {/* Info Grid */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                <DetailItem icon={<FiMail className="text-gray-400" />} label="Email" value={user.email} isLink prefix="mailto:" />
                                <DetailItem icon={<FiPhone className="text-gray-400" />} label="Phone" value={user.phone} isLink prefix="tel:" />
                                <DetailItem icon={<FiCalendar className="text-gray-400" />} label="Joined Date" value={formatDate(user.dateOfJoining)} />
                                <DetailItem icon={<FiUser className="text-gray-400" />} label="User Type" value={user.userType} />
                                
                            </div>


                        </div>
                        <div className="">
                            <span className=" w-3/4 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800 flex items-center gap-2">
                                <FiShield /> {user.role?.roleName || "No Role"}
                            </span>
                            <span className="font-semibold text-xs italic text-gray-900 dark:text-white">{user.designation || "No Designation"}</span><br />
                        </div>


                        {/* Address Strip */}
                        <div className="mt-6 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                                <FiMapPin className="text-red-500 mt-1 flex-shrink-0" />
                                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <span className="font-semibold text-gray-900 dark:text-white">Residential Address:</span><br />
                                    {user.address?.street}, {user.address?.city}, {user.address?.state} - <span className="font-mono">{user.address?.pincode}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Right Column: Assigned Sites & Emergency (Stacked) */}
                    <div className="space-y-6">

                        {/* A. Assigned Sites Card */}
                        <div className="bg-white dark:bg-layout-dark rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 h-fit">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <FiGlobe className="text-blue-500" /> Assigned Sites / Projects
                                </h3>
                                {/* Optional: Add an Edit/Manage button here if needed */}
                            </div>

                            {Array.isArray(user.assignedProject) && user.assignedProject.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {user.assignedProject.map((p, i) => (
                                        <div key={p._id || i} className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                            <div className="flex flex-col overflow-hidden mr-2">
                                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300 truncate" title={p.tender_project_name}>
                                                    {p.tender_project_name || "Untitled Project"}
                                                </span>
                                                <span className="text-[10px] font-mono font-medium text-blue-500 dark:text-blue-400">
                                                    {p.tender_id}
                                                </span>
                                            </div>
                                            <FiCheckCircle className="text-blue-500 dark:text-blue-400 flex-shrink-0" size={16} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <span className="text-xs text-gray-400 font-medium">No projects assigned currently</span>
                                </div>
                            )}
                        </div>

                        {/* B. Emergency Contact Card */}
                        <div className="bg-white dark:bg-layout-dark rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 h-fit relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FiActivity className="text-rose-500" /> Emergency Contact
                            </h3>

                            <div className="space-y-1">
                                <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                    {user.emergencyContact?.name || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">
                                    {user.emergencyContact?.relationship || "Relation N/A"}
                                </p>
                            </div>

                            {user.emergencyContact?.phone && (
                                <a
                                    href={`tel:${user.emergencyContact.phone}`}
                                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                                >
                                    <FiPhone size={14} /> {user.emergencyContact.phone}
                                </a>
                            )}
                        </div>

                    </div>
                </div>

                {/* --- Middle Row: Identity Proof --- */}
                <div className="bg-white dark:bg-layout-dark rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                        <FiShield size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Identity Proof ({user.idProof?.type})</p>
                        <p className="text-lg font-mono font-medium text-gray-900 dark:text-gray-200 mt-0.5 tracking-wide">
                            {user.idProof?.number || "Not Submitted"}
                        </p>
                    </div>
                </div>

                {/* --- Bottom Row: Role & Permissions --- */}
                {user.role?.permissions && hasActivePermissions(user.role.permissions) && (
                    <section className="animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                                Role Access & Permissions
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            {/* Header Row */}
                            <div className="grid grid-cols-12 bg-gray-50/80 dark:bg-gray-800/80 px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-6 sm:col-span-4">Module Name</div>
                                <div className="col-span-6 sm:col-span-8 text-right">Allowed Actions</div>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {Object.entries(user.role.permissions)
                                    .filter(([_, data]) => hasActivePermissions(data))
                                    .map(([moduleName, data]) => (
                                        <PermissionRow
                                            key={moduleName}
                                            name={moduleName}
                                            data={data}
                                            hasActivePermissions={hasActivePermissions}
                                        />
                                    ))}
                            </div>
                        </div>
                    </section>
                )}

            </div>
            {showSiteModal && (
                <AssignSitesModal
                    initialSelected={getInitialSiteIds()}
                    onClose={() => setShowSiteModal(false)}
                    onSave={handleAssignSites}
                />
            )}
        </div>
    );
};

// --- Sub-Components ---

const DetailItem = ({ icon, label, value, isLink, prefix }) => (
    <div>
        <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
            {icon} {label}
        </dt>
        <dd className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {isLink && value ? (
                <a href={`${prefix}${value}`} className="hover:text-blue-600 transition-colors">{value}</a>
            ) : (
                value || "-"
            )}
        </dd>
    </div>
);

const PermissionRow = ({ name, data, hasActivePermissions }) => {
    const isDirectActions = data.hasOwnProperty('read') || data.hasOwnProperty('create');

    if (isDirectActions) {
        return (
            <div className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="col-span-6 sm:col-span-4 flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <FiLayers size={16} />
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize text-sm">
                        {name.replace(/_/g, ' ')}
                    </span>
                </div>
                <div className="col-span-6 sm:col-span-8 flex justify-end">
                    <ActionTags actions={data} />
                </div>
            </div>
        );
    }

    const activeSubmodules = Object.entries(data).filter(([_, actions]) => hasActivePermissions(actions));

    return (
        <div className="group">
            {/* Parent Module Title */}
            <div className="bg-gray-50/50 dark:bg-gray-800/40 px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <FiLayers className="text-gray-400" size={14} />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {name.replace(/_/g, ' ')} Module
                </span>
            </div>

            {/* Child Rows */}
            {activeSubmodules.map(([subName, actions]) => (
                <div key={subName} className="grid grid-cols-12 px-6 py-3 items-center border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="col-span-6 sm:col-span-4 flex items-center gap-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-1">
                        <FiCornerDownRight className="text-gray-300" size={14} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize truncate" title={subName}>
                            {subName.replace(/_/g, ' ')}
                        </span>
                    </div>
                    <div className="col-span-6 sm:col-span-8 flex justify-end">
                        <ActionTags actions={actions} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const ActionTags = ({ actions }) => {
    return (
        <div className="flex flex-wrap gap-2 justify-end">
            {actions.read && <Pill label="View" color="blue" icon={<FiEye size={10} />} />}
            {actions.create && <Pill label="Create" color="emerald" icon={<FiPlus size={10} />} />}
            {actions.edit && <Pill label="Edit" color="amber" icon={<FiEdit2 size={10} />} />}
            {actions.delete && <Pill label="Delete" color="rose" icon={<FiTrash2 size={10} />} />}
        </div>
    );
};

const Pill = ({ label, color, icon }) => {
    const styles = {
        blue: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
        emerald: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
        amber: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
        rose: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${styles[color]}`}>
            {icon} {label}
        </span>
    );
};

export default ViewUser;
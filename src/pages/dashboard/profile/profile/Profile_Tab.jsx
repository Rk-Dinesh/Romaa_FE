import React, { useState } from "react";
import DonutChart from "../../../../components/DonutChart"; // Assuming component exists
import { sitecompleted, Projectcolor, leave } from "../../../../components/Data"; // Assuming data exists
import Dropdown from "../../../../components/Dropdown";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";
import { 
  FiMail, FiPhone, FiMapPin, FiBriefcase, FiShield, 
  FiCalendar, FiUser, FiSmartphone, FiMonitor 
} from "react-icons/fi";

const Profile_Tab = ({ user }) => {
  const [editprofile, setEditprofile] = useState(false);
  const [changepassword, setChangepassword] = useState(false);

  // --- Helpers ---
  const formatDate = (date) => new Date(date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric"
  });

  const dropdownItems = [
    { label: "Edit Profile", onClick: () => setEditprofile(true) },
    { label: "Change Password", onClick: () => setChangepassword(true) },
  ];

  return (
    <div className="grid grid-cols-12 gap-4 animate-fade-in-up">
      
      {/* --- Left Column: Identity Card --- */}
      <div className="col-span-12 md:col-span-4 lg:col-span-4 space-y-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          
          <div className="px-6 pb-6 text-center -mt-12 relative">
            <div className="absolute top-2 right-4">
               <Dropdown items={dropdownItems} />
            </div>

            {/* Avatar */}
            <div className="w-24 h-24 mx-auto bg-white rounded-2xl p-1 shadow-lg">
                <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-3xl font-bold text-blue-600">
                    {user.name?.charAt(0).toUpperCase()}
                </div>
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.designation}</p>
            
            <div className="flex justify-center gap-2 mt-3">
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600'}`}>
                    {user.status}
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded border bg-purple-50 text-purple-600 border-purple-200 flex items-center gap-1">
                    {user.accessMode === 'MOBILE' ? <FiSmartphone /> : user.accessMode === 'WEBSITE' ? <FiMonitor /> : <><FiMonitor/> + <FiSmartphone/></>}
                    {user.accessMode}
                </span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mt-6 border-t pt-4">
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">12</p>
                    <p className="text-xs text-gray-400 uppercase">Projects</p>
                </div>
                <div className="text-center border-l border-r border-gray-100">
                    <p className="text-lg font-bold text-gray-800">85%</p>
                    <p className="text-xs text-gray-400 uppercase">Tasks</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">4</p>
                    <p className="text-xs text-gray-400 uppercase">Years</p>
                </div>
            </div>
          </div>
        </div>

        {/* Charts (Existing) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <DonutChart title="Site Status" data={sitecompleted} colors={Projectcolor} project_name={false} />
        </div>
      </div>

      {/* --- Right Column: Detailed Info --- */}
      <div className="col-span-12 md:col-span-8 lg:col-span-8 space-y-3">
        
        {/* Personal Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <InfoItem icon={<FiBriefcase />} label="Employee ID" value={user.employeeId} />
                <InfoItem icon={<FiUser />} label="Role" value={user.role?.roleName} subValue={user.role?.description} />
                <InfoItem icon={<FiMail />} label="Email Address" value={user.email} />
                <InfoItem icon={<FiPhone />} label="Phone Number" value={user.phone} />
                <InfoItem icon={<FiCalendar />} label="Date of Joining" value={formatDate(user.dateOfJoining)} />
                <InfoItem icon={<FiShield />} label="User Type" value={user.userType} />
            </div>
        </div>

        {/* Address & ID */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2">Location & Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                    <div className="mt-1 text-gray-400"><FiMapPin /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Permanent Address</p>
                        <p className="text-sm text-gray-800 mt-1">
                            {user.address?.street}, <br />
                            {user.address?.city}, {user.address?.state} - {user.address?.pincode}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="mt-1 text-gray-400"><FiShield /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Identity Proof ({user.idProof?.type})</p>
                        <p className="text-sm text-gray-800 mt-1 font-mono tracking-wide">{user.idProof?.number}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Leave Stats (Existing Layout) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 grid grid-cols-2 gap-6">
            <div className="col-span-1 border-r border-gray-100 pr-4">
                <DonutChart title="Leave Balance" data={leave} colors={Projectcolor} project_name={false} />
            </div>
            <div className="col-span-1 flex flex-col justify-center space-y-3">
                <p className="text-lg font-bold text-gray-800 mb-2">Details</p>
                {['Sick Leave', 'Casual Leave', 'Privilege Leave'].map((l, i) => (
                    <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-500">{l}</span>
                        <span className="font-bold text-gray-800">5/12</span>
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* Modals */}
      {editprofile && <EditProfile data={user} onclose={() => setEditprofile(false)} />}
      {changepassword && <ChangePassword onclose={() => setChangepassword(false)} />}
    </div>
  );
};

// Reusable Row
const InfoItem = ({ icon, label, value, subValue }) => (
    <div className="flex gap-3">
        <div className="mt-0.5 text-gray-400 bg-gray-50 p-2 rounded-lg h-fit">{icon}</div>
        <div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value || "-"}</p>
            {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
    </div>
);

export default Profile_Tab;
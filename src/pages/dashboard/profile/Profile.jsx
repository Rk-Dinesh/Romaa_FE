import React, { useState, useEffect } from "react";
import Title from "../../../components/Title";
import Profile_Tab from "./profile/Profile_Tab";
import Leave from "./leave/Leave";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FiLogOut } from "react-icons/fi";
import { toast } from "react-toastify";
import { API } from "../../../constant";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  // --- 1. Load User Data from LocalStorage ---
  useEffect(() => {
    const storedUser = localStorage.getItem("crm_user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const tabs = [
    { id: "profile", label: "Profile Overview" },
    { id: "leave", label: "Leave Management" },
    { id: "document", label: "Documents" },
  ];

  const currentTabLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  // --- 2. Logout Logic ---
  const handleLogout = async () => {
    try {
      await axios.post(`${API}/employee/logout`, {}, { withCredentials: true });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout warning:", error);
    } finally {
      // Clear Local Storage & Auth Context
      localStorage.removeItem("crm_user");
      logout();
      navigate("/"); 
    }
  };

  if (!userData) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="font-layout-font">
      {/* --- Sticky Header --- */}
      <div className="sticky top-0 z-20 w-full bg-gray-50/90 backdrop-blur-sm pb-2 border-b border-gray-200">
        <div className="flex justify-between items-center py-4 px-4">
          <Title
            title="Dashboard"
            sub_title="My Account"
            page_title={currentTabLabel}
          />
          
          {/* Outer Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
          >
            <FiLogOut /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 mt-2">
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-white bg-darkest-blue shadow-md"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="p-4 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
        {activeTab === "profile" && <Profile_Tab user={userData} />}
        {activeTab === "leave" && <Leave />}
        {activeTab === "document" && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
            <p>Document module coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
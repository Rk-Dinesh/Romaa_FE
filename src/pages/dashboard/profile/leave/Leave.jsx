import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus, FiFilter, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { API } from "../../../../constant";
import ApplyLeaveModal from "./ApplyLeaveModal";
import LeaveActionModal from "./LeaveActionModal";

const Leave = () => {
  const [activeTab, setActiveTab] = useState("my-leaves"); // "my-leaves" or "team-requests"
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [isActionModalOpen, setActionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // User Data (Mock or from Context)
  const user = JSON.parse(localStorage.getItem("crm_user")) || {};
  
  // Balances (You would fetch this from Employee API)
  const balances = user.leaveBalance || { CL: 12, SL: 10, PL: 15 }; 

  // --- Fetch Data ---
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      let endpoint = activeTab === "my-leaves" 
        ? `${API}/leave/my-history?employeeId=${user._id}` 
        : `${API}/leave/team-pending?managerId=${user._id}`;
      
      const res = await axios.get(endpoint, { withCredentials: true });
      setLeaves(res.data.data || []);
    } catch (error) {
      console.error("Fetch Error", error);
      // toast.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [activeTab]);

  // --- Handlers ---
  const handleCancelLeave = async (leaveId) => {
    if(!window.confirm("Are you sure you want to cancel this leave?")) return;
    try {
      await axios.post(`${API}/leave/cancel`, { 
        leaveRequestId: leaveId, 
        cancelledBy: user._id 
      }, { withCredentials: true });
      toast.success("Leave cancelled successfully");
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    }
  };

  const openActionModal = (request) => {
    setSelectedRequest(request);
    setActionModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* 1. Statistics Cards (Visible on My Leaves) */}
      {activeTab === "my-leaves" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Casual Leave" value={balances.CL} total={12} color="bg-blue-50 text-blue-600" />
          <StatCard label="Sick Leave" value={balances.SL} total={12} color="bg-orange-50 text-orange-600" />
          <StatCard label="Privilege Leave" value={balances.PL} total={15} color="bg-purple-50 text-purple-600" />
          <StatCard label="Loss of Pay" value="0" total="-" color="bg-red-50 text-red-600" />
        </div>
      )}

      {/* 2. Toolbar & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-lg border border-gray-200 gap-3">
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("my-leaves")}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "my-leaves" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            My History
          </button>
          <button 
            onClick={() => setActiveTab("team-requests")}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "team-requests" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Team Requests
          </button>
        </div>

        {/* Action Button */}
        {activeTab === "my-leaves" && (
          <button 
            onClick={() => setApplyModalOpen(true)}
            className="flex items-center gap-2 bg-darkest-blue hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-sm"
          >
            <FiPlus /> Apply Leave
          </button>
        )}
      </div>

      {/* 3. The List/Table Area */}
      <div className="bg-white border border-gray-200 rounded-xl flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Dates</th>
                <th className="px-6 py-3 font-medium">Days</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                {activeTab === "team-requests" && <th className="px-6 py-3 font-medium">Employee</th>}
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">No records found.</td></tr>
              ) : (
                leaves.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-700">{item.leaveType} <span className="text-xs text-gray-400 font-normal block">{item.requestType}</span></td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(item.fromDate).toLocaleDateString()} 
                      <span className="text-gray-400 mx-1">➜</span> 
                      {new Date(item.toDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.totalDays}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                    
                    {activeTab === "team-requests" && (
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            {item.employeeId?.photoUrl ? <img src={item.employeeId.photoUrl} className="w-6 h-6 rounded-full"/> : <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">{item.employeeId?.name?.[0]}</div>}
                            <span className="text-gray-700">{item.employeeId?.name}</span>
                         </div>
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      {/* Actions for Employee: Cancel Pending Leave */}
                      {activeTab === "my-leaves" && item.status === "Pending" && (
                        <button 
                          onClick={() => handleCancelLeave(item._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium underline"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Actions for Manager: Approve/Reject */}
                      {activeTab === "team-requests" && item.status === "Pending" && (
                        <button 
                          onClick={() => openActionModal(item)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-medium"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modals --- */}
      {isApplyModalOpen && (
        <ApplyLeaveModal 
          isOpen={isApplyModalOpen} 
          onClose={() => setApplyModalOpen(false)} 
          onSuccess={fetchLeaves} 
          user={user}
        />
      )}

      {isActionModalOpen && selectedRequest && (
        <LeaveActionModal 
          isOpen={isActionModalOpen}
          onClose={() => setActionModalOpen(false)}
          onSuccess={fetchLeaves}
          request={selectedRequest}
          user={user}
        />
      )}

    </div>
  );
};

// --- Helper Components ---

const StatCard = ({ label, value, total, color }) => (
  <div className={`p-4 rounded-xl border border-transparent ${color.replace("text-", "bg-").replace("50", "50/50")} flex flex-col gap-1`}>
    <span className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</span>
    <div className="flex items-end gap-1">
      <span className="text-2xl font-bold">{value}</span>
      {total !== "-" && <span className="text-xs mb-1 opacity-60">/ {total}</span>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
    Approved: "bg-green-50 text-green-600 border-green-200",
    Rejected: "bg-red-50 text-red-600 border-red-200",
    Cancelled: "bg-gray-50 text-gray-500 border-gray-200",
    "On Leave": "bg-blue-50 text-blue-600 border-blue-200"
  };

  const icons = {
    Pending: <FiClock />,
    Approved: <FiCheckCircle />,
    Rejected: <FiXCircle />,
    Cancelled: <FiAlertCircle />
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.Pending}`}>
      {icons[status]} {status}
    </span>
  );
};

export default Leave;
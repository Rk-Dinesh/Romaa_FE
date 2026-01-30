import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Search, Filter, MoreHorizontal, MapPin, AlertTriangle, 
  CheckCircle2, Calendar, Zap, Truck, Activity, 
  Eye, RefreshCw, ArrowRightLeft, X, AlertCircle 
} from "lucide-react";
import { API } from "../../../../constant";
import { toast } from "react-toastify";


const MachineryTable = () => {
  const navigate = useNavigate();
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeActionId, setActiveActionId] = useState(null); // For dropdown menu

  // --- Modals State ---
  const [modalType, setModalType] = useState(null); // 'STATUS' or 'TRANSFER'
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [statusForm, setStatusForm] = useState({ status: "", remarks: "" });
  const [transferForm, setTransferForm] = useState({ projectId: "", currentSite: "" });

  // --- Data Fetching ---
  const fetchMachinery = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/machineryasset/getall/assets`);
      setMachinery(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinery();
  }, []);

  // --- Handlers ---
  const handleActionClick = (id) => {
    setActiveActionId(activeActionId === id ? null : id);
  };

  const openModal = (type, asset) => {
    setModalType(type);
    setSelectedAsset(asset);
    setActiveActionId(null); // Close menu
    
    if (type === 'STATUS') {
      setStatusForm({ status: asset.currentStatus, remarks: "" });
    } else if (type === 'TRANSFER') {
      setTransferForm({ projectId: asset.projectId, currentSite: asset.currentSite });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedAsset(null);
    setIsSubmitting(false);
  };

  // --- API Submit Handlers ---
  
  const submitStatusUpdate = async () => {
    if (!window.confirm("Are you sure you want to update the status?")) return;
    
    try {
      setIsSubmitting(true);
      const res = await axios.put(`${API}/machineryasset/status/${selectedAsset.assetId}`, statusForm);
      if (res.data.status) {
        toast.success("Status updated successfully");
        fetchMachinery(); // Refresh list
        closeModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTransfer = async () => {
    if (!window.confirm(`Transfer this asset to ${transferForm.currentSite}?`)) return;

    try {
      setIsSubmitting(true);
      const res = await axios.put(`${API}/machineryasset/transfer/${selectedAsset.assetId}`, transferForm);
      if (res.data.status) {
        toast.success("Asset transferred successfully");
        fetchMachinery();
        closeModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper: Compliance Summary ---
  const getComplianceSummary = (compliance) => {
    if (!compliance) return { status: "Unknown", color: "text-gray-400" };
    const today = new Date();
    const expiryFields = [
      { label: "Insurance", date: compliance.insuranceExpiry },
      { label: "Tax", date: compliance.roadTaxExpiry },
      { label: "Fitness", date: compliance.fitnessCertExpiry },
      { label: "Pollution", date: compliance.pollutionCertExpiry },
    ];

    let expiredCount = 0;
    let warningCount = 0;

    expiryFields.forEach((item) => {
      if (item.date) {
        const d = new Date(item.date);
        const daysLeft = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) expiredCount++;
        else if (daysLeft < 30) warningCount++;
      }
    });

    if (expiredCount > 0) return { 
      status: "Critical", 
      label: `${expiredCount} Expired`, 
      color: "text-red-600 dark:text-red-400", 
      bg: "bg-red-100 dark:bg-red-900/30",
      icon: AlertTriangle 
    };
    if (warningCount > 0) return { 
      status: "Warning", 
      label: `${warningCount} Expiring Soon`, 
      color: "text-amber-600 dark:text-amber-400", 
      bg: "bg-amber-100 dark:bg-amber-900/30",
      icon: AlertTriangle
    };
    return { 
      status: "Good", 
      label: "Compliant", 
      color: "text-emerald-600 dark:text-emerald-400", 
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      icon: CheckCircle2 
    };
  };

  // --- Filter Logic ---
  const filteredData = useMemo(() => {
    return machinery.filter(item => {
      const matchesSearch = 
        item.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assetId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || item.currentStatus?.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [machinery, searchTerm, statusFilter]);

  // --- Stats ---
  const stats = {
    total: machinery.length,
    active: machinery.filter(m => m.currentStatus === 'Active').length,
    maintenance: machinery.filter(m => m.currentStatus === 'Maintenance').length,
    idle: machinery.filter(m => m.currentStatus === 'Idle').length,
  };

  return (
    <div className="space-y-3 font-sans text-sm p-2 text-slate-800 dark:text-slate-200 relative min-h-screen">
      
      {/* --- Dashboard Header --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: stats.total, icon: Truck, color: "text-blue-600", border: "border-l-4 border-blue-600" },
          { label: "Active", value: stats.active, icon: Activity, color: "text-emerald-600", border: "border-l-4 border-emerald-600" },
          { label: "Maintenance", value: stats.maintenance, icon: Zap, color: "text-amber-600", border: "border-l-4 border-amber-600" },
          { label: "Idle", value: stats.idle, icon: Calendar, color: "text-slate-500", border: "border-l-4 border-slate-500" },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 ${stat.border}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</p>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* --- Toolbar --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-t-lg border-x border-t border-slate-200 dark:border-slate-800">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {["ALL", "ACTIVE", "MAINTENANCE", "IDLE"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                statusFilter === tab
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative group w-full md:w-auto">
          <Search className="absolute left-3 top-2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search ID, Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* --- Table --- */}
      <div className="overflow-visible border border-slate-200 dark:border-slate-800 rounded-b-lg shadow-sm bg-white dark:bg-slate-900">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wide">
            <tr>
              <th className="p-4 w-14 text-center border-b dark:border-slate-800">S.No</th>
              <th className="p-4 border-b dark:border-slate-800">Asset Identity</th>
              <th className="p-4 border-b dark:border-slate-800">Specification</th>
              <th className="p-4 border-b dark:border-slate-800">Deployment</th>
              <th className="p-4 border-b dark:border-slate-800">Compliance</th>
              <th className="p-4 text-center border-b dark:border-slate-800">Status</th>
              <th className="p-4 text-right border-b dark:border-slate-800">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-500">Loading Fleet Data...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-400 italic">No assets found.</td></tr>
            ) : (
              filteredData.map((item, index) => {
                const comp = getComplianceSummary(item.compliance);
                const ComplianceIcon = comp.icon;

                return (
                  <tr key={item._id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors even:bg-slate-50/30 dark:even:bg-slate-800/30 relative">
                    <td className="p-4 text-center text-slate-400 text-xs ">{index + 1}</td>

                    <td className="p-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{item.assetName}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px]  bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                            {item.assetId}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ">
                          SN: {item.serialNumber}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <div className="font-medium">{item.assetType}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{item.modelNumber}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>{item.fuelType}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.currentSite}</p>
                          <p className="text-[11px] text-slate-500  mt-0.5">ID: {item.projectId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${comp.bg} ${comp.color} border-transparent`}>
                        <ComplianceIcon className="w-3.5 h-3.5" />
                        {comp.label}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        item.currentStatus === 'Active' 
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
                          : item.currentStatus === 'Maintenance'
                          ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                      }`}>
                        {item.currentStatus}
                      </span>
                    </td>

                    {/* --- ACTIONS MENU --- */}
                    <td className="p-4 text-right relative">
                      <button 
                        onClick={() => handleActionClick(item._id)}
                        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {/* Dropdown Popup */}
                      {activeActionId === item._id && (
                        <div className="absolute right-8 top-8 z-50 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 animate-in fade-in zoom-in-95 duration-100">
                          <button 
                            onClick={() => navigate(`/settings/assets/details/${item.assetId}`)}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4 text-blue-500" /> View Details
                          </button>
                          
                          <button 
                            onClick={() => openModal('STATUS', item)}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4 text-orange-500" /> Update Status
                          </button>
                          
                          <button 
                            onClick={() => openModal('TRANSFER', item)}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                          >
                            <ArrowRightLeft className="w-4 h-4 text-emerald-500" /> Transfer Asset
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Backdrop for closing menu */}
      {activeActionId && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActiveActionId(null)} />
      )}

      {/* --- MODAL (Shared) --- */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {modalType === 'STATUS' ? <RefreshCw className="text-orange-500 w-5 h-5"/> : <ArrowRightLeft className="text-emerald-500 w-5 h-5"/>}
                {modalType === 'STATUS' ? "Update Status" : "Transfer Asset"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Selected Asset</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedAsset.assetName}</p>
                  <p className="text-xs text-slate-500 ">{selectedAsset.assetId}</p>
                </div>
              </div>

              {/* Status Form */}
              {modalType === 'STATUS' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">New Status</label>
                    <select 
                      className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({...statusForm, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Idle">Idle</option>
                      <option value="Breakdown">Breakdown</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Remarks</label>
                    <textarea 
                      className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      rows="3"
                      placeholder="Reason for status change..."
                      value={statusForm.remarks}
                      onChange={(e) => setStatusForm({...statusForm, remarks: e.target.value})}
                    />
                  </div>
                </>
              )}

              {/* Transfer Form */}
              {modalType === 'TRANSFER' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">New Project ID</label>
                    <input 
                      type="text"
                      className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      value={transferForm.projectId}
                      onChange={(e) => setTransferForm({...transferForm, projectId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">New Site Location</label>
                    <input 
                      type="text"
                      className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      value={transferForm.currentSite}
                      onChange={(e) => setTransferForm({...transferForm, currentSite: e.target.value})}
                    />
                  </div>
                </>
              )}

            
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={modalType === 'STATUS' ? submitStatusUpdate : submitTransfer}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="animate-spin w-4 h-4"/> : <CheckCircle2 className="w-4 h-4"/>}
                Confirm {modalType === 'STATUS' ? "Update" : "Transfer"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MachineryTable;
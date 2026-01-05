import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../../../constant";
import { 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  Filter
} from "lucide-react";

// --- Components ---

// Progress Bar Component
const ProgressBar = ({ received, total }) => {
  // Prevent division by zero
  const percentage = total > 0 ? Math.min((received / total) * 100, 100) : 0;
  
  let colorClass = "bg-blue-500";
  if (percentage >= 100) colorClass = "bg-green-500";
  else if (percentage > 80) colorClass = "bg-yellow-500";

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
      <div 
        className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

// Stock Status Badge
const StockStatusBadge = ({ currentStock, pendingProcurement }) => {
  if (currentStock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <AlertTriangle size={12} /> Out of Stock
      </span>
    );
  }
  if (pendingProcurement <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 size={12} /> Fully Stocked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
      <Package size={12} /> In Stock
    </span>
  );
};

const StockRegister = () => {
  const tenderId = localStorage.getItem("tenderId");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/material/list/${tenderId}`);
      // Filter only items that have had some activity (Received > 0)
      // Or you can show all if you prefer
      const data = res.data.data || [];
      
      // Optional: If you want to show ALL items regardless of receipt
      setMaterials(data); 
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) fetchMaterials();
  }, [tenderId]);

  // Filtering Logic
  const filteredMaterials = materials.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] p-4 sm:p-6 font-roboto-flex">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Register</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time inventory tracking and material status
          </p>
        </div>
      </div>

      {/* --- Search & Filter Bar --- */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search materials..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="MT-BL">Bulk (MT-BL)</option>
            <option value="MT-CM">Consumable (MT-CM)</option>
          </select>
        </div>
      </div>

      {/* --- Content Grid --- */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Package size={48} className="mx-auto mb-3 opacity-20" />
          <p>No materials found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMaterials.map((item) => (
            <div 
              key={item.item_id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-2" title={item.description}>
                    {item.description}
                  </h3>
                  <StockStatusBadge 
                    currentStock={item.current_stock_on_hand} 
                    pendingProcurement={item.pending_procurement_qty} 
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-medium">
                    {item.category}
                  </span>
                  <span>•</span>
                  <span>Unit: {item.unit}</span>
                </div>
              </div>

              {/* Card Body: Stats */}
              <div className="p-5 space-y-4">
                
                {/* 1. Current Stock (Big Number) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Current Stock</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {item.current_stock_on_hand?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Received vs Issued Grid */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                      <ArrowDownToLine size={12} /> Received
                    </span>
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {item.total_received_qty?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-gray-200 dark:border-gray-700 pl-4">
                    <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <ArrowUpFromLine size={12} /> Issued
                    </span>
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {item.total_issued_qty?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 3. Budget Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress vs Budget</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.total_received_qty} / {item.total_budgeted_qty?.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar received={item.total_received_qty} total={item.total_budgeted_qty} />
                  
                  {item.pending_procurement_qty > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1 text-right">
                      Pending: {item.pending_procurement_qty?.toLocaleString()}
                    </p>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockRegister;
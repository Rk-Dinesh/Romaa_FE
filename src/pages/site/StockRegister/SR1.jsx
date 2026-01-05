import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API } from "../../../constant";
import { 
  Search, 
  LayoutGrid, 
  List, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Package,
  Layers,
  ChevronRight,
  AlertOctagon
} from "lucide-react";

const StockRegister = () => {
  const tenderId = localStorage.getItem("tenderId");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Fetch Data
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/material/list/${tenderId}`);
      setMaterials(res.data.data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) fetchMaterials();
  }, [tenderId]);

  // Derived Data for Sidebar Counts
  const counts = useMemo(() => {
    return {
      All: materials.length,
      "MT-BL": materials.filter(m => m.category === "MT-BL").length,
      "MT-CM": materials.filter(m => m.category === "MT-CM").length,
      "Low Stock": materials.filter(m => m.current_stock_on_hand === 0).length,
    };
  }, [materials]);

  // Filtering Logic
  const filteredData = materials.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "All") return matchesSearch;
    if (activeFilter === "Low Stock") return matchesSearch && item.current_stock_on_hand === 0;
    return matchesSearch && item.category === activeFilter;
  });

  // Helper for Sidebar Button
  const FilterLink = ({ label, category, icon: Icon }) => (
    <button
      onClick={() => setActiveFilter(category)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
        activeFilter === category
          ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={activeFilter === category ? "text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
        activeFilter === category 
          ? "bg-blue-500 text-white" 
          : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
      }`}>
        {counts[category] || 0}
      </span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0b0f19] font-roboto-flex overflow-hidden">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0f19] flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutGrid className="text-blue-600" /> Stock Register
          </h1>
          <p className="text-xs text-gray-500 mt-1 pl-8">Inventory Management</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Overview</p>
          <FilterLink label="All Materials" category="All" icon={List} />
          <FilterLink label="Low Stock Alerts" category="Low Stock" icon={AlertOctagon} />

          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Categories</p>
          <FilterLink label="Bulk Items" category="MT-BL" icon={Layers} />
          <FilterLink label="Consumables" category="MT-CM" icon={Package} />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Value on Site</p>
            {/* Mock calculation for total value if unit_rate exists */}
            <p className="text-lg font-bold text-blue-800 dark:text-blue-200 mt-1">
              ₹ {materials.reduce((acc, i) => acc + (i.current_stock_on_hand * (i.unit_rate || 0)), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 dark:border-gray-800 bg-white/50 backdrop-blur-sm dark:bg-[#0b0f19]/50">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {activeFilter === "All" ? "All Materials" : activeFilter === "MT-BL" ? "Bulk Materials" : activeFilter}
          </h2>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </header>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Package size={48} strokeWidth={1} className="mb-4 opacity-30" />
              <p>No materials found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header Row */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-4">Item Details</div>
                <div className="col-span-2 text-center">Unit</div>
                <div className="col-span-2 text-center">Opening </div>
                <div className="col-span-2 text-right">Issued</div>
                <div className="col-span-2 text-right">Available</div>
              </div>

              {/* Data Rows */}
              {filteredData.map((item) => (
                <div 
                  key={item.item_id}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-center">
                    
                    {/* Item Info */}
                    <div className="col-span-4 flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 ${
                        item.current_stock_on_hand > 0 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      }`}>
                        {item.description.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {item.description}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                      </div>
                    </div>

                    {/* Unit */}
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {item.unit}
                      </span>
                    </div>

                    {/* Inward */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {item.total_received_qty?.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-green-600 flex items-center justify-end gap-1">
                        <ArrowDownCircle size={10} /> Received
                      </p>
                    </div>

                    {/* Outward */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {item.total_issued_qty?.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-orange-600 flex items-center justify-end gap-1">
                        <ArrowUpCircle size={10} /> Issued
                      </p>
                    </div>

                    {/* Available Stock */}
                    <div className="col-span-2 flex items-center justify-end gap-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          item.current_stock_on_hand === 0 ? "text-red-600" : "text-gray-900 dark:text-white"
                        }`}>
                          {item.current_stock_on_hand?.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400">Stock</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>

                  </div>
                  
                  {/* Stock Health Bar (Visual Indicator) */}
                  {item.total_received_qty > 0 && (
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 mt-0 overflow-hidden rounded-b-xl">
                      {/* Calculate remaining percentage */}
                      <div 
                        className={`h-full ${item.current_stock_on_hand === 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((item.current_stock_on_hand / item.total_received_qty) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StockRegister;
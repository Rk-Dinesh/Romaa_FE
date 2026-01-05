import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API } from "../../../constant";
import { 
  Search, 
  Download, 
  Filter, 
  AlertCircle, 
  PackageCheck, 
  Layers, 
  ArrowRightLeft
} from "lucide-react";

// --- Sub-Components ---

const MetricCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-start justify-between shadow-sm">
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
      {subtext && <p className={`text-xs mt-1 font-medium ${color}`}>{subtext}</p>}
    </div>
    <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('600', '50')} dark:bg-opacity-10`}>
      <Icon size={20} className={color} />
    </div>
  </div>
);

const StockLevelBar = ({ current, total }) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  
  let color = "bg-blue-500";
  if (percentage < 20) color = "bg-red-500";
  else if (percentage < 50) color = "bg-amber-500";
  else if (percentage > 100) color = "bg-purple-500"; // Overstocked

  return (
    <div className="w-24">
      <div className="flex justify-between text-[10px] mb-1 text-gray-500">
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full dark:bg-gray-700 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const StockRegister = () => {
  const tenderId = localStorage.getItem("tenderId");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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

  // Derived Stats
  const stats = useMemo(() => {
    const totalItems = materials.length;
    const lowStock = materials.filter(m => m.current_stock_on_hand === 0).length;
    const totalReceived = materials.reduce((acc, curr) => acc + (curr.total_received_qty || 0), 0);
    const totalIssued = materials.reduce((acc, curr) => acc + (curr.total_issued_qty || 0), 0);
    return { totalItems, lowStock, totalReceived, totalIssued };
  }, [materials]);

  // Filter Data
  const filteredData = materials.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0b0f19] font-roboto-flex overflow-hidden">
      
      {/* --- 1. Top Metrics Bar --- */}
      <div className="px-6 pt-6 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Materials" 
            value={stats.totalItems} 
            subtext="Active Inventory"
            icon={Layers} 
            color="text-blue-600" 
          />
          <MetricCard 
            title="Low Stock Alerts" 
            value={stats.lowStock} 
            subtext="Items with 0 stock"
            icon={AlertCircle} 
            color="text-red-600" 
          />
          <MetricCard 
            title="Total Inward" 
            value={stats.totalReceived.toLocaleString()} 
            subtext="Lifetime Received"
            icon={PackageCheck} 
            color="text-green-600" 
          />
          <MetricCard 
            title="Total Outward" 
            value={stats.totalIssued.toLocaleString()} 
            subtext="Lifetime Issued"
            icon={ArrowRightLeft} 
            color="text-orange-600" 
          />
        </div>
      </div>

      {/* --- 2. Toolbar & Filters --- */}
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          
          {/* Category Tabs */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {["All", "MT-BL", "MT-CM"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeCategory === cat
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {cat === "All" ? "All Items" : cat === "MT-BL" ? "Bulk" : "Consumable"}
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search material..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none border-b border-gray-200 dark:border-gray-600 focus:border-blue-500 text-gray-700 dark:text-gray-200"
              />
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Export CSV">
              <Download size={18} />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Filter">
              <Filter size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* --- 3. Data Grid --- */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-0 z-10">
            <div className="col-span-4">Material Details</div>
            <div className="col-span-2 text-center">Unit</div>
            <div className="col-span-2 text-center">Budgeted</div>
            <div className="col-span-2">Stock Level</div>
            <div className="col-span-2 text-right">Available</div>
          </div>

          {/* Table Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>No materials found.</p>
              </div>
            ) : (
              filteredData.map((item, index) => (
                <div 
                  key={item.item_id || index}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors items-center group"
                >
                  {/* Material Name & Cat */}
                  <div className="col-span-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={item.description}>
                      {item.description}
                    </p>
                    <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {item.category}
                    </span>
                  </div>

                  {/* Unit */}
                  <div className="col-span-2 text-center text-sm text-gray-500 dark:text-gray-400">
                    {item.unit}
                  </div>

                  {/* Budgeted */}
                  <div className="col-span-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                    {item.total_budgeted_qty?.toLocaleString()}
                  </div>

                  {/* Stock Level Bar */}
                  <div className="col-span-2 flex justify-center">
                    <StockLevelBar current={item.current_stock_on_hand} total={item.total_budgeted_qty} />
                  </div>

                  {/* Available & Status */}
                  <div className="col-span-2 text-right">
                    <p className={`text-lg font-bold ${item.current_stock_on_hand > 0 ? "text-gray-900 dark:text-white" : "text-red-500"}`}>
                      {item.current_stock_on_hand?.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      In Stock
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
            <span>Showing {filteredData.length} items</span>
            <span>Last updated: Just now</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StockRegister;
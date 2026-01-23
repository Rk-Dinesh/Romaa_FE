import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../../../components/Title"; // Keep your existing Title component
import axios from "axios";
import { API } from "../../../constant"; // Keep your constant
import { toast } from "react-toastify";
import { FiChevronDown, FiChevronRight, FiCheck } from "react-icons/fi";

// --- Configuration Data (Matches your Mongoose Schema) ---
const MODULES_CONFIG = [
  {
    key: "dashboard",
    label: "Dashboard",
    hasSubModules: false,
  },
  {
    key: "tender",
    label: "Tender",
    hasSubModules: true,
    subModules: [
      { key: "clients", label: "Clients" },
      { key: "tenders", label: "Tenders" },
      { key: "dlp", label: "DLP" },
      { key: "emd", label: "EMD" },
      { key: "security_deposit", label: "Security Deposit" },
      { key: "project_penalty", label: "Project Penalty" },
    ],
  },
  {
    key: "project",
    label: "Projects",
    hasSubModules: true,
    subModules: [
      { key: "boq_cost", label: "BOQ Cost" },
      { key: "detailed_estimate", label: "Detailed Estimate" },
      { key: "drawing_boq", label: "Drawing vs BOQ" },
      { key: "wbs", label: "WBS" },
      { key: "schedule", label: "Schedule" },
      { key: "wo_issuance", label: "WO Issuance" },
      { key: "client_billing", label: "Client Billing" },
      { key: "work_progress", label: "Work Progress" },
      { key: "material_quantity", label: "Material Quantity" },
      { key: "stocks", label: "Stocks" },
      { key: "assets", label: "Assets" },
    ],
  },
  {
    key: "purchase",
    label: "Purchase",
    hasSubModules: true,
    subModules: [
      { key: "vendor_supplier", label: "Vendor & Supplier" },
      { key: "request", label: "Purchase Request" },
      { key: "enquiry", label: "Enquiry" },
      { key: "order", label: "Order" },
      { key: "goods_receipt", label: "Goods Receipt" },
      { key: "bill", label: "Purchase Bill" },
      { key: "machinery_tracking", label: "Machinery Tracking" },
      { key: "stocks", label: "Stocks" },
      { key: "assets", label: "Assets" },
    ],
  },
  {
    key: "site",
    label: "Site",
    hasSubModules: true,
    subModules: [
      { key: "boq_site", label: "BOQ Site" },
      { key: "detailed_estimate", label: "Detailed Estimate" },
      { key: "site_drawing", label: "Site Drawing" },
      { key: "purchase_request", label: "Purchase Request" },
      { key: "material_received", label: "Material Received" },
      { key: "material_issued", label: "Material Issued" },
      { key: "stock_register", label: "Stock Register" },
      { key: "work_done", label: "Work Done" },
      { key: "daily_labour_report", label: "Daily Labour Report" },
      { key: "machinery_entry", label: "Machinery Entry" },
      { key: "site_assets", label: "Site Assets" },
      { key: "weekly_billing", label: "Weekly Billing" },
      { key: "reconciliation", label: "Reconciliation" },
      { key: "planned_vs_achieved", label: "Planned vs Achieved" },
    ],
  },
  {
    key: "hr",
    label: "HR",
    hasSubModules: true,
    subModules: [
      { key: "employee", label: "Employee" },
      { key: "attendance", label: "Attendance" },
      { key: "leave", label: "Leave" },
      { key: "payroll", label: "Payroll" },
      { key: "contract_nmr", label: "Contract & NMR" },
      { key: "nmr", label: "NMR" },
      { key: "nmr_attendance", label: "NMR Attendance" },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    hasSubModules: true,
    subModules: [
      { key: "client_billing", label: "Client Billing" },
      { key: "purchase_bill", label: "Purchase Bill" },
      { key: "contractor_bill", label: "Contractor Bill" },
      { key: "debit_credit_note", label: "Debit/Credit Note" },
      { key: "internal_transfer", label: "Internal Transfer" },
      { key: "bank_transaction", label: "Bank Transaction" },
      { key: "journal_entry", label: "Journal Entry" },
      { key: "banks", label: "Banks" },
      { key: "tds", label: "TDS" },
      { key: "cash_entry", label: "Cash Entry" },
      { key: "ledger_entry", label: "Ledger Entry" },
      { key: "supplier_outstanding", label: "Supplier Outstanding" },
      { key: "overall_expenses", label: "Overall Expenses" },
    ],
  },
  {
    key: "report",
    label: "Reports",
    hasSubModules: true,
    subModules: [
      { key: "project_dashboard", label: "Project Dashboard" },
      { key: "work_analysis", label: "Work Analysis" },
      { key: "client_billing", label: "Client Billing" },
      { key: "financial_report", label: "Financial Report" },
      { key: "pnl", label: "P&L" },
      { key: "cash_flow", label: "Cash Flow" },
      { key: "expenses_report", label: "Expenses Report" },
      { key: "vendor_report", label: "Vendor Report" },
      { key: "reconciliation", label: "Reconciliation" },
      { key: "actual_vs_billed", label: "Actual vs Billed" },
      { key: "cost_to_complete", label: "Cost to Complete" },
      { key: "planned_vs_actual", label: "Planned vs Actual" },
      { key: "labour_productivity", label: "Labour Productivity" },
      { key: "machine_productivity", label: "Machine Productivity" },
      { key: "collection_projection", label: "Collection Projection" },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    hasSubModules: true,
    subModules: [
      { key: "user", label: "User" },
      { key: "roles", label: "Roles" },
      { key: "master", label: "Master" },
      { key: "assets", label: "Assets" },
    ],
  },
];

const ACTIONS = ["read", "create", "edit", "delete"];

const AddRoles = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State for permissions object
  // Structure: { module: { subModule: { read: true, ... } } }
  const [permissions, setPermissions] = useState({});

  // State for expanded accordion items
  const [expandedModules, setExpandedModules] = useState({});

  // Toggle Accordion
  const toggleModule = (moduleKey) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  // Check Helper
  const isChecked = (moduleKey, subModuleKey, action) => {
    if (subModuleKey) {
      return permissions[moduleKey]?.[subModuleKey]?.[action] || false;
    }
    return permissions[moduleKey]?.[action] || false; // For simple modules like Dashboard
  };

  // Handle Checkbox Change
  const handlePermissionChange = (moduleKey, subModuleKey, action) => {
    setPermissions((prev) => {
      const newPerms = { ...prev };
      
      // Initialize if undefined
      if (!newPerms[moduleKey]) newPerms[moduleKey] = {};
      
      if (subModuleKey) {
        if (!newPerms[moduleKey][subModuleKey]) newPerms[moduleKey][subModuleKey] = {};
        
        // Toggle value
        newPerms[moduleKey][subModuleKey][action] = !newPerms[moduleKey][subModuleKey][action];
      } else {
        // Simple module (like Dashboard)
        newPerms[moduleKey][action] = !newPerms[moduleKey][action];
      }
      return newPerms;
    });
  };

  // Handle "Select All" for a Row (Module/SubModule)
  const toggleRow = (moduleKey, subModuleKey, selectAll) => {
    setPermissions((prev) => {
      const newPerms = { ...prev };
      if (!newPerms[moduleKey]) newPerms[moduleKey] = {};

      const actionsToSet = {};
      ACTIONS.forEach(a => actionsToSet[a] = selectAll);

      if (subModuleKey) {
        newPerms[moduleKey][subModuleKey] = actionsToSet;
      } else {
        // If it's a parent module row being toggled (and it has no children, like Dashboard)
        newPerms[moduleKey] = actionsToSet;
      }
      return newPerms;
    });
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    const payload = {
      roleName: roleName,
      description: description,
      permissions: permissions,
    };

    console.log("Sending Payload:", JSON.stringify(payload, null, 2));

    try {
      setLoading(true);
      const response = await axios.post(`${API}/role/create`, payload, {
        withCredentials: true,
      });

      if (response.data.status) {
        toast.success("Role created successfully!");
        navigate("/settings/roles");
      } else {
        toast.error(response.data.message || "Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error(error.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col font-layout-font">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <Title
          title="Settings"
          sub_title="Role Access"
          page_title="Create New Role"
        />
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/settings/roles")}
            className="px-6 py-2 rounded-md border border-darkest-blue text-darkest-blue dark:border-white dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-8 py-2 rounded-md text-white shadow-md transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-darkest-blue hover:bg-blue-900"
            }`}
          >
            {loading ? "Saving..." : "Save Role"}
          </button>
        </div>
      </div>

      {/* Role Details Card */}
      <div className="bg-white dark:bg-layout-dark p-6 rounded-xl shadow-sm mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Site Engineer"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-overall_bg-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-darkest-blue"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Manages site operations and labor"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-overall_bg-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-darkest-blue"
            />
          </div>
        </div>
      </div>

      {/* Permissions Table Section */}
      <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-lg dark:text-white">Permissions Configuration</h3>
            <span className="text-xs text-gray-500">Define what this role can access</span>
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b dark:border-gray-700 bg-gray-100 dark:bg-gray-900 font-semibold text-sm text-gray-700 dark:text-gray-300 sticky top-0 z-10">
          <div className="col-span-2">Module Name</div>
          <div className="text-center">Read</div>
          <div className="text-center">Create</div>
          <div className="text-center">Edit</div>
          <div className="text-center">Delete</div>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto flex-1 p-2">
          {MODULES_CONFIG.map((module) => (
            <div key={module.key} className="mb-2 border rounded-lg dark:border-gray-700 overflow-hidden">
              
              {/* Parent Module Row */}
              <div 
                className={`grid grid-cols-6 gap-4 p-3 items-center ${
                    module.hasSubModules ? 'bg-gray-50 dark:bg-gray-800 cursor-pointer' : 'bg-white dark:bg-layout-dark'
                }`}
                onClick={() => module.hasSubModules && toggleModule(module.key)}
              >
                <div className="col-span-2 flex items-center gap-2 font-medium text-darkest-blue dark:text-blue-400">
                  {module.hasSubModules && (
                    <span className="text-gray-500">
                      {expandedModules[module.key] ? <FiChevronDown /> : <FiChevronRight />}
                    </span>
                  )}
                  {module.label}
                </div>

                {/* If it's a simple module (like Dashboard), show checkboxes here */}
                {!module.hasSubModules ? (
                   ACTIONS.map((action) => (
                    <div key={action} className="flex justify-center">
                        <Checkbox 
                            checked={isChecked(module.key, null, action)} 
                            onChange={() => handlePermissionChange(module.key, null, action)}
                        />
                    </div>
                  ))
                ) : (
                    <div className="col-span-4 text-xs text-gray-400 italic text-right pr-4">
                        Click to expand sub-modules
                    </div>
                )}
              </div>

              {/* SubModules List (Accordion Body) */}
              {module.hasSubModules && expandedModules[module.key] && (
                <div className="bg-white dark:bg-layout-dark border-t dark:border-gray-700">
                  {module.subModules.map((sub) => (
                    <div key={sub.key} className="grid grid-cols-6 gap-4 p-3 items-center border-b last:border-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="col-span-2 pl-10 text-sm text-gray-600 dark:text-gray-300">
                        {sub.label}
                      </div>
                      
                      {ACTIONS.map((action) => (
                        <div key={action} className="flex justify-center">
                          <Checkbox 
                            checked={isChecked(module.key, sub.key, action)}
                            onChange={() => handlePermissionChange(module.key, sub.key, action)}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Custom Checkbox Component for cleaner code ---
const Checkbox = ({ checked, onChange }) => (
    <div 
        onClick={(e) => {
            e.stopPropagation();
            onChange();
        }}
        className={`w-6 h-6 rounded border cursor-pointer flex items-center justify-center transition-all ${
            checked 
                ? "bg-darkest-blue border-darkest-blue" 
                : "border-gray-300 dark:border-gray-500 bg-white dark:bg-transparent"
        }`}
    >
        {checked && <FiCheck size={16} className="text-white" />}
    </div>
);

export default AddRoles;
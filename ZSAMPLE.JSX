import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
// ... Import your icons ...
import { Menus } from "./menuConfig"; // Import the array from above

const LayOut = () => {
  const location = useLocation();

  // 1. Get User Data (Replace this with your Redux/Context selector)
  // Example structure matching your Schema
  const user = {
    role: {
      permissions: {
        dashboard: { read: true },
        tender: { clients: { read: true }, tenders: { read: false } }, // Example
        // ... other permissions from DB
      }
    }
  };

  // 2. Permission Checker Helper 
  const checkAccess = (module, subModule) => {
    if (!user || !user.role || !user.role.permissions) return false;

    const modulePerms = user.role.permissions[module];
    
    // Safety check: if module doesn't exist in DB permissions
    if (!modulePerms) return false; 

    // Case A: Parent Module without children (e.g. Dashboard)
    if (!subModule) {
      return modulePerms.read === true;
    }

    // Case B: SubModule (e.g. Tender -> Clients)
    const subPerms = modulePerms[subModule];
    return subPerms && subPerms.read === true;
  };

  // 3. Filter Parent Menus
  // A parent is visible if:
  // a) It has no nested items AND has read access (Dashboard)
  // b) It HAS nested items AND at least one child has read access
  const visibleMenus = Menus.filter((menu) => {
    if (!menu.nested) {
      return checkAccess(menu.module, null);
    }
    // Check if ANY child is visible
    return menu.nested.some(child => checkAccess(menu.module, child.subModule));
  });

  const isMenuActive = (menu) => {
    if (location.pathname.startsWith(menu.to)) return true;
    if (menu.nested && menu.nested.some((item) => location.pathname.startsWith(item.to))) {
      return true;
    }
    return false;
  };

  return (
    <div className="font-roboto-flex w-full fixed h-screen">
      <Headers />
      <div className="flex dark:bg-overall_bg-dark bg-light-blue dark:text-white h-11/12">
        
        {/* --- MAIN SIDEBAR --- */}
        <div className="px-6 dark:bg-overall_bg-dark bg-light-blue overflow-auto no-scrollbar">
          <ul>
            {visibleMenus.map((menu, index) => (
              <React.Fragment key={index}>
                <NavLink to={menu.to}>
                  <li
                    className={`w-[80px] text-sm font-extralight flex flex-col items-center gap-1 px-3 py-3 my-4 border dark:border-border-dark-grey border-border-sidebar rounded-xl ${
                      isMenuActive(menu)
                        ? "text-white bg-darkest-blue"
                        : "dark:text-white text-darkest-blue"
                    }`}
                  >
                    <span>{menu.icon}</span>
                    <p>{menu.title}</p>
                  </li>
                </NavLink>
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* --- SUB SIDEBAR (Filtered) --- */}
        {visibleMenus.map((menu, index) => {
          
          // Logic: Only show the submenu pane if we are active on this parent
          const shouldShowSidebar = menu.nested && isMenuActive(menu);

          if (!shouldShowSidebar) return null;

          return (
            <div
              key={index}
              className="mx-2 w-56 text-sm my-4 rounded-lg dark:bg-layout-dark bg-white overflow-auto no-scrollbar py-6"
            >
              <ul>
                {menu.nested.map((item, subIndex) => {
                  
                  // LOGIC: Check specific read permission for this sub-item
                  if (!checkAccess(menu.module, item.subModule)) return null;

                  return (
                    <li key={subIndex} className="mb-2">
                      <NavLink to={item.to}>
                        <div
                          className={`w-full flex items-center gap-2 py-3 px-3 cursor-pointer ${
                            location.pathname.startsWith(item.to)
                              ? "dark:bg-overall_bg-dark bg-select-subbar dark:text-white text-darkest-blue border-r-4 border-r-darkest-blue"
                              : "dark:text-white text-darkest-blue"
                          }`}
                        >
                          <span>{item.icon}</span>
                          <p>{item.title}</p>
                        </div>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <div className="w-full p-4 overflow-auto no-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LayOut;

// constants/menuConfig.js or inside Layout.jsx

 const Menus = [
  {
    title: "Dashboard",
    icon: <RiDashboardLine size={23} />,
    to: "/dashboard",
    module: "dashboard", 
  },
  {
    title: "Tender",
    icon: <TbFileDelta size={23} />,
    to: "/tender/customers",
    module: "tender", 
    nested: [
      {
        title: "Clients",
        icon: <LuUserRoundSearch size={23} />,
        to: "/tender/customers",
        subModule: "clients", 
      },
      {
        title: "Tenders",
        icon: <HiOutlineClipboardList size={23} />,
        to: "/tender/tenders",
        subModule: "tenders",
      },
      {
        title: "DLP",
        icon: <TbDatabaseDollar size={23} />,
        to: "/tender/dlp",
        subModule: "dlp",
      },
      {
        title: "EMD",
        icon: <TbLockDollar size={23} />,
        to: "/tender/emd",
        subModule: "emd",
      },
      {
        title: "Security Deposit",
        icon: <TbShieldLock size={23} />,
        to: "/tender/securitydeposit",
        subModule: "security_deposit",
      },
      {
        title: "Project Penalty",
        icon: <TbShieldCheckered size={23} />,
        to: "/tender/projectpenalty",
        subModule: "project_penalty",
      },
    ],
  },
  {
    title: "Projects",
    icon: <HiOutlineClipboardList size={23} />,
    to: "/projects",
    module: "project",
    nested: [
      {
        title: "BOQ Cost",
        icon: <RiDiscountPercentLine size={23} />,
        to: "/projects/zerocost",
        subModule: "boq_cost",
      },
      {
        title: "Detailed Estimate",
        icon: <HiOutlineClipboardList size={23} />,
        to: "/projects/detailestimate",
        subModule: "detailed_estimate",
      },
      {
        title: "Drawing vs BOQ",
        icon: <PiBoundingBoxBold size={23} />,
        to: "/projects/drawingboq",
        subModule: "drawing_boq",
      },
      {
        title: "WBS",
        icon: <RiNodeTree size={23} />,
        to: "/projects/wbs",
        subModule: "wbs",
      },
      {
        title: "Schedule",
        icon: <TbCalendarStats size={23} />,
        to: "/projects/projectschedule",
        subModule: "schedule",
      },
      {
        title: "WOR / WO issuance",
        icon: <AiOutlineFileDone size={23} />,
        to: "/projects/woissuance",
        subModule: "wo_issuance",
      },
      {
        title: "Client Billing",
        icon: <TbReceipt2 size={23} />,
        to: "/projects/clientbillingprojects",
        subModule: "client_billing",
      },
      {
        title: "Work Progress",
        icon: <GrInProgress size={23} />,
        to: "/projects/workprogressprojects",
        subModule: "work_progress",
      },
      {
        title: "Basic Material Quantity",
        icon: <PiHash size={23} />,
        to: "/projects/projectsmaterialquantity",
        subModule: "material_quantity",
      },
      {
        title: "Stocks",
        icon: <LuFileBox size={23} />,
        to: "/projects/projectsstocks",
        subModule: "stocks",
      },
      {
        title: "Assets",
        icon: <TbAssembly size={23} />,
        to: "/projects/projectsassets",
        subModule: "assets",
      },
    ],
  },
  {
    title: "Purchase",
    icon: <BsCart3 size={23} />,
    to: "/purchase/vendorsupplier",
    module: "purchase",
    nested: [
      {
        title: "Vendor & Supplier",
        icon: <BookUser size={23} />,
        to: "/purchase/vendorsupplier",
        subModule: "vendor_supplier",
      },
      {
        title: "Purchase Requests",
        icon: <AiOutlineFileAdd size={23} />,
        to: "/purchase/request",
        subModule: "request",
      },
      {
        title: "Purchase Enquiry",
        icon: <LiaClipboardListSolid size={23} />,
        to: "/purchase/enquiry",
        subModule: "enquiry",
      },
      {
        title: "Purchase Order",
        icon: <ScrollText size={23} />,
        to: "/purchase/order",
        subModule: "order",
      },
      {
        title: "Goods Receipt",
        icon: <TbReceipt2 size={23} />,
        to: "/purchase/goodsreceipt",
        subModule: "goods_receipt",
      },
      {
        title: "Purchase Bill",
        icon: <IoCartOutline size={23} />,
        to: "/purchase/bill",
        subModule: "bill",
      },
      {
        title: "Machinery Tracking",
        icon: <MdContentPasteSearch size={23} />,
        to: "/purchase/machinerytracking",
        subModule: "machinery_tracking",
      },
      {
        title: "Stocks",
        icon: <LuFileBox size={23} />,
        to: "/purchase/purchasestocks",
        subModule: "stocks",
      },
      {
        title: "Assets",
        icon: <TbAssembly size={23} />,
        to: "/purchase/purchaseassets",
        subModule: "assets",
      },
    ],
  },
  {
    title: "Site",
    icon: <LuLandPlot size={23} />,
    to: "/site",
    module: "site",
    nested: [
      {
        title: "BOQ Site",
        icon: <ScrollText size={23} />,
        to: "/site/boqsite",
        subModule: "boq_site",
      },
      {
        title: "Detailed Estimate ",
        icon: <AiOutlineFileAdd size={23} />,
        to: "/site/detailestimatesite",
        subModule: "detailed_estimate",
      },
      {
        title: "Site Drawing",
        icon: <BiShapeSquare size={23} />,
        to: "/site/sitedrawing",
        subModule: "site_drawing",
      },
      {
        title: "Purchase Request",
        icon: <TbFolderQuestion size={23} />,
        to: "/site/purchaserequestsite",
        subModule: "purchase_request",
      },
      {
        title: "Material Received",
        icon: <BsBoxSeam size={23} />,
        to: "/site/materialrecievedsite",
        subModule: "material_received",
      },
      {
        title: "Material Issued",
        icon: <RiBox3Line size={23} />,
        to: "/site/materialissuedsite",
        subModule: "material_issued",
      },
      {
        title: "Stock Register",
        icon: <CiBoxList size={23} />,
        to: "/site/stockregistersite",
        subModule: "stock_register",
      },
      {
        title: "Work Done",
        icon: <TbReceipt2 size={23} />,
        to: "/site/workDoneSite",
        subModule: "work_done",
      },
      {
        title: "Daily Labour Report",
        icon: <TbReportAnalytics size={23} />,
        to: "/site/dialylabourreport",
        subModule: "daily_labour_report",
      },
      {
        title: "Machinery Entry",
        icon: <LuGlassWater size={23} />,
        to: "/site/machineryentry",
        subModule: "machinery_entry",
      },
      {
        title: "Site Assets",
        icon: <TbAssembly size={23} />,
        to: "/site/siteassets",
        subModule: "site_assets",
      },
      {
        title: "Weekly Billing",
        icon: <TbReceipt2 size={23} />,
        to: "/site/weeklybillingsite",
        subModule: "weekly_billing",
      },
      {
        title: "Reconciliation",
        icon: <TbFileOrientation size={23} />,
        to: "/site/reconciliationsite",
        subModule: "reconciliation",
      },
      {
        title: "Planned vs Achieved",
        icon: <Quote size={23} />,
        to: "/site/plannedvsachived",
        subModule: "planned_vs_achieved",
      },
    ],
  },
  {
    title: "HR",
    icon: <LuNotebookText size={23} />,
    to: "/hr/employee",
    module: "hr",
    nested: [
      {
        title: "Employee",
        icon: <AiOutlineFileAdd size={23} />,
        to: "/hr/employee",
        subModule: "employee",
      },
      {
        title: "Attendance",
        icon: <LuFileUser size={23} />,
        to: "/hr/attendance",
        subModule: "attendance",
      },
      {
        title: "Leave",
        icon: <TbDoorExit size={23} />,
        to: "/hr/leave",
        subModule: "leave",
      },
      {
        title: "Payroll",
        icon: <LuScrollText size={23} />,
        to: "/hr/payroll",
        subModule: "payroll",
      },
      {
        title: "Contract & NMR",
        icon: <TbContract size={23} />,
        to: "/hr/contractnmr",
        subModule: "contract_nmr",
      },
      {
        title: "NMR",
        icon: <TbListSearch size={23} />,
        to: "/hr/nmr",
        subModule: "nmr",
      },
      {
        title: "NMR Attendance",
        icon: <TfiLayoutListThumb size={23} />,
        to: "/hr/NMRattendance",
        subModule: "nmr_attendance",
      },
    ],
  },
  {
    title: "Finance",
    icon: <TbReportMoney size={23} />,
    to: "/finance/clientbilling",
    module: "finance",
    nested: [
      {
        title: "Client Billing",
        icon: <FileText size={23} />,
        to: "/finance/clientbilling",
        subModule: "client_billing",
      },
      {
        title: "Purchase Bill",
        icon: <ClipboardList size={23} />,
        to: "/finance/purchasetotalbill",
        subModule: "purchase_bill",
      },
      {
        title: "Contractor Bill",
        icon: <ClipboardList size={23} />,
        to: "/finance/contractorbill",
        subModule: "contractor_bill",
      },
      {
        title: "Debit, Credit Note",
        icon: <FileWarning size={23} />,
        to: "/finance/debitcreditnote",
        subModule: "debit_credit_note",
      },
      {
        title: "Internal Bank Transfer",
        icon: <TbReportMoney size={23} />,
        to: "/finance/internalbanktransfer",
        subModule: "internal_transfer",
      },
      {
        title: "Bank Transcation",
        icon: <TbReportMoney size={23} />,
        to: "/finance/banktransaction",
        subModule: "bank_transaction",
      },
      {
        title: "Journal Entry",
        icon: <Workflow size={23} />,
        to: "/finance/journalentry",
        subModule: "journal_entry",
      },
      {
        title: "Banks",
        icon: <RiBankLine size={23} />,
        to: "/finance/banks",
        subModule: "banks",
      },
      {
        title: "TDS",
        icon: <TbCards size={23} />,
        to: "/finance/tds",
        subModule: "tds",
      },
      {
        title: "Cash Entry",
        icon: <MdLocalAtm size={23} />,
        to: "/finance/cashentry",
        subModule: "cash_entry",
      },
      {
        title: "Ledger Entry",
        icon: <MdLocalAtm size={23} />,
        to: "/finance/ledgerentry",
        subModule: "ledger_entry",
      },
      {
        title: "Supplier Outstanding",
        icon: <Banknote size={23} />,
        to: "/finance/supplieroutstanding",
        subModule: "supplier_outstanding",
      },
      {
        title: "Overall Expenses",
        icon: <FaBars size={23} />,
        to: "/finance/overallexpenses",
        subModule: "overall_expenses",
      },
    ],
  },
  {
    title: "Reports",
    icon: <TbReportAnalytics size={23} />,
    to: "/reports/projectdashboard",
    module: "report",
    nested: [
      {
        title: "Project Dashboard",
        icon: <HiOutlineClipboardDocumentList size={23} />,
        to: "/reports/projectdashboard",
        subModule: "project_dashboard",
      },
      {
        title: "Work Analysis",
        icon: <LuWorkflow size={23} />,
        to: "/reports/workanalysis",
        subModule: "work_analysis",
      },
      {
        title: "Client Billing",
        icon: <RiBillLine size={23} />,
        to: "/reports/clientbilling",
        subModule: "client_billing",
      },
      {
        title: "Financial Report",
        icon: <TbFileDelta size={23} />,
        to: "/reports/financialreport",
        subModule: "financial_report",
      },
      {
        title: "P&L",
        icon: <TbFileInvoice size={23} />,
        to: "/reports/p&l",
        subModule: "pnl",
      },
      {
        title: "Cash Flow",
        icon: <HiOutlineCash size={23} />,
        to: "/reports/cashflow",
        subModule: "cash_flow",
      },
      {
        title: "Expenses Report",
        icon: <TbFileDollar size={23} />,
        to: "/reports/expensesreport",
        subModule: "expenses_report",
      },
      {
        title: "Vendor Report",
        icon: <TbFileInvoice size={23} />,
        to: "/reports/vendorreport",
        subModule: "vendor_report",
      },
      {
        title: "Reconciliation",
        icon: <TbFileOrientation size={23} />,
        to: "/reports/reconciliation",
        subModule: "reconciliation",
      },
      {
        title: "Actual vs Biller",
        icon: <TbReceipt2 size={23} />,
        to: "/reports/actualvsbilled",
        subModule: "actual_vs_billed",
      },
      {
        title: "Cost to Complete",
        icon: <RiDiscountPercentLine size={23} />,
        to: "/reports/costtocomplete",
        subModule: "cost_to_complete",
      },
      // {
      //   title: "Schedule",
      //   icon: <LuCalendar1 size={23} />,
      //   // to: "/reports/schedule",
      // },
      {
        title: "Planned Vs Actual",
        icon: <Quote size={23} />,
        to: "/reports/plannedvsactual",
        subModule: "planned_vs_actual",
      },
      {
        title: "Labour Productivity",
        icon: <GiHoneycomb size={23} />,
        to: "/reports/labourproductivity",
        subModule: "labour_productivity",
      },
      {
        title: "Machine Productivity",
        icon: <LuGlassWater size={23} />,
        to: "/reports/machineproductivity",
        subModule: "machine_productivity",
      },
      {
        title: "Collection Projection",
        icon: <RiShareBoxLine size={23} />,
        to: "/reports/collectionprojection",
        subModule: "collection_projection",
      },
    ],
  },
  {
    title: "Settings",
    icon: <FiSettings size={23} />,
    to: "/settings/user",
    module: "settings",
    nested: [
      {
        title: "User",
        icon: <RiUserAddLine size={23} />,
        to: "/settings/user",
        subModule: "user",
      },
      {
        title: "Roles",
        icon: <GrGroup size={23} />,
        to: "/settings/roles",
        subModule: "roles",
      },
      {
        title: "Master",
        icon: <RiGroupLine size={23} />,
        to: "/settings/master",
        subModule: "master",
      },
      {
        title: "Assets",
        icon: <RiGroupLine size={23} />,
        to: "/settings/assets",
        subModule: "assets",
      },
    ],
  },
];

import { Router } from "express";
import { verifyJWT, verifyPermission } from "../middleware/auth.middleware.js";
import { 
  createEmployee, 
  getAllEmployees, 
  deleteEmployee 
} from "./employee.controller.js";

const employeeRoute = Router();

// 1. Public Routes (No Protection)
employeeRoute.post("/login", login); 

// 2. Protected Routes (Need Valid Token)
// Apply verifyJWT to all routes below this line
employeeRoute.use(verifyJWT); 

// 3. RBAC Protected Routes (Need Specific Role Permissions)

// Only HR with 'Read' access can list employees
employeeRoute.get("/list", 
  verifyPermission("hr", "employee", "read"), 
  getAllEmployees
);

// Only HR with 'Create' access can add employees
employeeRoute.post("/add", 
  verifyPermission("hr", "employee", "create"), 
  createEmployee
);

// Only HR with 'Delete' access can remove employees
employeeRoute.delete("/:employeeId", 
  verifyPermission("hr", "employee", "delete"), 
  deleteEmployee
);



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

export const Menus = [
  {
    title: "Dashboard",
    icon: <RiDashboardLine size={23} />,
    to: "/dashboard",
    module: "dashboard", // Matches schema: permissions.dashboard
  },
  {
    title: "Tender",
    icon: <TbFileDelta size={23} />,
    to: "/tender/customers",
    module: "tender", // Matches schema: permissions.tender
    nested: [
      {
        title: "Clients",
        to: "/tender/customers",
        icon: <LuUserRoundSearch size={23} />,
        subModule: "clients", // Matches schema: permissions.tender.clients
      },
      {
        title: "Tenders",
        to: "/tender/tenders",
        icon: <HiOutlineClipboardList size={23} />,
        subModule: "tenders",
      },
      {
        title: "DLP",
        to: "/tender/dlp",
        icon: <TbDatabaseDollar size={23} />,
        subModule: "dlp",
      },
      {
        title: "EMD",
        to: "/tender/emd",
        icon: <TbLockDollar size={23} />,
        subModule: "emd",
      },
      {
        title: "Security Deposit",
        to: "/tender/securitydeposit",
        icon: <TbShieldLock size={23} />,
        subModule: "security_deposit", // Note the underscore match
      },
      {
        title: "Project Penalty",
        to: "/tender/projectpenalty",
        icon: <TbShieldCheckered size={23} />,
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
      { title: "BOQ Cost", to: "/projects/zerocost", subModule: "boq_cost", icon: <RiDiscountPercentLine size={23} /> },
      { title: "Detailed Estimate", to: "/projects/detailestimate", subModule: "detailed_estimate", icon: <HiOutlineClipboardList size={23} /> },
      { title: "Drawing vs BOQ", to: "/projects/drawingboq", subModule: "drawing_boq", icon: <PiBoundingBoxBold size={23} /> },
      { title: "WBS", to: "/projects/wbs", subModule: "wbs", icon: <RiNodeTree size={23} /> },
      { title: "Schedule", to: "/projects/projectschedule", subModule: "schedule", icon: <TbCalendarStats size={23} /> },
      { title: "WOR / WO issuance", to: "/projects/woissuance", subModule: "wo_issuance", icon: <AiOutlineFileDone size={23} /> },
      { title: "Client Billing", to: "/projects/clientbillingprojects", subModule: "client_billing", icon: <TbReceipt2 size={23} /> },
      { title: "Work Progress", to: "/projects/workprogressprojects", subModule: "work_progress", icon: <GrInProgress size={23} /> },
      { title: "Basic Material Qty", to: "/projects/projectsmaterialquantity", subModule: "material_quantity", icon: <PiHash size={23} /> },
      { title: "Stocks", to: "/projects/projectsstocks", subModule: "stocks", icon: <LuFileBox size={23} /> },
      { title: "Assets", to: "/projects/projectsassets", subModule: "assets", icon: <TbAssembly size={23} /> },
    ],
  },
  // ... Continue mapping Purchase, Site, HR, Finance, Reports, Settings similarly
  // Example for Settings:
  {
    title: "Settings",
    icon: <FiSettings size={23} />,
    to: "/settings/user",
    module: "settings",
    nested: [
        { title: "User", to: "/settings/user", subModule: "user", icon: <RiUserAddLine size={23} /> },
        { title: "Roles", to: "/settings/roles", subModule: "roles", icon: <GrGroup size={23} /> },
        { title: "Master", to: "/settings/master", subModule: "master", icon: <RiGroupLine size={23} /> },
        { title: "Assets", to: "/settings/assets", subModule: "assets", icon: <RiGroupLine size={23} /> },
    ]
  }
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



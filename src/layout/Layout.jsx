import React from "react";
import Headers from "./Headers";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menus } from "../helperConfigData/helperData";

const LayOut = () => {
  const location = useLocation();
  const { user } = useAuth(); // 1. Get Logged-in User Data
  // --- 2. Permission Checker Function ---
  const checkAccess = (module, subModule) => {
    // Safety check: if no user or permissions, hide everything
    if (!user || !user.role || !user.role.permissions) return false;

    // Get permissions for the specific module (e.g., 'tender')
    const modulePerms = user.role.permissions[module];
    if (!modulePerms) return false;

    // Case A: SubModule (e.g., 'clients')
    if (subModule) {
      // Check if the submodule exists and 'read' is true
      return modulePerms[subModule] && modulePerms[subModule].read === true;
    }

    // Case B: Simple Module (e.g., 'dashboard')
    // Check if 'read' is true directly on the module
    return modulePerms.read === true;
  };

  // --- 3. Filter Parent Menus ---
  // Only show a Parent Icon if:
  // A. It's a simple menu (Dashboard) AND user has access.
  // B. It has nested items AND user has access to AT LEAST ONE child.
  const visibleMenus = Menus.filter((menu) => {
    if (!menu.nested) {
      return checkAccess(menu.module, null);
    }
    // Check if ANY child is visible
    return menu.nested.some((child) => checkAccess(menu.module, child.subModule));
  });

  // --- Helper: Active State Logic ---
  const isMenuActive = (menu) => {
    if (location.pathname.startsWith(menu.to)) {
      return true;
    }
    if (
      menu.nested &&
      menu.nested.some((item) => location.pathname.startsWith(item.to))
    ) {
      return true;
    }
    return false;
  };

  // --- Helper: Sidebar Visibility Logic (UX) ---
  const isNestedSidebarVisible = (menuTitle, pathname) => {
    // Keep your existing specific logic for Projects/Site
    if (menuTitle === "Projects") {
      return pathname.startsWith("/projects/") && pathname !== "/projects";
    }
    if (menuTitle === "Site") {
      return pathname.startsWith("/site/") && pathname !== "/site";
    }
    return pathname.startsWith(`/${menuTitle.toLowerCase()}`);
  };

  return (
    <div className="font-roboto-flex w-full fixed h-screen">
      <Headers />
      <div className="flex dark:bg-overall_bg-dark bg-light-blue dark:text-white h-11/12">
        
        {/* --- MAIN SIDEBAR (Filtered by Permissions) --- */}
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

        {/* --- SUB SIDEBAR (Filtered by Permissions) --- */}
        {visibleMenus.map((menu, index) => {
          
          // 1. Check UX Logic: Should we show this panel based on URL?
          const shouldShowSidebar =
            menu.nested &&
            isNestedSidebarVisible(menu.title, location.pathname) &&
            isMenuActive(menu);

          if (!shouldShowSidebar) return null;

          return (
            <div
              key={index}
              className="mx-2 w-56 text-sm my-4 rounded-lg dark:bg-layout-dark bg-white overflow-auto no-scrollbar py-6"
            >
              <ul>
                {menu.nested.map((item, subIndex) => {
                  
                  // 2. Check RBAC Logic: Does user have read access to this specific link?
                  // If NOT, do not render this <li>
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

        {/* --- MAIN CONTENT AREA --- */}
        <div className="w-full p-4 overflow-auto no-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LayOut;

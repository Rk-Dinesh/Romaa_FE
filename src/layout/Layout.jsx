import React, { useState } from "react";
import Headers from "./Headers";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { RiCalendarScheduleLine, RiDashboardLine } from "react-icons/ri";
import { TbAssembly, TbFileDelta, TbListSearch } from "react-icons/tb";
import { LuFileBox, LuUserRoundSearch } from "react-icons/lu";
import { BsCart3 } from "react-icons/bs";
import { HiOutlineClipboardList } from "react-icons/hi";
import { LiaClipboardListSolid } from "react-icons/lia";
import { TbLockDollar } from "react-icons/tb";
import { TbDatabaseDollar } from "react-icons/tb";
import { LuLandPlot } from "react-icons/lu";
import { LuNotebookText } from "react-icons/lu";
import { TbReportMoney } from "react-icons/tb";
import { TbReportAnalytics } from "react-icons/tb";
import { FiSettings } from "react-icons/fi";
import { AiOutlineFileAdd } from "react-icons/ai";
import { LuFileText } from "react-icons/lu";
import { RiBankLine } from "react-icons/ri";
import { TbCards } from "react-icons/tb";
import { MdLocalAtm } from "react-icons/md";
import { LuFileUser } from "react-icons/lu";
import { TbDoorExit } from "react-icons/tb";
import { LuScrollText } from "react-icons/lu";
import { TbContract } from "react-icons/tb";
import { FaBars } from 'react-icons/fa';
import {
  FileText,
  ClipboardList,
  FileWarning,
  Workflow,
  Banknote,
  Quote,
} from "lucide-react";
import { BookUser } from "lucide-react";
import { ScrollText } from "lucide-react";
import { TbReceipt2 } from "react-icons/tb";
import { IoCartOutline } from "react-icons/io5";
import { MdContentPasteSearch } from "react-icons/md";
import { LuGlassWater } from "react-icons/lu";
import { LuWorkflow } from "react-icons/lu";
import { RiBillLine } from "react-icons/ri";
import { TbFileDollar } from "react-icons/tb";
import { TbFileInvoice } from "react-icons/tb";
import { TbFileOrientation } from "react-icons/tb";
import { RiDiscountPercentLine } from "react-icons/ri";
import { LuCalendar1 } from "react-icons/lu";
import { TbBrandSurfshark } from "react-icons/tb";
import { PiBoundingBoxBold, PiHash } from "react-icons/pi";
import { RiNodeTree } from "react-icons/ri";
import { TbCalendarStats } from "react-icons/tb";
import { AiOutlineFileDone } from "react-icons/ai";
import { GrInProgress } from "react-icons/gr";
import { GiHoneycomb } from "react-icons/gi";
import { RiUserAddLine } from "react-icons/ri";
import { GrGroup } from "react-icons/gr";
import { RiGroupLine } from "react-icons/ri";
import { TbShieldLock } from "react-icons/tb";
import { TbShieldCheckered } from "react-icons/tb";
import { RiShareBoxLine } from "react-icons/ri";
import { HiOutlineCash } from "react-icons/hi";
import { TfiLayoutListThumb } from "react-icons/tfi";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";

import { BiShapeSquare } from "react-icons/bi";
import { BsBoxSeam } from "react-icons/bs";
import { RiBox3Line } from "react-icons/ri";
import { CiBoxList } from "react-icons/ci";
import { TbFolderQuestion } from "react-icons/tb";
const LayOut = () => {
  const location = useLocation();

  const Menus = [
    {
      title: "Dashboard",
      icon: <RiDashboardLine size={23} />,
      to: "/dashboard",
    },
      {
      title: "Tender",
      icon: <TbFileDelta size={23} />,
      to: "/tender/customers",
      nested: [
        {
          title: "Clients",
          icon: <LuUserRoundSearch size={23} />,
          to: "/tender/customers",
        },
        {
          title: "Tenders",
          icon: <HiOutlineClipboardList size={23} />,
          to: "/tender/tenders",
        },
        // {
        //   title: "Workorders",
        //   icon: <LiaClipboardListSolid size={23} />,
        //   to: "/tender/workorders",
        // },
             {
          title: "DLP",
          icon: <TbDatabaseDollar size={23} />,
          to: "/tender/dlp",
        },
        {
          title: "EMD",
          icon: <TbLockDollar size={23} />,
          to: "/tender/emd",
        },
        {
          title: "Security Deposit",
          icon: <TbShieldLock size={23} />,
          to: "/tender/securitydeposit",
        },
        {
          title: "Project Penalty",
          icon: <TbShieldCheckered size={23} />,
          to: "/tender/projectpenalty",
        },
   
      ],
    },
   {
      title: "Projects",
      icon: <HiOutlineClipboardList size={23} />,
      to: "/projects",
          nested: [
        {
          title: "BOQ Cost",
          icon: <RiDiscountPercentLine size={23} />,
          to: "/projects/zerocost",
        },
        {
          title: "Detailed Estimate",
          icon: <HiOutlineClipboardList size={23} />,
          to: "/projects/detailestimate",
        },
        {
          title: "Drawing vs BOQ",
          icon: <PiBoundingBoxBold size={23} />,
          to: "/projects/drawingboq",
        },
        {
          title: "WBS",
          icon: <RiNodeTree size={23} />,
          to: "/projects/wbs",
        },
        {
          title: "Schedule",
          icon: <TbCalendarStats size={23} />,
          to: "/projects/projectschedule",
        },
        {
          title: "WOR / WO issuance",
          icon: <AiOutlineFileDone size={23} />,
          to: "/projects/woissuance",
        },
        {
          title: "Client Billing",
          icon: <TbReceipt2 size={23} />,
          to: "/projects/clientbillingprojects",
        },
        {
          title: "Work Progress",
          icon: <GrInProgress size={23} />,
          to: "/projects/workprogressprojects",
        },
        {
          title: "Basic Material Quantity",
          icon: <PiHash size={23} />,
          to: "/projects/projectsmaterialquantity",
        },
        {
          title: "Stocks",
          icon: <LuFileBox size={23} />,
          to: "/projects/projectsstocks",
        },
        {
          title: "Assets",
          icon: <TbAssembly size={23} />,
          to: "/projects/projectsassets",
        },
     
      ],
    },
    {
      title: "Purchase",
      icon: <BsCart3 size={23} />,
      to: "/purchase/vendorsupplier",
      nested: [
        {
          title: "Vendor & Supplier",
          icon: <BookUser size={23} />,
          to: "/purchase/vendorsupplier",
        },
        {
          title: "Purchase Requests",
          icon: <AiOutlineFileAdd size={23} />,
          to: "/purchase/request",
        },
        {
          title: "Purchase Enquiry",
          icon: <LiaClipboardListSolid size={23} />,
          to: "/purchase/enquiry",
        },
        {
          title: "Purchase Order",
          icon: <ScrollText size={23} />,
          to: "/purchase/order",
        },
        {
          title: "Goods Receipt",
          icon: <TbReceipt2 size={23} />,
          to: "/purchase/goodsreceipt",
        },
        {
          title: "Purchase Bill",
          icon: <IoCartOutline size={23} />,
          to: "/purchase/bill",
        },
        {
          title: "Machinery Tracking",
          icon: <MdContentPasteSearch size={23} />,
          to: "/purchase/machinerytracking",
        },
        {
          title: "Stocks",
          icon: <LuFileBox size={23} />,
          to: "/purchase/purchasestocks",
        },
        {
          title: "Assets",
          icon: <TbAssembly size={23} />,
          to: "/purchase/purchaseassets",
        },
      ],
    },
    {
      title: "Site",
      icon: <LuLandPlot size={23} />,
      to: "/site",
      nested: [
        {
          title: "BOQ Site",
          icon: <ScrollText size={23} />,
          to: "/site/boqsite",
        },
         {
          title: "Detailed Estimate ",
          icon: <AiOutlineFileAdd size={23} />,
          to: "/site/detailestimatesite",
        },
         {
          title: "Site Drawing",
          icon: <BiShapeSquare size={23} />,
          to: "/site/sitedrawing",
        },
        //  {
        //   title: "Schedule",
        //   icon: <TbCalendarStats size={23} />,
        //   //to: "/site/sitedrawing",
        // },
         {
          title: "Work Done",
          icon: <TbReceipt2 size={23} />,
          to: "/site/workDoneSite",
        },
         {
          title: "Daily Labour Report",
          icon: <TbReportAnalytics size={23} />,
          to: "/site/dialylabourreport",
        },
         {
          title: "Material Received",
          icon: <BsBoxSeam size={23} />,
          to: "/site/materialrecievedsite",
        },
         {
          title: "Material Issued",
          icon: <RiBox3Line size={23} />,
          to: "/site/materialissuedsite",
        },
         {
          title: "Stock Register",
          icon: <CiBoxList size={23} />,
          to: "/site/stockregistersite",
        },
         {
          title: "Purchase Request",
          icon: <TbFolderQuestion size={23} />,
          to: "/site/purchaserequestsite",
        },
        {
          title: "Site Assets",
          icon: <TbAssembly size={23} />,  
          to: "/site/siteassets",
        },
        {
          title: "Weekly Billing",
          icon: <TbReceipt2 size={23} />,  
          to: "/site/weeklybillingsite",
        },
        {
          title: "Reconciliation",
          icon: <TbFileOrientation size={23} />,  
          to: "/site/reconciliationsite",
        },
           {
          title: "Planned vs Achieved",
          icon: <Quote size={23} />,  
          to: "/site/plannedvsachived",
        },
           {
          title: "Machinery Entry",
          icon: <LuGlassWater size={23} />,  
          to: "/site/machineryentry",
        },

      ],
    },
    {
      title: "HR",
      icon: <LuNotebookText size={23} />,
      to: "/hr/employee",
      nested: [
        {
          title: "Employee",
          icon: <AiOutlineFileAdd size={23} />,
          to: "/hr/employee",
        },
        {
          title: "Attendance",
          icon: <LuFileUser size={23} />,
          to: "/hr/attendance",
        },
        {
          title: "Leave",
          icon: <TbDoorExit size={23} />,
          to: "/hr/leave",
        },
        {
          title: "Payroll",
          icon: <LuScrollText size={23} />,
          to: "/hr/payroll",
        },
        {
          title: "Contract & NMR",
          icon: <TbContract size={23} />,
          to: "/hr/contractnmr",
        },{
          title: "NMR",
          icon: <TbListSearch  size={23} />,
          to: "/hr/nmr",
        },
        {
          title: "NMR Attendance",
          icon: <TfiLayoutListThumb  size={23} />,
          to: "/hr/NMRattendance",
        },
      ],
    },
    {
      title: "Finance",
      icon: <TbReportMoney size={23} />,
      to: "/finance/clientbilling",
      nested: [
        {
          title: "Client Billing",
          icon: <FileText size={23} />,
          to: "/finance/clientbilling",
        },
        {
          title: "Purchase Bill",
          icon: <ClipboardList size={23} />,
          to: "/finance/purchasetotalbill",
        },
        {
          title: "Contractor Bill",
          icon: <ClipboardList size={23} />,
          to: "/finance/contractorbill",
        },
        {
          title: "Debit, Credit Note",
          icon: <FileWarning size={23} />,
          to: "/finance/debitcreditnote",
        },
        {
          title: "Internal Bank Transfer",
          icon: <TbReportMoney size={23} />,
          to: "/finance/internalbanktransfer",
        },
        {
          title: "Bank Transcation",
          icon: <TbReportMoney size={23} />,
          to: "/finance/banktransaction",
        },
        {
          title: "Journal Entry",
          icon: <Workflow size={23} />,
          to: "/finance/journalentry",
        },
        {
          title: "Banks",
          icon: <RiBankLine size={23} />,
          to: "/finance/banks",
        },
        {
          title: "TDS",
          icon: <TbCards size={23} />,
          to: "/finance/tds",
        },
        {
          title: "Cash Entry",
          icon: <MdLocalAtm size={23} />,
          to: "/finance/cashentry",
        },
          {
          title: "Ledger Entry",
          icon: <MdLocalAtm size={23} />,
          to: "/finance/ledgerentry",
        },
        {
          title: "Supplier Outstanding",
          icon: <Banknote size={23} />,
          to: "/finance/supplieroutstanding",
        },  {
          title: "Overall Expenses",
          icon: <FaBars size={23} />,
          to: "/finance/overallexpenses",
        },
      ],
    },
    {
      title: "Reports",
      icon: <TbReportAnalytics size={23} />,
      to: "/reports/projectdashboard",
      nested: [
        {
          title: "Project Dashboard",
          icon: <HiOutlineClipboardDocumentList size={23} />,
          to: "/reports/projectdashboard",
        },
        {
          title: "Work Analysis",
          icon: <LuWorkflow size={23} />,
          to: "/reports/workanalysis",
        },
        {
          title: "Client Billing",
          icon: <RiBillLine  size={23} />,
          to: "/reports/clientbilling",
        },
        {
          title: "Financial Report",
          icon: <TbFileDelta size={23} />,
          to: "/reports/financialreport",
        },
        {
          title: "P&L",
          icon: <TbFileInvoice size={23} />,
          to: "/reports/p&l",
        },
        {
          title: "Cash Flow",
          icon: <HiOutlineCash size={23} />,
          to: "/reports/cashflow",
        },
        {
          title: "Expenses Report",
          icon: <TbFileDollar size={23} />,
          to: "/reports/expensesreport",
        },
        {
          title: "Vendor Report",
          icon: <TbFileInvoice size={23} />,
          to: "/reports/vendorreport",
        },
        {
          title: "Reconciliation",
          icon: <TbFileOrientation size={23} />,
          to: "/reports/reconciliation",
        },
        {
          title: "Actual vs Biller",
          icon: <TbReceipt2 size={23} />,
          to: "/reports/actualvsbilled",
        },
        {
          title: "Cost to Complete",
          icon: <RiDiscountPercentLine size={23} />,
          to: "/reports/costtocomplete",
        },
        {
          title: "Schedule",
          icon: <LuCalendar1 size={23} />,
          // to: "/reports/schedule",
        },
        {
          title: "Planned Vs Actual",
          icon: <Quote size={23} />,
          to: "/reports/plannedvsactual",
        },
        {
          title: "Labour Productivity",
          icon: <GiHoneycomb size={23} />,
          to: "/reports/labourproductivity",
        },
        {
          title: "Machine Productivity",
          icon: <LuGlassWater size={23} />,
          to: "/reports/machineproductivity",
        },
        {
          title: "Collection Projection",
          icon: <RiShareBoxLine size={23} />,
          to: "/reports/collectionprojection",
        },
      ],
    },
    {
      title: "Settings",
      icon: <FiSettings size={23} />,
      to: "/settings/user",
      nested: [
        {
          title: "User",
          icon: <RiUserAddLine size={23} />,
          to: "/settings/user",
        },
        {
          title: "Roles",
          icon: <GrGroup size={23} />,
          to: "/settings/roles",
        },
        {
          title: "Master",
          icon: <RiGroupLine size={23} />,
          to: "/settings/master",
        },
        {
          title: "Assets",
          icon: <RiGroupLine size={23} />,
          to: "/settings/assets",
        },
      ],
    },
  ];

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

  return (
    <div className=" font-roboto-flex w-full fixed h-screen ">
      <Headers />
      <div className="flex dark:bg-overall_bg-dark bg-light-blue dark:text-white h-11/12 ">
        <div className="px-6 dark:bg-overall_bg-dark bg-light-blue overflow-auto no-scrollbar ">
          <ul>
            {Menus.map((menu, index) => (
              <React.Fragment key={index}>
                <NavLink to={menu.to}>
                  <li
                    className={`w-[80px] text-sm font-extralight flex flex-col items-center gap-1 px-3 py-3 my-4 border dark:border-border-dark-grey border-border-sidebar rounded-xl ${
                      isMenuActive(menu)
                        ? " text-white  bg-darkest-blue "
                        : " dark:text-white text-darkest-blue  "
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
        {Menus.map((menu, index) => {
          const isNestedSidebarVisible = (menuTitle, pathname) => {
            if (menuTitle === "Projects") {
              return (
                pathname.startsWith("/projects/") && pathname !== "/projects"
              );
            }

            if (menuTitle === "Site") {
              return pathname.startsWith("/site/") && pathname !== "/site";
            }

            return pathname.startsWith(`/${menuTitle.toLowerCase()}`);
          };

          const shouldShowSidebar =
            menu.nested &&
            isNestedSidebarVisible(menu.title, location.pathname);

          return (
            shouldShowSidebar &&
            isMenuActive(menu) && (
              <div
                key={index}
                className="mx-2 w-56 text-sm  my-4 rounded-lg dark:bg-layout-dark bg-white  overflow-auto no-scrollbar py-6"
              >
                <ul>
                  {menu.nested.map((item, index) => (
                    <li key={index} className="mb-2">
                      <NavLink to={item.to}>
                        <div
                          className={`w-full   flex  items-center gap-2 py-3 px-3 cursor-pointer ${
                            location.pathname.startsWith(item.to)
                              ? "dark:bg-overall_bg-dark bg-select-subbar dark:text-white  text-darkest-blue border-r-4 border-r-darkest-blue "
                              : "dark:text-white text-darkest-blue"
                          }`}
                        >
                          <span>{item.icon}</span>
                          <p>{item.title}</p>
                        </div>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )
          );
        })}
        <div className="w-full  p-4 overflow-auto no-scrollbar ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LayOut;

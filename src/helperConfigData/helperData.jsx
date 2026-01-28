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

export const Menus = [
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
        title: "Assets",
        icon: <RiGroupLine size={23} />,
        to: "/settings/assets",
        subModule: "assets",
      },
    ],
  },
];
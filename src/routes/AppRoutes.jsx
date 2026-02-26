import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Loader from "../components/Loader"; // Importing the Loader component
import HsnMaster from "../pages/settings/hsnmaster/HsnMaster";

// --- LAZY LOAD IMPORTS ---

// Layout & Auth
const LayOut = lazy(() => import("../layout/Layout"));
const Login = lazy(() => import("../pages/auth/Login"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ProtectedRoute = lazy(() => import("../pages/auth/protectedRoute"));

// Dashboard
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const ViewCalendar = lazy(() => import("../pages/dashboard/ViewCalendar"));
const Tickets = lazy(() => import("../pages/dashboard/tickets/Tickets"));
const Profile = lazy(() => import("../pages/dashboard/profile/Profile"));
const EmployeeDashboard = lazy(() => import("../pages/dashboard/employee dashboard/EmployeeDashboard"));

// Tender
const Customer = lazy(() => import("../pages/tender/clients/Clients"));
const Tender = lazy(() => import("../pages/tender/tenders/Tender"));
const ViewTender = lazy(() => import("../pages/tender/tenders/view tenders/ViewTender"));
const TenderDetailedEstimate = lazy(() => import("../pages/tender/tenders/view tenders/detailed estimate/TenderDetailedEstimate"));
const TenderZeroCost = lazy(() => import("../pages/tender/tenders/view tenders/zero cost/TenderZeroCost"));
const WorkOrder = lazy(() => import("../pages/tender/work order/WorkOrder"));
const ViewWorkOrder = lazy(() => import("../pages/tender/work order/view work order/ViewWorkOrder"));
const ViewTableWOBoq = lazy(() => import("../pages/tender/work order/view work order/Work order Boq/ViewTableWOBoq"));
const EMD = lazy(() => import("../pages/tender/emd/EMD"));
const EMDTrackingTable = lazy(() => import("../pages/tender/emd/viewEMDTracking"));
const DLP = lazy(() => import("../pages/tender/dlp/DLP"));
const SecurityDeposit = lazy(() => import("../pages/tender/security deposit/SecurityDeposit"));
const SecurityDepositTrackingTable = lazy(() => import("../pages/tender/security deposit/viewSDTracking"));
const ProjectPenalty = lazy(() => import("../pages/tender/project penalty/ProjectPenalty"));
const PenaltyCardGrid = lazy(() => import("../pages/tender/project penalty/PenaltyView"));

// Projects
const Project = lazy(() => import("../pages/projects/Project"));
const ZeroCost = lazy(() => import("../pages/projects/Project zero cost/ZeroCost"));
const ViewBoqSplit = lazy(() => import("../pages/tender/tenders/view tenders/zero cost/boq split/ViewBoqSplit"));
const EditRateAnalysis = lazy(() => import("../pages/tender/tenders/view tenders/zero cost/Rate analysis/EditRateAnalysis"));
const DetailedEstimate = lazy(() => import("../pages/projects/Detailed estimate/DetailedEstimate"));
//const ViewGs = lazy(() => import("../pages/projects/Detailed estimate/general abstract/ViewGs"));
//const ViewBillQtyProject = lazy(() => import("../pages/projects/Detailed estimate/BOQProjects/ViewBOQProject"));
//const ViewNewInletDet = lazy(() => import("../pages/projects/Detailed estimate/new inlet det/ViewNewInletDet"));
//const ViewNewInletAbs = lazy(() => import("../pages/projects/Detailed estimate/new inlet abs/ViewNewInletAbs"));
//const ViewVendorProject = lazy(() => import("../pages/projects/Detailed estimate/vendor/ViewVendorProjects"));
const DrawingBoq = lazy(() => import("../pages/projects/drawing vs Boq/DrawingBoq"));
const ViewDrawingBoq = lazy(() => import("../pages/projects/drawing vs Boq/ViewDrawingBoq"));
const WBS = lazy(() => import("../pages/projects/WBQ/WBS"));
const ViewWbs = lazy(() => import("../pages/projects/WBQ/ViewWbs"));
const ScheduleProjects = lazy(() => import("../pages/projects/schedule/schedule/ScheduleProjects"));
const ViewDailyProject = lazy(() => import("../pages/projects/schedule/schedule/tabs/daily/ViewDailyProjects"));
const ViewWeekly = lazy(() => import("../pages/projects/schedule/schedule/tabs/weekly/ViewWeekly"));
const ViewProjectSchedule = lazy(() => import("../pages/projects/schedule/schedule/tabs/project schedule/ViewProjectSchedule"));
const ViewManPowerHistogram = lazy(() => import("../pages/projects/schedule/schedule/tabs/Man Power Histogram/ViewManPowerHistogram"));
const ViewMechinerySchedule = lazy(() => import("../pages/projects/schedule/schedule/tabs/machinery Schedule/ViewMechinerySchedule"));
const WoIssuance = lazy(() => import("../pages/projects/Wo issuance/WOIssuance"));
const ViewWORequest = lazy(() => import("../pages/projects/Wo issuance/work order request/ViewWORequest"));
const ViewWOIssuance = lazy(() => import("../pages/projects/Wo issuance/Work order issuance/ViewWOIssuance"));
const ClientBillingProject = lazy(() => import("../pages/projects/client billing/ClientBillingProject"));
const ViewClBillProjects = lazy(() => import("../pages/projects/client billing/ViewClBillProjects"));
const ProjectWorkProgress = lazy(() => import("../pages/projects/work progress/ProjectWorkProgress"));
const ViewProjectWorkProgress = lazy(() => import("../pages/projects/work progress/ViewProjectWorkProgress"));
const ProjectMaterailQty = lazy(() => import("../pages/projects/Project Material quantity/ProjectMaterailQty"));
const StockProject = lazy(() => import("../pages/projects/project stocks/StockProject"));
const ProjectAsset = lazy(() => import("../pages/projects/project assets/ProjectAsset"));
const WorkOrderRequestForm = lazy(() => import("../pages/projects/Wo issuance/work order request/WorkOrderRequestForm"));

// Purchase
const VendorSupplier = lazy(() => import("../pages/purchase/Vendor & supplier/VendorSupplier"));
const ViewVendorSupplier = lazy(() => import("../pages/purchase/Vendor & supplier/view vendor supplier/ViewVendorSupplier"));
const PurchaseRequest = lazy(() => import("../pages/purchase/purchase request/PurchaseRequest"));
const ViewPurchaseRequest = lazy(() => import("../pages/purchase/purchase request/ViewPurchaseRequest"));
const PurchaseEnquiry = lazy(() => import("../pages/purchase/purchase enquiry/PurchaseEnquiry"));
const ViewPurchaseEnquiry = lazy(() => import("../pages/purchase/purchase enquiry/ViewPurchaseEnquiry"));
const EnquiryForm = lazy(() => import("../pages/purchase/purchase enquiry/EnquiryForm"));
const PurchaseOrder = lazy(() => import("../pages/purchase/purchase order/PurchaseOrder"));
const ViewPurchaseOrder = lazy(() => import("../pages/purchase/purchase order/ViewPurchaseOrder"));
const GoodsReceipt = lazy(() => import("../pages/purchase/goods receipt/GoodsReceipt"));
const ViewGoodRecipt = lazy(() => import("../pages/purchase/goods receipt/ViewGoodRecipt"));
const PurchaseBill = lazy(() => import("../pages/purchase/purchase bill/PurchaseBill"));
const ViewPurchaseBill = lazy(() => import("../pages/purchase/purchase bill/ViewPurchaseBill"));
const MachineryTracking = lazy(() => import("../pages/purchase/machinery tracking/MachineryTracking"));
const PurchaseStocks = lazy(() => import("../pages/purchase/purchase stocks/PurchaseStocks"));
const PurchaseAssets = lazy(() => import("../pages/purchase/purchase assets/PurchaseAssets"));

// Site
const Site = lazy(() => import("../pages/site/Site"));
const BOQSite = lazy(() => import("../pages/site/BOQSite/BOQSite"));
const DetailedEstimateSite = lazy(() => import("../pages/site/DetailedEstimateSite/DetailedEstimateSite"));
const ViewGS = lazy(() => import("../pages/site/DetailedEstimateSite/GS/ViewGS"));
const ViewBillQtySite = lazy(() => import("../pages/site/DetailedEstimateSite/BillQty/viewBillQtySite"));
const ViewNewInletSite = lazy(() => import("../pages/site/DetailedEstimateSite/NewInletDetSite/viewNewInletSite"));
const ViewNewInletAbsSite = lazy(() => import("../pages/site/DetailedEstimateSite/NewInletAbsSite/ViewNewInletAbs"));
const ViewRoadDetailsSite = lazy(() => import("../pages/site/DetailedEstimateSite/Roaddetails/ViewRoadDetails"));
const ViewRoadAbstractSite = lazy(() => import("../pages/site/DetailedEstimateSite/RoadAbstract/ViewRoadAbstractSite"));
const ViewRetainingWallSite = lazy(() => import("../pages/site/DetailedEstimateSite/RetainingWall/ViewRetainingWallSite"));
const ViewRetainingAbstractSite = lazy(() => import("../pages/site/DetailedEstimateSite/retaining abstract site/ViewRetainingAbstractSite"));
const ViewVendorSite = lazy(() => import("../pages/site/DetailedEstimateSite/vendor site/ViewVendorSite"));
const ReconciliationSite = lazy(() => import("../pages/site/reconciliation site/ReconciliationSite"));
const PlannedvsAchived = lazy(() => import("../pages/site/planned_vs_achived/PlannedvsAchived"));
const MachineryEntry = lazy(() => import("../pages/site/machinery_Enry/MachineryEntry"));
const SiteDrawing = lazy(() => import("../pages/site/SiteDrawing/SiteDrawing"));
const ViewSiteDrawing = lazy(() => import("../pages/site/SiteDrawing/ViewSiteDrawing"));
const WorkDoneSite = lazy(() => import("../pages/site/WorkDone/WorkDoneSite"));
const ViewWorkDone = lazy(() => import("../pages/site/WorkDone/ViewWorkDone"));
const DailyLabourReport = lazy(() => import("../pages/site/DailyLabourReport/DailyLabourReport"));
const ViewDialyReportSite = lazy(() => import("../pages/site/DailyLabourReport/ViewDialyReportSite"));
const MaterialRecievedSite = lazy(() => import("../pages/site/MaterialRecieved/MaterialRecievedSite"));
const ViewMaterialRecieved = lazy(() => import("../pages/site/MaterialRecieved/ViewMaterialRecieved"));
const MaterialIssue = lazy(() => import("../pages/site/MaterialIsuued/MaterialIssue"));
const ViewMaterialIssue = lazy(() => import("../pages/site/MaterialIsuued/ViewMaterialIssue"));
const StockRegister = lazy(() => import("../pages/site/StockRegister/StockRegister"));
const ViewStockRegisterSite = lazy(() => import("../pages/site/StockRegister/ViewStockRegisterSite"));
const PurchaseRequestSite = lazy(() => import("../pages/site/PurchaseRequest/PurchaseRequestSite"));
const ViewPurchaseRequestSite = lazy(() => import("../pages/site/PurchaseRequest/ViewPurchaseRequestSite"));
const SiteAsset = lazy(() => import("../pages/site/SiteAssest/SiteAsset"));
const WeeklyBilling = lazy(() => import("../pages/site/WeeklyBilling/WeeklyBilling"));

// HR
const Employee = lazy(() => import("../pages/Hr/employee/Employee"));
const ViewEmployee = lazy(() => import("../pages/Hr/employee/ViewEmployee"));
const EditEmployee = lazy(() => import("../pages/Hr/employee/EditEmployee"));
const Attendance = lazy(() => import("../pages/Hr/attendance/Attendance"));
const LeaveManagement = lazy(() => import("../pages/Hr/leave/LeaveManagement"));
const PayRoll = lazy(() => import("../pages/Hr/payroll/PayRoll"));
const ViewPayroll = lazy(() => import("../pages/Hr/payroll/ViewPayroll"));
const ContractNmr = lazy(() => import("../pages/Hr/contract & Nmr/ContractNmr"));
const ViewContractor = lazy(() => import("../pages/Hr/contract & Nmr/ViewContractor"));
const EditContractor = lazy(() => import("../pages/Hr/contract & Nmr/EditContractor"));
const NMRattendance = lazy(() => import("../pages/Hr/nmr_attendance/NMRattendance"));
const NMR = lazy(() => import("../pages/Hr/nmr/NMR"));
const ViewNMR = lazy(() => import("../pages/Hr/nmr/ViewNMR"));
const EditNMR = lazy(() => import("../pages/Hr/nmr/EditNMR"));

// Finance
const ClientBilling = lazy(() => import("../pages/finanace/client_billing/ClientBilling"));
const Debit_CreditNote = lazy(() => import("../pages/finanace/debit_creditnote/Debit_CreditNote"));
const BankTransactions = lazy(() => import("../pages/finanace/bank_transactions/BankTransactions"));
const JournalEntry = lazy(() => import("../pages/finanace/journal_entry/JournalEntry"));
const Banks = lazy(() => import("../pages/finanace/banks/Banks"));
const TDS = lazy(() => import("../pages/finanace/tds/TDS"));
const CashEntry = lazy(() => import("../pages/finanace/cash_entry/CashEntry"));
const SupplierOutstanding = lazy(() => import("../pages/finanace/supplier_outstanding/SupplierOutstanding"));
const PurchaseTotalBill = lazy(() => import("../pages/finanace/purchase_bill/PurchaseTotalBill"));
const ContractorBill = lazy(() => import("../pages/finanace/contractor_bill/ContractorBill"));
const InternalBankTransfer = lazy(() => import("../pages/finanace/internal_bank_transfer/InternalBankTransfer"));
const LedgerEntry = lazy(() => import("../pages/finanace/ledger_entry/LedgerEntry"));
const ViewLedgerEntry = lazy(() => import("../pages/finanace/ledger_entry/ViewLedgerEntry"));
const Overall_expenses = lazy(() => import("../pages/finanace/overall_expenses/Overall_expenses"));

// Reports
const ProjectDashboard = lazy(() => import("../pages/reports/project_dashboard/ProjectDashboard"));
const WorkAnalysis = lazy(() => import("../pages/reports/work_analysis/WorkAnalysis"));
const ViewWorkAnalysis = lazy(() => import("../pages/reports/work_analysis/ViewWorkAnalysis"));
const ClientBilling_Report = lazy(() => import("../pages/reports/client_billing/ClientBilling_Report"));
const ViewClientBilling = lazy(() => import("../pages/reports/client_billing/ViewClientBilling"));
const FinancialReport = lazy(() => import("../pages/reports/financial_report/FinancialReport"));
const ViewFinancialReport = lazy(() => import("../pages/reports/financial_report/ViewFinancialReport"));
const ExpensesReport = lazy(() => import("../pages/reports/expenses_report/ExpensesReport"));
const VendorReport = lazy(() => import("../pages/reports/vendor_report/VendorReport"));
const Reconciliation = lazy(() => import("../pages/reports/reconciliation/Reconciliation"));
const ActualvsBilled = lazy(() => import("../pages/reports/actual_vs_billed/ActualvsBilled"));
const CosttoComplete = lazy(() => import("../pages/reports/cost_to_complete/CosttoComplete"));
const Schedule = lazy(() => import("../pages/reports/schedule/Schedule"));
const P_L = lazy(() => import("../pages/reports/p&l/P_L"));
const ViewP_L = lazy(() => import("../pages/reports/p&l/ViewP_L"));
const CashFlow = lazy(() => import("../pages/reports/cash_flow/CashFlow"));
const PlannedvsAcutal = lazy(() => import("../pages/reports/planned_vs_actual/PlannedvsAcutal"));
const ViewTableReport = lazy(() => import("../pages/reports/planned_vs_actual/table/ViewTableReport"));
const LabourProductivity = lazy(() => import("../pages/reports/labour_productiviy/LabourProductivity"));
const ViewLabourProductivity = lazy(() => import("../pages/reports/labour_productiviy/ViewLabourProductivity"));
const MachineProductivity = lazy(() => import("../pages/reports/machine_productivity/MachineProductivity"));
const CollectionProjection = lazy(() => import("../pages/reports/collection_projection/CollectionProjection"));
const ViewCollectionProjection = lazy(() => import("../pages/reports/collection_projection/ViewCollectionProjection"));

// Settings
const User = lazy(() => import("../pages/settings/user/User"));
const ViewUser = lazy(() => import("../pages/settings/user/ViewUser"));
const Roles = lazy(() => import("../pages/settings/roles/Roles"));
const AddRoles = lazy(() => import("../pages/settings/roles/AddRoles"));
const EditRoles = lazy(() => import("../pages/settings/roles/EditRoles"));
const Assets = lazy(() => import("../pages/settings/assets/Assets"));
const AssetDetails = lazy(() => import("../pages/settings/assets/machinery/AssetDetails"));

const AppRoutes = () => {
  return (
    <>
      <Suspense fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <Loader />
        </div>
      }>
        <Routes>
          <Route path="" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/projects/woissuance/requestform/:tenderId/:requestId" element={<WorkOrderRequestForm />} />
          <Route path="/purchase/enquiryform/:tenderId/:requestId" element={<EnquiryForm />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<LayOut />}>
              <Route path="/dashboard">
                <Route index element={<Dashboard />} />
                <Route path="viewcalendar" element={<ViewCalendar />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="profile" element={<Profile />} />
                <Route path="employeedashboard" element={<EmployeeDashboard />} />
              </Route>
              <Route path="/tender">
                <Route path="customers" element={<Customer />} />
                <Route path="tenders">
                  <Route index element={<Tender />} />
                  <Route path="viewtender/:tender_id" element={<ViewTender />} />
                  <Route path=":tender_id/detailedestimate" element={<TenderDetailedEstimate />} />
                  <Route path=":tender_id/zerocost" element={<TenderZeroCost />} />
                </Route>
                <Route path="workorders">
                  <Route index element={<WorkOrder />} />
                  <Route path="viewworkorder/:tender_id/:workOrder_id">
                    <Route index element={<ViewWorkOrder />} />
                    <Route
                      path="viewworkordertable"
                      element={<ViewTableWOBoq />}
                    />
                  </Route>
                </Route>
                <Route path="emd">
                  <Route index element={<EMD />} />
                  <Route path="viewemd/:tender_id" element={<EMDTrackingTable />} />
                </Route>
                <Route path="dlp" element={<DLP />} />
                <Route path="securitydeposit">
                  <Route index element={<SecurityDeposit />} />
                  <Route path="viewsecuritydeposit/:tender_id" element={<SecurityDepositTrackingTable />} />
                </Route>
                <Route path="projectpenalty">
                  <Route index element={<ProjectPenalty />} />
                  <Route
                    path="viewpenalty/:tender_id"
                    element={<PenaltyCardGrid />}
                  />
                </Route>
              </Route>
              <Route path="/projects">
                <Route index element={<Project />} />
                <Route path="zerocost">
                  <Route index element={<ZeroCost />} />
                  <Route path="viewboqsplit" element={<ViewBoqSplit />} />
                  <Route path="editrateanalysis" element={<EditRateAnalysis />} />
                </Route>
                <Route path="detailestimate">
                  <Route index element={<DetailedEstimate />} />
                </Route>
                <Route path="drawingboq">
                  <Route index element={<DrawingBoq />} />
                  <Route path="viewdrawingboq" element={<ViewDrawingBoq />} />
                </Route>
                <Route path="wbs">
                  <Route index element={<WBS />} />
                  <Route path="viewwbs" element={<ViewWbs />} />
                </Route>
                <Route path="projectschedule">
                  <Route index element={<ScheduleProjects />} />
                  <Route path="viewdailyproject" element={<ViewDailyProject />} />
                  <Route path="viewweekly" element={<ViewWeekly />} />
                  <Route
                    path="viewprojectschedule"
                    element={<ViewProjectSchedule />}
                  />
                  <Route
                    path="viewmanpowerhistogram"
                    element={<ViewManPowerHistogram />}
                  />
                  <Route
                    path="viewmechineryschedule"
                    element={<ViewMechinerySchedule />}
                  />
                </Route>

                <Route path="woissuance">
                  <Route index element={<WoIssuance />} />
                  <Route path="viewworequest" element={<ViewWORequest />} />
                  <Route path="viewwoissuance" element={<ViewWOIssuance />} />
                </Route>
                <Route path="clientbillingprojects">
                  <Route index element={<ClientBillingProject />} />
                  <Route
                    path="viewclbillproject"
                    element={<ViewClBillProjects />}
                  />
                </Route>
                <Route path="workprogressprojects">
                  <Route index element={<ProjectWorkProgress />} />
                  <Route
                    path="viewprojectworkprogress"
                    element={<ViewProjectWorkProgress />}
                  />
                </Route>
                <Route
                  path="projectsmaterialquantity"
                  element={<ProjectMaterailQty />}
                />
                <Route path="projectsstocks" element={<StockProject />} />
                <Route path="projectsassets">
                  <Route index element={<ProjectAsset />} />
                  <Route path="details/:assetId" element={<AssetDetails />} />
                </Route>
              </Route>
              <Route path="/purchase">
                <Route path="vendorsupplier">
                  <Route index element={<VendorSupplier />} />
                  <Route
                    path="viewvendorsupplier/:vendorId"
                    element={<ViewVendorSupplier />}
                  />
                </Route>
                <Route path="request">
                  <Route index element={<PurchaseRequest />} />
                  <Route
                    path="viewpurchaserequest"
                    element={<ViewPurchaseRequest />}
                  />
                </Route>

                <Route path="enquiry">
                  <Route index element={<PurchaseEnquiry />} />
                  <Route
                    path="viewpurchaseenquire"
                    element={<ViewPurchaseEnquiry />}
                  />
                </Route>
                <Route path="order">
                  <Route index element={<PurchaseOrder />} />
                  <Route
                    path="viewpurchaseorder"
                    element={<ViewPurchaseOrder />}
                  />
                </Route>
                <Route path="goodsreceipt">
                  <Route index element={<GoodsReceipt />} />
                  <Route path="viewgoodreceipt" element={<ViewGoodRecipt />} />
                </Route>
                <Route path="bill">
                  <Route index element={<PurchaseBill />} />
                  <Route path="viewpurchasebill" element={<ViewPurchaseBill />} />
                </Route>
                <Route path="machinerytracking" element={<MachineryTracking />} />
                <Route path="purchasestocks" element={<PurchaseStocks />} />
                <Route path="purchaseassets"  >
                  <Route index element={<PurchaseAssets />} />
                  <Route path="details/:assetId" element={<AssetDetails />} />
                </Route>
              </Route>
              <Route path="/site">
                <Route index element={<Site />} />
                <Route path="boqsite" element={<BOQSite />} />
                <Route path="detailestimatesite">
                  <Route index element={<DetailedEstimateSite />} />
                  <Route path="viewSE" element={<ViewGS />} />
                  <Route path="viewBillQty" element={<ViewBillQtySite />} />
                  <Route path="viewNewInlet" element={<ViewNewInletSite />} />
                  <Route
                    path="viewroaddetailssite"
                    element={<ViewRoadDetailsSite />}
                  />
                  <Route
                    path="viewroadabstractsite"
                    element={<ViewRoadAbstractSite />}
                  />
                  <Route
                    path="viewretainingwallsite"
                    element={<ViewRetainingWallSite />}
                  />
                  <Route
                    path="viewretainingabstractsite"
                    element={<ViewRetainingAbstractSite />}
                  />
                  <Route path="viewvendorsite" element={<ViewVendorSite />} />
                  <Route
                    path="viewNewInletAbs"
                    element={<ViewNewInletAbsSite />}
                  />
                </Route>
                <Route
                  path="reconciliationsite"
                  element={<ReconciliationSite />}
                />
                <Route path="plannedvsachived" element={<PlannedvsAchived />} />
                <Route path="machineryentry" element={<MachineryEntry />} />
                <Route path="sitedrawing">
                  <Route index element={<SiteDrawing />} />
                  <Route path="viewdrawing" element={<ViewSiteDrawing />} />
                </Route>
                <Route path="workDoneSite">
                  <Route index element={<WorkDoneSite />} />
                  <Route path="viewworkDoneSite" element={<ViewWorkDone />} />
                </Route>
                <Route path="dialylabourreport">
                  <Route index element={<DailyLabourReport />} />
                  <Route
                    path="viewdailylabourReport"
                    element={<ViewDialyReportSite />}
                  />
                </Route>
                <Route path="materialrecievedsite">
                  <Route index element={<MaterialRecievedSite />} />
                  <Route
                    path="viewmaterialrecieved"
                    element={<ViewMaterialRecieved />}
                  />
                </Route>
                <Route path="materialissuedsite">
                  <Route index element={<MaterialIssue />} />
                  <Route
                    path="viewmaterialissued"
                    element={<ViewMaterialIssue />}
                  />
                </Route>
                <Route path="stockregistersite">
                  <Route index element={<StockRegister />} />
                  <Route
                    path="viewstockregistersite"
                    element={<ViewStockRegisterSite />}
                  />
                </Route>
                <Route path="purchaserequestsite">
                  <Route index element={<PurchaseRequestSite />} />
                  <Route
                    path="viewpurchaserequestsite"
                    element={<ViewPurchaseRequestSite />}
                  />
                </Route>
                <Route path="siteassets">
                  <Route index element={<SiteAsset />} />
                  <Route path="details/:assetId" element={<AssetDetails />} />
                </Route>
                <Route path="weeklybillingsite" element={<WeeklyBilling />} />
              </Route>
              <Route path="/hr">
                <Route path="employee">
                  <Route index element={<Employee />} />
                  <Route path="viewemployee" element={<ViewEmployee />} />
                  <Route path="editemployee" element={<EditEmployee />} />
                </Route>
                <Route path="attendance" element={<Attendance />} />
                <Route path="leave" element={<LeaveManagement />} />
                <Route path="payroll">
                  <Route index element={<PayRoll />} />
                  <Route path="viewpayroll" element={<ViewPayroll />} />
                </Route>
                <Route path="contractnmr">
                  <Route index element={<ContractNmr />} />
                  <Route path="viewcontractor" element={<ViewContractor />} />
                  <Route path="editcontractor" element={<EditContractor />} />
                </Route>

                <Route path="NMRattendance" element={<NMRattendance />} />
                <Route path="nmr">
                  <Route index element={<NMR />} />
                  <Route path="viewnmr" element={<ViewNMR />} />
                  <Route path="editnmr" element={<EditNMR />} />
                </Route>
              </Route>

              <Route path="/finance">
                <Route path="clientbilling" element={<ClientBilling />} />
                <Route path="purchasetotalbill" element={<PurchaseTotalBill />} />
                <Route path="contractorbill" element={<ContractorBill />} />
                <Route
                  path="internalbanktransfer"
                  element={<InternalBankTransfer />}
                />
                <Route path="debitcreditnote" element={<Debit_CreditNote />} />
                <Route path="banktransaction" element={<BankTransactions />} />
                <Route path="journalentry" element={<JournalEntry />} />
                {/* <Route path="gst" element={<GST_PL />} /> */}
                <Route path="banks" element={<Banks />} />
                <Route path="tds" element={<TDS />} />
                <Route path="cashentry" element={<CashEntry />} />
                <Route path="ledgerentry">
                  <Route index element={<LedgerEntry />} />
                  <Route path="viewledgerentry" element={<ViewLedgerEntry />} />
                </Route>{" "}
                <Route
                  path="supplieroutstanding"
                  element={<SupplierOutstanding />}
                />
                <Route path="overallexpenses" element={<Overall_expenses />} />
              </Route>
              <Route path="/reports">
                <Route path="projectdashboard" element={<ProjectDashboard />} />
                <Route path="workanalysis">
                  <Route index element={<WorkAnalysis />} />
                  <Route path="viewworkanalysis" element={<ViewWorkAnalysis />} />
                </Route>
                <Route path="clientbilling">
                  <Route index element={<ClientBilling_Report />} />
                  <Route
                    path="viewclientbilling"
                    element={<ViewClientBilling />}
                  />
                </Route>
                <Route path="financialreport">
                  <Route index element={<FinancialReport />} />
                  <Route
                    path="viewfinancialreport"
                    element={<ViewFinancialReport />}
                  />
                </Route>
                <Route path="p&l">
                  <Route index element={<P_L />} />
                  <Route path="viewp&l" element={<ViewP_L />} />
                </Route>
                <Route path="cashflow" element={<CashFlow />} />
                <Route path="expensesreport" element={<ExpensesReport />} />
                <Route path="vendorreport" element={<VendorReport />} />
                <Route path="reconciliation" element={<Reconciliation />} />
                <Route path="actualvsbilled" element={<ActualvsBilled />} />

                <Route path="costtocomplete" element={<CosttoComplete />} />
                <Route path="schedule" element={<Schedule />} />

                <Route path="plannedvsactual">
                  <Route index element={<PlannedvsAcutal />} />
                  <Route path="viewtablereport" element={<ViewTableReport />} />
                </Route>
                <Route path="labourproductivity">
                  <Route index element={<LabourProductivity />} />
                  <Route
                    path="viewlabourproductivity"
                    element={<ViewLabourProductivity />}
                  />
                </Route>
                <Route
                  path="machineproductivity"
                  element={<MachineProductivity />}
                />
                <Route path="collectionprojection">
                  <Route index element={<CollectionProjection />} />
                  <Route
                    path="viewcollectionprojection"
                    element={<ViewCollectionProjection />}
                  />
                </Route>
              </Route>
              <Route path="/settings">
                <Route path="user">
                  <Route index element={<User />} />
                  <Route path="viewuser" element={<ViewUser />} />
                </Route>
                <Route path="roles">
                  <Route index element={<Roles />} />
                  <Route path="editroles" element={<EditRoles />} />
                  <Route path="addroles" element={<AddRoles />} />
                </Route>

                <Route path="assets" >
                  <Route index element={<Assets />} />
                  <Route path="details/:assetId" element={<AssetDetails />} />
                </Route>
                <Route path="hsnmaster" >
                  <Route index element={<HsnMaster />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default AppRoutes;
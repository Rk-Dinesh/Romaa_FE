import { Routes, Route } from "react-router-dom";
import LayOut from "../layout/Layout";
import Dashboard from "../pages/dashboard/Dashboard";
import Customer from "../pages/tender/clients/Clients";
import Tender from "../pages/tender/tenders/Tender";
import ViewTender from "../pages/tender/tenders/view tenders/ViewTender";
import WorkOrder from "../pages/tender/work order/WorkOrder";
import EMD from "../pages/tender/emd/EMD";
import DLP from "../pages/tender/dlp/DLP";
import Project from "../pages/projects/Project";
import VendorSupplier from "../pages/purchase/Vendor & supplier/VendorSupplier";
import PurchaseRequest from "../pages/purchase/purchase request/PurchaseRequest";
import PurchaseEnquiry from "../pages/purchase/purchase enquiry/PurchaseEnquiry";
import PurchaseOrder from "../pages/purchase/purchase order/PurchaseOrder";
import GoodsReceipt from "../pages/purchase/goods receipt/GoodsReceipt";
import PurchaseBill from "../pages/purchase/purchase bill/PurchaseBill";
import MachineryTracking from "../pages/purchase/machinery tracking/MachineryTracking";
import Site from "../pages/site/Site";
import Employee from "../pages/Hr/employee/Employee";
import Leave from "../pages/Hr/leave/Leave";
import PayRoll from "../pages/Hr/payroll/PayRoll";
import ContractNmr from "../pages/Hr/contract & Nmr/ContractNmr";
import ViewEmployee from "../pages/Hr/employee/ViewEmployee";
import EditEmployee from "../pages/Hr/employee/EditEmployee";
import Attendance from "../pages/Hr/attendance/Attendance";
import ClientBilling from "../pages/finanace/client_billing/ClientBilling";
import Debit_CreditNote from "../pages/finanace/debit_creditnote/Debit_CreditNote";
import BankTransactions from "../pages/finanace/bank_transactions/BankTransactions";
import JournalEntry from "../pages/finanace/journal_entry/JournalEntry";
// import GST_PL from "../pages/finanace/gst_pl/GST_PL";
import Banks from "../pages/finanace/banks/Banks";
import TDS from "../pages/finanace/tds/TDS";
import CashEntry from "../pages/finanace/cash_entry/CashEntry";
import SupplierOutstanding from "../pages/finanace/supplier_outstanding/SupplierOutstanding";
import PurchaseTotalBill from "../pages/finanace/purchase_bill/PurchaseTotalBill";
import ZeroCost from "../pages/projects/Project zero cost/ZeroCost";
import DetailedEstimate from "../pages/projects/Detailed estimate/DetailedEstimate";
import ViewBoqSplit from "../pages/tender/tenders/view tenders/zero cost/boq split/ViewBoqSplit";
import BOQSite from "../pages/site/BOQSite/BOQSite";
import DetailedEstimateSite from "../pages/site/DetailedEstimateSite/DetailedEstimateSite";
import ViewGS from "../pages/site/DetailedEstimateSite/GS/ViewGS";
import EditRateAnalysis from "../pages/tender/tenders/view tenders/zero cost/Rate analysis/EditRateAnalysis";
import ViewGs from "../pages/projects/Detailed estimate/general abstract/ViewGs";
import ViewBillQtyProject from "../pages/projects/Detailed estimate/BOQProjects/ViewBOQProject";
import ViewNewInletDet from "../pages/projects/Detailed estimate/new inlet det/ViewNewInletDet";
import ViewNewInletAbs from "../pages/projects/Detailed estimate/new inlet abs/ViewNewInletAbs";
import DrawingBoq from "../pages/projects/drawing vs Boq/DrawingBoq";
import ViewDrawingBoq from "../pages/projects/drawing vs Boq/ViewDrawingBoq";
import WBS from "../pages/projects/WBQ/WBS";
import ViewWbs from "../pages/projects/WBQ/ViewWbs";
import ViewVendorProject from "../pages/projects/Detailed estimate/vendor/ViewVendorProjects";
import ViewWorkOrder from "../pages/tender/work order/view work order/ViewWorkOrder";
import ViewCalendar from "../pages/dashboard/ViewCalendar";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import User from "../pages/settings/user/User";
import Roles from "../pages/settings/roles/Roles";
import AddRoles from "../pages/settings/roles/AddRoles";
import EditRoles from "../pages/settings/roles/EditRoles";
import SecurityDeposit from "../pages/tender/security deposit/SecurityDeposit";
import ProjectPenalty from "../pages/tender/project penalty/ProjectPenalty";
import ViewVendorSupplier from "../pages/purchase/Vendor & supplier/view vendor supplier/ViewVendorSupplier";
import ViewPurchaseRequest from "../pages/purchase/purchase request/ViewPurchaseRequest";
import ViewPurchaseOrder from "../pages/purchase/purchase order/ViewPurchaseOrder";
import ViewBillQtySite from "../pages/site/DetailedEstimateSite/BillQty/viewBillQtySite";
import ViewNewInletSite from "../pages/site/DetailedEstimateSite/NewInletDetSite/viewNewInletSite";
import ViewNewInletAbsSite from "../pages/site/DetailedEstimateSite/NewInletAbsSite/ViewNewInletAbs";
import SiteDrawing from "../pages/site/SiteDrawing/SiteDrawing";
import ViewSiteDrawing from "../pages/site/SiteDrawing/ViewSiteDrawing";
import WorkDoneSite from "../pages/site/WorkDone/WorkDoneSite";
import DailyLabourReport from "../pages/site/DailyLabourReport/DailyLabourReport";
import ViewDialyReportSite from "../pages/site/DailyLabourReport/ViewDialyReportSite";
import MaterialRecievedSite from "../pages/site/MaterialRecieved/MaterialRecievedSite";
import ViewMaterialRecieved from "../pages/site/MaterialRecieved/ViewMaterialRecieved";
import MaterialIssue from "../pages/site/MaterialIsuued/MaterialIssue";
import ViewMaterialIssue from "../pages/site/MaterialIsuued/ViewMaterialIssue";
import StockRegister from "../pages/site/StockRegister/StockRegister";
import ViewStockRegisterSite from "../pages/site/StockRegister/ViewStockRegisterSite";
import PurchaseRequestSite from "../pages/site/PurchaseRequest/PurchaseRequestSite";
import ViewPurchaseRequestSite from "../pages/site/PurchaseRequest/ViewPurchaseRequestSite";
import SiteAsset from "../pages/site/SiteAssest/SiteAsset";
import WeeklyBilling from "../pages/site/WeeklyBilling/WeeklyBilling";
import ProjectDashboard from "../pages/reports/project_dashboard/ProjectDashboard";
import WorkAnalysis from "../pages/reports/work_analysis/WorkAnalysis";
import ClientBilling_Report from "../pages/reports/client_billing/ClientBilling_Report";
import FinancialReport from "../pages/reports/financial_report/FinancialReport";
import ExpensesReport from "../pages/reports/expenses_report/ExpensesReport";
import VendorReport from "../pages/reports/vendor_report/VendorReport";
import Reconciliation from "../pages/reports/reconciliation/Reconciliation";
import ActualvsBilled from "../pages/reports/actual_vs_billed/ActualvsBilled";
import CosttoComplete from "../pages/reports/cost_to_complete/CosttoComplete";
import Schedule from "../pages/reports/schedule/Schedule";
import P_L from "../pages/reports/p&l/P_L";
import CashFlow from "../pages/reports/cash_flow/CashFlow";
import PlannedvsAcutal from "../pages/reports/planned_vs_actual/PlannedvsAcutal";
import LabourProductivity from "../pages/reports/labour_productiviy/LabourProductivity";
import MachineProductivity from "../pages/reports/machine_productivity/MachineProductivity";
import CollectionProjection from "../pages/reports/collection_projection/CollectionProjection";
import ViewWorkAnalysis from "../pages/reports/work_analysis/ViewWorkAnalysis";
import ViewClientBilling from "../pages/reports/client_billing/ViewClientBilling";
import ViewFinancialReport from "../pages/reports/financial_report/ViewFinancialReport";
import Tickets from "../pages/dashboard/tickets/Tickets";
import Profile from "../pages/dashboard/profile/Profile";
import ContractorBill from "../pages/finanace/contractor_bill/ContractorBill";
import InternalBankTransfer from "../pages/finanace/internal_bank_transfer/InternalBankTransfer";
import LedgerEntry from "../pages/finanace/ledger_entry/LedgerEntry";
import ViewLedgerEntry from "../pages/finanace/ledger_entry/ViewLedgerEntry";
import ViewP_L from "../pages/reports/p&l/ViewP_L";
import Overall_expenses from "../pages/finanace/overall_expenses/Overall_expenses";
import NMR from "../pages/Hr/nmr/NMR";
import ViewNMR from "../pages/Hr/nmr/ViewNMR";
import EditNMR from "../pages/Hr/nmr/EditNMR";
import NMRattendance from "../pages/Hr/nmr_attendance/NMRattendance";
import ViewTableReport from "../pages/reports/planned_vs_actual/table/ViewTableReport";
import ViewCollectionProjection from "../pages/reports/collection_projection/ViewCollectionProjection";
import WoIssuance from "../pages/projects/Wo issuance/WOIssuance";
import ViewWORequest from "../pages/projects/Wo issuance/work order request/ViewWORequest";
import ViewWOIssuance from "../pages/projects/Wo issuance/Work order issuance/ViewWOIssuance";
import ClientBillingProject from "../pages/projects/client billing/ClientBillingProject";
import ViewClBillProjects from "../pages/projects/client billing/ViewClBillProjects";
import ProjectWorkProgress from "../pages/projects/work progress/ProjectWorkProgress";
import ViewProjectWorkProgress from "../pages/projects/work progress/ViewProjectWorkProgress";
import ProjectMaterailQty from "../pages/projects/Project Material quantity/ProjectMaterailQty";
import StockProject from "../pages/projects/project stocks/StockProject";
import ProjectAsset from "../pages/projects/project assets/ProjectAsset";
import ViewTableWOBoq from "../pages/tender/work order/view work order/Work order Boq/ViewTableWOBoq";
import EmployeeDashboard from "../pages/dashboard/employee dashboard/EmployeeDashboard";
import ViewRoadDetailsSite from "../pages/site/DetailedEstimateSite/Roaddetails/ViewRoadDetails";
import ViewRoadAbstractSite from "../pages/site/DetailedEstimateSite/RoadAbstract/ViewRoadAbstractSite";
import ViewRetainingWallSite from "../pages/site/DetailedEstimateSite/RetainingWall/ViewRetainingWallSite";
import ViewRetainingAbstractSite from "../pages/site/DetailedEstimateSite/retaining abstract site/ViewRetainingAbstractSite";
import ViewVendorSite from "../pages/site/DetailedEstimateSite/vendor site/ViewVendorSite";
import ReconciliationSite from "../pages/site/reconciliation site/ReconciliationSite";
import PlannedvsAchived from "../pages/site/planned_vs_achived/PlannedvsAchived";
import MachineryEntry from "../pages/site/machinery_Enry/MachineryEntry";
import ViewLabourProductivity from "../pages/reports/labour_productiviy/ViewLabourProductivity";
import ViewPayroll from "../pages/Hr/payroll/ViewPayroll";
import ViewGoodRecipt from "../pages/purchase/goods receipt/ViewGoodRecipt";
import ViewPurchaseBill from "../pages/purchase/purchase bill/ViewPurchaseBill";
import ViewPurchaseEnquiry from "../pages/purchase/purchase enquiry/ViewPurchaseEnquiry";
import PurchaseStocks from "../pages/purchase/purchase stocks/PurchaseStocks";
import PurchaseAssets from "../pages/purchase/purchase assets/PurchaseAssets";
import ScheduleProjects from "../pages/projects/schedule/schedule/ScheduleProjects";
import ViewWeekly from "../pages/projects/schedule/schedule/tabs/weekly/ViewWeekly";
import ViewDailyProject from "../pages/projects/schedule/schedule/tabs/daily/ViewDailyProjects";
import ViewProjectSchedule from "../pages/projects/schedule/schedule/tabs/project schedule/ViewProjectSchedule";
import ViewManPowerHistogram from "../pages/projects/schedule/schedule/tabs/Man Power Histogram/ViewManPowerHistogram";
import ViewMechinerySchedule from "../pages/projects/schedule/schedule/tabs/machinery Schedule/ViewMechinerySchedule";
import EditContractor from "../pages/Hr/contract & Nmr/EditContractor";
import ViewContractor from "../pages/Hr/contract & Nmr/ViewContractor";
import PenaltyCardGrid from "../pages/tender/project penalty/PenaltyView";
import { ToastContainer } from "react-toastify";
import WorkOrderRequestForm from "../pages/projects/Wo issuance/work order request/WorkOrderRequestForm";
import EnquiryForm from "../pages/purchase/purchase enquiry/EnquiryForm";
import Assets from "../pages/settings/assets/Assets";
import EMDTrackingTable from "../pages/tender/emd/viewEMDTracking";
import SecurityDepositTrackingTable from "../pages/tender/security deposit/viewSDTracking";
import TenderDetailedEstimate from "../pages/tender/tenders/view tenders/detailed estimate/TenderDetailedEstimate";
import TenderZeroCost from "../pages/tender/tenders/view tenders/zero cost/TenderZeroCost";
import ViewWorkDone from "../pages/site/WorkDone/ViewWorkDone";
import AssetDetails from "../pages/settings/assets/machinery/AssetDetails";
import ProtectedRoute from "../pages/auth/protectedRoute";
import ViewUser from "../pages/settings/user/ViewUser";
import ResetPassword from "../pages/auth/ResetPassword";

const AppRoutes = () => {
  return (
    <>
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
            {/* <Route path="projectpenalty" element={<ProjectPenalty />} /> */}
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
              <Route path="viewgs" element={<ViewGs />} />
              <Route path="viewboqproject" element={<ViewBillQtyProject />} />
              <Route path="viewnewinletdet" element={<ViewNewInletDet />} />
              <Route path="viewnewinletabs" element={<ViewNewInletAbs />} />

              <Route
                path="viewvendorproject"
                element={<ViewVendorProject />}
              />
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
            <Route path="leave" element={<Leave />} />
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
          </Route>
        </Route>
        </Route>
      </Routes>
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

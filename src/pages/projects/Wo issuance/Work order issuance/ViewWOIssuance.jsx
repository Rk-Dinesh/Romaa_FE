import React, { useEffect, useState } from "react";
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  User, 
  FileText, 
  AlertCircle,
  Printer,
  Truck,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";


// --- Assets ---
import LOGO from "../../../../assets/images/romaa logo.png";
import Icon from "../../../../assets/images/logo icon.png";
import { API } from "../../../../constant";
import Title from "../../../../components/Title";
import Button from "../../../../components/Button";

// --- Helper: Status Badge (Screen Only) ---
const StatusBadge = ({ status }) => {
  const styles = {
    "Vendor Approved": "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    "Work Order Issued": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    "In Progress": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    "Completed": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
};

// --- Helper: Info Card (Screen Only) ---
const InfoCard = ({ title, icon, children, className }) => (
  <div className={`bg-white dark:bg-layout-dark rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col ${className}`}>
    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
      {icon}
      <h3 className="font-bold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-5 space-y-3 flex-1">
      {children}
    </div>
  </div>
);

const DetailRow = ({ label, value, highlight = false }) => (
  <div className="flex justify-between items-start border-b border-gray-50 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
    <span className="text-xs font-semibold text-gray-400 uppercase">{label}</span>
    <span className={`text-sm font-medium text-right ${highlight ? 'text-blue-600 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
      {value || "-"}
    </span>
  </div>
);

const ViewWOIssuance = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedItem = location.state?.item || {};
  const requestIdParam = passedItem.requestId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestIdParam) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${API}/workorderrequest/api/getQuotationApproved/${requestIdParam}`
        );
        const fetchedData = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data;
        setData(fetchedData);
      } catch (err) {
        console.error("Error fetching PO:", err);
        toast.error("Failed to load Work Order details");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestIdParam]);



  if (loading) return <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>;
  if (!data) return <div className="flex h-full items-center justify-center text-gray-500">No Data Found</div>;

  const vendor = data.selectedVendor;

  const handlePrint = () => {
    window.print();
  };

  

  return (
    <>
      {/* This style tag removes standard browser headers/footers (like page URL, date) 
        and sets clean margins for the print job.
      */}
      <style>
        {`
          @media print {
            @page { margin: 10mm; size: auto; }
            body * { visibility: hidden; }
            #print-section, #print-section * { visibility: visible; }
            #print-section { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              margin: 0;
              padding: 0;
              background-color: white !important;
              color: black !important;
            }
          }
        `}
      </style>

      {/* =======================================
          1. SCREEN VIEW (MODERN UI)
          Has class 'print:hidden' so it vanishes on print
         ======================================= */}
      <div className="h-full flex flex-col  dark:bg-[#0b0f19] p-4 overflow-hidden font-roboto-flex print:hidden">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div>
            <Title
              title="Work Order Management"
              sub_title="Order Summary"
              page_title={`Work Order #${data.requestId}`}
            />
            <div className="mt-2 flex items-center gap-3">
               <StatusBadge status={data.status} />
               <span className="text-xs text-gray-400 flex items-center gap-1">
                 <Calendar size={12}/> Issued: {new Date(data.workOrder?.issueDate || Date.now()).toLocaleDateString()}
               </span>
            </div>
          </div>
          
          <div className="flex gap-2">
      
            <Button
              button_name="View Invoice"
              button_icon={<Printer size={18} />}
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            />

            <Button
              button_name="Back"
              button_icon={<ChevronLeft size={18} />}
              onClick={() => navigate("..")}
              className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            />
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto pb-10 space-y-3 pr-2 custom-scrollbar">
          
          {/* INFO CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <InfoCard title="Project Info" icon={<FileText size={16} className="text-blue-500"/>}>
              <DetailRow label="Project ID" value={data.projectId} />
              <DetailRow label="Title" value={data.title} />
              <DetailRow label="Delivery By" value={vendor?.deliveryPeriod ? new Date(vendor.deliveryPeriod).toLocaleDateString() : "-"} />
              <div className="pt-1">
                 <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Description</p>
                 <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">"{data.description}"</p>
              </div>
            </InfoCard>

            <InfoCard title="Site Details" icon={<MapPin size={16} className="text-emerald-500"/>}>
              <DetailRow label="Site Name" value={data.siteDetails?.siteName} />
              <DetailRow label="Location" value={data.siteDetails?.location} />
              <DetailRow label="Incharge" value={data.siteDetails?.siteIncharge} />
              <DetailRow label="Progress" value={data.workOrder?.progressStatus} />
            </InfoCard>

            <InfoCard title="Selected Vendor" icon={<User size={16} className="text-purple-500"/>}>
              <DetailRow label="Name" value={vendor?.vendorName} highlight />
              <DetailRow label="Vendor ID" value={vendor?.vendorId} />
              <DetailRow label="Contact" value={vendor?.contact || "-"} />
              <div className="pt-1">
                 <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Address</p>
                 <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{vendor?.address || "-"}</p>
              </div>
            </InfoCard>
          </div>

          {/* WORK ORDER ITEMS TABLE (SCREEN) */}
          <div className="bg-white dark:bg-layout-dark rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Truck className="text-blue-500" size={20} />
                Work Order Items
              </h3>
              <span className="text-xs text-gray-500 bg-white dark:bg-gray-700 px-3 py-1 rounded border border-gray-200 dark:border-gray-600">
                Ref: <span className="font-mono font-bold text-gray-700 dark:text-gray-200">{vendor?.quotationId || "N/A"}</span>
              </span>
            </div>

            {!vendor?.quoteItems ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                <AlertCircle size={48} className="opacity-20" />
                <p>No item details found for this approved vendor.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold border-b dark:border-gray-700">
                      <th className="px-6 py-3 border-r dark:border-gray-700 w-16 text-center">S.No</th>
                      <th className="px-6 py-3 border-r dark:border-gray-700">Material Name</th>
                      <th className="px-6 py-3 border-r dark:border-gray-700 text-center">Unit</th>
                      <th className="px-6 py-3 border-r dark:border-gray-700 text-right">Quantity</th>
                      <th className="px-6 py-3 border-r dark:border-gray-700 text-right">Rate (₹)</th>
                      <th className="px-6 py-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {vendor.quoteItems?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-center border-r dark:border-gray-700 text-gray-500 font-mono">{idx + 1}</td>
                        <td className="px-6 py-4 border-r dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200">{item.materialName}</td>
                        <td className="px-6 py-4 text-center border-r dark:border-gray-700 text-gray-600 dark:text-gray-400">{item.unit}</td>
                        <td className="px-6 py-4 text-right border-r dark:border-gray-700 font-medium text-gray-800 dark:text-gray-200">{item.quantity}</td>
                        <td className="px-6 py-4 text-right border-r dark:border-gray-700 text-gray-600 dark:text-gray-400">{item.quotedUnitRate?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-800 dark:text-gray-200 bg-gray-50/50 dark:bg-gray-900/20">{item.totalAmount?.toLocaleString()}.00</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-gray-900/10 border-t-2 border-gray-100 dark:border-gray-800">
                      <td colSpan="5" className="px-6 py-4 text-right font-bold text-gray-600 dark:text-gray-300 uppercase text-xs">Total Approved Amount</td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-lg font-bold text-slate-700 dark:text-slate-400 flex justify-end items-center gap-0.5">
                          ₹ {vendor.totalQuotedValue?.toLocaleString()}.00
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =======================================
          2. PRINT VIEW (INVOICE TEMPLATE)
          Wrapped in ID 'print-section' which the style tag targets.
          Visible only when printing due to CSS logic.
         ======================================= */}
      <div id="print-section" className="hidden print:block w-full bg-white px-10 py-16 font-roboto-flex text-black">
        
        {/* Print Header */}
        <div className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Work Order</h1>
            <p className="text-sm font-semibold text-gray-600 mt-1">ID: #{data.requestId}</p>
          </div>
          <img src={LOGO} alt="ROMAA Logo" className="w-32 h-auto object-contain" />
        </div>

        {/* Project & Dates */}
        <div className="flex text-sm justify-between mb-6">
          <div className="w-1/3">
            <p className="font-bold text-gray-800 uppercase text-xs mb-1">Project Name</p>
            <p className="opacity-90 font-light">{data.title || "N/A"}</p>
            <p className="opacity-70 text-xs mt-1">({data.projectId})</p>
          </div>
          <div className="w-1/3 text-center">
            <p className="font-bold text-gray-800 uppercase text-xs mb-1">Due Date</p>
            <p className="opacity-90 font-light">
              {vendor?.deliveryPeriod ? new Date(vendor.deliveryPeriod).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div className="w-1/3 text-right">
            <p className="font-bold text-gray-800 uppercase text-xs mb-1">Location</p>
            <p className="opacity-90 font-light">{data.siteDetails?.location || "Chennai"}</p>
            <p className="opacity-70 text-xs mt-1">{data.siteDetails?.siteName}</p>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="flex text-sm justify-between mb-8 border-b border-gray-300 pb-6">
          <div className="w-1/2">
            <p className="font-bold text-gray-800 uppercase text-xs mb-1">Vendor</p>
            <p className="opacity-90 font-semibold">{vendor?.vendorName || "N/A"}</p>
            <p className="opacity-80 font-light text-xs mt-1 max-w-xs">{vendor?.address || "Address N/A"}</p>
            <p className="opacity-80 font-light text-xs">Ph: {vendor?.contact || "N/A"}</p>
          </div>
          <div className="w-1/2 text-right">
            <p className="font-bold text-gray-800 uppercase text-xs mb-1">Vendor Category</p>
            <p className="opacity-90 font-light">Registered Vendor</p>
            <p className="opacity-70 font-mono text-xs mt-1">{vendor?.vendorId}</p>
          </div>
        </div>

        {/* Watermarked Table */}
        <div className="relative mb-10">
          {/* Watermark Background */}
          <div 
            className="absolute inset-0 z-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url(${Icon})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "30%",
            }}
          />

          <table className="w-full text-sm text-center border-collapse relative z-10">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 font-bold text-gray-800 w-16">S.no</th>
                <th className="border border-gray-400 p-2 font-bold text-gray-800 text-left">Material</th>
                <th className="border border-gray-400 p-2 font-bold text-gray-800 w-20">Qty</th>
                <th className="border border-gray-400 p-2 font-bold text-gray-800 w-20">Unit</th>
                <th className="border border-gray-400 p-2 font-bold text-gray-800 w-28 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {vendor?.quoteItems?.map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-400 p-2 font-light">{idx + 1}</td>
                  <td className="border border-gray-400 p-2 font-light text-left">{item.materialName}</td>
                  <td className="border border-gray-400 p-2 font-light">{item.quantity}</td>
                  <td className="border border-gray-400 p-2 font-light">{item.unit}</td>
                  <td className="border border-gray-400 p-2 font-light text-right">₹ {item.totalAmount?.toLocaleString()}</td>
                </tr>
              ))}
              {/* Grand Total Row */}
              <tr>
                <td colSpan={4} className="border border-gray-400 p-2 text-right font-bold bg-gray-50">
                  Total
                </td>
                <td className="border border-gray-400 p-2 font-bold text-right bg-gray-50">
                  ₹ {vendor?.totalQuotedValue?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms */}
        <div className="mb-6 text-sm">
          <p className="font-semibold text-gray-800 mb-2">Terms and conditions</p>
          <p className="text-xs font-light text-gray-600 leading-relaxed text-justify">
            Lorem ipsum dolor sit amet consectetur. Lorem non condimentum pharetra
            ultrices sit ullamcorper. Aliquet egestas id lectus sodales mus
            interdum. Consectetur nulla faucibus volutpat et habitant pharetra
            faucibus amet. Iaculis viverra pulvinar sed sed posuere elementum
            molestie faucibus.
          </p>
        </div>

        {/* Footer Signatures */}
        <div className="flex justify-between items-end text-sm mt-12 pt-4">
          <div>
            <p className="font-semibold mb-1">Note:</p>
            <p className="text-xs">
              Requested By: <span className="text-gray-700 font-medium">Admin / Work Order Dept</span>
            </p>
            <p className="text-xs mt-1">
              Account No: <span className="text-gray-700 font-medium">XXXXXXX</span>
            </p>
          </div>
          
          <div className="text-right w-40">
            {/* Signature Area */}
            <p className="italic text-lg mb-2 font-handwriting">Authorized Sign</p>
            <hr className="border-gray-400" />
            <p className="text-xs font-light text-center mt-2 italic">
              Signature
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default ViewWOIssuance;

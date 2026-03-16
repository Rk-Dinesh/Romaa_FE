import { useEffect, useState } from "react";
import { ChevronLeft, Calendar, User, FileText, AlertCircle, Printer, Truck, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import LOGO from "../../../../assets/images/RomaaInfra.png";
import Icon from "../../../../assets/images/logo icon.png";
import { API } from "../../../../constant";

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtAmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_STYLES = {
  "Vendor Approved":  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  "Work Order Issued":"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  "In Progress":      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  "Completed":        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
    {status}
  </span>
);

const SectionCard = ({ title, icon, children, accent = "blue" }) => {
  const accents = {
    blue:   "border-blue-500 dark:border-blue-400",
    emerald:"border-emerald-500 dark:border-emerald-400",
    purple: "border-purple-500 dark:border-purple-400",
    amber:  "border-amber-500 dark:border-amber-400",
  };
  return (
    <div className={`bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm h-full flex flex-col border-t-2 ${accents[accent]}`}>
      <div className="px-5 py-3.5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/60">
        <span className="opacity-70">{icon}</span>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-5 flex-1 space-y-3">{children}</div>
    </div>
  );
};

const Field = ({ label, value, mono = false, highlight = false }) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 dark:border-gray-700/40 last:border-0 last:pb-0 first:pt-0">
    <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide shrink-0">{label}</span>
    <span className={`text-sm text-right leading-snug break-words max-w-[60%] ${highlight ? "font-bold text-blue-600 dark:text-blue-400" : "font-medium text-gray-800 dark:text-gray-200"} ${mono ? "font-mono text-xs" : ""}`}>
      {value || "—"}
    </span>
  </div>
);

const MetricCard = ({ label, value, sub, colorClass }) => (
  <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 shadow-sm flex flex-col gap-1">
    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
    <p className={`text-xl font-extrabold ${colorClass}`}>{value}</p>
    {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
  </div>
);

const ViewWOIssuance = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedItem     = location.state?.item || {};
  const requestIdParam = passedItem.requestId;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestIdParam) { setLoading(false); return; }
    axios
      .get(`${API}/workorderrequest/api/getQuotationApproved/${requestIdParam}`)
      .then((res) => {
        const d = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data;
        setData(d);
      })
      .catch(() => toast.error("Failed to load Work Order details"))
      .finally(() => setLoading(false));
  }, [requestIdParam]);

  if (loading)
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-400">
        <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        Loading…
      </div>
    );

  if (!data)
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        No Data Found
      </div>
    );

  const vendor     = data.selectedVendor || {};
  const items      = vendor.quoteItems   || [];
  const gross      = vendor.totalQuotedValue || items.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const cgst       = gross * 0.09;
  const sgst       = gross * 0.09;
  const total      = gross + cgst + sgst;
  const woNumber   = data.workOrder?.woNumber  || data.requestId || "—";
  const issueDate  = data.workOrder?.issueDate || data.requestDate;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section {
            position: absolute; left: 0; top: 0;
            width: 210mm;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* ── SCREEN VIEW ─────────────────────────────────────────────────────── */}
      <div className="min-h-full dark:bg-[#0b0f19] p-5 pb-16 font-roboto-flex print:hidden">
        <div className="max-w-6xl mx-auto space-y-5">

          {/* ── Top bar ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Work Order Issuance</h1>
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded">
                    #{woNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={data.status} />
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={11} /> {fmtDate(issueDate)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-darkest-blue hover:bg-darkest-blue/95 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              <Printer size={15} /> View Invoice
            </button>
          </div>

          {/* ── Metric strip ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label="WO Number"   value={woNumber}            sub={fmtDate(issueDate)}            colorClass="text-gray-900 dark:text-white text-base" />
            <MetricCard label="Gross Amount" value={`₹${fmtAmt(gross)}`} sub="Before GST"                  colorClass="text-blue-600 dark:text-blue-400" />
            <MetricCard label="GST (18%)"   value={`₹${fmtAmt(cgst + sgst)}`} sub="CGST 9% + SGST 9%"    colorClass="text-amber-600 dark:text-amber-400" />
            <MetricCard label="Total Payable" value={`₹${fmtAmt(total)}`} sub="Inc. all taxes"             colorClass="text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* ── Info cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SectionCard title="Project Info" icon={<FileText size={15} className="text-blue-500" />} accent="blue">
              <Field label="Project ID"   value={data.projectId} mono />
              <Field label="Title"        value={data.title} />
              <Field label="Delivery By"  value={vendor?.deliveryPeriod ? fmtDate(vendor.deliveryPeriod) : null} />
              {data.description && (
                <div className="pt-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Description</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 italic">"{data.description}"</p>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Site Details" icon={<MapPin size={15} className="text-emerald-500" />} accent="emerald">
              <Field label="Site Name"  value={data.siteDetails?.siteName} />
              <Field label="Location"   value={data.siteDetails?.location} />
              <Field label="Incharge"   value={data.siteDetails?.siteIncharge} />
              <Field label="Progress"   value={data.workOrder?.progressStatus} />
            </SectionCard>

            <SectionCard title="Vendor" icon={<User size={15} className="text-purple-500" />} accent="purple">
              <Field label="Name"       value={vendor?.vendorName} highlight />
              <Field label="Vendor ID"  value={vendor?.vendorId} mono />
              <Field label="Contact"    value={vendor?.contact} />
              <Field label="Quotation"  value={vendor?.quotationId} mono />
              {vendor?.address && (
                <div className="pt-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Address</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{vendor.address}</p>
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── Items table ── */}
          <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-900/30">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-blue-500" />
                <h3 className="font-bold text-gray-800 dark:text-white text-sm">Work Order Items</h3>
                {items.length > 0 && (
                  <span className="ml-1 text-[11px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {vendor?.quotationId && (
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Ref: <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{vendor.quotationId}</span>
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-3 text-gray-400">
                <AlertCircle size={36} className="opacity-30" />
                <p className="text-sm">No items found for this work order.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/40 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-center w-12">#</th>
                        <th className="px-4 py-3 text-left">Particulars</th>
                        <th className="px-4 py-3 text-center w-20">Unit</th>
                        <th className="px-4 py-3 text-right w-24">Qty</th>
                        <th className="px-4 py-3 text-right w-32">Basic Rate (₹)</th>
                        <th className="px-4 py-3 text-right w-32">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/20 transition-colors">
                          <td className="px-4 py-3.5 text-center text-gray-400 font-mono text-xs">{idx + 1}</td>
                          <td className="px-4 py-3.5 font-semibold text-gray-800 dark:text-gray-200">{item.materialName}</td>
                          <td className="px-4 py-3.5 text-center text-gray-500 dark:text-gray-400 uppercase text-xs font-medium">{item.unit}</td>
                          <td className="px-4 py-3.5 text-right text-gray-700 dark:text-gray-300 font-medium">{item.quantity}</td>
                          <td className="px-4 py-3.5 text-right text-gray-600 dark:text-gray-400">{fmtAmt(item.quotedUnitRate)}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-gray-900 dark:text-white">{fmtAmt(item.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tax summary footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50/60 dark:bg-gray-900/20">
                  <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                      {[
                        { label: "Gross Amount",    value: fmtAmt(gross),       cls: "text-gray-700 dark:text-gray-300" },
                        { label: "CGST @ 9%",       value: fmtAmt(cgst),        cls: "text-gray-600 dark:text-gray-400" },
                        { label: "SGST @ 9%",       value: fmtAmt(sgst),        cls: "text-gray-600 dark:text-gray-400" },
                      ].map(({ label, value, cls }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                          <span className={`font-medium ${cls}`}>₹ {value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-gray-300 dark:border-gray-600">
                        <span className="text-sm font-bold text-gray-800 dark:text-white">Total Payable</span>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">₹ {fmtAmt(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── PRINT / INVOICE ─────────────────────────────────────────────────── */}
      {(() => {
        const ITEMS_PER_PAGE = 7;
        const pGross  = vendor?.totalQuotedValue || vendor?.quoteItems?.reduce((s, i) => s + (i.totalAmount || 0), 0) || 0;
        const pCgst   = pGross * 0.09;
        const pSgst   = pGross * 0.09;
        const pTotal  = pGross + pCgst + pSgst;
        const pFmt    = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const pDate   = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
        const woNo    = data.workOrder?.woNumber  || data.requestId || "—";
        const issued  = data.workOrder?.issueDate || data.requestDate;
        const allItems = vendor?.quoteItems || [];

        // Split items into pages of max 7
        const chunks = [];
        if (allItems.length === 0) {
          chunks.push([]);
        } else {
          for (let i = 0; i < allItems.length; i += ITEMS_PER_PAGE) {
            chunks.push(allItems.slice(i, i + ITEMS_PER_PAGE));
          }
        }
        const totalPages = chunks.length;

        // Shared: compact page header (used on page 2+)
        const CompactHeader = () => (
          <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: "2px solid #2B3A6B" }}>
            <img src={LOGO} alt="ROMAA" className="h-9 w-auto object-contain" />
            <div className="text-right text-xs text-gray-500">
              <span className="font-semibold text-gray-800 font-mono">{woNo}</span>
              <span className="mx-2 text-gray-300">|</span>
              <span>{pDate(issued)}</span>
              <span className="ml-2 text-[10px] text-gray-400 italic">contd.</span>
            </div>
          </div>
        );

        // Shared: items table
        const ItemsTable = ({ chunk, startIdx }) => (
          <div className="relative flex-1">
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `url(${Icon})`, backgroundRepeat: "no-repeat",
              backgroundPosition: "center", backgroundSize: "28%", opacity: 0.04,
            }} />
            <table className="w-full text-xs relative" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #2B3A6B" }}>
                  <th className="py-2 pr-3 text-center font-bold text-gray-700" style={{ width: "32px" }}>Sl.</th>
                  <th className="py-2 pr-3 text-left font-bold text-gray-700">Particulars</th>
                  <th className="py-2 pr-3 text-center font-bold text-gray-700" style={{ width: "52px" }}>Qty</th>
                  <th className="py-2 pr-3 text-center font-bold text-gray-700" style={{ width: "52px" }}>Unit</th>
                  <th className="py-2 pr-3 text-right font-bold text-gray-700" style={{ width: "90px" }}>Rate (Rs.)</th>
                  <th className="py-2 text-right font-bold text-gray-700" style={{ width: "90px" }}>Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {chunk.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td className="py-2.5 pr-3 text-center text-gray-400">{startIdx + i + 1}</td>
                    <td className="py-2.5 pr-3 text-gray-800 font-medium">{item.materialName}</td>
                    <td className="py-2.5 pr-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-2.5 pr-3 text-center text-gray-500 uppercase">{item.unit}</td>
                    <td className="py-2.5 pr-3 text-right text-gray-600">{pFmt(item.quotedUnitRate)}</td>
                    <td className="py-2.5 text-right text-gray-800 font-semibold">{pFmt(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

        return (
          <div id="print-section" className="hidden print:block font-roboto-flex text-black bg-white">
            {chunks.map((chunk, pageIdx) => {
              const isFirst = pageIdx === 0;
              const isLast  = pageIdx === totalPages - 1;
              const startIdx = pageIdx * ITEMS_PER_PAGE;

              return (
                <div
                  key={pageIdx}
                  style={{
                    width: "210mm",
                    height: "297mm",
                    boxSizing: "border-box",
                    padding: "10mm 12mm",
                    display: "flex",
                    flexDirection: "column",
                    background: "white",
                    pageBreakAfter: isLast ? "auto" : "always",
                    overflow: "hidden",
                  }}
                >
                  {isFirst ? (
                    <>
                      {/* ── Page 1: full header ── */}
                      <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: "3px solid #2B3A6B" }}>
                        <img src={LOGO} alt="ROMAA" className="h-12 w-auto object-contain" />
                        <div className="text-right">
                          <p className="font-extrabold text-xl tracking-[0.2em] uppercase" style={{ color: "#2B3A6B" }}>WORK ORDER</p>
                          <div className="mt-1 text-xs space-y-0.5 text-gray-500">
                            <p>WO No &nbsp;<span className="font-semibold text-gray-800 font-mono">{woNo}</span></p>
                            <p>Date &nbsp;&nbsp;<span className="font-semibold text-gray-800">{pDate(issued)}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* FROM / TO */}
                      <div className="grid grid-cols-2 mb-3" >
                        <div className="px-4 py-3" >
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "#2B3A6B" }}>From</p>
                          <p className="font-extrabold text-sm leading-tight" style={{ color: "#2B3A6B" }}>ROMAA INFRAA PVT. LTD</p>
                          <div className="text-[11px] leading-[1.6] text-gray-500">
                            <p>1/107, P.R. Road, Nerkundram, Chennai – 600107</p>
                            <p>Ph: 044-23333333 &nbsp;·&nbsp; </p>
                            <p>GSTIN: 33AAECR6992B1Z9</p>
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "#2B3A6B" }}>To</p>
                          <p className="font-extrabold text-sm leading-tight text-gray-900">{vendor?.vendorName || "—"}</p>
                          <div className="text-[11px] leading-[1.6] text-gray-500 mt-1">
                            <p className="whitespace-pre-line">{vendor?.address || "—"}</p>
                            {vendor?.contact && <p>Ph: {vendor.contact}</p>}
                            {vendor?.gstin   && <p>GSTIN: {vendor.gstin}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Ref row */}
                      <div className="flex  justify-between gap-6 text-[11px] mb-3">
                        {data.siteDetails?.location && (
                          <p className="text-gray-500">Site &nbsp;<span className="font-semibold text-gray-800">{data.siteDetails.location}</span></p>
                        )}
                        <p className="text-gray-500">Ref No. &nbsp;<span className="font-semibold text-gray-800">{vendor?.quotationId || "—"}</span></p>
                        <p className="text-gray-500">Ref Date &nbsp;<span className="font-semibold text-gray-800">{pDate(vendor?.deliveryPeriod)}</span></p>
                      </div>
                      <div className="mb-3" style={{ borderTop: "1px solid #e2e8f0" }} />
                    </>
                  ) : (
                    <CompactHeader />
                  )}

                  {/* Items table */}
                  <ItemsTable chunk={chunk} startIdx={startIdx} />

                  {/* Last page: tax + despatch + terms + footer */}
                  {isLast && (
                    <div className="mt-4 space-y-3">

                      {/* Tax summary */}
                      <div className="flex justify-end">
                        <div className="text-xs space-y-1" style={{ width: "200px" }}>
                          {[
                            { label: "Gross Amount", value: pFmt(pGross) },
                            { label: "CGST @ 9%",    value: pFmt(pCgst)  },
                            { label: "SGST @ 9%",    value: pFmt(pSgst)  },
                            { label: "Rounded",       value: "—"          },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between text-gray-600">
                              <span>{label}</span>
                              <span className="tabular-nums">{value}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pt-1.5 font-bold text-sm text-gray-900" style={{ borderTop: "1.5px solid #2B3A6B" }}>
                            <span>Total</span>
                            <span className="tabular-nums">{pFmt(pTotal)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Despatch To */}
                      {(data.siteDetails?.siteName || data.siteDetails?.location) && (
                        <div className="text-[11px]" style={{ paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Despatch To</p>
                          <p className="text-gray-700">
                            {[data.siteDetails.siteName, data.siteDetails.location].filter(Boolean).join(", ")}
                            {data.siteDetails.siteIncharge && ` — Attn: ${data.siteDetails.siteIncharge}`}
                          </p>
                        </div>
                      )}

                      {/* Terms */}
                      <div className="text-[11px] leading-[1.55]" style={{ paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Terms &amp; Conditions</p>
                        <ol className="list-decimal list-inside space-y-0.5 text-gray-600">
                          <li>Labour Accommodation / ER Water usage – Romaa Scope.</li>
                          <li>Above rates including materials supply and labour charges.</li>
                          <li>Payment Advance will be made during the work in Progress.</li>
                          <li>If the work is delayed due to the contractor's actions, penalties may be applicable to the project.</li>
                          <li>Payment will be made on submission of bills with proper acknowledgement from site Admin.</li>
                          <li>Rs 1,50,000/- advance payment will be released after material Delivery.</li>
                          <li>10% of Payment released during work; balance after Work Completion.</li>
                          <li>TDS Extra.</li>
                        </ol>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-end items-end" style={{ paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                       
                        <div className="text-center">
                          <div className="mb-8 text-[10px] text-gray-500">
                            <p className="font-bold text-gray-800 uppercase tracking-wide text-[11px]">for ROMAA INFRAA PVT. LTD</p>
                          </div>
                          <div style={{ width: "150px", borderTop: "1px solid #94a3b8" }} />
                          <p className="text-[9px] text-gray-400 mt-1 italic">Authorised Signatory</p>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        );
      })()}
    </>
  );
};

export default ViewWOIssuance;

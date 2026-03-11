import { useState } from "react";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";
import { Pencil, Building2, User, MapPin, Shield, CreditCard, Calendar, Briefcase, IndianRupee } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import EditContractor from "./EditContractor";

const ViewContractor = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const contractor = state?.item || {};
  const [onEdit, setOnEdit] = useState(false);

  if (!state?.item) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No contractor data found.</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-blue-600 underline text-sm">Go Back</button>
      </div>
    );
  }

  const InfoBlock = ({ label, value, className = "" }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-200 break-words">{value || "-"}</span>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "INACTIVE": return "bg-gray-100 text-gray-700 border-gray-200";
      case "SUSPENDED": return "bg-amber-100 text-amber-700 border-amber-200";
      case "BLACKLISTED": return "bg-red-100 text-red-700 border-red-200";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "withdrawn": return "bg-gray-100 text-gray-500 border-gray-200";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const assignedProjects = contractor.assigned_projects || [];
  const wageFixing = contractor.wage_fixing || [];

  return (
    <>
      {!onEdit ? (
        <div className="font-layout-font">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <Title title="HR Management" sub_title="Contractor Details" page_title={contractor.contractor_name || "View Contractor"} />
            <div className="mt-4 sm:mt-0">
              <ButtonBg button_name="Edit Profile" button_icon={<Pencil size={16} />} onClick={() => setOnEdit(true)} />
            </div>
          </div>

          <div className="flex flex-col gap-3">

            {/* Contractor Info & Status */}
            <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                <Building2 className="text-blue-500" size={20} />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Contractor Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoBlock label="Contractor ID" value={contractor.contractor_id} />
                <InfoBlock label="Contractor Name" value={contractor.contractor_name} />
                <InfoBlock label="Business Type" value={contractor.business_type} />
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md border w-fit ${getStatusColor(contractor.status)}`}>
                    {contractor.status}
                  </span>
                </div>
                <InfoBlock label="Total Employees" value={contractor.total_employees} />
                <InfoBlock label="License Number" value={contractor.license_number} />
              </div>
            </div>

            {/* Contact & Contract Period */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <User className="text-emerald-500" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Contact Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <InfoBlock label="Contact Person" value={contractor.contact_person} />
                  <InfoBlock label="Phone" value={contractor.contact_phone} />
                  <InfoBlock label="Email" value={contractor.contact_email} className="col-span-2" />
                </div>
              </div>

              <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <Calendar className="text-purple-500" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Contract Period</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <InfoBlock label="Start Date" value={contractor.contract_start_date ? new Date(contractor.contract_start_date).toLocaleDateString("en-GB") : "-"} />
                  <InfoBlock label="End Date" value={contractor.contract_end_date ? new Date(contractor.contract_end_date).toLocaleDateString("en-GB") : "-"} />
                  <InfoBlock label="Remarks" value={contractor.remarks} className="col-span-2" />
                </div>
              </div>
            </div>

            {/* Assigned Projects */}
            {assignedProjects.length > 0 && (
              <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <Briefcase className="text-cyan-500" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Assigned Projects</h3>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">Tender ID</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">Project Name</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">Assigned Date</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedProjects.map((p, i) => (
                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{p.tender_id}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">{p.project_name}</td>
                          <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">
                            {p.assigned_date ? new Date(p.assigned_date).toLocaleDateString("en-GB") : "-"}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getStatusColor(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Wage Fixing */}
            {wageFixing.length > 0 && (
              <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <IndianRupee className="text-green-500" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Wage Fixing</h3>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">Category</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">Wage (Rs/day)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wageFixing.map((w, i) => (
                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">{w.category}</td>
                          <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">Rs {w.wage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Address & Legal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <MapPin className="text-amber-500" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Address</h3>
                </div>
                <div className="space-y-4">
                  <InfoBlock label="Street" value={contractor.address?.street} />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoBlock label="City" value={contractor.address?.city} />
                    <InfoBlock label="State" value={contractor.address?.state} />
                    <InfoBlock label="Country" value={contractor.address?.country} />
                    <InfoBlock label="Pincode" value={contractor.address?.pincode} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <Shield className="text-rose-500" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Legal & Tax</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <InfoBlock label="GST Number" value={contractor.gst_number} />
                  <InfoBlock label="PAN Number" value={contractor.pan_number} />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            {contractor.account_details && (
              <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <CreditCard className="text-indigo-500" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Bank & Payment Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <InfoBlock label="Account Holder" value={contractor.account_details?.account_holder_name} />
                  <InfoBlock label="Bank Name" value={contractor.account_details?.bank_name} />
                  <InfoBlock label="Branch" value={contractor.account_details?.branch_name} />
                  <InfoBlock label="Account Number" value={contractor.account_details?.account_number} />
                  <InfoBlock label="IFSC Code" value={contractor.account_details?.ifsc_code} />
                  <InfoBlock label="UPI ID" value={contractor.account_details?.upi_id} />
                  <InfoBlock label="Payment Terms" value={contractor.account_details?.payment_terms} />
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        <EditContractor />
      )}
    </>
  );
};

export default ViewContractor;

import React, { useMemo } from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../../components/Title";
import Button from "../../../../components/Button";

const ViewWORequest = () => {
  const location = useLocation();
  const rowData = location.state?.item;
  const navigate = useNavigate();

  // 🧮 Function to calculate GST totals per vendor
  const calculateVendorAmounts = (vendor) => {
    const quoteItems = vendor.quoteItems || [];
    const calculated = quoteItems.map((item) => {
      const gross = item.quantity * item.quotedUnitRate;
      const cgst = gross * 0.09;
      const sgst = gross * 0.09;
      const total = gross + cgst + sgst;
      const roundOff = Math.round(total) - total;
      const netAmount = Math.round(total);
      return { ...item, gross, cgst, sgst, roundOff, netAmount };
    });

    const totalSummary = calculated.reduce(
      (acc, item) => {
        acc.gross += item.gross;
        acc.cgst += item.cgst;
        acc.sgst += item.sgst;
        acc.roundOff += item.roundOff;
        acc.net += item.netAmount;
        return acc;
      },
      { gross: 0, cgst: 0, sgst: 0, roundOff: 0, net: 0 }
    );

    return { calculated, totalSummary };
  };

  return (
    <div className="h-full">
      {/* Page Header */}
      <div className="h-1/12">
        <Title
          title="Projects Management"
          sub_title="WOR"
          active_title="View Work Order Request"
        />
      </div>

      <div className="overflow-auto h-11/12 no-scrollbar">
        {/* Main Description */}
        <div className="bg-white dark:bg-layout-dark p-4 rounded-lg mt-6 mb-6">
          <p className="font-semibold text-lg">
            {rowData?.title || "—"}
          </p>
          <p className="text-sm opacity-80 mt-1">
            {rowData?.description || "No description available"}
          </p>
        </div>

        {/* Vendor Quotations Section */}
        {rowData?.vendorQuotations?.map((vendor, vIndex) => {
          const { calculated, totalSummary } = calculateVendorAmounts(vendor);
          return (
            <div
              key={vIndex}
              className="dark:bg-layout-dark bg-white p-4 rounded-lg mb-8 shadow-sm"
            >
              {/* Vendor Info */}
              <div className="flex justify-between items-center border-b border-gray-300 dark:border-slate-700 pb-2 mb-3">
                <div>
                  <h2 className="text-base font-semibold">
                    Vendor: {vendor.vendorName} ({vendor.vendorId})
                  </h2>
                  <p className="text-xs opacity-70">
                    Quotation ID: {vendor.quotationId} | Date:{" "}
                    {new Date(vendor.quotationDate).toLocaleDateString("en-GB")}
                  </p>
                  <p className="text-xs opacity-70">
                    Delivery Period:{" "}
                    {vendor.deliveryPeriod
                      ? new Date(vendor.deliveryPeriod).toLocaleDateString("en-GB")
                      : "—"}
                  </p>
                  <p className="text-xs opacity-70">
                    Address: {vendor.address}
                  </p>
                </div>
                <div
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    vendor.approvalStatus === "Approved"
                      ? "bg-green-100 text-green-700"
                      : vendor.approvalStatus === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {vendor.approvalStatus || "—"}
                </div>
              </div>

              {/* Vendor Items Table */}
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200">
                    <th className="py-2 px-3 text-left">S.No</th>
                    <th className="py-2 px-3 text-left">Work </th>
                    <th className="py-2 px-3 text-center">Quantity</th>
                    <th className="py-2 px-3 text-center">Unit</th>
                    <th className="py-2 px-3 text-right">Rate (₹)</th>
                    <th className="py-2 px-3 text-right">Gross (₹)</th>
                    <th className="py-2 px-3 text-right">CGST (9%)</th>
                    <th className="py-2 px-3 text-right">SGST (9%)</th>
                    <th className="py-2 px-3 text-right">Round Off</th>
                    <th className="py-2 px-3 text-right">Net (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {calculated.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-200 dark:border-slate-700"
                    >
                      <td className="py-2 px-3">{i + 1}</td>
                      <td className="py-2 px-3">{item.materialName}</td>
                      <td className="py-2 px-3 text-center">{item.quantity}</td>
                      <td className="py-2 px-3 text-center">{item.unit}</td>
                      <td className="py-2 px-3 text-right">
                        {item.quotedUnitRate.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {item.gross.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {item.cgst.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {item.sgst.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {item.roundOff.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-green-700">
                        ₹{item.netAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Totals */}
                <tfoot>
                  <tr className="bg-gray-100 dark:bg-slate-800 font-semibold">
                    <td colSpan="5" className="py-2 px-3 text-right">
                      Total
                    </td>
                    <td className="py-2 px-3 text-right">
                      ₹{totalSummary.gross.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      ₹{totalSummary.cgst.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      ₹{totalSummary.sgst.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      ₹{totalSummary.roundOff.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-green-700">
                      ₹{totalSummary.net.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}

        {/* 📋 Terms & Conditions */}
        <div className="dark:bg-layout-dark bg-white p-4 rounded-lg text-sm mt-6">
          <p className="font-bold text-lg mb-2">Terms & Conditions</p>
          <p className="text-xs opacity-70 leading-relaxed">
            All materials must be delivered within the approved delivery period.
            Payment will be made as per company norms after inspection and
            acceptance at site.
          </p>
        </div>

        {/* 🔙 Back Button */}
        <div className="flex justify-end py-4">
          <Button
            onClick={() => navigate("..?tab=1")}
            button_name="Back"
            button_icon={<IoChevronBackSharp />}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewWORequest;

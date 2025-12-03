import React, { useEffect, useState } from "react";
import romaaLogo from "../../../assets/images/romaa logo.png";
import { HiArrowsUpDown } from "react-icons/hi2";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../constant";
import { useParams } from "react-router-dom";

const EnquiryForm = ({ onCancel, onSubmit }) => {
  const { tenderId, requestId } = useParams();

  const [rows, setRows] = useState([]);
  const [purchaseOrderRequestId, setPurchaseOrderRequestId] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [selectedVendor, setSelectedVendor] = useState("");
  const [deliveryPeriod, setDeliveryPeriod] = useState("");

  // ✅ Fetch materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(
          `${API}/purchaseorderrequest/api/getdetailbyId/${tenderId}/${requestId}`
        );

        if (
          res.data.data.materialsRequired &&
          Array.isArray(res.data.data.materialsRequired)
        ) {
          const formatted = res.data.data.materialsRequired.map(
            (item, index) => ({
              sno: index + 1,
              work: item.materialName || "Work",
              unit: item.unit || "",
              quantity: item.quantity || 0,
              enterPrice: "",
              total: "",
              materialId: item._id,
            })
          );
          setRows(formatted);
          setPurchaseOrderRequestId(res.data.data._id);
        }
      } catch (error) {
        console.error("Error fetching materials:", error);
        toast.error("Failed to load materials");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [tenderId, requestId]);


  

  // ✅ Update price & total dynamically
  const handlePriceChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].enterPrice = value;
    updatedRows[index].total = value ? value * updatedRows[index].quantity : "";
    setRows(updatedRows);
  };


// ✅ Submit Vendor Quotation
const handleSubmit = async () => {
  const hasEmpty = rows.some((r) => !r.enterPrice);
  if (hasEmpty) {
    toast.warning("Please enter price for all items");
    return;
  }

  if (!selectedVendor) {
    toast.warning("Please enter a vendor ID or name before submitting");
    return;
  }

  if (!deliveryPeriod) {
    toast.warning("Please select a delivery date");
    return;
  }

  const quoteItems = rows.map((r) => ({
    materialName: r.work,
    quotedUnitRate: Number(r.enterPrice),
    unit:r.unit,
    quantity: Number(r.quantity),
    totalAmount: Number(r.total),
  }));

  try {
    const payload = {
      purchaseOrderRequestId,
      tenderId,
      vendorId: selectedVendor.toUpperCase(),
      deliveryPeriod,
      quoteItems,
    };

    const res = await axios.post(
      `${API}/purchaseorderrequest/api/purchase-requests/${purchaseOrderRequestId}/vendor-quotation`,
      payload
    );

    toast.success("Your quotation submitted successfully!");

    // ✅ Reset the form fields
    setSelectedVendor("");
    setDeliveryPeriod("");
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        enterPrice: "",
        total: "",
      }))
    );

    // ✅ Optional: refresh data if needed
    // fetchMaterials();  // Uncomment if you want to re-fetch materials after submit

    // ✅ Trigger parent callback if provided
    if (onSubmit) onSubmit(res.data);
  } catch (error) {
    console.error("Error submitting quotation:", error);
    toast.error(
      error.response?.data?.message || "Failed to submit vendor quotation"
    );
  }
};


  return (
    <div className="font-roboto-flex rounded-md mx-10 mt-4 p-10 bg-blue-50 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mt-2 pb-2 border-b border-dashed border-gray-300">
        <img src={romaaLogo} alt="ROMAA" className="h-10 object-contain" />
        <h3 className="text-2xl font-semibold text-darkest-blue">
        EnquiryForm
        </h3>
      </div>

      {/* Vendor & Delivery Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 mb-4">
        {/* Vendor Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor ID
          </label>
          <input
            type="text"
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            placeholder="Enter Vendor ID or Name"
            className="w-full border uppercase border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Delivery Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Date
          </label>
          <input
            type="date"
            value={deliveryPeriod}
            onChange={(e) => setDeliveryPeriod(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading...</div>
      ) : (
        <>
          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-center text-sm border-collapse">
              <thead>
                <tr className="text-black border-b border-gray-200">
                  {[
                    "S.no",
                    "Material",
                    "Unit",
                    "Quantity",
                    "Enter price",
                    "Total",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-2 whitespace-nowrap font-semibold"
                    >
                      <div className="flex items-center justify-center gap-1">
                        {heading}
                        <HiArrowsUpDown className="cursor-pointer text-gray-500" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700 font-bold">
                {rows.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2.5">{row.sno}</td>
                    <td className="first-letter:uppercase">{row.work}</td>
                    <td>{row.unit}</td>
                    <td>{row.quantity}</td>
                    <td>
                      <input
                        type="number"
                        value={row.enterPrice}
                        onChange={(e) =>
                          handlePriceChange(index, e.target.value)
                        }
                        className="border border-blue-200 rounded-md px-2 py-1 text-center w-24 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.total}
                        readOnly
                        className="border border-blue-200 rounded-md px-2 py-1 text-center w-24 bg-gray-50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-5 py-1.5 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-1.5 bg-darkest-blue text-white rounded-md hover:bg-blue-900 flex items-center gap-2 transition"
            >
              <span>Submit</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EnquiryForm;

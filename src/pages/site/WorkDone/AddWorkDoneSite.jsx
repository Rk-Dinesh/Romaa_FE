import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/Modal";
import { Trash2, Calculator, CalendarDays, FileText } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";

// --- Validation Schema ---
const schema = yup.object().shape({
  report_date: yup.date().required("Report Date is required"),
  work_order_id: yup.string().required("Work Order is required"),
  dailyWorkDone: yup.array().of(
    yup.object().shape({
      item_description: yup.string(),
      length: yup.number().transform((v) => (isNaN(v) ? 0 : v)).default(0),
      breadth: yup.number().transform((v) => (isNaN(v) ? 0 : v)).default(0),
      height: yup.number().transform((v) => (isNaN(v) ? 0 : v)).default(0),
      quantity: yup.number().transform((v) => (isNaN(v) ? 0 : v)).default(0),
      unit: yup.string(),
      contractor_details: yup.string().default(""), 
      remarks: yup.string().default(""),
      maxQuantity: yup.number().nullable(),
    })
  ),
});

const AddWorkDoneSite = ({ onclose, onSuccess }) => {
  const tenderId = localStorage.getItem("tenderId");
  const [loading, setLoading] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      report_date: new Date().toISOString().split("T")[0],
      work_order_id: "",
      dailyWorkDone: [],
    },
  });

  const { fields, replace, remove } = useFieldArray({
    control,
    name: "dailyWorkDone",
  });

  const watchedItems = watch("dailyWorkDone");
  const selectedWorkOrder = watch("work_order_id");

  // --- 1. Fetch Work Orders ---
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const res = await axios.get(`${API}/workorderrequest/api/getWorkOrderIssuedForWorkDone/${tenderId}`);
        setWorkOrders(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching work orders:", err);
      }
    };
    if (tenderId) fetchWorkOrders();
  }, [tenderId]);

  // --- 2. Handle Work Order Selection ---
  useEffect(() => {
    if (!selectedWorkOrder) return;

    const loadDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/workorderrequest/api/getdetailbyId/${tenderId}/${selectedWorkOrder}`);
        
        // Handle if API returns array or object
        const details = Array.isArray(res.data?.data) ? res.data?.data[0] : res.data?.data;
        
        if (details && details.materialsRequired) {
          const formattedItems = details.materialsRequired.map((mat) => ({
            item_description: mat.materialName,
            length: 0,
            breadth: 0,
            height: 0,
            quantity: 0, 
            unit: mat.unit,
            contractor_details: "",
            remarks: "",
            maxQuantity:mat.ex_quantity
          }));
          
          replace(formattedItems); 
        }
      } catch (err) {
        toast.error("Failed to load work order details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [selectedWorkOrder, tenderId, replace]);

  // --- 3. Auto-Calculate Quantity ---
  // useEffect(() => {
  //   watchedItems.forEach((item, index) => {
  //     const l = parseFloat(item.length) || 0;
  //     const b = parseFloat(item.breadth) || 0;
  //     const h = parseFloat(item.height) || 0;

  //     // Only calc if user hasn't typed a manual quantity yet or if dimensions change
  //     if (l > 0 && b > 0) {
  //       const calculated = h > 0 ? l * b * h : l * b;
  //       if (Math.abs(parseFloat(item.quantity) - parseFloat(calculated.toFixed(4))) > 0.001) {
  //           setValue(`dailyWorkDone.${index}.quantity`, parseFloat(calculated.toFixed(4)));
  //       }
  //     }
  //   });
  // }, [JSON.stringify(watchedItems.map(i => ({ l: i.length, b: i.breadth, h: i.height })))]);

  const onSubmit = async (data) => {
    const validItems = [];

    // --- STEP A: Filter and Validate Rows ---
    for (const item of data.dailyWorkDone) {
      const qty = Number(item.quantity) || 0;
      const hasDimensions = (Number(item.length) > 0 && Number(item.breadth) > 0);

      // 1. Skip empty rows
      if (qty === 0 && !hasDimensions) continue;

      // 2. Validate Max Quantity
      if (item.maxQuantity !== null && qty > item.maxQuantity) {
        toast.error(`Quantity for "${item.item_description}" exceeds limit of ${item.maxQuantity}`);
        return;
      }

      // 3. Validate Completeness (Contractor & Remarks)
      if (!item.contractor_details || item.contractor_details.trim() === "") {
        toast.warning(`Please fill Contractor details for "${item.item_description}"`);
        return;
      }
      if (!item.remarks || item.remarks.trim() === "") {
        toast.warning(`Please fill Remarks for "${item.item_description}"`);
        return;
      }

      // Add to valid items payload
      validItems.push({
        item_description: item.item_description,
        length: Number(item.length) || 0,
        breadth: Number(item.breadth) || 0,
        height: Number(item.height) || 0,
        quantity: qty,
        unit: item.unit,
        remarks: item.remarks,
        contractor_details: item.contractor_details,
      });
    }

    if (validItems.length === 0) {
      toast.warning("Please fill details for at least one item.");
      return;
    }

    try {
      setLoading(true);
      
      // --- STEP B: Submit Work Done ---
      const payload = {
        tender_id: tenderId,
        work_order_id: data.work_order_id,
        report_date: data.report_date,
        dailyWorkDone: validItems, 
        created_by: "Site Engineer", 
      };

      await axios.post(`${API}/workdone/api/create`, payload);
      toast.success("Daily Work Report Submitted!");

      // --- STEP C: Check for Auto-Completion ---
      // Fetch the updated work order details to check remaining quantities
      const checkRes = await axios.get(`${API}/workorderrequest/api/getdetailbyId/${tenderId}/${data.work_order_id}`);
      const updatedWO = Array.isArray(checkRes.data?.data) ? checkRes.data.data[0] : checkRes.data?.data;

      if (updatedWO && updatedWO.materialsRequired) {
        // Check if EVERY item has 0 quantity remaining
        const allCompleted = updatedWO.materialsRequired.every((item) => {
           // Handle key variations (quantity or ex_quantity)
           const remaining =item.ex_quantity;
           return remaining <= 0;
        });

        if (allCompleted) {
          await axios.put(`${API}/workorderrequest/api/pass_wo/${data.work_order_id}`, {
            status: "Completed",
          });
          toast.info(`Work Order ${data.work_order_id} marked as Completed.`);
        }
      }

      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Daily Progress Report (DPR)"
      onclose={onclose}
      widthClassName="w-full max-w-7xl"
      child={
        <form onSubmit={handleSubmit(onSubmit)} className="p-3 font-roboto-flex bg-gray-50/50 dark:bg-[#0b0f19]">
          
          {/* --- 1. Report Metadata --- */}
          <div className="flex flex-wrap items-end gap-4 mb-4 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Report Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="date"
                  {...register("report_date")}
                  className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none w-full sm:w-48"
                />
              </div>
              <p className="text-xs text-red-500 min-h-[16px]">{errors.report_date?.message}</p>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto">
               <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Select Work Order <span className="text-red-500">*</span></label>
               <div className="relative">
                 <FileText className="absolute left-3 top-2.5 text-gray-400" size={16} />
                 <select
                   {...register("work_order_id")}
                   className="pl-9 pr-8 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none w-full sm:w-64 appearance-none cursor-pointer"
                 >
                   <option value="">Select Work Order</option>
                   {workOrders.map((wo) => (
                     <option key={wo._id} value={wo.requestId}>{wo.requestId}</option>
                   ))}
                 </select>
               </div>
               <p className="text-xs text-red-500 min-h-[16px]">{errors.work_order_id?.message}</p>
            </div>
          </div>

          {/* --- 2. Dynamic Work Items Table --- */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-4 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 min-w-[200px] font-semibold text-gray-600 dark:text-gray-300">Description</th>
                    <th className="px-2 py-3 w-20 text-center font-semibold text-gray-600 dark:text-gray-300">L</th>
                    <th className="px-2 py-3 w-20 text-center font-semibold text-gray-600 dark:text-gray-300">B</th>
                    <th className="px-2 py-3 w-20 text-center font-semibold text-gray-600 dark:text-gray-300">H</th>
                    <th className="px-4 py-3 w-32 font-semibold text-gray-600 dark:text-gray-300">Total Qty <span className="text-red-500">*</span></th>
                    <th className="px-4 py-3 w-28 font-semibold text-gray-600 dark:text-gray-300">Unit</th>
                    <th className="px-4 py-3 min-w-[160px] font-semibold text-gray-600 dark:text-gray-300">Contractor</th>
                    <th className="px-4 py-3 min-w-[200px] font-semibold text-gray-600 dark:text-gray-300">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {fields.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-400">
                        {selectedWorkOrder ? "No items found in this Work Order." : "Please select a Work Order to load items."}
                      </td>
                    </tr>
                  ) : (
                    fields.map((item, index) => {
                      const currentQty = watchedItems[index]?.quantity || 0;
                      const maxQty = item.maxQuantity || 0;
                      const isExceeded = currentQty > maxQty;
                      const isDisabled = maxQty === 0;

                      return (
                        <tr key={item.id} className={`group hover:bg-blue-50/30 dark:hover:bg-gray-700/20 transition-colors ${isDisabled ? 'bg-gray-50 dark:bg-gray-900/50 opacity-60' : ''}`}>
                          
                          <td className="px-4 py-2 align-top">
                            <div className="py-1.5 text-sm font-medium text-gray-800 dark:text-gray-200">
                                {item.item_description} {isDisabled && <span className="text-green-600 font-bold text-xs ml-2">(Completed)</span>}
                            </div>
                            <input type="hidden" {...register(`dailyWorkDone.${index}.item_description`)} />
                          </td>

                          {['length', 'breadth', 'height'].map((dim) => (
                            <td key={dim} className="px-2 py-2 align-top">
                              <input
                                type="number"
                                step="any"
                                placeholder="0"
                                disabled={isDisabled}
                                {...register(`dailyWorkDone.${index}.${dim}`)}
                                className="w-full text-center rounded-lg border border-gray-300 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-all"
                              />
                            </td>
                          ))}

                          <td className="px-4 py-2 align-top">
                            <div className="relative group/qty">
                               <Calculator size={14} className="absolute left-3 top-3 text-gray-400 group-focus-within/qty:text-blue-500" />
                               <input
                                type="number"
                                step="any"
                                disabled={isDisabled}
                                {...register(`dailyWorkDone.${index}.quantity`)}
                                className={`w-full pl-9 rounded-lg border py-1.5 text-sm font-bold outline-none transition-all ${isExceeded ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-300 text-blue-700 bg-blue-50/50 focus:border-blue-500'} disabled:bg-gray-100 dark:bg-gray-900 dark:border-gray-600 dark:text-blue-400`}
                              />
                            </div>
                            <p className={`text-[10px] mt-1 ${isExceeded ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                Max: {maxQty}
                            </p>
                          </td>

                          <td className="px-4 py-2 align-top">
                            <div className="py-1.5 text-sm text-gray-600 dark:text-gray-400">{item.unit}</div>
                            <input type="hidden" {...register(`dailyWorkDone.${index}.unit`)} />
                          </td>

                          <td className="px-4 py-2 align-top">
                            <input
                              type="text"
                              disabled={isDisabled}
                              {...register(`dailyWorkDone.${index}.contractor_details`)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-all"
                              placeholder={isDisabled ? "N/A" : "Enter Contractor"}
                            />
                          </td>

                          <td className="px-4 py-2 align-top">
                            <input
                              type="text"
                              disabled={isDisabled}
                              {...register(`dailyWorkDone.${index}.remarks`)}
                              placeholder="Notes..."
                              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-all"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onclose}
              className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium text-sm shadow-sm transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700 font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? "Submitting..." : "Submit Daily Report"}
            </button>
          </div>
        </form>
      }
    />
  );
};

export default AddWorkDoneSite;
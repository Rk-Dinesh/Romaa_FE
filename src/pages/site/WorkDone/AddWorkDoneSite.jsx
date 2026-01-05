import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/Modal";
import { Plus, Trash2, Calculator, CalendarDays } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";

// --- Validation Schema ---
const schema = yup.object().shape({
  report_date: yup.date().required("Report Date is required"),
  dailyWorkDone: yup.array().of(
    yup.object().shape({
      item_description: yup.string().required("Description is required"),
      length: yup.number().transform((v) => (isNaN(v) ? 0 : v)).default(0),
      breadth: yup.number().transform((v) => (isNaN(v) ? 0 : v)).default(0),
      height: yup.number().transform((v) => (isNaN(v) ? 0 : v)).default(0),
      quantity: yup
        .number()
        .typeError("Qty must be a number")
        .required("Qty is required")
        .min(0.0001, "Qty > 0"),
      unit: yup.string().required("Unit is required"),
      contractor_details: yup.string().default("NMR"),
      remarks: yup.string().default(""),
    })
  ),
});

const AddWorkDoneSite = ({ onclose, onSuccess }) => {
  const tenderId = localStorage.getItem("tenderId");
  const [loading, setLoading] = useState(false);

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
      dailyWorkDone: [
        {
          item_description: "",
          length: 0,
          breadth: 0,
          height: 0,
          quantity: 0,
          unit: "Nos",
          contractor_details: "NMR",
          remarks: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dailyWorkDone",
  });

  // Watch fields for calculations
  const watchedItems = watch("dailyWorkDone");

  // --- Auto-Calculate Quantity Effect ---
  // useEffect(() => {
  //   watchedItems.forEach((item, index) => {
  //     const l = parseFloat(item.length) || 0;
  //     const b = parseFloat(item.breadth) || 0;
  //     const h = parseFloat(item.height) || 0;

  //     if (l > 0 && b > 0) {
  //       const calculated = h > 0 ? l * b * h : l * b;
  //       if (parseFloat(item.quantity) !== parseFloat(calculated.toFixed(4))) {
  //           setValue(`dailyWorkDone.${index}.quantity`, parseFloat(calculated.toFixed(4)));
  //       }
  //     }
  //   });
  // }, [JSON.stringify(watchedItems.map(i => ({ l: i.length, b: i.breadth, h: i.height })))]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {

        tender_id: tenderId,
        report_date: data.report_date,
        created_by: "Site Engineer",
        dailyWorkDone: data.dailyWorkDone.map((item) => ({
          item_description: item.item_description,
          dimensions: {
            length: Number(item.length) || 0,
            breadth: Number(item.breadth) || 0,
            height: Number(item.height) || 0,
          },
          quantity: Number(item.quantity),
          unit: item.unit,
          remarks: item.remarks,
          contractor_details: item.contractor_details,

        })),
      };

      await axios.post(`${API}/workdone/api/create`, payload);
      toast.success("Daily Work Report Submitted!");
      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const constructionUnits = ["m3", "sq.ft", "sq.m", "rft", "Nos", "LumpSum", "kg", "MT"];

  return (
    <Modal
      title="Daily Progress Report (DPR)"
      onclose={onclose}
      widthClassName="w-full max-w-6xl"
      child={
        <form onSubmit={handleSubmit(onSubmit)} className="p-3 font-roboto-flex bg-gray-50/50 dark:bg-[#0b0f19]">

          {/* --- 1. Report Metadata --- */}
          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Report Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="date"
                  {...register("report_date")}
                  className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all w-full sm:w-48"
                />
              </div>
              <p className="text-xs text-red-500 min-h-[16px]">{errors.report_date?.message}</p>
            </div>

            <div className="flex-1 flex justify-end gap-8 border-l border-gray-200 dark:border-gray-700 pl-6 hidden sm:flex">
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold">Project ID</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{tenderId}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold">Total Entries</div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400 text-center">{fields.length}</div>
              </div>
            </div>
          </div>


          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-4 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 min-w-[280px] font-semibold text-gray-600 dark:text-gray-300">Description of Work <span className="text-red-500">*</span></th>
                    <th className="px-2 py-3 w-20 text-center font-semibold text-gray-600 dark:text-gray-300">L</th>
                    <th className="px-2 py-3 w-20 text-center font-semibold text-gray-600 dark:text-gray-300">B</th>
                    <th className="px-2 py-3 w-20 text-center font-semibold text-gray-600 dark:text-gray-300">H</th>
                    <th className="px-4 py-3 w-32 font-semibold text-gray-600 dark:text-gray-300">Total Qty <span className="text-red-500">*</span></th>
                    <th className="px-4 py-3 w-28 font-semibold text-gray-600 dark:text-gray-300">Unit <span className="text-red-500">*</span></th>
                    <th className="px-4 py-3 min-w-[160px] font-semibold text-gray-600 dark:text-gray-300">Contractor / NMR</th>
                    <th className="px-4 py-3 min-w-[220px] font-semibold text-gray-600 dark:text-gray-300">Remarks</th>
                    <th className="px-2 py-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {fields.map((item, index) => (
                    <tr key={item.id} className="group hover:bg-blue-50/30 dark:hover:bg-gray-700/20 transition-colors">

                      {/* Description */}
                      <td className="px-4 py-2 align-center">
                        <textarea
                          {...register(`dailyWorkDone.${index}.item_description`)}
                          placeholder="Type work details..."
                          rows={1}
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm  dark:bg-gray-900 dark:border-gray-600 dark:text-white resize-none transition-all outline-none"
                        />
                        <p className="text-[10px] text-red-500 mt-1">{errors.dailyWorkDone?.[index]?.item_description?.message}</p>
                      </td>

                      {/* Dimensions (L, B, H) */}
                      {['length', 'breadth', 'height'].map((dim) => (
                        <td key={dim} className="px-2 py-2 align-center">
                          <input
                            type="number"
                            step="any"
                            placeholder="0"
                            {...register(`dailyWorkDone.${index}.${dim}`)}
                            className="w-full text-center rounded-lg border border-gray-300 py-1.5 text-sm outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-all"
                          />
                        </td>
                      ))}

                      {/* Quantity (Auto or Manual) */}
                      <td className="px-4 py-2 align-center">
                        <div className="relative group/qty">
                          <Calculator size={14} className="absolute left-3 top-3 text-gray-400 group-focus-within/qty:text-blue-500" />
                          <input
                            type="number"
                            step="any"
                            {...register(`dailyWorkDone.${index}.quantity`)}
                            className="w-full pl-9 rounded-lg border border-gray-300 py-1.5 text-sm font-bold text-blue-700 bg-blue-50/50 outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-blue-400 transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-red-500 mt-1">{errors.dailyWorkDone?.[index]?.quantity?.message}</p>
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-2 align-center">
                        <select
                          {...register(`dailyWorkDone.${index}.unit`)}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white cursor-pointer"
                        >
                          {constructionUnits.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>

                      {/* Contractor Details */}
                      <td className="px-4 py-2 align-center">
                        <input
                          type="text"
                          {...register(`dailyWorkDone.${index}.contractor_details`)}
                          placeholder="NMR"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-all"
                        />
                      </td>

                      {/* Remarks */}
                      <td className="px-4 py-2 align-center">
                        <input
                          type="text"
                          {...register(`dailyWorkDone.${index}.remarks`)}
                          placeholder="Notes..."
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-all"
                        />
                      </td>

                      {/* Delete Action */}
                      <td className="px-2 py-2 text-center align-center pt-2">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all dark:hover:bg-red-900/20"
                            title="Remove Row"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Row Button */}
            <div className="p-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => append({ item_description: "", length: 0, breadth: 0, height: 0, quantity: 0, unit: "Nos", contractor_details: "NMR", remarks: "" })}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all dark:hover:bg-blue-900/20 dark:text-blue-400"
              >
                <Plus size={18} /> Add New Line Item
              </button>
            </div>
          </div>

          {/* --- 3. Footer Actions --- */}
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
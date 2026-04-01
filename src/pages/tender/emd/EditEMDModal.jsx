import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import { InputFieldTender } from "../../../components/InputFieldTender";
import { useEditEMD } from "../tenders/hooks/useTenders";

const schema = yup.object().shape({
  emd_deposit_amount_collected: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .min(0, "Amount cannot be negative"),
  emd_note: yup.string().required("Note is required"),
});

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(val ?? 0);

const EditEMDModal = ({ item, onclose, onUpdated }) => {
  const { mutate: updateEMD, isPending } = useEditEMD({
    onSuccess: onUpdated,
    onClose: onclose,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = (data) => {
    updateEMD({ tenderId: item.tender_id, data });
  };

  const emd = item?.emd?.approved_emd_details;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Collect EMD Payment</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item?.tender_name || item?.tender_id}</p>
          </div>
          <button onClick={onclose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar flex flex-col gap-5">

          {/* Balance Summary */}
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="flex flex-col items-center py-4 px-2 bg-gray-50 dark:bg-gray-800/40">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total</span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{fmt(emd?.emd_approved_amount)}</span>
            </div>
            <div className="flex flex-col items-center py-4 px-2 bg-gray-50 dark:bg-gray-800/40">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Collected</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(emd?.emd_deposit_amount_collected)}</span>
            </div>
            <div className="flex flex-col items-center py-4 px-2 bg-gray-50 dark:bg-gray-800/40">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Balance</span>
              <span className="text-sm font-bold text-red-500 dark:text-red-400">{fmt(emd?.emd_deposit_pendingAmount)}</span>
            </div>
          </div>

          {/* Extra Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Company</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5 truncate">{emd?.emd_proposed_company || "—"}</p>
            </div>
            <div className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Bank</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5 truncate">{emd?.emd_applied_bank || "—"}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Form Fields */}
          <form id="editEMDForm" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <InputFieldTender
              label="Amount Collected"
              name="emd_deposit_amount_collected"
              type="number"
              register={register}
              errors={errors}
              placeholder="Enter amount"
            />
            <InputFieldTender
              label="Notes"
              name="emd_note"
              type="textarea"
              register={register}
              errors={errors}
              placeholder="Enter description"
            />
          </form>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onclose}
            disabled={isPending}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editEMDForm"
            disabled={isPending}
            className="px-8 py-2 text-sm font-bold text-white bg-darkest-blue hover:bg-blue-900 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : <><IoSaveOutline size={16} /> Save</>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditEMDModal;

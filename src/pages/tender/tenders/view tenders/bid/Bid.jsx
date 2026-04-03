import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MdArrowBackIosNew } from "react-icons/md";
import { IoAlertCircleOutline, IoClose } from "react-icons/io5"; // Added for icon
import DeleteModal from "../../../../../components/DeleteModal"; // We can reuse this or a generic Modal
import Table from "../../../../../components/Table";
import axios from "axios";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";
import UploadBid from "./UploadBid";
import { GiArrowFlights } from "react-icons/gi";

const customerColumns = [
  { label: "Item ID", key: "item_id" },
  { label: "Item Name", key: "item_name" },
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Units", key: "unit" },
  {
    label: "Basic Rate",
    key: "base_rate",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
  {
    label: "Basic Amount",
    key: "base_amount",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
  {
    label: "Q-Rate",
    key: "q_rate",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
  {
    label: "Q-Amount",
    key: "q_amount",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
  {
    label: "N-Rate",
    key: "n_rate",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
  {
    label: "N-Amount",
    key: "n_amount",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
];

const Bid = ({ onBack }) => {
  const { tender_id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bidfreezed, setbidfreezed] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);

  const fetchBoqItems = useCallback(async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/bid/get?tender_id=${tender_id}`);
      setItems(res.data.data.items || []);
      setbidfreezed(res.data.data.freezed);
    } catch (err) {
      toast.info(`${err.response?.data?.message || "Error fetching items"}`);
    } finally {
      setLoading(false);
    }
  }, [tender_id]);

  useEffect(() => {
    fetchBoqItems();
  }, [fetchBoqItems]);

  const handlefreeze = async () => {
    setIsFreezing(true);
    try {
      await axios.put(`${API}/bid/freeze/${tender_id}`);
      toast.success("Bid submission locked successfully");
      setbidfreezed(true);
      setShowFreezeModal(false);
    } catch {
      toast.error("Process failed. Please try again.");
    } finally {
      setIsFreezing(false);
    }
  };

  return (
    <>
      <Table
        endpoint={items}
        columns={customerColumns}
        loading={loading}
        exportModal={false}
        // FIX: Only show freeze button if there are items and it's not loading
        freeze={items.length > 0 && !loading}
        freezeButtonIcon={<GiArrowFlights size={18} />}
        freezeButtonLabel={bidfreezed ? "Freezed" : "Freeze Bid"}
        onfreeze={bidfreezed ? null : () => setShowFreezeModal(true)}
        UploadModal={bidfreezed ? false : UploadBid}
        onUpdated={fetchBoqItems}
        onSuccess={fetchBoqItems}
        idKey="item_code"
        pagination={false}
      />

 {/* --- PROFESSIONAL CONFIRMATION MODAL --- */}
{showFreezeModal && (
  <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all">
    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
      
      {/* 1. Modal Header (Neutral/System) */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Action Required
        </h3>
        <button
          onClick={() => setShowFreezeModal(false)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 transition-colors"
        >
          <IoClose size={22} />
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-10">
        {/* 2. Visual Alert Icon (High Visibility Amber) */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-amber-50 dark:bg-amber-900/20 mb-6">
          <IoAlertCircleOutline className="h-12 w-12 text-amber-600 drop-shadow-sm" />
        </div>

        <div className="text-center">
          {/* 3. Title */}
          <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
            Finalize Bid Submission?
          </h4>

          {/* 4. Tender ID Highlight (Technical/System Color) */}
          <div className="mb-6">
             <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-left ml-1">
              Reference Identifier
            </span>
            <code className="block w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 py-4 px-6 rounded-xl font-mono text-lg font-black tracking-[0.25em] border-2 border-slate-200 dark:border-slate-700 shadow-sm">
              {tender_id}
            </code>
          </div>

          {/* 5. Final Text (Light Green/Grey Validation Block) */}
          <div className="bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 p-5 rounded-xl text-left">
            <p className="text-[14px] text-slate-600 dark:text-emerald-100/80 leading-relaxed">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[10px] tracking-wider block mb-1">
                Final Instruction
              </span>
              Executing this command will <strong className="text-slate-900 dark:text-white underline decoration-emerald-500/40 underline-offset-4">permanently lock</strong> all BOQ items. 
              Further uploads or rate modifications will be strictly disabled.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Modal Footer (Action Oriented) */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
        <button
          onClick={() => setShowFreezeModal(false)}
          className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all"
        >
          Go Back
        </button>
        <button
          onClick={handlefreeze}
          disabled={isFreezing}
          className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {isFreezing ? "Processing..." : "Confirm & Freeze"}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Back Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-darkest-blue text-white px-8 py-2 rounded-lg cursor-pointer hover:bg-opacity-90 transition-all font-medium shadow-sm"
        >
          <MdArrowBackIosNew size={14} /> Back
        </button>
      </div>
    </>
  );
};

export default Bid;

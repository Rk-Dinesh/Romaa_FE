import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { API } from "../../../constant";
import { useProject } from "../../../context/ProjectContext";

const DrawingBoq = () => {
  const { tenderId } = useProject();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- New State: Track modified item codes ---
  const [modifiedCodes, setModifiedCodes] = useState(new Set());

  // --- 1. Fetch Data ---
  const fetchDrawingBoq = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/boq/get-drawing-quantity/${tenderId}`);
      // Ensure numeric fields are numbers
      const sanitizedData = (res.data.data || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        n_rate: Number(item.n_rate) || 0,
        drawing_quantity: Number(item.drawing_quantity) || 0,
        variable_quantity: Number(item.variable_quantity) || 0,
        variable_amount: Number(item.variable_amount) || 0,
      }));
      setItems(sanitizedData);
      setModifiedCodes(new Set()); // Reset tracking on fresh fetch
    } catch (err) {
      toast.error("Failed to fetch Drawing BOQ items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawingBoq();
  }, [tenderId]);

  // --- 2. Local State Update (Calculation Logic) ---
  const handleQuantityChange = (index, newVal) => {
    // 1. Mark this item as modified
    const itemCode = items[index].item_id || items[index].item_code;
    setModifiedCodes(prev => new Set(prev).add(itemCode));

    // 2. Update State
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      const item = { ...updatedItems[index] };

      const newDrawingQty = newVal === "" ? 0 : Number(newVal);

      item.drawing_quantity = newDrawingQty;

      // If drawing qty is 0, variable qty becomes 0 (based on your previous logic req)
      // Otherwise standard formula: BOQ - Drawing
      if (newDrawingQty === 0) {
        item.variable_quantity = 0;
      } else {
        item.variable_quantity = item.quantity - newDrawingQty;
      }

      item.variable_amount = item.variable_quantity * item.n_rate;

      updatedItems[index] = item;
      return updatedItems;
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setModifiedCodes(new Set());
    fetchDrawingBoq(); // Revert changes by re-fetching
  };

  // --- 3. Save Data (Optimized Payload) ---
  const handleSave = async () => {
    // Optimization: If nothing changed, don't call API
    if (modifiedCodes.size === 0) {
      toast.info("No changes to save");
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      // Filter: Only include items that are in the modifiedCodes Set
      const changedItems = items.filter(item =>
        modifiedCodes.has(item.item_id || item.item_code)
      );

      const itemsPayload = {
        items: changedItems.map(i => ({
          item_code: i.item_id || i.item_code,
          drawing_quantity: i.drawing_quantity,
        }))
      };

      // console.log(itemsPayload);

      const res = await axios.put(`${API}/boq/bulk-update-drawing-quantity/${tenderId}`, itemsPayload);

      if (res.status === 200 || res.data.success) {
        toast.success(`Updated ${changedItems.length} items successfully`);
        setIsEditing(false);
        fetchDrawingBoq();
      }
    } catch (err) {
      toast.error("Failed to save changes");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. Helpers ---
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  const grandTotal = useMemo(() =>
    items.reduce((sum, item) => sum + (item.variable_amount || 0), 0),
    [items]);

  // --- Render ---
  if (loading && !items.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="font-roboto-flex flex flex-col gap-0.5 h-full py-2 overflow-hidden">

      <div className="flex items-center justify-between bg-white dark:bg-layout-dark p-4 border border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Drawing vs BOQ / {tenderId}</h2>
          <span className="text-sm text-gray-500 font-normal"> Variance Amount:</span>
          <span className={`text-sm font-semibold ${grandTotal < 0 ? "text-red-600" : "text-emerald-600"}`}>
            {formatCurrency(grandTotal)}
          </span>
        </div>

        {/* Action Buttons */}
        <div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 text-sm font-medium rounded-md bg-slate-600 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Edit Quantities
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                {isSaving ? "Saving..." : `Save (${modifiedCodes.size})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Table Container --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase text-gray-500 font-semibold sticky top-0 z-5 ">
            <tr>
              <th className="px-4 py-3 ">#</th>
              <th className="px-4 py-3 w-30">Item Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-left w-30">BOQ Qty</th>
              <th className="px-4 py-3 text-left bg-blue-50/50 dark:bg-blue-900/10 w-40">Drawing Qty</th>
              <th className="px-4 py-3 text-left w-30">Var. Qty</th>
              <th className="px-4 py-3 text-left w-30">Variance </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item, index) => {
              // Highlight row if modified
              const isModified = modifiedCodes.has(item.item_id || item.item_code);
              const rowClass = isModified
                ? "bg-blue-50/40 dark:bg-blue-900/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50";

              return (
                <tr key={item.item_id || index} className={`${rowClass} transition-colors`}>
                  <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">
                    {item.item_id || item.item_code}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-md truncate" title={item.item_name}>
                    {item.item_name}
                  </td>
                  <td className="px-4 py-3 text-left font-medium">
                    {item.quantity}
                  </td>

                  {/* Editable Field */}
                  <td className="px-4 py-2 text-left bg-blue-50/30 dark:bg-blue-900/5">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.drawing_quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-full text-left border border-blue-300 dark:border-blue-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800"
                        placeholder="0"
                      />
                    ) : (
                      <span className="font-semibold text-blue-700 dark:text-blue-400">
                        {item.drawing_quantity}
                      </span>
                    )}
                  </td>

                  {/* Calculated Fields */}
                  <td className={`px-4 py-3 text-left font-medium ${item.variable_quantity < 0 ? "text-red-500" : "text-gray-600"}`}>
                    {item.variable_quantity?.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-left font-medium ${item.variable_amount < 0 ? "text-red-600" : "text-gray-800 dark:text-gray-200"}`}>
                    {formatCurrency(item.variable_amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {items.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">No items found for this tender.</div>
        )}
      </div>
    </div>
  );
};

export default DrawingBoq;
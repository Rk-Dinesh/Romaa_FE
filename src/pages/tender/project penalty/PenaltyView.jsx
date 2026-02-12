import React from "react";
import { useParams } from "react-router-dom";
import { useTenderPenalties } from "./hooks/usePenalities";


const PenaltyCardGrid = () => {
  const { tender_id } = useParams();

  // 1. Fetch Data (Cached)
  const { 
    data: penalties = [], 
    isLoading, 
    isError, 
    error 
  } = useTenderPenalties(tender_id);

  if (isLoading) {
    return <p className="p-4 text-white">Loading penalties...</p>;
  }

  if (isError) {
    return <p className="p-4 text-red-500">Error: {error.message}</p>;
  }

  return (
    <div className="p-4 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Penalty List</h2>
        <span className="text-sm text-gray-400">Total: {penalties.length}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {penalties.length === 0 && (
          <p className="text-center col-span-full text-gray-400 py-10">
            No penalties found for this tender.
          </p>
        )}

        {penalties.map((penalty) => (
          <div
            key={penalty.penalty_id}
            className="bg-gray-800 rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-shadow border border-gray-700"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold truncate pr-2" title={penalty.penalty_type}>
                  {penalty.penalty_type}
                </h3>
                <StatusBadge status={penalty.status} />
              </div>

              <div className="space-y-2 mt-4">
                <p className="text-gray-300 flex justify-between">
                  <span className="font-semibold text-gray-400">Amount:</span> 
                  <span className="font-mono text-lg">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(penalty.penalty_amount)}
                  </span>
                </p>
                <p className="text-gray-300 flex justify-between">
                  <span className="font-semibold text-gray-400">Date:</span>
                  <span>{new Date(penalty.penalty_date).toLocaleDateString("en-GB")}</span>
                </p>
                <div className="pt-2 border-t border-gray-700 mt-2">
                  <span className="font-semibold text-gray-400 text-sm block mb-1">Description:</span>
                  <p className="text-sm text-gray-300 line-clamp-3" title={penalty.description}>
                    {penalty.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper Component for Status Colors
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    paid: "bg-green-600/20 text-green-400 border-green-600/50",
    waived: "bg-blue-600/20 text-blue-400 border-blue-600/50",
    default: "bg-gray-600/20 text-gray-400 border-gray-600/50"
  };

  const currentStyle = styles[status?.toLowerCase()] || styles.default;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase border ${currentStyle}`}>
      {status}
    </span>
  );
};

export default PenaltyCardGrid;
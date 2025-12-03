import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../../constant";
import { useParams } from "react-router-dom";

const PenaltyCardGrid = () => {
    const { tender_id } = useParams();
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPenalties() {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API}/penalty/gettender/${tender_id}`);

        setPenalties(response.data?.data?.penalties || []);
        
      console.log(response.data?.data?.penalties);
        
        
        
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Error fetching data");
        setPenalties([]);
      } finally {
        setLoading(false);
      }
    }

    if (tender_id) {
      fetchPenalties();
    }
  }, [tender_id]);

  if (loading) {
    return <p className="p-4 text-white">Loading penalties...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-4 text-white min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Penalty List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {penalties.length === 0 && (
          <p className="text-center col-span-full text-gray-400">No penalties found.</p>
        )}
        {penalties.map((penalty) => (
          <div
            key={penalty.penalty_id}
            className="bg-gray-800 rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-shadow"
          >
            <div>
              <h3 className="text-xl font-bold mb-2 truncate" title={penalty.penalty_type}>
                {penalty.penalty_type}
              </h3>
              <p className="mb-1 text-gray-300">
                <span className="font-semibold">Amount:</span> ₹{penalty.penalty_amount.toFixed(2)}
              </p>
              <p className="mb-1 text-gray-300">
                <span className="font-semibold">Date:</span>{" "}
                {new Date(penalty.penalty_date).toLocaleDateString()}
              </p>
              <p className="mb-2 text-gray-300 truncate" title={penalty.description}>
                <span className="font-semibold">Description:</span> {penalty.description || "-"}
              </p>
            </div>
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold uppercase ${
                  penalty.status === "pending"
                    ? "bg-yellow-500 text-black"
                    : penalty.status === "paid"
                    ? "bg-green-600"
                    : penalty.status === "waived"
                    ? "bg-blue-600"
                    : "bg-gray-600"
                }`}
              >
                {penalty.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PenaltyCardGrid;

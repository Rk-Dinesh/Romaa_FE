import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../../../../../components/Title";
import { MdArrowBackIosNew } from "react-icons/md";
import axios from "axios";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";
import GeneralAbstract from "./general abstract/GeneralAbstract";
import BOQProject from "./BOQTender/BOQProject";
import NewInletDet from "./new inlet det/NewInletDet";
import NewInletAbs from "./new inlet abs/NewInletAbs";

const TenderDetailedEstimate = () => {
  const { tender_id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/tender/tenders/viewtender/${tender_id}?tab=3`);
  };
  const [tabs, setTabs] = useState([
    { id: "1", label: "GS(General Abstract)", component: <GeneralAbstract /> },
    { id: "2", label: "Bill of Qty", component: <BOQProject /> },
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch headings from backend
  const fetchHeadings = async () => {
    try {
      const res = await axios.get(`${API}/detailedestimate/extractheadings`, {
        params: { tender_id },
      });

      if (res.data.status && res.data.data.length > 0) {
        const dynamicTabs = res.data.data.flatMap((item, index) => [
          {
            id: `${item.heading}-abs-${index}`,
            label: `${item.heading} Abstract`,
            component: <NewInletAbs name={item.abstractKey} />,
          },
          {
            id: `${item.heading}-det-${index}`,
            label: `${item.heading} Detailed`,
            component: <NewInletDet name={item.detailedKey} />,
          },
        ]);

        setTabs((prev) => [prev[0], prev[1], ...dynamicTabs]);
      }
    } catch (error) {
      console.error("Error fetching headings:", error);
    }
  };

  // ✅ Add new heading
  const handleAddTabs = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a heading name");

    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/detailedestimate/addheading?tender_id=${tender_id}`,
        {
          heading: name.toLowerCase().trim(),
          abstract: [],
          detailed: [],
        }
      );

      if (res.data.status) {
        toast.success("Detailed Estimate added successfully");
        setName("");
        fetchHeadings(); // refresh tab list
      } else {
        toast.error(res.data.message || "Failed to add Detailed Estimate");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding Detailed Estimate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tender_id) fetchHeadings();
  }, [tender_id]);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fixed Header Balance with Top Back Arrow */}
      <div className="shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-darkest-blue dark:text-white border border-gray-200 dark:border-slate-700 shadow-sm"
            title="Go Back"
          >
            <MdArrowBackIosNew size={18} className="translate-x-0.5" />
          </button>
          <Title page_title=" Tender Detailed Estimate" />
        </div>

      {/* Add Heading */}
      <form onSubmit={handleAddTabs} className="flex gap-2   justify-end">
        <input
          type="text"
          placeholder="Enter Name (e.g., Road, New Inlet)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3  text-sm w-60"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm text-white ${
            loading ? "bg-gray-400" : "bg-darkest-blue hover:bg-blue-800"
          }`}
        >
          {loading ? "Adding..." : "Add Tabs"}
        </button>
      </form>

        {/* Fixed Sub-Tabs */}
        <div className="flex gap-2 py-2.5 overflow-x-auto no-scrollbar">
          {tabs.map(({ id, label }) => (
            <p
              key={id}
              className={`first-letter:uppercase px-4 py-2.5 rounded-lg text-sm cursor-pointer whitespace-nowrap shrink-0 transition-all ${
                activeTab === id
                  ? "bg-darkest-blue text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-darkest-blue dark:text-slate-300 hover:opacity-80"
              }`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </p>
          ))}
        </div>
      </div>

      {/* Independently Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1">
        <div className="mt-4">
          {activeTabData?.component || (
            <div className="text-center text-gray-500 mt-4">
              Select a tab to view content
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenderDetailedEstimate;

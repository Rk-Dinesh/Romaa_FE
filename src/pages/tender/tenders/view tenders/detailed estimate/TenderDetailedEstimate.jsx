import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Title from "../../../../../components/Title";
import axios from "axios";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";
import GeneralAbstract from "./general abstract/GeneralAbstract";
import BOQProject from "./BOQTender/BOQProject";
import NewInletDet from "./new inlet det/NewInletDet";
import NewInletAbs from "./new inlet abs/NewInletAbs";

const TenderDetailedEstimate = () => {
  const { tender_id } = useParams();
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
            id: `${item.heading}-det-${index}`,
            label: `${item.heading} Detailed`,
            component: <NewInletDet name={item.detailedKey} />,
          },
          {
            id: `${item.heading}-abs-${index}`,
            label: `${item.heading} Abstract`,
            component: <NewInletAbs name={item.abstractKey} />,
          },
        ]);

        setTabs((prev) => [
          prev[0], // keep GS(General Abstract)
          prev[1], // keep BOQ
          ...dynamicTabs,
        ]);
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
        toast.success("Heading added successfully");
        setName("");
        fetchHeadings(); // refresh tab list
      } else {
        toast.error(res.data.message || "Failed to add heading");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding heading");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tender_id) fetchHeadings();
  }, [tender_id]);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="font-roboto-flex flex flex-col h-full p-4">
      <Title text="Tender Detailed Estimate" />

      {/* Add Heading */}
      <form onSubmit={handleAddTabs} className="flex gap-2 my-3 justify-end">
        <input
          type="text"
          placeholder="Enter Name (e.g., Road, New Inlet)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-60"
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 py-2.5">
        {tabs.map(({ id, label }) => (
          <p
            key={id}
            className={`first-letter:uppercase px-4 py-2.5 rounded-lg text-sm cursor-pointer ${
              activeTab === id
                ? "bg-darkest-blue text-white"
                : "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue"
            }`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </p>
        ))}
      </div>

      {/* Active Component */}
      <div className="h-full overflow-y-auto no-scrollbar mt-2">
        {activeTabData?.component || (
          <div className="text-center text-gray-500 mt-4">
            Select a tab to view content
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderDetailedEstimate;

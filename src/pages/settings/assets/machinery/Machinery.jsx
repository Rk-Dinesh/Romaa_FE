import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, PlusCircle } from "lucide-react";
import { API } from "../../../../constant";
import { toast } from "react-toastify";

const MachineryTable = () => {
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tenders, setTenders] = useState([]);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [assignForm, setAssignForm] = useState({
    projectId: "",
    siteName: "",
    location: "",
    assignedDate: "",
  });

  // Fetch tenders
  const fetchTenders = async () => {
    try {
      const res = await axios.get(`${API}/tender/all`);
      setTenders(res.data.data);
    } catch (err) {
      console.error("Tender fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  // Fetch machinery list
  const fetchMachinery = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/machineryasset/api/allmachinery-assets`
      );
      setMachinery(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinery();
  }, []);

  // Handle submission
  const handleAssignSubmit = async () => {
    const payload = {
      projectId: assignForm.projectId,
      siteDetails: {
        siteName: assignForm.siteName,
        location: assignForm.location,
        assignedDate: assignForm.assignedDate,
      },
    };

    try {
      await axios.put(
        `${API}/machineryasset/api/machinery-assets/${selectedItem.assetId}/assign-project-site`,
        payload
      );

      toast.success("Asset assigned successfully");
      setShowAssignModal(false);
      fetchMachinery();
    } catch (err) {
      console.error("Assign error:", err);
    }
  };

  return (
    <div className="mt-4">
      {/* TABLE */}
      <div className="bg-layout-dark text-gray-200 rounded-md shadow overflow-hidden">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-layout-dark border-b border-gray-700">
              <tr>
                <th className="p-3 ">
                  Asset Name
                </th>
                <th>Type</th>
                <th >
                  Serial No
                </th>
                <th >
                  Fuel Type
                </th>
                <th>
                  Current Site
                </th>
                <th >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="text-center">
              {machinery.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-gray-700 "
                >
                  <td className="p-3">{item.assetName}</td>
                  <td className="p-3">{item.assetType}</td>
                  <td className="p-3">{item.serialNumber}</td>
                  <td className="p-3">{item.fuelType}</td>
                  <td className="p-3">{item?.currentSite?.siteName || "Not Yet Assigned"}</td>

                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-4">
                      {/* Edit Button */}
                      <button className="text-blue-500 hover:text-blue-300">
                        <Pencil size={18} />
                      </button>

                      {/* Assign Button */}
                      <button
                        className="text-green-500 hover:text-green-300"
                        onClick={() => {
                          setSelectedItem(item);
                          setAssignForm({
                            siteName: item?.currentSite?.siteName || "",
                            location: item?.currentSite?.location || "",
                            assignedDate:
                              item?.currentSite?.assignedDate?.substring(
                                0,
                                10
                              ) || "",
                            projectId: item?.projectId || "",
                          });
                          setShowAssignModal(true);
                        }}
                      >
                        <PlusCircle size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

{showAssignModal && (
  <div className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50">
    <div className="bg-layout-dark w-[430px] p-6 rounded-xl shadow-lg">
      <h2 className="text-lg font-bold mb-4 text-center">Assign Asset</h2>

      <div className="space-y-4">
        {/* Tender / Project ID */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Tender / Project *</label>
          <select
            className="w-full p-2 border border-gray-600 rounded"
            value={assignForm.projectId}
            onChange={(e) =>
              setAssignForm({ ...assignForm, projectId: e.target.value })
            }
          >
            <option value="">Select Tender</option>
            {tenders.map((t) => (
              <option key={t._id} value={t.tenderId}>
                {t.tender_id}
              </option>
            ))}
          </select>
        </div>

        {/* Site Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Site Name *</label>
          <input
            type="text"
            placeholder="Enter site name"
            className="w-full p-2 border border-gray-600 rounded"
            value={assignForm.siteName}
            onChange={(e) =>
              setAssignForm({ ...assignForm, siteName: e.target.value })
            }
          />
        </div>

        {/* Location */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Location *</label>
          <input
            type="text"
            placeholder="Enter location"
            className="w-full p-2 border border-gray-600 rounded"
            value={assignForm.location}
            onChange={(e) =>
              setAssignForm({ ...assignForm, location: e.target.value })
            }
          />
        </div>

        {/* Assigned Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Assigned Date *</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-600 rounded"
            value={assignForm.assignedDate}
            onChange={(e) =>
              setAssignForm({ ...assignForm, assignedDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          className="px-4 py-2 rounded bg-white text-darkest-blue"
          onClick={() => setShowAssignModal(false)}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 rounded bg-darkest-blue text-white"
          onClick={handleAssignSubmit}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default MachineryTable;

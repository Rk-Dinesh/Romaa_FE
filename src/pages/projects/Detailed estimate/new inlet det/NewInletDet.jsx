import { toast } from "react-toastify";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TbFileExport } from "react-icons/tb";
import Loader from "../../../../components/Loader";
import Button from "../../../../components/Button";
import { API } from "../../../../constant";
import { useProject } from "../../../../context/ProjectContext";


const BoqProjectsColumns = [
  { label: "Particulars", key: "particulars" },
  { label: "Number", key: "nos" },
  { label: "Length", key: "l" },
  { label: "Breadth", key: "b" },
  { label: "Density", key: "d_h" },
  { label: "Contents", key: "content" },
];

const NewInletDet = ({ name }) => {
  const { tenderId } = useProject();
  const [detailedEstimate, setDetailedEstimate] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedAbstract, setExpandedAbstract] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(false);

  const fetchDetailedEstimate = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/detailedestimate/getdatacustomhead?tender_id=${tenderId}&nametype=${name}`
      );
      setDetailedEstimate(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch tenders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailedEstimate();
  }, [tenderId, name]);

  const toggleExpand = (abstractId) => {
    setExpandedAbstract((prev) => (prev === abstractId ? null : abstractId));
  };

  useEffect(() => {
    let timer;

    if (loading) {
      // Show loader immediately
      setDelayedLoading(true);
    } else {
      // Keep loader visible for minDelay ms before hiding
      timer = setTimeout(() => setDelayedLoading(false), 2000);
    }

    return () => clearTimeout(timer);
  }, [loading, 2000]);

  return (
    <div className="w-full h-full flex flex-col">
      {delayedLoading ? (
        <Loader />
      ) : (
        <>
          {detailedEstimate.length === 0 &&
            <div className="flex justify-end mb-2">
              <Button
                button_icon={<TbFileExport size={22} />}
                button_name="Upload"
                bgColor="dark:bg-layout-dark bg-white"
                textColor="dark:text-white text-darkest-blue"
                onClick={() => setShowUpload(true)}
              />
            </div>
          }

          {/* ✅ ONLY TABLE SCROLLS */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="rounded-lg bg-slate-50 dark:bg-layout-dark">
              {/* HEADER */}
              <div className="grid grid-cols-12 px-6 py-3 text-sm font-semibold border-b">
                <div className="col-span-1">S.no</div>
                <div className="col-span-2">Abstract ID</div>
                <div className="col-span-3">Item Description</div>
                <div className="col-span-2 text-right">Quantity</div>
              </div>

              {/* CONTENT */}
              <div className="divide-y">
                {detailedEstimate.map((item, index) => {
                  const abs = item.abstract_details || {};

                  return (
                    <div key={item.abstract_id}>
                      {/* Abstract Row */}
                      <div className="grid grid-cols-12 px-6 py-3 text-sm">
                        <div className="col-span-1">{index + 1}</div>
                        <div className="col-span-2">{item.abstract_id}</div>
                        <div className="col-span-3">
                          {abs.description || "N/A"}
                        </div>
                        <div className="col-span-2 text-right">
                          {abs.quantity || "N/A"}
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="px-6 pb-4">
                        <div className="overflow-x-auto border rounded">
                          <table className="min-w-full text-xs">
                            <thead className="bg-darkest-blue">
                              <tr>
                                {BoqProjectsColumns.map((col) => (
                                  <th
                                    key={col.key}
                                    className="px-3 py-2 text-left"
                                  >
                                    {col.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(item.breakdown || []).map((detail, idx) => (
                                <tr
                                  key={idx}
                                  className="border-t border-slate-100 hover:bg-slate-50  hover:text-lg hover:font-bold text-black bg-slate-200  "
                                >
                                  {BoqProjectsColumns.map((col) => (
                                    <td key={col.key} className="px-3 py-2">
                                      {detail[col.key] ?? "N/A"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {detailedEstimate.length === 0 && (
                  <div className="py-6 text-center text-sm">
                    No matching results found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}


    </div>
  );
};

export default NewInletDet;

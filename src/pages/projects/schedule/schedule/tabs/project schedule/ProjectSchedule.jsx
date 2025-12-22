import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../../../constant";
import { useProject } from "../../../../ProjectContext";
import UploadScheduleModal from "../../UploadScheduleModal";
import Button from "../../../../../../components/Button";
import { TbFileExport } from "react-icons/tb";

// --- HELPER FUNCTIONS ---
const formatNumber = (num) => {
  if (num === undefined || num === null || num === "") return "-";
  const n = Number(num);
  return Number.isNaN(n) ? "-" : n.toString();
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB");
};

const ProjectSchedule = () => {
  const { tenderId } = useProject();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);


  // --- DATA FETCHING ---
  const fetchWBS = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      // Matches the new API route: router.get("/get-schedule/:tender_id", getSchedule);
      const res = await axios.get(`${API}/schedule/get-schedule/${tenderId}`);
      if (res.data && res.data.data) {
        setItems(res.data.data.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch Schedule items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWBS();
  }, [tenderId]);

  const handleUploadModalOpen = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
  };

  // --- COMMON STYLES ---
  const baseCellClass = "border-r border-b border-gray-300 dark:border-gray-700 px-3 py-2.5 transition-colors whitespace-nowrap";
  const headerClass = `${baseCellClass} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold`;

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading Project Schedule...</div>;
  }


  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-4 justify-end">

        <Button
          button_icon={<TbFileExport size={22} />}
          button_name="Upload"
          bgColor="dark:bg-layout-dark bg-white"
          textColor="dark:text-white text-darkest-blue"
          onClick={handleUploadModalOpen}
        />
      </div>


      <div className="overflow-x-auto border-t border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm max-w-full rounded-sm">
        <table className="border-separate border-spacing-0 text-xs min-w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase">
              <th rowSpan={2} className={`${headerClass} text-center min-w-[80px]`}>
                SI.No
              </th>
              <th rowSpan={2} className={`${headerClass} text-center min-w-[80px]`}>
                WBS ID
              </th>
              <th rowSpan={2} className={`${headerClass} text-left min-w-[220px]`}>
                Description
              </th>
              <th rowSpan={2} className={`${headerClass} text-center min-w-[60px]`}>
                Unit
              </th>

              <th colSpan={3} className={`${baseCellClass} text-center bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 min-w-[240px]`}>
                Quantities
              </th>
              <th colSpan={3} className={`${baseCellClass} text-center bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 min-w-[270px]`}>
                Original Timeline
              </th>
              <th colSpan={3} className={`${baseCellClass} text-center bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 min-w-[240px]`}>
                Revised & Status
              </th>
              <th colSpan={3} className={`${baseCellClass} text-center bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 min-w-[240px]`}>
                Lag
              </th>
            </tr>

            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
              <th className={`${baseCellClass} text-right bg-blue-50/50 dark:bg-blue-900/20`}>Total</th>
              <th className={`${baseCellClass} text-right bg-blue-50/50 dark:bg-blue-900/20`}>Executed</th>
              <th className={`${baseCellClass} text-right bg-blue-50/50 dark:bg-blue-900/20`}>Balance</th>

              <th className={`${baseCellClass} text-center bg-green-50/50 dark:bg-green-900/20`}>Start</th>
              <th className={`${baseCellClass} text-center bg-green-50/50 dark:bg-green-900/20`}>End</th>
              <th className={`${baseCellClass} text-center bg-green-50/50 dark:bg-green-900/20`}>Duration</th>

              <th className={`${baseCellClass} text-center bg-yellow-50/50 dark:bg-yellow-900/20`}>Rev. Start</th>
              <th className={`${baseCellClass} text-center bg-yellow-50/50 dark:bg-yellow-900/20`}>Rev. End</th>
              <th className={`${baseCellClass} text-center bg-yellow-50/50 dark:bg-yellow-900/20`}>Rev. Duration</th>

              <th className={`${baseCellClass} text-center bg-yellow-50/50 dark:bg-yellow-900/20`}>Actual Completion</th>
              <th className={`${baseCellClass} text-center bg-yellow-50/50 dark:bg-yellow-900/20`}>Lag</th>
            </tr>
          </thead>

          <tbody className="text-gray-700 dark:text-gray-300">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <tr key={item.wbs_id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors">
                  <td className={`${baseCellClass} text-center font-medium`}>
                    {idx + 1}
                  </td>
                  <td className={`${baseCellClass} text-center font-medium`}>
                    {item.wbs_id}
                  </td>
                  <td className={`${baseCellClass} truncate max-w-[220px]`} title={item.description}>
                    {item.description}
                  </td>
                  <td className={`${baseCellClass} text-center`}>
                    {item.unit}
                  </td>

                  <td className={`${baseCellClass} text-right bg-blue-50/20 dark:bg-blue-900/10`}>
                    {formatNumber(item.quantity)}
                  </td>
                  <td className={`${baseCellClass} text-right bg-blue-50/20 dark:bg-blue-900/10`}>
                    {formatNumber(item.executed_quantity)}
                  </td>
                  <td className={`${baseCellClass} text-right bg-blue-50/20 dark:bg-blue-900/10 font-semibold`}>
                    {formatNumber(item.balance_quantity)}
                  </td>



                  <td className={`${baseCellClass} text-center bg-green-50/20 dark:bg-green-900/10`}>
                    {formatDate(item.start_date)}
                  </td>
                  <td className={`${baseCellClass} text-center bg-green-50/20 dark:bg-green-900/10`}>
                    {formatDate(item.end_date)}
                  </td>
                  <td className={`${baseCellClass} text-center bg-green-50/20 dark:bg-green-900/10`}>
                    {item.duration}
                  </td>

                  <td className={`${baseCellClass} text-center bg-yellow-50/20 dark:bg-yellow-900/10 text-orange-600 dark:text-orange-400`}>
                    {formatDate(item.revised_start_date)}
                  </td>
                  <td className={`${baseCellClass} text-center bg-yellow-50/20 dark:bg-yellow-900/10 text-orange-600 dark:text-orange-400`}>
                    {formatDate(item.revised_end_date)}
                  </td>
                  <td className={`${baseCellClass} text-center bg-yellow-50/20 dark:bg-yellow-900/10`}>
                    {item.revised_duration}
                  </td>
                  <td className={`${baseCellClass} text-center bg-yellow-50/20 dark:bg-yellow-900/10 font-bold ${Number(item.lag) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {item.lag}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="text-center py-8 text-gray-500 dark:text-gray-400 border-b border-gray-300 dark:border-gray-700">
                  No schedule items found. Upload a schedule to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isUploadModalOpen && (
        <UploadScheduleModal
          onClose={handleUploadModalClose}
          onSuccess={fetchWBS} />
      )}
    </div>
  );
};

export default ProjectSchedule;
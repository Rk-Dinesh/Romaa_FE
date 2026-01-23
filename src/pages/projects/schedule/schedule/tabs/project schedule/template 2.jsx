import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ChevronRight, ChevronDown,
  FolderOpen, Upload
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { TbFileExport } from "react-icons/tb";
import { API } from "../../../../../../constant";
import Button from "../../../../../../components/Button";
import UploadScheduleModal from "../../UploadScheduleModal";
import { useProject } from "../../../../../../context/ProjectContext";


// --- Helper: Date Formatter ---
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

// --- Helper: Flatten Structure & Map All Fields ---
const flattenStructure = (groups) => {
  const rows = [];
  groups.forEach((group, gIndex) => {
    // Level 1: Group
    rows.push({
      id: `G-${gIndex}`,
      type: "group",
      name: group.group_name,
      wbs_code: String.fromCharCode(65 + gIndex),
      level: 0,
      row_index: group.row_index,
      expanded: true,
      data: {
        unit: "", // Groups usually don't have these in your sample, but keeping structure
        quantity: "",
        executed_quantity: "",
        balance_quantity: "",
        start_date: "",
        end_date: "",
        duration: "",
        status: "",
        predecessor: ""
      }
    });

    if (group.items) {
      group.items.forEach((item, iIndex) => {
        // Level 2: Item
        rows.push({
          id: `I-${gIndex}-${iIndex}`,
          parentId: `G-${gIndex}`,
          type: "item",
          name: item.item_name,
          wbs_code: `${String.fromCharCode(65 + gIndex)}.${iIndex + 1}`,
          level: 1,
          row_index: item.row_index,
          expanded: true,
          data: {
            unit: item.unit,
            quantity: item.quantity,
            executed_quantity: item.executed_quantity || 0,
            balance_quantity: item.balance_quantity || item.quantity,
            start_date: item.start_date,
            end_date: item.end_date,
            duration: item.duration,
            status: item.status,
            predecessor: item.predecessor
          }
        });

        if (item.tasks) {
          item.tasks.forEach((task, tIndex) => {
            // Level 3: Task Container
            const taskId = `T-${gIndex}-${iIndex}-${tIndex}`;
            rows.push({
              id: taskId,
              parentId: `I-${gIndex}-${iIndex}`,
              type: "task",
              name: task.task_name,
              wbs_code: `${String.fromCharCode(65 + gIndex)}.${iIndex + 1}.${tIndex + 1}`,
              level: 2,
              row_index: task.row_index,
              expanded: true,
              data: {
                unit: task.unit,
                quantity: task.quantity,
                executed_quantity: task.executed_quantity || 0,
                balance_quantity: task.balance_quantity || task.quantity,
                start_date: task.start_date,
                end_date: task.end_date,
                duration: task.duration,
                status: task.status,
                predecessor: task.predecessor
              }
            });

            const leaves = task.active_tasks || task.task_wbs_ids || [];
            leaves.forEach((leaf) => {
              if (typeof leaf === 'object' && leaf !== null) {
                // Level 4: Leaf / WBS ID
                rows.push({
                  id: leaf.wbs_id, // Unique ID from DB
                  parentId: taskId,
                  type: "leaf",
                  name: leaf.description,
                  wbs_code: leaf.wbs_id, // Shows WBS ID (e.g. WBSB943)
                  level: 3,
                  row_index: leaf.row_index,
                  data: {
                    unit: leaf.unit,
                    quantity: leaf.quantity,
                    executed_quantity: leaf.executed_quantity,
                    balance_quantity: leaf.balance_quantity,
                    start_date: leaf.start_date,
                    end_date: leaf.end_date,
                    duration: leaf.duration,
                    status: leaf.status || "pending",
                    predecessor: leaf.predecessor
                  }
                });
              }
            });
          });
        }
      });
    }
  });
  return rows;
};

const ProjectSchedule = () => {
  const { tenderId } = useProject();
  const [flatRows, setFlatRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [showUpload, setShowUpload] = useState(false);

  // --- Grid Configuration ---
  // We use a custom grid template because 12 columns isn't enough for this data
  const gridTemplate = "50px minmax(300px, 1fr) 60px 80px 80px 80px 90px 90px 60px 80px 80px 100px";
  // Col Definition: [No] [Structure] [Unit] [Qty] [Exec] [Bal] [Start] [End] [Dur] [Pred] [Status] [WBS Code]

  const fetchWBS = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/schedulelite/get-all-schedule/${tenderId}`);
      if (res.data?.data?.structure) {
        const flattened = flattenStructure(res.data.data.structure);
        setFlatRows(flattened);
        const initialExpanded = new Set();
        flattened.forEach(row => { if (row.type !== 'leaf') initialExpanded.add(row.id); });
        setExpandedIds(initialExpanded);
      }
    } catch (err) {
      toast.error("Failed to fetch WBS items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWBS(); }, [tenderId]);

  const toggleRow = (rowId) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(rowId) ? next.delete(rowId) : next.add(rowId);
      return next;
    });
  };

  const visibleRows = useMemo(() => {
    const visible = [];
    for (const row of flatRows) {
      if (!row.parentId) {
        visible.push(row);
      } else {
        let current = row;
        let isVisible = true;
        while (current.parentId) {
          if (!expandedIds.has(current.parentId)) {
            isVisible = false;
            break;
          }
          current = flatRows.find(r => r.id === current.parentId);
        }
        if (isVisible) visible.push(row);
      }
    }
    return visible;
  }, [flatRows, expandedIds]);

  const handleClose = () => setShowUpload(false);

  return (
    <div className="flex flex-col h-full dark:bg-gray-900 font-roboto-flex text-sm">

      {/* --- Toolbar --- */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 ">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">Work Breakdown Structure</h1>
          <p className="text-sm py-1.5 text-gray-600">Tender {tenderId}</p>
        </div>
        <Button
          button_icon={<TbFileExport size={22} />}
          button_name="Upload"
          bgColor="dark:bg-layout-dark bg-white"
          textColor="dark:text-white text-darkest-blue"
          onClick={() => setShowUpload(true)}
        />
      </div>

      {/* --- Data Grid Container --- */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-white dark:bg-gray-900">
        
        {/* Scrollable Area for Wide Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-[1200px]"> {/* Ensures table doesn't crush on small screens */}
            
            {/* --- Header --- */}
            <div 
              className="grid gap-0 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 sticky top-0 z-20 py-2"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">No.</div>
              <div className="px-4 border-r border-gray-200 dark:border-gray-700">WBS Structure</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">Unit</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-right">Total</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-right text-green-600">Exec</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-right text-red-500">Bal</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">Start</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">End</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">Duration</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">Revised Start</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">Revised End</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">Revised Duration</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">Predecessor</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">Status</div>
              <div className="px-2 border-r border-gray-200 dark:border-gray-700 text-center">WBS Code</div>
            </div>

            {/* --- Rows --- */}
            <div className="pb-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Loader2 className="animate-spin mb-2" /> Loading Data...
                </div>
              ) : (
                visibleRows.map((row) => {
                  const isLeaf = row.type === 'leaf';
                  const isExpanded = expandedIds.has(row.id);
                  const indentSize = 24;
                  const paddingLeft = row.level * indentSize + 12;

                  // Row Styling
                  const bgClass = isLeaf ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/30";
                  const textClass = row.level === 0 ? "font-bold text-gray-800" : row.level === 1 ? "font-semibold text-red-700" : row.level === 2 ? "font-semibold text-slate-700" : "text-blue-600";
                  const borderClass = "border-b border-gray-100 dark:border-gray-800";

                  return (
                    <div 
                      key={row.id} 
                      className={`grid gap-0 group hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${bgClass} ${borderClass} min-h-[36px] items-center text-xs text-gray-600 dark:text-gray-400`}
                      style={{ gridTemplateColumns: gridTemplate }}
                    >
                      
                      {/* 1. Row Index */}
                      <div className="px-2 h-full flex items-center justify-center border-r border-gray-100 dark:border-gray-800 font-mono text-gray-400">
                        {row.row_index || "-"}
                      </div>

                      {/* 2. Structure Tree */}
                      <div className="h-full flex items-center relative border-r border-gray-100 dark:border-gray-800 overflow-hidden">
                        {row.level > 0 && Array.from({ length: row.level }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute h-full border-r border-gray-200 dark:border-gray-700"
                            style={{ left: `${i * indentSize + 23}px` }}
                          />
                        ))}

                        <div className="flex items-center w-full pr-2" style={{ paddingLeft: `${paddingLeft}px` }}>
                          {!isLeaf ? (
                            <button
                              onClick={() => toggleRow(row.id)}
                              className="z-10 mr-1.5 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                            >
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          ) : (
                            <span className="w-5 mr-1.5 inline-block"></span>
                          )}

                          <div className="flex items-center gap-2 truncate">
                            {!isLeaf && row.level === 0 && <FolderOpen size={14} className="text-blue-500" />}
                            <span className={`truncate ${textClass} dark:text-gray-200`} title={row.name}>
                              {row.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Unit */}
                      <div className="px-2 h-full flex items-center justify-center border-r border-gray-100 dark:border-gray-800">
                        {row.data.unit}
                      </div>

                      {/* 4. Total Quantity */}
                      <div className="px-2 h-full flex items-center justify-end border-r border-gray-100 dark:border-gray-800 font-mono text-gray-700 dark:text-gray-300">
                        {row.data.quantity}
                      </div>

                      {/* 5. Executed Quantity */}
                      <div className="px-2 h-full flex items-center justify-end border-r border-gray-100 dark:border-gray-800 font-mono text-green-600">
                         {row.data.executed_quantity ? row.data.executed_quantity : "-"}
                      </div>

                      {/* 6. Balance Quantity */}
                      <div className="px-2 h-full flex items-center justify-end border-r border-gray-100 dark:border-gray-800 font-mono text-red-500">
                        {row.data.balance_quantity}
                      </div>

                      {/* 7. Start Date */}
                      <div className="px-2 h-full flex items-center justify-center border-r border-gray-100 dark:border-gray-800 text-[11px]">
                        {formatDate(row.data.start_date)}
                      </div>

                      {/* 8. End Date */}
                      <div className="px-2 h-full flex items-center justify-center border-r border-gray-100 dark:border-gray-800 text-[11px]">
                        {formatDate(row.data.end_date)}
                      </div>

                      {/* 9. Duration */}
                      <div className="px-2 h-full flex items-center justify-center border-r border-gray-100 dark:border-gray-800">
                        {row.data.duration ? `${row.data.duration}d` : "-"}
                      </div>

                      {/* 10. Revised Start Date */}
                      <div className="px-2 h-full flex items-center justify-center border-r border-gray-100 dark:border-gray-800 text-[11px]">
                        {formatDate(row.data.revised_start_date)}
                      </div>

                      {/* 11. Revised End Date */}
                      <div className="px-2 h-full flex items-center justify-center border-r border-gray-100 dark:border-gray-800 text-[11px]">
                        {formatDate(row.data.revised_end_date)}
                      </div>

                      {/* 12. Revised Duration */}
                      <div className="px-2 h-full flex items-center justify-center border-r border-gray-100 dark:border-gray-800">
                        {row.data.revised_duration ? `${row.data.revised_duration}d` : "-"}
                      </div>

                      {/* 13. Predecessor */}
                      <div className="px-2 h-full flex items-center justify-center border-r border-gray-100 dark:border-gray-800 text-[11px]">
                        {row.data.predecessor || "-"}
                      </div>

                      {/* 11. Status */}
                      <div className="px-2 h-full flex items-center justify-center border-r border-gray-100 dark:border-gray-800">
                         <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                           row.data.status === 'completed' ? 'bg-green-100 text-green-700' :
                           row.data.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                           'bg-gray-100 text-gray-500'
                         }`}>
                           {row.data.status || "-"}
                         </span>
                      </div>

                      {/* 12. WBS Code */}
                      <div className="px-2 h-full flex items-center justify-center font-mono text-[10px] text-gray-500">
                        {isLeaf && (
                          <span className="bg-gray-100 dark:bg-gray-800 px-1.5 rounded">
                            {row.wbs_code}
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {showUpload && <UploadScheduleModal onClose={handleClose} onSuccess={() => { fetchWBS(); setShowUpload(false); }} />}
    </div>
  );
};

export default ProjectSchedule;
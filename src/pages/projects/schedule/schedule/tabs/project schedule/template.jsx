import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format, isValid, parseISO } from "date-fns";
import { 
  ChevronRight, ChevronDown, 
  Layers, Folder, ClipboardList, Activity, 
  Link as LinkIcon 
} from "lucide-react";
import { TbFileExport } from "react-icons/tb";

import { API } from "../../../../../../constant";
import Button from "../../../../../../components/Button";
import UploadScheduleModal from "../../UploadScheduleModal";
import { useProject } from "../../../../../../context/ProjectContext";

// --- 1. Helper Functions ---
const formatNumber = (num) => {
  if (num === undefined || num === null || num === "") return "";
  const n = Number(num);
  return Number.isNaN(n) ? "-" : n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = parseISO(dateStr);
  return isValid(date) ? format(date, "dd MMM yyyy") : "";
};

const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  if (s === 'completed') return 'bg-green-100 text-green-700 border-green-200';
  if (s === 'working') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s === 'delayed') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
};

// --- 2. Data Flattening Logic ---
const flattenStructure = (groups) => {
  const rows = [];
  const processNode = (node, level, type, parentId = null) => {
    const uniqueKey = node._id || `${level}-${node.row_index}-${Math.random()}`;
    let name = "Untitled";
    if (type === "group") name = node.group_name;
    else if (type === "item") name = node.item_name;
    else if (type === "task") name = node.task_name;
    else if (type === "leaf") name = node.description;

    const row = {
      id: uniqueKey,
      parentId: parentId,
      uniqueKey: uniqueKey,
      type: type,
      level: level,
      expanded: true,
      row_index: node.row_index,
      wbs_code: node.wbs_id, 
      name: name,
      unit: node.unit,
      quantity: node.quantity,
      executed_quantity: node.executed_quantity || 0,
      balance_quantity: node.balance_quantity || node.quantity,
      start: node.start_date,
      end: node.end_date,
      duration: node.duration,
      rev_start: node.revised_start_date,
      rev_end: node.revised_end_date,
      rev_duration: node.revised_duration,
      lag: node.lag,
      predecessor: node.predecessor,
      status: node.status || "pending"
    };
    rows.push(row);

    if (node.items && Array.isArray(node.items)) node.items.forEach(child => processNode(child, 1, "item", uniqueKey));
    if (node.tasks && Array.isArray(node.tasks)) node.tasks.forEach(child => processNode(child, 2, "task", uniqueKey));
    if (node.task_wbs_ids && Array.isArray(node.task_wbs_ids)) node.task_wbs_ids.forEach(child => processNode(child, 3, "leaf", uniqueKey));
  };

  if (Array.isArray(groups)) groups.forEach(group => processNode(group, 0, "group"));
  return rows;
};

// --- 3. Main Component ---
const ProjectSchedule = () => {
  const { tenderId } = useProject();
  const [flatRows, setFlatRows] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchWBS = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/schedulelite/get-all-schedule/${tenderId}`);
      if (res.data?.data?.structure) {
        const flattened = flattenStructure(res.data.data.structure);
        setFlatRows(flattened);
        setExpandedIds(new Set(flattened.map(r => r.uniqueKey)));
      } else {
        setFlatRows([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWBS(); }, [tenderId]);

  const toggleRow = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const visibleRows = useMemo(() => {
    const rowMap = new Map(flatRows.map(r => [r.id, r]));
    return flatRows.filter(row => {
      if (!row.parentId) return true;
      let curr = row;
      while (curr.parentId) {
        if (!expandedIds.has(curr.parentId)) return false;
        curr = rowMap.get(curr.parentId);
        if (!curr) return true;
      }
      return true;
    });
  }, [flatRows, expandedIds]);

  const getIcon = (type) => {
    switch(type) {
      case 'group': return <Layers size={14} className="text-indigo-600" />;
      case 'item': return <Folder size={14} className="text-blue-500" />;
      case 'task': return <ClipboardList size={14} className="text-teal-500" />;
      default: return <Activity size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full font-roboto-flex text-sm">
      {/* Top Bar */}
      <div className="flex flex-row gap-4 justify-end mb-3">
        <Button
          button_icon={<TbFileExport size={20} />}
          button_name="Upload Schedule"
          bgColor="dark:bg-layout-dark bg-white"
          textColor="dark:text-white text-darkest-blue"
          onClick={() => setIsUploadModalOpen(true)}
        />
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm rounded-sm custom-scrollbar relative">
        <table className="border-separate border-spacing-0 w-full min-w-[1400px]">
          
          {/* --- Sticky Header --- */}
          <thead className="bg-gray-100 dark:bg-gray-800 shadow-sm sticky top-0 z-40">
            {/* Top Header Row */}
            <tr className="uppercase text-[11px] tracking-wider font-bold text-gray-600 dark:text-gray-300">
              
              {/* STICKY COLUMN HEADERS (Z-50) */}
              <th rowSpan={2} className="border-r border-b border-gray-300 dark:border-gray-700 p-2 text-center bg-gray-100 dark:bg-gray-800 sticky left-0 top-0 z-50 min-w-[50px]">
                No.
              </th>
              <th rowSpan={2} className="border-r border-b border-gray-300 dark:border-gray-700 p-2 text-left bg-gray-100 dark:bg-gray-800 sticky left-[50px] top-0 z-50 min-w-[300px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Activity Description
              </th>
              <th rowSpan={2} className="border-r border-b border-gray-300 dark:border-gray-700 p-2 text-center bg-gray-100 dark:bg-gray-800 min-w-[60px] sticky left-[350px] top-0 z-50">
                Unit
              </th>
              <th rowSpan={2} className="border-r border-b border-gray-300 dark:border-gray-700 p-2 text-center bg-gray-100 dark:bg-gray-800 min-w-[60px] sticky left-[410px] top-0 z-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Quantity
              </th>

              {/* NORMAL HEADERS (Z-40 via thead) */}
              <th colSpan={2} className="border-b border-r border-gray-300 dark:border-gray-700 p-1 text-center bg-blue-50 dark:bg-blue-900/20 text-blue-700">
                Quantities
              </th>
              <th colSpan={3} className="border-b border-r border-gray-300 dark:border-gray-700 p-1 text-center bg-green-50 dark:bg-green-900/20 text-green-700">
                Original Schedule
              </th>
              <th colSpan={3} className="border-b border-r border-gray-300 dark:border-gray-700 p-1 text-center bg-orange-50 dark:bg-orange-900/20 text-orange-700">
                Revised Schedule
              </th>
              <th colSpan={3} className="border-b border-gray-300 dark:border-gray-700 p-1 text-center bg-gray-200 dark:bg-gray-700">
                Status & Tracking
              </th>
            </tr>

            {/* Sub Header Row */}
            <tr className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
              {/* Quantities */}
              <th className="border-b border-r border-gray-300 dark:border-gray-700 px-2 py-1 text-right bg-blue-50/50 dark:bg-blue-900/10">Exec</th>
              <th className="border-b border-r border-gray-300 dark:border-gray-700 px-2 py-1 text-right bg-blue-50/50 dark:bg-blue-900/10">Bal</th>

              {/* Original */}
              <th className="border-b border-r border-gray-300 dark:border-gray-700 px-2 py-1 text-center bg-green-50/50 dark:bg-green-900/10">Start</th>
              <th className="border-b border-r border-gray-300 dark:border-gray-700 px-2 py-1 text-center bg-green-50/50 dark:bg-green-900/10">End</th>
              <th className="border-b border-r border-gray-300 dark:border-gray-700 px-2 py-1 text-center bg-green-50/50 dark:bg-green-900/10">Days</th>

              {/* Revised */}
              <th className="border-b border-r border-gray-300 dark:border-gray-700 px-2 py-1 text-center bg-orange-50/50 dark:bg-orange-900/10 text-orange-700">Start</th>
              <th className="border-b border-r border-gray-300 dark:border-gray-700 px-2 py-1 text-center bg-orange-50/50 dark:bg-orange-900/10 text-orange-700">End</th>
              <th className="border-b border-r border-gray-300 dark:border-gray-700 px-2 py-1 text-center bg-orange-50/50 dark:bg-orange-900/10 text-orange-700">Days</th>

              {/* Status */}
              <th className="border-b border-r border-gray-300 dark:border-gray-700 px-2 py-1 text-center bg-gray-50 dark:bg-gray-800">Pred</th>
              <th className="border-b border-r border-gray-300 dark:border-gray-700 px-2 py-1 text-center bg-gray-50 dark:bg-gray-800">Lag</th>
              <th className="border-b border-gray-300 dark:border-gray-700 px-2 py-1 text-center bg-gray-50 dark:bg-gray-800">Status</th>
            </tr>
          </thead>

          {/* --- Table Body --- */}
          <tbody className="text-gray-700 dark:text-gray-300">
            {loading ? (
              <tr><td colSpan={15} className="p-10 text-center text-gray-400">Loading Data...</td></tr>
            ) : visibleRows.length > 0 ? (
              visibleRows.map((row) => {
                const isLeaf = row.type === 'leaf';
                const hasChildren = row.type !== 'leaf';
                
                // Row Background logic
                let bgRow = "bg-white dark:bg-gray-900";
                if(row.type === 'group') bgRow = "bg-gray-100 dark:bg-gray-800";
                else if(row.type === 'item') bgRow = "bg-gray-50 dark:bg-gray-900/60";

                // Sticky Cell Background Logic (Must match row, but explicitly set)
                let stickyBg = "bg-white dark:bg-gray-900";
                if(row.type === 'group') stickyBg = "bg-gray-100 dark:bg-gray-800";
                else if(row.type === 'item') stickyBg = "bg-gray-50 dark:bg-gray-900";

                let textDesc = "text-gray-600 dark:text-gray-300";
                if(row.type === 'group') textDesc = "font-bold text-gray-900 dark:text-white";
                else if(row.type === 'item') textDesc = "font-semibold text-gray-800 dark:text-gray-200";

                const indentPx = row.level * 20 + 8;

                return (
                  <tr key={row.uniqueKey} className={`${bgRow} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group`}>
                    
                    {/* 1. Index (Sticky Z-30) */}
                    <td className={`border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-xs text-gray-400 font-mono sticky left-0 z-30 ${stickyBg} group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20`}>
                      {row.row_index}
                    </td>

                    {/* 2. Description Tree (Sticky Z-30) */}
                    <td className={`border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-left sticky left-[50px] z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${stickyBg} group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20`}>
                      <div className="flex items-center" style={{ paddingLeft: `${indentPx}px` }}>
                        {hasChildren ? (
                          <button onClick={() => toggleRow(row.uniqueKey)} className="mr-1.5 text-gray-400 hover:text-blue-600">
                            {expandedIds.has(row.uniqueKey) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                          </button>
                        ) : <span className="w-[14px] mr-1.5"/>}
                        
                        <span className="mr-2 opacity-75">{getIcon(row.type)}</span>
                        
                        <div className="flex flex-col truncate">
                          <span className={`truncate ${textDesc} text-xs`} title={row.name}>{row.name}</span>
                          {isLeaf && row.wbs_code && (
                            <span className="text-[10px] text-gray-400 font-mono leading-none pt-0.5">{row.wbs_code}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 3. Unit (Sticky Z-30) */}
                    <td className={`border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-xs text-gray-500 sticky left-[350px] z-30 ${stickyBg} group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20`}>
                      {row.unit}
                    </td>

                    {/* 4. Quantity (Sticky Z-30) */}
                    <td className={`border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-xs text-gray-500 sticky left-[410px] z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${stickyBg} group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20`}>
                      {formatNumber(row.quantity)}
                    </td>

                    {/* Quantities */}
                    <td className="border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-right text-xs font-mono text-blue-700 bg-blue-50/20">{formatNumber(row.executed_quantity)}</td>
                    <td className="border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-right text-xs font-mono font-semibold text-blue-800 bg-blue-50/20">{formatNumber(row.balance_quantity)}</td>

                    {/* Original */}
                    <td className="border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-xs text-gray-500 bg-green-50/10 whitespace-nowrap">{formatDate(row.start)}</td>
                    <td className="border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-xs text-gray-500 bg-green-50/10 whitespace-nowrap">{formatDate(row.end)}</td>
                    <td className="border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-xs text-gray-500 bg-green-50/10">{row.duration ? row.duration : ""}</td>

                    {/* Revised */}
                    <td className="border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-xs text-orange-600 bg-orange-50/10 whitespace-nowrap font-medium">{formatDate(row.rev_start)}</td>
                    <td className="border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-xs text-orange-600 bg-orange-50/10 whitespace-nowrap font-medium">{formatDate(row.rev_end)}</td>
                    <td className="border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-xs text-orange-600 bg-orange-50/10 font-bold">{row.rev_duration ? row.rev_duration : ""}</td>

                    {/* Tracking */}
                    <td className="border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-[10px]">
                      {row.predecessor ? (
                        <div className="flex items-center justify-center gap-1 text-gray-500 bg-gray-100 px-1 py-0.5 rounded border border-gray-200">
                          <LinkIcon size={8} /> {row.predecessor}
                        </div>
                      ) : ""}
                    </td>
                    <td className={`border-r border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center text-xs font-bold ${row.lag > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {row.lag !== undefined && row.lag !== 0 ? `${row.lag > 0 ? '+' : ''}${row.lag}` : "0"}
                    </td>
                    <td className="border-b border-gray-100 dark:border-gray-800 px-2 py-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={15} className="py-12 text-center text-gray-400">
                  No Data Found. Use the Upload button to import a schedule.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isUploadModalOpen && (
        <UploadScheduleModal 
          onclose={() => setIsUploadModalOpen(false)} 
          onSuccess={() => { fetchWBS(); setIsUploadModalOpen(false); }} 
        />
      )}
    </div>
  );
};

export default ProjectSchedule;
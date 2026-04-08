import React, { useEffect, useState, useMemo } from "react";
import Title from "./Title";
import Button from "./Button";
import { HiArrowsUpDown } from "react-icons/hi2";
import { Pencil } from "lucide-react";
import { RiDeleteBinLine, RiLayoutGridFill, RiTableLine } from "react-icons/ri";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import Pagination from "./Pagination";
import { useSearch } from "../context/SearchBar";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import Loader from "./Loader";

const truncateText = (text, wordLimit = 7) => {
  if (!text) return { displayText: "", isTruncated: false };
  const rawText = String(text);
  const words = rawText.trim().split(/\s+/);
  if (words.length <= wordLimit) return { displayText: rawText, isTruncated: false };
  return { displayText: `${words.slice(0, wordLimit).join(" ")}...`, isTruncated: true };
};

const Table = ({
  endpoint = [],
  columns = [],
  AddModal,
  routepoint,
  editroutepoint,
  Datecontent,
  addroutepoint,
  addButtonLabel,
  addButtonIcon,
  EditModal,
  ViewModal,
  DeleteModal,
  deletetitle,
  FilterModal,
  exportModal = true,
  UploadModal,
  title,
  subtitle,
  pagetitle,
  onExport,
  loading = false,
  contentMarginTop = "mt-4",
  totalPages = 1,
  currentPage = 1,
  setCurrentPage = () => {},
  filterParams,
  setFilterParams = () => {},
  onUpdated,
  onSuccess,
  onDelete,
  idKey,
  id2Key,
  name = "no data",
  onRowClick,
  pagination = true,
  freeze,
  freezeButtonLabel,
  freezeButtonIcon,
  onfreeze,
}) => {
  const navigate = useNavigate();
  const { searchTerm } = useSearch();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  const [viewMode, setViewMode] = useState("table");
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [delayedLoading, setDelayedLoading] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });

  const showTooltip = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ visible: true, text, x: rect.left + rect.width / 2, y: rect.top });
  };
  const hideTooltip = () => setTooltip((prev) => ({ ...prev, visible: false }));

  useEffect(() => {
    let timer;
    if (loading) setDelayedLoading(true);
    else timer = setTimeout(() => setDelayedLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterParams, setCurrentPage]);

  const handleViewAction = (item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (onRowClick) onRowClick(item);
    
    if (routepoint && typeof routepoint === "string") {
      if (idKey) localStorage.setItem(`selected${idKey}`, JSON.stringify(item));

      let targetPath = routepoint;
      if (idKey && id2Key) {
          targetPath = `${routepoint}/${item[idKey]}/${item[id2Key]}`;
      } else if (idKey && routepoint.includes(`:${idKey}`)) {
          targetPath = routepoint.replace(`:${idKey}`, item[idKey]);
      } else if (idKey) {
          targetPath = `${routepoint}/${item[idKey]}`;
      }
      navigate(targetPath, { state: { item } });
    }

    if (ViewModal === true) {
      setShowView(false);
    } else if (ViewModal) {
      setSelectedItem(item);
      setShowView(true);
    }
  };

  const handleFilter = ({ fromdate, todate }) => {
    setFilterParams({ fromdate, todate });
    setShowFilter(false);
    setCurrentPage(1);
  };

  const sortedItems = useMemo(() => {
    let sortableItems = [...endpoint];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [endpoint, sortConfig]);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const hasActionColumn = EditModal || editroutepoint || DeleteModal;

  return (
    <div className="font-roboto-flex flex flex-col h-full w-full overflow-hidden bg-transparent">
      
      {/* --- Toolbar Section --- */}
      <div className="py-3 px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 bg-transparent ">
        <div className="flex-1"><Title title={title} sub_title={subtitle} page_title={pagetitle} /></div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white dark:bg-gray-800 p-0.5 rounded-md border border-gray-300 dark:border-gray-700 shadow-sm mr-2">
            <button onClick={() => setViewMode('table')} className={`p-1.5 px-3 rounded flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-darkest-blue text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><RiTableLine size={16} /> Table</button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 px-3 rounded flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-darkest-blue text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><RiLayoutGridFill size={16} /> Grid</button>
          </div>

          {Datecontent && (
            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Date: <span className="font-bold text-gray-900 dark:text-white pl-1">17.05.2025</span></p>
            </div>
          )}

          {AddModal && (
            <Button 
              button_name={addButtonLabel} 
              button_icon={addButtonIcon} 
              onClick={() => { 
                if (addroutepoint) navigate(addroutepoint); 
                setShowAdd(AddModal !== true); 
              }} 
            />
          )}

          {freeze && (
            <Button
              button_name={freezeButtonLabel}
              button_icon={freezeButtonIcon}
              bgColor="bg-white border border-gray-200"
              textColor="text-gray-700"
              onClick={onfreeze}
            />
          )}

          {UploadModal && <Button button_icon={<TbFileExport size={18} />} button_name="Upload" bgColor="bg-white border border-gray-200" textColor="text-gray-700" onClick={() => setShowUpload(true)} />}
          {exportModal && <Button button_icon={<TbFileExport size={18} />} button_name="Export" bgColor="bg-white border border-gray-200" textColor="text-gray-700" onClick={onExport} />}
          {FilterModal && <Button button_icon={<BiFilterAlt size={18} />} button_name="Filter" bgColor="bg-white border border-gray-200" textColor="text-gray-700" onClick={() => setShowFilter(true)} />}
          
          {FilterModal && (filterParams?.fromdate || filterParams?.todate) && (
            <Button button_icon={<IoClose size={16} />} button_name="Clear" bgColor="bg-red-50 border-red-100" textColor="text-red-600" onClick={() => { setFilterParams({ fromdate: "", todate: "" }); setCurrentPage(1); }} />
          )}
        </div>
      </div>

      <div className={`flex-1 overflow-hidden relative ${contentMarginTop} px-4 pb-4 flex flex-col`}>
        {viewMode === 'table' ? (
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto scrollbar-thin">
              <table className="min-w-full border-collapse text-left">
                <thead className="bg-darkest-blue whitespace-nowrap sticky top-0">
                  <tr className="divide-x divide-white/10">
                    <th className="px-5 py-4 text-[11px] font-bold text-white uppercase tracking-widest w-16 text-center">S.No</th>
                    {columns.map((col) => (
                      <th 
                        key={col.key} 
                        className="px-5 py-4 text-[11px] font-bold text-white uppercase tracking-widest cursor-pointer group transition-colors hover:bg-black/10 text-center"
                        onClick={() => {
                          let direction = "asc";
                          if (sortConfig.key === col.key && sortConfig.direction === "asc") direction = "desc";
                          setSortConfig({ key: col.key, direction });
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {col.label}
                          <HiArrowsUpDown size={14} className={`${sortConfig.key === col.key ? "text-white" : "text-white/40"} group-hover:text-white`} />
                        </div>
                      </th>
                    ))}
                    {hasActionColumn && <th className="px-5 py-4 text-center text-[11px] font-bold text-white uppercase tracking-widest w-24 sticky right-0 bg-darkest-blue shadow-[-4px_0_12px_rgba(0,0,0,0.15)]">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {delayedLoading ? (
                    <tr><td colSpan={columns.length + 2} className="py-24 text-center"><Loader /></td></tr>
                  ) : sortedItems.length > 0 ? (
                    sortedItems.map((item, index) => (
                      <tr key={index} className="group/row transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/40 relative">
                        <td className="px-5 py-4 text-sm font-semibold text-gray-400 group-hover/row:text-darkest-blue transition-colors text-center">{String(startIndex + index + 1).padStart(2, '0')}</td>
                        {columns.map((col) => {
                          const cellValue = col.render ? col.render(item) : item[col.key];
                          let displayValue;

                          if (React.isValidElement(cellValue)) {
                            displayValue = cellValue;
                          } else {
                            const isEmpty = cellValue === null || cellValue === undefined || cellValue === "" || (typeof cellValue === "string" && cellValue.trim().toLowerCase() === "undefined");
                            displayValue = isEmpty ? "-" : (col.formatter ? col.formatter(cellValue) : truncateText(String(cellValue), 7).displayText);
                          }

                          const alignClass = col.className || "text-center";
                          const isNameOrId = String(col.key).toLowerCase().includes("name") || String(col.key).toLowerCase().includes("id");

                          const isLong = !React.isValidElement(cellValue) && String(cellValue).length > 40;
                          return (
                            <td
                              key={col.key}
                              className={`px-4 py-3.5 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 ${alignClass}`}
                              onMouseEnter={isLong ? (e) => showTooltip(e, String(cellValue)) : undefined}
                              onMouseLeave={isLong ? hideTooltip : undefined}
                            >
                              {isNameOrId && (ViewModal || routepoint) ? (
                                <span onClick={(e) => handleViewAction(item, e)} className="font-bold text-darkest-blue dark:text-blue-400 cursor-pointer hover:underline decoration-2 underline-offset-4">
                                  {displayValue}
                                </span>
                              ) : (
                                displayValue
                              )}
                            </td>
                          );
                        })}
                        {hasActionColumn && (
                          <td className="px-5 py-4 sticky right-0 bg-white group-hover/row:bg-[#f8fafc] dark:bg-gray-900 text-center shadow-[-4px_0_12px_rgba(0,0,0,0.03)] z-10">
                            <div className="flex justify-center gap-3">
                              {(EditModal || editroutepoint) && <button onClick={(e) => { e.stopPropagation(); if (editroutepoint) { navigate(editroutepoint, {state:{item}}); } else { setSelectedItem(item); setShowEdit(true); } }} className="text-slate-400 hover:text-darkest-blue transition-colors transform hover:scale-110"><Pencil size={16} /></button>}
                              {DeleteModal && <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setShowDelete(true); }} className="text-slate-400 hover:text-rose-600 transition-colors transform hover:scale-110"><RiDeleteBinLine size={17} /></button>}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={columns.length + 2} className="px-6 py-20 text-center text-gray-500 font-medium">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* --- Grid View --- */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-auto p-1 scrollbar-thin">
            {delayedLoading ? (
              <div className="col-span-full py-24 text-center"><Loader /></div>
            ) : sortedItems.map((item, index) => {
              const headerVal = columns[0].render ? columns[0].render(item) : item[columns[0].key];
              return (
                <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group/card h-fit">
                  <div className="px-5 py-4 bg-darkest-blue rounded-t-xl flex justify-between items-center gap-4">
                    <span onClick={(e) => handleViewAction(item, e)} className="font-bold text-white text-[15px] cursor-pointer hover:text-blue-200 truncate block transition-colors">
                      {truncateText(String(headerVal || ""), 10).displayText}
                    </span>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {(EditModal || editroutepoint) && <button onClick={(e) => { e.stopPropagation(); if (editroutepoint) { navigate(editroutepoint, {state:{item}}); } else { setSelectedItem(item); setShowEdit(true); } }} className="text-white/60 hover:text-white transition-transform hover:scale-110"><Pencil size={14} /></button>}
                      {DeleteModal && <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setShowDelete(true); }} className="text-white/60 hover:text-rose-400 transition-transform hover:scale-110"><RiDeleteBinLine size={15} /></button>}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-4 bg-white dark:bg-gray-900 rounded-b-xl border-x border-b border-gray-100 flex-1">
                    {columns.slice(1).map((col) => {
                      const cellValue = col.render ? col.render(item) : item[col.key];
                      const isNameOrId = String(col.key).toLowerCase().includes("name") || String(col.key).toLowerCase().includes("id");
                      return (
                        <div key={col.key} className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{col.label}</span>
                          <div
                            className="flex items-center justify-between min-w-0 flex-1"
                            onMouseEnter={String(cellValue).length > 35 ? (e) => showTooltip(e, String(cellValue)) : undefined}
                            onMouseLeave={String(cellValue).length > 35 ? hideTooltip : undefined}
                          >
                            <span className={`${isNameOrId && (ViewModal || routepoint) ? "text-darkest-blue cursor-pointer hover:underline" : "text-slate-800 dark:text-slate-200"} font-bold text-sm truncate block`} onClick={isNameOrId ? (e) => handleViewAction(item, e) : undefined}>
                              {cellValue || "-"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pagination && !loading && (
          <Pagination totalItems={sortedItems.length} totalPages={totalPages} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}

      {/* --- Integrated Modals --- */}
      {AddModal && showAdd && <AddModal onclose={() => setShowAdd(false)} onSuccess={onSuccess} />}
      {EditModal && EditModal !== true && showEdit && <EditModal onclose={() => setShowEdit(false)} item={selectedItem} onUpdated={onUpdated} />}
      {ViewModal && showView && <ViewModal onclose={() => setShowView(false)} item={selectedItem} />}
      {DeleteModal && showDelete && <DeleteModal onclose={() => setShowDelete(false)} item={selectedItem} deletetitle={deletetitle} onDelete={onDelete} idKey={idKey} />}
      {FilterModal && showFilter && <FilterModal onclose={() => setShowFilter(false)} onFilter={handleFilter} />}
      {UploadModal && showUpload && <UploadModal onclose={() => setShowUpload(false)} onSuccess={onSuccess} name={name} />}

      {tooltip.visible && (
        <div
          style={{ position: "fixed", left: tooltip.x, top: tooltip.y - 8, transform: "translate(-50%, -100%)", zIndex: 9999, pointerEvents: "none" }}
          className="bg-slate-900 text-white text-[10px] font-medium rounded px-2 py-1 shadow-2xl border border-slate-700/50 leading-relaxed whitespace-normal break-words max-w-[300px]"
        >
          {tooltip.text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

export default Table;
import React, { useEffect, useState, useMemo } from "react";
import Title from "./Title";
import Button from "./Button";
import { HiArrowsUpDown } from "react-icons/hi2";
import { Pencil } from "lucide-react";
import { LuEye } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import Pagination from "./Pagination";
import { useSearch } from "../context/SearchBar";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import Loader from "./Loader";

const truncateWords = (text, wordLimit = 7) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);

  if (words.length <= wordLimit) {
    return words.join(" ");
  }

  return `${words.slice(0, wordLimit).join(" ")}...`;
};

const Table = ({
  endpoint,
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
  contentMarginTop = "mt-2",
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

  const itemsPerPage = 10;

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [delayedLoading, setDelayedLoading] = useState(false);

  useEffect(() => {
    let timer;

    if (loading) {
      setDelayedLoading(true);
    } else {
      timer = setTimeout(() => setDelayedLoading(false), 2000);
    }

    return () => clearTimeout(timer);
  }, [loading, 2000]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterParams, setCurrentPage]);

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

  return (
    <div className="font-roboto-flex flex flex-col h-full w-full overflow-hidden">
      {/* --- Header Section --- */}
      <div className="py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 ">
        <div className="flex-1">
          <Title title={title} sub_title={subtitle} page_title={pagetitle} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {Datecontent && (
            <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <p className="font-medium text-xs text-gray-600 dark:text-gray-300">
                Date:{" "}
                <span className="font-bold text-gray-900 dark:text-white pl-1">
                  17.05.2025
                </span>
              </p>
            </div>
          )}
          {AddModal && (
            <Button
              button_name={addButtonLabel}
              button_icon={addButtonIcon}
              onClick={() => {
                if (addroutepoint) {
                  navigate(`${addroutepoint}`);
                }
                if (AddModal === true) {
                  setShowAdd(false);
                } else {
                  setShowAdd(true);
                }
              }}
            />
          )}
          {exportModal && (
            <Button
              button_icon={<TbFileExport size={18} />}
              button_name="Export"
              bgColor="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              textColor="text-gray-700 dark:text-gray-200"
              onClick={onExport}
            />
          )}
          {UploadModal && (
            <Button
              button_icon={<TbFileExport size={18} />}
              button_name="Upload"
              bgColor="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              textColor="text-gray-700 dark:text-gray-200"
              onClick={() => setShowUpload(true)}
            />
          )}
          {FilterModal && (
            <Button
              button_icon={<BiFilterAlt size={18} />}
              button_name="Filter"
              bgColor="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              textColor="text-gray-700 dark:text-gray-200"
              onClick={() => setShowFilter(true)}
            />
          )}
          {freeze && (
            <Button
              button_name={freezeButtonLabel}
              button_icon={freezeButtonIcon}
              bgColor="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              textColor="text-gray-700 dark:text-gray-200"
              onClick={onfreeze}
            />
          )}
          {FilterModal && (filterParams?.fromdate || filterParams?.todate) && (
            <Button
              button_icon={<IoClose size={16} />}
              button_name="Clear"
              bgColor="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-800"
              textColor="text-red-600 dark:text-red-400"
              onClick={() => {
                setFilterParams({ fromdate: "", todate: "" });
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>

      {/* --- Table Container (Fluid & Scrollable) --- */}
      <div className={`flex-1 overflow-hidden relative ${contentMarginTop}`}>
        <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 ">
          <table className="min-w-full border-separate border-spacing-y-0.5">
            <thead className="bg-gray-50/95 dark:bg-gray-800/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm ">
              <tr>
                <th
                  scope="col"
                  className="px-2 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider w-12 "
                >
                  S.no
                </th>
                {columns.map((col) => {
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      // Removed alignClass here. Forced 'text-center'
                      className="px-2 py-4 text-center text-xs text-gray-600 dark:text-gray-200 uppercase tracking-wider cursor-pointer group hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      {/* Removed flexAlign here. Forced 'justify-center' */}
                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        {col.label}
                        <HiArrowsUpDown
                          onClick={(e) => {
                            e.stopPropagation();
                            let direction = "asc";
                            if (
                              sortConfig.key === col.key &&
                              sortConfig.direction === "asc"
                            ) {
                              direction = "desc";
                            }
                            setSortConfig({ key: col.key, direction });
                          }}
                          size={14}
                          className={`transition-colors ${
                            sortConfig.key === col.key
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-red-600 group-hover:text-red-500 dark:text-red-600 "
                          }`}
                        />
                      </div>
                    </th>
                  );
                })}
                {(EditModal ||
                  ViewModal ||
                  DeleteModal ||
                  routepoint ||
                  editroutepoint) && (
                  <th
                    scope="col"
                    className="px-4 py-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20"
                  >
                    Action
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {delayedLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="py-20 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Loader />
                      <span className="mt-2 text-sm text-gray-400">
                        Loading data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : sortedItems.length > 0 ? (
                sortedItems.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => onRowClick && onRowClick(item)}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-100 cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400 text-left">
                      {startIndex + index + 1}
                    </td>

                    {columns.map((col) => {
                      const cellValue = col.render
                        ? col.render(item)
                        : item[col.key];
                      let displayValue;

                      if (React.isValidElement(cellValue)) {
                        displayValue = cellValue;
                      } else {
                        const isEmpty =
                          cellValue === null ||
                          cellValue === undefined ||
                          cellValue === "" ||
                          (typeof cellValue === "string" &&
                            cellValue.trim().toLowerCase() === "undefined");
                        displayValue = isEmpty
                          ? "-"
                          : col.formatter
                            ? col.formatter(cellValue)
                            : truncateWords(String(cellValue), 7);
                      }

                      // ALIGNMENT LOGIC: Applied ONLY to tbody td
                      const alignClass = col.className || "text-center";

                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3.5 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 ${alignClass}`}
                        >
                          {displayValue}
                        </td>
                      );
                    })}

                    {(EditModal ||
                      ViewModal ||
                      DeleteModal ||
                      routepoint ||
                      editroutepoint) && (
                      <td className="px-4 py-3.5 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          {(EditModal || editroutepoint) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (editroutepoint) {
                                  navigate(`${editroutepoint}`, {
                                    state: { item: item },
                                  });
                                }
                                if (EditModal === true) {
                                  setShowEdit(false);
                                } else {
                                  setSelectedItem(item);
                                  setShowEdit(true);
                                }
                              }}
                              className="p-1 rounded text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {(ViewModal || routepoint) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (routepoint) {
                                  if (idKey) {
                                    localStorage.setItem(
                                      `selected${idKey}`,
                                      JSON.stringify(item),
                                    );
                                  }
                                  if (idKey && id2Key) {
                                    navigate(
                                      `${routepoint}/${item[idKey]}/${item[id2Key]}`,
                                      { state: { item } },
                                    );
                                  } else if (
                                    idKey &&
                                    routepoint.includes(`:${idKey}`)
                                  ) {
                                    const url = routepoint.replace(
                                      `:${idKey}`,
                                      item[idKey],
                                    );
                                    navigate(url, { state: { item } });
                                  } else if (idKey) {
                                    navigate(`${routepoint}/${item[idKey]}`, {
                                      state: { item },
                                    });
                                  } else {
                                    navigate(routepoint, { state: { item } });
                                  }
                                }
                                if (ViewModal === true) {
                                  setShowView(false);
                                } else {
                                  setSelectedItem(item);
                                  setShowView(true);
                                }
                              }}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors"
                              title="View"
                            >
                              <LuEye size={15} />
                            </button>
                          )}
                          {DeleteModal && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                                setShowDelete(true);
                              }}
                              className="p-1 rounded text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                              title="Delete"
                            >
                              <RiDeleteBinLine size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full">
                        <BiFilterAlt size={20} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-medium">
                        No records found
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Footer / Pagination --- */}
      {pagination && !loading && (
        <div className="px-4 py-3">
          <Pagination
            totalItems={sortedItems.length}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}

      {/* --- Modals (Logic Unchanged) --- */}
      {AddModal && showAdd && (
        <AddModal onclose={() => setShowAdd(false)} onSuccess={onSuccess} />
      )}
      {EditModal && showEdit && (
        <EditModal
          onclose={() => setShowEdit(false)}
          item={selectedItem}
          onUpdated={onUpdated}
        />
      )}
      {ViewModal && showView && (
        <ViewModal onclose={() => setShowView(false)} item={selectedItem} />
      )}
      {DeleteModal && showDelete && (
        <DeleteModal
          onclose={() => setShowDelete(false)}
          item={selectedItem}
          deletetitle={deletetitle}
          onDelete={onDelete}
          idKey={idKey}
        />
      )}
      {FilterModal && showFilter && (
        <FilterModal
          onclose={() => setShowFilter(false)}
          onFilter={handleFilter}
        />
      )}
      {UploadModal && showUpload && (
        <UploadModal
          onclose={() => setShowUpload(false)}
          onSuccess={onSuccess}
          name={name}
        />
      )}
    </div>
  );
};

export default Table;

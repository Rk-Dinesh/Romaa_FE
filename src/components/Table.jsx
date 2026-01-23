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

// const truncateWords = (text, wordsPerLine = 10) => {
//   if (!text) return "";
//   const words = text.split(" ");
//   const lines = [];

//   for (let i = 0; i < words.length; i += wordsPerLine) {
//     lines.push(words.slice(i, i + wordsPerLine).join(" "));
//   }

//   return (
//     <>
//       {lines.map((line, index) => (
//         <span key={index}>
//           {line}
//           {index !== lines.length - 1 && <br />}
//         </span>
//       ))}
//     </>
//   );
// };

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
  contentMarginTop = "mt-4",
  totalPages = 1,
  currentPage = 1,
  setCurrentPage = () => { },
  filterParams,
  setFilterParams = () => { },
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
      // Show loader immediately
      setDelayedLoading(true);
    } else {
      // Keep loader visible for minDelay ms before hiding
      timer = setTimeout(() => setDelayedLoading(false), 2000);
    }

    return () => clearTimeout(timer);
  }, [loading, 2000]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterParams]);

  const handleFilter = ({ fromdate, todate }) => {
    setFilterParams({ fromdate, todate });
    setShowFilter(false);
    setCurrentPage(1);
  };

  // Sorting logic
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
    <div className="font-roboto-flex flex flex-col h-full">
      <div className="lg:flex lg:justify-between">
        <Title title={title} sub_title={subtitle} page_title={pagetitle} />
        <div className="my-2 flex flex-wrap items-center gap-2">
          {Datecontent && (
            <p className="font-semibold ">
              Date:
              <span className="font-medium text-sm opacity-90 px-1">
                17.05.2025
              </span>
            </p>
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
              button_icon={<TbFileExport size={22} />}
              button_name="Export"
              bgColor="dark:bg-layout-dark bg-white"
              textColor="dark:text-white text-darkest-blue"
              onClick={onExport}
            />
          )}
          {UploadModal && (
            <Button
              button_icon={<TbFileExport size={22} />}
              button_name="Upload"
              bgColor="dark:bg-layout-dark bg-white"
              textColor="dark:text-white text-darkest-blue"
              onClick={() => setShowUpload(true)}
            />
          )}
          {FilterModal && (
            <Button
              button_icon={<BiFilterAlt size={22} />}
              button_name="Filter"
              bgColor="dark:bg-layout-dark bg-white"
              textColor="dark:text-white text-darkest-blue"
              onClick={() => setShowFilter(true)}
            />
          )}
          {freeze && (
            <Button
              button_name={freezeButtonLabel}
              button_icon={freezeButtonIcon}
              bgColor="dark:bg-layout-dark bg-white"
              textColor="dark:text-white text-darkest-blue"
              onClick={onfreeze}
            />
          )}
          {FilterModal && (filterParams?.fromdate || filterParams?.todate) && (
            <Button
              button_icon={<IoClose size={20} />}
              button_name="Clear"
              bgColor="dark:bg-layout-dark bg-white"
              textColor="dark:text-white text-darkest-blue"
              onClick={() => {
                setFilterParams({ fromdate: "", todate: "" });
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>

      <div
        className={`${contentMarginTop} overflow-y-auto no-scrollbar h-11/12`}
      >
        <div className="overflow-auto no-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="font-semibold text-sm dark:bg-layout-dark dark:text-white bg-white border-b-4 dark:border-overall_bg-dark border-light-blue">
                <th className="p-3.5 rounded-l-lg">S.no</th>
                {columns.map((col, index) => {
                  const isLastColumn = index === columns.length - 1;
                  const hasAction =
                    EditModal ||
                    ViewModal ||
                    DeleteModal ||
                    routepoint ||
                    editroutepoint;
                  const addRightRadius = isLastColumn && !hasAction;

                  return (
                    <th
                      key={col.key}
                      className={`p-3 text-center cursor-pointer ${addRightRadius ? "rounded-r-lg" : ""
                        }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {col.label}
                        <HiArrowsUpDown
                          onClick={() => {
                            let direction = "asc";
                            if (
                              sortConfig.key === col.key &&
                              sortConfig.direction === "asc"
                            ) {
                              direction = "desc";
                            }
                            setSortConfig({ key: col.key, direction });
                          }}
                          size={18}
                          className={
                            sortConfig.key === col.key
                              ? sortConfig.direction === "asc"
                                ? "rotate-180 border border-darkest-blue"
                                : ""
                              : ""
                          }
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
                    <th className="pr-2 text-center rounded-r-lg">Action</th>
                  )}
              </tr>
            </thead>
            <tbody className=" dark:text-white text-greyish dark:bg-layout-dark bg-white text-sm font-light">
              {delayedLoading ? (
                <tr>
                  <td colSpan={columns.length + 2} className="py-20">
                    {/* Your custom Loader component */}
                    <Loader />
                  </td>
                </tr>
              ) : sortedItems.length > 0 ? (
                sortedItems.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b-[3px] dark:border-overall_bg-dark border-light-blue text-center`}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    <td className="p-2 rounded-l-lg ">{startIndex + index + 1}</td>
                    {columns.map((col, colIndex) => {
                      const isLastColumn = colIndex === columns.length - 1;
                      const hasAction = EditModal || ViewModal || DeleteModal || routepoint || editroutepoint;
                      const addRightRadius = isLastColumn && !hasAction;

                      const cellValue = col.render ? col.render(item) : item[col.key];

                      let displayValue;
                      if (React.isValidElement(cellValue)) {
                        displayValue = cellValue;
                      } else {
                        const isEmpty = cellValue === null || cellValue === undefined || cellValue === "" || (typeof cellValue === "string" && cellValue.trim().toLowerCase() === "undefined");
                        displayValue = isEmpty ? "-" : (col.formatter ? col.formatter(cellValue) : truncateWords(String(cellValue), 7));
                      }

                      return (
                        <td
                          key={col.key}
                          className={` p-2.5 first-letter:uppercase text-center ${addRightRadius ? "rounded-r-lg" : ""}`}
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
                        <td className="space-x-2.5 p-2 rounded-r-lg">
                          {(EditModal || editroutepoint) && (
                            <button
                              onClick={() => {
                                if (editroutepoint) {
                                  navigate(`${editroutepoint}`, {
                                    state: { item },
                                  });
                                }
                                if (EditModal === true) {
                                  setShowEdit(false);
                                } else {
                                  setSelectedItem(item);
                                  setShowEdit(true);
                                }
                              }}
                              className="cursor-pointer dark:bg-icon-dark-blue bg-[#C9E0FF] p-1.5 rounded"
                            >
                              <Pencil
                                size={14}
                                className="dark:text-white text-blue-500"
                              />
                            </button>
                          )}
                          {(ViewModal || routepoint) && (
                            <button
                              onClick={() => {
                                if (routepoint) {
                                  // Persist the selected item in localStorage if idKey is present
                                  if (idKey) {
                                    localStorage.setItem(
                                      `selected${idKey}`,
                                      JSON.stringify(item)
                                    );
                                  }

                                  // Navigate based on presence of idKey and id2Key and routepoint param placeholder
                                  if (idKey && id2Key) {
                                    // If have two keys, navigate with both params appended
                                    navigate(
                                      `${routepoint}/${item[idKey]}/${item[id2Key]}`,
                                      { state: { item } }
                                    );
                                  } else if (
                                    idKey &&
                                    routepoint.includes(`:${idKey}`)
                                  ) {
                                    // If routepoint contains param placeholder ":idKey", replace it
                                    const url = routepoint.replace(
                                      `:${idKey}`,
                                      item[idKey]
                                    );
                                    navigate(url, { state: { item } });
                                  } else if (idKey) {
                                    // Otherwise append idKey param manually
                                    navigate(`${routepoint}/${item[idKey]}`, {
                                      state: { item },
                                    });
                                  } else {
                                    // No params, just navigate with state
                                    navigate(routepoint, { state: { item } });
                                  }
                                }

                                // Handle modal view toggle state based on ViewModal prop
                                if (ViewModal === true) {
                                  setShowView(false);
                                } else {
                                  setSelectedItem(item);
                                  setShowView(true);
                                }
                              }}
                              className="cursor-pointer dark:bg-icon-dark-green bg-[#BAFFBA] p-1.5 rounded"
                            >
                              <LuEye
                                size={14}
                                className="text-[#008000] dark:text-[#BAFFBA]"
                              />
                            </button>
                          )}

                          {DeleteModal && (
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDelete(true);
                              }}
                              className="cursor-pointer bg-red-100 dark:bg-icon-dark-red p-1.5 rounded-sm"
                            >
                              <RiDeleteBinLine
                                size={14}
                                className=" text-red-600"
                              />
                            </button>
                          )}
                        </td>
                      )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="text-center py-10 dark:text-white text-gray-500"
                  >
                    No matching results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination && !loading && (
        <Pagination
          totalItems={sortedItems.length}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
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

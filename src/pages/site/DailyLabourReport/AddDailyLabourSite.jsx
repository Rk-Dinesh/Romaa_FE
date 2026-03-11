import { useState, useEffect, useRef, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import {
  FiSave,
  FiChevronDown,
  FiSearch,
  FiClipboard,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useContractorsDropdownTenderWise } from "../../Hr/contract & Nmr/hooks/useContractors";
import {
  useContractorEmployees,
  useCreateBulkDLP,
  useBOQItems,
} from "./hooks/useDailyLabourReport";
import { useProject } from "../../../context/ProjectContext";

const UNITS = ["CUM", "SQM", "RMT", "NOS", "KG", "MT", "LS"];

const STATUS_STYLES = {
  PRESENT:
    "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
  HALF_DAY:
    "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
  ABSENT:
    "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
};

const fromEmployee = (emp, wageMap) => ({
  worker_id: emp.worker_id,
  worker_name: emp.employee_name,
  category: emp.role,
  daily_wage: wageMap[emp.role] ?? emp.daily_wage ?? 0,
  status: "PRESENT",
  description: "",
  unit: "CUM",
  l: "",
  b: "",
  h: "",
  quantity: "",
  remark: "",
});

// ─── Validation ──────────────────────────────────────────────────────────────

const validate = (reportDate, sections) => {
  const errs = { reportDate: "", sections: {} };
  let valid = true;

  if (!reportDate) {
    errs.reportDate = "Date is required";
    valid = false;
  }

  sections.forEach((s) => {
    const sErr = { contractorId: "", entries: {} };

    if (!s.contractorId) {
      sErr.contractorId = "Please select a contractor";
      valid = false;
    }

    s.entries.forEach((e, idx) => {
      if (e.status !== "ABSENT" && !e.description.trim()) {
        sErr.entries[idx] = { description: "Description is required" };
        valid = false;
      }
    });

    errs.sections[s.sectionId] = sErr;
  });

  return { errs, valid };
};

// ─── Root form ──────────────────────────────────────────────────────────────

const AddDailyLabourSite = ({ onclose, onSuccess }) => {
  const { tenderId } = useProject();
  const { data: contractors = [] } = useContractorsDropdownTenderWise(tenderId);
  const { data: boqItems = [] } = useBOQItems(tenderId);
  const { mutateAsync: submitBulk, isPending: loading } = useCreateBulkDLP({
    onSuccess,
    onclose,
  });

  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [sections, setSections] = useState([
    { sectionId: Date.now(), contractorId: "", remark: "", entries: [] },
  ]);
  const [errors, setErrors] = useState({ reportDate: "", sections: {} });

  // Clear a specific error path
  const clearError = (path) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (path === "reportDate") next.reportDate = "";
      return next;
    });
  };

  const clearSectionError = (sectionId, field) => {
    setErrors((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: { ...(prev.sections[sectionId] || {}), [field]: "" },
      },
    }));
  };

  const clearEntryError = (sectionId, index) => {
    setErrors((prev) => {
      const sec = prev.sections[sectionId] || {};
      const entries = { ...(sec.entries || {}) };
      delete entries[index];
      return {
        ...prev,
        sections: { ...prev.sections, [sectionId]: { ...sec, entries } },
      };
    });
  };

  const addSection = () =>
    setSections((prev) => [
      ...prev,
      { sectionId: Date.now(), contractorId: "", remark: "", entries: [] },
    ]);

  const removeSection = (sectionId) =>
    setSections((prev) => prev.filter((s) => s.sectionId !== sectionId));

  const updateContractor = (sectionId, contractorId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.sectionId === sectionId ? { ...s, contractorId, entries: [] } : s,
      ),
    );
    clearSectionError(sectionId, "contractorId");
  };

  const updateRemark = (sectionId, remark) =>
    setSections((prev) =>
      prev.map((s) => (s.sectionId === sectionId ? { ...s, remark } : s)),
    );

  const updateEntries = (sectionId, entries) =>
    setSections((prev) =>
      prev.map((s) => (s.sectionId === sectionId ? { ...s, entries } : s)),
    );

  const updateEntry = (sectionId, index, field, value) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.sectionId !== sectionId) return s;
        const updated = [...s.entries];
        updated[index] = { ...updated[index], [field]: value };
        // If status changed to ABSENT, clear that row's errors
        if (field === "status" && value === "ABSENT")
          clearEntryError(sectionId, index);
        return { ...s, entries: updated };
      }),
    );
    if (field === "description") clearEntryError(sectionId, index);
  };

  const usedContractorIds = sections.map((s) => s.contractorId).filter(Boolean);

  const totals = useMemo(() => {
    let headcount = 0;
    let amount = 0;
    sections.forEach((s) =>
      s.entries.forEach((e) => {
        const wage = parseFloat(e.daily_wage) || 0;
        if (e.status === "PRESENT") {
          headcount += 1;
          amount += wage;
        } else if (e.status === "HALF_DAY") {
          headcount += 0.5;
          amount += wage / 2;
        }
      }),
    );
    return { headcount, amount };
  }, [sections]);

  const handleSubmit = async () => {
    if (!tenderId)
      return toast.error("No project selected. Open a project first.");

    const { errs, valid } = validate(reportDate, sections);
    setErrors(errs);

    if (!valid) {
      toast.error("Please fix the highlighted errors before submitting");
      return;
    }

    const filled = sections.filter((s) => s.contractorId && s.entries.length);
    if (!filled.length)
      return toast.error("Add at least one contractor with workers");

    const reports = filled.map((s) => ({
      report_date: reportDate,
      project_id: tenderId,
      contractor_id: s.contractorId,
      remark: s.remark,
      work_entries: s.entries.map((e) => ({
        worker_id: e.worker_id,
        worker_name: e.worker_name,
        category: e.category,
        daily_wage: parseFloat(e.daily_wage) || 0,
        status: e.status,
        description: e.description || "",
        unit: e.unit,
        ...(e.l !== "" && { l: parseFloat(e.l) }),
        ...(e.b !== "" && { b: parseFloat(e.b) }),
        ...(e.h !== "" && { h: parseFloat(e.h) }),
        ...(e.quantity !== "" && { quantity: parseFloat(e.quantity) }),
        ...(e.remark && { remark: e.remark }),
      })),
    }));

    await submitBulk({ reports });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FiClipboard className="text-xl" />
              </span>
              Daily Labour Report
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">
              Record daily site progress and worker attendance
            </p>
          </div>
          <button
            onClick={onclose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {/* Global fields */}
          <div className="px-6 pt-5 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => {
                  setReportDate(e.target.value);
                  clearError("reportDate");
                }}
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 transition-colors ${
                  errors.reportDate
                    ? "border-red-400 focus:border-red-400 focus:ring-red-300"
                    : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.reportDate && (
                <p className="text-red-500 text-[10px] mt-0.5">
                  {errors.reportDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project
              </label>
              <input
                value={tenderId || "No project selected"}
                readOnly
                className={`w-full border rounded-lg px-3 py-2 text-sm cursor-not-allowed ${
                  !tenderId
                    ? "border-red-300 bg-red-50 dark:bg-red-900/10 text-red-400"
                    : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}
              />
              {!tenderId && (
                <p className="text-red-500 text-[10px] mt-0.5">
                  Open a project to continue
                </p>
              )}
            </div>
          </div>

          {/* Contractor Sections */}
          <div className="px-6 py-5 space-y-6">
            {sections.map((section, sIdx) => (
              <ContractorSection
                key={section.sectionId}
                section={section}
                sectionIndex={sIdx}
                contractors={contractors}
                usedContractorIds={usedContractorIds.filter(
                  (id) => id !== section.contractorId,
                )}
                tenderId={tenderId}
                boqItems={boqItems}
                canRemove={sections.length > 1}
                sectionErrors={errors.sections[section.sectionId] || {}}
                onChangeContractor={(id) =>
                  updateContractor(section.sectionId, id)
                }
                onRemarkChange={(val) => updateRemark(section.sectionId, val)}
                onEntriesLoaded={(entries) =>
                  updateEntries(section.sectionId, entries)
                }
                onEntryChange={(index, field, value) =>
                  updateEntry(section.sectionId, index, field, value)
                }
                onRemoveSection={() => removeSection(section.sectionId)}
              />
            ))}

            <button
              onClick={addSection}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors w-full justify-center"
            >
              <FiPlus size={16} /> Add Contractor
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center rounded-b-xl shrink-0">
          <div className="flex gap-6 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Contractors:{" "}
              <strong className="text-gray-800 dark:text-white">
                {sections.filter((s) => s.contractorId).length}
              </strong>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Headcount:{" "}
              <strong className="text-gray-800 dark:text-white">
                {totals.headcount}
              </strong>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Total Amount:{" "}
              <strong className="text-green-600">
                ₹{totals.amount.toLocaleString("en-IN")}
              </strong>
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onclose}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <FiSave />
              )}
              {loading ? "Saving..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Per-contractor section ──────────────────────────────────────────────────

const ContractorSection = ({
  section,
  sectionIndex,
  contractors,
  usedContractorIds,
  tenderId,
  boqItems,
  canRemove,
  sectionErrors,
  onChangeContractor,
  onRemarkChange,
  onEntriesLoaded,
  onEntryChange,
  onRemoveSection,
}) => {
  const { data: contractorData, isLoading } = useContractorEmployees(
    section.contractorId,
    tenderId,
  );

  const employees = useMemo(
    () => contractorData?.employees || [],
    [contractorData],
  );
  const wageFixing = useMemo(
    () => contractorData?.wage_fixing || [],
    [contractorData],
  );

  const wageMap = useMemo(() => {
    const map = {};
    wageFixing.forEach((w) => {
      map[w.category] = w.wage;
    });
    return map;
  }, [wageFixing]);

  useEffect(() => {
    if (employees.length > 0) {
      onEntriesLoaded(employees.map((emp) => fromEmployee(emp, wageMap)));
    } else {
      onEntriesLoaded([]);
    }
  }, [employees, wageMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const contractorError = sectionErrors.contractorId || "";
  const entryErrors = sectionErrors.entries || {};

  return (
    <div
      className={`border rounded-xl ${contractorError ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
          Contractor {sectionIndex + 1}
        </span>
        <div className="flex-1">
          <ContractorSelect
            contractors={contractors}
            value={section.contractorId}
            disabledIds={usedContractorIds}
            onChange={onChangeContractor}
            hasError={!!contractorError}
          />
          {contractorError && (
            <p className="text-red-500 text-[10px] mt-0.5">{contractorError}</p>
          )}
        </div>

        {wageFixing.length > 0 && (
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {wageFixing.map((w, i) => (
              <span
                key={i}
                className="inline-flex gap-1 px-2 py-0.5 text-[10px] rounded border bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
              >
                {w.category}:{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  ₹{w.wage}
                </span>
              </span>
            ))}
          </div>
        )}

        {canRemove && (
          <button
            onClick={onRemoveSection}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
          >
            <FiTrash2 size={15} />
          </button>
        )}
      </div>

      {/* Per-contractor remark */}
      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
        <input
          type="text"
          value={section.remark}
          onChange={(e) => onRemarkChange(e.target.value)}
          placeholder="Remark for this contractor..."
          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Workers table */}
      {!section.contractorId ? (
        <div className="text-center py-8 text-sm text-gray-400">
          Select a contractor to load workers
        </div>
      ) : isLoading ? (
        <div className="text-center py-8 text-sm text-gray-400 flex items-center justify-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          Loading workers...
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400">
          No workers registered under this contractor
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[2fr_1.1fr_0.7fr_0.85fr_1.5fr_0.75fr_0.55fr_0.55fr_0.55fr_0.75fr_1.1fr] bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 px-3 py-2">
            {[
              "Worker",
              "Category",
              "Wage ₹",
              "Status",
              "Description *",
              "Unit",
              "L",
              "B",
              "H",
              "Qty",
              "Remark",
            ].map((h) => (
              <div
                key={h}
                className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1"
              >
                {h}
              </div>
            ))}
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {section.entries.map((entry, index) => (
              <WorkerRow
                key={entry.worker_id}
                boqItems={boqItems}
                entry={entry}
                index={index}
                rowError={entryErrors[index] || {}}
                onChange={(i, field, value) => onEntryChange(i, field, value)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Single worker row ───────────────────────────────────────────────────────

const WorkerRow = ({ entry, index, rowError, boqItems, onChange }) => {
  const isAbsent = entry.status === "ABSENT";
  const descError = rowError.description || "";

  const inputCls = (hasError = false, extra = "") =>
    `w-full border rounded-md px-2 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-700 ${
      hasError
        ? "border-red-400 focus:border-red-400 focus:ring-red-300"
        : "border-gray-200 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-400"
    } ${extra}`;

  return (
    <div
      className={`grid grid-cols-[2fr_1.1fr_0.7fr_0.85fr_1.5fr_0.75fr_0.55fr_0.55fr_0.55fr_0.75fr_1.1fr] items-start px-3 py-2 transition-colors ${isAbsent ? "bg-red-50/40 dark:bg-red-900/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/20"}`}
    >
      {/* Worker */}
      <div className="px-1 pt-1">
        <p
          className={`text-sm font-medium truncate ${isAbsent ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-100"}`}
        >
          {entry.worker_name}
        </p>
        <p className="text-[10px] text-gray-400">{entry.worker_id}</p>
      </div>

      {/* Category */}
      <div className="px-1 pt-1.5">
        <span
          className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-md border ${isAbsent ? "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700" : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"}`}
        >
          {entry.category || "—"}
        </span>
      </div>

      {/* Wage */}
      <div className="px-1 pt-2">
        <span
          className={`text-sm font-semibold ${isAbsent ? "text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}`}
        >
          ₹{entry.daily_wage}
        </span>
      </div>

      {/* Status */}
      <div className="px-1">
        <select
          value={entry.status}
          onChange={(e) => onChange(index, "status", e.target.value)}
          className={`w-full border rounded-md px-1.5 py-1.5 text-[11px] font-semibold focus:outline-none cursor-pointer ${STATUS_STYLES[entry.status]}`}
        >
          <option value="PRESENT">Present</option>
          <option value="HALF_DAY">Half Day</option>
          <option value="ABSENT">Absent</option>
        </select>
      </div>

      {/* Description */}
      <div className="px-1">
        <DescriptionSelect
          boqItems={boqItems}
          value={entry.description}
          disabled={isAbsent}
          hasError={!!descError && !isAbsent}
          onChange={(val) => onChange(index, "description", val)}
          onSelect={(item) => {
            if (item.unit) onChange(index, "unit", item.unit.toUpperCase());
          }}
        />
        {descError && !isAbsent && (
          <p className="text-red-500 text-[9px] mt-0.5 leading-tight">{descError}</p>
        )}
      </div>

      {/* Unit */}
      <div className="px-1">
        <select
          value={entry.unit}
          disabled={isAbsent}
          onChange={(e) => onChange(index, "unit", e.target.value)}
          className={inputCls(false)}
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* L */}
      <div className="px-1">
        <input
          type="number"
          value={entry.l}
          disabled={isAbsent}
          onChange={(e) => onChange(index, "l", e.target.value)}
          placeholder="—"
          className={inputCls(false, "text-center")}
        />
      </div>

      {/* B */}
      <div className="px-1">
        <input
          type="number"
          value={entry.b}
          disabled={isAbsent}
          onChange={(e) => onChange(index, "b", e.target.value)}
          placeholder="—"
          className={inputCls(false, "text-center")}
        />
      </div>

      {/* H */}
      <div className="px-1">
        <input
          type="number"
          value={entry.h}
          disabled={isAbsent}
          onChange={(e) => onChange(index, "h", e.target.value)}
          placeholder="—"
          className={inputCls(false, "text-center")}
        />
      </div>

      {/* Qty */}
      <div className="px-1">
        <input
          type="number"
          value={entry.quantity}
          disabled={isAbsent}
          onChange={(e) => onChange(index, "quantity", e.target.value)}
          placeholder="—"
          className={inputCls(
            false,
            "text-center bg-blue-50 dark:bg-blue-900/20 font-medium",
          )}
        />
      </div>

      {/* Remark */}
      <div className="px-1">
        <input
          type="text"
          value={entry.remark}
          disabled={isAbsent}
          onChange={(e) => onChange(index, "remark", e.target.value)}
          placeholder={isAbsent ? "—" : "Note..."}
          className={inputCls(false)}
        />
      </div>
    </div>
  );
};

// ─── Description searchable select (BOQ items) ───────────────────────────────

const DescriptionSelect = ({ boqItems, value, onChange, onSelect, hasError, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = boqItems.filter(
    (b) =>
      b.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.item_id?.toLowerCase().includes(search.toLowerCase())
  );

  const borderCls = hasError
    ? "border-red-400 focus:border-red-400 focus:ring-red-300"
    : "border-gray-200 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-400";

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        disabled={disabled}
        value={isOpen ? search : value}
        placeholder={disabled ? "—" : "Search work item..."}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => { setSearch(""); setIsOpen(true); }}
        className={`w-full border rounded-md px-2 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-700 ${borderCls}`}
      />
      {isOpen && !disabled && filtered.length > 0 && (
        <div className="absolute z-[100] left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filtered.map((b) => (
            <div
              key={b.item_id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(`${b.item_id} - ${b.item_name}`);
                if (onSelect) onSelect(b);
                setIsOpen(false);
                setSearch("");
              }}
              className="px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-50 dark:border-gray-700 last:border-0"
            >
              <span className="font-semibold text-blue-600 dark:text-blue-400">{b.item_id}</span>
              <span className="text-gray-600 dark:text-gray-300"> — {b.item_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Searchable Contractor Select ────────────────────────────────────────────

const ContractorSelect = ({
  contractors,
  value,
  disabledIds = [],
  onChange,
  hasError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = contractors.find((c) => c.value === value)?.label || "";
  const filtered = contractors.filter(
    (c) =>
      !disabledIds.includes(c.value) &&
      c.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 dark:text-white cursor-pointer flex justify-between items-center transition-colors ${
          hasError
            ? "border-red-400 focus:border-red-400"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <span
          className={
            !selectedLabel ? "text-gray-400" : "text-gray-800 dark:text-white"
          }
        >
          {selectedLabel || "Search contractor..."}
        </span>
        <FiChevronDown className="text-gray-500 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <div
                  key={c.value}
                  onClick={() => {
                    onChange(c.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 ${value === c.value ? "bg-blue-50 font-medium text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}
                >
                  {c.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-gray-400 text-center">
                No contractors available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDailyLabourSite;

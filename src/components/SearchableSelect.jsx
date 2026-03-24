import { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";

/**
 * SearchableSelect — unified dropdown with search.
 *
 * Usage A (direct state):
 *   <SearchableSelect value={val} onChange={setVal} options={[{value,label}]} />
 *
 * Usage B (react-hook-form via watch/setValue):
 *   <SearchableSelect name="field" watch={watch} setValue={setValue} options={[{value,label}]} />
 *
 * Usage C (with label + error wrapper):
 *   <SearchableSelect label="Gender *" name="gender" watch={watch} setValue={setValue}
 *     options={["Male","Female","Other"]} error={errors.gender} />
 *
 * options: array of strings OR array of {value, label} objects
 */
const SearchableSelect = ({
  // Direct mode
  value: valueProp,
  onChange,
  // RHF mode
  name,
  watch,
  setValue,
  // Common
  options = [],
  placeholder,
  disabled,
  hasError,
  // Wrapper
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);

  // Normalize options to {value, label}
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  // Resolve current value
  const currentValue =
    valueProp !== undefined
      ? valueProp
      : watch
        ? watch(name)
        : "";

  // Resolve onChange handler
  const handleChange = (val) => {
    if (onChange) onChange(val);
    else if (setValue && name) setValue(name, val);
  };

  const selectedLabel =
    normalizedOptions.find((opt) => opt.value === currentValue)?.label || "";

  const showError = hasError || !!error;

  // Calculate fixed dropdown position from trigger element
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const openDropdown = () => {
    if (disabled) return;
    updateDropdownPosition();
    setIsOpen((o) => !o);
  };

  // Keep dropdown anchored to trigger when page scrolls or resizes
  useEffect(() => {
    if (!isOpen) return;
    const handleUpdate = () => updateDropdownPosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trigger = (
    <div
      ref={triggerRef}
      onClick={openDropdown}
      className={`w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white flex justify-between items-center transition-all ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
          : "cursor-pointer"
      } ${
        showError
          ? "border-red-400"
          : isOpen
            ? "border-blue-500 ring-1 ring-blue-500"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
      }`}
    >
      <span className={!selectedLabel ? "text-gray-400" : "text-gray-800 dark:text-white"}>
        {selectedLabel || placeholder || "Select..."}
      </span>
      <FiChevronDown
        size={14}
        className={`text-gray-400 transition-transform shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`}
      />
    </div>
  );

  // Dropdown rendered with fixed positioning to escape overflow/stacking-context issues
  const dropdown = isOpen && (
    <div
      style={{ top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width }}
      className="fixed z-[9999] mt-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-56 flex flex-col overflow-hidden"
    >
      <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
        <FiSearch size={13} className="text-gray-400 shrink-0" />
        <input
          autoFocus
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200"
        />
      </div>
      <div className="overflow-y-auto flex-1">
        {filtered.length > 0 ? (
          filtered.map((opt) => (
            <div
              key={opt.value}
              onMouseDown={(e) => {
                // Use mousedown so it fires before the clickOutside blur
                e.preventDefault();
                handleChange(opt.value);
                setIsOpen(false);
                setSearchTerm("");
              }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                currentValue === opt.value
                  ? "bg-blue-50 dark:bg-blue-900/30 font-medium text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {opt.label}
            </div>
          ))
        ) : (
          <div className="px-3 py-3 text-xs text-gray-400 text-center">
            No results found
          </div>
        )}
      </div>
    </div>
  );

  // If label is provided, wrap with label + error
  if (label !== undefined) {
    return (
      <div className="w-full" ref={wrapperRef}>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        {trigger}
        {dropdown}
        {error && (
          <p className="text-red-500 text-[10px] mt-0.5">{error.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full" ref={wrapperRef}>
      {trigger}
      {dropdown}
    </div>
  );
};

export default SearchableSelect;

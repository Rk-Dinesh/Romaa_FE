import { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const Dropdown = ({ items = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className=" px-4 py-2 rounded-lg "
      >
         <BsThreeDotsVertical />
         
      </button>

      {isOpen && (
        <div className="absolute bg-light-blue right-5 z-20 text-indigo-700 font-medium rounded shadow w-36">
          <ul className="py-2 text-sm text-gray-700">
            {items.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false); 
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-gray-100"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;

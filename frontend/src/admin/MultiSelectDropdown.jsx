import React, { useState, useEffect, useRef } from "react";

const MultiSelectDropdown = ({ options, selectedOptions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const handleSelect = (option) => {
    if (!selectedOptions.includes(option)) {
      onChange([...selectedOptions, option]);
      setInputValue(""); // Clear input after selecting an option
    }
  };

  const handleRemove = (option) => {
    onChange(selectedOptions.filter((item) => item !== option));
  };

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      !inputRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (inputValue) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [inputValue]);

  return (
    <div className="w-full flex flex-col items-center relative">
      <div className="w-full" ref={dropdownRef}>
        <div className="flex flex-col items-center relative">
          <div className="w-full">
            <div className="my-2 p-1 flex border border-gray-200 bg-white rounded">
              <div className="flex flex-auto flex-wrap">
                {selectedOptions.map((option) => (
                  <div
                    key={option}
                    className="flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-full text-teal-700 bg-teal-100 border border-teal-300"
                  >
                    <div className="text-xs font-normal leading-none max-w-full flex-initial">
                      {option}
                    </div>
                    <div className="flex flex-auto flex-row-reverse">
                      <div onClick={() => handleRemove(option)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100%"
                          height="100%"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-x cursor-pointer hover:text-teal-400 rounded-full w-4 h-4 ml-2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    placeholder=""
                    className="bg-transparent p-1 px-2 appearance-none outline-none h-full w-full text-gray-800"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                  />
                </div>
              </div>
              <div className="text-gray-300 w-8 py-1 pl-2 pr-1 border-l flex items-center border-gray-200">
                <button
                  className="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-chevron-up w-4 h-4"
                  >
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {isOpen && (
            <div className="absolute shadow top-full bg-white z-40 w-full left-0 rounded max-h-select overflow-y-auto mt-1">
              <div className="flex flex-col w-full">
                {options
                  .filter((option) =>
                    option.toLowerCase().includes(inputValue.toLowerCase())
                  )
                  .map((option) => (
                    <div
                      key={option}
                      className="cursor-pointer w-full border-gray-100 border-b hover:bg-teal-100"
                      onClick={() => handleSelect(option)}
                    >
                      <div className="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-teal-100">
                        <div className="w-full items-center flex">
                          <div className="mx-2 leading-6">{option}</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiSelectDropdown;

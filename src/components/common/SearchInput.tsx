"use client";
import React from "react";

export type SearchInputProps = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
};

const SearchInput: React.FC<SearchInputProps> = ({ value, placeholder = "Search...", onChange, onSubmit, className }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) onSubmit();
  };
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-11 w-full sm:w-72 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      />
      {onSubmit && (
        <button
          onClick={onSubmit}
          className="h-11 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
        >
          Search
        </button>
      )}
    </div>
  );
};

export default SearchInput;



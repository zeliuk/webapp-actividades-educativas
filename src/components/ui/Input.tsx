import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-3 py-2 rounded-lg border
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-500" : "border-gray-300"}
        `}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
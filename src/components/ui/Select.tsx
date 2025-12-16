import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className = "", disabled, ...props }, ref) => {
    const baseClasses = `
      w-full px-3 py-2 text-sm rounded-md border bg-white
      focus:outline-none focus:ring-2 focus:ring-blue-500
      ${disabled ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""}
      ${error ? "border-red-500" : "border-gray-300"}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1 text-gray-700">
            {label}
          </label>
        )}
        <select
          {...props}
          ref={ref}
          disabled={disabled}
          className={`${baseClasses} ${className}`.replace(/\s+/g, " ").trim()}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

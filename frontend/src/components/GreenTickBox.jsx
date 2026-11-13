import React from "react";
import { Check } from "lucide-react";

/**
 * GreenTickBox: Automotive Audit Style Checkbox
 * When checked, displays a vivid green tick (✓) both on screen and on printed paper.
 */
const GreenTickBox = ({
  checked = false,
  onChange,
  label,
  id,
  size = "md",
  disabled = false,
  className = "",
  labelClassName = "",
}) => {
  const boxSizes = {
    sm: "w-3.5 h-3.5 min-w-[14px]",
    md: "w-4 h-4 min-w-[16px]",
    lg: "w-5 h-5 min-w-[20px]",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-1.5 cursor-pointer select-none group ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={!!checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className={`flex items-center justify-center rounded-[2px] transition-all border ${boxSizes[size] || boxSizes.md} ${
          checked
            ? "border-emerald-600 bg-emerald-50 text-emerald-600 font-black shadow-sm ring-1 ring-emerald-500/30 print:border-emerald-600 print:bg-emerald-50"
            : "border-black bg-white group-hover:border-emerald-500"
        }`}
      >
        {checked && (
          <Check
            className={`${iconSizes[size] || iconSizes.md} text-emerald-600 stroke-[3.5] print:text-emerald-600`}
          />
        )}
      </span>
      {label && (
        <span
          className={`text-[10px] sm:text-xs uppercase font-bold tracking-wide transition-colors ${
            checked ? "text-emerald-900 font-black" : "text-gray-900"
          } ${labelClassName}`}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default GreenTickBox;


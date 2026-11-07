import React from "react";
import logo from "../Assets/SakthiLogo.png";

/**
 * Reusable header for all printable forms.
 * Renders the Sakthi Auto logo, company name,
 * "FOUNDRY DIVISION & MACHINE SHOP" subtitle, and the form title.
 *
 * Props:
 *   title   – form title (e.g. "PROCESS CHANGE REQUISITION FORM")
 *   qfNo    – optional QF number (e.g. "QF/07/MRO-15")
 *   revDate – optional revision date string
 *
 * To use a custom logo, replace src/Assets/logo.png with your SakthiLogo.png
 * (rename to logo.png) or update the import path below.
 */
const FormHeader = ({ title, qfNo, revDate }) => {
  return (
    <div className="grid grid-cols-12 border-b-[1.5px] border-black">
      {/* Left: Logo + Company Name */}
      <div className="col-span-12 sm:col-span-5 border-b-[1.5px] sm:border-b-0 sm:border-r-[1.5px] border-black p-2.5 flex items-center gap-3">
        {/* Logo */}
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
          <img src={logo} alt="Sakthi Auto" className="max-h-11 max-w-full object-contain" />
        </div>

        {/* Company Name */}
        <div className="leading-tight">
          <div className="font-black uppercase text-sm tracking-wider text-gray-900">
            SAKTHI AUTO COMPONENT LIMITED
          </div>
        </div>
      </div>

      {/* Right: Form Title + QF / Rev */}
      <div className="col-span-12 sm:col-span-7 p-3 flex flex-col justify-center items-center sm:items-end text-center sm:text-right bg-white">
        <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-black leading-tight">
          {title}
        </h1>
        {(qfNo || revDate) && (
          <p className="text-[10px] font-mono font-bold text-gray-600 mt-1">
            {qfNo && <span>{qfNo}</span>}
            {revDate && <span className="ml-2">| {revDate}</span>}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormHeader;

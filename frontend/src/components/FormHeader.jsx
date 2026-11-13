import React from "react";
import logo from "../Assets/SakthiLogo.png";

/**
 * Reusable header for all printable forms.
 * Aligns logo and company name on the left,
 * and centers the form title perfectly in the middle box.
 */
const FormHeader = ({ title, qfNo, revDate }) => {
  return (
    <div className="grid grid-cols-12 border-b-[1.5px] border-black bg-white">
      {/* Left Box: Logo + Company Name */}
      <div className="col-span-12 sm:col-span-5 border-b-[1.5px] sm:border-b-0 sm:border-r-[1.5px] border-black p-2.5 flex items-center gap-3">
        {/* Logo */}
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
          <img src={logo} alt="Sakthi Auto" className="max-h-11 max-w-full object-contain" />
        </div>

        {/* Company Name */}
        <div className="leading-tight">
          <div className="font-black uppercase text-xs sm:text-sm tracking-wider text-gray-900">
            SAKTHI AUTO COMPONENT LIMITED
          </div>
        </div>
      </div>

      {/* Right Box: Form Title Centered Perfectly in the Middle */}
      <div className="col-span-12 sm:col-span-7 p-3 flex flex-col justify-center items-center text-center bg-white">
        <h1 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-black leading-tight text-center w-full">
          {title}
        </h1>
        {(qfNo || revDate) && (
          <p className="text-[10px] font-mono font-bold text-gray-600 mt-1 text-center">
            {qfNo && <span>{qfNo}</span>}
            {revDate && <span className="ml-2">| {revDate}</span>}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormHeader;

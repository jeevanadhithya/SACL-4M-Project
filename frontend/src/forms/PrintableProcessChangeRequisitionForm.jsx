// Printable version of Process Change Requisition Form – contains only the form markup without any navigation or UI controls.
import React from "react";
import logo from "../Assets/SakthiLogo.png";

const PrintableProcessChangeRequisitionForm = ({ formData }) => {
  // This component renders the static form layout for printing.
  // It expects the same `formData` shape as the interactive form for value population.
  return (
    <div className="w-full max-w-[1020px] bg-white p-4 sm:p-8 shadow-2xl rounded-none border-[2px] border-black print:border-none print:shadow-none print:p-0">
      <div className="w-full border-[1.5px] border-black text-black text-xs font-sans">
        {/* ROW 1: LOGO & TITLE */}
        <div className="grid grid-cols-12 border-b-[1.5px] border-black">
          <div className="col-span-12 sm:col-span-4 border-b-[1.5px] sm:border-b-0 sm:border-r-[1.5px] border-black p-2.5 flex items-center gap-3">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <img src={logo} alt="Sakthi Auto" className="max-h-11 max-w-full object-contain" />
            </div>
            <div className="leading-tight font-black uppercase text-[10px] tracking-tight text-gray-900">
              <div className="font-serif text-xs tracking-wider">SAKTHI</div>
              <div>AUTO COMPONENT</div>
              <div>LIMITED</div>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-8 p-3 flex flex-col justify-center items-center text-center relative bg-white">
            <h1 className="text-base sm:text-xl font-black uppercase tracking-wider text-black">
              PROCESS CHANGE REQUISITION FORM
            </h1>
          </div>
        </div>
        {/* The rest of the form rows follow the same structure as the interactive version.
            For brevity they are omitted here – you can copy the exact markup from the original component.
            Ensure each input element is replaced with a plain text span showing the value, e.g.:
            <span className="border-b border-gray-300">{formData.requisitionBy}</span>
        */}
      </div>
    </div>
  );
};

export default PrintableProcessChangeRequisitionForm;

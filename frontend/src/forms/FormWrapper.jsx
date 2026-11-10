import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import FormHeader from "../components/FormHeader";
import { ArrowLeft, Save, AlertTriangle, FileDown, Loader } from "lucide-react";

const FormWrapper = ({ title, qfNo, revDate, children, onSave, onPrint, isSaving, isDownloadingPdf }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#2d2d2d] flex flex-col font-sans">
      {/* Navigation header – hidden on print */}
      <div className="print:hidden"><Header /></div>

      <div className="flex-1 flex flex-col items-center p-4 md:p-8 pb-20 w-full max-w-[1700px] mx-auto print:p-0 print:max-w-full">
        
        {/* Navigation & Action Header – hidden on print */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-[#383838] hover:bg-[#4a4a4a] px-5 py-2.5 rounded-xl border border-[#4a4a4a] shadow-md font-bold uppercase tracking-wider text-xs"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="bg-yellow-50 text-yellow-800 border border-yellow-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 shadow-sm">
              <AlertTriangle size={14} className="text-yellow-600" /> {qfNo || "Consultancy Standard"}
            </span>

            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                disabled={isDownloadingPdf}
                className="bg-gray-800 hover:bg-black text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5 border border-gray-700 disabled:opacity-60"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader size={16} className="animate-spin text-[#ff9100]" /> Generating PDF...
                  </>
                ) : (
                  <>
                    <FileDown size={16} /> Print / Export PDF
                  </>
                )}
              </button>
            )}

            {onSave && (
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="bg-[#ff9100] hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5 border border-[#ffaa33] disabled:opacity-50"
              >
                <Save size={16} /> {isSaving ? "Saving..." : "Save Record"}
              </button>
            )}
          </div>
        </div>

        {/* Paper Canvas */}
        <div id="printable-area" className="printable-form w-full bg-white rounded-xl shadow-2xl p-6 sm:p-10 border-4 border-gray-100 text-gray-900 overflow-x-auto print:rounded-none print:shadow-none print:border-none print:p-0">
          
          {/* Official Document Masthead – uses shared FormHeader */}
          <div className="border-2 border-gray-900 mb-8">
            <FormHeader title={title} qfNo={qfNo} revDate={revDate} />
          </div>

          {/* Form Content */}
          {children}

          {/* Footer Quality Note */}
          <div className="mt-8 pt-4 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-wider print:mt-4 print:pt-2">
            <span>Sakthi Auto Quality Management System</span>
            <span>Confidential & Proprietary</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FormWrapper;

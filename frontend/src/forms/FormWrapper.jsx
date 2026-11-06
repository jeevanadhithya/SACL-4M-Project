import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, Printer, Save, AlertTriangle } from "lucide-react";

const FormWrapper = ({ title, qfNo, revDate, children, onSave, onPrint, isSaving }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#2d2d2d] flex flex-col font-sans">
      <Header />

      <div className="flex-1 flex flex-col items-center p-4 md:p-8 pb-20 w-full max-w-[1700px] mx-auto">
        
        {/* Navigation & Action Header */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-[#383838] hover:bg-[#4a4a4a] px-5 py-2.5 rounded-xl border border-[#4a4a4a] shadow-md font-bold uppercase tracking-wider text-xs"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="bg-yellow-50 text-yellow-800 border border-yellow-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 shadow-sm">
              <AlertTriangle size={14} className="text-yellow-600" /> Consultancy Standard
            </span>

            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className="bg-gray-800 hover:bg-black text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5 border border-gray-700"
              >
                <Printer size={16} /> Print / PDF
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
        <div className="w-full bg-white rounded-xl shadow-2xl p-6 sm:p-10 border-4 border-gray-100 text-gray-900 overflow-x-auto">
          
          {/* Official Document Masthead */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-2 border-gray-900 p-4 mb-8 bg-gray-50/50">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-white rounded-lg p-1.5 border border-gray-300 flex items-center justify-center shadow-sm">
                <span className="font-serif font-black text-2xl text-red-600">Ψ</span>
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-wider uppercase leading-tight">
                  Sakthi Auto Component Limited
                </h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Foundry Division & Machine Shop
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wide">
                {title}
              </h2>
              {(qfNo || revDate) && (
                <p className="text-xs font-mono font-bold text-gray-600 mt-0.5">
                  {qfNo && <span>{qfNo}</span>}
                  {revDate && <span className="ml-2">| {revDate}</span>}
                </p>
              )}
            </div>
          </div>

          {/* Form Content */}
          {children}

          {/* Footer Quality Note */}
          <div className="mt-8 pt-4 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Sakthi Auto Quality Management System</span>
            <span>Confidential & Proprietary</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FormWrapper;

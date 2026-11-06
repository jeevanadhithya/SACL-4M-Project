import React from "react";
import { 
  BarChart3, 
  Factory, 
  Layers, 
  ClipboardCheck, 
  SlidersHorizontal, 
  AlertCircle 
} from "lucide-react";

const Dashboard = () => {

  const modules = [
    { id: "daily", name: "Daily Performance Report", icon: BarChart3, count: "Active" },
    { id: "disamatic", name: "DISAmatic Production Report", icon: Factory, count: "6 Lines" },
    { id: "unpoured", name: "Unpoured Mould Details", icon: Layers, count: "Pending" },
    { id: "quality", name: "Moulding Quality Inspection", icon: ClipboardCheck, count: "Verified" },
    { id: "disa-adj", name: "DISA Setting Adjustment", icon: SlidersHorizontal, count: "Standard" },
  ];

  const sampleRows = [
    { line: "DISA - I", shift: "I", moulds: "1,240", status: "Approved", flag: "bg-green-100 text-green-800" },
    { line: "DISA - II", shift: "I", moulds: "1,180", status: "Review Pending", flag: "bg-yellow-100 text-yellow-800 border border-yellow-300" },
    { line: "DISA - III", shift: "II", moulds: "980", status: "Action Required", flag: "bg-orange-100 text-orange-800" },
    { line: "DISA - IV", shift: "II", moulds: "1,310", status: "Approved", flag: "bg-green-100 text-green-800" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-12 relative z-10 w-full max-w-[1920px] mx-auto">
      
      {/* Title */}
      <div className="mb-10 text-center">
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-[0.2em] uppercase mb-3 drop-shadow-md">
          Sakthi Auto Operation Portal
        </h2>
        <div className="w-24 h-1.5 bg-gradient-to-r from-orange-600 via-[#ff9100] to-orange-600 mx-auto rounded-full shadow-[0_0_10px_rgba(255,145,0,0.5)]"></div>
        <p className="mt-3 text-xs uppercase tracking-widest text-gray-400 font-bold">
          High-Precision Foundry & Quality Control Systems
        </p>
      </div>

      {/* Industrial Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full max-w-[1400px] mb-12">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              className="
                group relative flex flex-col items-center justify-center p-6 
                bg-[#383838] border border-[#4a4a4a] rounded-2xl
                shadow-[0_8px_20px_rgba(0,0,0,0.3)]
                hover:border-transparent hover:bg-gradient-to-br hover:from-[#ff9100] hover:to-[#e68200] 
                hover:shadow-[0_15px_30px_rgba(255,145,0,0.3)]
                hover:-translate-y-1.5 active:translate-y-0
                transition-all duration-300 ease-out text-center
              "
            >
              <div className="mb-4 p-4 bg-[#2d2d2d] group-hover:bg-white/20 rounded-full border border-[#4a4a4a] group-hover:border-white/30 shadow-inner transition-colors duration-300">
                <Icon className="w-7 h-7 text-[#ff9100] group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold text-gray-200 group-hover:text-white tracking-wide mb-2">
                {m.name}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#222] group-hover:bg-black/30 text-gray-300 group-hover:text-white border border-[#4a4a4a] group-hover:border-white/20">
                {m.count}
              </span>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-white rounded-t-full group-hover:w-1/3 transition-all duration-300 opacity-50"></div>
            </button>
          );
        })}
      </div>

      {/* High-Contrast White Paper Sheet with Light Yellow Theme */}
      <div className="w-full max-w-[1400px] bg-white rounded-xl shadow-2xl p-8 border-4 border-gray-100 text-gray-900 animate-in fade-in duration-300">
        
        {/* Paper Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b-2 border-gray-200 gap-4">
          <div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-wide flex items-center gap-2">
              <span className="text-orange-500">📋</span> Production & Quality Status Sheet
            </h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
              Active Shift Records • Auto-Calculated Form System
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-yellow-50 text-yellow-800 border border-yellow-300 text-xs font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
              <AlertCircle size={14} className="text-yellow-600" /> Light Yellow Theme Active
            </span>
            <button className="bg-gray-800 hover:bg-black text-white px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow">
              Export PDF
            </button>
          </div>
        </div>

        {/* Tabular Form Sheet */}
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse border border-gray-800 text-sm">
            <thead className="bg-gray-100 text-gray-800 font-bold border-b-2 border-gray-800">
              <tr>
                <th className="border border-gray-800 p-3">Machine / Line</th>
                <th className="border border-gray-800 p-3">Shift</th>
                <th className="border border-gray-800 p-3">Produced Moulds</th>
                <th className="border border-gray-800 p-3">Audit Review</th>
                <th className="border border-gray-800 p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-yellow-50/60 transition-colors">
                  <td className="border border-gray-800 p-3 font-black text-gray-800">{row.line}</td>
                  <td className="border border-gray-800 p-3 font-semibold">{row.shift}</td>
                  <td className="border border-gray-800 p-3 font-mono font-bold">{row.moulds}</td>
                  <td className="border border-gray-800 p-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${row.flag}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="border border-gray-800 p-3 text-center">
                    <button className="bg-[#ff9100] hover:bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors shadow-sm">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold border-t-2 border-gray-800 text-gray-900">
                <td className="border border-gray-800 p-3">TOTAL ACTIVE</td>
                <td className="border border-gray-800 p-3">4 Lines</td>
                <td className="border border-gray-800 p-3 font-mono font-black text-base">4,710</td>
                <td className="border border-gray-800 p-3 text-yellow-800 bg-yellow-100 font-black">1 Pending</td>
                <td className="border border-gray-800 p-3">-</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-gray-200">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl uppercase text-xs tracking-wider transition-all border border-gray-300">
            Cancel
          </button>
          <button className="bg-[#ff9100] hover:bg-orange-500 text-white font-black px-8 py-2.5 rounded-xl uppercase text-xs tracking-wider shadow-lg transition-all border border-orange-400">
            Save Record
          </button>
        </div>

      </div>

      {/* Bottom Glowing Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-[#ff9100] to-orange-600 mt-12 rounded-full shadow-[0_-2px_10px_rgba(255,145,0,0.5)] max-w-[1400px]" />

    </div>
  );
};

export default Dashboard;

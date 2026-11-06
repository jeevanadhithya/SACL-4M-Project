import React, { useState } from "react";
import FormWrapper from "./FormWrapper";

const initialRiskData = [
  // MAN
  { category: "Man", point: "Insufficient Skill", control: "", risk: "LOW", qcd: "", actions: "" },
  { category: "Man", point: "Operator Awareness", control: "", risk: "LOW", qcd: "", actions: "" },
  { category: "Man", point: "Specific Training", control: "", risk: "LOW", qcd: "", actions: "" },
  // METHOD
  { category: "Method", point: "Process Change", control: "", risk: "MEDIUM", qcd: "", actions: "" },
  { category: "Method", point: "Jigs, tool Change", control: "", risk: "LOW", qcd: "", actions: "" },
  { category: "Method", point: "Cycle time", control: "", risk: "LOW", qcd: "", actions: "" },
  { category: "Method", point: "Process Capability", control: "", risk: "LOW", qcd: "", actions: "" },
  { category: "Method", point: "Parameter Change", control: "", risk: "MEDIUM", qcd: "", actions: "" },
  { category: "Method", point: "Document Change", control: "", risk: "LOW", qcd: "", actions: "" },
  { category: "Method", point: "Check method", control: "", risk: "LOW", qcd: "", actions: "" },
  // MACHINE
  { category: "Machine", point: "Capacity", control: "", risk: "LOW", qcd: "", actions: "" },
  { category: "Machine", point: "Spares", control: "", risk: "LOW", qcd: "", actions: "" },
  { category: "Machine", point: "Machine Capability", control: "", risk: "LOW", qcd: "", actions: "" },
  // MATERIAL
  { category: "Material", point: "Availability of material", control: "", risk: "LOW", qcd: "", actions: "" },
  { category: "Material", point: "Availability of Stock", control: "", risk: "LOW", qcd: "", actions: "" },
  // COST
  { category: "Cost", point: "Increase in cost", control: "", risk: "LOW", qcd: "", actions: "" },
  // QUALITY
  { category: "Quality", point: "Cp, Cpk Change", control: "", risk: "LOW", qcd: "", actions: "" },
  // DELIVERY
  { category: "Delivery", point: "Delivery of Modified Parts", control: "", risk: "LOW", qcd: "", actions: "" },
];

const RiskAnalysisCheckSheet = () => {
  const [meta, setMeta] = useState({
    partName: "",
    customer: "",
    partNo: "",
    date: new Date().toISOString().split("T")[0],
    conclusion: "Acceptable",
    overallRisk: "L"
  });

  const [rows, setRows] = useState(initialRiskData);
  const [savedMsg, setSavedMsg] = useState("");

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleSave = () => {
    localStorage.setItem("saved_risk_analysis", JSON.stringify({ meta, rows }));
    setSavedMsg("Risk analysis check sheet saved successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <FormWrapper
      title="RISK ANALYSIS CHECK SHEET"
      qfNo="QF/07/MKT-14"
      revDate="Rev.No.02 dt 13.02.2019"
      onSave={handleSave}
      onPrint={() => window.print()}
    >
      {savedMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm font-bold">
          {savedMsg}
        </div>
      )}

      {/* Meta Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-2 border-gray-900 mb-6 divide-y sm:divide-y-0 sm:divide-x-2 divide-gray-900 bg-gray-50/50">
        <div className="p-3">
          <label className="text-[10px] font-black uppercase text-gray-500 block">Part Name:</label>
          <input
            type="text"
            value={meta.partName}
            onChange={(e) => setMeta({ ...meta, partName: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent"
          />
        </div>
        <div className="p-3">
          <label className="text-[10px] font-black uppercase text-gray-500 block">Customer:</label>
          <input
            type="text"
            value={meta.customer}
            onChange={(e) => setMeta({ ...meta, customer: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent"
          />
        </div>
        <div className="p-3">
          <label className="text-[10px] font-black uppercase text-gray-500 block">Part No:</label>
          <input
            type="text"
            value={meta.partNo}
            onChange={(e) => setMeta({ ...meta, partNo: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent"
          />
        </div>
        <div className="p-3">
          <label className="text-[10px] font-black uppercase text-gray-500 block">Date:</label>
          <input
            type="date"
            value={meta.date}
            onChange={(e) => setMeta({ ...meta, date: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent"
          />
        </div>
      </div>

      {/* Risk Assessment Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border-2 border-gray-900 text-xs">
          <thead className="bg-gray-100 font-bold border-b-2 border-gray-900 text-gray-900 uppercase">
            <tr>
              <th className="border-2 border-gray-900 p-2 text-left w-24">Category</th>
              <th className="border-2 border-gray-900 p-2 text-left w-48">Risk Points</th>
              <th className="border-2 border-gray-900 p-2 text-left w-48">Control Method</th>
              <th className="border-2 border-gray-900 p-2 text-center w-32">Risk Level</th>
              <th className="border-2 border-gray-900 p-2 text-left w-40">Effect on QCD</th>
              <th className="border-2 border-gray-900 p-2 text-left w-48">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-300 hover:bg-yellow-50/40">
                <td className="border-2 border-gray-900 p-2 font-black text-gray-800 bg-gray-50 uppercase">
                  {row.category}
                </td>
                <td className="border-2 border-gray-900 p-2 font-bold text-gray-900">
                  {row.point}
                </td>
                <td className="border-2 border-gray-900 p-1">
                  <input
                    type="text"
                    value={row.control}
                    placeholder="Control procedure / SOP"
                    onChange={(e) => updateRow(idx, "control", e.target.value)}
                    className="w-full p-1 border-b border-gray-200 outline-none text-xs focus:border-[#ff9100]"
                  />
                </td>
                <td className="border-2 border-gray-900 p-1 text-center">
                  <select
                    value={row.risk}
                    onChange={(e) => updateRow(idx, "risk", e.target.value)}
                    className={`font-black p-1 text-[11px] rounded outline-none ${
                      row.risk === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : row.risk === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-800"
                        : row.risk === "LOW"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                    <option value="NA">NA</option>
                  </select>
                </td>
                <td className="border-2 border-gray-900 p-1">
                  <input
                    type="text"
                    value={row.qcd}
                    placeholder="Impact on Quality/Cost/Delivery"
                    onChange={(e) => updateRow(idx, "qcd", e.target.value)}
                    className="w-full p-1 border-b border-gray-200 outline-none text-xs focus:border-[#ff9100]"
                  />
                </td>
                <td className="border-2 border-gray-900 p-1">
                  <input
                    type="text"
                    value={row.actions}
                    placeholder="Action item / mitigation"
                    onChange={(e) => updateRow(idx, "actions", e.target.value)}
                    className="w-full p-1 border-b border-gray-200 outline-none text-xs focus:border-[#ff9100]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Conclusion & Overall Risk Level */}
      <div className="border-2 border-gray-900 p-4 mb-6 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="font-black text-xs uppercase tracking-wider text-gray-900">Conclusion:</span>
          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs">
            <input
              type="radio"
              name="conclusion"
              value="Acceptable"
              checked={meta.conclusion === "Acceptable"}
              onChange={(e) => setMeta({ ...meta, conclusion: e.target.value })}
              className="w-4 h-4 accent-green-600"
            />
            Acceptable
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs">
            <input
              type="radio"
              name="conclusion"
              value="Not Acceptable"
              checked={meta.conclusion === "Not Acceptable"}
              onChange={(e) => setMeta({ ...meta, conclusion: e.target.value })}
              className="w-4 h-4 accent-red-600"
            />
            Not Acceptable
          </label>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-black text-xs uppercase tracking-wider text-gray-900">Overall Risk Level:</span>
          {["H", "M", "L"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setMeta({ ...meta, overallRisk: lvl })}
              className={`w-9 h-9 rounded-lg font-black text-xs border-2 transition-all ${
                meta.overallRisk === lvl
                  ? lvl === "H"
                    ? "bg-red-600 text-white border-red-700 shadow"
                    : lvl === "M"
                    ? "bg-yellow-400 text-yellow-900 border-yellow-500 shadow"
                    : "bg-green-600 text-white border-green-700 shadow"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* CFT Signatures */}
      <div className="border-2 border-gray-900 p-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-3">CFT Members Signature</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="border border-gray-300 p-2 rounded bg-white text-center">
              <span className="text-[10px] font-bold text-gray-400 block mb-1">Sign {num}</span>
              <input
                type="text"
                placeholder="Initial"
                className="w-full text-center text-xs font-bold border-b border-gray-300 outline-none pb-1"
              />
            </div>
          ))}
        </div>
      </div>
    </FormWrapper>
  );
};

export default RiskAnalysisCheckSheet;

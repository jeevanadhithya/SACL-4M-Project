import React, { useState } from "react";
import FormWrapper from "./FormWrapper";

const FeasibilityReport = () => {
  const [formData, setFormData] = useState({
    slNo: "",
    date: new Date().toISOString().split("T")[0],
    fromDept: "",
    toDept: "CFT",
    partName: "",
    partNo: "",
    customer: "",
    categoryOfChange: "Process Modification",
    requirements: [
      { id: "mfg", title: "Manufacturing Process / Product Requirement", desc: "", feasible: true },
      { id: "sys", title: "System Requirement", desc: "", feasible: true },
      { id: "insp", title: "Inspection Requirement", desc: "", feasible: true },
      { id: "other", title: "Any Other Requirement", desc: "", feasible: true },
      { id: "resource", title: "Additional Manufacturing or Inspection or other Resource requirement at Foundry / Machine Shop", desc: "", feasible: true }
    ],
    conclusion: "FEASIBLE",
    cftMembers: Array(6).fill({ sign: "", date: "" }),
    comments: "",
    forwardedTo: ""
  });

  const [savedMsg, setSavedMsg] = useState("");

  const handleSave = () => {
    localStorage.setItem("saved_feasibility_report", JSON.stringify(formData));
    setSavedMsg("Feasibility report saved successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <FormWrapper
      title="FEASIBILITY REPORT FOR CHANGE REQUEST"
      qfNo="QF/07/MRO-02"
      revDate="10/06/2015"
      onSave={handleSave}
      onPrint={() => window.print()}
    >
      {savedMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm font-bold">
          {savedMsg}
        </div>
      )}

      {/* Header Info */}
      <div className="border-2 border-gray-900 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-gray-900 border-b-2 border-gray-900 bg-gray-50/50">
          <div className="p-3">
            <span className="text-[10px] font-black uppercase text-gray-500 block">SL. No (of Change Request):</span>
            <input
              type="text"
              value={formData.slNo}
              onChange={(e) => setFormData({ ...formData, slNo: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent"
              placeholder="e.g. CR-092"
            />
          </div>
          <div className="p-3">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Date:</span>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-gray-900 border-b-2 border-gray-900">
          <div className="p-3">
            <span className="text-[10px] font-black uppercase text-gray-500 block">FROM (Dept Owner):</span>
            <input
              type="text"
              value={formData.fromDept}
              onChange={(e) => setFormData({ ...formData, fromDept: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
              placeholder="Originating Dept"
            />
          </div>
          <div className="p-3">
            <span className="text-[10px] font-black uppercase text-gray-500 block">TO:</span>
            <input
              type="text"
              value={formData.toDept}
              readOnly
              className="w-full font-bold outline-none text-gray-700 bg-gray-100 px-2 py-0.5 rounded cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-2 divide-gray-900">
          <div className="p-3">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Part Name:</span>
            <input
              type="text"
              value={formData.partName}
              onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
          <div className="p-3">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Part No:</span>
            <input
              type="text"
              value={formData.partNo}
              onChange={(e) => setFormData({ ...formData, partNo: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
          <div className="p-3">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Customer:</span>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
        </div>
      </div>

      {/* Category of Change */}
      <div className="mb-6 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-yellow-900">
          Category of Change (as per change request):
        </span>
        <select
          value={formData.categoryOfChange}
          onChange={(e) => setFormData({ ...formData, categoryOfChange: e.target.value })}
          className="bg-white border-2 border-yellow-400 p-2 rounded-lg font-bold text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#ff9100]"
        >
          <option value="Process Modification">Process Modification</option>
          <option value="Tooling / Pattern Change">Tooling / Pattern Change</option>
          <option value="Material Specification">Material Specification</option>
          <option value="Machine Parameter / Setting">Machine Parameter / Setting</option>
          <option value="Drawing Revision">Drawing Revision</option>
        </select>
      </div>

      {/* Requirements Table */}
      <table className="w-full border-collapse border-2 border-gray-900 mb-6 text-sm">
        <thead className="bg-gray-100 font-bold border-b-2 border-gray-900">
          <tr>
            <th className="border-2 border-gray-900 p-3 text-left w-1/4">Requirement Category</th>
            <th className="border-2 border-gray-900 p-3 text-left w-1/2">Requirements of the Change</th>
            <th className="border-2 border-gray-900 p-3 text-center w-1/4">Feasible / Not Feasible</th>
          </tr>
        </thead>
        <tbody>
          {formData.requirements.map((req, idx) => (
            <tr key={req.id} className="border-b border-gray-300 hover:bg-gray-50">
              <td className="border-2 border-gray-900 p-3 font-bold text-xs uppercase text-gray-800">
                {req.title}
              </td>
              <td className="border-2 border-gray-900 p-3">
                <textarea
                  rows="2"
                  placeholder="Detail requirements and capability..."
                  value={req.desc}
                  onChange={(e) => {
                    const newReqs = [...formData.requirements];
                    newReqs[idx].desc = e.target.value;
                    setFormData({ ...formData, requirements: newReqs });
                  }}
                  className="w-full p-2 border border-gray-300 rounded outline-none font-medium text-xs focus:border-[#ff9100]"
                />
              </td>
              <td className="border-2 border-gray-900 p-3 text-center">
                <select
                  value={req.feasible ? "YES" : "NO"}
                  onChange={(e) => {
                    const newReqs = [...formData.requirements];
                    newReqs[idx].feasible = e.target.value === "YES";
                    setFormData({ ...formData, requirements: newReqs });
                  }}
                  className={`p-2 rounded font-black text-xs uppercase border-2 outline-none ${
                    req.feasible ? "bg-green-50 text-green-700 border-green-300" : "bg-red-50 text-red-700 border-red-300"
                  }`}
                >
                  <option value="YES">✓ FEASIBLE</option>
                  <option value="NO">✕ NOT FEASIBLE</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Conclusion */}
      <div className="border-2 border-gray-900 p-4 mb-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-black text-sm uppercase tracking-wider text-gray-900">Conclusion:</span>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer font-black text-sm text-green-800">
            <input
              type="radio"
              name="conclusion"
              value="FEASIBLE"
              checked={formData.conclusion === "FEASIBLE"}
              onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
              className="w-5 h-5 accent-green-600"
            />
            FEASIBLE
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-black text-sm text-red-800">
            <input
              type="radio"
              name="conclusion"
              value="NOT FEASIBLE"
              checked={formData.conclusion === "NOT FEASIBLE"}
              onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
              className="w-5 h-5 accent-red-600"
            />
            NOT FEASIBLE
          </label>
        </div>
      </div>

      {/* CFT Signatures Grid */}
      <div className="border-2 border-gray-900 p-4 mb-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-3">CFT Members Sign / Date</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="border border-gray-300 p-2 rounded bg-white">
              <span className="text-[10px] font-black text-gray-500 block mb-1">Member {num}:</span>
              <input
                type="text"
                placeholder="Signature / Name"
                className="w-full text-xs font-bold border-b border-gray-300 outline-none pb-1 mb-1 focus:border-[#ff9100]"
              />
              <input
                type="date"
                className="w-full text-[10px] font-medium text-gray-600 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Comments & Forwarded To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-gray-900 p-3">
          <span className="text-[10px] font-black uppercase text-gray-500 block mb-1">Comments:</span>
          <textarea
            rows="2"
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none text-xs font-medium focus:border-[#ff9100]"
            placeholder="Additional CFT team notes..."
          />
        </div>
        <div className="border-2 border-gray-900 p-3">
          <span className="text-[10px] font-black uppercase text-gray-500 block mb-1">Forwarded To (Acknowledgement):</span>
          <input
            type="text"
            value={formData.forwardedTo}
            onChange={(e) => setFormData({ ...formData, forwardedTo: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none text-xs font-bold focus:border-[#ff9100]"
            placeholder="Recipient Department / Leader"
          />
        </div>
      </div>
    </FormWrapper>
  );
};

export default FeasibilityReport;

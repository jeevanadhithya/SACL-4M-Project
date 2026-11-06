import React, { useState } from "react";
import FormWrapper from "./FormWrapper";

const ChangeRequisitionForm = () => {
  const [formData, setFormData] = useState({
    requisitionBy: "",
    requisitionerSign: "",
    pcrfNo: "",
    department: "",
    hodSign: "",
    date: new Date().toISOString().split("T")[0],
    customer: "",
    partName: "",
    partNo: "",
    classification: { man: false, machine: false, material: false, method: false },
    changeDetails: [
      { id: 1, particulars: "", currentStatus: "", fd: false, m: false, fem: false },
      { id: 2, particulars: "", currentStatus: "", fd: false, m: false, fem: false },
      { id: 3, particulars: "", currentStatus: "", fd: false, m: false, fem: false },
    ],
    reasonForChange: { product: false, process: false, other: false, comments: "" },
    cftFoundryComments: "",
    cftMachineComments: "",
    foundryLeaderSign: "",
    foundryDate: "",
    machineLeaderSign: "",
    machineDate: "",
    approval: { approved: false, rejected: false, specify: "" },
    approvingAuthority: "PLANT HEAD",
    headSignature: "",
    customerCommunication: ""
  });

  const [savedMsg, setSavedMsg] = useState("");

  const handleSave = () => {
    localStorage.setItem("saved_change_requisition", JSON.stringify(formData));
    setSavedMsg("Requisition saved to local draft!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <FormWrapper
      title="PROCESS CHANGE REQUISITION FORM"
      qfNo="QF/07/MRO-15"
      revDate="Rev.No: 03 dt 04.10.2021"
      onSave={handleSave}
      onPrint={() => window.print()}
    >
      {savedMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm font-bold">
          {savedMsg}
        </div>
      )}

      {/* Primary Details Grid */}
      <div className="border-2 border-gray-900 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-2 divide-gray-900 border-b-2 border-gray-900">
          <div className="p-2">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Requisition By:</label>
            <input
              type="text"
              value={formData.requisitionBy}
              onChange={(e) => setFormData({ ...formData, requisitionBy: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
          <div className="p-2">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Requisitioner Sign:</label>
            <input
              type="text"
              value={formData.requisitionerSign}
              onChange={(e) => setFormData({ ...formData, requisitionerSign: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
          <div className="p-2 bg-yellow-50/70">
            <label className="text-[10px] font-black uppercase text-gray-700 block">PCRF No:</label>
            <input
              type="text"
              placeholder="e.g. PCRF-2026-001"
              value={formData.pcrfNo}
              onChange={(e) => setFormData({ ...formData, pcrfNo: e.target.value })}
              className="w-full font-bold outline-none bg-transparent text-gray-900 border-b border-yellow-300 focus:border-[#ff9100]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-2 divide-gray-900 border-b-2 border-gray-900">
          <div className="p-2">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Department:</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
          <div className="p-2">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Requisitioner HOD Sign:</label>
            <input
              type="text"
              value={formData.hodSign}
              onChange={(e) => setFormData({ ...formData, hodSign: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
          <div className="p-2">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Date:</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-2 divide-gray-900">
          <div className="p-2">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Customer:</label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
          <div className="p-2">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Part Name:</label>
            <input
              type="text"
              value={formData.partName}
              onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
          <div className="p-2">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Part No:</label>
            <input
              type="text"
              value={formData.partNo}
              onChange={(e) => setFormData({ ...formData, partNo: e.target.value })}
              className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100]"
            />
          </div>
        </div>
      </div>

      {/* Classification Checklist */}
      <div className="border-2 border-gray-900 p-3 mb-6 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
        <span className="font-black text-xs uppercase tracking-wider text-gray-800">Classification:</span>
        {["man", "machine", "material", "method"].map((item) => (
          <label key={item} className="flex items-center gap-2 cursor-pointer font-bold uppercase text-xs text-gray-700">
            <input
              type="checkbox"
              checked={formData.classification[item]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  classification: { ...formData.classification, [item]: e.target.checked }
                })
              }
              className="w-4 h-4 accent-[#ff9100]"
            />
            {item}
          </label>
        ))}
      </div>

      {/* Details of Change Required Table */}
      <div className="mb-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-2">Details of Change Required</h4>
        <table className="w-full border-collapse border-2 border-gray-900 text-sm">
          <thead className="bg-gray-100 font-bold border-b-2 border-gray-900">
            <tr>
              <th className="border-2 border-gray-900 p-2 text-left w-1/3">Particulars</th>
              <th className="border-2 border-gray-900 p-2 text-left w-1/3">Current Status</th>
              <th className="border-2 border-gray-900 p-2 text-center w-1/3">Change Required (FD / M / FEM)</th>
            </tr>
          </thead>
          <tbody>
            {formData.changeDetails.map((row, idx) => (
              <tr key={row.id} className="border-b border-gray-300 hover:bg-yellow-50/50">
                <td className="border-2 border-gray-900 p-2">
                  <input
                    type="text"
                    placeholder="Enter change particular / item"
                    value={row.particulars}
                    onChange={(e) => {
                      const newRows = [...formData.changeDetails];
                      newRows[idx].particulars = e.target.value;
                      setFormData({ ...formData, changeDetails: newRows });
                    }}
                    className="w-full outline-none font-semibold"
                  />
                </td>
                <td className="border-2 border-gray-900 p-2">
                  <input
                    type="text"
                    placeholder="Current status / dimension / spec"
                    value={row.currentStatus}
                    onChange={(e) => {
                      const newRows = [...formData.changeDetails];
                      newRows[idx].currentStatus = e.target.value;
                      setFormData({ ...formData, changeDetails: newRows });
                    }}
                    className="w-full outline-none font-semibold"
                  />
                </td>
                <td className="border-2 border-gray-900 p-2 text-center">
                  <div className="flex justify-center gap-4 text-xs font-bold">
                    {["fd", "m", "fem"].map((tag) => (
                      <label key={tag} className="flex items-center gap-1 cursor-pointer uppercase">
                        <input
                          type="checkbox"
                          checked={row[tag]}
                          onChange={(e) => {
                            const newRows = [...formData.changeDetails];
                            newRows[idx][tag] = e.target.checked;
                            setFormData({ ...formData, changeDetails: newRows });
                          }}
                          className="w-3.5 h-3.5 accent-[#ff9100]"
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reason for Change Required */}
      <div className="border-2 border-gray-900 p-4 mb-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-2">Reason for Change Required</h4>
        <div className="flex gap-6 mb-3">
          {["product", "process", "other"].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase">
              <input
                type="checkbox"
                checked={formData.reasonForChange[r]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reasonForChange: { ...formData.reasonForChange, [r]: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-[#ff9100]"
              />
              {r}
            </label>
          ))}
        </div>
        <textarea
          rows="2"
          placeholder="State detailed reason for requisition..."
          value={formData.reasonForChange.comments}
          onChange={(e) =>
            setFormData({
              ...formData,
              reasonForChange: { ...formData.reasonForChange, comments: e.target.value }
            })
          }
          className="w-full p-2 border border-gray-300 rounded outline-none font-medium text-sm focus:border-[#ff9100]"
        />
      </div>

      {/* CFT Comments (Foundry & Machine Shop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-gray-900 mb-6 divide-y md:divide-y-0 md:divide-x-2 divide-gray-900">
        <div className="p-4">
          <h5 className="font-black text-xs uppercase text-gray-800 mb-2">CFT Comments - Foundry</h5>
          <textarea
            rows="3"
            placeholder="Process / Product feasibility notes..."
            value={formData.cftFoundryComments}
            onChange={(e) => setFormData({ ...formData, cftFoundryComments: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none text-sm font-medium mb-3"
          />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-bold text-gray-600 block">CFT Leader Sign:</span>
              <input
                type="text"
                value={formData.foundryLeaderSign}
                onChange={(e) => setFormData({ ...formData, foundryLeaderSign: e.target.value })}
                className="w-full border-b border-gray-400 font-bold outline-none"
              />
            </div>
            <div>
              <span className="font-bold text-gray-600 block">Date:</span>
              <input
                type="date"
                value={formData.foundryDate}
                onChange={(e) => setFormData({ ...formData, foundryDate: e.target.value })}
                className="w-full border-b border-gray-400 font-bold outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <h5 className="font-black text-xs uppercase text-gray-800 mb-2">CFT Comments - Machine Shop</h5>
          <textarea
            rows="3"
            placeholder="Machining / tooling comments..."
            value={formData.cftMachineComments}
            onChange={(e) => setFormData({ ...formData, cftMachineComments: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none text-sm font-medium mb-3"
          />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-bold text-gray-600 block">CFT Leader Sign:</span>
              <input
                type="text"
                value={formData.machineLeaderSign}
                onChange={(e) => setFormData({ ...formData, machineLeaderSign: e.target.value })}
                className="w-full border-b border-gray-400 font-bold outline-none"
              />
            </div>
            <div>
              <span className="font-bold text-gray-600 block">Date:</span>
              <input
                type="date"
                value={formData.machineDate}
                onChange={(e) => setFormData({ ...formData, machineDate: e.target.value })}
                className="w-full border-b border-gray-400 font-bold outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Internal Approval & Customer Communication */}
      <div className="border-2 border-gray-900 p-4 bg-gray-50/70">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-3">Internal Approval</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 font-bold text-xs uppercase">
              <input
                type="checkbox"
                checked={formData.approval.approved}
                onChange={(e) => setFormData({ ...formData, approval: { ...formData.approval, approved: e.target.checked } })}
                className="w-4 h-4 accent-green-600"
              />
              Approved
            </label>
            <label className="flex items-center gap-1.5 font-bold text-xs uppercase">
              <input
                type="checkbox"
                checked={formData.approval.rejected}
                onChange={(e) => setFormData({ ...formData, approval: { ...formData.approval, rejected: e.target.checked } })}
                className="w-4 h-4 accent-red-600"
              />
              Rejected
            </label>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-gray-600 block">Approving Authority:</span>
            <span className="text-sm font-black text-gray-900 uppercase">PLANT HEAD</span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-gray-600 block">Signature:</span>
            <input
              type="text"
              placeholder="Sign / Initial"
              value={formData.headSignature}
              onChange={(e) => setFormData({ ...formData, headSignature: e.target.value })}
              className="w-full border-b border-gray-400 font-bold outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </FormWrapper>
  );
};

export default ChangeRequisitionForm;

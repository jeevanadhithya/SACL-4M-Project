import React, { useState } from "react";
import FormWrapper from "./FormWrapper";

const PpapInitiationForm = () => {
  const [meta, setMeta] = useState({
    from: "",
    department: "",
    date: new Date().toISOString().split("T")[0],
    customer: "",
    partNameNumber: "",
    revNumber: "",
    reason: "",
    requestDate: "",
    requestSign: ""
  });

  const [cftQuestions, setCftQuestions] = useState({
    firstProdRunDate: "",
    qtyProduced: "300 Nos",
    cycleTime: "",
    pfdNo: "",
    pfdRev: "",
    pfdDate: "",
    cpNo: "",
    cpRev: "",
    cpDate: "",
    routingDeviation: false,
    routingDeviationNature: "",
    cpDeviation: false,
    cpDeviationNature: "",
    pswApprovalDate: "",
    submissionRequired: true,
    submissionStatus: "Approved",
    despatchAuthBy: ""
  });

  const [savedMsg, setSavedMsg] = useState("");

  const handleSave = () => {
    localStorage.setItem("saved_ppap_initiation", JSON.stringify({ meta, cftQuestions }));
    setSavedMsg("PPAP Initiation Form saved successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <FormWrapper
      title="PPAP INITIATION FORM CUM PRODUCTION REPORT"
      qfNo="QF/07/MRO-05"
      revDate="20.08.2016"
      onSave={handleSave}
      onPrint={() => window.print()}
    >
      {savedMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm font-bold">
          {savedMsg}
        </div>
      )}

      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-2 border-gray-900 mb-6 divide-y md:divide-y-0 md:divide-x-2 divide-gray-900 bg-gray-50/50">
        <div className="p-2">
          <span className="text-[10px] font-black uppercase text-gray-500 block">From:</span>
          <input
            type="text"
            value={meta.from}
            onChange={(e) => setMeta({ ...meta, from: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent text-xs"
          />
        </div>
        <div className="p-2">
          <span className="text-[10px] font-black uppercase text-gray-500 block">Department:</span>
          <input
            type="text"
            value={meta.department}
            onChange={(e) => setMeta({ ...meta, department: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent text-xs"
          />
        </div>
        <div className="p-2">
          <span className="text-[10px] font-black uppercase text-gray-500 block">To:</span>
          <span className="font-black text-gray-800 text-xs">CFT</span>
        </div>
        <div className="p-2">
          <span className="text-[10px] font-black uppercase text-gray-500 block">Date:</span>
          <input
            type="date"
            value={meta.date}
            onChange={(e) => setMeta({ ...meta, date: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent text-xs"
          />
        </div>
      </div>

      {/* Details of Request */}
      <div className="border-2 border-gray-900 p-4 mb-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-3 border-b pb-1">
          Details of Request
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500 block">Customer:</span>
            <input
              type="text"
              value={meta.customer}
              onChange={(e) => setMeta({ ...meta, customer: e.target.value })}
              className="w-full font-bold border-b border-gray-300 outline-none text-xs focus:border-[#ff9100]"
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500 block">Part Name / Number:</span>
            <input
              type="text"
              value={meta.partNameNumber}
              onChange={(e) => setMeta({ ...meta, partNameNumber: e.target.value })}
              className="w-full font-bold border-b border-gray-300 outline-none text-xs focus:border-[#ff9100]"
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500 block">Rev. Number:</span>
            <input
              type="text"
              value={meta.revNumber}
              onChange={(e) => setMeta({ ...meta, revNumber: e.target.value })}
              className="w-full font-bold border-b border-gray-300 outline-none text-xs focus:border-[#ff9100]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Reason:</span>
            <input
              type="text"
              value={meta.reason}
              onChange={(e) => setMeta({ ...meta, reason: e.target.value })}
              className="w-full font-bold border-b border-gray-300 outline-none text-xs focus:border-[#ff9100]"
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500 block">Signature:</span>
            <input
              type="text"
              value={meta.requestSign}
              onChange={(e) => setMeta({ ...meta, requestSign: e.target.value })}
              className="w-full font-bold border-b border-gray-300 outline-none text-xs focus:border-[#ff9100]"
            />
          </div>
        </div>
      </div>

      {/* For Use of CFT Questionnaire */}
      <div className="border-2 border-gray-900 mb-6 divide-y divide-gray-300 text-xs">
        <div className="bg-gray-100 p-2 font-black uppercase text-gray-800">For Use of CFT</div>

        <div className="grid grid-cols-1 md:grid-cols-2 p-3 gap-4 items-center">
          <span className="font-bold text-gray-800">1) Date of first production run:</span>
          <input
            type="date"
            value={cftQuestions.firstProdRunDate}
            onChange={(e) => setCftQuestions({ ...cftQuestions, firstProdRunDate: e.target.value })}
            className="p-1 border border-gray-300 rounded outline-none font-bold text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 p-3 gap-4 items-center">
          <span className="font-bold text-gray-800">2) Quantity Produced (300 Nos or 1 Day Production qty):</span>
          <input
            type="text"
            value={cftQuestions.qtyProduced}
            onChange={(e) => setCftQuestions({ ...cftQuestions, qtyProduced: e.target.value })}
            className="p-1 border border-gray-300 rounded outline-none font-bold text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 p-3 gap-4 items-center">
          <span className="font-bold text-gray-800">3) Cycle time / Production Rate:</span>
          <input
            type="text"
            placeholder="e.g. 45 sec / mould"
            value={cftQuestions.cycleTime}
            onChange={(e) => setCftQuestions({ ...cftQuestions, cycleTime: e.target.value })}
            className="p-1 border border-gray-300 rounded outline-none font-bold text-xs"
          />
        </div>

        <div className="p-3">
          <span className="font-bold text-gray-800 block mb-2">4) Process Flow Diagram:</span>
          <div className="grid grid-cols-3 gap-4">
            <input type="text" placeholder="Number" value={cftQuestions.pfdNo} onChange={e => setCftQuestions({...cftQuestions, pfdNo: e.target.value})} className="p-1 border rounded text-xs" />
            <input type="text" placeholder="Rev No" value={cftQuestions.pfdRev} onChange={e => setCftQuestions({...cftQuestions, pfdRev: e.target.value})} className="p-1 border rounded text-xs" />
            <input type="date" value={cftQuestions.pfdDate} onChange={e => setCftQuestions({...cftQuestions, pfdDate: e.target.value})} className="p-1 border rounded text-xs" />
          </div>
        </div>

        <div className="p-3">
          <span className="font-bold text-gray-800 block mb-2">5) Control Plan:</span>
          <div className="grid grid-cols-3 gap-4">
            <input type="text" placeholder="Number" value={cftQuestions.cpNo} onChange={e => setCftQuestions({...cftQuestions, cpNo: e.target.value})} className="p-1 border rounded text-xs" />
            <input type="text" placeholder="Rev No" value={cftQuestions.cpRev} onChange={e => setCftQuestions({...cftQuestions, cpRev: e.target.value})} className="p-1 border rounded text-xs" />
            <input type="date" value={cftQuestions.cpDate} onChange={e => setCftQuestions({...cftQuestions, cpDate: e.target.value})} className="p-1 border rounded text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 p-3 gap-4 items-center">
          <span className="font-bold text-gray-800">6) Any Deviations to process flow routing:</span>
          <div className="flex gap-4">
            {["Yes", "No"].map(c => (
              <label key={c} className="flex items-center gap-1 font-bold">
                <input type="radio" name="devRouting" checked={(c === "Yes") === cftQuestions.routingDeviation} onChange={() => setCftQuestions({...cftQuestions, routingDeviation: c === "Yes"})} />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 p-3 gap-4 items-center">
          <span className="font-bold text-gray-800">8) Any Deviations to Control Plan:</span>
          <div className="flex gap-4">
            {["Yes", "No"].map(c => (
              <label key={c} className="flex items-center gap-1 font-bold">
                <input type="radio" name="devCp" checked={(c === "Yes") === cftQuestions.cpDeviation} onChange={() => setCftQuestions({...cftQuestions, cpDeviation: c === "Yes"})} />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 p-3 gap-4 items-center bg-yellow-50/50">
          <span className="font-bold text-gray-800">10) PSW internal approval on:</span>
          <input
            type="date"
            value={cftQuestions.pswApprovalDate}
            onChange={(e) => setCftQuestions({ ...cftQuestions, pswApprovalDate: e.target.value })}
            className="p-1 border border-gray-300 rounded font-bold text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 p-3 gap-4 items-center">
          <span className="font-bold text-gray-800">13) Product Despatch Authorisation By:</span>
          <input
            type="text"
            placeholder="Authorized Signatory Name / Dept"
            value={cftQuestions.despatchAuthBy}
            onChange={(e) => setCftQuestions({ ...cftQuestions, despatchAuthBy: e.target.value })}
            className="p-1 border border-gray-300 rounded font-bold text-xs"
          />
        </div>
      </div>

      {/* Approved by Core Team */}
      <div className="border-2 border-gray-900 p-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-3">Approved By Core Team</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {[1, 2, 3].map(num => (
            <div key={num} className="border border-gray-300 p-3 rounded bg-white space-y-1.5">
              <span className="font-black text-gray-500 block mb-1">Core Member {num}</span>
              <input type="text" placeholder="Sign" className="w-full border-b outline-none text-xs font-bold" />
              <input type="text" placeholder="Name" className="w-full border-b outline-none text-xs" />
              <input type="date" className="w-full text-[10px] text-gray-600 outline-none" />
            </div>
          ))}
        </div>
      </div>
    </FormWrapper>
  );
};

export default PpapInitiationForm;

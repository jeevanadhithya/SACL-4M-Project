import React, { useState } from "react";
import FormWrapper from "./FormWrapper";
import GreenTickBox from "../components/GreenTickBox";

const APQP_ACTIVITIES = [
  { id: 1, name: "Customer Enquiry", app: "AA, A" },
  { id: 2, name: "Receipt of 2D Drawing & 3D Model", app: "AA, A, B, C" },
  { id: 3, name: "Preliminary Assessment", app: "AA, A" },
  { id: 4, name: "Product Feasibility", app: "AA, A, B, C" },
  { id: 5, name: "Clarification required from customer (if any)", app: "AA, A, B, C" },
  { id: 6, name: "Cost Estimation", app: "AA, A, B, C" },
  { id: 7, name: "Quote submission", app: "AA, A, B, C" },
  { id: 8, name: "LOI / Purchase order", app: "AA, A, B, C" },
  { id: 9, name: "Team Feasibility Commitment", app: "AA, A" },
  { id: 10, name: "Contract review & Order acceptance", app: "AA, A, B, C" },
];

const WEEKS = ["I st Wk", "II nd Wk", "III rd Wk", "IV th Wk"];

const TimingPlan = () => {
  const [meta, setMeta] = useState({
    typeAA: true,
    typeA: false,
    typeB: false,
    typeC: false,
    projectName: "",
    partNo: "",
    preparedDate: new Date().toISOString().split("T")[0],
    lastRevDate: "",
    rev: "05",
    customer: "",
    productName: "",
    pageNo: "Page 1 of 15",
    // Reviewed By
    initialPlan: true,
    actualStatus: false,
    remainingActivities: false,
    cftMembers: Array(6).fill(""),
    remarks: "",
    goNextPhase: "Yes",
    cftLeaderSign: "",
    plantHeadSign: "",
  });

  const [savedMsg, setSavedMsg] = useState("");
  const [isDownloadingPdf] = useState(false);

  const updateMeta = (field, value) => {
    setMeta((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    localStorage.setItem("saved_timing_plan", JSON.stringify(meta));

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${apiUrl}/api/timing-plan/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          recordKey: meta.projectName || meta.partNo || `TP-${Date.now()}`,
          partName: meta.productName,
          customer: meta.customer,
          formData: meta,
        }),
      });

      if (!response.ok) throw new Error("Server save failed");
      setSavedMsg("Timing plan saved successfully to database!");
    } catch (err) {
      setSavedMsg("Saved locally in browser storage (Backend server offline).");
    }
    setTimeout(() => setSavedMsg(""), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <FormWrapper
      title="TIMING PLAN"
      qfNo="QF/01/MKT-08"
      revDate="Rev.No: 05 dt: 01.12.2024"
      onSave={handleSave}
      onPrint={handlePrint}
      isDownloadingPdf={isDownloadingPdf}
    >
      {savedMsg && (
        <div className="mb-3 p-3 bg-green-100 border border-green-500 text-green-800 rounded text-xs font-bold print:hidden">
          {savedMsg}
        </div>
      )}

      {/* Top Classification Checkboxes Row matching scanned image top right */}
      <div className="border-b-[1.5px] border-black p-2 bg-gray-50 flex flex-wrap items-center justify-end gap-6 text-xs font-bold">
        <div className="flex items-center gap-3">
          <GreenTickBox
            id="tp_aa"
            label="AA"
            size="sm"
            checked={meta.typeAA}
            onChange={(e) => updateMeta("typeAA", e.target.checked)}
          />
          <GreenTickBox
            id="tp_a"
            label="A"
            size="sm"
            checked={meta.typeA}
            onChange={(e) => updateMeta("typeA", e.target.checked)}
          />
          <span className="text-[11px] font-black uppercase text-gray-800 ml-1">New Product</span>
        </div>
        <div className="h-4 w-px bg-black hidden sm:block"></div>
        <div className="flex items-center gap-3">
          <GreenTickBox
            id="tp_b"
            label="B"
            size="sm"
            checked={meta.typeB}
            onChange={(e) => updateMeta("typeB", e.target.checked)}
          />
          <GreenTickBox
            id="tp_c"
            label="C"
            size="sm"
            checked={meta.typeC}
            onChange={(e) => updateMeta("typeC", e.target.checked)}
          />
          <span className="text-[11px] font-black uppercase text-gray-800 ml-1">Process/Product Change</span>
        </div>
      </div>

      {/* Project & Part Details Grid */}
      <div className="border-b-[1.5px] border-black text-xs">
        <div className="grid grid-cols-12 border-b-[1.5px] border-black divide-x-[1.5px] divide-black">
          <div className="col-span-12 sm:col-span-4 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Project Name:</span>
            <input
              type="text"
              value={meta.projectName}
              onChange={(e) => updateMeta("projectName", e.target.value)}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-12 sm:col-span-3 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Drg.No / Part No :</span>
            <input
              type="text"
              value={meta.partNo}
              onChange={(e) => updateMeta("partNo", e.target.value)}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-12 sm:col-span-3 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Prepared Date:</span>
            <input
              type="date"
              value={meta.preparedDate}
              onChange={(e) => updateMeta("preparedDate", e.target.value)}
              className="w-full outline-none bg-transparent text-[10px]"
            />
          </div>
          <div className="col-span-12 sm:col-span-2 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Rev:</span>
            <input
              type="text"
              value={meta.rev}
              onChange={(e) => updateMeta("rev", e.target.value)}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 divide-x-[1.5px] divide-black">
          <div className="col-span-12 sm:col-span-4 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Customer:</span>
            <input
              type="text"
              value={meta.customer}
              onChange={(e) => updateMeta("customer", e.target.value)}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-12 sm:col-span-5 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Product Name:</span>
            <input
              type="text"
              value={meta.productName}
              onChange={(e) => updateMeta("productName", e.target.value)}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-12 sm:col-span-3 p-1.5 flex items-center justify-between">
            <span className="font-bold uppercase text-[10px]">Page:</span>
            <span className="font-mono font-bold text-gray-800 text-[10px]">{meta.pageNo}</span>
          </div>
        </div>
      </div>

      {/* Major Milestones Summary Table */}
      <div className="overflow-x-auto border-b-[1.5px] border-black">
        <table className="w-full border-collapse text-[10px] text-center min-w-[900px]">
          <thead className="bg-gray-100 font-bold border-b-[1.5px] border-black text-black">
            <tr>
              <th className="border-r-[1.5px] border-black p-1 text-left w-64" rowSpan="2">
                Activity (Major milestones)
              </th>
              {[1, 2, 3, 4, 5, 6].map((m) => (
                <th key={m} className="border-r-[1.5px] border-black p-0.5" colSpan="4">
                  Month : {m}
                </th>
              ))}
              <th className="p-1 w-24" rowSpan="2">
                Remarks
              </th>
            </tr>
            <tr className="bg-gray-50 border-t border-black text-[8px]">
              {[1, 2, 3, 4, 5, 6].map((m) =>
                WEEKS.map((wk, wIdx) => (
                  <th key={`${m}-${wIdx}`} className="border-r border-black p-0.5 w-7">
                    {wk.split(" ")[0]}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {[
              "Customer Time line",
              "Internal time line",
              "Tier 2 (Sub supplier) Time line if applicable",
            ].map((label, idx) => (
              <tr key={idx} className="border-b border-black hover:bg-yellow-50/20">
                <td className="border-r-[1.5px] border-black p-1.5 text-left font-bold text-black bg-white">
                  {label}
                </td>
                {Array(24)
                  .fill(0)
                  .map((_, cIdx) => (
                    <td key={cIdx} className="border-r border-black p-0.5">
                      <input type="checkbox" className="w-3 h-3 accent-[#16A34A]" />
                    </td>
                  ))}
                <td className="p-0.5">
                  <input type="text" className="w-full text-[9px] outline-none text-center bg-transparent" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* APQP Phases Gantt Matrix */}
      <div className="overflow-x-auto border-b-[1.5px] border-black">
        <table className="w-full border-collapse text-[10px] text-center min-w-[900px]">
          <thead className="bg-gray-100 font-bold border-b-[1.5px] border-black text-black">
            <tr>
              <th className="border-r-[1.5px] border-black p-1 w-16" rowSpan="2">
                APQP Phases
              </th>
              <th className="border-r-[1.5px] border-black p-1 text-left w-56" rowSpan="2">
                Activity
              </th>
              <th className="border-r-[1.5px] border-black p-1 w-20" rowSpan="2">
                Applicability
              </th>
              <th className="border-r-[1.5px] border-black p-0.5 w-8" rowSpan="2">
                P/A
              </th>
              {[1, 2, 3, 4, 5, 6].map((m) => (
                <th key={m} className="border-r-[1.5px] border-black p-0.5" colSpan="4">
                  Month : {m}
                </th>
              ))}
              <th className="p-1 w-24" rowSpan="2">
                Remarks
              </th>
            </tr>
            <tr className="bg-gray-50 border-t border-black text-[8px]">
              {[1, 2, 3, 4, 5, 6].map((m) =>
                WEEKS.map((wk, wIdx) => (
                  <th key={`${m}-${wIdx}`} className="border-r border-black p-0.5 w-7">
                    {wk.split(" ")[0]}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {APQP_ACTIVITIES.map((act, idx) => (
              <React.Fragment key={act.id}>
                {/* Plan (P) Row */}
                <tr className="border-b border-gray-400 hover:bg-yellow-50/20">
                  {idx === 0 && (
                    <td
                      className="border-r-[1.5px] border-black p-1 font-black text-black bg-white align-middle"
                      rowSpan={APQP_ACTIVITIES.length * 2}
                    >
                      I Phase
                    </td>
                  )}
                  <td className="border-r-[1.5px] border-black p-1 text-left font-bold text-black" rowSpan="2">
                    {act.name}
                  </td>
                  <td className="border-r-[1.5px] border-black p-1 font-mono text-[9px] text-gray-700" rowSpan="2">
                    {act.app}
                  </td>
                  <td className="border-r-[1.5px] border-black p-0.5 font-bold text-blue-700 bg-blue-50/50">
                    P
                  </td>
                  {Array(24)
                    .fill(0)
                    .map((_, w) => (
                      <td key={w} className="border-r border-gray-300 p-0.5">
                        <input type="checkbox" className="w-3 h-3 accent-blue-600" />
                      </td>
                    ))}
                  <td className="p-0.5 border-l border-black" rowSpan="2">
                    <input type="text" placeholder="Remarks" className="w-full text-[9px] outline-none bg-transparent" />
                  </td>
                </tr>

                {/* Actual (A) Row */}
                <tr className="border-b-[1.5px] border-black hover:bg-yellow-50/20">
                  <td className="border-r-[1.5px] border-black p-0.5 font-bold text-green-700 bg-green-50/50">
                    A
                  </td>
                  {Array(24)
                    .fill(0)
                    .map((_, w) => (
                      <td key={w} className="border-r border-gray-300 p-0.5">
                        <input type="checkbox" className="w-3 h-3 accent-[#16A34A]" />
                      </td>
                    ))}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* REVIEWED BY Section */}
      <div className="border-b-[1.5px] border-black p-2 bg-gray-50 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
        <div className="flex items-center gap-6">
          <span className="font-black uppercase text-[10px] tracking-wider text-black">REVIEWED BY :</span>
          <GreenTickBox
            id="rev_initial"
            label="Initial Plan"
            checked={meta.initialPlan}
            onChange={(e) => updateMeta("initialPlan", e.target.checked)}
          />
          <GreenTickBox
            id="rev_actual"
            label="Actual status"
            checked={meta.actualStatus}
            onChange={(e) => updateMeta("actualStatus", e.target.checked)}
          />
          <GreenTickBox
            id="rev_rem"
            label="Plan for the remaining activities"
            checked={meta.remainingActivities}
            onChange={(e) => updateMeta("remainingActivities", e.target.checked)}
          />
        </div>
        <div className="text-[10px] text-red-600 font-mono font-bold">
          *** =&gt; Critical process, it will affect the customer milestone
        </div>
      </div>

      {/* CFT Signatures and Plant Head Approval Grid – generous signing space */}
      <div className="grid grid-cols-12 divide-x-[1.5px] divide-black text-xs">
        {/* CFT Members 1-6 */}
        <div className="col-span-12 sm:col-span-4 p-2.5 bg-white">
          <span className="font-black uppercase text-[10px] tracking-wider block mb-1.5 text-gray-800">
            CFT Members :
          </span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col justify-between p-1 border border-gray-200 rounded min-h-[44px] bg-gray-50/40">
                <span className="font-bold text-[9px] text-gray-700">{i + 1}. Member Sign</span>
                <div className="h-5 border-b border-black mt-1"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Remarks & Go Next Phase */}
        <div className="col-span-12 sm:col-span-4 p-2.5 flex flex-col justify-between bg-white">
          <div>
            <span className="font-black uppercase text-[10px] tracking-wider block mb-1 text-gray-800">Remarks :</span>
            <textarea
              rows="2"
              value={meta.remarks}
              onChange={(e) => updateMeta("remarks", e.target.value)}
              className="w-full text-xs outline-none border border-gray-300 rounded p-1.5 bg-transparent resize-none focus:border-black"
              placeholder="Milestone and feasibility remarks..."
            />
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
            <span className="font-black uppercase text-[10px] text-black">Go for next Phase :</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1 font-bold cursor-pointer text-xs">
                <input
                  type="radio"
                  name="goPhase"
                  value="Yes"
                  checked={meta.goNextPhase === "Yes"}
                  onChange={(e) => updateMeta("goNextPhase", e.target.value)}
                  className="accent-[#16A34A] w-3.5 h-3.5"
                />
                Yes
              </label>
              <label className="flex items-center gap-1 font-bold cursor-pointer text-xs">
                <input
                  type="radio"
                  name="goPhase"
                  value="No"
                  checked={meta.goNextPhase === "No"}
                  onChange={(e) => updateMeta("goNextPhase", e.target.value)}
                  className="accent-red-600 w-3.5 h-3.5"
                />
                No
              </label>
            </div>
          </div>
        </div>

        {/* Signatures: CFT Leader & Plant Head */}
        <div className="col-span-12 sm:col-span-4 p-2.5 flex flex-col justify-between divide-y divide-gray-200 bg-white">
          <div className="pb-2 min-h-[55px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase text-[10px] tracking-wider text-black">CFT Leader</span>
              <span className="text-[8px] text-gray-400 italic print:hidden">(Physical Sign)</span>
            </div>
            <div className="h-6 border-b border-black mt-1"></div>
          </div>
          <div className="pt-2 min-h-[55px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase text-[10px] tracking-wider text-black">Plant Head</span>
              <span className="text-[8px] text-gray-400 italic print:hidden">(Physical Sign)</span>
            </div>
            <div className="h-6 border-b border-black mt-1"></div>
          </div>
        </div>
      </div>

      {/* Footer line */}
      <div className="flex justify-between items-center text-[10px] font-bold text-gray-800 p-1 border-t-[1.5px] border-black font-mono">
        <span>QF / 01 / MKT – 08, Rev.No: 05 dt: 01.12.2024</span>
        <span>Page 1 of 15</span>
      </div>
    </FormWrapper>
  );
};

export default TimingPlan;

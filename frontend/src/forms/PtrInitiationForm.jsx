import React, { useState } from "react";
import FormWrapper from "./FormWrapper";
import GreenTickBox from "../components/GreenTickBox";

const CORE_TEAMS = [
  "Production",
  "Quality",
  "Tooling & Fixtures",
  "Marketing",
  "Maintenance",
];

const PtrInitiationForm = () => {
  const [meta, setMeta] = useState({
    from: "",
    department: "",
    date: new Date().toISOString().split("T")[0],
    customer: "",
    partNameNumber: "",
    revNumber: "",
    reason: "",
    requestDate: "",
    requestSign: "",
  });

  const [cftData, setCftData] = useState([
    { id: 1, desc: "If required", p1: "Yes", p2: "Yes", p3: "Yes" },
    { id: 2, desc: "Date of Production run (if required)", p1: "", p2: "", p3: "" },
    { id: 3, desc: "Quantity Produced / customer specified qty", p1: "5 Nos", p2: "25 Nos", p3: "50 Nos" },
    { id: 4, desc: "Meet the drawing requirement / customer specific requirement", p1: "Yes", p2: "Yes", p3: "Yes" },
    { id: 5, desc: "Sample submission required to Customer", p1: "Yes", p2: "Yes", p3: "Yes" },
    { id: 6, desc: "If required, sample submitted Date", p1: "", p2: "", p3: "" },
    { id: 7, desc: "Status of the samples submitted", p1: "OK", p2: "OK", p3: "OK" },
  ]);

  const [actionPlans, setActionPlans] = useState({
    ptr1: "",
    ptr2: "",
    ptr3: "",
  });

  const [coreTeamApproval, setCoreTeamApproval] = useState(
    CORE_TEAMS.reduce((acc, team) => {
      acc[team] = { ok: true, notOk: false, sign: "", date: "" };
      return acc;
    }, {})
  );

  const [bottomInfo, setBottomInfo] = useState({
    brakePointDate: "",
    invoiceDetails: "",
    identification: "",
  });

  const [savedMsg, setSavedMsg] = useState("");
  const [isDownloadingPdf] = useState(false);

  const handleSave = async () => {
    localStorage.setItem(
      "saved_ptr_initiation",
      JSON.stringify({ meta, cftData, actionPlans, coreTeamApproval, bottomInfo })
    );

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${apiUrl}/api/ptr-initiation/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          recordKey: meta.partNameNumber || meta.date || `PTR-${Date.now()}`,
          customer: meta.customer,
          formData: { meta, cftData, actionPlans, coreTeamApproval, bottomInfo },
        }),
      });

      if (!response.ok) throw new Error("Server save failed");
      setSavedMsg("PTR Initiation Form saved successfully to database!");
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
      title="PTR INITIATION FORM"
      qfNo="QF/07/MRO-16"
      revDate="14.08.2017"
      onSave={handleSave}
      onPrint={handlePrint}
      isDownloadingPdf={isDownloadingPdf}
    >
      {savedMsg && (
        <div className="mb-3 p-3 bg-green-100 border border-green-500 text-green-800 rounded text-xs font-bold print:hidden">
          {savedMsg}
        </div>
      )}

      {/* From / Dept / To / Date Grid */}
      <div className="border-b-[1.5px] border-black text-xs">
        <div className="grid grid-cols-12 divide-x-[1.5px] divide-black">
          <div className="col-span-12 sm:col-span-3 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">FROM :</span>
            <input
              type="text"
              value={meta.from}
              onChange={(e) => setMeta({ ...meta, from: e.target.value })}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-12 sm:col-span-3 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">DEPT :</span>
            <input
              type="text"
              value={meta.department}
              onChange={(e) => setMeta({ ...meta, department: e.target.value })}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-12 sm:col-span-3 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">TO :</span>
            <span className="font-black text-black">CFT</span>
          </div>
          <div className="col-span-12 sm:col-span-3 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">DATE :</span>
            <input
              type="date"
              value={meta.date}
              onChange={(e) => setMeta({ ...meta, date: e.target.value })}
              className="w-full outline-none bg-transparent text-[10px]"
            />
          </div>
        </div>
      </div>

      {/* DETAILS OF REQUEST Header */}
      <div className="border-b-[1.5px] border-black bg-gray-100 px-2 py-1 text-center font-black uppercase text-[10px] tracking-wider text-black">
        DETAILS OF REQUEST
      </div>

      {/* Request Details 2-row grid */}
      <div className="border-b-[1.5px] border-black text-xs">
        <div className="grid grid-cols-12 border-b-[1.5px] border-black divide-x-[1.5px] divide-black">
          <div className="col-span-12 sm:col-span-4 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Customer :</span>
            <input
              type="text"
              value={meta.customer}
              onChange={(e) => setMeta({ ...meta, customer: e.target.value })}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-12 sm:col-span-5 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Part Name / Number :</span>
            <input
              type="text"
              value={meta.partNameNumber}
              onChange={(e) => setMeta({ ...meta, partNameNumber: e.target.value })}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-12 sm:col-span-3 p-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Rev. Number :</span>
            <input
              type="text"
              value={meta.revNumber}
              onChange={(e) => setMeta({ ...meta, revNumber: e.target.value })}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 divide-x-[1.5px] divide-black">
          <div className="col-span-12 sm:col-span-8 p-2 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Reason :</span>
            <input
              type="text"
              value={meta.reason}
              onChange={(e) => setMeta({ ...meta, reason: e.target.value })}
              className="w-full outline-none bg-transparent"
              placeholder="Reason for PTR..."
            />
          </div>
          <div className="col-span-12 sm:col-span-4 p-2 flex flex-col justify-between min-h-[48px]">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] whitespace-nowrap">Signature :</span>
              <span className="text-[8px] text-gray-400 italic print:hidden">(Physical Sign)</span>
            </div>
            <div className="h-6 border-b border-black mt-1"></div>
          </div>
        </div>
      </div>

      {/* FOR USE OF CFT Section Header */}
      <div className="border-b-[1.5px] border-black bg-gray-100 px-2 py-1 text-center font-black uppercase text-[10px] tracking-wider text-black">
        FOR USE OF CFT
      </div>

      {/* CFT Table (7 Rows across PTR 1, PTR 2, PTR 3) */}
      <div className="overflow-x-auto border-b-[1.5px] border-black">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-gray-50 font-black border-b-[1.5px] border-black text-black uppercase text-[10px]">
            <tr>
              <th className="border-r-[1.5px] border-black p-1.5 w-12 text-center">S.No</th>
              <th className="border-r-[1.5px] border-black p-1.5 text-left">Description</th>
              <th className="border-r-[1.5px] border-black p-1.5 w-32 text-center bg-blue-50/40">PTR 1</th>
              <th className="border-r-[1.5px] border-black p-1.5 w-32 text-center bg-green-50/40">PTR 2</th>
              <th className="p-1.5 w-32 text-center bg-yellow-50/40">PTR 3</th>
            </tr>
          </thead>
          <tbody>
            {cftData.map((row, idx) => (
              <tr key={row.id} className="border-b border-black hover:bg-yellow-50/20">
                <td className="border-r-[1.5px] border-black p-1.5 text-center font-bold text-gray-700 bg-white">
                  {row.id}
                </td>
                <td className="border-r-[1.5px] border-black p-1.5 font-bold text-black bg-white">
                  {row.desc}
                </td>
                <td className="border-r-[1.5px] border-black p-1 text-center bg-white">
                  <input
                    type="text"
                    value={row.p1}
                    onChange={(e) => {
                      const updated = [...cftData];
                      updated[idx].p1 = e.target.value;
                      setCftData(updated);
                    }}
                    className="w-full text-center font-bold text-xs outline-none bg-transparent"
                  />
                </td>
                <td className="border-r-[1.5px] border-black p-1 text-center bg-white">
                  <input
                    type="text"
                    value={row.p2}
                    onChange={(e) => {
                      const updated = [...cftData];
                      updated[idx].p2 = e.target.value;
                      setCftData(updated);
                    }}
                    className="w-full text-center font-bold text-xs outline-none bg-transparent"
                  />
                </td>
                <td className="p-1 text-center bg-white">
                  <input
                    type="text"
                    value={row.p3}
                    onChange={(e) => {
                      const updated = [...cftData];
                      updated[idx].p3 = e.target.value;
                      setCftData(updated);
                    }}
                    className="w-full text-center font-bold text-xs outline-none bg-transparent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comments / Action Plans for PTR 1, 2, 3 */}
      <div className="border-b-[1.5px] border-black text-xs">
        <div className="px-2 py-1 bg-gray-50 border-b border-gray-300 font-bold text-[10px] uppercase text-black">
          Comments / Action plans (if any) :
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-[1.5px] divide-black">
          {["ptr1", "ptr2", "ptr3"].map((pKey, i) => (
            <div key={pKey} className="p-2">
              <span className="font-bold text-[10px] uppercase text-gray-700 block mb-1">
                PTR {i + 1} :
              </span>
              <textarea
                rows="2"
                value={actionPlans[pKey]}
                onChange={(e) => setActionPlans({ ...actionPlans, [pKey]: e.target.value })}
                className="w-full text-xs outline-none resize-none bg-transparent p-1 border border-gray-200"
                placeholder={`Action plan for PTR ${i + 1}...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* APPROVED BY CORE TEAM Header */}
      <div className="border-b-[1.5px] border-black bg-gray-100 px-2 py-1 text-center font-black uppercase text-[10px] tracking-wider text-black">
        APPROVED BY CORE TEAM
      </div>

      {/* Core Team Approval Grid (Production, Quality, Tooling, Marketing, Maintenance) – spacious uniform signing columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x-[1.5px] divide-black border-b-[1.5px] border-black text-xs">
        {CORE_TEAMS.map((team) => (
          <div key={team} className="p-2.5 flex flex-col justify-between min-h-[105px] bg-white">
            <span className="font-black text-[11px] uppercase tracking-wider text-black block border-b border-gray-200 pb-1 text-center">
              {team}
            </span>
            <div className="flex items-center justify-center gap-3 my-1.5">
              <GreenTickBox
                id={`core_ok_${team}`}
                label="OK"
                size="sm"
                checked={coreTeamApproval[team]?.ok}
                onChange={() =>
                  setCoreTeamApproval({
                    ...coreTeamApproval,
                    [team]: { ...coreTeamApproval[team], ok: true, notOk: false },
                  })
                }
              />
              <GreenTickBox
                id={`core_notok_${team}`}
                label="Not OK"
                size="sm"
                checked={coreTeamApproval[team]?.notOk}
                onChange={() =>
                  setCoreTeamApproval({
                    ...coreTeamApproval,
                    [team]: { ...coreTeamApproval[team], ok: false, notOk: true },
                  })
                }
              />
            </div>
            <div className="space-y-1 mt-1">
              <div>
                <span className="text-[8px] uppercase font-bold text-gray-500 block">Sign :</span>
                <div className="h-6 border-b border-black mt-0.5"></div>
              </div>
              <div>
                <span className="text-[8px] uppercase font-bold text-gray-500 block">Date :</span>
                <input
                  type="date"
                  value={coreTeamApproval[team]?.date}
                  onChange={(e) =>
                    setCoreTeamApproval({
                      ...coreTeamApproval,
                      [team]: { ...coreTeamApproval[team], date: e.target.value },
                    })
                  }
                  className="w-full text-[9px] text-gray-600 outline-none text-center bg-transparent"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Production Breakpoint & Traceability */}
      <div className="grid grid-cols-12 divide-y md:divide-y-0 md:divide-x-[1.5px] divide-black text-xs">
        <div className="col-span-12 sm:col-span-4 p-2 flex items-center">
          <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Brake point date :</span>
          <input
            type="date"
            value={bottomInfo.brakePointDate}
            onChange={(e) => setBottomInfo({ ...bottomInfo, brakePointDate: e.target.value })}
            className="w-full outline-none bg-transparent text-[10px]"
          />
        </div>
        <div className="col-span-12 sm:col-span-4 p-2 flex items-center">
          <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Invoice details :</span>
          <input
            type="text"
            placeholder="Invoice / DC No."
            value={bottomInfo.invoiceDetails}
            onChange={(e) => setBottomInfo({ ...bottomInfo, invoiceDetails: e.target.value })}
            className="w-full font-bold outline-none bg-transparent"
          />
        </div>
        <div className="col-span-12 sm:col-span-4 p-2 flex items-center">
          <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">Identification :</span>
          <input
            type="text"
            placeholder="On Part / Box / Trolly"
            value={bottomInfo.identification}
            onChange={(e) => setBottomInfo({ ...bottomInfo, identification: e.target.value })}
            className="w-full font-bold outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Footer line */}
      <div className="flex justify-between items-center text-[10px] font-bold text-gray-800 p-1 border-t-[1.5px] border-black font-mono">
        <span>QF / 07 / MRO – 16</span>
        <span>14.08.2017</span>
      </div>
    </FormWrapper>
  );
};

export default PtrInitiationForm;

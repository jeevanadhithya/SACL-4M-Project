import React, { useState } from "react";
import FormWrapper from "./FormWrapper";
import GreenTickBox from "../components/GreenTickBox";

const CATEGORY_GROUPS = [
  {
    category: "Man",
    points: ["Insufficient Skill", "Operator Awareness", "Specific Training"],
  },
  {
    category: "Method",
    points: [
      "Process Change",
      "Jigs, tool Change",
      "Cycle time",
      "Process Capability",
      "Parameter Change",
      "Document Change",
      "Check method",
    ],
  },
  {
    category: "Machine",
    points: ["Capacity", "Spares", "Machine Capability"],
  },
  {
    category: "Material",
    points: ["Availability of material", "Availability of Stock"],
  },
  { category: "Cost", points: ["Increase in cost"] },
  { category: "Quality", points: ["Cp, Cpk Change"] },
  { category: "Delivery", points: ["Delivery of Modified Parts"] },
];

const STANDARD_REMARKS = [
  "-- Select Remark --",
  "Process parameter monitored & recorded",
  "Work instructions & visual aids displayed",
  "Gauge R&R and calibration confirmed",
  "Tool wear & life tracking established",
  "Trial batch 100% inspection performed",
  "SOP revised and operators trained",
];

const createInitialRows = () =>
  CATEGORY_GROUPS.flatMap((group) =>
    group.points.map((point, index) => ({
      id: `${group.category}-${index}`,
      category: group.category,
      point,
      control: "",
      risk: "",
      qcd: "",
      actions: "",
    }))
  );

const RISK_OPTIONS = ["HIGH", "LOW", "MEDIUM", "NA"];

const RiskAnalysisCheckSheet = () => {
  const [meta, setMeta] = useState({
    partName: "",
    customer: "",
    partNo: "",
    date: new Date().toISOString().split("T")[0],
    conclusionAcceptable: true,
    conclusionNotAcceptable: false,
    overallRiskH: false,
    overallRiskL: true,
    overallRiskM: false,
  });

  const [rows, setRows] = useState(createInitialRows);
  const [signatures] = useState(Array(6).fill(""));
  const [savedMsg, setSavedMsg] = useState("");
  const [isDownloadingPdf] = useState(false);

  const updateMeta = (field, value) => {
    setMeta((prev) => ({ ...prev, [field]: value }));
  };

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSave = async () => {
    localStorage.setItem(
      "saved_risk_analysis",
      JSON.stringify({ meta, rows, signatures })
    );

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${apiUrl}/api/risk-analysis/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          recordKey: meta.partNo || meta.partName || `RA-${Date.now()}`,
          partName: meta.partName,
          customer: meta.customer,
          formData: { meta, rows, signatures },
        }),
      });

      if (!response.ok) throw new Error("Server save failed");
      setSavedMsg("Risk Analysis Check Sheet saved successfully to database!");
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
      title="RISK ANALYSIS CHECK SHEET"
      qfNo="QF/07/MKT-14"
      revDate="Rev.No.02 dt 13.02.2019"
      onSave={handleSave}
      onPrint={handlePrint}
      isDownloadingPdf={isDownloadingPdf}
    >
      {savedMsg && (
        <div className="mb-3 rounded border border-[#16A34A] bg-[#E8F5EF] p-3 text-sm font-semibold text-[#14532D] print:hidden">
          {savedMsg}
        </div>
      )}

      {/* Part & Customer Details Grid – 2 lines matching scanned sheet */}
      <div className="border-b-[1.5px] border-black text-xs">
        <div className="grid grid-cols-12 border-b-[1.5px] border-black">
          <div className="col-span-6 border-r-[1.5px] border-black px-2 py-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">PART NAME :</span>
            <input
              value={meta.partName}
              onChange={(e) => updateMeta("partName", e.target.value)}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-6 px-2 py-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">CUSTOMER :</span>
            <input
              value={meta.customer}
              onChange={(e) => updateMeta("customer", e.target.value)}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-6 border-r-[1.5px] border-black px-2 py-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">PART NO. :</span>
            <input
              value={meta.partNo}
              onChange={(e) => updateMeta("partNo", e.target.value)}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-6 px-2 py-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">DATE :</span>
            <input
              type="date"
              value={meta.date}
              onChange={(e) => updateMeta("date", e.target.value)}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Risk Analysis Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-b-[1.5px] border-black text-xs">
          <thead className="bg-gray-100 font-bold border-b-[1.5px] border-black text-black">
            <tr>
              <th rowSpan={2} className="border-r-[1.5px] border-black px-2 py-1.5 uppercase w-20 text-center">
                CATEGORY
              </th>
              <th rowSpan={2} className="border-r-[1.5px] border-black px-2 py-1.5 uppercase text-left w-48">
                RISK POINTS
              </th>
              <th rowSpan={2} className="border-r-[1.5px] border-black px-2 py-1.5 uppercase text-left w-36">
                CONTROL METHOD
              </th>
              <th colSpan={4} className="border-r-[1.5px] border-b border-black px-1 py-1 uppercase text-center">
                RISK
              </th>
              <th className="border-r-[1.5px] border-b border-black px-2 py-1 uppercase text-center w-28">
                EFFECT ON
              </th>
              <th rowSpan={2} className="px-2 py-1.5 uppercase text-left w-52">
                ACTIONS
              </th>
            </tr>
            <tr className="text-[10px] bg-gray-50 border-b-[1.5px] border-black">
              {RISK_OPTIONS.map((opt) => (
                <th key={opt} className="border-r border-black px-1 py-0.5 text-center w-10">
                  {opt}
                </th>
              ))}
              <th className="border-r-[1.5px] border-black px-1 py-0.5 text-center">QCD</th>
            </tr>
          </thead>

          <tbody>
            {CATEGORY_GROUPS.map((group) => {
              const groupRows = rows.filter((r) => r.category === group.category);
              return groupRows.map((row, index) => (
                <tr key={row.id} className="border-b border-black hover:bg-yellow-50/30">
                  {index === 0 && (
                    <td
                      rowSpan={group.points.length}
                      className="border-r-[1.5px] border-black px-1 py-2 text-center font-bold text-black bg-white align-middle"
                    >
                      {group.category}
                    </td>
                  )}
                  <td className="border-r-[1.5px] border-black px-2 py-1 text-black font-medium">
                    {row.point}
                  </td>
                  <td className="border-r-[1.5px] border-black p-1">
                    <input
                      type="text"
                      value={row.control}
                      onChange={(e) => updateRow(row.id, "control", e.target.value)}
                      className="w-full text-xs outline-none bg-transparent"
                    />
                  </td>
                  {RISK_OPTIONS.map((opt) => (
                    <td key={opt} className="border-r border-black p-1 text-center bg-white">
                      <div className="flex justify-center">
                        <GreenTickBox
                          id={`risk_${row.id}_${opt}`}
                          size="sm"
                          checked={row.risk === opt}
                          onChange={() => updateRow(row.id, "risk", opt)}
                        />
                      </div>
                    </td>
                  ))}
                  <td className="border-r-[1.5px] border-black p-1 text-center">
                    <input
                      type="text"
                      value={row.qcd}
                      onChange={(e) => updateRow(row.id, "qcd", e.target.value)}
                      className="w-full text-xs text-center outline-none bg-transparent font-bold"
                    />
                  </td>
                  <td className="p-1">
                    <div className="flex flex-col gap-0.5">
                      <select
                        value={
                          STANDARD_REMARKS.includes(row.actions)
                            ? row.actions
                            : row.actions
                            ? "Custom"
                            : "-- Select Remark --"
                        }
                        onChange={(e) => {
                          if (e.target.value !== "Custom" && e.target.value !== "-- Select Remark --") {
                            updateRow(row.id, "actions", e.target.value);
                          }
                        }}
                        className="w-full text-[9px] p-0.5 bg-transparent border border-gray-300 rounded font-bold print:hidden"
                      >
                        {STANDARD_REMARKS.map((rem) => (
                          <option key={rem} value={rem}>
                            {rem}
                          </option>
                        ))}
                        <option value="Custom">Custom Action...</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Action..."
                        value={row.actions}
                        onChange={(e) => updateRow(row.id, "actions", e.target.value)}
                        className="w-full text-xs outline-none bg-transparent font-medium"
                      />
                    </div>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      {/* CONCLUSION Section – exact scanned layout */}
      <div className="grid grid-cols-12 border-b-[1.5px] border-black min-h-[46px]">
        <div className="col-span-12 sm:col-span-6 border-b-[1.5px] sm:border-b-0 sm:border-r-[1.5px] border-black p-2 flex items-center gap-6">
          <span className="font-black uppercase text-[10px] tracking-wider whitespace-nowrap">Conclusion :</span>
          <GreenTickBox
            id="ra_acceptable"
            label="Acceptable"
            checked={meta.conclusionAcceptable}
            onChange={(e) =>
              setMeta({ ...meta, conclusionAcceptable: e.target.checked, conclusionNotAcceptable: false })
            }
          />
          <GreenTickBox
            id="ra_not_acceptable"
            label="Not Acceptable"
            checked={meta.conclusionNotAcceptable}
            onChange={(e) =>
              setMeta({ ...meta, conclusionNotAcceptable: e.target.checked, conclusionAcceptable: false })
            }
          />
        </div>

        <div className="col-span-12 sm:col-span-6 p-2 flex items-center justify-start sm:justify-end gap-4">
          <span className="font-black uppercase text-[10px] tracking-wider whitespace-nowrap">Overall Risk level -</span>
          <div className="flex items-center gap-3">
            <GreenTickBox
              id="risk_h"
              label="H"
              size="sm"
              checked={meta.overallRiskH}
              onChange={() => setMeta({ ...meta, overallRiskH: true, overallRiskL: false, overallRiskM: false })}
            />
            <GreenTickBox
              id="risk_l"
              label="L"
              size="sm"
              checked={meta.overallRiskL}
              onChange={() => setMeta({ ...meta, overallRiskH: false, overallRiskL: true, overallRiskM: false })}
            />
            <GreenTickBox
              id="risk_m"
              label="M"
              size="sm"
              checked={meta.overallRiskM}
              onChange={() => setMeta({ ...meta, overallRiskH: false, overallRiskL: false, overallRiskM: true })}
            />
          </div>
        </div>
      </div>

      {/* CFT MEMBERS SIGNATURE Grid (1 to 6) – uniform physical signing space */}
      <div className="grid grid-cols-12 text-xs">
        <div className="col-span-12 sm:col-span-3 border-b-[1.5px] sm:border-b-0 sm:border-r-[1.5px] border-black p-3 flex flex-col justify-center bg-gray-50/50">
          <span className="font-black uppercase text-[10px] tracking-wider leading-tight">CFT Members Signature :</span>
          <span className="text-[9px] text-gray-500 font-mono mt-1">Cross-Functional Team Sign-off</span>
        </div>
        <div className="col-span-12 sm:col-span-9 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x-[1.5px] divide-black">
          <div className="flex flex-col divide-y divide-black">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-2 min-h-[48px] flex flex-col justify-between bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-gray-800">{i + 1}) CFT Member Sign</span>
                  <span className="text-[8px] text-gray-400 italic print:hidden">(Physical Sign)</span>
                </div>
                <div className="h-6 border-b border-black mt-1"></div>
              </div>
            ))}
          </div>
          <div className="flex flex-col divide-y divide-black">
            {[3, 4, 5].map((i) => (
              <div key={i} className="p-2 min-h-[48px] flex flex-col justify-between bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-gray-800">{i + 1}) CFT Member Sign</span>
                  <span className="text-[8px] text-gray-400 italic print:hidden">(Physical Sign)</span>
                </div>
                <div className="h-6 border-b border-black mt-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FormWrapper>
  );
};

export default RiskAnalysisCheckSheet;

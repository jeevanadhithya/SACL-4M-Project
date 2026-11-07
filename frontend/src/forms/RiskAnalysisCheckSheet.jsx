import React, { useState } from "react";
import FormWrapper from "./FormWrapper";

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
    date: "",
    conclusion: "",
    overallRisk: "",
    conclusionNotes: "",
  });

  const [rows, setRows] = useState(createInitialRows);
  const [signatures, setSignatures] = useState(Array(6).fill(""));
  const [savedMsg, setSavedMsg] = useState("");

  const updateMeta = (field, value) => {
    setMeta((prev) => ({ ...prev, [field]: value }));
  };

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const updateSignature = (index, value) => {
    setSignatures((prev) =>
      prev.map((signature, i) => (i === index ? value : signature))
    );
  };

  const handleSave = () => {
    localStorage.setItem(
      "saved_risk_analysis",
      JSON.stringify({ meta, rows, signatures })
    );
    setSavedMsg("Risk analysis check sheet saved successfully!");
    window.setTimeout(() => setSavedMsg(""), 3000);
  };

  // eslint-disable-next-line no-unused-vars
  const riskColor = (risk) => {
    if (risk === "HIGH") return "bg-[#F9E9EB] text-[#7F1D1D]";
    if (risk === "MEDIUM") return "bg-[#FFF8E7] text-[#F59E0B]";
    if (risk === "LOW") return "bg-[#E8F5EF] text-[#14532D]";
    return "bg-[#F8F9FA] text-[#6B7280]";
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
        <div className="mb-3 rounded border border-[#16A34A] bg-[#E8F5EF] p-3 text-sm font-semibold text-[#14532D] print:hidden">
          {savedMsg}
        </div>
      )}

      <div className="w-full border-2 border-[#050B12] bg-white text-[#111827]">
        {/* Form title and company header */}
        <div className="grid grid-cols-12 border-b-2 border-[#050B12]">
          <div className="col-span-12 flex min-h-[76px] items-center border-b-2 border-[#050B12] px-4 py-3 sm:col-span-4 sm:border-b-0 sm:border-r-2">
            <div className="text-sm font-bold uppercase leading-tight">
              SAKTHI
              <br />
              AUTO COMPONENT
              <br />
              LIMITED
            </div>
          </div>
          <div className="col-span-12 flex min-h-[76px] items-center justify-center bg-[#F8F9FA] px-2 py-3 text-center sm:col-span-8">
            <h2 className="text-base font-bold uppercase tracking-wide sm:text-xl">
              RISK ANALYSIS CHECK SHEET
            </h2>
          </div>
        </div>

        {/* Part and customer details, matching the two-line paper header */}
        <div className="grid grid-cols-12 border-b-2 border-[#050B12] text-xs">
          <label className="col-span-12 flex min-h-[37px] items-center gap-2 border-b border-[#D1D5DB] px-3 py-1 sm:col-span-6 sm:border-b-0 sm:border-r sm:border-r-[#050B12]">
            <span className="min-w-[75px] font-semibold">PART NAME :</span>
            <input
              value={meta.partName}
              onChange={(e) => updateMeta("partName", e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm outline-none focus:border-b focus:border-[#FF9800]"
            />
          </label>
          <label className="col-span-12 flex min-h-[37px] items-center gap-2 border-b border-[#D1D5DB] px-3 py-1 sm:col-span-6 sm:border-b-0">
            <span className="min-w-[75px] font-semibold">CUSTOMER :</span>
            <input
              value={meta.customer}
              onChange={(e) => updateMeta("customer", e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm outline-none focus:border-b focus:border-[#FF9800]"
            />
          </label>
          <label className="col-span-12 flex min-h-[37px] items-center gap-2 border-b border-[#D1D5DB] px-3 py-1 sm:col-span-6 sm:border-b-0 sm:border-r sm:border-r-[#050B12]">
            <span className="min-w-[75px] font-semibold">PART NO. :</span>
            <input
              value={meta.partNo}
              onChange={(e) => updateMeta("partNo", e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm outline-none focus:border-b focus:border-[#FF9800]"
            />
          </label>
          <label className="col-span-12 flex min-h-[37px] items-center gap-2 px-3 py-1 sm:col-span-6">
            <span className="min-w-[75px] font-semibold">DATE :</span>
            <input
              type="date"
              value={meta.date}
              onChange={(e) => updateMeta("date", e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm outline-none focus:border-b focus:border-[#FF9800]"
            />
          </label>
        </div>

        {/* Risk analysis table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed border-collapse text-[11px] sm:text-xs">
            <colgroup>
              <col style={{ width: "11%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "6.5%" }} />
              <col style={{ width: "6.5%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "6.5%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "20.5%" }} />
            </colgroup>
            <thead className="bg-[#F8F9FA] text-[#111827]">
              <tr className="h-[34px]">
                <th rowSpan={2} className="border border-[#050B12] px-1 py-2 font-bold uppercase">
                  CATEGORY
                </th>
                <th rowSpan={2} className="border border-[#050B12] px-1 py-2 font-bold uppercase">
                  RISK POINTS
                </th>
                <th rowSpan={2} className="border border-[#050B12] px-1 py-2 font-bold uppercase">
                  CONTROL<br />METHOD
                </th>
                <th colSpan={4} className="border border-[#050B12] px-1 py-1 font-bold uppercase">
                  RISK
                </th>
                <th className="border border-[#050B12] px-1 py-1 font-bold uppercase">
                  EFFECT ON
                </th>
                <th rowSpan={2} className="border border-[#050B12] px-1 py-2 font-bold uppercase">
                  ACTIONS
                </th>
              </tr>
              <tr className="h-[29px]">
                {RISK_OPTIONS.map((option) => (
                  <th key={option} className="border border-[#050B12] px-1 py-1 font-bold">
                    {option}
                  </th>
                ))}
                <th className="border border-[#050B12] px-1 py-1 font-bold">QCD</th>
              </tr>
            </thead>

            <tbody>
              {CATEGORY_GROUPS.map((group) => {
                const groupRows = rows.filter((row) => row.category === group.category);
                return groupRows.map((row, index) => (
                  <tr key={row.id} className="h-[42px] hover:bg-[#F8F9FA]">
                    {index === 0 && (
                      <td
                        rowSpan={group.points.length}
                        className="border border-[#050B12] bg-[#F8F9FA] px-1 py-2 text-center font-semibold"
                      >
                        {group.category}
                      </td>
                    )}
                    <td className="border border-[#050B12] px-1 py-2 font-medium">
                      {row.point}
                    </td>
                    <td className="border border-[#050B12] p-1">
                      <input
                        value={row.control}
                        onChange={(e) => updateRow(row.id, "control", e.target.value)}
                        aria-label={`${row.point} control method`}
                        className="h-full min-h-[30px] w-full bg-transparent px-1 text-[11px] outline-none focus:ring-1 focus:ring-inset focus:ring-[#FF9800]"
                      />
                    </td>

                    {RISK_OPTIONS.map((option) => (
                      <td key={option} className="border border-[#050B12] p-1 text-center">
                        <input
                          type="radio"
                          name={`risk-${row.id}`}
                          value={option}
                          checked={row.risk === option}
                          onChange={() => updateRow(row.id, "risk", option)}
                          aria-label={`${row.point}: ${option}`}
                          className="h-3.5 w-3.5 cursor-pointer accent-[#FF9800]"
                        />
                      </td>
                    ))}

                    <td className="border border-[#050B12] p-1">
                      <input
                        value={row.qcd}
                        onChange={(e) => updateRow(row.id, "qcd", e.target.value)}
                        aria-label={`${row.point} effect on QCD`}
                        className="h-full min-h-[30px] w-full bg-transparent px-1 text-[11px] outline-none focus:ring-1 focus:ring-inset focus:ring-[#FF9800]"
                      />
                    </td>
                    <td className="border border-[#050B12] p-1">
                      <input
                        value={row.actions}
                        onChange={(e) => updateRow(row.id, "actions", e.target.value)}
                        aria-label={`${row.point} actions`}
                        className="h-full min-h-[30px] w-full bg-transparent px-1 text-[11px] outline-none focus:ring-1 focus:ring-inset focus:ring-[#FF9800]"
                      />
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        {/* Conclusion writing area */}
        <div className="min-h-[100px] border-t-2 border-[#050B12] px-2 py-2">
          <label className="block text-xs font-semibold underline">Conclusion</label>
          <textarea
            value={meta.conclusionNotes}
            onChange={(e) => updateMeta("conclusionNotes", e.target.value)}
            className="mt-1 min-h-[72px] w-full resize-y bg-transparent px-1 py-1 text-sm outline-none focus:ring-1 focus:ring-[#FF9800]"
            aria-label="Conclusion details"
          />
        </div>

        {/* Acceptability and overall risk level */}
        <div className="grid grid-cols-12 border-y-2 border-[#050B12]">
          <div className="col-span-12 flex flex-wrap items-center gap-x-5 gap-y-3 border-b-2 border-[#050B12] px-3 py-3 sm:col-span-5 sm:border-b-0 sm:border-r-2">
            {["Acceptable", "Not Acceptable"].map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={meta.conclusion === option}
                  onChange={() =>
                    updateMeta("conclusion", meta.conclusion === option ? "" : option)
                  }
                  className="h-5 w-5 accent-[#FF9800]"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <div className="col-span-12 flex flex-wrap items-center justify-center gap-3 px-3 py-3 sm:col-span-7 sm:justify-start">
            <span className="text-xs font-bold">Overall Risk level -</span>
            <div className="flex border-2 border-[#050B12]">
              {["H", "L", "M"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    updateMeta("overallRisk", meta.overallRisk === level ? "" : level)
                  }
                  className={`h-8 min-w-[48px] border-r border-[#050B12] px-3 text-xs font-bold last:border-r-0 transition-colors ${
                    meta.overallRisk === level
                      ? "bg-[#FF9800] text-[#050B12]"
                      : "bg-white text-[#111827] hover:bg-[#FFF8E7]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CFT member signature section */}
        <div className="grid grid-cols-12">
          <div className="col-span-12 border-b border-[#050B12] px-3 py-2 text-xs font-medium sm:col-span-4 sm:border-b-0 sm:border-r">
            CFT Members Signature :
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-2 px-3 py-2 sm:col-span-8">
            {[1, 2, 3, 4, 5, 6].map((number) => (
              <label key={number} className="flex min-h-[30px] items-center gap-2 text-xs">
                <span className="w-5">{number})</span>
                <input
                  value={signatures[number - 1]}
                  onChange={(e) => updateSignature(number - 1, e.target.value)}
                  aria-label={`CFT member ${number} signature`}
                  className="min-w-0 flex-1 border-b border-transparent bg-transparent px-1 py-1 outline-none focus:border-[#FF9800]"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </FormWrapper>
  );
};

export default RiskAnalysisCheckSheet;

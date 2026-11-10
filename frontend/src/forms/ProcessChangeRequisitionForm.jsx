import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormHeader from "../components/FormHeader";
import Header from "../components/Header";
import { ArrowLeft, Save, CheckCircle, Plus, FileDown, Loader } from "lucide-react";
import { generateProcessChangeRequisitionPDF } from "../utils/pdfGenerators";

const ProcessChangeRequisitionForm = () => {
  const navigate = useNavigate();

  // Form State matching the exact image fields
  const [formData, setFormData] = useState({
    requisitionBy: "",
    requisitionerSign: "",
    pcrfNo: "",
    department: "",
    hodSign: "",
    date: "",
    customer: "",
    partName: "",
    partNo: "",
    // Classification 4M checkboxes
    classification: {
      man: false,
      machine: false,
      material: false,
      method: false,
    },
    // Particulars & Change Required items
    particularsRows: [
      { id: 1, particular: "", currentStatus: "", f: false, m: false, fem: false },
    ],
    // Reason for Change Required
    reason: {
      product: false,
      productF: false,
      productM: false,
      process: false,
      processF: false,
      processM: false,
      other: false,
      details: "",
    },
    // CFT Comments
    foundry: {
      isProcess: false,
      isProduct: false,
      feasibility: "",
      comments: "",
      leaderSign: "",
      date: "",
    },
    machineShop: {
      isProcessOnly: false,
      isProduct: false,
      feasibility: "",
      comments: "",
      leaderSign: "",
      date: "",
    },
    // Internal Approval
    approval: {
      approved: false,
      rejected: false,
      ifOthers: false,
      othersSpecify: "",
      approvingAuthority: "PLANT HEAD",
      signature: "",
    },
    // Customer Communication Detail
    customerCommunication: {
      handleNotes: "",
      changeReflectionInSop: false,
      nextForwarded: false,
      additionalNotes: "",
    },
  });

  const [toastMsg, setToastMsg] = useState("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const standardParticularOptions = [
    "-- Select or Type Custom --",
    "Pattern / Core Box Modification",
    "Mould Hardness / Squeeze Pressure",
    "Sand Mix Formulation / Bentonite Spec",
    "Pouring Temperature / Filter Size",
    "Shot Blasting / Fettling Procedure",
    "Machining Tooling / Insert Grade",
    "Machine Fixture / Clamping Method",
    "CNC / VMC Program Revision",
    "Inspection Gauge / Checking Aid",
    "Drawing Dimension / Tolerance Revision",
  ];

  const handleParticularChange = (index, value) => {
    const updated = [...formData.particularsRows];
    updated[index].particular = value === "-- Select or Type Custom --" ? "" : value;
    setFormData({ ...formData, particularsRows: updated });
  };

  const handleStatusChange = (index, value) => {
    const updated = [...formData.particularsRows];
    updated[index].currentStatus = value;
    setFormData({ ...formData, particularsRows: updated });
  };

  const handleCheckboxChange = (index, field) => {
    const updated = [...formData.particularsRows];
    if (field === "fem") {
      const nextVal = !updated[index].fem;
      updated[index].fem = nextVal;
      if (nextVal) {
        // When F&M is selected, reset F and M
        updated[index].f = false;
        updated[index].m = false;
      }
    } else {
      updated[index][field] = !updated[index][field];
      if (updated[index][field]) {
        // If F or M is checked, turn off F&M
        updated[index].fem = false;
      }
    }
    setFormData({ ...formData, particularsRows: updated });
  };

  const handleAddParticularRow = () => {
    setFormData((prev) => ({
      ...prev,
      particularsRows: [
        ...prev.particularsRows,
        { id: Date.now(), particular: "", currentStatus: "", f: false, m: false, fem: false },
      ],
    }));
  };

  const handleSave = async () => {
    // 1. Local backup
    localStorage.setItem("sakthi_process_change_requisition", JSON.stringify(formData));

    // 2. Server save via API
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${apiUrl}/api/forms/process-change-requisition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          recordKey: formData.pcrfNo || `PCRF-${Date.now()}`,
          partName: formData.partName,
          customer: formData.customer,
          status: formData.approval?.approved ? "Approved" : "Pending Approval",
          formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server save failed");
      }

      setToastMsg("Process Change Requisition Form saved successfully to database!");
    } catch (err) {
      console.warn("Backend API unavailable, saved locally:", err.message);
      setToastMsg("Saved locally in browser storage (Backend server offline).");
    }

    setTimeout(() => setToastMsg(""), 3500);
  };

  const handlePrint = async () => {
    setIsDownloadingPdf(true);
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const pcrfNo = formData.pcrfNo || "PCRF-2026-001";

    try {
      // 1. Try Backend Controller PDFKit Stream (Machine Shop v2 Architecture)
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/process-change-requisition/report?pcrfNo=${encodeURIComponent(pcrfNo)}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `ProcessChangeRequisition_${pcrfNo}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        setToastMsg("Official PDF generated by Backend Controller & downloaded!");
        setTimeout(() => setToastMsg(""), 3500);
        return;
      }
      throw new Error("Backend stream responded with status " + res.status);
    } catch (backendErr) {
      console.warn("Backend PDF generation unavailable, generating via client-side engine:", backendErr);
      // 2. Client-side fallback with exact layout
      generateProcessChangeRequisitionPDF(formData);
      setToastMsg("Official PDF generated and downloaded successfully!");
      setTimeout(() => setToastMsg(""), 3500);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2d2d2d] flex flex-col font-sans text-gray-900">
      {/* Official Sakthi Top Header */}
      <div className="print:hidden"><Header /></div>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col items-center p-3 sm:p-6 md:p-8 pb-20 w-full max-w-[1200px] mx-auto">
        
        {/* Navigation & Action Bar */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 print:hidden">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-[#383838] hover:bg-[#4a4a4a] px-4 py-2 rounded-xl border border-[#4a4a4a] shadow-md font-bold uppercase tracking-wider text-xs"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="bg-yellow-100 text-yellow-900 border border-yellow-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase shadow-sm">
              QF/07/MRO-15 • Rev: 03
            </span>

            <button
              onClick={handlePrint}
              disabled={isDownloadingPdf}
              type="button"
              className="bg-gray-800 hover:bg-black text-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5 border border-gray-700 disabled:opacity-60"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader size={16} className="animate-spin text-[#ff9100]" /> Generating PDF...
                </>
              ) : (
                <>
                  <FileDown size={16} /> Print / Export PDF
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              type="button"
              className="bg-[#ff9100] hover:bg-orange-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5 border border-[#ffaa33]"
            >
              <Save size={16} /> Save Record
            </button>
          </div>
        </div>

        {/* Save Toast Notification */}
        {toastMsg && (
          <div className="w-full max-w-[1020px] mb-4 p-3 bg-green-100 border border-green-500 text-green-800 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in print:hidden">
            <CheckCircle size={16} className="text-green-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* =========================================================================
            EXACT REPLICA PAPER CANVAS
            Strict 1:1 Layout, Borders and Proportions as in the Scanned Sheet
        ========================================================================= */}
        <div id="printable-area" className="printable-form w-full max-w-[1020px] bg-white p-4 sm:p-8 shadow-2xl rounded-none border-[2px] border-black print:border-none print:shadow-none print:p-0">
          
          <div className="w-full border-[1.5px] border-black text-black text-xs font-sans">
            
            <FormHeader title="PROCESS CHANGE REQUISITION FORM" />

            {/* ROW 2: REQUISITION BY | REQUISITIONER SIGN | PCRF NO */}
            <div className="grid grid-cols-12 border-b-[1.5px] border-black">
              <div className="col-span-12 sm:col-span-4 border-b sm:border-b-0 sm:border-r-[1.5px] border-black px-2 py-1.5 flex items-center">
                <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">REQUISITION BY :</span>
                <input
                  type="text"
                  value={formData.requisitionBy}
                  onChange={(e) => setFormData({ ...formData, requisitionBy: e.target.value })}
                  
                  className="w-full font-bold outline-none px-1 py-0.5 bg-transparent text-xs"
                />
              </div>
              <div className="col-span-12 sm:col-span-5 border-b sm:border-b-0 sm:border-r-[1.5px] border-black px-2 py-1.5 flex items-center">
                <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">REQUISITIONER SIGN :</span>
                <input
                  type="text"
                  value={formData.requisitionerSign}
                  onChange={(e) => setFormData({ ...formData, requisitionerSign: e.target.value })}
                  
                  className="w-full font-bold outline-none px-1 py-0.5 bg-transparent text-xs"
                />
              </div>
              <div className="col-span-12 sm:col-span-3 px-2 py-1.5 flex items-center">
                <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">PCRF NO. :</span>
                <input
                  type="text"
                  value={formData.pcrfNo}
                  onChange={(e) => setFormData({ ...formData, pcrfNo: e.target.value })}
                  
                  className="w-full font-mono font-bold outline-none px-1 py-0.5 bg-transparent text-xs"
                />
              </div>
            </div>

            {/* ROW 3: DEPARTMENT | REQUISITIONER HOD SIGN | DATE */}
            <div className="grid grid-cols-12 border-b-[1.5px] border-black">
              <div className="col-span-12 sm:col-span-4 border-b sm:border-b-0 sm:border-r-[1.5px] border-black px-2 py-1.5 flex items-center">
                <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">DEPARTMENT :</span>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  
                  className="w-full font-bold outline-none px-1 py-0.5 bg-transparent text-xs"
                />
              </div>
              <div className="col-span-12 sm:col-span-5 border-b sm:border-b-0 sm:border-r-[1.5px] border-black px-2 py-1.5 flex items-center">
                <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">REQUISITIONER HOD SIGN :</span>
                <input
                  type="text"
                  value={formData.hodSign}
                  onChange={(e) => setFormData({ ...formData, hodSign: e.target.value })}
                  
                  className="w-full font-bold outline-none px-1 py-0.5 bg-transparent text-xs"
                />
              </div>
              <div className="col-span-12 sm:col-span-3 px-2 py-1.5 flex items-center">
                <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">DATE :</span>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full font-bold outline-none px-1 py-0.5 bg-transparent text-xs"
                />
              </div>
            </div>

            {/* ROW 4: CUSTOMER | PART NAME | PART NO */}
            <div className="grid grid-cols-12 border-b-[1.5px] border-black">
              <div className="col-span-12 sm:col-span-4 border-b sm:border-b-0 sm:border-r-[1.5px] border-black px-2 py-1.5 flex items-center">
                <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">CUSTOMER :</span>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  
                  className="w-full font-bold outline-none px-1 py-0.5 bg-transparent text-xs"
                />
              </div>
              <div className="col-span-12 sm:col-span-5 border-b sm:border-b-0 sm:border-r-[1.5px] border-black px-2 py-1.5 flex items-center">
                <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">PART NAME :</span>
                <input
                  type="text"
                  value={formData.partName}
                  onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                  
                  className="w-full font-bold outline-none px-1 py-0.5 bg-transparent text-xs"
                />
              </div>
              <div className="col-span-12 sm:col-span-3 px-2 py-1.5 flex items-center">
                <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">PART NO. :</span>
                <input
                  type="text"
                  value={formData.partNo}
                  onChange={(e) => setFormData({ ...formData, partNo: e.target.value })}
                  
                  className="w-full font-bold outline-none px-1 py-0.5 bg-transparent text-xs"
                />
              </div>
            </div>

            {/* ROW 5: CLASSIFICATION [ ] MAN [ ] MACHINE [ ] MATERIAL [ ] METHOD */}
            <div className="grid grid-cols-12 border-b-[1.5px] border-black bg-white items-center">
              <div className="col-span-12 sm:col-span-3 border-b sm:border-b-0 sm:border-r-[1.5px] border-black px-2 py-2 font-black uppercase text-[10px] tracking-wider text-black">
                CLASSIFICATION
              </div>
              <div className="col-span-3 sm:col-span-2 border-r-[1.5px] border-black px-2 py-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-yellow-50">
                <input
                  type="checkbox"
                  id="class_man"
                  checked={formData.classification.man}
                  onChange={(e) => setFormData({
                    ...formData,
                    classification: { ...formData.classification, man: e.target.checked }
                  })}
                  className="w-4 h-4 rounded-none border-[1.5px] border-black accent-black cursor-pointer"
                />
                <label htmlFor="class_man" className="font-bold text-[10px] uppercase cursor-pointer select-none">
                  MAN
                </label>
              </div>
              <div className="col-span-3 sm:col-span-2 border-r-[1.5px] border-black px-2 py-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-yellow-50">
                <input
                  type="checkbox"
                  id="class_machine"
                  checked={formData.classification.machine}
                  onChange={(e) => setFormData({
                    ...formData,
                    classification: { ...formData.classification, machine: e.target.checked }
                  })}
                  className="w-4 h-4 rounded-none border-[1.5px] border-black accent-black cursor-pointer"
                />
                <label htmlFor="class_machine" className="font-bold text-[10px] uppercase cursor-pointer select-none">
                  MACHINE
                </label>
              </div>
              <div className="col-span-3 sm:col-span-2 border-r-[1.5px] border-black px-2 py-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-yellow-50">
                <input
                  type="checkbox"
                  id="class_mat"
                  checked={formData.classification.material}
                  onChange={(e) => setFormData({
                    ...formData,
                    classification: { ...formData.classification, material: e.target.checked }
                  })}
                  className="w-4 h-4 rounded-none border-[1.5px] border-black accent-black cursor-pointer"
                />
                <label htmlFor="class_mat" className="font-bold text-[10px] uppercase cursor-pointer select-none">
                  MATERIAL
                </label>
              </div>
              <div className="col-span-3 sm:col-span-3 px-2 py-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-yellow-50">
                <input
                  type="checkbox"
                  id="class_meth"
                  checked={formData.classification.method}
                  onChange={(e) => setFormData({
                    ...formData,
                    classification: { ...formData.classification, method: e.target.checked }
                  })}
                  className="w-4 h-4 rounded-none border-[1.5px] border-black accent-black cursor-pointer"
                />
                <label htmlFor="class_meth" className="font-bold text-[10px] uppercase cursor-pointer select-none">
                  METHOD
                </label>
              </div>
            </div>

            {/* ROW 6: DETAILS OF CHANGE REQUIRED (Gray Shaded Section Bar) */}
            <div className="bg-[#d1d5db] border-b-[1.5px] border-black py-1.5 text-center font-black uppercase tracking-wider text-[11px] text-black">
              DETAILS OF CHANGE REQUIRED
            </div>

            {/* ROW 7: PARTICULARS | CURRENT STATUS | CHANGE REQUIRED */}
            <div className="grid grid-cols-12 border-b-[1.5px] border-black">
              {/* Column 1: PARTICULARS */}
              <div className="col-span-12 sm:col-span-4 border-b sm:border-b-0 sm:border-r-[1.5px] border-black flex flex-col">
                <div className="bg-[#f3f4f6] border-b-[1.5px] border-black py-1.5 text-center font-black uppercase text-[10px] tracking-wide">
                  PARTICULARS
                </div>
                <div className="p-2 space-y-2 flex-1 bg-white">
                  {formData.particularsRows.map((row, idx) => (
                    <div key={row.id} className="space-y-1 pb-2 border-b border-gray-200 last:border-b-0">
                      <select
                        onChange={(e) => handleParticularChange(idx, e.target.value)}
                        className="w-full text-[10px] font-bold border border-gray-300 rounded p-1 bg-gray-50 outline-none focus:border-black"
                      >
                        {standardParticularOptions.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder=""
                        value={row.particular}
                        onChange={(e) => handleParticularChange(idx, e.target.value)}
                        className="w-full text-xs font-medium border-b border-gray-300 outline-none px-1 py-0.5 focus:border-black"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: CURRENT STATUS */}
              <div className="col-span-12 sm:col-span-4 border-b sm:border-b-0 sm:border-r-[1.5px] border-black flex flex-col">
                <div className="bg-[#f3f4f6] border-b-[1.5px] border-black py-1.5 text-center font-black uppercase text-[10px] tracking-wide">
                  CURRENT STATUS
                </div>
                <div className="p-2 space-y-2 flex-1 bg-white">
                  {formData.particularsRows.map((row, idx) => (
                    <div key={row.id} className="pt-1 pb-2 border-b border-gray-200 last:border-b-0">
                      <textarea
                        rows="2"
                        placeholder=""
                        value={row.currentStatus}
                        onChange={(e) => handleStatusChange(idx, e.target.value)}
                        className="w-full text-xs font-medium p-1 border border-gray-200 rounded outline-none resize-none focus:border-black"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: CHANGE REQUIRED with F [ ], M [ ], F&M [ ] Checkboxes */}
              <div className="col-span-12 sm:col-span-4 flex flex-col">
                <div className="bg-[#f3f4f6] border-b-[1.5px] border-black py-1.5 text-center font-black uppercase text-[10px] tracking-wide">
                  CHANGE REQUIRED
                </div>
                <div className="p-3 space-y-3 flex-1 bg-white">
                  {formData.particularsRows.map((row, idx) => (
                    <div key={row.id} className="flex items-center justify-between gap-3 pt-1 pb-2 border-b border-gray-200 last:border-b-0 min-h-[38px]">
                      <span className="text-xs font-bold text-gray-500">#{idx + 1}</span>
                      <div className="flex items-center gap-5">
                        {/* Only show F and M options if F&M is not checked */}
                        {!row.fem && (
                          <>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <span className="text-sm font-black font-mono text-gray-900 group-hover:text-[#FF9800]">F</span>
                              <input
                                type="checkbox"
                                checked={row.f}
                                onChange={() => handleCheckboxChange(idx, "f")}
                                className="w-5 h-5 border-[1.5px] border-black rounded accent-black cursor-pointer"
                              />
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <span className="text-sm font-black font-mono text-gray-900 group-hover:text-[#FF9800]">M</span>
                              <input
                                type="checkbox"
                                checked={row.m}
                                onChange={() => handleCheckboxChange(idx, "m")}
                                className="w-5 h-5 border-[1.5px] border-black rounded accent-black cursor-pointer"
                              />
                            </label>
                          </>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <span className="text-sm font-black font-mono text-gray-900 group-hover:text-[#FF9800]">F&M</span>
                          <input
                            type="checkbox"
                            checked={row.fem}
                            onChange={() => handleCheckboxChange(idx, "fem")}
                            className="w-5 h-5 border-[1.5px] border-black rounded accent-black cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center border-b-[1.5px] border-black py-2 print:hidden">
              <button
                type="button"
                onClick={handleAddParticularRow}
                className="inline-flex items-center gap-2 rounded-md border border-[#FF9800] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-[#111827] hover:bg-orange-50 transition-colors"
              >
                <Plus size={14} /> Add another entry
              </button>
            </div>

            {/* ROW 8: REASON FOR CHANGE REQUIRED (Gray Shaded Section Bar) */}
            <div className="bg-[#d1d5db] border-b-[1.5px] border-black py-1.5 text-center font-black uppercase tracking-wider text-[11px] text-black">
              REASON FOR CHANGE REQUIRED
            </div>

            {/* REASON BODY with Product (F, M), Process (F, M), Other any one */}
            <div className="p-3 border-b-[1.5px] border-black bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2 pb-2 border-b border-gray-200 text-xs font-black">
                {/* Product Section */}
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 border border-gray-300 rounded">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reason.product}
                      onChange={(e) => setFormData({
                        ...formData,
                        reason: { ...formData.reason, product: e.target.checked }
                      })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="uppercase">Product</span>
                  </label>
                  <span className="text-gray-400">|</span>
                  <label className="flex items-center gap-1 text-[11px] font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reason.productF}
                      onChange={(e) => setFormData({
                        ...formData,
                        reason: { ...formData.reason, productF: e.target.checked }
                      })}
                      className="w-3.5 h-3.5 accent-black"
                    />
                    <span>F</span>
                  </label>
                  <label className="flex items-center gap-1 text-[11px] font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reason.productM}
                      onChange={(e) => setFormData({
                        ...formData,
                        reason: { ...formData.reason, productM: e.target.checked }
                      })}
                      className="w-3.5 h-3.5 accent-black"
                    />
                    <span>M</span>
                  </label>
                </div>

                {/* Process Section */}
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 border border-gray-300 rounded">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reason.process}
                      onChange={(e) => setFormData({
                        ...formData,
                        reason: { ...formData.reason, process: e.target.checked }
                      })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="uppercase">Process</span>
                  </label>
                  <span className="text-gray-400">|</span>
                  <label className="flex items-center gap-1 text-[11px] font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reason.processF}
                      onChange={(e) => setFormData({
                        ...formData,
                        reason: { ...formData.reason, processF: e.target.checked }
                      })}
                      className="w-3.5 h-3.5 accent-black"
                    />
                    <span>F</span>
                  </label>
                  <label className="flex items-center gap-1 text-[11px] font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reason.processM}
                      onChange={(e) => setFormData({
                        ...formData,
                        reason: { ...formData.reason, processM: e.target.checked }
                      })}
                      className="w-3.5 h-3.5 accent-black"
                    />
                    <span>M</span>
                  </label>
                </div>

                {/* Other Any One */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 border border-gray-300 rounded">
                  <input
                    type="checkbox"
                    id="reason_other"
                    checked={formData.reason.other}
                    onChange={(e) => setFormData({
                      ...formData,
                      reason: { ...formData.reason, other: e.target.checked }
                    })}
                    className="w-4 h-4 accent-black"
                  />
                  <label htmlFor="reason_other" className="uppercase font-black text-xs cursor-pointer">
                    Other any one
                  </label>
                </div>
              </div>

              <textarea
                rows="3"
                placeholder="Specify detailed technical justification and rationale for change..."
                value={formData.reason.details}
                onChange={(e) => setFormData({
                  ...formData,
                  reason: { ...formData.reason, details: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 text-xs font-medium outline-none rounded focus:border-black resize-y"
              />
            </div>

            {/* ROW 9: CFT COMMENTS - FOUNDRY | CFT COMMENTS - MACHINE SHOP */}
            <div className="grid grid-cols-12 border-b-[1.5px] border-black">
              {/* Left Column: CFT COMMENTS - FOUNDRY */}
              <div className="col-span-12 sm:col-span-6 border-b sm:border-b-0 sm:border-r-[1.5px] border-black flex flex-col">
                <div className="bg-[#d1d5db] border-b-[1.5px] border-black py-1.5 text-center font-black uppercase text-[10px] tracking-wider text-black">
                  CFT COMMENTS - FOUNDRY
                </div>
                
                <div className="p-3 flex-1 flex flex-col justify-between space-y-3 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.foundry.isProcess}
                          onChange={(e) => setFormData({
                            ...formData,
                            foundry: { ...formData.foundry, isProcess: e.target.checked }
                          })}
                          className="w-3.5 h-3.5 accent-black"
                        />
                        <span>Process</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.foundry.isProduct}
                          onChange={(e) => setFormData({
                            ...formData,
                            foundry: { ...formData.foundry, isProduct: e.target.checked }
                          })}
                          className="w-3.5 h-3.5 accent-black"
                        />
                        <span>Product</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-black">
                      <label className="flex items-center gap-1 text-green-700 cursor-pointer">
                        <input
                          type="radio"
                          name="foundry_feasibility"
                          value="feasible"
                          checked={formData.foundry.feasibility === "feasible"}
                          onChange={() => setFormData({
                            ...formData,
                            foundry: { ...formData.foundry, feasibility: "feasible" }
                          })}
                          className="w-3.5 h-3.5 accent-green-600"
                        />
                        <span>Feasible</span>
                      </label>
                      <label className="flex items-center gap-1 text-red-700 cursor-pointer">
                        <input
                          type="radio"
                          name="foundry_feasibility"
                          value="not_feasible"
                          checked={formData.foundry.feasibility === "not_feasible"}
                          onChange={() => setFormData({
                            ...formData,
                            foundry: { ...formData.foundry, feasibility: "not_feasible" }
                          })}
                          className="w-3.5 h-3.5 accent-red-600"
                        />
                        <span>Not feasible</span>
                      </label>
                    </div>
                  </div>

                  <textarea
                    rows="3"
                    placeholder="Foundry technical evaluation & comments..."
                    value={formData.foundry.comments}
                    onChange={(e) => setFormData({
                      ...formData,
                      foundry: { ...formData.foundry, comments: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-300 text-xs font-medium outline-none rounded focus:border-black resize-none"
                  />

                  {/* Foundry Signature Row */}
                  <div className="grid grid-cols-12 gap-2 pt-2 border-t border-gray-300">
                    <div className="col-span-7 flex items-center">
                      <span className="font-bold uppercase text-[9px] whitespace-nowrap mr-1">CFT Leader Signature :</span>
                      <input
                        type="text"
                        
                        value={formData.foundry.leaderSign}
                        onChange={(e) => setFormData({
                          ...formData,
                          foundry: { ...formData.foundry, leaderSign: e.target.value }
                        })}
                        className="w-full min-h-[24px] text-xs font-bold border-0 outline-none px-1 bg-transparent"
                      />
                    </div>
                    <div className="col-span-5 flex items-center">
                      <span className="font-bold uppercase text-[9px] whitespace-nowrap mr-1">Date :</span>
                      <input
                        type="date"
                        value={formData.foundry.date}
                        onChange={(e) => setFormData({
                          ...formData,
                          foundry: { ...formData.foundry, date: e.target.value }
                        })}
                        className="w-full min-h-[24px] text-[10px] font-bold border-0 outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: CFT COMMENTS - MACHINE SHOP */}
              <div className="col-span-12 sm:col-span-6 flex flex-col">
                <div className="bg-[#d1d5db] border-b-[1.5px] border-black py-1.5 text-center font-black uppercase text-[10px] tracking-wider text-black">
                  CFT COMMENTS - MACHINE SHOP
                </div>
                
                <div className="p-3 flex-1 flex flex-col justify-between space-y-3 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.machineShop.isProcessOnly}
                          onChange={(e) => setFormData({
                            ...formData,
                            machineShop: { ...formData.machineShop, isProcessOnly: e.target.checked }
                          })}
                          className="w-3.5 h-3.5 accent-black"
                        />
                        <span>Process only</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.machineShop.isProduct}
                          onChange={(e) => setFormData({
                            ...formData,
                            machineShop: { ...formData.machineShop, isProduct: e.target.checked }
                          })}
                          className="w-3.5 h-3.5 accent-black"
                        />
                        <span>Product</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-black">
                      <label className="flex items-center gap-1 text-green-700 cursor-pointer">
                        <input
                          type="radio"
                          name="ms_feasibility"
                          value="feasible"
                          checked={formData.machineShop.feasibility === "feasible"}
                          onChange={() => setFormData({
                            ...formData,
                            machineShop: { ...formData.machineShop, feasibility: "feasible" }
                          })}
                          className="w-3.5 h-3.5 accent-green-600"
                        />
                        <span>Feasible</span>
                      </label>
                      <label className="flex items-center gap-1 text-red-700 cursor-pointer">
                        <input
                          type="radio"
                          name="ms_feasibility"
                          value="not_feasible"
                          checked={formData.machineShop.feasibility === "not_feasible"}
                          onChange={() => setFormData({
                            ...formData,
                            machineShop: { ...formData.machineShop, feasibility: "not_feasible" }
                          })}
                          className="w-3.5 h-3.5 accent-red-600"
                        />
                        <span>Not feasible</span>
                      </label>
                    </div>
                  </div>

                  <textarea
                    rows="3"
                    placeholder="Machine shop machining, tooling & fixture comments..."
                    value={formData.machineShop.comments}
                    onChange={(e) => setFormData({
                      ...formData,
                      machineShop: { ...formData.machineShop, comments: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-300 text-xs font-medium outline-none rounded focus:border-black resize-none"
                  />

                  {/* Machine Shop Signature Row */}
                  <div className="grid grid-cols-12 gap-2 pt-2 border-t border-gray-300">
                    <div className="col-span-7 flex items-center">
                      <span className="font-bold uppercase text-[9px] whitespace-nowrap mr-1">CFT Leader Signature :</span>
                      <input
                        type="text"
                        
                        value={formData.machineShop.leaderSign}
                        onChange={(e) => setFormData({
                          ...formData,
                          machineShop: { ...formData.machineShop, leaderSign: e.target.value }
                        })}
                        className="w-full min-h-[24px] text-xs font-bold border-0 outline-none px-1 bg-transparent"
                      />
                    </div>
                    <div className="col-span-5 flex items-center">
                      <span className="font-bold uppercase text-[9px] whitespace-nowrap mr-1">Date :</span>
                      <input
                        type="date"
                        value={formData.machineShop.date}
                        onChange={(e) => setFormData({
                          ...formData,
                          machineShop: { ...formData.machineShop, date: e.target.value }
                        })}
                        className="w-full min-h-[24px] text-[10px] font-bold border-0 outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 10: INTERNAL APPROVAL (Gray Shaded Section Bar) */}
            <div className="bg-[#d1d5db] border-b-[1.5px] border-black py-1.5 text-center font-black uppercase tracking-wider text-[11px] text-black">
              INTERNAL APPROVAL
            </div>

            {/* INTERNAL APPROVAL GRID */}
            <div className="grid grid-cols-12 border-b-[1.5px] border-black divide-y sm:divide-y-0 sm:divide-x-[1.5px] divide-black bg-white">
              {/* Left Sub-Grid: Approved / Rejected / If others */}
              <div className="col-span-12 sm:col-span-6 p-2 flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase text-green-800">
                    <input
                      type="checkbox"
                      checked={formData.approval.approved}
                      onChange={(e) => setFormData({
                        ...formData,
                        approval: { ...formData.approval, approved: e.target.checked, rejected: false }
                      })}
                      className="w-4 h-4 border border-black accent-green-600"
                    />
                    <span>Approved</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase text-red-800">
                    <input
                      type="checkbox"
                      checked={formData.approval.rejected}
                      onChange={(e) => setFormData({
                        ...formData,
                        approval: { ...formData.approval, rejected: e.target.checked, approved: false }
                      })}
                      className="w-4 h-4 border border-black accent-red-600"
                    />
                    <span>Rejected</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                  <label className="flex items-center gap-1.5 font-bold text-[10px] uppercase text-gray-700 whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.approval.ifOthers}
                      onChange={(e) => setFormData({
                        ...formData,
                        approval: { ...formData.approval, ifOthers: e.target.checked }
                      })}
                      className="w-3.5 h-3.5 accent-black"
                    />
                    <span>If others, specify :</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Specify other approval condition..."
                    value={formData.approval.othersSpecify}
                    onChange={(e) => setFormData({
                      ...formData,
                      approval: { ...formData.approval, othersSpecify: e.target.value }
                    })}
                    className="w-full text-xs font-medium border-b border-gray-300 outline-none px-1"
                  />
                </div>
              </div>

              {/* Right Sub-Grid: Approving Authority: PLANT HEAD | Signature */}
              <div className="col-span-12 sm:col-span-6 divide-y divide-black">
                <div className="grid grid-cols-12 divide-x divide-black p-0">
                  <div className="col-span-5 px-3 py-2 font-bold uppercase text-[10px] text-gray-800 flex items-center bg-gray-50">
                    Approving Authority
                  </div>
                  <div className="col-span-7 px-3 py-2 font-black uppercase text-xs text-black flex items-center justify-center">
                    PLANT HEAD
                  </div>
                </div>
                <div className="grid grid-cols-12 divide-x divide-black p-0">
                  <div className="col-span-5 px-3 py-2 font-bold uppercase text-[10px] text-gray-800 flex items-center bg-gray-50">
                    Signature
                  </div>
                  <div className="col-span-7 px-2 py-1.5 flex items-center">
                    <input
                      type="text"
                      
                      value={formData.approval.signature}
                      onChange={(e) => setFormData({
                        ...formData,
                        approval: { ...formData.approval, signature: e.target.value }
                      })}
                      className="w-full text-xs font-bold outline-none px-1 py-0.5 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 11: CUSTOMER COMMUNICATION DETAIL (Gray Shaded Section Bar) */}
            <div className="bg-[#d1d5db] border-b-[1.5px] border-black py-1.5 text-center font-black uppercase tracking-wider text-[11px] text-black">
              CUSTOMER COMMUNICATION DETAIL
            </div>

            {/* CUSTOMER COMMUNICATION DETAIL BODY - blank writing area as in the paper form */}
            <div className="min-h-[115px] bg-white p-3">
              <textarea
                rows="4"
                value={formData.customerCommunication.additionalNotes}
                onChange={(e) => setFormData({
                  ...formData,
                  customerCommunication: {
                    ...formData.customerCommunication,
                    additionalNotes: e.target.value,
                  },
                })}
                className="w-full min-h-[95px] resize-y border-0 bg-transparent p-1 text-xs outline-none focus:ring-1 focus:ring-[#FF9800]"
              />
            </div>

          </div>

          {/* EXACT BOTTOM FOOTER LINE AS IN THE SCANNED SHEET */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-bold text-gray-800 mt-2 px-1 gap-1">
            <span className="font-mono tracking-tight">QF/07/MRO-15, Rev.No: 03 dt 04.10.2021</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProcessChangeRequisitionForm;

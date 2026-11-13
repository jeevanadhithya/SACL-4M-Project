import React, { useState } from "react";
import FormWrapper from "./FormWrapper";
import ChecklistTrackingTable from "./ChecklistTrackingTable";

const initialItemsPart2 = [
  { name: "Process FMEA", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Jigs / Tool / Gauge / Pattern / Drawings / Layout", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Jigs / Tool / Gauge / Pattern modification (Physical Modification)", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Calibration Cards (for part specific Gauges)", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "MSA", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Product Cost", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Approved list of Sub - Contractors", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Action on parts already produced and available on Stock", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Actions on Sub - Contractor", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Sub - Contractor Part Approval", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
];

const ChecklistTrackingPart2 = () => {
  const [meta, setMeta] = useState({
    productCode: "",
    customerName: "",
    productDescription: "",
    customerPartNo: ""
  });
  const [items, setItems] = useState(initialItemsPart2);
  const [savedMsg, setSavedMsg] = useState("");
  const [isDownloadingPdf] = useState(false);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSave = async () => {
    localStorage.setItem("saved_tracking_part2", JSON.stringify({ meta, items }));

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${apiUrl}/api/change-tracking/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          part: 2,
          partNo: meta.customerPartNo || meta.productCode || `CT2-${Date.now()}`,
          customer: meta.customerName,
          formData: { meta, items },
        }),
      });

      if (!response.ok) throw new Error("Server save failed");
      setSavedMsg("Checklist Part 2 saved successfully to database!");
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
      title="CHECKLIST FOR MANAGING AND TRACKING CHANGE"
      qfNo="QF/07/MRO-03"
      revDate="01.12.2003"
      onSave={handleSave}
      onPrint={handlePrint}
      isDownloadingPdf={isDownloadingPdf}
    >
      {savedMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm font-bold print:hidden">
          {savedMsg}
        </div>
      )}

      {/* Header 2-row Product and Customer Details */}
      <div className="border-b-[1.5px] border-black text-xs">
        <div className="grid grid-cols-12 border-b-[1.5px] border-black">
          <div className="col-span-6 border-r-[1.5px] border-black px-2 py-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">PRODUCT CODE :-</span>
            <input
              type="text"
              value={meta.productCode}
              onChange={(e) => setMeta({ ...meta, productCode: e.target.value })}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-6 px-2 py-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">CUSTOMER NAME :-</span>
            <input
              type="text"
              value={meta.customerName}
              onChange={(e) => setMeta({ ...meta, customerName: e.target.value })}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-6 border-r-[1.5px] border-black px-2 py-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">PRODUCT DESCRIPTION :-</span>
            <input
              type="text"
              value={meta.productDescription}
              onChange={(e) => setMeta({ ...meta, productDescription: e.target.value })}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
          <div className="col-span-6 px-2 py-1.5 flex items-center">
            <span className="font-bold uppercase text-[10px] whitespace-nowrap mr-1">CUSTOMER PART NO :-</span>
            <input
              type="text"
              value={meta.customerPartNo}
              onChange={(e) => setMeta({ ...meta, customerPartNo: e.target.value })}
              className="w-full font-bold outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      <ChecklistTrackingTable items={items} onUpdateItem={updateItem} />

      <div className="flex justify-between items-center text-[10px] font-bold text-gray-800 p-1 border-t-[1.5px] border-black font-mono">
        <span>QF / 07 / MRO – 03</span>
        <span>Page No :- 02 of 04</span>
      </div>
    </FormWrapper>
  );
};

export default ChecklistTrackingPart2;

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
  const [items, setItems] = useState(initialItemsPart2);
  const [savedMsg, setSavedMsg] = useState("");

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSave = () => {
    localStorage.setItem("saved_tracking_part2", JSON.stringify(items));
    setSavedMsg("Checklist Part 2 saved successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <FormWrapper
      title="CHECKLIST FOR MANAGING AND TRACKING CHANGE (PAGE 2 OF 4)"
      qfNo="QF/07/MRO-03"
      revDate="01.12.2003"
      onSave={handleSave}
      onPrint={() => window.print()}
    >
      {savedMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm font-bold">
          {savedMsg}
        </div>
      )}

      <ChecklistTrackingTable items={items} onUpdateItem={updateItem} />
    </FormWrapper>
  );
};

export default ChecklistTrackingPart2;

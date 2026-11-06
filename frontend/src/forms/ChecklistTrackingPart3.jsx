import React, { useState } from "react";
import FormWrapper from "./FormWrapper";
import ChecklistTrackingTable from "./ChecklistTrackingTable";

const initialItemsPart3 = [
  { name: "Any Special Characteristics", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "SPC affected?", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Checking Aids / Gauges", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Production Trial Run", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "PAP", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Master List of: a) Drawings", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Master List of: b) Engineering / Material Specification", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Master List of: c) Process Flow Diagram", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Master List of: d) Control Plan", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Master List of: e) Work Instruction", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Master List of: h) Process FMEA", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
];

const ChecklistTrackingPart3 = () => {
  const [items, setItems] = useState(initialItemsPart3);
  const [savedMsg, setSavedMsg] = useState("");

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSave = () => {
    localStorage.setItem("saved_tracking_part3", JSON.stringify(items));
    setSavedMsg("Checklist Part 3 saved successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <FormWrapper
      title="CHECKLIST FOR MANAGING AND TRACKING CHANGE (PAGE 3 OF 4)"
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

export default ChecklistTrackingPart3;

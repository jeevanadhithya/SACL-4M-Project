import React, { useState } from "react";
import FormWrapper from "./FormWrapper";
import ChecklistTrackingTable from "./ChecklistTrackingTable";

const initialItemsPart1 = [
  { name: "Assembly Drawing Change", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Component Drawing Change", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Engineering Specification", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Material Specification", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Process Flow Diagram", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Control Plan", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Product Audit Check Sheet", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Work Instruction", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
  { name: "Visual Aids", affected: false, action: "", resp: "", reqdDate: "", actualDate: "", docNo: "", curRev: "", remarks: "" },
];

const ChecklistTrackingPart1 = () => {
  const [meta, setMeta] = useState({
    productCode: "",
    customerName: "",
    productDescription: "",
    customerPartNo: ""
  });
  const [items, setItems] = useState(initialItemsPart1);
  const [savedMsg, setSavedMsg] = useState("");

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSave = () => {
    localStorage.setItem("saved_tracking_part1", JSON.stringify({ meta, items }));
    setSavedMsg("Checklist Part 1 saved successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <FormWrapper
      title="CHECKLIST FOR MANAGING AND TRACKING CHANGE (PAGE 1 OF 4)"
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

      {/* Product & Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-gray-900 mb-6 divide-y md:divide-y-0 md:divide-x-2 divide-gray-900 bg-gray-50/50">
        <div className="p-3">
          <label className="text-[10px] font-black uppercase text-gray-500 block">Product Code:</label>
          <input
            type="text"
            value={meta.productCode}
            onChange={(e) => setMeta({ ...meta, productCode: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent"
          />
        </div>
        <div className="p-3">
          <label className="text-[10px] font-black uppercase text-gray-500 block">Customer Name:</label>
          <input
            type="text"
            value={meta.customerName}
            onChange={(e) => setMeta({ ...meta, customerName: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent"
          />
        </div>
        <div className="p-3">
          <label className="text-[10px] font-black uppercase text-gray-500 block">Product Description:</label>
          <input
            type="text"
            value={meta.productDescription}
            onChange={(e) => setMeta({ ...meta, productDescription: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent"
          />
        </div>
        <div className="p-3">
          <label className="text-[10px] font-black uppercase text-gray-500 block">Customer Part No:</label>
          <input
            type="text"
            value={meta.customerPartNo}
            onChange={(e) => setMeta({ ...meta, customerPartNo: e.target.value })}
            className="w-full font-bold outline-none border-b border-gray-300 focus:border-[#ff9100] bg-transparent"
          />
        </div>
      </div>

      <ChecklistTrackingTable items={items} onUpdateItem={updateItem} />
    </FormWrapper>
  );
};

export default ChecklistTrackingPart1;

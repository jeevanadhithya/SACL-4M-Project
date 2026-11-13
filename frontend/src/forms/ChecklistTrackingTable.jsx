import React from "react";
import GreenTickBox from "../components/GreenTickBox";

const ACTION_COMMENT_OPTIONS = [
  "-- Select Comment --",
  "Prod. change",
  "Desg. change",
  "Process change",
  "Authorization Approval",
];

const ChecklistTrackingTable = ({ items, onUpdateItem }) => {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse border-[1.5px] border-black text-xs">
        <thead className="bg-gray-100 font-bold border-b-[1.5px] border-black text-black">
          <tr>
            <th className="border-[1.5px] border-black p-2 text-left w-1/4" rowSpan="2">
              Impact of Change to be considered on
            </th>
            <th className="border-[1.5px] border-black p-1 text-center w-28" colSpan="2">
              Is affected?
            </th>
            <th className="border-[1.5px] border-black p-2 text-left w-1/4" rowSpan="2">
              Action Comments
              <span className="block text-[9px] font-normal text-gray-600 print:hidden">
                (Prod / Desg / Process change / Auth Approval)
              </span>
            </th>
            <th className="border-[1.5px] border-black p-2 text-left w-24" rowSpan="2">
              Responsibility
            </th>
            <th className="border-[1.5px] border-black p-1 text-center w-32" colSpan="2">
              Date
            </th>
            <th className="border-[1.5px] border-black p-1 text-center w-36" colSpan="2">
              Documents Changed
            </th>
            <th className="border-[1.5px] border-black p-2 text-left w-24" rowSpan="2">
              Remarks
            </th>
          </tr>
          <tr className="text-[10px] uppercase bg-gray-50 text-black">
            <th className="border border-black p-1 w-14 text-center">
              Yes <span className="text-[8px] text-green-700 font-mono block print:hidden">Next →</span>
            </th>
            <th className="border border-black p-1 w-14 text-center">
              No <span className="text-[8px] text-gray-500 font-mono block print:hidden">Terminate</span>
            </th>
            <th className="border border-black p-1 w-16 text-center">Reqd.</th>
            <th className="border border-black p-1 w-16 text-center">Actual</th>
            <th className="border border-black p-1 w-20 text-center">Doc. No.</th>
            <th className="border border-black p-1 w-16 text-center">Cur Rev. (No.)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, idx) => (
            <tr key={idx} className="border-b border-black hover:bg-yellow-50/40">
              <td className="border-[1.5px] border-black p-2 font-bold text-black bg-white">
                {row.name}
              </td>
              <td className="border border-black p-1 text-center bg-white">
                <div className="flex justify-center">
                  <GreenTickBox
                    id={`aff_yes_${idx}`}
                    size="sm"
                    checked={row.affected === true}
                    onChange={() => onUpdateItem(idx, "affected", true)}
                  />
                </div>
              </td>
              <td className="border border-black p-1 text-center bg-white">
                <div className="flex justify-center">
                  <GreenTickBox
                    id={`aff_no_${idx}`}
                    size="sm"
                    checked={row.affected === false}
                    onChange={() => onUpdateItem(idx, "affected", false)}
                  />
                </div>
              </td>
              <td className="border border-black p-1 bg-white">
                <div className="flex flex-col gap-1">
                  <select
                    value={
                      ACTION_COMMENT_OPTIONS.includes(row.action)
                        ? row.action
                        : row.action
                        ? "Custom"
                        : "-- Select Comment --"
                    }
                    onChange={(e) => {
                      if (e.target.value !== "Custom" && e.target.value !== "-- Select Comment --") {
                        onUpdateItem(idx, "action", e.target.value);
                      }
                    }}
                    className="w-full text-[10px] p-0.5 bg-transparent border border-gray-300 rounded font-bold print:hidden"
                  >
                    {ACTION_COMMENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="Custom">Custom Text...</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Action comment..."
                    value={row.action || ""}
                    onChange={(e) => onUpdateItem(idx, "action", e.target.value)}
                    className="w-full p-0.5 text-xs outline-none bg-transparent font-medium"
                  />
                </div>
              </td>
              <td className="border border-black p-1 bg-white">
                <input
                  type="text"
                  placeholder="Resp."
                  value={row.resp || ""}
                  onChange={(e) => onUpdateItem(idx, "resp", e.target.value)}
                  className="w-full p-1 text-xs outline-none bg-transparent font-medium"
                />
              </td>
              <td className="border border-black p-1 bg-white">
                <input
                  type="date"
                  value={row.reqdDate || ""}
                  onChange={(e) => onUpdateItem(idx, "reqdDate", e.target.value)}
                  className="w-full text-[10px] outline-none bg-transparent"
                />
              </td>
              <td className="border border-black p-1 bg-white">
                <input
                  type="date"
                  value={row.actualDate || ""}
                  onChange={(e) => onUpdateItem(idx, "actualDate", e.target.value)}
                  className="w-full text-[10px] outline-none bg-transparent"
                />
              </td>
              <td className="border border-black p-1 bg-white">
                <input
                  type="text"
                  placeholder="Doc #"
                  value={row.docNo || ""}
                  onChange={(e) => onUpdateItem(idx, "docNo", e.target.value)}
                  className="w-full p-1 text-xs outline-none bg-transparent"
                />
              </td>
              <td className="border border-black p-1 bg-white">
                <input
                  type="text"
                  placeholder="Rev (No.)"
                  value={row.curRev || ""}
                  onChange={(e) => onUpdateItem(idx, "curRev", e.target.value)}
                  className="w-full p-1 text-xs text-center outline-none bg-transparent font-bold"
                />
              </td>
              <td className="border border-black p-1 bg-white">
                <input
                  type="text"
                  placeholder="Remarks"
                  value={row.remarks || ""}
                  onChange={(e) => onUpdateItem(idx, "remarks", e.target.value)}
                  className="w-full p-1 text-xs outline-none bg-transparent"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChecklistTrackingTable;

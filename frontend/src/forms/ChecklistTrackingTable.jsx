import React from "react";

const ChecklistTrackingTable = ({ items, onUpdateItem }) => {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse border-2 border-gray-900 text-xs">
        <thead className="bg-gray-100 font-bold border-b-2 border-gray-900 text-gray-900">
          <tr>
            <th className="border-2 border-gray-900 p-2 text-left w-1/4" rowSpan="2">
              Impact of Change to be considered on
            </th>
            <th className="border-2 border-gray-900 p-1 text-center w-24" colSpan="2">
              Is affected?
            </th>
            <th className="border-2 border-gray-900 p-2 text-left w-1/4" rowSpan="2">
              Action Comments
            </th>
            <th className="border-2 border-gray-900 p-2 text-left w-28" rowSpan="2">
              Responsibility
            </th>
            <th className="border-2 border-gray-900 p-1 text-center w-36" colSpan="2">
              Date
            </th>
            <th className="border-2 border-gray-900 p-1 text-center w-36" colSpan="2">
              Documents Changed
            </th>
            <th className="border-2 border-gray-900 p-2 text-left w-28" rowSpan="2">
              Remarks
            </th>
          </tr>
          <tr className="text-[10px] uppercase bg-gray-50">
            <th className="border border-gray-400 p-1 w-12 text-center">Yes</th>
            <th className="border border-gray-400 p-1 w-12 text-center">No</th>
            <th className="border border-gray-400 p-1 w-20 text-center">Reqd.</th>
            <th className="border border-gray-400 p-1 w-20 text-center">Actual</th>
            <th className="border border-gray-400 p-1 w-24 text-center">Doc. No.</th>
            <th className="border border-gray-400 p-1 w-14 text-center">Cur Rev.</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-300 hover:bg-yellow-50/40">
              <td className="border-2 border-gray-900 p-2 font-bold text-gray-800 bg-gray-50/50">
                {row.name}
              </td>
              <td className="border border-gray-300 p-1 text-center">
                <input
                  type="radio"
                  name={`affected_${idx}`}
                  checked={row.affected === true}
                  onChange={() => onUpdateItem(idx, "affected", true)}
                  className="w-4 h-4 accent-[#ff9100]"
                />
              </td>
              <td className="border border-gray-300 p-1 text-center">
                <input
                  type="radio"
                  name={`affected_${idx}`}
                  checked={row.affected === false}
                  onChange={() => onUpdateItem(idx, "affected", false)}
                  className="w-4 h-4 accent-gray-500"
                />
              </td>
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  placeholder="Action comment"
                  value={row.action || ""}
                  onChange={(e) => onUpdateItem(idx, "action", e.target.value)}
                  className="w-full p-1 text-xs outline-none border-b border-gray-200 focus:border-[#ff9100]"
                />
              </td>
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  placeholder="Resp."
                  value={row.resp || ""}
                  onChange={(e) => onUpdateItem(idx, "resp", e.target.value)}
                  className="w-full p-1 text-xs outline-none border-b border-gray-200 focus:border-[#ff9100]"
                />
              </td>
              <td className="border border-gray-300 p-1">
                <input
                  type="date"
                  value={row.reqdDate || ""}
                  onChange={(e) => onUpdateItem(idx, "reqdDate", e.target.value)}
                  className="w-full text-[10px] outline-none"
                />
              </td>
              <td className="border border-gray-300 p-1">
                <input
                  type="date"
                  value={row.actualDate || ""}
                  onChange={(e) => onUpdateItem(idx, "actualDate", e.target.value)}
                  className="w-full text-[10px] outline-none"
                />
              </td>
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  placeholder="Doc #"
                  value={row.docNo || ""}
                  onChange={(e) => onUpdateItem(idx, "docNo", e.target.value)}
                  className="w-full p-1 text-xs outline-none border-b border-gray-200 focus:border-[#ff9100]"
                />
              </td>
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  placeholder="Rev"
                  value={row.curRev || ""}
                  onChange={(e) => onUpdateItem(idx, "curRev", e.target.value)}
                  className="w-full p-1 text-xs text-center outline-none border-b border-gray-200 focus:border-[#ff9100]"
                />
              </td>
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  placeholder="Remarks"
                  value={row.remarks || ""}
                  onChange={(e) => onUpdateItem(idx, "remarks", e.target.value)}
                  className="w-full p-1 text-xs outline-none border-b border-gray-200 focus:border-[#ff9100]"
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

const { sql, poolPromise } = require("../db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * 1. FETCH PROCESS CHANGE REQUISITION RECORD
 */
exports.getRecord = async (req, res) => {
  const { pcrfNo, date } = req.query;

  if (!pcrfNo && !date) {
    return res.status(400).json({ error: "pcrfNo or date is required" });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const request = pool.request();
    let query = "SELECT TOP 1 * FROM ConsultancyForms WHERE formType = 'process-change-requisition'";

    if (pcrfNo) {
      request.input("pcrfNo", sql.VarChar, String(pcrfNo).trim());
      query += " AND recordKey = @pcrfNo";
    } else if (date) {
      request.input("date", sql.VarChar, String(date).split("T")[0]);
      query += " AND recordKey = @date";
    }

    const result = await request.query(query);
    const record = result.recordset[0];

    if (!record) {
      return res.status(200).json(null);
    }

    let parsedData = {};
    try {
      parsedData = JSON.parse(record.formData);
    } catch (e) {
      parsedData = record.formData;
    }

    return res.status(200).json({
      ...record,
      formData: parsedData,
    });
  } catch (error) {
    console.error("Error fetching PCRF record:", error);
    return res.status(500).json({ error: "Failed to fetch record", message: error.message });
  }
};

/**
 * 2. SAVE OR UPDATE PROCESS CHANGE REQUISITION RECORD
 */
exports.saveRecord = async (req, res) => {
  const { recordKey, partName, customer, status, formData, remarks } = req.body;

  if (!formData) {
    return res.status(400).json({ error: "formData payload is required" });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const user = req.user || {};
    const key = recordKey || formData.pcrfNo || `PCRF-${Date.now()}`;
    const jsonContent = typeof formData === "string" ? formData : JSON.stringify(formData);

    const request = pool.request();
    request.input("formType", sql.VarChar, "process-change-requisition");
    request.input("recordKey", sql.VarChar, String(key).trim());
    request.input("partName", sql.VarChar, partName || formData.partName || "");
    request.input("customer", sql.VarChar, customer || formData.customer || "");
    request.input("status", sql.VarChar, status || (formData.approval?.approved ? "Approved" : "Pending Approval"));
    request.input("formData", sql.NVarChar(sql.MAX), jsonContent);
    request.input("remarks", sql.NVarChar(sql.MAX), remarks || "");
    request.input("username", sql.VarChar, user.username || "System");

    const query = `
      IF EXISTS (SELECT 1 FROM ConsultancyForms WHERE formType = @formType AND recordKey = @recordKey)
      BEGIN
        UPDATE ConsultancyForms
        SET partName = @partName,
            customer = @customer,
            status = @status,
            formData = @formData,
            remarks = @remarks,
            lastUpdatedBy = @username,
            updatedAt = GETDATE()
        WHERE formType = @formType AND recordKey = @recordKey;
        SELECT 'UPDATED' as action, id FROM ConsultancyForms WHERE formType = @formType AND recordKey = @recordKey;
      END
      ELSE
      BEGIN
        INSERT INTO ConsultancyForms (formType, recordKey, partName, customer, status, formData, remarks, createdBy, lastUpdatedBy, createdAt, updatedAt)
        VALUES (@formType, @recordKey, @partName, @customer, @status, @formData, @remarks, @username, @username, GETDATE(), GETDATE());
        SELECT 'CREATED' as action, SCOPE_IDENTITY() as id;
      END
    `;

    const result = await request.query(query);
    const row = result.recordset[0] || {};

    return res.status(200).json({
      message: `Process Change Requisition ${row.action === "UPDATED" ? "updated" : "saved"} successfully`,
      action: row.action,
      id: row.id,
      recordKey: key,
    });
  } catch (error) {
    console.error("Error saving PCRF record:", error);
    return res.status(500).json({ error: "Failed to save record", message: error.message });
  }
};

/**
 * 3. BACKEND PDF GENERATION (PDFKit Stream)
 * Generates official A4 portrait Process Change Requisition Form (QF/07/MRO-15 Rev.03)
 */
exports.generateReport = async (req, res) => {
  try {
    const { pcrfNo, date } = req.query;

    let formData = null;

    if (pcrfNo || date) {
      const pool = await poolPromise;
      if (pool) {
        const request = pool.request();
        let query = "SELECT TOP 1 formData FROM ConsultancyForms WHERE formType = 'process-change-requisition'";
        if (pcrfNo) {
          request.input("pcrfNo", sql.VarChar, String(pcrfNo).trim());
          query += " AND recordKey = @pcrfNo";
        } else if (date) {
          request.input("date", sql.VarChar, String(date).split("T")[0]);
          query += " AND recordKey = @date";
        }
        const result = await request.query(query);
        if (result.recordset[0]) {
          try {
            formData = JSON.parse(result.recordset[0].formData);
          } catch (e) {
            formData = null;
          }
        }
      }
    }

    if (!formData) {
      formData = {
        requisitionBy: "Foundry / Machine Shop Incharge",
        pcrfNo: pcrfNo || "PCRF-2026-001",
        department: "Machine Shop",
        date: date || new Date().toISOString().split("T")[0],
        customer: "OEM Automotive",
        partName: "Steering Knuckle",
        partNo: "SK-9021",
        classification: { man: false, machine: true, material: false, method: true },
        particularsRows: [{ id: 1, particular: "CNC Machining Fixture & Tool Offset", currentStatus: "Rev 2", f: false, m: true, fem: false }],
        reason: { product: false, process: true, other: false, details: "Tool life enhancement and cycle time reduction." },
        foundry: { feasibility: "Feasible", comments: "No change to raw casting required.", leaderSign: "K. Murugan", date: "2026-11-07" },
        machineShop: { feasibility: "Feasible", comments: "Insert grade tested for 250 parts.", leaderSign: "S. Arumugam", date: "2026-11-07" },
        approval: { approved: true, approvingAuthority: "PLANT HEAD", signature: "Approved" },
        customerCommunication: { changeReflectionInSop: true, nextForwarded: true, handleNotes: "Customer notified via change notice." },
      };
    }

    const doc = new PDFDocument({ margin: 28, size: "A4", layout: "portrait", bufferPages: true, autoPageBreak: false });
    const filename = `ProcessChangeRequisition_${formData.pcrfNo || "Form"}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    doc.pipe(res);

    const startX = 28;
    const startY = 28;
    const pageWidth = doc.page.width - 56; // ~539 pt
    let currentY = startY;

    // Header Box
    doc.lineWidth(1).rect(startX, currentY, pageWidth, 55).stroke();

    // Logo
    const logoPath = path.join(__dirname, "logo.jpg");
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, startX + 5, currentY + 6, { width: 45, height: 42 });
      } catch (e) {}
    }

    doc.font("Helvetica-Bold").fontSize(13).text("SAKTHI AUTO COMPONENT LIMITED", startX + 60, currentY + 14, { width: 330, align: "center" });
    doc.font("Helvetica-Bold").fontSize(10.5).text("PROCESS CHANGE REQUISITION FORM", startX + 60, currentY + 32, { width: 330, align: "center" });

    doc.lineWidth(0.5).rect(startX + 400, currentY, pageWidth - 400, 55).stroke();
    doc.font("Helvetica").fontSize(7.5);
    doc.text(`PCRF No: ${formData.pcrfNo || "-"}`, startX + 405, currentY + 12);
    doc.text(`Date: ${formData.date || "-"}`, startX + 405, currentY + 26);
    doc.font("Helvetica-Bold").fontSize(7).text("QF/07/MRO-15 Rev.03", startX + 405, currentY + 40);

    currentY += 55;

    // Meta Section
    const colW = pageWidth / 3;
    const rowH = 18;

    const drawCell = (x, y, w, h, title, val) => {
      doc.lineWidth(0.5).rect(x, y, w, h).stroke();
      doc.font("Helvetica-Bold").fontSize(7).text(title, x + 3, y + 4);
      doc.font("Helvetica").fontSize(7.5).text(String(val || "-"), x + 3, y + 11);
    };

    drawCell(startX, currentY, colW, rowH, "REQUISITION BY", formData.requisitionBy);
    drawCell(startX + colW, currentY, colW, rowH, "REQUISITIONER SIGN", formData.requisitionerSign);
    drawCell(startX + colW * 2, currentY, colW, rowH, "PCRF NO", formData.pcrfNo);
    currentY += rowH;

    drawCell(startX, currentY, colW, rowH, "DEPARTMENT", formData.department);
    drawCell(startX + colW, currentY, colW, rowH, "HOD SIGN", formData.hodSign);
    drawCell(startX + colW * 2, currentY, colW, rowH, "DATE", formData.date);
    currentY += rowH;

    drawCell(startX, currentY, colW, rowH, "CUSTOMER", formData.customer);
    drawCell(startX + colW, currentY, colW, rowH, "PART NAME", formData.partName);
    drawCell(startX + colW * 2, currentY, colW, rowH, "PART NO", formData.partNo);
    currentY += rowH;

    // 4M Classification Bar
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 20).stroke();
    doc.font("Helvetica-Bold").fontSize(7.5).text("CLASSIFICATION (4M):", startX + 6, currentY + 6);

    const mY = currentY + 6;
    const manStr = formData.classification?.man ? "[X] MAN" : "[ ] MAN";
    const mcStr = formData.classification?.machine ? "[X] MACHINE" : "[ ] MACHINE";
    const matStr = formData.classification?.material ? "[X] MATERIAL" : "[ ] MATERIAL";
    const methStr = formData.classification?.method ? "[X] METHOD" : "[ ] METHOD";

    doc.font("Helvetica-Bold").fontSize(8);
    doc.text(manStr, startX + 130, mY);
    doc.text(mcStr, startX + 220, mY);
    doc.text(matStr, startX + 320, mY);
    doc.text(methStr, startX + 430, mY);

    currentY += 20;

    // Details of Change Required Table
    const tableHeaderH = 18;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, tableHeaderH).fillAndStroke("#F0F0F0", "#000000");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(7.5);
    doc.text("S.No", startX + 4, currentY + 5);
    doc.text("PARTICULARS", startX + 35, currentY + 5);
    doc.text("CURRENT STATUS", startX + 260, currentY + 5);
    doc.text("CHANGE REQUIRED (F / M / F&M)", startX + 395, currentY + 5);

    currentY += tableHeaderH;

    const rows = formData.particularsRows || [{ particular: "-", currentStatus: "-", f: false, m: false, fem: false }];
    rows.forEach((r, idx) => {
      const itemH = 20;
      doc.lineWidth(0.5).rect(startX, currentY, pageWidth, itemH).stroke();
      doc.font("Helvetica").fontSize(7.5);
      doc.text(String(idx + 1), startX + 6, currentY + 6);
      doc.text(r.particular || "-", startX + 35, currentY + 6, { width: 220 });
      doc.text(r.currentStatus || "-", startX + 260, currentY + 6, { width: 130 });

      const fBox = r.f ? "[X] F" : "[ ] F";
      const mBox = r.m ? "[X] M" : "[ ] M";
      const femBox = r.fem ? "[X] F&M" : "[ ] F&M";
      doc.text(`${fBox}   ${mBox}   ${femBox}`, startX + 395, currentY + 6);
      currentY += itemH;
    });

    // Reason for Change Required
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 42).stroke();
    doc.font("Helvetica-Bold").fontSize(8).text("REASON FOR CHANGE REQUIRED", startX + 6, currentY + 4);
    const prodCheck = formData.reason?.product ? "[X] Product" : "[ ] Product";
    const procCheck = formData.reason?.process ? "[X] Process" : "[ ] Process";
    const othCheck = formData.reason?.other ? "[X] Other" : "[ ] Other";
    doc.font("Helvetica-Bold").fontSize(7.5).text(`Category: ${prodCheck}     ${procCheck}     ${othCheck}`, startX + 6, currentY + 16);
    doc.font("Helvetica").fontSize(7.5).text(`Details: ${formData.reason?.details || "-"}`, startX + 6, currentY + 28, { width: pageWidth - 12 });
    currentY += 42;

    // CFT Comments
    const cftW = pageWidth / 2;
    const cftH = 50;
    doc.lineWidth(0.5).rect(startX, currentY, cftW, cftH).stroke();
    doc.rect(startX + cftW, currentY, cftW, cftH).stroke();

    doc.font("Helvetica-Bold").fontSize(7.5).text("CFT COMMENTS - FOUNDRY", startX + 6, currentY + 5);
    doc.font("Helvetica").fontSize(7).text(`Feasibility: ${formData.foundry?.feasibility || "-"}`, startX + 6, currentY + 16);
    doc.text(`Comments: ${formData.foundry?.comments || "-"}`, startX + 6, currentY + 26, { width: cftW - 12 });
    doc.text(`Leader Sign: ${formData.foundry?.leaderSign || "-"}    Date: ${formData.foundry?.date || "-"}`, startX + 6, currentY + 39);

    doc.font("Helvetica-Bold").fontSize(7.5).text("CFT COMMENTS - MACHINE SHOP", startX + cftW + 6, currentY + 5);
    doc.font("Helvetica").fontSize(7).text(`Feasibility: ${formData.machineShop?.feasibility || "-"}`, startX + cftW + 6, currentY + 16);
    doc.text(`Comments: ${formData.machineShop?.comments || "-"}`, startX + cftW + 6, currentY + 26, { width: cftW - 12 });
    doc.text(`Leader Sign: ${formData.machineShop?.leaderSign || "-"}    Date: ${formData.machineShop?.date || "-"}`, startX + cftW + 6, currentY + 39);

    currentY += cftH;

    // Internal Approval Box
    const appH = 34;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, appH).stroke();
    doc.font("Helvetica-Bold").fontSize(8).text("INTERNAL APPROVAL", startX + 6, currentY + 4);
    const appB = formData.approval?.approved ? "[X] APPROVED" : "[ ] APPROVED";
    const rejB = formData.approval?.rejected ? "[X] REJECTED" : "[ ] REJECTED";
    doc.font("Helvetica-Bold").fontSize(8).text(`${appB}      ${rejB}`, startX + 6, currentY + 16);
    doc.font("Helvetica").fontSize(7.5).text(`Approving Authority: ${formData.approval?.approvingAuthority || "PLANT HEAD"}`, startX + 280, currentY + 16);
    doc.text(`Signature: ${formData.approval?.signature || "Signed"}`, startX + 280, currentY + 24);

    currentY += appH;

    // Customer Communication Detail
    const custH = 34;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, custH).stroke();
    doc.font("Helvetica-Bold").fontSize(8).text("CUSTOMER COMMUNICATION DETAIL", startX + 6, currentY + 4);
    const sopB = formData.customerCommunication?.changeReflectionInSop ? "[X]" : "[ ]";
    const fwdB = formData.customerCommunication?.nextForwarded ? "[X]" : "[ ]";
    doc.font("Helvetica").fontSize(7.5).text(`Actions: ${sopB} Change reflection in SOP      ${fwdB} Forwarded to Next Level`, startX + 6, currentY + 15);
    doc.text(`Notes: ${formData.customerCommunication?.handleNotes || "-"}`, startX + 6, currentY + 24, { width: pageWidth - 12 });

    // Footer QF String
    doc.font("Helvetica-Bold").fontSize(8).text("QF/07/MRO-15, Rev.No: 03 dt 04.10.2021", startX, doc.page.height - 20);

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF report" });
    }
  }
};

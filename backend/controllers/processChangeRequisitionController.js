const { sql, poolPromise } = require("../db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { getLogoPath, drawCheckbox, drawFormHeader } = require("../utils/pdfTheme");

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

    // Header Box with centered title and Sakthi Logo from backend/assets
    const headerH = drawFormHeader(doc, {
      startX,
      currentY,
      pageWidth,
      title: "PROCESS CHANGE REQUISITION FORM",
      qfNo: "QF/07/MRO-15 Rev.03",
      docNo: formData.pcrfNo || "-",
      revDate: "dt 04.10.2021",
    });
    currentY += headerH;

    // Meta Section
    const colW = pageWidth / 3;
    const rowH = 18;

    const drawCell = (x, y, w, h, title, val) => {
      doc.lineWidth(0.5).strokeColor("#000000").rect(x, y, w, h).stroke();
      doc.font("Helvetica-Bold").fontSize(7).fillColor("#374151").text(title, x + 3, y + 4);
      doc.font("Helvetica").fontSize(7.5).fillColor("#000000").text(String(val || "-"), x + 3, y + 11);
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

    // 4M Classification Bar with Green Ticks
    doc.lineWidth(0.5).strokeColor("#000000").rect(startX, currentY, pageWidth, 22).stroke();
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#111827").text("CLASSIFICATION :", startX + 6, currentY + 7);

    const mY = currentY + 6;
    drawCheckbox(doc, startX + 130, mY, !!formData.classification?.man, 10);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#000000").text("MAN", startX + 144, mY + 2);

    drawCheckbox(doc, startX + 220, mY, !!formData.classification?.machine, 10);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#000000").text("MACHINE", startX + 234, mY + 2);

    drawCheckbox(doc, startX + 320, mY, !!formData.classification?.material, 10);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#000000").text("MATERIAL", startX + 334, mY + 2);

    drawCheckbox(doc, startX + 430, mY, !!formData.classification?.method, 10);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#000000").text("METHOD", startX + 444, mY + 2);

    currentY += 22;

    // Details of Change Required Section Bar
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 16).fillAndStroke("#E5E7EB", "#000000");
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827").text("DETAILS OF CHANGE REQUIRED", startX, currentY + 4, { width: pageWidth, align: "center" });
    currentY += 16;

    // Table Header
    const tableHeaderH = 16;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, tableHeaderH).fillAndStroke("#F3F4F6", "#000000");
    doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(7);
    doc.text("S.No", startX + 4, currentY + 5);
    doc.text("PARTICULARS", startX + 35, currentY + 5);
    doc.text("CURRENT STATUS", startX + 260, currentY + 5);
    doc.text("CHANGE REQUIRED (F / M / F&M)", startX + 395, currentY + 5);

    currentY += tableHeaderH;

    const rows = formData.particularsRows || [{ particular: "-", currentStatus: "-", f: false, m: false, fem: false }];
    rows.forEach((r, idx) => {
      const itemH = 22;
      doc.lineWidth(0.5).rect(startX, currentY, pageWidth, itemH).stroke();
      doc.font("Helvetica").fontSize(7.5).fillColor("#000000");
      doc.text(String(idx + 1), startX + 6, currentY + 7);
      doc.text(r.particular || "-", startX + 35, currentY + 7, { width: 220 });
      doc.text(r.currentStatus || "-", startX + 260, currentY + 7, { width: 130 });

      // Checkboxes with Green Ticks for F / M / F&M
      const boxY = currentY + 6;
      drawCheckbox(doc, startX + 395, boxY, !!r.f, 9);
      doc.font("Helvetica-Bold").fontSize(7).text("F", startX + 408, boxY + 2);

      drawCheckbox(doc, startX + 430, boxY, !!r.m, 9);
      doc.font("Helvetica-Bold").fontSize(7).text("M", startX + 443, boxY + 2);

      drawCheckbox(doc, startX + 465, boxY, !!r.fem, 9);
      doc.font("Helvetica-Bold").fontSize(7).text("F&M", startX + 478, boxY + 2);

      currentY += itemH;
    });

    // Reason for Change Required
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 16).fillAndStroke("#E5E7EB", "#000000");
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827").text("REASON FOR CHANGE REQUIRED", startX, currentY + 4, { width: pageWidth, align: "center" });
    currentY += 16;

    const reasonH = 46;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, reasonH).stroke();
    const rY = currentY + 6;
    drawCheckbox(doc, startX + 12, rY, !!formData.reason?.product, 9);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#000000").text("Product", startX + 25, rY + 1);

    drawCheckbox(doc, startX + 80, rY, !!formData.reason?.process, 9);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#000000").text("Process", startX + 93, rY + 1);

    drawCheckbox(doc, startX + 150, rY, !!formData.reason?.other, 9);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#000000").text("Other any one", startX + 163, rY + 1);

    doc.font("Helvetica").fontSize(7.5).fillColor("#111827").text(`Details: ${formData.reason?.details || "-"}`, startX + 12, currentY + 22, { width: pageWidth - 24 });
    currentY += reasonH;

    // CFT Comments - 2 Columns
    const cftW = pageWidth / 2;
    const cftH = 64;
    doc.lineWidth(0.5).rect(startX, currentY, cftW, 16).fillAndStroke("#E5E7EB", "#000000");
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#111827").text("CFT COMMENTS - FOUNDRY", startX, currentY + 4, { width: cftW, align: "center" });

    doc.rect(startX + cftW, currentY, cftW, 16).fillAndStroke("#E5E7EB", "#000000");
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#111827").text("CFT COMMENTS - MACHINE SHOP", startX + cftW, currentY + 4, { width: cftW, align: "center" });

    currentY += 16;

    doc.lineWidth(0.5).rect(startX, currentY, cftW, cftH).stroke();
    doc.rect(startX + cftW, currentY, cftW, cftH).stroke();

    // Foundry Content
    const isFProcess = !!formData.foundry?.isProcess;
    const isFProduct = !!formData.foundry?.isProduct;
    const isFFeasible = formData.foundry?.feasibility === "feasible";
    const isFNotFeasible = formData.foundry?.feasibility === "not_feasible";

    drawCheckbox(doc, startX + 8, currentY + 6, isFProcess, 9);
    doc.font("Helvetica").fontSize(7).fillColor("#000000").text("Process", startX + 20, currentY + 7);
    drawCheckbox(doc, startX + 62, currentY + 6, isFProduct, 9);
    doc.text("Product", startX + 74, currentY + 7);

    drawCheckbox(doc, startX + 120, currentY + 6, isFFeasible, 9);
    doc.font("Helvetica-Bold").fontSize(7).fillColor(isFFeasible ? "#16a34a" : "#000000").text("Feasible", startX + 132, currentY + 7);
    drawCheckbox(doc, startX + 185, currentY + 6, isFNotFeasible, 9);
    doc.font("Helvetica-Bold").fontSize(7).fillColor(isFNotFeasible ? "#dc2626" : "#000000").text("Not Feasible", startX + 197, currentY + 7);

    doc.font("Helvetica").fontSize(7).fillColor("#000000").text(`Comments: ${formData.foundry?.comments || "-"}`, startX + 8, currentY + 22, { width: cftW - 16 });
    doc.text(`CFT Leader Sign: ${formData.foundry?.leaderSign || "-"}       Date: ${formData.foundry?.date || "-"}`, startX + 8, currentY + 48);

    // Machine Shop Content
    const isMProcess = !!formData.machineShop?.isProcessOnly;
    const isMProduct = !!formData.machineShop?.isProduct;
    const isMFeasible = formData.machineShop?.feasibility === "feasible";
    const isMNotFeasible = formData.machineShop?.feasibility === "not_feasible";

    drawCheckbox(doc, startX + cftW + 8, currentY + 6, isMProcess, 9);
    doc.font("Helvetica").fontSize(7).fillColor("#000000").text("Process only", startX + cftW + 20, currentY + 7);
    drawCheckbox(doc, startX + cftW + 75, currentY + 6, isMProduct, 9);
    doc.text("Product", startX + cftW + 87, currentY + 7);

    drawCheckbox(doc, startX + cftW + 130, currentY + 6, isMFeasible, 9);
    doc.font("Helvetica-Bold").fontSize(7).fillColor(isMFeasible ? "#16a34a" : "#000000").text("Feasible", startX + cftW + 142, currentY + 7);
    drawCheckbox(doc, startX + cftW + 195, currentY + 6, isMNotFeasible, 9);
    doc.font("Helvetica-Bold").fontSize(7).fillColor(isMNotFeasible ? "#dc2626" : "#000000").text("Not Feasible", startX + cftW + 207, currentY + 7);

    doc.font("Helvetica").fontSize(7).fillColor("#000000").text(`Comments: ${formData.machineShop?.comments || "-"}`, startX + cftW + 8, currentY + 22, { width: cftW - 16 });
    doc.text(`CFT Leader Sign: ${formData.machineShop?.leaderSign || "-"}       Date: ${formData.machineShop?.date || "-"}`, startX + cftW + 8, currentY + 48);

    currentY += cftH;

    // Internal Approval Box
    const appH = 36;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 16).fillAndStroke("#E5E7EB", "#000000");
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827").text("INTERNAL APPROVAL", startX, currentY + 4, { width: pageWidth, align: "center" });
    currentY += 16;

    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, appH).stroke();
    drawCheckbox(doc, startX + 14, currentY + 12, !!formData.approval?.approved, 10);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(formData.approval?.approved ? "#16a34a" : "#000000").text("APPROVED", startX + 28, currentY + 14);

    drawCheckbox(doc, startX + 90, currentY + 12, !!formData.approval?.rejected, 10);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(formData.approval?.rejected ? "#dc2626" : "#000000").text("REJECTED", startX + 104, currentY + 14);

    doc.font("Helvetica").fontSize(7.5).fillColor("#000000").text(`Approving Authority: ${formData.approval?.approvingAuthority || "PLANT HEAD"}`, startX + 280, currentY + 8);
    doc.text(`Signature: ${formData.approval?.signature || "Signed"}`, startX + 280, currentY + 20);

    currentY += appH;

    // Customer Communication Detail
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 16).fillAndStroke("#E5E7EB", "#000000");
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827").text("CUSTOMER COMMUNICATION DETAIL", startX, currentY + 4, { width: pageWidth, align: "center" });
    currentY += 16;

    const custH = 34;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, custH).stroke();
    drawCheckbox(doc, startX + 12, currentY + 8, !!formData.customerCommunication?.changeReflectionInSop, 9);
    doc.font("Helvetica").fontSize(7.5).fillColor("#000000").text("Change reflection in SOP", startX + 25, currentY + 9);

    drawCheckbox(doc, startX + 180, currentY + 8, !!formData.customerCommunication?.nextForwarded, 9);
    doc.font("Helvetica").fontSize(7.5).fillColor("#000000").text("Forwarded to Next Level", startX + 193, currentY + 9);

    doc.text(`Notes: ${formData.customerCommunication?.handleNotes || "-"}`, startX + 12, currentY + 22, { width: pageWidth - 24 });

    // Footer QF String
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#374151").text("QF/07/MRO-15, Rev.No: 03 dt 04.10.2021", startX, doc.page.height - 24);

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF report" });
    }
  }
};

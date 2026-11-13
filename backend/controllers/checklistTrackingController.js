const { sql, poolPromise } = require("../db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { getLogoPath, drawCheckbox, drawFormHeader } = require("../utils/pdfTheme");

exports.getRecord = async (req, res) => {
  const { partNo, part } = req.query;
  const formType = `change-tracking-${part || 1}`;

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const key = partNo || "DEFAULT";
    const request = pool.request();
    request.input("formType", sql.VarChar, formType);
    request.input("key", sql.VarChar, String(key).trim());

    const result = await request.query("SELECT TOP 1 * FROM ConsultancyForms WHERE formType = @formType AND recordKey = @key");
    const record = result.recordset[0];
    if (!record) return res.status(200).json(null);

    let parsed = {};
    try { parsed = JSON.parse(record.formData); } catch (e) { parsed = record.formData; }
    return res.status(200).json({ ...record, formData: parsed });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.saveRecord = async (req, res) => {
  const { part, partNo, customer, formData } = req.body;
  if (!formData) return res.status(400).json({ error: "formData required" });

  const formType = `change-tracking-${part || 1}`;
  const key = partNo || formData.productCode || `CT-${Date.now()}`;

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const user = req.user || {};
    const jsonContent = typeof formData === "string" ? formData : JSON.stringify(formData);

    const request = pool.request();
    request.input("formType", sql.VarChar, formType);
    request.input("recordKey", sql.VarChar, String(key).trim());
    request.input("partName", sql.VarChar, formData.productDescription || "");
    request.input("customer", sql.VarChar, customer || formData.customerName || "");
    request.input("status", sql.VarChar, "In Tracking");
    request.input("formData", sql.NVarChar(sql.MAX), jsonContent);
    request.input("remarks", sql.NVarChar(sql.MAX), "");
    request.input("username", sql.VarChar, user.username || "System");

    const query = `
      IF EXISTS (SELECT 1 FROM ConsultancyForms WHERE formType = @formType AND recordKey = @recordKey)
      BEGIN
        UPDATE ConsultancyForms
        SET partName = @partName, customer = @customer, status = @status, formData = @formData, lastUpdatedBy = @username, updatedAt = GETDATE()
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
    return res.status(200).json({ message: "Checklist Tracking saved", id: row.id, recordKey: key });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { partNo, part } = req.query;
    const pageNum = parseInt(part, 10) || 1;

    let formData = null;
    try {
      const pool = await poolPromise;
      if (pool) {
        const formType = `change-tracking-${pageNum}`;
        const request = pool.request();
        request.input("formType", sql.VarChar, formType);
        request.input("key", sql.VarChar, String(partNo || "").trim());
        const result = await request.query("SELECT TOP 1 * FROM ConsultancyForms WHERE formType = @formType AND recordKey = @key");
        if (result.recordset[0]) {
          formData = JSON.parse(result.recordset[0].formData);
        }
      }
    } catch (e) {}

    const meta = formData?.meta || {
      productCode: "",
      customerName: "",
      productDescription: "",
      customerPartNo: ""
    };

    const doc = new PDFDocument({ margin: 24, size: "A4", layout: "portrait", bufferPages: true, autoPageBreak: false });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Checklist_Tracking_Page${pageNum}.pdf`);
    doc.pipe(res);

    const startX = 24;
    const pageWidth = doc.page.width - 48;
    let currentY = 24;

    const headerH = drawFormHeader(doc, {
      startX,
      currentY,
      pageWidth,
      title: "CHECKLIST FOR MANAGING AND TRACKING CHANGE",
      qfNo: "QF/07/MRO-03",
      docNo: meta.customerPartNo || partNo || "-",
      revDate: "01.12.2003",
    });
    currentY += headerH;

    // 2-Row Product Code & Customer Meta Box matching PDF
    const halfW = pageWidth / 2;
    const rowH = 18;

    doc.lineWidth(0.5).rect(startX, currentY, halfW, rowH).stroke();
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#374151").text("PRODUCT CODE :-", startX + 4, currentY + 4);
    doc.font("Helvetica").fontSize(7.5).fillColor("#000000").text(meta.productCode || "-", startX + 90, currentY + 4);

    doc.lineWidth(0.5).rect(startX + halfW, currentY, halfW, rowH).stroke();
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#374151").text("CUSTOMER NAME :-", startX + halfW + 4, currentY + 4);
    doc.font("Helvetica").fontSize(7.5).fillColor("#000000").text(meta.customerName || "-", startX + halfW + 95, currentY + 4);
    currentY += rowH;

    doc.lineWidth(0.5).rect(startX, currentY, halfW, rowH).stroke();
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#374151").text("PRODUCT DESCRIPTION :-", startX + 4, currentY + 4);
    doc.font("Helvetica").fontSize(7.5).fillColor("#000000").text(meta.productDescription || "-", startX + 115, currentY + 4);

    doc.lineWidth(0.5).rect(startX + halfW, currentY, halfW, rowH).stroke();
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#374151").text("CUSTOMER PART NO :-", startX + halfW + 4, currentY + 4);
    doc.font("Helvetica").fontSize(7.5).fillColor("#000000").text(meta.customerPartNo || "-", startX + halfW + 105, currentY + 4);
    currentY += rowH;

    const pageItems = {
      1: ["Assembly Drawing Change", "Component Drawing Change", "Engineering Specification", "Material Specification", "Process Flow Diagram", "Control Plan", "Product Audit Check Sheet", "Work Instruction", "Visual Aids"],
      2: ["Process FMEA", "Jigs / Tool / Gauge / Pattern / Drawings / Layout", "Jigs / Tool / Gauge / Pattern modification (Physical Modification)", "Calibration Cards (for part specific Gauges)", "MSA", "Product Cost", "Approved list of Sub - Contractors", "Action on parts already produced and available on Stock", "Actions on Sub - Contractor", "Sub - Contractor Part Approval"],
      3: ["Any Special Characteristics", "SPC affected ?", "Checking Aids / Gauges", "Production Trial Run", "PAP", "Master List of : a) Drawings", "b) Engineering / Material Specification", "c) Process Flow Diagram", "d) Control Plan", "e) Work Instruction", "h) Process FMEA"],
      4: ["l) Active Parts list", "j) PAP", "k) IMTE / MMD"]
    };

    const items = pageItems[pageNum] || pageItems[1];
    const colW = [155, 25, 25, 105, 55, 45, 45, 47, 45]; // Total = 547

    // Table Header
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 24).fillAndStroke("#F3F4F6", "#000000");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(6.5);

    let cx = startX;
    ["Impact of Change to be considered on", "Yes", "No", "Action Comments", "Responsibility", "Reqd", "Actual", "Doc No", "Remarks"].forEach((h, i) => {
      doc.text(h, cx + 1, currentY + 8, { width: colW[i] - 2, align: "center" });
      cx += colW[i];
    });
    currentY += 24;

    const userItems = formData?.items || [];

    items.forEach((item, idx) => {
      const uItem = userItems[idx] || {};
      const rH = pageNum === 4 ? 26 : 21;
      doc.lineWidth(0.5).rect(startX, currentY, pageWidth, rH).stroke();
      doc.font("Helvetica-Bold").fontSize(7).fillColor("#000000").text(item, startX + 3, currentY + 6, { width: colW[0] - 6 });

      drawCheckbox(doc, startX + colW[0] + (colW[1] - 8) / 2, currentY + 6, uItem.affected === true, 8);
      drawCheckbox(doc, startX + colW[0] + colW[1] + (colW[2] - 8) / 2, currentY + 6, uItem.affected === false, 8);

      doc.font("Helvetica").fontSize(6.5);
      let colX = startX + colW[0] + colW[1] + colW[2];
      doc.text(uItem.action || "", colX + 2, currentY + 7, { width: colW[3] - 4 });
      colX += colW[3];
      doc.text(uItem.resp || "", colX + 2, currentY + 7, { width: colW[4] - 4, align: "center" });
      colX += colW[4];
      doc.text(uItem.reqdDate || "", colX + 1, currentY + 7, { width: colW[5] - 2, align: "center" });
      colX += colW[5];
      doc.text(uItem.actualDate || "", colX + 1, currentY + 7, { width: colW[6] - 2, align: "center" });
      colX += colW[6];
      doc.text(uItem.docNo || "", colX + 1, currentY + 7, { width: colW[7] - 2, align: "center" });
      colX += colW[7];
      doc.text(uItem.remarks || "", colX + 2, currentY + 7, { width: colW[8] - 4 });

      currentY += rH;
    });

    // If Page 4, draw the Implementation Notes & PREPARED AND SIGNED BY section matching PDF Page 8
    if (pageNum === 4) {
      const noteH = 18;
      const notes = [
        "Actual date of implementation of change (By CFT & Planning):",
        "Actions taken / Proposed on the Stock produce : prior to modification (By CFT & Planning)",
        "Actions taken / Proposed on toolings of prior to modification (By CFT & Planning)",
        "Any other Remarks :"
      ];
      notes.forEach((note) => {
        doc.lineWidth(0.5).rect(startX, currentY, pageWidth, noteH).stroke();
        doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#374151").text(note, startX + 3, currentY + 5);
        currentY += noteH;
      });

      // Informed to
      doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 20).stroke();
      doc.font("Helvetica-Bold").fontSize(7).fillColor("#000000").text("Informed to :", startX + 3, currentY + 6);
      let infX = startX + 65;
      ["Customer", "Marketing", "Planning", "CFT & PLANNING Production", "QA", "QC"].forEach((label) => {
        drawCheckbox(doc, infX, currentY + 5, false, 8);
        doc.font("Helvetica").fontSize(6.5).text(label, infX + 11, currentY + 6);
        infX += label.length * 5 + 24;
      });
      currentY += 20;

      // PREPARED AND SIGNED BY matching Page 8
      const signBlockH = 55;
      doc.lineWidth(0.5).rect(startX, currentY, pageWidth, signBlockH).stroke();
      const leftColW = 160;
      doc.lineWidth(0.5).rect(startX, currentY, leftColW, signBlockH).stroke();
      doc.font("Helvetica-Bold").fontSize(7).fillColor("#000000").text("PREPARED AND SIGNED BY", startX + 4, currentY + 6);
      doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#374151").text("CFT CORE TEAM :", startX + 4, currentY + 20);
      doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#374151").text("ON ( DATE ) :", startX + 4, currentY + 36);

      const signColW = (pageWidth - leftColW) / 3;
      for (let s = 0; s < 3; s++) {
        const sx = startX + leftColW + s * signColW;
        doc.lineWidth(0.5).rect(sx, currentY, signColW, signBlockH).stroke();
        doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#000000").text("SIGN : ___________________", sx + 4, currentY + 12);
        doc.font("Helvetica").fontSize(6.5).fillColor("#374151").text("NAME :", sx + 4, currentY + 28);
        doc.font("Helvetica").fontSize(6.5).fillColor("#374151").text("TITLE :", sx + 4, currentY + 42);
      }
      currentY += signBlockH;
    }

    // Official Footer line
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#000000").text("QF / 07 / MRO - 03 (01.12.2003)", startX, doc.page.height - 20);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#000000").text(`Page No :- 0${pageNum} of 04`, doc.page.width - 120, doc.page.height - 20);
    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate report" });
  }
};

const { sql, poolPromise } = require("../db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { getLogoPath, drawCheckbox, drawFormHeader } = require("../utils/pdfTheme");

exports.getRecord = async (req, res) => {
  const { recordKey, partNo, date } = req.query;
  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const key = recordKey || partNo || date;
    if (!key) return res.status(400).json({ error: "recordKey, partNo or date is required" });

    const request = pool.request();
    request.input("formType", sql.VarChar, "risk-analysis");
    request.input("key", sql.VarChar, String(key).trim());

    const result = await request.query(`
      SELECT TOP 1 * FROM ConsultancyForms 
      WHERE formType = @formType AND recordKey = @key
    `);

    const record = result.recordset[0];
    if (!record) return res.status(200).json(null);

    let parsed = {};
    try { parsed = JSON.parse(record.formData); } catch (e) { parsed = record.formData; }
    return res.status(200).json({ ...record, formData: parsed });
  } catch (err) {
    console.error("Error fetching Risk Analysis record:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.saveRecord = async (req, res) => {
  const { recordKey, partName, customer, status, formData, remarks } = req.body;
  if (!formData) return res.status(400).json({ error: "formData payload is required" });

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const user = req.user || {};
    const key = recordKey || formData.meta?.partNo || formData.meta?.date || `RA-${Date.now()}`;
    const jsonContent = typeof formData === "string" ? formData : JSON.stringify(formData);

    const request = pool.request();
    request.input("formType", sql.VarChar, "risk-analysis");
    request.input("recordKey", sql.VarChar, String(key).trim());
    request.input("partName", sql.VarChar, partName || formData.meta?.partName || "");
    request.input("customer", sql.VarChar, customer || formData.meta?.customer || "");
    request.input("status", sql.VarChar, status || formData.meta?.conclusion || "Completed");
    request.input("formData", sql.NVarChar(sql.MAX), jsonContent);
    request.input("remarks", sql.NVarChar(sql.MAX), remarks || formData.meta?.conclusionNotes || "");
    request.input("username", sql.VarChar, user.username || "System");

    const query = `
      IF EXISTS (SELECT 1 FROM ConsultancyForms WHERE formType = @formType AND recordKey = @recordKey)
      BEGIN
        UPDATE ConsultancyForms
        SET partName = @partName, customer = @customer, status = @status, formData = @formData, remarks = @remarks, lastUpdatedBy = @username, updatedAt = GETDATE()
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
    return res.status(200).json({ message: "Risk Analysis record saved", id: row.id, recordKey: key });
  } catch (err) {
    console.error("Error saving Risk Analysis:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { recordKey, date } = req.query;
    let formData = null;

    if (recordKey || date) {
      const pool = await poolPromise;
      if (pool) {
        const reqDb = pool.request();
        reqDb.input("formType", sql.VarChar, "risk-analysis");
        reqDb.input("key", sql.VarChar, String(recordKey || date).trim());
        const result = await reqDb.query("SELECT TOP 1 formData FROM ConsultancyForms WHERE formType = @formType AND recordKey = @key");
        if (result.recordset[0]) {
          try { formData = JSON.parse(result.recordset[0].formData); } catch (e) {}
        }
      }
    }

    if (!formData) {
      formData = {
        meta: { partName: "Cylinder Block", customer: "Automotive Ltd", partNo: "CB-401", date: "2026-11-07", overallRisk: "LOW", conclusion: "Acceptable" },
        rows: [
          { category: "Man", point: "Insufficient Skill", control: "SOP Training", risk: "LOW", qcd: "Q", actions: "Skill matrix verification" },
          { category: "Method", point: "Process Change", control: "Control Plan Rev", risk: "MEDIUM", qcd: "C", actions: "Pilot batch run" },
          { category: "Machine", point: "Machine Capability", control: "Cp, Cpk Study", risk: "LOW", qcd: "Q", actions: "Calibrated gauges checked" },
          { category: "Material", point: "Availability of material", control: "Inventory audit", risk: "LOW", qcd: "D", actions: "Material certification verified" },
        ],
        signatures: ["Operator Lead", "Shift Incharge", "CFT Quality", "Plant Head", "Process Eng", "Safety Head"],
      };
    }

    const doc = new PDFDocument({ margin: 20, size: "A4", layout: "landscape", bufferPages: true, autoPageBreak: false });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Risk_Analysis_Report.pdf");
    doc.pipe(res);

    const startX = 20;
    const pageWidth = doc.page.width - 40; // ~801 pt
    let currentY = 20;

    // Header
    const headerH = drawFormHeader(doc, {
      startX,
      currentY,
      pageWidth,
      title: "RISK ANALYSIS CHECK SHEET",
      qfNo: "QF/07/MKT-14 Rev.02",
      docNo: formData.meta?.partNo || "-",
      revDate: "dt 13.02.2019",
    });
    currentY += headerH;

    // Meta row
    const metaH = 18;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, metaH).stroke();
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#374151");
    doc.text(`Part Name: ${formData.meta?.partName || "-"}`, startX + 6, currentY + 5);
    doc.text(`Customer: ${formData.meta?.customer || "-"}`, startX + 280, currentY + 5);
    doc.text(`Part No: ${formData.meta?.partNo || "-"}`, startX + 540, currentY + 5);
    currentY += metaH;

    // Table Header
    const colW = [30, 80, 160, 140, 35, 35, 35, 35, 65, 186];
    const thH = 22;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, thH).fillAndStroke("#F3F4F6", "#000000");
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(7.5);

    let curX = startX;
    const colTitles = ["S.No", "CATEGORY", "RISK POINTS", "CONTROL METHOD", "HIGH", "LOW", "MED", "NA", "EFFECT QCD", "ACTIONS"];
    colTitles.forEach((t, i) => {
      doc.text(t, curX + 2, currentY + 7, { width: colW[i] - 4, align: "center" });
      curX += colW[i];
    });

    currentY += thH;

    const rows = formData.rows || [];
    rows.forEach((r, idx) => {
      const itemH = 18;
      doc.lineWidth(0.5).rect(startX, currentY, pageWidth, itemH).stroke();
      doc.font("Helvetica").fontSize(7).fillColor("#000000");

      let x = startX;
      doc.text(String(idx + 1), x + 2, currentY + 5, { width: colW[0] - 4, align: "center" }); x += colW[0];
      doc.font("Helvetica-Bold").text(r.category || "-", x + 2, currentY + 5, { width: colW[1] - 4 }); x += colW[1];
      doc.font("Helvetica").text(r.point || "-", x + 2, currentY + 5, { width: colW[2] - 4 }); x += colW[2];
      doc.text(r.control || "-", x + 2, currentY + 5, { width: colW[3] - 4 }); x += colW[3];

      drawCheckbox(doc, x + (colW[4] - 9) / 2, currentY + 4, r.risk === "HIGH", 9); x += colW[4];
      drawCheckbox(doc, x + (colW[5] - 9) / 2, currentY + 4, r.risk === "LOW", 9); x += colW[5];
      drawCheckbox(doc, x + (colW[6] - 9) / 2, currentY + 4, r.risk === "MEDIUM", 9); x += colW[6];
      drawCheckbox(doc, x + (colW[7] - 9) / 2, currentY + 4, r.risk === "NA", 9); x += colW[7];

      doc.text(r.qcd || "-", x + 2, currentY + 5, { width: colW[8] - 4, align: "center" }); x += colW[8];
      doc.text(r.actions || "-", x + 2, currentY + 5, { width: colW[9] - 4 });
      currentY += itemH;
    });

    // Conclusion & Overall Risk
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 28).stroke();
    doc.font("Helvetica-Bold").fontSize(8);
    doc.text(`Overall Risk Level: [ ${formData.meta?.overallRisk || "LOW"} ]`, startX + 10, currentY + 9);
    doc.text(`Conclusion: [ ${formData.meta?.conclusion || "Acceptable"} ]`, startX + 220, currentY + 9);
    doc.font("Helvetica").fontSize(7.5).text(`CFT Signatures: ${(formData.signatures || []).filter(Boolean).join(" | ")}`, startX + 420, currentY + 9);

    doc.font("Helvetica-Bold").fontSize(7.5).text("QF/07/MKT-14, Rev.No.02 dt 13.02.2019", startX, doc.page.height - 15);
    doc.end();
  } catch (err) {
    console.error("Risk Analysis PDF error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate PDF" });
  }
};

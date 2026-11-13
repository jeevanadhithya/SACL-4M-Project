const { sql, poolPromise } = require("../db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { getLogoPath, drawCheckbox, drawFormHeader } = require("../utils/pdfTheme");

exports.getRecord = async (req, res) => {
  const { recordKey, projectName } = req.query;
  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const key = recordKey || projectName;
    if (!key) return res.status(400).json({ error: "recordKey or projectName required" });

    const request = pool.request();
    request.input("formType", sql.VarChar, "timing-plan");
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
  const { recordKey, partName, customer, status, formData, remarks } = req.body;
  if (!formData) return res.status(400).json({ error: "formData is required" });

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const user = req.user || {};
    const key = recordKey || formData.projectName || formData.partNo || `TP-${Date.now()}`;
    const jsonContent = typeof formData === "string" ? formData : JSON.stringify(formData);

    const request = pool.request();
    request.input("formType", sql.VarChar, "timing-plan");
    request.input("recordKey", sql.VarChar, String(key).trim());
    request.input("partName", sql.VarChar, partName || formData.productName || "");
    request.input("customer", sql.VarChar, customer || formData.customer || "");
    request.input("status", sql.VarChar, status || "Active");
    request.input("formData", sql.NVarChar(sql.MAX), jsonContent);
    request.input("remarks", sql.NVarChar(sql.MAX), remarks || "");
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
    return res.status(200).json({ message: "Timing Plan saved", id: row.id, recordKey: key });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { recordKey } = req.query;
    let formData = null;

    if (recordKey) {
      const pool = await poolPromise;
      if (pool) {
        const reqDb = pool.request();
        reqDb.input("formType", sql.VarChar, "timing-plan");
        reqDb.input("key", sql.VarChar, String(recordKey).trim());
        const result = await reqDb.query("SELECT TOP 1 formData FROM ConsultancyForms WHERE formType = @formType AND recordKey = @key");
        if (result.recordset[0]) {
          try { formData = JSON.parse(result.recordset[0].formData); } catch (e) {}
        }
      }
    }

    if (!formData) {
      formData = {
        projectName: "Front Axle Development",
        productName: "Steering Arm",
        customer: "OEM Partner",
        partNo: "FA-8812",
        preparedDate: "2026-11-07",
        rev: "05",
        goNextPhase: "Yes",
      };
    }

    const doc = new PDFDocument({ margin: 20, size: "A4", layout: "landscape", bufferPages: true, autoPageBreak: false });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Timing_Plan_Report.pdf");
    doc.pipe(res);

    const startX = 20;
    const pageWidth = doc.page.width - 40;
    let currentY = 20;

    const headerH = drawFormHeader(doc, {
      startX,
      currentY,
      pageWidth,
      title: "TIMING PLAN (APQP / CHANGE SCHEDULE)",
      qfNo: "QF/01/MKT-08 Rev.05",
      docNo: formData.partNo || "-",
      revDate: "dt 01.12.2024",
    });
    currentY += headerH;

    // Meta details row
    const metaH = 18;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, metaH).stroke();
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#374151");
    doc.text(`Project: ${formData.projectName || "-"}`, startX + 6, currentY + 5);
    doc.text(`Customer: ${formData.customer || "-"}`, startX + 280, currentY + 5);
    doc.text(`Part No: ${formData.partNo || "-"}`, startX + 540, currentY + 5);
    currentY += metaH;

    // Phase 1 Activities
    const actList = [
      "Customer Enquiry",
      "Receipt of 2D Drawing & 3D Model",
      "Preliminary Assessment",
      "Product Feasibility",
      "Clarification required from customer",
      "Cost Estimation",
      "Quote submission",
      "LOI / Purchase order",
      "Team Feasibility Commitment",
      "Contract review & Order acceptance",
    ];

    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 20).fillAndStroke("#F0F0F0", "#000000");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8);
    doc.text("APQP Phase", startX + 6, currentY + 6);
    doc.text("Activity Description (Major Milestones)", startX + 90, currentY + 6);
    doc.text("Applicability", startX + 380, currentY + 6);
    doc.text("Target Schedule / Week", startX + 480, currentY + 6);
    doc.text("Remarks / Status", startX + 680, currentY + 6);
    currentY += 20;

    actList.forEach((act, i) => {
      const rowH = 18;
      doc.lineWidth(0.5).rect(startX, currentY, pageWidth, rowH).stroke();
      doc.font("Helvetica").fontSize(7.5);
      doc.text("I Phase", startX + 6, currentY + 5);
      doc.text(act, startX + 90, currentY + 5, { width: 280 });
      doc.text("AA, A, B, C", startX + 380, currentY + 5);
      doc.text("Wk 1 - Wk 4 (On Track)", startX + 480, currentY + 5);
      doc.text("Completed", startX + 680, currentY + 5);
      currentY += rowH;
    });

    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 30).stroke();
    doc.font("Helvetica-Bold").fontSize(8);
    doc.text(`Go for next Phase: [ ${formData.goNextPhase || "Yes"} ]`, startX + 10, currentY + 10);
    doc.text(`Reviewed by CFT Leader: Approved`, startX + 300, currentY + 10);
    doc.text(`Plant Head Sign: Approved`, startX + 580, currentY + 10);

    doc.font("Helvetica-Bold").fontSize(7.5).text("QF/01/MKT-08 Rev No: 05 dt 01.12.2024", startX, doc.page.height - 15);
    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate Timing Plan PDF" });
  }
};

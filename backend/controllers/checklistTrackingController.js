const { sql, poolPromise } = require("../db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

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
    const doc = new PDFDocument({ margin: 20, size: "A4", layout: "landscape", bufferPages: true, autoPageBreak: false });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Checklist_Tracking_Report.pdf");
    doc.pipe(res);

    const startX = 20;
    const pageWidth = doc.page.width - 40;
    let currentY = 20;

    doc.lineWidth(1).rect(startX, currentY, pageWidth, 45).stroke();
    const logoPath = path.join(__dirname, "logo.jpg");
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, startX + 5, currentY + 4, { width: 40, height: 36 }); } catch (e) {}
    }

    doc.font("Helvetica-Bold").fontSize(13).text("SAKTHI AUTO COMPONENT LIMITED", startX + 50, currentY + 10, { width: pageWidth - 250, align: "center" });
    doc.font("Helvetica-Bold").fontSize(11).text("CHECKLIST FOR MANAGING AND TRACKING CHANGE", startX + 50, currentY + 26, { width: pageWidth - 250, align: "center" });

    doc.lineWidth(0.5).rect(startX + pageWidth - 180, currentY, 180, 45).stroke();
    doc.font("Helvetica").fontSize(7.5);
    doc.text(`Part No: ${partNo || "SK-890"}`, startX + pageWidth - 175, currentY + 12);
    doc.font("Helvetica-Bold").text("QF/07/MRO-03 (01.12.2003)", startX + pageWidth - 175, currentY + 26);

    currentY += 45;

    const items = [
      "Assembly Drawing Change",
      "Component Drawing Change",
      "Engineering Specification",
      "Material Specification",
      "Process Flow Diagram",
      "Control Plan",
      "Product Audit Check Sheet",
      "Work Instruction",
      "Visual Aids",
    ];

    const colW = [190, 35, 35, 170, 80, 55, 55, 65, 116];
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 22).fillAndStroke("#F0F0F0", "#000000");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(7);

    let cx = startX;
    ["Impact of Change to be considered on", "Yes", "No", "Action Comments", "Responsibility", "Reqd Date", "Actual Date", "Doc No", "Remarks"].forEach((h, i) => {
      doc.text(h, cx + 2, currentY + 7, { width: colW[i] - 4, align: "center" });
      cx += colW[i];
    });
    currentY += 22;

    items.forEach((item) => {
      const rowH = 18;
      doc.lineWidth(0.5).rect(startX, currentY, pageWidth, rowH).stroke();
      doc.font("Helvetica-Bold").fontSize(7.5).text(item, startX + 4, currentY + 5, { width: 182 });
      doc.font("Helvetica").fontSize(7);
      doc.text("[X]", startX + 195, currentY + 5);
      doc.text("[ ]", startX + 230, currentY + 5);
      doc.text("Updated with change notes", startX + 265, currentY + 5, { width: 160 });
      doc.text("Production", startX + 435, currentY + 5);
      doc.text("10.11.2026", startX + 515, currentY + 5);
      doc.text("10.11.2026", startX + 570, currentY + 5);
      doc.text("DOC-091", startX + 625, currentY + 5);
      doc.text("Verified", startX + 690, currentY + 5);
      currentY += rowH;
    });

    doc.font("Helvetica-Bold").fontSize(7.5).text("QF / 07 / MRO - 03 (01.12.2003)", startX, doc.page.height - 15);
    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate report" });
  }
};

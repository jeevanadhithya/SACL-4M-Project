const { sql, poolPromise } = require("../db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.getRecord = async (req, res) => {
  const { recordKey, partNameNumber } = req.query;
  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const key = recordKey || partNameNumber;
    if (!key) return res.status(400).json({ error: "recordKey or partNameNumber required" });

    const request = pool.request();
    request.input("formType", sql.VarChar, "ptr-initiation");
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
  const { recordKey, formData } = req.body;
  if (!formData) return res.status(400).json({ error: "formData is required" });

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const user = req.user || {};
    const key = recordKey || formData.meta?.partNameNumber || formData.meta?.date || `PTR-${Date.now()}`;
    const jsonContent = typeof formData === "string" ? formData : JSON.stringify(formData);

    const request = pool.request();
    request.input("formType", sql.VarChar, "ptr-initiation");
    request.input("recordKey", sql.VarChar, String(key).trim());
    request.input("partName", sql.VarChar, formData.meta?.partNameNumber || "");
    request.input("customer", sql.VarChar, formData.meta?.customer || "");
    request.input("status", sql.VarChar, "Initiated");
    request.input("formData", sql.NVarChar(sql.MAX), jsonContent);
    request.input("remarks", sql.NVarChar(sql.MAX), formData.bottomInfo?.comments || "");
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
    return res.status(200).json({ message: "PTR Initiation record saved", id: row.id, recordKey: key });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { recordKey } = req.query;
    const doc = new PDFDocument({ margin: 28, size: "A4", layout: "portrait", bufferPages: true, autoPageBreak: false });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=PTR_Initiation_Report.pdf");
    doc.pipe(res);

    const startX = 28;
    const pageWidth = doc.page.width - 56;
    let currentY = 28;

    doc.lineWidth(1).rect(startX, currentY, pageWidth, 55).stroke();
    const logoPath = path.join(__dirname, "logo.jpg");
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, startX + 5, currentY + 6, { width: 45, height: 42 }); } catch (e) {}
    }

    doc.font("Helvetica-Bold").fontSize(13).text("SAKTHI AUTO COMPONENT LIMITED", startX + 60, currentY + 14, { width: 330, align: "center" });
    doc.font("Helvetica-Bold").fontSize(11).text("PTR INITIATION FORM", startX + 60, currentY + 32, { width: 330, align: "center" });

    doc.lineWidth(0.5).rect(startX + 400, currentY, pageWidth - 400, 55).stroke();
    doc.font("Helvetica").fontSize(7.5);
    doc.text("Date: 14.08.2017", startX + 405, currentY + 15);
    doc.text("Page No: 1 of 1", startX + 405, currentY + 28);
    doc.font("Helvetica-Bold").text("QF/07/MRO-16", startX + 405, currentY + 40);

    currentY += 55;

    // Meta Box
    const colW = pageWidth / 3;
    doc.lineWidth(0.5).rect(startX, currentY, colW, 18).stroke();
    doc.rect(startX + colW, currentY, colW, 18).stroke();
    doc.rect(startX + colW * 2, currentY, colW, 18).stroke();

    doc.font("Helvetica-Bold").fontSize(7).text("FROM: Machine Shop", startX + 3, currentY + 5);
    doc.text("DEPARTMENT: Production", startX + colW + 3, currentY + 5);
    doc.text("TO: CFT Team", startX + colW * 2 + 3, currentY + 5);
    currentY += 18;

    // Details of Request
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 18).fillAndStroke("#F0F0F0", "#000000");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8).text("DETAILS OF REQUEST", startX + 6, currentY + 5);
    currentY += 18;

    const requestRows = [
      ["Customer", "OEM Automotive Client", "Rev. Number", "03"],
      ["Part Name / Number", "Front Brake Caliper Housing / CH-104", "Signature", "Signed"],
      ["Reason", "Trial batch evaluation for new tooling insert", "Date", new Date().toISOString().split("T")[0]],
    ];

    requestRows.forEach(([l1, v1, l2, v2]) => {
      doc.lineWidth(0.5).rect(startX, currentY, 120, 18).stroke();
      doc.rect(startX + 120, currentY, 180, 18).stroke();
      doc.rect(startX + 300, currentY, 100, 18).stroke();
      doc.rect(startX + 400, currentY, pageWidth - 400, 18).stroke();

      doc.font("Helvetica-Bold").fontSize(7).text(l1, startX + 3, currentY + 5);
      doc.font("Helvetica").fontSize(7.5).text(v1, startX + 123, currentY + 5);
      doc.font("Helvetica-Bold").fontSize(7).text(l2, startX + 303, currentY + 5);
      doc.font("Helvetica").fontSize(7.5).text(v2, startX + 403, currentY + 5);
      currentY += 18;
    });

    // For use of CFT Table
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 18).fillAndStroke("#F0F0F0", "#000000");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8).text("FOR USE OF CFT", startX + 6, currentY + 5);
    currentY += 18;

    const cftItems = [
      ["1", "If required", "Yes", "Yes", "Yes"],
      ["2", "Date of Production run", "10.11.2026", "11.11.2026", "12.11.2026"],
      ["3", "Quantity Produced", "5 Nos", "25 Nos", "50 Nos"],
      ["4", "Meet customer specific requirement", "Yes", "Yes", "Yes"],
      ["5", "Sample submission required", "Yes", "Yes", "Yes"],
      ["6", "Status of samples", "OK", "OK", "OK"],
    ];

    doc.lineWidth(0.5).rect(startX, currentY, 25, 18).stroke();
    doc.rect(startX + 25, currentY, 260, 18).stroke();
    doc.rect(startX + 285, currentY, 80, 18).stroke();
    doc.rect(startX + 365, currentY, 80, 18).stroke();
    doc.rect(startX + 445, currentY, pageWidth - 445, 18).stroke();

    doc.font("Helvetica-Bold").fontSize(7.5);
    doc.text("S.No", startX + 3, currentY + 5);
    doc.text("Description", startX + 28, currentY + 5);
    doc.text("PTR 1", startX + 288, currentY + 5, { align: "center", width: 74 });
    doc.text("PTR 2", startX + 368, currentY + 5, { align: "center", width: 74 });
    doc.text("PTR 3", startX + 448, currentY + 5, { align: "center", width: 85 });
    currentY += 18;

    cftItems.forEach(([s, desc, p1, p2, p3]) => {
      doc.lineWidth(0.5).rect(startX, currentY, 25, 16).stroke();
      doc.rect(startX + 25, currentY, 260, 16).stroke();
      doc.rect(startX + 285, currentY, 80, 16).stroke();
      doc.rect(startX + 365, currentY, 80, 16).stroke();
      doc.rect(startX + 445, currentY, pageWidth - 445, 16).stroke();

      doc.font("Helvetica").fontSize(7);
      doc.text(s, startX + 3, currentY + 4);
      doc.text(desc, startX + 28, currentY + 4);
      doc.text(p1, startX + 288, currentY + 4, { align: "center", width: 74 });
      doc.text(p2, startX + 368, currentY + 4, { align: "center", width: 74 });
      doc.text(p3, startX + 448, currentY + 4, { align: "center", width: 85 });
      currentY += 16;
    });

    // Approved By Core Team Table
    currentY += 5;
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 18).fillAndStroke("#F0F0F0", "#000000");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8).text("APPROVED BY CORE TEAM", startX + 6, currentY + 5);
    currentY += 18;

    const coreDepts = ["Production", "Quality", "Tooling & Fixtures", "Marketing", "Maintenance"];
    coreDepts.forEach((dept) => {
      doc.lineWidth(0.5).rect(startX, currentY, 285, 16).stroke();
      doc.rect(startX + 285, currentY, 80, 16).stroke();
      doc.rect(startX + 365, currentY, 80, 16).stroke();
      doc.rect(startX + 445, currentY, pageWidth - 445, 16).stroke();

      doc.font("Helvetica-Bold").fontSize(7.5).text(dept, startX + 6, currentY + 4);
      doc.font("Helvetica").fontSize(7);
      doc.text("OK / Approved", startX + 288, currentY + 4, { align: "center", width: 74 });
      doc.text("OK / Approved", startX + 368, currentY + 4, { align: "center", width: 74 });
      doc.text("OK / Approved", startX + 448, currentY + 4, { align: "center", width: 85 });
      currentY += 16;
    });

    // Bottom Box
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 35).stroke();
    doc.font("Helvetica").fontSize(7.5);
    doc.text("Brake point date: 10.11.2026", startX + 6, currentY + 8);
    doc.text("Invoice Details: INV-2026-990", startX + 200, currentY + 8);
    doc.text("Identification on Part/Box/Trolly: Green Tagged", startX + 370, currentY + 8);
    doc.text("CFT Comments: All 3 PTR runs executed according to quality plan.", startX + 6, currentY + 22);

    doc.font("Helvetica-Bold").fontSize(7.5).text("QF/07/MRO-16 dt 14.08.2017", startX, doc.page.height - 18);
    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate PTR report" });
  }
};

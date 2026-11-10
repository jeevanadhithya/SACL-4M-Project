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
    request.input("formType", sql.VarChar, "ppap-initiation");
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
    const key = recordKey || formData.meta?.partNameNumber || formData.meta?.date || `PPAP-${Date.now()}`;
    const jsonContent = typeof formData === "string" ? formData : JSON.stringify(formData);

    const request = pool.request();
    request.input("formType", sql.VarChar, "ppap-initiation");
    request.input("recordKey", sql.VarChar, String(key).trim());
    request.input("partName", sql.VarChar, formData.meta?.partNameNumber || "");
    request.input("customer", sql.VarChar, formData.meta?.customer || "");
    request.input("status", sql.VarChar, "Submitted");
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
    return res.status(200).json({ message: "PPAP Initiation record saved", id: row.id, recordKey: key });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { recordKey } = req.query;
    const doc = new PDFDocument({ margin: 28, size: "A4", layout: "portrait", bufferPages: true, autoPageBreak: false });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=PPAP_Initiation_Report.pdf");
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
    doc.font("Helvetica-Bold").fontSize(10).text("PPAP INITIATION FORM CUM PRODUCTION REPORT", startX + 60, currentY + 32, { width: 330, align: "center" });

    doc.lineWidth(0.5).rect(startX + 400, currentY, pageWidth - 400, 55).stroke();
    doc.font("Helvetica").fontSize(7.5);
    doc.text("Date: 20.08.2016", startX + 405, currentY + 15);
    doc.text("Page No: 1 of 1", startX + 405, currentY + 28);
    doc.font("Helvetica-Bold").text("QF/07/MRO-05", startX + 405, currentY + 40);

    currentY += 55;

    // Meta Box
    const colW = pageWidth / 3;
    doc.lineWidth(0.5).rect(startX, currentY, colW, 18).stroke();
    doc.rect(startX + colW, currentY, colW, 18).stroke();
    doc.rect(startX + colW * 2, currentY, colW, 18).stroke();

    doc.font("Helvetica-Bold").fontSize(7).text("FROM: Machine Shop", startX + 3, currentY + 5);
    doc.text("DEPARTMENT: Quality Assurance", startX + colW + 3, currentY + 5);
    doc.text("TO: CFT Team", startX + colW * 2 + 3, currentY + 5);
    currentY += 18;

    // Request Details
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 18).fillAndStroke("#F0F0F0", "#000000");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8).text("DETAILS OF REQUEST", startX + 6, currentY + 5);
    currentY += 18;

    const reqData = [
      ["Customer", "Major OEM", "Rev. Number", "04"],
      ["Part Name / Number", "Differential Case / DC-552", "Signature", "Signed"],
      ["Reason", "Capacity expansion and PPAP Level 3 initial submission", "Date", new Date().toISOString().split("T")[0]],
    ];

    reqData.forEach(([l1, v1, l2, v2]) => {
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

    // For use of CFT section
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 18).fillAndStroke("#F0F0F0", "#000000");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8).text("FOR USE OF CFT", startX + 6, currentY + 5);
    currentY += 18;

    const cftPoints = [
      ["1) Date of first production run", "10.11.2026"],
      ["2) Quantity Produced", "300 Nos (1 Day Production qty)"],
      ["3) Cycle time / Production Rate", "54 sec / 66 parts/hr"],
      ["4) Process Flow Diagram Number", "PFD-2026-Rev02  (Date: 10.11.2026)"],
      ["5) Control Plan Number", "CP-2026-Rev03  (Date: 10.11.2026)"],
      ["6) Any Deviations to process flow routing", "[ ] Yes      [X] No"],
      ["7) Any Deviations to Control Plan", "[ ] Yes      [X] No"],
      ["8) PSW internal approval on", "12.11.2026"],
      ["9) Submission Required", "[X] Yes     [ ] No"],
      ["10) Status of submission", "[X] Approved   [ ] Rejected"],
      ["11) Product Despatch Authorisation By", "Head of Quality & Plant Head"],
    ];

    cftPoints.forEach(([q, a]) => {
      doc.lineWidth(0.5).rect(startX, currentY, 260, 16).stroke();
      doc.rect(startX + 260, currentY, pageWidth - 260, 16).stroke();
      doc.font("Helvetica").fontSize(7).text(q, startX + 4, currentY + 4);
      doc.font("Helvetica-Bold").fontSize(7.5).text(a, startX + 265, currentY + 4);
      currentY += 16;
    });

    // Approved By Signatures Box
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 42).stroke();
    doc.font("Helvetica-Bold").fontSize(7.5).text("APPROVED BY CORE TEAM:", startX + 6, currentY + 5);
    doc.font("Helvetica").fontSize(7.5);
    doc.text("Sign: Signed\nName: R. Shanmugam\nDate: 12.11.2026", startX + 40, currentY + 16);
    doc.text("Sign: Signed\nName: P. Kandasamy\nDate: 12.11.2026", startX + 220, currentY + 16);
    doc.text("Sign: Signed\nName: K. Sivakumar\nDate: 12.11.2026", startX + 400, currentY + 16);

    doc.font("Helvetica-Bold").fontSize(7.5).text("QF/07/MRO-05 dt 20.08.2016", startX, doc.page.height - 18);
    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate PPAP report" });
  }
};

const { sql, poolPromise } = require("../db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * 1. FETCH FEASIBILITY REPORT RECORD
 */
exports.getRecord = async (req, res) => {
  const { slNo, date } = req.query;

  if (!slNo && !date) {
    return res.status(400).json({ error: "slNo or date is required" });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable" });

    const request = pool.request();
    let query = "SELECT TOP 1 * FROM ConsultancyForms WHERE formType = 'feasibility-report'";

    if (slNo) {
      request.input("slNo", sql.VarChar, String(slNo).trim());
      query += " AND recordKey = @slNo";
    } else if (date) {
      request.input("date", sql.VarChar, String(date).split("T")[0]);
      query += " AND recordKey = @date";
    }

    const result = await request.query(query);
    const record = result.recordset[0];

    if (!record) return res.status(200).json(null);

    let parsedData = {};
    try {
      parsedData = JSON.parse(record.formData);
    } catch (e) {
      parsedData = record.formData;
    }

    return res.status(200).json({ ...record, formData: parsedData });
  } catch (error) {
    console.error("Error fetching Feasibility record:", error);
    return res.status(500).json({ error: "Failed to fetch record", message: error.message });
  }
};

/**
 * 2. SAVE OR UPDATE FEASIBILITY REPORT
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
    const key = recordKey || formData.slNo || `SL-${Date.now()}`;
    const jsonContent = typeof formData === "string" ? formData : JSON.stringify(formData);

    const request = pool.request();
    request.input("formType", sql.VarChar, "feasibility-report");
    request.input("recordKey", sql.VarChar, String(key).trim());
    request.input("partName", sql.VarChar, partName || formData.partName || "");
    request.input("customer", sql.VarChar, customer || formData.customer || "");
    request.input("status", sql.VarChar, status || (formData.conclusionFeasible ? "Feasible" : "Pending"));
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

    return res.status(200).json({
      message: `Feasibility Report ${row.action === "UPDATED" ? "updated" : "saved"} successfully`,
      action: row.action,
      id: row.id,
      recordKey: key,
    });
  } catch (error) {
    console.error("Error saving Feasibility record:", error);
    return res.status(500).json({ error: "Failed to save record", message: error.message });
  }
};

/**
 * 3. BACKEND PDFKit STREAM GENERATOR (QF/07/MRO-02)
 */
exports.generateReport = async (req, res) => {
  try {
    const { slNo, date } = req.query;
    let formData = null;

    if (slNo || date) {
      const pool = await poolPromise;
      if (pool) {
        const request = pool.request();
        let query = "SELECT TOP 1 formData FROM ConsultancyForms WHERE formType = 'feasibility-report'";
        if (slNo) {
          request.input("slNo", sql.VarChar, String(slNo).trim());
          query += " AND recordKey = @slNo";
        } else if (date) {
          request.input("date", sql.VarChar, String(date).split("T")[0]);
          query += " AND recordKey = @date";
        }
        const result = await request.query(query);
        if (result.recordset[0]) {
          try { formData = JSON.parse(result.recordset[0].formData); } catch (e) {}
        }
      }
    }

    if (!formData) {
      formData = {
        slNo: slNo || "FR-2026-001",
        date: date || new Date().toISOString().split("T")[0],
        from: "Machine Shop Dept",
        to: "CFT Leader",
        partName: "Steering Knuckle",
        partNo: "SK-9021",
        customer: "OEM Automotive",
        manufacturingProcess: { requirements: "Verify fixture clamping force & cycle balance.", feasible: "Feasible" },
        systemRequirement: { requirements: "SAP ERP Routing and BOM update.", feasible: "Feasible" },
        inspectionRequirement: { requirements: "CMM layout inspection for critical dimensions.", feasible: "Feasible" },
        anyOtherRequirement: { requirements: "Operator training on updated SOP.", feasible: "Feasible" },
        additionalManufacturing: "No additional machines required. Existing VMC capacity sufficient.",
        conclusionFeasible: true,
        cftMembers: ["R. Kumar (Mfg)", "M. Suresh (Quality)", "P. Ramesh (Tooling)", "K. Anand (Mkt)", "V. Vijay (Prod)", "S. David (Maint)"],
        comments: "All CFT requirements evaluated and verified as feasible.",
        forwardedTo: "Head of Foundry & Plant Head for Final Acknowledgment",
      };
    }

    const doc = new PDFDocument({ margin: 28, size: "A4", layout: "portrait", bufferPages: true, autoPageBreak: false });
    const filename = `FeasibilityReport_${formData.slNo || "Form"}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    doc.pipe(res);

    const startX = 28;
    const startY = 28;
    const pageWidth = doc.page.width - 56;
    let currentY = startY;

    // Header Box
    doc.lineWidth(1).rect(startX, currentY, pageWidth, 55).stroke();
    const logoPath = path.join(__dirname, "logo.jpg");
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, startX + 5, currentY + 6, { width: 45, height: 42 }); } catch (e) {}
    }

    doc.font("Helvetica-Bold").fontSize(13).text("SAKTHI AUTO COMPONENT LIMITED", startX + 60, currentY + 14, { width: 330, align: "center" });
    doc.font("Helvetica-Bold").fontSize(10.5).text("FEASIBILITY REPORT FOR CHANGE REQUEST", startX + 60, currentY + 32, { width: 330, align: "center" });

    doc.lineWidth(0.5).rect(startX + 400, currentY, pageWidth - 400, 55).stroke();
    doc.font("Helvetica").fontSize(7.5);
    doc.text(`SL. No: ${formData.slNo || "-"}`, startX + 405, currentY + 12);
    doc.text(`Date: ${formData.date || "-"}`, startX + 405, currentY + 26);
    doc.font("Helvetica-Bold").fontSize(7).text("QF/07/MRO-02", startX + 405, currentY + 40);

    currentY += 55;

    // Meta Section
    const colW = pageWidth / 3;
    const rowH = 18;
    const drawCell = (x, y, w, h, title, val) => {
      doc.lineWidth(0.5).rect(x, y, w, h).stroke();
      doc.font("Helvetica-Bold").fontSize(7).text(title, x + 3, y + 4);
      doc.font("Helvetica").fontSize(7.5).text(String(val || "-"), x + 3, y + 11);
    };

    drawCell(startX, currentY, colW, rowH, "FROM", formData.from);
    drawCell(startX + colW, currentY, colW, rowH, "TO", formData.to);
    drawCell(startX + colW * 2, currentY, colW, rowH, "SL NO", formData.slNo);
    currentY += rowH;

    drawCell(startX, currentY, colW, rowH, "PART NAME", formData.partName);
    drawCell(startX + colW, currentY, colW, rowH, "PART NO", formData.partNo);
    drawCell(startX + colW * 2, currentY, colW, rowH, "CUSTOMER", formData.customer);
    currentY += rowH;

    // Table Header
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 20).fillAndStroke("#F0F0F0", "#000000");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(7.5);
    doc.text("CATEGORY OF CHANGE", startX + 6, currentY + 6);
    doc.text("REQUIREMENTS OF THE CHANGE", startX + 210, currentY + 6);
    doc.text("FEASIBLE / NOT FEASIBLE", startX + 420, currentY + 6);
    currentY += 20;

    const catRows = [
      ["Manufacturing Process / Product Requirement", formData.manufacturingProcess?.requirements, formData.manufacturingProcess?.feasible],
      ["System Requirement", formData.systemRequirement?.requirements, formData.systemRequirement?.feasible],
      ["Inspection Requirement", formData.inspectionRequirement?.requirements, formData.inspectionRequirement?.feasible],
      ["Any Other Requirement", formData.anyOtherRequirement?.requirements, formData.anyOtherRequirement?.feasible],
    ];

    catRows.forEach(([cat, reqText, feas]) => {
      const itemH = 32;
      doc.lineWidth(0.5).rect(startX, currentY, pageWidth, itemH).stroke();
      doc.font("Helvetica-Bold").fontSize(7.5).text(cat, startX + 6, currentY + 6, { width: 195 });
      doc.font("Helvetica").fontSize(7.5).text(reqText || "-", startX + 210, currentY + 6, { width: 200 });
      doc.font("Helvetica-Bold").fontSize(8).text(feas || "-", startX + 425, currentY + 6);
      currentY += itemH;
    });

    // Additional Resource Requirement
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 42).stroke();
    doc.font("Helvetica-Bold").fontSize(7.5).text("ADDITIONAL RESOURCE REQUIREMENT (FOUNDRY / MACHINE SHOP):", startX + 6, currentY + 5);
    doc.font("Helvetica").fontSize(7.5).text(formData.additionalManufacturing || "None required.", startX + 6, currentY + 18, { width: pageWidth - 12 });
    currentY += 42;

    // Conclusion
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 22).stroke();
    doc.font("Helvetica-Bold").fontSize(8).text("CONCLUSION:", startX + 6, currentY + 7);
    const feasB = formData.conclusionFeasible ? "[X] FEASIBLE" : "[ ] FEASIBLE";
    const notFeasB = formData.conclusionNotFeasible ? "[X] NOT FEASIBLE" : "[ ] NOT FEASIBLE";
    doc.text(`${feasB}             ${notFeasB}`, startX + 100, currentY + 7);
    currentY += 22;

    // CFT Members Sign
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 55).stroke();
    doc.font("Helvetica-Bold").fontSize(7.5).text("CFT MEMBERS SIGN / DATE", startX + 6, currentY + 4);
    const cfts = formData.cftMembers || [];
    doc.font("Helvetica").fontSize(7.5);
    doc.text(`1. ${cfts[0] || "-"}`, startX + 15, currentY + 18);
    doc.text(`2. ${cfts[1] || "-"}`, startX + 15, currentY + 30);
    doc.text(`3. ${cfts[2] || "-"}`, startX + 15, currentY + 42);

    doc.text(`4. ${cfts[3] || "-"}`, startX + 270, currentY + 18);
    doc.text(`5. ${cfts[4] || "-"}`, startX + 270, currentY + 30);
    doc.text(`6. ${cfts[5] || "-"}`, startX + 270, currentY + 42);
    currentY += 55;

    // Comments & Forwarded To
    doc.lineWidth(0.5).rect(startX, currentY, pageWidth, 36).stroke();
    doc.font("Helvetica-Bold").fontSize(7.5).text("COMMENTS:", startX + 6, currentY + 4);
    doc.font("Helvetica").fontSize(7.5).text(formData.comments || "-", startX + 6, currentY + 14, { width: pageWidth - 12 });
    doc.font("Helvetica-Bold").fontSize(7.5).text(`FORWARDED TO: ${formData.forwardedTo || "Acknowledgment"}`, startX + 6, currentY + 25);

    // Footer QF String
    doc.font("Helvetica-Bold").fontSize(8).text("QF / 07 / MRO - 02    10 / 06 / 2015", startX, doc.page.height - 20);

    doc.end();
  } catch (err) {
    console.error("Feasibility PDF generation error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate PDF" });
  }
};

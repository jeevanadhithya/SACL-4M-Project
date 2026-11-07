const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

/**
 * POST /api/forms/:formType
 * Saves or updates a digitized consultancy form record
 */
router.post("/:formType", verifyToken, async (req, res) => {
  const { formType } = req.params;
  const { recordKey, partName, customer, status, formData, remarks } = req.body;

  if (!formData) {
    return res.status(400).json({ error: "formData payload is required." });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    const user = req.user || {};
    const jsonContent = typeof formData === "string" ? formData : JSON.stringify(formData);
    const resolvedRecordKey = recordKey || formData.pcrfNo || formData.slNo || formData.partNo || new Date().toISOString().split("T")[0];

    const request = pool.request();
    request.input("formType", sql.VarChar, formType);
    request.input("recordKey", sql.VarChar, String(resolvedRecordKey));
    request.input("partName", sql.VarChar, partName || formData.partName || "");
    request.input("customer", sql.VarChar, customer || formData.customer || "");
    request.input("status", sql.VarChar, status || "Pending Approval");
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
      message: `Form ${row.action === "UPDATED" ? "updated" : "saved"} successfully`,
      action: row.action,
      id: row.id,
      recordKey: resolvedRecordKey,
    });
  } catch (error) {
    console.error(`Save Form Error (${formType}):`, error);
    return res.status(500).json({ error: `Failed to save form record: ${error.message}` });
  }
});

/**
 * GET /api/forms/:formType
 * Lists records for a specific form type
 */
router.get("/:formType", verifyToken, async (req, res) => {
  const { formType } = req.params;
  const { recordKey, status, customer, partName } = req.query;

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    let query = "SELECT id, formType, recordKey, partName, customer, status, remarks, createdBy, lastUpdatedBy, createdAt, updatedAt FROM ConsultancyForms WHERE formType = @formType";
    const request = pool.request();
    request.input("formType", sql.VarChar, formType);

    if (recordKey) {
      request.input("recordKey", sql.VarChar, recordKey);
      query += " AND recordKey = @recordKey";
    }
    if (status) {
      request.input("status", sql.VarChar, status);
      query += " AND status = @status";
    }
    if (customer) {
      request.input("customer", sql.VarChar, `%${customer}%`);
      query += " AND customer LIKE @customer";
    }
    if (partName) {
      request.input("partName", sql.VarChar, `%${partName}%`);
      query += " AND partName LIKE @partName";
    }

    query += " ORDER BY updatedAt DESC";

    const result = await request.query(query);
    return res.status(200).json({ records: result.recordset });
  } catch (error) {
    console.error(`Fetch Forms Error (${formType}):`, error);
    return res.status(500).json({ error: "Failed to fetch form records." });
  }
});

/**
 * GET /api/forms/:formType/:id
 * Fetches the full JSON content of a specific form record
 */
router.get("/:formType/:id", verifyToken, async (req, res) => {
  const { formType, id } = req.params;

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    const request = pool.request();
    request.input("formType", sql.VarChar, formType);
    request.input("idOrKey", sql.VarChar, id);

    const query = `
      SELECT TOP 1 * FROM ConsultancyForms 
      WHERE formType = @formType AND (CAST(id as VARCHAR) = @idOrKey OR recordKey = @idOrKey)
    `;

    const result = await request.query(query);
    const record = result.recordset[0];

    if (!record) {
      return res.status(404).json({ error: "Form record not found." });
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
    console.error(`Fetch Form Detail Error (${formType}):`, error);
    return res.status(500).json({ error: "Failed to fetch form detail." });
  }
});

/**
 * PATCH /api/forms/:formType/:id/status
 * Approves, rejects, or signs off a form
 */
router.patch("/:formType/:id/status", verifyToken, async (req, res) => {
  const { formType, id } = req.params;
  const { status, remarks, signature } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    const user = req.user || {};
    const request = pool.request();
    request.input("formType", sql.VarChar, formType);
    request.input("idOrKey", sql.VarChar, id);
    request.input("status", sql.VarChar, status);
    request.input("remarks", sql.NVarChar(sql.MAX), remarks || "");
    request.input("username", sql.VarChar, user.username || "System");

    const query = `
      UPDATE ConsultancyForms
      SET status = @status,
          remarks = ISNULL(@remarks, remarks),
          lastUpdatedBy = @username,
          updatedAt = GETDATE()
      WHERE formType = @formType AND (CAST(id as VARCHAR) = @idOrKey OR recordKey = @idOrKey);
      
      SELECT TOP 1 id, recordKey, status, updatedAt FROM ConsultancyForms 
      WHERE formType = @formType AND (CAST(id as VARCHAR) = @idOrKey OR recordKey = @idOrKey);
    `;

    const result = await request.query(query);
    const updated = result.recordset[0];

    if (!updated) {
      return res.status(404).json({ error: "Form record not found to update." });
    }

    return res.status(200).json({
      message: `Form status updated to ${status}`,
      record: updated,
    });
  } catch (error) {
    console.error(`Update Status Error (${formType}):`, error);
    return res.status(500).json({ error: "Failed to update form status." });
  }
});

module.exports = router;


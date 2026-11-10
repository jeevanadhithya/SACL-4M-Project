const express = require("express");
const router = express.Router();
const controller = require("../controllers/feasibilityReportController");
const { verifyToken } = require("../middleware/authMiddleware");

// 1. Fetch record
router.get("/feasibility-report/record", verifyToken, controller.getRecord);

// 2. Save / Update record
router.post("/feasibility-report/save", verifyToken, controller.saveRecord);

// 3. Backend PDFKit Stream Generation
router.get("/feasibility-report/report", controller.generateReport);

module.exports = router;

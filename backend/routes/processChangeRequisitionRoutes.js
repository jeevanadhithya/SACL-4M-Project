const express = require("express");
const router = express.Router();
const controller = require("../controllers/processChangeRequisitionController");
const { verifyToken } = require("../middleware/authMiddleware");

// 1. Fetch record
router.get("/process-change-requisition/record", verifyToken, controller.getRecord);

// 2. Save / Update record
router.post("/process-change-requisition/save", verifyToken, controller.saveRecord);

// 3. Backend PDFKit Report Generation & Direct Stream
router.get("/process-change-requisition/report", controller.generateReport);

module.exports = router;

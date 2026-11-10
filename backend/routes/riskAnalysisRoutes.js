const express = require("express");
const router = express.Router();
const controller = require("../controllers/riskAnalysisController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/risk-analysis/record", verifyToken, controller.getRecord);
router.post("/risk-analysis/save", verifyToken, controller.saveRecord);
router.get("/risk-analysis/report", controller.generateReport);

module.exports = router;

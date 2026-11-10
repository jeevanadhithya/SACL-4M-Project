const express = require("express");
const router = express.Router();
const controller = require("../controllers/timingPlanController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/timing-plan/record", verifyToken, controller.getRecord);
router.post("/timing-plan/save", verifyToken, controller.saveRecord);
router.get("/timing-plan/report", controller.generateReport);

module.exports = router;

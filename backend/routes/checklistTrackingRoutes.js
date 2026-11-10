const express = require("express");
const router = express.Router();
const controller = require("../controllers/checklistTrackingController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/change-tracking/record", verifyToken, controller.getRecord);
router.post("/change-tracking/save", verifyToken, controller.saveRecord);
router.get("/change-tracking/report", controller.generateReport);

module.exports = router;

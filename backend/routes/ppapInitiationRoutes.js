const express = require("express");
const router = express.Router();
const controller = require("../controllers/ppapInitiationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/ppap-initiation/record", verifyToken, controller.getRecord);
router.post("/ppap-initiation/save", verifyToken, controller.saveRecord);
router.get("/ppap-initiation/report", controller.generateReport);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("../controllers/ptrInitiationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/ptr-initiation/record", verifyToken, controller.getRecord);
router.post("/ptr-initiation/save", verifyToken, controller.saveRecord);
router.get("/ptr-initiation/report", controller.generateReport);

module.exports = router;

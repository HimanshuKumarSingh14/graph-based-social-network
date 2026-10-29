const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboard, getRecentActivity } = require("../controllers/dashboardController");

router.get("/stats", authMiddleware, getDashboard);
router.get("/recent", authMiddleware, getRecentActivity);

module.exports = router;

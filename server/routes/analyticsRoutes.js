const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMyCentrality,
  getCentralityLeaderboard,
  getCommunities,
  getConnectionBreakdown,
} = require("../controllers/analyticsController");

router.get("/centrality", authMiddleware, getMyCentrality);
router.get("/centrality/leaderboard", authMiddleware, getCentralityLeaderboard);
router.get("/communities", authMiddleware, getCommunities);
router.get("/connections", authMiddleware, getConnectionBreakdown);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMutualFriends,
  getSuggestions,
  shortestPath,
  networkStats,
  mostConnectedUser,
  getGraphData,
} = require("../controllers/graphController");

router.get("/", authMiddleware, getGraphData);
router.get("/stats", authMiddleware, networkStats);
router.get("/most-connected", authMiddleware, mostConnectedUser);
router.get("/mutual/:email1/:email2", authMiddleware, getMutualFriends);
router.get("/suggestions/:email", authMiddleware, getSuggestions);
router.get("/path/:email1/:email2", authMiddleware, shortestPath);

module.exports = router;

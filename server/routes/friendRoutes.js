const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendRequest,
  getPendingRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
} = require("../controllers/friendController");

router.post("/send-request", authMiddleware, sendRequest);
router.get("/pending", authMiddleware, getPendingRequests);
router.get("/sent", authMiddleware, getSentRequests);
router.post("/accept", authMiddleware, acceptRequest);
router.post("/reject", authMiddleware, rejectRequest);

module.exports = router;

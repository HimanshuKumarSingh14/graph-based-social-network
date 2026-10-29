const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { sendMessage, getConversation, getConversations } = require("../controllers/messageController");

router.get("/conversations", authMiddleware, getConversations);
router.get("/:friendEmail", authMiddleware, getConversation);
router.post("/", authMiddleware, sendMessage);

module.exports = router;

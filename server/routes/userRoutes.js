const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.get("/all", authMiddleware, userController.getAllUsers);
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/update-profile", authMiddleware, userController.updateProfile);
router.post("/add-friend", authMiddleware, userController.addFriend);
router.delete("/delete-friend", authMiddleware, userController.deleteFriend);
router.get("/friends", authMiddleware, userController.getFriends);

module.exports = router;

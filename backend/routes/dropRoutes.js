const express = require("express");
const router = express.Router();
const dropController = require("../controllers/dropController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public: see all drops
router.get("/", dropController.getPublicDrops);
router.get("/:id", dropController.getDropDetails);

// Protected: join waitlist (needs login token)
router.post("/:id/join", verifyToken, dropController.joinWaitlist);
router.post("/:id/leave", verifyToken, dropController.leaveWaitlist);
router.post("/:id/claim", verifyToken, dropController.claimDrop);
router.get("/:id/status", verifyToken, dropController.getUserDropStatus);

module.exports = router;

const express = require("express");
const router = express.Router();
const dropController = require("../controllers/dropController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public: see all drops
router.get("/", dropController.getPublicDrops);

// Protected: join waitlist (needs login token)
router.post("/:id/join", verifyToken, dropController.joinWaitlist);

module.exports = router;

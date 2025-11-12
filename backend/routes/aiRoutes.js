const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// Protect this route just like the other admin routes
router.post("/generate-desc", verifyToken, verifyAdmin, aiController.generateDescription);

module.exports = router;

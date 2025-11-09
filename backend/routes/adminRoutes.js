const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// Protect all routes in this file with both middlewares
router.use(verifyToken, verifyAdmin);

router.get("/drops", adminController.getAllDrops);
router.post("/drops", adminController.createDrop);
router.put("/drops/:id", adminController.updateDrop);
router.delete("/drops/:id", adminController.deleteDrop);

module.exports = router;

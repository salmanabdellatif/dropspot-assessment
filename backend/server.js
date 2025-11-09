const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

// Health Check Route
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW() as time");
    res.json({ status: "online", db_time: result.rows[0].time });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

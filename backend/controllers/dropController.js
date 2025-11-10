const db = require("../db");
const { calculateScore } = require("../utils/scoreCalculator");

// GET /drops - List active drops for users
exports.getPublicDrops = async (req, res) => {
  try {
    const result = await db.query(`
            SELECT id, name, description, status, starts_at, ends_at, stock_count
            FROM drops
            WHERE status != 'ended'
            ORDER BY created_at DESC
        `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /drops/:id/join - Join Waitlist
exports.joinWaitlist = async (req, res) => {
  const userId = req.user.id;
  const dropId = req.params.id;

  try {
    // 1. Get drop details
    const dropRes = await db.query("SELECT status, starts_at FROM drops WHERE id = $1", [dropId]);
    if (dropRes.rows.length === 0) return res.status(404).json({ error: "Drop not found" });

    // (Optional: Strict check if you only want them joining AFTER it starts)
    if (new Date() < new Date(dropRes.rows[0].starts_at)) {
      return res.status(400).json({ error: "Drop hasn't started yet" });
    }

    if (dropRes.rows[0].status !== "upcoming" && dropRes.rows[0].status !== "active") {
      return res.status(400).json({ error: "Waitlist is closed" });
    }

    // 2. Get user details
    const userRes = await db.query("SELECT created_at FROM users WHERE id = $1", [userId]);

    // 3. Calculate Score with new formula
    // Pass both user creation time AND drop start time
    const score = calculateScore(userRes.rows[0].created_at, dropRes.rows[0].starts_at);

    // 4. Insert into waitlist
    await db.query(
      `INSERT INTO waitlist (user_id, drop_id, score) VALUES ($1, $2, $3)
             ON CONFLICT (user_id, drop_id) DO NOTHING`,
      [userId, dropId, score]
    );

    res.json({ message: "Joined waitlist successfully", score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

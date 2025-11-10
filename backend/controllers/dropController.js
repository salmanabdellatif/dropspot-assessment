const db = require("../db");
const crypto = require("crypto");
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

// GET /drops/:id - Get single drop details (Public)
exports.getDropDetails = async (req, res) => {
  const dropId = req.params.id;
  try {
    const result = await db.query("SELECT * FROM drops WHERE id = $1", [dropId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Drop not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /drops/:id/status - Check if current user joined/claimed (Protected)
exports.getUserDropStatus = async (req, res) => {
  const userId = req.user.id;
  const dropId = req.params.id;
  try {
    // Check Waitlist
    const wlRes = await db.query("SELECT score FROM waitlist WHERE user_id = $1 AND drop_id = $2", [userId, dropId]);
    // Check Claims
    const claimRes = await db.query("SELECT claim_code FROM claims WHERE user_id = $1 AND drop_id = $2", [userId, dropId]);

    res.json({
      score: wlRes.rows.length > 0 ? wlRes.rows[0].score : null,
      claim_code: claimRes.rows.length > 0 ? claimRes.rows[0].claim_code : null,
    });
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
    // if (new Date() < new Date(dropRes.rows[0].starts_at)) {
    //   return res.status(400).json({ error: "Drop hasn't started yet" });
    // }

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

// POST /drops/:id/leave - Leave Waitlist
exports.leaveWaitlist = async (req, res) => {
  const userId = req.user.id;
  const dropId = req.params.id;
  try {
    // Simply delete the row.
    // It's idempotent: if they aren't in it, it just deletes 0 rows and succeeds.
    await db.query("DELETE FROM waitlist WHERE user_id = $1 AND drop_id = $2", [userId, dropId]);
    res.json({ message: "Left waitlist successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /drops/:id/claim - Attempt to claim an item
exports.claimDrop = async (req, res) => {
  const userId = req.user.id;
  const dropId = req.params.id;

  // Use a dedicated client from the pool for transactions
  const client = await db.pool.connect();

  try {
    // 1. Start Transaction
    await client.query("BEGIN");

    // 2. LOCK the drop row for update.
    // This makes other claim requests wait right here until we finish.
    const dropRes = await client.query("SELECT * FROM drops WHERE id = $1 FOR UPDATE", [dropId]);

    if (dropRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Drop not found" });
    }
    const drop = dropRes.rows[0];

    // 3. Checks: Is it active? Is there stock?
    if (drop.status !== "active") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Drop is not active for claiming" });
    }
    if (drop.stock_count < 1) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Sold Out" }); // 409 Conflict is good for sold out
    }

    // 4. Verify User is in Waitlist (Optional but good for fairness)
    // You could also check if they have a high enough score here if you wanted.
    const wlCheck = await client.query("SELECT * FROM waitlist WHERE user_id = $1 AND drop_id = $2", [userId, dropId]);
    if (wlCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "You must join the waitlist first" });
    }

    // 5. Check if already claimed (Idempotency)
    const claimCheck = await client.query("SELECT id FROM claims WHERE user_id = $1 AND drop_id = $2", [userId, dropId]);
    if (claimCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      // Return 200 with existing code is a good idempotency pattern,
      // or 409 if you want to be strict. Let's return their existing code.
      return res.status(200).json({
        message: "Already claimed",
        claim_code: claimCheck.rows[0].claim_code,
      });
    }

    // 6. EVERYTHING OK -> PROCESS CLAIM
    // a) Decrement Stock
    await client.query("UPDATE drops SET stock_count = stock_count - 1 WHERE id = $1", [dropId]);

    // b) Generate Claim Code & Insert Record
    const claimCode = crypto.randomBytes(8).toString("hex").toUpperCase();
    await client.query("INSERT INTO claims (user_id, drop_id, claim_code) VALUES ($1, $2, $3)", [userId, dropId, claimCode]);

    // 7. Commit Transaction
    await client.query("COMMIT");

    res.status(201).json({
      message: "SUCCESS! Item claimed.",
      claim_code: claimCode,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Claim Error:", err);
    res.status(500).json({ error: "Transaction failed" });
  } finally {
    client.release(); // VERY IMPORTANT: Release client back to pool
  }
};

const db = require("../db");

// GET /admin/drops - List all drops (even non-active ones)
exports.getAllDrops = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM drops ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /admin/drops - Create new drop
exports.createDrop = async (req, res) => {
  const { name, description, stock_count, starts_at, ends_at } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO drops (name, description, stock_count, starts_at, ends_at, status)
             VALUES ($1, $2, $3, $4, $5, 'upcoming')
             RETURNING *`,
      [name, description, stock_count, starts_at, ends_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /admin/drops/:id - Update drop
exports.updateDrop = async (req, res) => {
  const { id } = req.params;
  const { name, description, stock_count, status, starts_at, ends_at } = req.body;
  try {
    const result = await db.query(
      `UPDATE drops SET
             name = COALESCE($1, name),
             description = COALESCE($2, description),
             stock_count = COALESCE($3, stock_count),
             status = COALESCE($4, status),
             starts_at = COALESCE($5, starts_at),
             ends_at = COALESCE($6, ends_at)
             WHERE id = $7 RETURNING *`,
      [name, description, stock_count, status, starts_at, ends_at, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Drop not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /admin/drops/:id - Delete drop
exports.deleteDrop = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM drops WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Drop not found" });
    res.json({ message: "Drop deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

import express from "express";
const usersRoutes = express.Router();

// GET all users
usersRoutes.get("/", (req, res) => {
  const sql = `SELECT id, username, email FROM users`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

// GET single user
usersRoutes.get("/:id", (req, res) => {
  const sql = `SELECT id, username, email FROM users WHERE id = ?`;

  req.db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(row);
  });
});

export default usersRoutes;

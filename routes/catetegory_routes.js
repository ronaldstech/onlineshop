import express from "express";
const categoriesRoutes = express.Router();

// GET all categories
categoriesRoutes.get("/", (req, res) => {
  const sql = `SELECT * FROM categories ORDER BY name ASC`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

export default categoriesRoutes;

import express from "express";
const productRoutes = express.Router();
import upload from "../middleware/fileupload.js";

productRoutes.get("/", (req, res) => {
  const sql = `
    SELECT products.*, categories.name AS categoryName
    FROM products
    LEFT JOIN categories ON products.categoryId = categories.id
  `;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

// get product by id
productRoutes.get("/:id", (req, res) => {
  const sql = `
    SELECT products.*, categories.name AS categoryName
    FROM products
    LEFT JOIN categories ON products.categoryId = categories.id
    WHERE products.id = ?
  `;

  req.db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(row);
  });
});
// create a product
// productRoutes.post("/", (req, res) => {
//   const { title, price, description, categoryId, image } = req.body;

//   const sql = `
//     INSERT INTO products (title, price, description, categoryId, image)
//     VALUES (?, ?, ?, ?, ?)
//   `;

//   req.db.run(
//     sql,
//     [title, price, description, categoryId, image],
//     function (err) {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }

//       res.status(201).json({
//         id: this.lastID,
//         title,
//         price,
//         description,
//         categoryId,
//         image
//       });
//     }
//   );
// });
// upload
productRoutes.post("/", upload.single("image"), (req, res) => {
  const { title, price, description, categoryId } = req.body;

  // file path stored in DB
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `
    INSERT INTO products (title, price, description, categoryId, image)
    VALUES (?, ?, ?, ?, ?)
  `;

  req.db.run(
    sql,
    [title, price, description, categoryId, imagePath],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        price,
        description,
        categoryId,
        image: imagePath,
      });
    },
  );
});

// update a product
productRoutes.put("/:id", (req, res) => {
  const { title, price, description, categoryId, image } = req.body;

  const sql = `
    UPDATE products
    SET title = ?, price = ?, description = ?, categoryId = ?, image = ?
    WHERE id = ?
  `;

  req.db.run(
    sql,
    [title, price, description, categoryId, image, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product updated successfully" });
    },
  );
});

export default productRoutes;

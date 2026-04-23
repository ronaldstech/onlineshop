import express from "express";
const cartRoutes = express.Router();

// create a cart
cartRoutes.post("/", (req, res) => {
  const { userId } = req.body;

  const sql = `
    INSERT INTO carts (userId)
    VALUES (?)
  `;

  req.db.run(sql, [userId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      id: this.lastID,
      userId
    });
  });
});

// add item to a cart
cartRoutes.post("/item", (req, res) => {
  const { cartId, productId, quantity } = req.body;

  const sql = `
    INSERT INTO cart_items (cartId, productId, quantity)
    VALUES (?, ?, ?)
  `;

  req.db.run(sql, [cartId, productId, quantity], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      id: this.lastID,
      cartId,
      productId,
      quantity
    });
  });
});

// get cart by user
cartRoutes.get("/user/:userId", (req, res) => {
  const sql = `
    SELECT 
      carts.id AS cartId,
      cart_items.id AS cartItemId,
      products.id AS productId,
      products.title,
      products.price,
      cart_items.quantity
    FROM carts
    LEFT JOIN cart_items ON carts.id = cart_items.cartId
    LEFT JOIN products ON products.id = cart_items.productId
    WHERE carts.userId = ?
  `;

  req.db.all(sql, [req.params.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});
// update item quantity
cartRoutes.put("/item/:id", (req, res) => {
  const { quantity } = req.body;

  const sql = `
    UPDATE cart_items
    SET quantity = ?
    WHERE id = ?
  `;

  req.db.run(sql, [quantity, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Quantity updated" });
  });
});
// remove item
cartRoutes.delete("/item/:id", (req, res) => {
  const sql = `
    DELETE FROM cart_items
    WHERE id = ?
  `;

  req.db.run(sql, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item removed from cart" });
  });
});
// remove all items
cartRoutes.delete("/clear/:cartId", (req, res) => {
  const sql = `
    DELETE FROM cart_items
    WHERE cartId = ?
  `;

  req.db.run(sql, [req.params.cartId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Cart cleared" });
  });
});

export default cartRoutes;

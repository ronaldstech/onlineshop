import express from "express";
const orderRoutes = express.Router();

orderRoutes.post("/checkout/:userId", (req, res) => {
  const userId = req.params.userId;

  // 1. Get cart items
  const getCartItems = `
    SELECT 
      cart_items.productId,
      cart_items.quantity,
      products.price
    FROM carts
    JOIN cart_items ON carts.id = cart_items.cartId
    JOIN products ON products.id = cart_items.productId
    WHERE carts.userId = ?
  `;

  req.db.all(getCartItems, [userId], (err, items) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Calculate total
    let total = 0;
    items.forEach(item => {
      total += item.price * item.quantity;
    });

    // 3. Create order
    req.db.run(
      `INSERT INTO orders (userId, total) VALUES (?, ?)`,
      [userId, total],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const orderId = this.lastID;

        // 4. Insert order items
        const stmt = req.db.prepare(`
          INSERT INTO order_items (orderId, productId, quantity, price)
          VALUES (?, ?, ?, ?)
        `);

        items.forEach(item => {
          stmt.run(orderId, item.productId, item.quantity, item.price);
        });

        stmt.finalize();

        // 5. Clear cart after checkout
        req.db.run(
          `DELETE FROM cart_items WHERE cartId IN (SELECT id FROM carts WHERE userId = ?)`,
          [userId]
        );

        res.status(201).json({
          message: "Order created successfully",
          orderId,
          total
        });
      }
    );
  });
});

// get all orders
orderRoutes.get("/", (req, res) => {
  const sql = `
    SELECT orders.*, users.username
    FROM orders
    JOIN users ON orders.userId = users.id
    ORDER BY orders.createdAt DESC
  `;

  req.db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(rows);
  });
});
// get orders by user
orderRoutes.get("/user/:userId", (req, res) => {
  const sql = `
    SELECT * FROM orders
    WHERE userId = ?
    ORDER BY createdAt DESC
  `;

  req.db.all(sql, [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(rows);
  });
});
// get a single order
orderRoutes.get("/:orderId", (req, res) => {
  const orderId = req.params.orderId;

  const orderSql = `SELECT * FROM orders WHERE id = ?`;

  const itemsSql = `
    SELECT 
      order_items.*,
      products.title,
      products.image
    FROM order_items
    JOIN products ON products.id = order_items.productId
    WHERE orderId = ?
  `;

  req.db.get(orderSql, [orderId], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    req.db.all(itemsSql, [orderId], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        order,
        items
      });
    });
  });
});

export default orderRoutes;

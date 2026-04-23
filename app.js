import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

import createTables from "./database/tables.js";
import connectdb from "./database/connectdb.js";

import productRoutes from "./routes/product_routes.js";
import usersRoutes from "./routes/users_routes.js";
import cartRoutes from "./routes/cart_routes.js";
import orderRoutes from "./routes/order_routes.js";
import categoriesRoutes from "./routes/catetegory_routes.js";

const PORT = 4000;

const app = express();

//middleware
app.use(cors({
  origin: "http://localhost:5000"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

//database
const db = connectdb(sqlite3);

createTables(db);
// seeddb(db);

// inject db into requests
app.use((req, res, next) => {
  req.db = db;
  next();
});

//routes
app.use("/api/products", productRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoriesRoutes);

//start server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
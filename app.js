import express from "express";
import sqlite3 from "sqlite3";
import createTables from "./database/tables.js";
import seeddb from "./database/seeder.js";
import connectdb from "./database/connectdb.js";
import productRoutes from "./routes/product_routes.js";
import usersRoutes from "./routes/users_routes.js";
import cartRoutes from "./routes/cart_routes.js";
import orderRoutes from "./routes/order_routes.js";
import categoriesRoutes from "./routes/catetegory_routes.js";

const PORT = 4000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// connect to db
const db = connectdb(sqlite3);

// create tables
createTables(db);
// seeddb(db);

//
app.use((req, res, next) => {
  req.db = db;
  next();
});

// product routes
app.use("/api/products", productRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoriesRoutes);

app.listen(PORT, () => console.log("server running . . . . ."));

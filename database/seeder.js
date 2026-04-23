function seeddb(db) {
  db.serialize(() => {
    // USERS
    const users = [
      ["john", "john@example.com", "1234"],
      ["mary", "mary@example.com", "1234"],
      ["admin", "admin@example.com", "admin"],
    ];

    users.forEach((user) => {
      db.run(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        user,
        (err) => {
          if (err) console.log("User insert skipped:", err.message);
        },
      );
    });
  });

  db.serialize(() => {
    const categories = [
      "Electronics",
      "Jewelery",
      "Mens clothing",
      "Womens clothing",
    ];
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO categories (name)
      VALUES (?)
    `);

    categories.forEach((category) => {
      stmt.run(category);
    });

    stmt.finalize();
  });

  // products seeder
  const products = [
    {
      title: "iPhone 13",
      price: 999.99,
      description: "Latest Apple smartphone",
      category: "Electronics",
      image: "/uploads/iphone2.jpg",
    },
    {
      title: "Samsung TV",
      price: 599.99,
      description: "50 inch smart TV",
      category: "Electronics",
      image: "/uploads/tv1.jpg",
    },
    {
      title: "Gold Necklace",
      price: 299.99,
      description: "24k gold necklace",
      category: "Jewelery",
      image: "/uploads/necklace1.jpg",
    },
    {
      title: "Men's T-Shirt",
      price: 19.99,
      description: "Cotton t-shirt",
      category: "Mens clothing",
      image: "/uploads/shirt1.jpeg",
    },
    {
      title: "Women's Dress",
      price: 49.99,
      description: "Summer dress",
      category: "Womens clothing",
      image: "/uploads/dress1.jpeg",
    },
  ];

  db.serialize(() => {
    // First get all categories
    db.all("SELECT * FROM categories", [], (err, categories) => {
      if (err) {
        console.error(err);
        return;
      }

      // Map category name -> id
      const categoryMap = {};
      categories.forEach((cat) => {
        categoryMap[cat.name] = cat.id;
      });

      const stmt = db.prepare(`
        INSERT OR IGNORE INTO products 
        (title, price, description, categoryId, image)
        VALUES (?, ?, ?, ?, ?)
      `);

      products.forEach((p) => {
        const categoryId = categoryMap[p.category];

        if (!categoryId) {
          console.warn(`Category not found: ${p.category}`);
          return;
        }

        stmt.run(p.title, p.price, p.description, categoryId, p.image);
      });

      stmt.finalize();
    });
  });
}
export default seeddb;

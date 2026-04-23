function connectdb(sqlite3) {
  const db = new sqlite3.Database("./database.db", (err) => {
    if (err) console.error(err.message);
    else console.log("Connected to SQLite database");
  });
  return db;
}

export default connectdb;

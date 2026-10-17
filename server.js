require("@aikidosec/firewall");
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const db = new Database(":memory:");
db.exec(`
  CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT);
  INSERT INTO products VALUES (1, 'Widget', 'hardware');
  INSERT INTO products VALUES (2, 'Gadget', 'electronics');
  INSERT INTO products VALUES (3, 'Doohickey', 'hardware');
`);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    name: "Aikido Zen Firewall Demo",
    description: "Express app with real SQL backend, protected by @aikidosec/firewall",
    routes: {
      "GET /search?q=<term>": "Product search — SQL injection sink",
      "GET /file?name=<path>": "File reader — path traversal sink",
      "GET /profile/:id": "Profile lookup",
    },
    test: "Try: /search?q=widget (safe) vs /search?q=' OR '1'='1 (blocked)",
  });
});

app.get("/search", (req, res) => {
  const q = req.query.q || "";
  const rows = db.prepare(`SELECT * FROM products WHERE name LIKE '%${q}%'`).all();
  res.json({ query: q, results: rows });
});

app.get("/file", (req, res) => {
  const name = req.query.name || "readme.txt";
  const filePath = path.join(__dirname, "public", name);
  try {
    const content = fs.readFileSync(filePath, "utf8");
    res.json({ file: name, content });
  } catch {
    res.status(404).json({ error: `File not found: ${name}` });
  }
});

app.get("/profile/:id", (req, res) => {
  const row = db.prepare(`SELECT * FROM products WHERE id = ${req.params.id}`).get();
  res.json(row || { error: "Not found" });
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Aikido Zen demo on http://127.0.0.1:${PORT}`);
  console.log("AIKIDO_BLOCK:", process.env.AIKIDO_BLOCK || "not set");
});

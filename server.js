require("@aikidosec/firewall");
const express = require("express");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    name: "Aikido Zen Firewall Demo",
    description: "Express app protected by @aikidosec/firewall",
    routes: {
      "GET /search?q=<term>": "Search endpoint (SQL injection test target)",
      "POST /login": "Login form (path traversal test target)",
      "GET /profile/:id": "Profile lookup (SSRF test target)",
    },
  });
});

app.get("/search", (req, res) => {
  const q = req.query.q || "";
  res.json({ query: q, results: [`Result for: ${q}`] });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  res.json({ message: `Login attempt for ${username}` });
});

app.get("/profile/:id", (req, res) => {
  res.json({ id: req.params.id, name: "Demo User" });
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Aikido Zen demo on http://127.0.0.1:${PORT}`);
  console.log("Try: curl 'http://127.0.0.1:4100/search?q=1%20OR%201=1'");
});

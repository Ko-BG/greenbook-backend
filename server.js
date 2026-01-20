// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({ origin: true })); // allow all origins
app.use(bodyParser.json());

// ✅ In-memory user storage (replace with DB in production)
let users = [];

// 🔹 Signup route
app.post("/api/signup", async (req, res) => {
  const { id, name, pass, role } = req.body;

  if (!id || !name || !pass || !role) {
    return res.json({ error: "All fields required" });
  }

  const exists = users.find(u => u.id === id);
  if (exists) return res.json({ error: "ID already exists" });

  const hash = await bcrypt.hash(pass, 10);
  const user = { id, name, role, pass: hash };
  users.push(user);

  res.json({ message: "Signup successful" });
});

// 🔹 Login route
app.post("/api/login", async (req, res) => {
  const { id, pass } = req.body;

  if (!id || !pass) return res.json({ error: "ID and password required" });

  const user = users.find(u => u.id === id);
  if (!user) return res.json({ error: "User not found" });

  const valid = await bcrypt.compare(pass, user.pass);
  if (!valid) return res.json({ error: "Incorrect password" });

  res.json({ user: { id: user.id, name: user.name, role: user.role } });
});

// 🔹 Default route to avoid "Cannot GET /"
app.get("/", (req, res) => {
  res.send("✅ GreenBook Backend is running. Use /api/signup and /api/login");
});

// 🔹 Start server
app.listen(PORT, () => {
  console.log(`GreenBook backend running on port ${PORT}`);
});
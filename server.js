import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));
app.use(bodyParser.json());

// In-memory users (replace with DB for production)
let users = [];

// Signup
app.post("/api/signup", async (req, res) => {
  const { id, name, pass, role } = req.body;
  if (!id || !name || !pass || !role) return res.json({ error: "All fields required" });
  if (users.find(u => u.id === id)) return res.json({ error: "ID already exists" });
  const hash = await bcrypt.hash(pass, 10);
  const user = { id, name, role, pass: hash };
  users.push(user);
  res.json({ message: "Signup successful" });
});

// Login
app.post("/api/login", async (req, res) => {
  const { id, pass } = req.body;
  const user = users.find(u => u.id === id);
  if (!user) return res.json({ error: "User not found" });
  const valid = await bcrypt.compare(pass, user.pass);
  if (!valid) return res.json({ error: "Incorrect password" });
  res.json({ user: { id: user.id, name: user.name, role: user.role } });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
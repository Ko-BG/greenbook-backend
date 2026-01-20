import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ---------------- DATABASE (Memory MVP) ---------------- */
let users = [];
let onlineUsers = {};
let feed = [];
let assignments = [];
let results = [];

/* ---------------- HEALTH ---------------- */
app.get("/", (req, res) => {
  res.send("✅ GreenBook Backend Live");
});

/* ---------------- STATUS ---------------- */
app.get("/api/status", (req, res) => {
  res.json({
    online: Object.keys(onlineUsers).length
  });
});

/* ---------------- AUTH ---------------- */
app.post("/api/signup", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: "User already exists" });
  }

  const user = { id: Date.now(), name, email, password, role };
  users.push(user);

  res.json({ success: true });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  onlineUsers[user.id] = user;

  res.json({
    id: user.id,
    name: user.name,
    role: user.role
  });
});

app.post("/api/logout", (req, res) => {
  const { userId } = req.body;
  delete onlineUsers[userId];
  res.json({ success: true });
});

/* ---------------- FEED ---------------- */
app.post("/api/feed", (req, res) => {
  feed.unshift(req.body);
  res.json({ success: true });
});

app.get("/api/feed", (req, res) => {
  res.json(feed);
});

/* ---------------- ASSIGNMENTS ---------------- */
app.post("/api/assignment", (req, res) => {
  assignments.push(req.body);
  res.json({ success: true });
});

app.get("/api/assignment", (req, res) => {
  res.json(assignments);
});

/* ---------------- RESULTS ---------------- */
app.post("/api/result", (req, res) => {
  results.push(req.body);
  res.json({ success: true });
});

app.get("/api/result", (req, res) => {
  res.json(results);
});

/* ---------------- START ---------------- */
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
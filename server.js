import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ---------------- DATA STORES (in-memory) ---------------- */
let users = [];
let assignments = [];
let exams = [];
let feed = [];
let results = [];
let library = ["Math eBook", "Science Kit", "History Notes"];
let onlineUsers = {};

/* ---------------- STATUS ---------------- */
app.get("/", (req, res) => {
  res.send("✅ GreenBook Backend is running");
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    users: Object.keys(onlineUsers).length
  });
});

/* ---------------- AUTH ---------------- */
app.post("/api/signup", (req, res) => {
  const { id, name, pass, role } = req.body;
  if (!id || !name || !pass || !role) {
    return res.json({ error: "Missing fields" });
  }

  if (users.find(u => u.id === id)) {
    return res.json({ error: "User already exists" });
  }

  users.push({ id, name, pass, role });
  res.json({ message: "Signup successful" });
});

app.post("/api/login", (req, res) => {
  const { id, pass } = req.body;
  const user = users.find(u => u.id === id && u.pass === pass);
  if (!user) return res.json({ error: "Invalid login" });

  onlineUsers[id] = user;
  res.json({ user });
});

app.post("/api/logout", (req, res) => {
  const { id } = req.body;
  delete onlineUsers[id];
  res.json({ message: "Logged out" });
});

/* ---------------- ASSIGNMENTS ---------------- */
app.post("/api/assignment", (req, res) => {
  assignments.push(req.body);
  res.json({ ok: true });
});

app.get("/api/assignments", (req, res) => {
  res.json(assignments);
});

/* ---------------- EXAMS ---------------- */
app.post("/api/exam", (req, res) => {
  exams.push(req.body);
  res.json({ ok: true });
});

app.get("/api/exams", (req, res) => {
  res.json(exams);
});

app.post("/api/takeExam", (req, res) => {
  const score = Math.floor(Math.random() * 40) + 60;
  results.push({ student: req.body.student, score });
  res.json({ score });
});

app.get("/api/results", (req, res) => {
  res.json(results);
});

/* ---------------- FEED ---------------- */
app.post("/api/feed", (req, res) => {
  feed.unshift(req.body);
  res.json({ ok: true });
});

app.get("/api/feed", (req, res) => {
  res.json(feed.slice(0, 50));
});

/* ---------------- LIBRARY ---------------- */
app.post("/api/buy", (req, res) => {
  library.push("New Digital Resource " + Date.now());
  res.json({ ok: true });
});

app.get("/api/library", (req, res) => {
  res.json(library);
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
  console.log("🚀 GreenBook Backend running on port " + PORT);
});
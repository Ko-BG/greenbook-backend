const express = require("express");
const path = require("path");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// In-memory "database" (replace with real DB later)
let users = [];
let assignments = [];
let exams = [];
let submissions = [];
let classFeed = [];
let library = [];

// Routes

// Users
app.get("/api/users", (req, res) => res.json(users));
app.post("/api/users", (req, res) => {
  const { name, id, pass, role } = req.body;
  if (!name || !id || !pass || !role) return res.status(400).json({ error: "Missing fields" });
  if (users.find(u => u.id === id)) return res.status(400).json({ error: "User exists" });
  users.push({ name, id, pass, role });
  res.json({ message: "User created" });
});

// Assignments
app.get("/api/assignments", (req, res) => res.json(assignments));
app.post("/api/assignments", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });
  assignments.push({ title });
  res.json({ message: "Assignment posted" });
});

// Exams
app.get("/api/exams", (req, res) => res.json(exams));
app.post("/api/exams", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });
  exams.push({ title });
  res.json({ message: "Exam posted" });
});

// Class feed
app.get("/api/feed", (req, res) => res.json(classFeed));
app.post("/api/feed", (req, res) => {
  const { user, text } = req.body;
  if (!user || !text) return res.status(400).json({ error: "Missing data" });
  classFeed.push({ user, text });
  res.json({ message: "Message posted" });
});

// Library / Wallet
app.get("/api/library", (req, res) => res.json(library));
app.post("/api/library", (req, res) => {
  const { resource } = req.body;
  if (!resource) return res.status(400).json({ error: "Missing resource" });
  library.push(resource);
  res.json({ message: "Resource added" });
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GreenBook backend running on port ${PORT}`));
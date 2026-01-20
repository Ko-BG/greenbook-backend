// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded files

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});
const upload = multer({ storage });

// ---------- DATA STORAGE ----------
let users = [];        // { id, name, pass, role }
let feed = [];         // { user, text }
let assignments = [];  // { title, fileUrl }
let exams = [];        // { title, questions: [] }
let submissions = [];  // { studentId, type, score, file }
let ipPosts = [];      // { user, text }

// ---------- ROUTES ----------

// Health check
app.get("/", (req, res) => {
  res.send("GreenBook Backend is live!");
});

// Get all users
app.get("/users", (req, res) => {
  res.json(users);
});

// Create new user
app.post("/users", (req, res) => {
  const { id, name, pass, role } = req.body;
  if (!id || !name || !pass || !role) return res.status(400).json({ error: "Missing fields" });
  if (users.find(u => u.id === id)) return res.status(400).json({ error: "User exists" });
  users.push({ id, name, pass, role });
  res.json({ success: true });
});

// Class feed
app.get("/feed", (req, res) => {
  res.json(feed);
});
app.post("/feed", (req, res) => {
  const { user, text } = req.body;
  if (!user || !text) return res.status(400).json({ error: "Missing fields" });
  feed.push({ user, text });
  res.json({ success: true });
});

// Upload assignments or stylus drawings
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  assignments.push({ title: req.file.originalname, fileUrl: `/uploads/${req.file.filename}` });
  res.json({ success: true, fileUrl: `/uploads/${req.file.filename}` });
});

// Exams
app.get("/exams", (req, res) => {
  res.json(exams);
});
app.post("/exams", (req, res) => {
  const { title, questions } = req.body;
  if (!title || !questions) return res.status(400).json({ error: "Missing fields" });
  exams.push({ title, questions });
  res.json({ success: true });
});

// Submissions
app.post("/submissions", upload.single("file"), (req, res) => {
  const { studentId, type, score } = req.body;
  const file = req.file ? `/uploads/${req.file.filename}` : null;
  submissions.push({ studentId, type, score, file });
  res.json({ success: true });
});

// Influensa posts
app.get("/ipPosts", (req, res) => {
  res.json(ipPosts);
});
app.post("/ipPosts", (req, res) => {
  const { user, text } = req.body;
  if (!user || !text) return res.status(400).json({ error: "Missing fields" });
  ipPosts.push({ user, text });
  res.json({ success: true });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`GreenBook backend running on port ${PORT}`);
});
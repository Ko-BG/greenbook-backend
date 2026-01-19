import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Multer setup for file uploads ---
const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// --- In-memory storage ---
let users = {};        // {id: {name, pass, role}}
let assignments = [];  // {title, uploadedFiles: []}
let exams = [];        // {title, questions: []}
let submissions = [];  // {userId, type, score, file}
let classFeed = [];    // {userId, message}

// --- Routes ---

// Health check
app.get("/", (req, res) => {
  res.send("GreenBook Backend Running ✅");
});

// Sign up
app.post("/signup", (req, res) => {
  const { id, name, pass, role } = req.body;
  if (!id || !name || !pass || !role) return res.status(400).json({ error: "Missing fields" });
  if (users[id]) return res.status(400).json({ error: "User exists" });
  users[id] = { name, pass, role };
  res.json({ message: "Signup success" });
});

// Login
app.post("/login", (req, res) => {
  const { id, pass, role } = req.body;
  const user = users[id];
  if (!user || user.pass !== pass || user.role !== role) return res.status(400).json({ error: "Invalid credentials" });
  res.json({ message: "Login success", user: { id, name: user.name, role: user.role } });
});

// Get assignments
app.get("/assignments", (req, res) => res.json(assignments));

// Create assignment
app.post("/assignments", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  const newAssignment = { title, uploadedFiles: [] };
  assignments.push(newAssignment);
  res.json({ message: "Assignment created", assignment: newAssignment });
});

// Submit assignment (file upload)
app.post("/submit-assignment", upload.single("file"), (req, res) => {
  const { userId } = req.body;
  if (!req.file || !userId) return res.status(400).json({ error: "File and userId required" });
  submissions.push({ userId, type: "assignment", file: req.file.filename });
  res.json({ message: "Assignment submitted", file: req.file.filename });
});

// Exams
app.get("/exams", (req, res) => res.json(exams));
app.post("/exams", (req, res) => {
  const { title, questions } = req.body;
  if (!title || !questions) return res.status(400).json({ error: "Missing fields" });
  exams.push({ title, questions });
  res.json({ message: "Exam posted", exam: { title, questions } });
});

// Submit exam score
app.post("/submit-exam", (req, res) => {
  const { userId, score } = req.body;
  if (!userId || score == null) return res.status(400).json({ error: "Missing fields" });
  submissions.push({ userId, type: "exam", score });
  res.json({ message: "Exam submitted", score });
});

// Class feed
app.get("/class-feed", (req, res) => res.json(classFeed));
app.post("/class-feed", (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: "Missing fields" });
  classFeed.push({ userId, message });
  res.json({ message: "Message posted", entry: { userId, message } });
});

// Start server
app.listen(PORT, () => console.log(`GreenBook backend running on port ${PORT}`));
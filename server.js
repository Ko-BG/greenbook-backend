import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

// Create uploads folder if not exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Data storage (simple JSON files)
const USERS_FILE = "./data/users.json";
const ASSIGNMENTS_FILE = "./data/assignments.json";
const EXAMS_FILE = "./data/exams.json";
const CLASSFEED_FILE = "./data/classfeed.json";

// Ensure data folder
if (!fs.existsSync("./data")) fs.mkdirSync("./data");

// Helper to read/write JSON
const readJSON = (file) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
  return JSON.parse(fs.readFileSync(file));
};
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// ======== API ========

// Users
app.get("/users", (req, res) => res.json(readJSON(USERS_FILE)));
app.post("/users", (req, res) => {
  const users = readJSON(USERS_FILE);
  users.push(req.body);
  writeJSON(USERS_FILE, users);
  res.json({ status: "success" });
});

// Assignments
app.get("/assignments", (req, res) => res.json(readJSON(ASSIGNMENTS_FILE)));
app.post("/assignments", (req, res) => {
  const assignments = readJSON(ASSIGNMENTS_FILE);
  assignments.push(req.body);
  writeJSON(ASSIGNMENTS_FILE, assignments);
  res.json({ status: "success" });
});

// Exams
app.get("/exams", (req, res) => res.json(readJSON(EXAMS_FILE)));
app.post("/exams", (req, res) => {
  const exams = readJSON(EXAMS_FILE);
  exams.push(req.body);
  writeJSON(EXAMS_FILE, exams);
  res.json({ status: "success" });
});

// Class feed
app.get("/feed", (req, res) => res.json(readJSON(CLASSFEED_FILE)));
app.post("/feed", (req, res) => {
  const feed = readJSON(CLASSFEED_FILE);
  feed.push(req.body);
  writeJSON(CLASSFEED_FILE, feed);
  res.json({ status: "success" });
});

// Upload file
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ status: "success", file: req.file.filename });
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
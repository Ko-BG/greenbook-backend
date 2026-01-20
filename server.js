import express from "express";
import multer from "multer";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// ----------- LowDB Setup -----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();
db.data ||= { users: [], feed: [], assignments: [], exams: [] };
await db.write();

// ----------- Middleware -----------
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ----------- Multer Setup -----------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ----------- Routes -----------

// Get all users
app.get("/users", async (req, res) => {
  await db.read();
  res.json(db.data.users);
});

// Create user
app.post("/users", async (req, res) => {
  const { name, id, pass, role } = req.body;
  await db.read();
  if (db.data.users.find((u) => u.id === id)) return res.status(400).json({ error: "User exists" });
  db.data.users.push({ name, id, pass, role });
  await db.write();
  res.json({ success: true });
});

// Class feed
app.get("/feed", async (req, res) => {
  await db.read();
  res.json(db.data.feed);
});

app.post("/feed", async (req, res) => {
  const { user, text } = req.body;
  await db.read();
  db.data.feed.push({ user, text });
  await db.write();
  res.json({ success: true });
});

// Assignments upload
app.post("/upload", upload.single("file"), async (req, res) => {
  await db.read();
  db.data.assignments.push({ file: req.file.filename, originalName: req.file.originalname });
  await db.write();
  res.json({ success: true, file: req.file.filename });
});

// Exams
app.get("/exams", async (req, res) => {
  await db.read();
  res.json(db.data.exams);
});

app.post("/exams", async (req, res) => {
  const { title, questions } = req.body;
  await db.read();
  db.data.exams.push({ title, questions });
  await db.write();
  res.json({ success: true });
});

// Default route
app.get("/", (req, res) => {
  res.send("GreenBook Backend is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
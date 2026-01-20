// ---------- server.js ----------
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- DATABASE ----------
const adapter = new JSONFile("db.json");
const db = new Low(adapter);

// Initialize DB with defaults
async function initDB() {
  await db.read();
  if (!db.data || Object.keys(db.data).length === 0) {
    db.data = {
      users: [],      // {id, name, pass, role}
      notes: [],      // {userId, text}
      feed: [],       // {user, text, timestamp}
      ip: [],         // {user, text, timestamp}
      canvas: [],     // {user, dataUrl, timestamp}
      uploads: []     // {user, filename, originalname, timestamp}
    };
    await db.write();
    console.log("📝 Database initialized with default data");
  }
}
await initDB();

// ---------- MULTER SETUP ----------
const upload = multer({ dest: "uploads/" });

// ---------- ROUTES ----------

// Root test
app.get("/", (req, res) => res.send("✅ GreenBook Backend Running"));

// Get all users
app.get("/users", async (req, res) => {
  await db.read();
  res.json(db.data.users);
});

// Create user
app.post("/users", async (req, res) => {
  const { id, name, pass, role } = req.body;
  if (!id || !name || !pass || !role) return res.status(400).json({ error: "Missing fields" });
  await db.read();
  if (db.data.users.find(u => u.id === id)) return res.status(400).json({ error: "User exists" });
  db.data.users.push({ id, name, pass, role });
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
  if (!user || !text) return res.status(400).json({ error: "Missing fields" });
  await db.read();
  db.data.feed.push({ user, text, timestamp: Date.now() });
  await db.write();
  res.json({ success: true });
});

// Notes
app.get("/notes/:userId", async (req, res) => {
  await db.read();
  const notes = db.data.notes.filter(n => n.userId === req.params.userId);
  res.json(notes);
});
app.post("/notes", async (req, res) => {
  const { userId, text } = req.body;
  if (!userId || !text) return res.status(400).json({ error: "Missing fields" });
  await db.read();
  db.data.notes.push({ userId, text });
  await db.write();
  res.json({ success: true });
});

// Canvas
app.get("/canvas/:userId", async (req, res) => {
  await db.read();
  const canvases = db.data.canvas.filter(c => c.user === req.params.userId);
  res.json(canvases);
});
app.post("/canvas", async (req, res) => {
  const { user, dataUrl } = req.body;
  if (!user || !dataUrl) return res.status(400).json({ error: "Missing fields" });
  await db.read();
  db.data.canvas.push({ user, dataUrl, timestamp: Date.now() });
  await db.write();
  res.json({ success: true });
});

// IP posts (Influensa)
app.get("/ip", async (req, res) => {
  await db.read();
  res.json(db.data.ip);
});
app.post("/ip", async (req, res) => {
  const { user, text } = req.body;
  if (!user || !text) return res.status(400).json({ error: "Missing fields" });
  await db.read();
  db.data.ip.push({ user, text, timestamp: Date.now() });
  await db.write();
  res.json({ success: true });
});

// Upload assignments / files
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  await db.read();
  db.data.uploads.push({
    user: req.body.user || "Unknown",
    filename: req.file.filename,
    originalname: req.file.originalname,
    timestamp: Date.now()
  });
  await db.write();
  res.json({ success: true, file: req.file.originalname });
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ---------- START SERVER ----------
app.listen(PORT, () => console.log(`🚀 GreenBook Backend running on port ${PORT}`));
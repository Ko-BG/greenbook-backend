import express from "express";
import cors from "cors";
import multer from "multer";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 10000;

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ---------- DATABASE ----------
if (!fs.existsSync("db.json")) {
  fs.writeFileSync(
    "db.json",
    JSON.stringify({
      users: [],
      notes: [],
      feed: [],
      ip: [],
      canvas: [],
      uploads: []
    }, null, 2)
  );
}

const adapter = new JSONFile("db.json");
const db = new Low(adapter);
await db.read();
db.data ||= { users: [], notes: [], feed: [], ip: [], canvas: [], uploads: [] };

// ---------- FILE UPLOAD ----------
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ---------- HEALTH CHECK ----------
app.get("/", (req, res) => {
  res.send("✅ GreenBook Backend Running");
});

// ---------- USERS ----------
app.get("/users", async (req, res) => {
  await db.read();
  res.json(db.data.users);
});

app.post("/users", async (req, res) => {
  const user = { id: nanoid(), ...req.body };
  db.data.users.push(user);
  await db.write();
  res.json({ success: true, user });
});

// ---------- NOTES ----------
app.post("/notes", async (req, res) => {
  const note = { id: nanoid(), ...req.body, date: new Date() };
  db.data.notes.push(note);
  await db.write();
  res.json(note);
});

// ---------- CLASS FEED ----------
app.get("/feed", async (req, res) => {
  await db.read();
  res.json(db.data.feed);
});

app.post("/feed", async (req, res) => {
  const msg = { id: nanoid(), ...req.body, date: new Date() };
  db.data.feed.push(msg);
  await db.write();
  res.json(msg);
});

// ---------- INFLUENSA ----------
app.get("/ip", async (req, res) => {
  await db.read();
  res.json(db.data.ip);
});

app.post("/ip", async (req, res) => {
  const post = { id: nanoid(), ...req.body, date: new Date() };
  db.data.ip.push(post);
  await db.write();
  res.json(post);
});

// ---------- CANVAS ----------
app.post("/canvas", async (req, res) => {
  const draw = { id: nanoid(), ...req.body };
  db.data.canvas.push(draw);
  await db.write();
  res.json(draw);
});

// ---------- FILE UPLOAD ----------
app.post("/upload", upload.single("file"), async (req, res) => {
  const file = {
    id: nanoid(),
    filename: req.file.filename,
    path: req.file.path,
    date: new Date()
  };
  db.data.uploads.push(file);
  await db.write();
  res.json({ success: true, file });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log("🚀 GreenBook backend running on port", PORT);
});
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Serve static files from public/
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve index.html for the root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API endpoint for file uploads (e.g., assignments)
app.post("/upload", upload.array("files"), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ msg: "No files uploaded" });
  const uploadedFiles = req.files.map(f => f.filename);
  res.json({ msg: "Files uploaded successfully", files: uploadedFiles });
});

// Start server
app.listen(PORT, () => console.log(`GreenBook backend running on port ${PORT}`));
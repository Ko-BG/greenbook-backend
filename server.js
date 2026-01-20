const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (your front-end HTML + JS)
app.use(express.static(path.join(__dirname, '/')));

// Body parsing for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// In-memory "database"
let users = {};        // { id: { name, pass, role } }
let assignments = [];  // { title, file, student }
let exams = [];        // { title }
let submissions = [];  // { student, type, score }

// API: Sign up
app.post('/api/signup', (req, res) => {
  const { id, name, pass, role } = req.body;
  if (!id || !name || !pass || !role) return res.status(400).json({ error: 'Missing fields' });
  if (users[id]) return res.status(400).json({ error: 'User exists' });
  users[id] = { name, pass, role };
  return res.json({ success: true, message: 'User created' });
});

// API: Login
app.post('/api/login', (req, res) => {
  const { id, pass, role } = req.body;
  const u = users[id];
  if (!u || u.pass !== pass || u.role !== role) return res.status(401).json({ error: 'Invalid credentials' });
  return res.json({ success: true, user: u });
});

// API: Upload assignment
app.post('/api/assignment', upload.single('file'), (req, res) => {
  const { student, title } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  assignments.push({ student, title, file: req.file.filename });
  return res.json({ success: true, file: req.file.filename });
});

// API: Get assignments
app.get('/api/assignments', (req, res) => {
  return res.json(assignments);
});

// API: Post exam
app.post('/api/exam', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing title' });
  exams.push({ title });
  return res.json({ success: true });
});

// API: Get exams
app.get('/api/exams', (req, res) => {
  return res.json(exams);
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`GreenBook backend running on port ${PORT}`);
});
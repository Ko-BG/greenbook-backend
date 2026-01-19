// server.js
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

let users = {};
let assignments = [];
let exams = [];
let submissions = [];
let classFeed = [];
let library = [];

// --- Signup ---
app.post("/signup", (req, res) => {
  const { id, name, pass, role } = req.body;
  if (!id || !name || !pass || !role) return res.status(400).json({error:"Missing fields"});
  if (users[id]) return res.status(400).json({error:"User exists"});
  users[id] = { id, name, pass, role };
  res.json({success:true});
});

// --- Login ---
app.post("/login", (req, res) => {
  const { id, pass, role } = req.body;
  const u = users[id];
  if (!u || u.pass !== pass || u.role !== role) return res.status(400).json({error:"Invalid login"});
  res.json({success:true, user:u});
});

// --- Assignments ---
app.get("/assignments", (req,res)=> res.json(assignments));
app.post("/assignments", (req,res)=>{
  const { title } = req.body;
  if (!title) return res.status(400).json({error:"Missing title"});
  assignments.push({title});
  res.json({success:true});
});

// --- Exams ---
app.get("/exams", (req,res)=> res.json(exams));
app.post("/exams", (req,res)=>{
  const { title } = req.body;
  if (!title) return res.status(400).json({error:"Missing title"});
  exams.push({title});
  res.json({success:true});
});

// --- Class feed ---
app.get("/feed", (req,res)=> res.json(classFeed));
app.post("/feed", (req,res)=>{
  const { user, text } = req.body;
  if (!user || !text) return res.status(400).json({error:"Missing fields"});
  classFeed.push({user,text});
  res.json({success:true});
});

// --- Submissions ---
app.post("/submit", (req,res)=>{
  const { student, type, score } = req.body;
  if (!student || !type) return res.status(400).json({error:"Missing fields"});
  submissions.push({student,type,score});
  res.json({success:true});
});
app.get("/submissions", (req,res)=> res.json(submissions));

// --- Library ---
app.get("/library", (req,res)=> res.json(library));
app.post("/library", (req,res)=>{
  const { resource } = req.body;
  if (!resource) return res.status(400).json({error:"Missing resource"});
  library.push(resource);
  res.json({success:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));

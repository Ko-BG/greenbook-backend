// server.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5000;

// Storage for uploaded assignments
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// --------- IN-MEMORY DATABASES ---------
let users = [];        // {name,id,pass,role}
let feed = [];         // {user,text}
let assignments = [];  // {title, fileName?}
let exams = [];        // {title, questions:[], grades: [{student,grade}]}
let ipPosts = [];      // {user,text}
let parentComments = []; // {parent,text}

// --------- USERS ---------
app.post("/users", (req,res)=>{
    const {name,id,pass,role} = req.body;
    if(!name || !id || !pass || !role) return res.status(400).send({error:"Missing fields"});
    if(users.find(u=>u.id===id)) return res.status(400).send({error:"ID exists"});
    users.push({name,id,pass,role});
    res.send({success:true});
});

app.get("/users",(req,res)=>{
    res.send(users);
});

// --------- FEED ---------
app.get("/feed",(req,res)=>res.send(feed));
app.post("/feed",(req,res)=>{
    const {user,text} = req.body;
    if(!user || !text) return res.status(400).send({error:"Missing"});
    feed.push({user,text});
    res.send({success:true});
});

// --------- ASSIGNMENTS ---------
app.get("/assignments",(req,res)=>res.send(assignments));
app.post("/assignments",(req,res)=>{
    const {title} = req.body;
    if(!title) return res.status(400).send({error:"Missing title"});
    assignments.push({title});
    res.send({success:true});
});

// File upload for assignments
app.post("/upload", upload.single("file"), (req,res)=>{
    if(!req.file) return res.status(400).send({error:"No file"});
    assignments.push({title:req.file.originalname, fileName:req.file.filename});
    res.send({success:true});
});

// --------- EXAMS ---------
app.get("/exams",(req,res)=>res.send(exams));
app.post("/exams",(req,res)=>{
    const {title,questions} = req.body;
    if(!title || !questions) return res.status(400).send({error:"Missing"});
    exams.push({title,questions,grades:[]});
    res.send({success:true});
});

app.post("/grade",(req,res)=>{
    const {examTitle,student,grade} = req.body;
    let exam = exams.find(e=>e.title===examTitle);
    if(!exam) return res.status(404).send({error:"Exam not found"});
    exam.grades.push({student,grade});
    res.send({success:true});
});

// --------- INFLUENSA ---------
app.get("/ipPosts",(req,res)=>res.send(ipPosts));
app.post("/ipPosts",(req,res)=>{
    const {user,text} = req.body;
    if(!user || !text) return res.status(400).send({error:"Missing"});
    ipPosts.push({user,text});
    res.send({success:true});
});

// --------- PARENT COMMENTS ---------
app.get("/parentComments",(req,res)=>res.send(parentComments));
app.post("/parentComments",(req,res)=>{
    const {parent,text} = req.body;
    if(!parent || !text) return res.status(400).send({error:"Missing"});
    parentComments.push({parent,text});
    res.send({success:true});
});

// --------- START SERVER ---------
app.listen(PORT, ()=>console.log(`GreenBook backend live on port ${PORT}`));
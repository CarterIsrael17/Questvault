// index.js
import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------- CORS ----------------
// Allow your Netlify frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));
app.use(express.json());

// ---------------- Supabase ----------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------- In-memory questions store ----------------
// For persistence, you can replace with Supabase DB later
let questions = [];

// ---------------- File Upload ----------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ---------------- Routes ----------------

// Get all questions
app.get("/questions", (req, res) => {
  res.json(questions);
});

// Upload PDF
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    const { title, course_code, department, level, semester, year } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from("past-question-pdfs")
      .upload(fileName, file.buffer, { contentType: "application/pdf" });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicData } = supabase.storage
      .from("past-question-pdfs")
      .getPublicUrl(fileName);
    const publicUrl = publicData.publicUrl;

    // Save question
    const newQuestion = {
      id: Date.now().toString(),
      title,
      course_code,
      department,
      level,
      semester,
      year,
      pdf_url: publicUrl
    };
    questions.push(newQuestion);

    res.json({ message: "Upload successful", data: newQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// Delete a question
app.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const question = questions.find(q => q.id === id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    // Remove file from Supabase
    const url = new URL(question.pdf_url);
    const filePath = decodeURIComponent(url.pathname.split("/past-question-pdfs/")[1]);
    const { error: deleteError } = await supabase.storage
      .from("past-question-pdfs")
      .remove([filePath]);
    if (deleteError) throw deleteError;

    // Remove from array
    questions = questions.filter(q => q.id !== id);

    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed", details: err.message });
  }
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

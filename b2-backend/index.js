// index.js
import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

/* ---------------- BASIC SECURITY ---------------- */
app.use(
  helmet({
    contentSecurityPolicy: false, // ❌ Disable CSP for uploads
  })
);

/* ---------------- CORS ---------------- */
app.use(
  cors({
    origin: "*", // allow Netlify frontend
    methods: ["GET", "POST", "DELETE"],
  })
);

/* ---------------- JSON PARSER ---------------- */
app.use(express.json());

/* ---------------- SUPABASE ---------------- */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/* ---------------- MEMORY STORE ---------------- */
let questions = [];

/* ---------------- FILE UPLOAD ---------------- */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

/* ---------------- ROUTES ---------------- */

// Health check
app.get("/", (req, res) => res.send("QuestVault backend running ✅"));

// Get all questions
app.get("/questions", (req, res) => {
  res.json(questions);
});

// Upload PDF
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { title, course_code, department, level, semester, year } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from("past-question-pdfs") // <-- your bucket name
      .upload(fileName, file.buffer, { contentType: "application/pdf" });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from("past-question-pdfs")
      .getPublicUrl(fileName);

    const newQuestion = {
      id: Date.now().toString(),
      title,
      course_code,
      department,
      level,
      semester,
      year,
      pdf_url: data.publicUrl,
    };

    questions.push(newQuestion);

    res.json({ message: "Upload successful ✅", data: newQuestion });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed ❌", details: err.message });
  }
});

// Delete question
app.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const question = questions.find((q) => q.id === id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    // Extract file path from URL
    const filePath = question.pdf_url.split(
      "/storage/v1/object/public/past-question-pdfs/"
    )[1];

    const { error } = await supabase.storage.from("past-question-pdfs").remove([filePath]);
    if (error) throw error;

    questions = questions.filter((q) => q.id !== id);
    res.json({ message: "Question deleted ✅" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed ❌", details: err.message });
  }
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

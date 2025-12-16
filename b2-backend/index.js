import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------- CORS ----------------
app.use(cors({
  origin: "*" // allow all origins; you can restrict to your frontend URL
}));

app.use(express.json());

// ---------------- Supabase ----------------
const supabaseUrl = process.env.SUPABASE_URL; // e.g., https://xyz.supabase.co
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------- In-memory questions store ----------------
let questions = []; // replace with a proper database if needed

// ---------------- File Upload ----------------
const upload = multer({
  storage: multer.memoryStorage(), // store file in memory before sending to Supabase
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
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
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("past-question-pdfs") // bucket name
      .upload(fileName, file.buffer, { contentType: "application/pdf" });

    if (uploadError) throw uploadError;

    // Get public URL (fixed)
    const { data: publicData, error: urlError } = supabase.storage
      .from("past-question-pdfs")
      .getPublicUrl(fileName);

    if (urlError) throw urlError;

    const publicUrl = publicData.publicUrl;

    // Save question to in-memory array
    const newQuestion = {
      id: Date.now().toString(),
      title,
      course_code,
      department,
      level,
      semester,
      year,
      pdf_url: publicUrl // ✅ now correctly set
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

    // Delete file from Supabase
    const filePath = question.pdf_url.split("/storage/v1/object/public/past-question-pdfs/")[1];
    const { error: deleteError } = await supabase.storage
      .from("past-question-pdfs")
      .remove([filePath]);
    if (deleteError) throw deleteError;

    // Remove from local store
    questions = questions.filter(q => q.id !== id);

    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed", details: err.message });
  }
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

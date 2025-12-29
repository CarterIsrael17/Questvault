import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------- SECURITY ----------------
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// ---------------- CORS ----------------
app.use(
  cors({
    origin: [
      "https://questvaultt.netlify.app", // frontend URL
      "http://localhost:3000",            // local dev
    ],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Preflight handler
app.options("*", cors());

// ---------------- BODY PARSER ----------------
app.use(express.json());

// ---------------- SUPABASE CLIENT ----------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------- MULTER ----------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ---------------- ROUTES ----------------
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// GET all questions
app.get("/questions", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("past_questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPLOAD a question
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { title, course_code, department, level, semester, year } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload PDF to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("pquestion-pdf")
      .upload(fileName, file.buffer, { contentType: "application/pdf" });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("pquestion-pdf")
      .getPublicUrl(fileName);

    // Save metadata to DB
    const { data, error } = await supabase
      .from("past_questions")
      .insert([
        {
          title,
          course_code,
          department,
          level,
          semester,
          year,
          pdf_url: urlData.publicUrl,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Upload successful ✅", data });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed ❌", details: err.message });
  }
});

// DELETE a question
app.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("past_questions")
      .select("pdf_url")
      .eq("id", id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Question not found" });

    const filePath = data.pdf_url.split("/pquestion-pdf/")[1];

    await supabase.storage.from("pquestion-pdf").remove([filePath]);
    await supabase.from("past_questions").delete().eq("id", id);

    res.json({ message: "Deleted successfully ✅" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed ❌" });
  }
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));

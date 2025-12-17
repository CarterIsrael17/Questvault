import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import helmet from "helmet"; // <-- import helmet

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------- CORS ----------------
app.use(cors({ origin: "*" }));

// ---------------- Helmet / CSP ----------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://questvault-2.onrender.com"],
        connectSrc: ["'self'", "https://questvault-2.onrender.com"],
      },
    },
  })
);

app.use(express.json());

// ---------------- Supabase ----------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------- In-memory questions ----------------
let questions = [];

// ---------------- File upload ----------------
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ---------------- Routes ----------------

// GET all questions
app.get("/questions", (req, res) => {
  res.json(questions);
});

// POST upload PDF
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    const { title, course_code, department, level, semester, year } = req.body;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("past-question-pdfs")
      .upload(fileName, file.buffer, { contentType: "application/pdf" });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from("past-question-pdfs")
      .getPublicUrl(fileName);

    const publicUrl = publicData.publicUrl;

    const newQuestion = { id: Date.now().toString(), title, course_code, department, level, semester, year, pdf_url: publicUrl };
    questions.push(newQuestion);

    res.json({ message: "Upload successful", data: newQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// DELETE question
app.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const question = questions.find(q => q.id === id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const filePath = question.pdf_url.split("/storage/v1/object/public/past-question-pdfs/")[1];
    const { error: deleteError } = await supabase.storage.from("past-question-pdfs").remove([filePath]);
    if (deleteError) throw deleteError;

    questions = questions.filter(q => q.id !== id);
    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed", details: err.message });
  }
});

// ---------------- Start server ----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

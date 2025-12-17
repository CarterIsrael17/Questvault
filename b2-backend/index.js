import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------- Helmet ----------------
app.use(helmet({
  contentSecurityPolicy: false // disable CSP for uploads
}));

// ---------------- CORS ----------------
// Allow your frontend origin (replace with your Netlify URL)
app.use(cors({
  origin: ["https://questvaultt.netlify.app"], 
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ---------------- Supabase ----------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------- Memory store ----------------
let questions = [];

// ---------------- Multer upload ----------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// ---------------- Routes ----------------
app.get("/", (req, res) => res.send("Backend running ✅"));

app.get("/questions", (req, res) => res.json(questions));

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { title, course_code, department, level, semester, year } = req.body;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileName = `${Date.now()}-${file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from("past-question-pdfs")
      .upload(fileName, file.buffer, { contentType: "application/pdf" });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("past-question-pdfs")
      .getPublicUrl(fileName);

    const newQuestion = { id: Date.now().toString(), title, course_code, department, level, semester, year, pdf_url: data.publicUrl };
    questions.push(newQuestion);

    res.json({ message: "Upload successful ✅", data: newQuestion });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed ❌", details: err.message });
  }
});

app.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const question = questions.find(q => q.id === id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const filePath = question.pdf_url.split("/storage/v1/object/public/past-question-pdfs/")[1];
    const { error } = await supabase.storage.from("past-question-pdfs").remove([filePath]);
    if (error) throw error;

    questions = questions.filter(q => q.id !== id);
    res.json({ message: "Question deleted ✅" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed ❌", details: err.message });
  }
});

// ---------------- Start server ----------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

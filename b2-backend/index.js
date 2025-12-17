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
app.use(
  helmet({
    contentSecurityPolicy: false, // disable CSP for uploads
  })
);

// ---------------- CORS ----------------
// Allow your frontend origin (replace with your Netlify URL)
app.use(
  cors({
    origin: ["https://questvaultt.netlify.app"],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ---------------- Supabase ----------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------- Multer ----------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// ---------------- Routes ----------------
app.get("/", (req, res) => res.send("Backend running ✅"));

// Get all questions from Supabase table
app.get("/questions", async (req, res) => {
  try {
    const { data, error } = await supabase.from("questions").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch questions ❌", details: err.message });
  }
});

// Upload a new PDF
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { title, course_code, department, level, semester, year } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `pdfs/${fileName}`;

    // Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("pquestion-pdf")
      .upload(filePath, file.buffer, { contentType: "application/pdf" });

    if (uploadError) throw uploadError;

    // Insert metadata into Supabase table
    const { data, error: insertError } = await supabase
      .from("questions")
      .insert([
        {
          title,
          course_code,
          department,
          level,
          semester,
          year,
          pdf_path: filePath,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // Get public URL
    const { data: publicData } = supabase.storage
      .from("pquestion-pdf")
      .getPublicUrl(filePath);

    res.json({
      message: "Upload successful ✅",
      data: { ...data, pdf_url: publicData.publicUrl },
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed ❌", details: err.message });
  }
});

// Delete a question and its file
app.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get question from Supabase table
    const { data: question, error: fetchError } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) return res.status(404).json({ error: "Question not found" });

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from("pquestion-pdf")
      .remove([question.pdf_path]);

    if (deleteError) throw deleteError;

    // Delete record from table
    const { error: dbDeleteError } = await supabase.from("questions").delete().eq("id", id);
    if (dbDeleteError) throw dbDeleteError;

    res.json({ message: "Question deleted ✅" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed ❌", details: err.message });
  }
});

// ---------------- Start server ----------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

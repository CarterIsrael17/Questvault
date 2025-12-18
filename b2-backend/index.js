import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------- Security ----------------
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// ---------------- CORS ----------------
app.use(
  cors({
    origin: ["https://questvaultt.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ---------------- Supabase ----------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------- Multer ----------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ---------------- Routes ----------------
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// ✅ GET ALL QUESTIONS (FROM DATABASE)
app.get("/questions", async (req, res) => {
  const { data, error } = await supabase
    .from("past_questions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// ✅ UPLOAD QUESTION
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { title, course_code, department, level, semester, year } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload PDF to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("pquestion-pdf")
      .upload(fileName, file.buffer, {
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("pquestion-pdf")
      .getPublicUrl(fileName);

    // Save metadata to database
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

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      message: "Upload successful ✅",
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed ❌" });
  }
});

// ✅ DELETE QUESTION
app.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get record
    const { data, error } = await supabase
      .from("past_questions")
      .select("pdf_url")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: "Not found" });

    const filePath = data.pdf_url.split("/pquestion-pdf/")[1];

    // Remove PDF from storage
    await supabase.storage.from("pquestion-pdf").remove([filePath]);

    // Remove record from DB
    await supabase.from("past_questions").delete().eq("id", id);

    res.json({ message: "Deleted successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed ❌" });
  }
});

// ---------------- Start ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

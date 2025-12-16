import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dbFile = path.join(__dirname, "../questions.json");
const uploadDir = path.join(__dirname, "../uploads");

// Ensure uploads folder and JSON file exist
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "[]");

// Helpers
const readDB = () => JSON.parse(fs.readFileSync(dbFile, "utf-8"));
const writeDB = (data) => fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") return cb(new Error("Only PDFs allowed"), false);
  cb(null, true);
};
const upload = multer({ storage, fileFilter });

// Upload PDF
router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const newFile = {
      id: Date.now(),
      fileName: req.file.originalname,
      pdf_url: `/uploads/${req.file.filename}`,
      title: req.body.title || "",
      course_code: req.body.course_code || "",
      department: req.body.department || "",
      level: req.body.level || "",
      semester: req.body.semester || "",
      year: req.body.year || "",
    };

    const db = readDB();
    db.unshift(newFile);
    writeDB(db);

    res.json({ data: newFile, message: "Uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// List PDFs
router.get("/", (req, res) => {
  try {
    const db = readDB();
    res.json(db);
  } catch (err) {
    res.status(500).json({ error: "Failed to read files" });
  }
});

// Delete PDF
router.delete("/:id", (req, res) => {
  try {
    const db = readDB();
    const id = parseInt(req.params.id);
    const fileToDelete = db.find(f => f.id === id);
    if (fileToDelete) {
      const filePath = path.join(uploadDir, path.basename(fileToDelete.pdf_url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    const newDB = db.filter(f => f.id !== id);
    writeDB(newDB);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;

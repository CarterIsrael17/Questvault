const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Use timestamp + original filename
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// POST /upload
router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Build file metadata
    const uploadedFile = {
      id: Date.now(), // simple unique ID, replace with DB ID in production
      fileName: req.file.originalname,
      pdf_url: `/uploads/${req.file.filename}`,
      title: req.body.title || "",
      course_code: req.body.course_code || "",
      department: req.body.department || "",
      level: req.body.level || "",
      semester: req.body.semester || "",
      year: req.body.year || "",
    };

    // TODO: Save metadata to DB if needed

    // ✅ Respond with JSON
    res.json({
      data: uploadedFile,
      message: "File uploaded successfully",
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Server error during upload" });
  }
});

module.exports = router;

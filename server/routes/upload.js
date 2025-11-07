import express from "express";
import multer from "multer";
import { Queue } from "bullmq";
import fs from "fs";

const router = express.Router();

const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
  console.log("Created uploads directory");
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// POST /upload/pdf (FIXED: removed "/uploads" from path)
router.post("/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File received:", req.file.filename);
    console.log("File path:", req.file.path);
    console.log("File size:", req.file.size);

    // Add RAG job to queue
    const job = await queue.add(
      "file-ready",
      JSON.stringify({
        filename: req.file.filename,
        destination: req.file.destination,
        path: req.file.path,
        jobType: "rag", // IMPORTANT: specify job type
      })
    );

    console.log("RAG job queued with ID:", job.id);

    return res.json({
      message: "PDF uploaded successfully! Processing started.",
      jobId: job.id,
      filename: req.file.filename,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ 
      error: "Upload failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;

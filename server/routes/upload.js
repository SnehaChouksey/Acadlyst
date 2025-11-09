import express from "express";
import multer from "multer";
import { Queue } from "bullmq";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { checkCredits, deductCredits } from "../services/userService.js";

const router = express.Router();

const queue = new Queue("file-upload-queue", {
  connection: { host: "localhost", port: 6379 },
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pdf-uploads-rag',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    public_id: (req, file) => `${Date.now()}-${file.originalname.replace('.pdf', '')}`,
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

router.post("/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const clerkId = req.headers["x-clerk-id"];
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized - Please sign in" });
    }

    // Check credits
    const creditCheck = await checkCredits(clerkId, "chat");
    if (!creditCheck.hasCredits && !creditCheck.isOwner) {
      return res.status(403).json({
        error: "Insufficient credits",
        remaining: creditCheck.remaining,
        message: "You've run out of RAG chat credits. Upgrade your plan to continue.",
      });
    }

    // Deduct credit
    await deductCredits(clerkId, "chat");

    console.log("File uploaded to Cloudinary:", req.file.path);

    const job = await queue.add(
      "file-ready",
      JSON.stringify({
        filename: req.file.originalname,
        url: req.file.path,
        jobType: "rag",
        clerkId,
      })
    );

    console.log("RAG job queued with ID:", job.id);

    return res.json({
      message: "PDF uploaded successfully! Processing started.",
      jobId: job.id,
      filename: req.file.originalname,
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

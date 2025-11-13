import "dotenv/config";
import express from "express";
import multer from "multer";
import { Queue } from "bullmq";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { getYouTubeTranscript } from "../services/youtubeService.js";
import { checkCredits, deductCredits } from "../services/userService.js";



const router = express.Router();

const queue = new Queue("file-upload-queue", {
  connection: process.env.REDIS_URL
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pdf-uploads-summarizer',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    public_id: (req, file) => `${Date.now()}-${file.originalname.replace('.pdf', '')}`,
  },
});

const upload = multer({ storage });


router.post("/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const clerkId = req.headers["x-clerk-id"];
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized - Please sign in" });
    }

    
    const creditCheck = await checkCredits(clerkId, "summarizer");
    if (!creditCheck.hasCredits && !creditCheck.isOwner) {
      return res.status(403).json({
        error: "Insufficient credits",
        remaining: creditCheck.remaining,
        message: "You've run out of summarizer credits.",
      });
    }

    
    await deductCredits(clerkId, "summarizer");


    const job = await queue.add(
      "file-ready",
      JSON.stringify({
        filename: req.file.originalname,
        url: req.file.path, 
        jobType: "summarize",
        clerkId
    
      })
    );

    return res.json({
      message: "PDF uploaded successfully. Summary is being generated.",
      jobId: job.id,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error("Summarizer upload error:", error);
    return res.status(500).json({ error: "Failed to process upload" });
  }
});


router.post("/youtube", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "No YouTube URL provided" });
    }

    const clerkId = req.headers["x-clerk-id"];
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized - Please sign in" });
    }

    
    const creditCheck = await checkCredits(clerkId, "summarizer");
    if (!creditCheck.hasCredits && !creditCheck.isOwner) {
      return res.status(402).json({
        error: "Insufficient credits",
        remaining: creditCheck.remaining,
        message: "You've run out of summarizer credits.",
      });
    }

    console.log("YouTube summarizer request for:", url);

    
    await deductCredits(clerkId, "summarizer");


    const transcript = await getYouTubeTranscript(url);

    const job = await queue.add(
      "file-ready",
      JSON.stringify({
        text: transcript.text,
        filename: `youtube-${transcript.videoId}`,
        jobType: "summarize",
        clerkId
      })
    );

    return res.json({
      message: "YouTube transcript fetched. Summary is being generated.",
      jobId: job.id,
      filename: `YouTube Video`
    });
  } catch (error) {
    console.error("YouTube summarizer error:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch YouTube transcript."
    });
  }
});


router.get("/status/:jobId", async (req, res) => {
  try {
    const job = await queue.getJob(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState();
    const result = job.returnvalue;

    if (state === "completed" && result) {
      return res.json({
        status: "completed",
        summary: result.summary,
        key_points: result.key_points,
        fileName: result.fileName
      });
    }

    if (state === "failed") {
      return res.status(500).json({
        status: "failed",
        error: job.failedReason
      });
    }

    return res.json({ status: state });

  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({ error: "Failed to check job status" });
  }
});

export default router;

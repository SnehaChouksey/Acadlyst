import express from "express";
import multer from "multer";
import { Queue } from "bullmq";
import { getYouTubeTranscript } from "../services/youtubeService.js"; // NEW

const router = express.Router();

const queue = new Queue("file-upload-queue", {
  connection: { host: "localhost", port: 6379 },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// POST /summarizer/pdf
router.post("/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const job = await queue.add(
      "file-ready",
      JSON.stringify({
        filename: req.file.filename,
        destination: req.file.destination,
        path: req.file.path,
        jobType: "summarize"
      })
    );

    return res.json({
      message: "PDF uploaded successfully. Summary is being generated.",
      jobId: job.id,
      filename: req.file.filename
    });
  } catch (error) {
    console.error("Summarizer upload error:", error);
    return res.status(500).json({ error: "Failed to process upload" });
  }
});

// POST /summarizer/youtube - NEW
router.post("/youtube", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "No YouTube URL provided" });
    }

    console.log("YouTube summarizer request for:", url);

    const transcript = await getYouTubeTranscript(url);

    const job = await queue.add(
      "file-ready",
      JSON.stringify({
        text: transcript.text,
        filename: `youtube-${transcript.videoId}`,
        jobType: "summarize"
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
      error: error.message || "Failed to fetch YouTube transcript. Make sure the video has captions enabled." 
    });
  }
});

// GET /summarizer/status/:jobId
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

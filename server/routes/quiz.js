import express from "express";
import multer from "multer";
import { Queue } from "bullmq";

const router = express.Router();

const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// POST /quiz/pdf - Upload PDF and generate quiz
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
        jobType: "quiz"
      })
    );

    return res.json({
      message: "PDF uploaded successfully. Quiz is being generated.",
      jobId: job.id,
      filename: req.file.filename
    });

  } catch (error) {
    console.error("Quiz upload error:", error);
    return res.status(500).json({ error: "Failed to process upload" });
  }
});

// POST /quiz/text - Generate quiz from text
router.post("/text", async (req, res) => {
    console.log("Body received for /quiz/text:", req.body);
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "No text provided" });
    }

    const job = await queue.add(
      "file-ready",
      JSON.stringify({
        text: text,
        filename: "study-notes",
        jobType: "quiz"
      })
    );

    return res.json({
      message: "Quiz generation started.",
      jobId: job.id,
      filename: "study-notes"
    });

  } catch (error) {
    console.error("Text quiz error:", error);
    return res.status(500).json({ error: "Failed to process text" });
  }
});

// GET /quiz/status/:jobId - Check job status and get quiz result
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
        questions: result.questions,
        fileName: result.fileName,
        totalQuestions: result.totalQuestions
      });
    }

    if (state === "failed") {
      return res.status(500).json({
        status: "failed",
        error: job.failedReason
      });
    }

    return res.json({
      status: state
    });

  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({ error: "Failed to check job status" });
  }
});

export default router;

// routes/upload.js
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

// configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/pdf", upload.single("pdf"), async (req, res) => {
  await queue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.filename,
      destination: req.file.destination,
      path: req.file.path,
    })
  );

  return res.send("PDF uploaded & job sent to worker!");
});

export default router;

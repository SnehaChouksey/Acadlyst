import express from "express";
import { getUserStats } from "../services/userService.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const clerkId = req.headers["x-clerk-id"];
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const stats = await getUserStats(clerkId);
    return res.json(stats);
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;

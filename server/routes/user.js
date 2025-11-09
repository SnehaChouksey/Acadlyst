import express from "express";
import { getUserStats } from "../services/userService.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

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

// Check subscription status
router.get("/subscription", async (req, res) => {
  try {
    const clerkId = req.headers["x-clerk-id"];
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        plan: true,
        subscriptionStatus: true,
        summarizerCredits: true,
        quizCredits: true,
        chatCredits: true,
      }
    });

    return res.json(user);
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;

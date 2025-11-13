import express from "express";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const clerkId = req.headers["x-clerk-id"];
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const chats = await prisma.chatHistory.findMany({
      where: { userId: clerkId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, question: true, createdAt: true }
    });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;

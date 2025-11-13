import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

router.get('/:chatId', async (req, res) => {
  const chatId = req.params.chatId;
  try {
    const chat = await prisma.chatHistory.findUnique({
      where: { id: chatId }
    });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Parse sources back to array if it exists
    let sources = [];
    try {
      sources = chat.sources ? JSON.parse(chat.sources) : [];
    } catch { sources = []; }

    return res.json({
      id: chat.id,
      question: chat.question,
      answer: chat.answer,
      sources,
      createdAt: chat.createdAt
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;

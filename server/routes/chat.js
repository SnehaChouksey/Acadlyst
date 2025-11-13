import "dotenv/config";
import express from "express";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { TaskType } from "@google/generative-ai";
import { checkChatMessageCredits, deductChatMessageCredits } from "../services/userService.js";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (req, res) => {
  const clerkId = req.headers["x-clerk-id"];
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { hasCredits, remaining } = await checkChatMessageCredits(clerkId);
    if (!hasCredits) {
      return res.status(403).json({ 
        error: "Out of chat message credits", 
        remaining: 0,
        message: "You've used all your free chat messages. Upgrade to continue."
      });
    }

    const userQuery = req.body.query || req.body.message;

    if (!userQuery || userQuery.trim().length === 0) {
      return res.status(400).json({ error: "Query cannot be empty" });
    }

    console.log("Chat request received. Query:", userQuery);

    // STEP 1: Create embeddings for query
    console.log("STEP 1: Creating embeddings...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });

    // STEP 2: Connect to Qdrant
    console.log("STEP 2: Connecting to Qdrant...");
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL || "http://localhost:6333",
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: "langchainjs-testing",
      }
    );
    console.log("STEP 2: Connected to Qdrant");

    console.log("STEP 2b: Direct similarity search...");
    const debugDocs = await vectorStore.similaritySearch(userQuery, 3);
    debugDocs.forEach((d, i) => {
      console.log(`Retrieved Doc ${i + 1}:`, d.pageContent.substring(0, 100), d.metadata);
    });

    // STEP 3: Retrieve similar chunks
    console.log("STEP 3: Retrieving similar documents...");
    const retriever = vectorStore.asRetriever({ k: 5 });
    const docs = await retriever.invoke(userQuery);
    console.log("STEP 3: Found", docs.length, "relevant documents");

    console.log("STEP 3b: Docs returned from retriever:");
    if (docs.length > 0) console.log("First doc:", docs[0]);

    if (docs.length === 0) {
      console.warn("No documents found");
      return res.json({
        answer: "I don't have information about that in the uploaded documents. Please try a different question.",
        sources: []
      });
    }

    // Deduct chat message credit
    await deductChatMessageCredits(clerkId);

    docs.forEach((d, i) => {
      console.log(`Doc ${i + 1}: ${d.pageContent.substring(0, 80)}...`);
    });

    // STEP 4: Create context
    console.log("STEP 4: Creating context...");
    const context = docs.map((d) => d.pageContent).join("\n\n");
    console.log("STEP 4: Context length:", context.length);

    // STEP 5: Generate answer using LLM
    console.log("STEP 5: Calling Gemini LLM...");
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-lite",
      maxRetries: 1,
      temperature: 0.2,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // ✅ DECLARE response BEFORE using it
    const response = await llm.invoke([
      ["system", "Answer strictly using the given context. If information is not in the context, say 'I don't have that information in the documents.'"],
      ["human", `Context:\n${context}\n\nQuestion: ${userQuery}`],
    ]);

    console.log("STEP 5b: LLM response object:", response); // ✅ NOW it's safe to log

    console.log("STEP 5: LLM response received");
    
    const answer = typeof response === 'string' 
      ? response 
      : (response.content || JSON.stringify(response));

    const sources = docs.map(d => ({
      content: d.pageContent.substring(0, 200),
      metadata: d.metadata
    }));

    await prisma.chatHistory.create({
      data: {
        userId: clerkId,
        question: userQuery,
        answer: answer,
        sources: JSON.stringify(sources)
      }
    });

    console.log("Chat completed successfully");
    return res.json({
      answer: answer,
      sources: sources
    });

  } catch (err) {
    console.error("Chat error:", err);
    console.error("=== CHAT ERROR ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Full error object:", JSON.stringify(err, null, 2));
    console.error("===================");
    return res.status(500).json({
      error: err.message,
      answer: "Sorry, an error occurred while processing your question."
    });
  }
});

router.get("/", (req, res) => {
  res.status(405).json({ error: "Use POST /chat with JSON body: { query: '...' }" });
});

export default router;

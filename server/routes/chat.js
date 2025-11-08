import "dotenv/config";
import express from "express";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { TaskType } from "@google/generative-ai";
import { checkCredits, deductCredits } from "../services/userService.js";

const router = express.Router();

// POST /chat (accept both POST and GET for flexibility)
router.post("/", async (req, res) => {
     const clerkId = req.headers["x-clerk-id"]; // Pass this from frontend requests!
     if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { hasCredits, remaining, isOwner } = await checkCredits(clerkId, "chat");
    if (!hasCredits) return res.status(402).json({ error: "Out of chat credits", remaining });


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
      taskType: TaskType.RETRIEVAL_QUERY,
    });

    // STEP 2: Connect to Qdrant
    console.log("STEP 2: Connecting to Qdrant...");
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL || "http://localhost:6333",
        collectionName: "langchainjs-testing",
      }
    );
    console.log("STEP 2: Connected to Qdrant");

    // STEP 3: Retrieve similar chunks
    console.log("STEP 3: Retrieving similar documents...");
    const retriever = vectorStore.asRetriever({ k: 5 });
    const docs = await retriever.invoke(userQuery);
    console.log("STEP 3: Found", docs.length, "relevant documents");

    if (docs.length === 0) {
      console.warn("No documents found");
      return res.json({
        answer: "I don't have information about that in the uploaded documents. Please try a different question.",
        sources: []
      });
    }

    await deductCredits(clerkId, "chat");


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

    const response = await llm.invoke([
      ["system", "Answer strictly using the given context. If information is not in the context, say 'I don't have that information in the documents.'"],
      ["human", `Context:\n${context}\n\nQuestion: ${userQuery}`],
    ]);

    console.log("STEP 5: LLM response received");
    
    const answer = typeof response === 'string' 
      ? response 
      : (response.content || JSON.stringify(response));


    console.log("Chat completed successfully");
    return res.json({
      answer: answer,
      sources: docs.map(d => ({
        content: d.pageContent.substring(0, 200),
        metadata: d.metadata
      }))
    });


  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({
      error: err.message,
      answer: "Sorry, an error occurred while processing your question."
    });
  }
});

// Also support GET for testing
router.get("/", (req, res) => {
  res.status(405).json({ error: "Use POST /chat with JSON body: { query: '...' }" });
});

export default router;

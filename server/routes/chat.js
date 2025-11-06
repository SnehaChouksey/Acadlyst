import "dotenv/config";
import express from "express";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { TaskType } from "@google/generative-ai";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userQuery = req.query.message;
    if (!userQuery) return res.status(400).json({ error: "message is required" });

    // 1. embed the user query
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
      taskType: TaskType.RETRIEVAL_QUERY,
    });

    // 2. connect qdrant
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL, // example: "http://localhost:6333"
        collectionName: "langchainjs-testing",
      }
    );

    // 3. retrieve similar chunks
    const retriever = vectorStore.asRetriever({ k: 3 });
    const docs = await retriever.invoke(userQuery);

    const context = docs.map((d) => d.pageContent).join("\n\n");

    // 4. generate final answer using ChatGoogleGenerativeAI
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-lite",
      maxRetries: 1,
      temperature: 0.2,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const response = await llm.invoke([
      ["system", "Answer strictly using the given context below. If not in context, say 'I don't know'."],
      ["human", `Context:\n${context}\n\nQuestion: ${userQuery}`],
    ]);

    return res.json({
      answer: response.content,
      sources: docs
    });

  } catch (err) {
    console.error(" /chat error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

export default router;

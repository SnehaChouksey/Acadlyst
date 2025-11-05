import "dotenv/config";
import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


console.log("GOOGLE KEY:", process.env.GOOGLE_API_KEY ? "FOUND" : "NOT FOUND");

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log("📂 New Job Received:", job.data);

    const data = JSON.parse(job.data);

    /*
      Steps:
      ✅ Read the PDF from path
      ✅ Extract text pages
      ✅ Chunk text with Recursive splitter
      ✅ Embed chunks using Gemini embeddings
      ✅ Store chunks + vectors in Qdrant
    */

    // ✅ STEP 1: Load the PDF
    const loader = new PDFLoader(data.path);
    const rawDocs = await loader.load();
    console.log(`✅ PDF Loaded — Pages: ${rawDocs.length}`);

    // ✅ STEP 2: Recursive Chunking (recommended by docs)
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,     // ~1000 chars per chunk
      chunkOverlap: 150,   // overlap helps context continuity
    });

    const docs = await splitter.splitDocuments(rawDocs);
    
    console.log(`✅ PDF Loaded — Pages: ${rawDocs.length}`);
    console.log(`✂️ Total Chunks: ${docs.length}`);

    // Print first 2 chunks preview
    docs.slice(0, 2).forEach((chunk, i) => {
    console.log(`\n---- Chunk #${i + 1} Preview ----`);
    console.log(chunk.pageContent.substring(0, 300)); // print first 300 chars
    console.log(`Chunk length: ${chunk.pageContent.length}`);
  });

    console.log(`✂️ Split into chunks: ${docs.length}`);

    console.log("📌 Starting embedding + Qdrant insert...");


    // ✅ STEP 3: Gemini Embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    apiKey: process.env.GOOGLE_API_KEY,
    title: "PDF Document Chunk",
    });

    console.log("Embedding done");



    // ✅ STEP 4: Store in Qdrant
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "langchainjs-testing",
      }
    );

    console.log("📌 Connected to Qdrant, inserting chunks...");

    try {
    await vectorStore.addDocuments(docs);
    console.log(`✅ Qdrant Insert ✅ Stored ${docs.length} chunks`);
    } catch (err) {
    console.error("❌ Qdrant insert failed:", err);
   }

  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: "6379",
    },
  }
);

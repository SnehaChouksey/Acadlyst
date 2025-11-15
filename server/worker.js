import "dotenv/config";
import pdf from "pdf-parse";
import fs from "fs";
import { Worker } from "bullmq";
import axios from "axios"; 
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

console.log("GOOGLE KEY:", process.env.GOOGLE_API_KEY ? "FOUND" : "NOT FOUND");

console.log("========== REDIS DEBUG ==========");
console.log("REDIS_HOST:", process.env.REDIS_HOST);
console.log("REDIS_PORT:", process.env.REDIS_PORT);
console.log("REDIS_PASSWORD:", process.env.REDIS_PASSWORD ? "SET" : "NOT SET");
console.log("=================================");




async function downloadPDFFromURL(url) {
  try {
    console.log("Downloading PDF from:", url);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    console.log("PDF downloaded. Size:", buffer.length, "bytes");
    return buffer;
  } catch (error) {
    console.error("Error downloading PDF:", error.message);
    throw new Error(`Failed to download PDF: ${error.message}`);
  }
}

// Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Split text into chunks
async function getTextChunks(text, chunkSize = 3000, overlap = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

//  Parse JSON response from LLM
function parseJSONResponse(response) {
  let rawContent = "";
  
  if (Array.isArray(response)) {
    rawContent = response.map((r) => r?.content || r?.output?.[0]?.content || "").join("\n");
  } else if (response && typeof response === "object") {
    rawContent = response.content || response.output?.[0]?.content || JSON.stringify(response);
  } else {
    rawContent = String(response);
  }

  rawContent = rawContent.trim();
  rawContent = rawContent.replace(/(^``````$)/g, (m) => m.replace(/(^``````$)/g, "")).replace(/^`+|`+$/g, "").trim();

  let jsonString = rawContent;
  const match = rawContent.match(/{[\s\S]*}/);
  if (match) jsonString = match[0];

  return jsonString;
}
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Summary generation timed out")), ms)
    )
  ]);
}


const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    try {
      console.log("New Job Received:", job.data);
      const data = typeof job.data === "string" ? JSON.parse(job.data) : job.data;

      // ===== SUMMARISER JOB =====
      if (data.jobType === "summarize") {
        console.log("Processing SUMMARISATION job...");

        let sourceText = "";

        // Determine source: YouTube/Text input or PDF file
        if (data.text) {
          sourceText = data.text;
          console.log("Summarise: Using text input. Length:", sourceText.length);
        } else if (data.url) {
          const buffer = await downloadPDFFromURL(data.url);
          const parsed = await pdf(buffer);
          sourceText = parsed.text;
          console.log("Summarise: Using PDF input. Length:", sourceText.length);
        } else {
          throw new Error("No text or PDF path provided for summarisation");
        }

        const textLength = sourceText.length;
        const llm = new ChatGoogleGenerativeAI({
          model: "gemini-2.5-flash-lite",
          maxRetries: 1,
          temperature: 0.3,
          apiKey: process.env.GOOGLE_API_KEY,
        });

        let summaryData;

        // Small input: summarize directly
        if (textLength < 10000) {
          console.log("Small input - Summarizing directly...");

          const summaryPrompt = `You are an expert document summarizer. Analyze the following document and provide:
1. A concise summary (3-5 sentences)
2. 5-7 key points as a bulleted list

Document:
${sourceText}

Respond in this exact JSON format ONLY:
{
  "summary": "your summary here",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}`;

          const response = await llm.invoke([
            ["system", "You are a professional summarizer. Always respond with ONLY valid JSON."],
            ["human", summaryPrompt]
          ]);

          const jsonString = parseJSONResponse(response);
          console.log("Parsing summary response...");

          try {
            summaryData = JSON.parse(jsonString);
            console.log("Successfully parsed summary JSON");
          } catch (e) {
            console.error("JSON parse error:", e.message);
            summaryData = {
              summary: jsonString,
              key_points: ["Summary generated (parse fallback)"]
            };
          }
        }
        // Large input: chunk and aggregate


        else {
          console.log("Large input - Using chunked summarization...");

          const chunks = await getTextChunks(sourceText, 3000, 500);
          console.log(`Split into ${chunks.length} chunks`);

          const MAX_CHUNKS = 10;

          let chunkSummaries = [];
          
          for (let i = 0; i < Math.min(chunks.length, MAX_CHUNKS); i++) {
            if (i >= MAX_CHUNKS) break;
            try {
              const chunkResponse = await withTimeout(
                 llm.invoke([
                ["system", "Summarize this section briefly in 2-3 sentences."],
                ["human", chunks[i]]
              ]),40000
            );

              const summaryText = typeof chunkResponse === "string" 
                ? chunkResponse 
                : chunkResponse.content || JSON.stringify(chunkResponse);
              
              chunkSummaries.push(summaryText);
              console.log(`Chunk ${i + 1}/${chunks.length} summarized`);

              if ((i + 1) % 3 === 0) {
                console.log("Rate limiting pause...");
                await sleep(2000);
              }
            } catch (err) {
              console.error(`Error summarizing chunk ${i + 1}:`, err.message);
              chunkSummaries.push(`[Error summarizing chunk ${i + 1}]`);
            }
          }

          const allSummaries = chunkSummaries.slice(0, MAX_CHUNKS).join("\n\n");


          const aggregatePrompt = `Based on these section summaries, create:
1. A comprehensive overall summary (3-5 sentences)
2. 5-7 key points for the entire document

Section Summaries:
${allSummaries}

Respond in this exact JSON format ONLY:
{
  "summary": "comprehensive summary here",
  "key_points": ["point 1", "point 2", ...]
}`;

          try {
            const finalResponse = await withTimeout(
              llm.invoke([
              ["system", "You are a professional summarizer. Always respond with ONLY valid JSON."],
              ["human", aggregatePrompt]
            ]),40000
          );

            const jsonString = parseJSONResponse(finalResponse);
            console.log("Parsing aggregated response...");
            summaryData = JSON.parse(jsonString);
            console.log("Successfully parsed aggregated JSON");
          } catch (e) {
            console.error("Aggregation error:", e.message);
            summaryData = {
              summary: allSummaries.substring(0, 1000),
              key_points: chunkSummaries.slice(0, 5)
            };
          }
        }

        console.log("Summary Generated");

        return {
          summary: summaryData.summary,
          key_points: summaryData.key_points,
          fileName: data.filename,
          textLength: textLength
        };
      }

      // ===== QUIZ GENERATOR JOB =====
      if (data.jobType === "quiz") {
        try {
          let sourceText = "";

          // Determine source: YouTube/Text input or PDF file
          if (data.text) {
            sourceText = data.text;
            console.log("Quiz: Using text input. Length:", sourceText.length);
          } else if (data.url) {
            const buffer = await downloadPDFFromURL(data.url);
            const parsed = await pdf(buffer);
            sourceText = parsed.text;
            console.log("Quiz: Using PDF input. Length:", sourceText.length);
          } else {
            throw new Error("No text or PDF path provided for quiz");
          }

          const textLength = sourceText.length;
          console.log("Text length:", textLength, "chars");

          const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-lite",
            maxRetries: 1,
            temperature: 0.5,
            apiKey: process.env.GOOGLE_API_KEY,
          });

          let quizData;

          // Small input: generate quiz directly
          if (textLength < 15000) {
            console.log("Small input - Generating quiz directly...");

            const quizPrompt = `You are an expert quiz creator. Based on the following content, create a comprehensive quiz with 5-7 questions.

For each question:
1. Create a clear, well-formulated question
2. Provide 4 multiple choice options (A, B, C, D)
3. Indicate which option is the correct answer
4. Provide a brief explanation of why it's correct

Content:
${sourceText}

Respond in this EXACT JSON format ONLY:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_answer": "A",
      "explanation": "Why A is correct..."
    }
  ]
}`;

            const response = await llm.invoke([
              ["system", "You are a professional quiz creator. Always respond with ONLY valid JSON, no markdown."],
              ["human", quizPrompt]
            ]);

            const jsonString = parseJSONResponse(response);
            console.log("Parsing quiz response...");

            try {
              quizData = JSON.parse(jsonString);
              console.log("Quiz JSON Parsed Successfully");
            } catch (e) {
              console.error("Quiz JSON Parse Error:", e.message);
              console.log("Raw response:", jsonString.slice(0, 500));
              quizData = {
                questions: [
                  {
                    id: 1,
                    question: "Could not parse quiz questions. Please try again.",
                    options: { A: "A", B: "B", C: "C", D: "D" },
                    correct_answer: "A",
                    explanation: "Error in parsing: " + e.message
                  }
                ]
              };
            }
          }
          // Large input: generate quiz from key sections
          else {
            console.log("Large input - Generating quiz from key sections...");

            const chunks = await getTextChunks(sourceText, 7000, 700);
            console.log(`Split into ${chunks.length} chunks, using top 3 for quiz...`);

            const topChunks = chunks.slice(0, 3).join("\n\n[NEW SECTION]\n\n");

            const quizPrompt = `You are an expert quiz creator. Based on the following document sections, create a quiz with 5-7 questions covering the main concepts.

For each question, provide 4 multiple choice options (A, B, C, D) and mark the correct answer.

Document Sections:
${topChunks}

Respond in this EXACT JSON format ONLY:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correct_answer": "A",
      "explanation": "Explanation..."
    }
  ]
}`;

            try {
              const response = await llm.invoke([
                ["system", "You are a professional quiz creator. Always respond with ONLY valid JSON, no markdown."],
                ["human", quizPrompt]
              ]);

              const jsonString = parseJSONResponse(response);
              console.log("Parsing large input quiz response...");
              quizData = JSON.parse(jsonString);
              console.log("Large input Quiz Generated");
            } catch (e) {
              console.error("Large input Quiz Error:", e.message);
              quizData = {
                questions: [
                  {
                    id: 1,
                    question: "Quiz generation failed for large document. Try with a smaller input.",
                    options: { A: "A", B: "B", C: "C", D: "D" },
                    correct_answer: "A",
                    explanation: "Error: " + e.message
                  }
                ]
              };
            }
          }

          console.log("Quiz Generated");

          return {
            questions: quizData.questions || [],
            fileName: data.filename || "study-notes",
            totalQuestions: quizData.questions?.length || 0
          };

        } catch (err) {
          console.error("Quiz Generation Top-level Error:", err);
          return {
            questions: [
              {
                id: 1,
                question: "Quiz generation failed: " + (err.message || "Unknown error"),
                options: { A: "", B: "", C: "", D: "" },
                correct_answer: "A",
                explanation: err.stack || ""
              }
            ],
            fileName: data.filename || "study-notes",
            totalQuestions: 1
          };
        }
      }

      // ===== RAG/Q&A JOB =====
      if (data.jobType === "rag" || (!data.jobType && data.url)) {
        console.log("Processing RAG/EMBEDDING job...");

        console.log("RAG Job Started. data.path =", data.url);
        if (!data.url) {
          throw new Error("No PDF provided for chat");
        }


        const buffer = await downloadPDFFromURL(data.url);
        const parsed = await pdf(buffer);
        const pdfText = parsed.text;
        const rawDocs = [{ pageContent: pdfText, metadata: {} }];
        console.log(`PDF Loaded — Text length: ${pdfText.length}`);

        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 150,
        });

        const docs = await splitter.splitDocuments(rawDocs);
        console.log(`Total Chunks: ${docs.length}`);

        docs.forEach((d, i) => {
          d.metadata = {
            ...d.metadata,
            source: data.filename,
            loc: { pageNumber: i + 1 }
          };
        });

        const embeddings = new GoogleGenerativeAIEmbeddings({
          model: "gemini-embedding-001",
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          apiKey: process.env.GOOGLE_API_KEY,
          title: "PDF Document Chunk",
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
          embeddings,
          {
            url: process.env.QDRANT_URL || "http://localhost:6333",
            apiKey: process.env.QDRANT_API_KEY,
            collectionName: "langchainjs-testing",
          }
        );

        await vectorStore.addDocuments(docs);
        console.log(`Qdrant Insert - Stored ${docs.length} chunks`);
      }

    } catch (err) {
      console.error("Top-level job error:", err);
      return {
        error: err.message,
        jobType: job.data?.jobType || 'unknown'
      };
    }
  },
  {
    concurrency: 10,
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      tls: {}
    }
  }
);

console.log("Worker started and listening for jobs...");

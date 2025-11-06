import "dotenv/config";
import pdf from "pdf-parse";
import fs from "fs";
import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

console.log("GOOGLE KEY:", process.env.GOOGLE_API_KEY ? "FOUND" : "NOT FOUND");

// ✅ HELPER: Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ✅ HELPER: Split text into chunks for large PDFs
async function getTextChunks(text, chunkSize = 5000, overlap = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// ✅ HELPER: Parse JSON response from LLM (robust)
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

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log("📂 New Job Received:", job.data);
    const data = typeof job.data === "string" ? JSON.parse(job.data) : job.data;

    // ===== SUMMARISER JOB =====
    if (data.jobType === "summarize") {
      console.log("🔍 Processing SUMMARISATION job...");

      const buffer = fs.readFileSync(data.path);
      const parsed = await pdf(buffer);
      const pdfText = parsed.text;
      const textLength = pdfText.length;

      console.log(`✅ PDF Loaded — Text length: ${textLength} chars`);

      const llm = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash-lite",
        maxRetries: 1,
        temperature: 0.3,
        apiKey: process.env.GOOGLE_API_KEY,
      });

      let summaryData;

      // ✅ SMALL PDF: Send all at once
      if (textLength < 10000) {
        console.log("📄 Small PDF - Summarizing directly...");

        const summaryPrompt = `You are an expert document summarizer. Analyze the following document and provide:
1. A concise summary (3-5 sentences)
2. 5-7 key points as a bulleted list

Document:
${pdfText}

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
        console.log("📝 Parsing response...");

        try {
          summaryData = JSON.parse(jsonString);
          console.log("✅ Successfully parsed JSON");
        } catch (e) {
          console.error("⚠️ JSON parse error:", e.message);
          summaryData = {
            summary: jsonString,
            key_points: ["Summary generated (parse fallback)"]
          };
        }
      }
      // ✅ LARGE PDF: Chunk and aggregate
      else {
        console.log("📚 Large PDF - Using chunked summarization...");

        const chunks = await getTextChunks(pdfText, 5000, 500);
        console.log(`📊 Split into ${chunks.length} chunks`);

        let chunkSummaries = [];
        
        // Summarize each chunk
        for (let i = 0; i < chunks.length; i++) {
          try {
            const chunkResponse = await llm.invoke([
              ["system", "Summarize this section briefly in 2-3 sentences."],
              ["human", chunks[i]]
            ]);

            const summaryText = typeof chunkResponse === "string" 
              ? chunkResponse 
              : chunkResponse.content || JSON.stringify(chunkResponse);
            
            chunkSummaries.push(summaryText);
            console.log(`✅ Chunk ${i + 1}/${chunks.length} summarized`);

            // Rate limiting: wait between requests to avoid hitting limits
            if ((i + 1) % 3 === 0) {
              console.log("⏸️ Rate limiting pause...");
              await sleep(2000);
            }
          } catch (err) {
            console.error(`❌ Error summarizing chunk ${i + 1}:`, err.message);
            chunkSummaries.push(`[Error summarizing chunk ${i + 1}]`);
          }
        }

        // Aggregate chunk summaries
        const allSummaries = chunkSummaries.join("\n\n");

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
          const finalResponse = await llm.invoke([
            ["system", "You are a professional summarizer. Always respond with ONLY valid JSON."],
            ["human", aggregatePrompt]
          ]);

          const jsonString = parseJSONResponse(finalResponse);
          console.log("📝 Parsing aggregated response...");
          summaryData = JSON.parse(jsonString);
          console.log("✅ Successfully parsed aggregated JSON");
        } catch (e) {
          console.error("⚠️ Aggregation error:", e.message);
          summaryData = {
            summary: allSummaries.substring(0, 1000),
            key_points: chunkSummaries.slice(0, 5)
          };
        }
      }

      console.log("✅ Summary Generated");

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

    // Detect if this is a text quiz (else use PDF)
    if (data.text) {
      sourceText = data.text;
      console.log("Quiz job: Using text input. Length:", sourceText.length);
    } else {
      const buffer = fs.readFileSync(data.path);
      const parsed = await pdf(buffer);
      sourceText = parsed.text;  // ✅ NO 'const' here!
      console.log("Quiz job: Using PDF input. Length:", sourceText.length);
    }

    const textLength = sourceText.length;  // ✅ Define textLength here
    console.log("Text length:", textLength, "chars");

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-lite",
      maxRetries: 1,
      temperature: 0.5,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    let quizData;

    // SMALL INPUT: Generate quiz directly
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
    // LARGE INPUT: Generate quiz from key sections
    else {
      console.log("Large input - Generating quiz from key sections...");

      const chunks = await getTextChunks(sourceText, 7000, 700);  // ✅ Use sourceText
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
        console.log("Parsing large PDF quiz response...");
        quizData = JSON.parse(jsonString);
        console.log("Large PDF Quiz Generated");
      } catch (e) {
        console.error("Large PDF Quiz Error:", e.message);
        quizData = {
          questions: [
            {
              id: 1,
              question: "Quiz generation failed for large document. Try with a smaller PDF.",
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

    // ===== RAG/Q&A JOB (Existing code) =====
    console.log("🔍 Processing RAG/EMBEDDING job...");

    const buffer = fs.readFileSync(data.path);
    const parsed = await pdf(buffer);
    const pdfText = parsed.text;
    const rawDocs = [{ pageContent: pdfText, metadata: {} }];
    console.log(`✅ PDF Loaded — Text length: ${pdfText.length}`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
    });

    const docs = await splitter.splitDocuments(rawDocs);
    console.log(`✂️ Total Chunks: ${docs.length}`);

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
        url: "http://localhost:6333",
        collectionName: "langchainjs-testing",
      }
    );

    await vectorStore.addDocuments(docs);
    console.log(`✅ Qdrant Insert ✅ Stored ${docs.length} chunks`);
  },
  {
    concurrency: 10,
    connection: {
      host: "localhost",
      port: "6379",
    },
  }
);

console.log("🔥 Worker started and listening for jobs...");

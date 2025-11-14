
# 📚 Acadlyst

Acadlyst is an AI-powered academic assistant SaaS platform built for students. It combines RAG-based document Q&A, smart summarization, and auto-generated quizzes—all in a professional, intuitive workflow.

🌐 **Live Demo:**  acadlyst-opal.vercel.app

---

## ✨ Features

### 1. **PDF Q&A Chatbot (RAG-based)**
- **Vector Embedding-Powered**: Upload PDFs and chat with them using semantic search; answers are grounded in document context via Retrieval Augmented Generation (RAG).
- **Cited Responses**: Every answer includes page number and source references from your uploaded document for academic integrity.
- **Interactive UI**: user can easily access to recent conversations for revision.

### 2. **AI Summarizer**
- **Two Input Modes**: Accepts **PDF uploads** or **YouTube URLs** for instant summarization.
- **Smart Extraction**: Uses pdf-parse for documents and transcript scraping for videos; outputs concise, structured bullet-point summaries.
- **Fast Processing**: Powered by Google Gemini for context-aware summarization and Cloudinary for secure file uploads.

### 3. **Quiz Generator**
- **Multiple Input Types**: Generate quizzes from **text**, **YouTube videos**, or **PDF uploads**.
- **MCQ Auto-Generation**: AI creates challenging multiple-choice questions with plausible distractors and correct answers.
- **Insights and Scoreboard**: Get quick insights about your attempted quiz.

### 4. **Authentication & Credit System**
- Secure sign-in via Clerk with personalized user profiles.
- Free-tier credit system for API usage across Q&A, summarizer, and quiz features.
- Paid tier for unlimited usage of these features.
  

---

## 🧩 Tech Stack

**Frontend**
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion & GSAP
- Lucide Icons
- Clerk (authentication)

**Backend**
- Node.js + Express
- Prisma + PostgreSQL (Neon)
- BullMQ + Upstash Redis
- Google Gemini API (embeddings, LLM)
- Qdrant Cloud (vector search/RAG)
- Cloudinary (file uploads)
- pdf-parse (PDF extraction)
- YouTube Transcript API
- Multer (file handling)

**DevOps & Deployment**
- Vercel (frontend hosting)
- Render (backend API + worker)
- Qdrant Cloud (vector database)
- Neon DB (PostgreSQL)
- Upstash Redis (job queue)
- Cloudinary (CDN & storage)
- Docker Compose (containerization)

---

## 🏗️ Project Structure

```
acadlyst/
├── client/
│   ├── .clerk/
│   ├── .next/
│   ├── app/
│   │   ├── assets/
│   │   ├── favicon_io (2)/
│   │   ├── herosection/
│   │   ├── pricing/
│   │   ├── qna/
│   │   ├── quiz/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── summarizer/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── node_modules/
│   ├── public/
│   ├── .env
│   ├── .gitignore
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── proxy.ts
│   ├── README.md
│   └── tsconfig.json
│
└── server/
    ├── config/
    ├── node_modules/
    ├── prisma/
    ├── routes/
    ├── services/
    ├── uploads/
    ├── .env
    ├── .gitignore
    ├── index.js
    ├── package-lock.json
    ├── package.json
    ├── seed-user.js
    └── worker.js
```

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/acadlyst.git
   cd acadlyst
   ```

2. **Install dependencies:**
   ```bash
   # Frontend
   cd client
   npm install

   # Backend
   cd ../server
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables:**

   **Frontend (client/.env.local):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   ```

   **Backend (server/.env):**
   ```env
   PORT=8000
   DATABASE_URL=postgresql://...
   QDRANT_URL=...
   QDRANT_API_KEY=...
   GOOGLE_API_KEY=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   REDIS_HOST=...
   REDIS_PORT=...
   REDIS_PASSWORD=...
   CLERK_SECRET_KEY=...
   ```

4. **Prisma setup:**
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Run development servers:**

   **Backend API:**
   ```bash
   cd server
   npm run dev
   ```

   **Worker (separate terminal):**
   ```bash
   cd server
   npm run dev:worker
   ```

   **Frontend:**
   ```bash
   cd client
   npm run dev
   ```

   Visit: `http://localhost:3000`

---
### **Option 2: Docker Setup**

If you prefer containerized deployment:

1. **Ensure Docker & Docker Compose are installed**

2. **Set up environment variables** (as shown above in server/.env)

3. **Run with Docker Compose:**
   ```bash
   cd server
   docker-compose up --build
   ```

4. **Access the application:**
   - Backend API: `http://localhost:8000`
   - Frontend: `http://localhost:3000` (run separately or add to docker-compose)

---

## 🧪 Usage

### **PDF Q&A (RAG Chatbot)**
1. Navigate to the **Q&A** page
2. Upload your PDF document
3. Wait for "Processing started" message
4. Ask questions in the chat interface
5. Get answers with source citations and page numbers
6. 5. Access saved chats from sidebar for revision.


### **AI Summarizer**
1. Go to **Summarizer** page
2. Choose input type:
   - Upload a PDF, or
   - Paste a YouTube URL
3. Click "Generate Summary"
4. View structured bullet-point summary

### **Quiz Generator**
1. Go to **Quiz** page
2. Choose input type:
   - Enter text directly, or
   - Paste YouTube URL, or
   - Upload PDF
3. Click "Generate Quiz"
4. Answer multiple-choice questions


---

## 🛡️ Security

- Clerk authentication for all user sessions
- API credit limits to prevent abuse
- Backend validation on all file uploads
- Separate worker process for secure background jobs.
- PostgreSQL with Prisma for data integrity


## 👨‍💼 Author

Sneha Chouksey-
Built by a student, for students❤️

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---
---

**Optimized for desktop view only currently.**

import express from "express";
import cors from "cors";
import uploadRoute from "./routes/upload.js";
import chatRoute from "./routes/chat.js";
import summarizerRoute from "./routes/summarizer.js";
import quizRouter from "./routes/quiz.js";
import webhookRouter from "./routes/webhooks.js";
import userRouter from "./routes/user.js";
import recentChatsRouter from "./routes/recentChats.js";
import chatHistoryRouter from './routes/chatHistory.js';



const app = express();

app.use("/webhooks", webhookRouter);

app.use(cors());

app.get("/", (req, res) => res.send("Server OK!"));

app.use(express.json()); 


process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION:', err);
});
process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION:', err);
});



// mount routes
app.use("/upload", uploadRoute);
app.use("/chat", chatRoute);
app.use("/summarizer", summarizerRoute);
app.use("/quiz", quizRouter);
app.use("/user", userRouter);
app.use("/api/recent-chats", recentChatsRouter);
app.use('/api/chat-history', chatHistoryRouter);





app.get("/summariser/test", (req, res) => {
  res.json({ message: "Summariser route works!" });
});


app.listen(8000, () => console.log("🚀 Server listening on 8000"));

import express from "express";
import cors from "cors";

import uploadRoute from "./routes/upload.js";
import chatRoute from "./routes/chat.js";

const app = express();
app.use(cors());

app.get("/", (req, res) => res.send("Server OK!"));

// mount routes
app.use("/upload", uploadRoute);
app.use("/chat", chatRoute);

app.listen(8000, () => console.log("🚀 Server listening on 8000"));

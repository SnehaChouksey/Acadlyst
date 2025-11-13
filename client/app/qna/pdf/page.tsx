"use client";

import React from "react";
import FileUploadComponent from "@/components/file-upload";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import Sidebar from "@/components/sidebar";
import { FeatureNavbar } from "@/components/ui/featureNavbar";

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: { pageNumber?: number };
    source?: string;
  };
}

interface IMessage {
  role: "assistant" | "user";
  content?: string;
  documents?: Doc[];
}

export default function QA() {
  const { userId } = useAuth();
  const [input, setInput] = React.useState<string>("");
  const [messages, setMessages] = React.useState<IMessage[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI study assistant. Upload your notes or ask me anything about them!",
    },
  ]);
  const [pdfLoaded, setPdfLoaded] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<string>("");
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleFileUploaded = async (data: { file: File; response: any }) => {
    console.log("File upload callback received:", data);

    if (data.response?.message) {
      setUploadStatus("✅ PDF uploaded! Processing started...");
      setPdfLoaded(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ I've successfully loaded "${data.file.name}" and indexed it. You can now ask questions about its content!`,
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!pdfLoaded) {
      alert("Please upload a PDF first!");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    const userMessage = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-id": userId || "",
        },
        body: JSON.stringify({ query: userMessage }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.answer ?? "No response from server.",
          documents: data?.sources ?? [],
        },
      ]);
    } catch (err) {
      console.error("Chat fetch error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error connecting to the server. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FeatureNavbar/>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-60 pt-16">
          <div className="flex items-center justify-between px-8 py-4 ">
            <div>
              <h1 className="text-2xl font-bold">Smart Q&A</h1>
              <p className="text-sm text-muted-foreground">
                Upload your PDF notes and ask anything you like
              </p>
            </div>
            <FileUploadComponent onUploaded={handleFileUploaded} />
          </div>

          {!pdfLoaded && (
            <div className="mx-8 mt-4 p-3 bg-yellow-700/20 border-l-4 border-yellow-600 rounded text-yellow-700 dark:text-yellow-300 flex items-center gap-2 text-sm">
              <AlertCircle className="h-5 w-5" />
              Please upload a PDF to start asking questions
            </div>
          )}

          {uploadStatus && (
            <div className="mx-8 mt-4 p-3 bg-green-600/20 border-l-4 border-green-600 rounded text-green-700 dark:text-green-300 flex items-center gap-2 text-sm">
              <CheckCircle className="h-5 w-5" />
              {uploadStatus}
            </div>
          )}

          <div className="flex-1 flex flex-col px-8 py-4 overflow-hidden">
            <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur border rounded-2xl overflow-hidden ">
              <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
                style={{ scrollbarWidth: "thin" }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] text-white"
                          : "bg-muted/80 text-foreground"
                      }`}
                    >
                      {msg.content}

                      {msg.documents && msg.documents.length > 0 && (
                        <div className="mt-2 text-xs opacity-80">
                          {msg.documents.map((d, i) => (
                            <div key={i} className="mt-1">
                              {d.metadata?.source ? (
                                <span>
                                  📄 {d.metadata.source}
                                  {d.metadata.loc?.pageNumber
                                    ? ` — p.${d.metadata.loc.pageNumber}`
                                    : ""}
                                </span>
                              ) : (
                                <span>📄 source unknown</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className=" bg-card/10 p-0">
                <div className="flex gap-2 max-w-4xl mx-auto mt-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me something about your uploaded notes..."
                    className="resize-none w-2xl rounded-xl"
                    rows={2}
                    disabled={!pdfLoaded}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!loading && pdfLoaded) handleSend();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || loading || !pdfLoaded}
                    className="h-[60px] w-[70px] rounded-lg bg-transparent hover:bg-accent/70 "
                  >
                    <Send className="h-20 w-20 text-foreground" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

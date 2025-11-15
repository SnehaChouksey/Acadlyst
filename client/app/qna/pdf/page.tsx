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
  const [openSidebar, setOpenSidebar] = React.useState(false);
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
    if (el) el.scrollTop = el.scrollHeight;
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
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
        { role: "assistant", content: " Error connecting to the server. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FeatureNavbar onOpenSidebar={() => setOpenSidebar(true)} />


      {/* MAIN LAYOUT */}
      <div className="flex h-screen bg-background">

        <Sidebar open={openSidebar} setOpen={setOpenSidebar} />


        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col md:ml-60 pt-16">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 sm:px-8 py-4 gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Smart Q&A</h1>
              <p className="text-sm text-muted-foreground">
                Upload your PDF notes and ask anything you like
              </p>
            </div>

            <div className="self-start md:self-auto">
              <FileUploadComponent onUploaded={handleFileUploaded} />
            </div>
          </div>

          {/* ALERTS */}
          {!pdfLoaded && (
            <div className="mx-4 sm:mx-8 mt-2 p-3 bg-yellow-700/20 border-l-4 border-yellow-600 rounded text-yellow-300 flex items-center gap-2 text-sm">
              <AlertCircle className="h-5 w-5" />
              Please upload a PDF to start asking questions
            </div>
          )}

          {uploadStatus && (
            <div className="mx-4 sm:mx-8 mt-2 p-3 bg-green-600/20 border-l-4 border-green-600 rounded text-green-300 flex items-center gap-2 text-sm">
              <CheckCircle className="h-5 w-5" />
              {uploadStatus}
            </div>
          )}

          {/* CHAT CONTENT */}
          <div className="flex-1 flex flex-col px-4 sm:px-8 py-4 overflow-hidden">
            <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur border rounded-2xl overflow-hidden">

              {/* MESSAGE LIST */}
              <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
                        ${msg.role === "user"
                          ? "bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] text-white max-w-[85%] sm:max-w-[70%]"
                          : "bg-muted/80 text-foreground max-w-[85%] sm:max-w-[70%]"
                        }`}
                    >
                      {msg.content}

                      {/* METADATA — untouched, only styles */}
                      {msg.documents && msg.documents.length > 0 && (
                        <div className="mt-2 text-xs opacity-80">
                          {msg.documents.map((d, i) => (
                            <div key={i} className="mt-1">
                              {d.metadata?.source ? (
                                <span>
                                  📄 {d.metadata.source}
                                  {d.metadata.loc?.pageNumber ? ` — p.${d.metadata.loc.pageNumber}` : ""}
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

              {/* INPUT BAR */}
              <div className="bg-card/10 p-2 sm:p-3">
                <div className="flex gap-2 w-full sm:max-w-4xl mx-auto">
                  
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me something..."
                    className="resize-none w-full rounded-xl text-sm"
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
                    className="h-[48px] w-[48px] min-w-[48px] rounded-lg bg-transparent hover:bg-accent/70 flex items-center justify-center"
                  >
                    <Send className="h-6 w-6 text-foreground" />
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

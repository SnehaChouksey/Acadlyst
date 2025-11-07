'use client';

import React from "react";
import FileUploadComponent from "@/components/file-upload";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertCircle, CheckCircle } from "lucide-react";

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: { pageNumber?: number };
    source?: string;
  };
}

interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

export default function QA() {
  const [input, setInput] = React.useState<string>('');
  const [messages, setMessages] = React.useState<IMessage[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI study assistant. Upload your notes or ask me anything about them!",
    },
  ]);
  const [pdfLoaded, setPdfLoaded] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<string>("");
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Auto-scroll to bottom on new messages
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
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
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

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data?.answer ?? 'No response from server.',
          documents: data?.sources ?? [],
        },
      ]);
    } catch (err) {
      console.error('Chat fetch error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Error connecting to the server. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-8 bg-background text-foreground">
      {/* Header: title + upload */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-bold">Smart Q&A</h1>
          <p className="text-muted-foreground text-sm">
            Upload your PDF notes and ask anything you like
          </p>
        </div>

        {/* Upload component */}
        <FileUploadComponent onUploaded={handleFileUploaded} />
      </div>

      {/* Status message */}
      {uploadStatus && (
        <div className="w-full max-w-4xl mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-300 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {uploadStatus}
        </div>
      )}

      {/* PDF not loaded warning */}
      {!pdfLoaded && (
        <div className="w-full max-w-4xl mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Please upload a PDF to start asking questions
        </div>
      )}

      {/* Chat Card */}
      <Card className="w-full max-w-4xl flex flex-col p-4 border-2">
        {/* Messages container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[65vh] pr-2"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm sm:text-base ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
              >
                {msg.content}

                {/* Document references */}
                {msg.documents && msg.documents.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {msg.documents.map((d, i) => (
                      <div key={i} className="mt-1">
                        {d.metadata?.source ? (
                          <span>📄 {d.metadata.source}{d.metadata.loc?.pageNumber ? ` — p.${d.metadata.loc.pageNumber}` : ''}</span>
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

        {/* Input + send */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me something about your uploaded notes..."
            className="resize-none"
            rows={2}
            disabled={!pdfLoaded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!loading && pdfLoaded) handleSend();
              }
            }}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || loading || !pdfLoaded} 
            className="h-[52px] w-[52px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

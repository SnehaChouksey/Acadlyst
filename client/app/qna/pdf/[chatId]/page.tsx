"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { FeatureNavbar } from "@/components/ui/featureNavbar";
import Sidebar from "@/components/sidebar";

type ChatHistory = {
  id: string;
  question: string;
  answer: string;
  sources: { content: string; metadata: any }[];
  createdAt: string;
};

export default function ChatHistoryDetailPage() {
  const { chatId } = useParams();
  const [data, setData] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!chatId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat-history/${chatId}`)
      .then(res => {
        if (res.ok) return res.json();
        if (res.status === 404) setNotFound(true);
        throw new Error();
      })
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [chatId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (notFound) return <div className="p-8 text-red-500">Chat history not found.</div>;
  if (!data) return null;

  return (
    <>
      <FeatureNavbar />
      <div className="grid grid-cols-7 h-screen pt-16">
        <div className="col-span-1">
          <Sidebar />
        </div>
        
        <div className="col-span-6 flex flex-col px-5 pt-6 h-[calc(100vh-64px)] pb-6">
          
          <div className="shrink-0 pb-2">
            <div className="flex items-center text-2xl font-bold gap-2 text-accent">
              <MessageSquare /> Previous Chat
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(data.createdAt).toLocaleString()}
            </div>
          </div>
          
          <div className="flex-1 min-h-0 flex flex-row mt-3">
            <div className="w-full bg-background/80 border border-accent/25 shadow-xl rounded-2xl overflow-hidden flex-1 flex flex-col">
              <div className="flex-1 px-8 py-8 overflow-y-auto">
                <div className="mb-6">
                  <div className="text-xs text-muted-foreground mb-1">You asked:</div>
                  <div className="bg-accent/15 px-4 py-3 rounded font-semibold text-[17px]">{data.question}</div>
                </div>
                <div className="mb-6">
                  <div className="text-xs text-muted-foreground mb-1">AI answered:</div>
                  <div className="bg-muted/80 px-4 py-3 rounded-xl leading-relaxed text-base">{data.answer}</div>
                </div>
                {data.sources && data.sources.length > 0 && (
                  <div className="mb-4 mt-6">
                    <div className="font-bold text-xs uppercase mb-2 text-accent">REFERENCED SOURCES</div>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                      {data.sources.map((src, i) => (
                        <li key={i}>
                          {src.content.slice(0, 120)}...
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

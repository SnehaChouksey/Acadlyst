"use client";
import React, { useEffect, useState } from "react";
import { MessageSquare, Home, FileText, Brain, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

interface RecentChat {
  id: string;
  question: string;
  createdAt: string;
}

const navItems = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Chat", href: "/qna/pdf", icon: MessageSquare },
  { label: "Summarizer", href: "/summarizer/pdf", icon: FileText },
  { label: "Quiz", href: "/quiz", icon: Brain },
];

export default function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { userId } = useAuth();
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!userId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recent-chats`, {
      headers: { "x-clerk-id": userId },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentChats(data);
          setFetchError(false);
        } else {
          setRecentChats([]);
          setFetchError(true);
        }
      })
      .catch(() => {
        setRecentChats([]);
        setFetchError(true);
      });
  }, [userId]);

  return (
    <>
    
      {open && (
        <div
          className="fixed inset-0 bg-black/90 z-[90] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

    
      <aside
        className={`
          h-screen w-[210px] fixed top-0 left-0 z-[100]
          bg-background/90 border-r border-accent/15 pt-6 px-0 flex flex-col backdrop-blur
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
    
        <button
          type="button"
          aria-label="Close Sidebar"
          title="Close Sidebar"
          className="md:hidden absolute top-4 right-4 p-2 bg-background/40 rounded-lg"
          onClick={() => setOpen(false)}
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

      
<div className="hidden md:flex items-center gap-3 px-5 pb-6">
  <img
    src="/acadlyst_logo.png"
    alt="Acadlyst Logo"
    className="w-10 h-10"
  />
  <span className="font-bold text-xl">Acadlyst</span>
</div>

    

        <nav className="flex flex-col gap-2 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-6 py-2.5 text-[15px] text-foreground/80 hover:bg-accent/10 hover:text-accent transition font-medium"
              onClick={() => setOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-6 pb-2 text-md text-muted-foreground font-semibold uppercase tracking-wide">
          Recent Chats
        </div>

        <div className="flex-1 px-2 overflow-y-auto">
          {fetchError ? (
            <div className="text-xs text-red-400 px-4">Failed to load chats</div>
          ) : recentChats.length === 0 ? (
            <div className="text-xs text-muted-foreground px-4">
              No recent chats
            </div>
          ) : (
            recentChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/qna/pdf/${chat.id}`}
                className="flex items-center gap-2 px-4 py-2 mb-1 rounded text-sm hover:bg-accent/10 text-foreground/80"
                title={chat.question}
                onClick={() => setOpen(false)}
              >
                <MessageSquare className="w-4 h-4 text-accent" />
                <span className="truncate">
                  {chat.question.slice(0, 30)}...
                </span>
              </Link>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

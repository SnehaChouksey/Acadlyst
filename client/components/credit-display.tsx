'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Brain, MessageSquare, Crown } from "lucide-react";

export default function CreditDisplay() {
  const { userId } = useAuth();
  const [credits, setCredits] = useState<any>(null);

  useEffect(() => {
    if (userId) {
      fetch('http://localhost:8000/user/subscription', {
        headers: { 'x-clerk-id': userId }
      })
        .then(res => res.json())
        .then(setCredits);
    }
  }, [userId]);

  if (!credits) return null;

  if (credits.plan === 'PREMIUM' || credits.plan === 'OWNER') {
    return (
      <Card className="p-4 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold">Premium Member - Unlimited Credits</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Your Credits</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Summarizer</span>
          </div>
          <span className="text-sm font-medium">{credits.summarizerCredits} left</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="text-sm">Quiz</span>
          </div>
          <span className="text-sm font-medium">{credits.quizCredits} left</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">Chat</span>
          </div>
          <span className="text-sm font-medium">{credits.chatCredits} left</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">Credits reset monthly</p>
    </Card>
  );
}

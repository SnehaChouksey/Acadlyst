'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import QuizDisplay from '@/components/quiz/quiz-display';
import { useAuth } from "@clerk/nextjs";
import UpgradeModal from "@/components/upgrade-modal";

interface Question {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: string;
  explanation: string;
}

interface QuizResponse {
  questions: Question[];
  fileName?: string;
  totalQuestions?: number;
}

export default function TextQuizTab() {
  const { userId } = useAuth();
  const [textInput, setTextInput] = useState('');
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!textInput.trim()) {
      alert('Please paste some text');
      return;
    }

    try {
      setLoading(true);
      setQuiz(null);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-clerk-id': userId || '',
        },
        body: JSON.stringify({ text: textInput })
      });

      const data = await res.json();

      if (res.status === 403) {
        setShowUpgrade(true);
        return;
      }

      if (data.jobId) {
        pollJobStatus(data.jobId);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating quiz. Please try again.');
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/status/${jobId}`);
        const data = await res.json();

        if (data.status === 'completed' && data.questions) {
          clearInterval(interval);
          setQuiz({
            questions: data.questions,
            fileName: 'Study Notes',
            totalQuestions: data.totalQuestions
          });
          setLoading(false);
        } else if (data.status === 'failed' || attempts >= maxAttempts) {
          clearInterval(interval);
          alert('Quiz generation failed or timed out.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 1000);
  };

  if (quiz) {
    return (
      <QuizDisplay
        quiz={quiz}
        onRestart={() => {
          setQuiz(null);
          setTextInput('');
        }}
        source="text"
      />
    );
  }

  return (
    <>
      {/* When not loading: original textarea card */}
      {!loading && (
        <Card className="border border-accent/40 shadow-2xl w-full">
          <CardContent className="px-4 sm:px-6 py-6 space-y-4">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your study notes, lecture content, or any text you want to create a quiz from..."
              className="w-full h-48 sm:h-64 p-4 bg-background text-foreground border border-foreground/20 rounded-lg resize-none focus:outline-none focus:border-blue-500"
            />

            <Button
              onClick={handleGenerateQuiz}
              disabled={!textInput.trim() || loading}
              className="w-full bg-pink-700 hover:bg-pink-900 text-foreground h-12 text-sm sm:text-base"
            >
              Generate Quiz from Text
            </Button>
          </CardContent>
        </Card>
      )}

      {/* When loading: quiz-shaped skeleton card in same place */}
      {loading && (
        <Card className="border border-accent/40 bg-card shadow-2xl w-full">
          <CardContent className="p-6 sm:p-8 md:p-10 space-y-6">
            {/* Header skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3 sm:w-1/2 bg-foreground/40" />
            </div>

            {/* Question skeleton */}
            <div className="space-y-3 mt-2">
              <Skeleton className="h-5 w-5/6 bg-foreground/35" />
            </div>

            {/* Options skeleton */}
            <div className="space-y-3 mt-4">
              <Skeleton className="h-11 w-full bg-foreground/25 rounded-lg" />
              <Skeleton className="h-11 w-full bg-foreground/25 rounded-lg" />
              <Skeleton className="h-11 w-full bg-foreground/25 rounded-lg" />
              <Skeleton className="h-11 w-full bg-foreground/25 rounded-lg" />
            </div>

            <p className="text-center text-muted-foreground text-xs sm:text-sm ">
              Analyzing your text and generating quiz questions...
            </p>
          </CardContent>
        </Card>
      )}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="quiz"
      />
    </>
  );
}

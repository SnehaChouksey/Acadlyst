'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import FileUploadComponent from '@/components/file-upload';
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

export default function PdfQuizTab() {
  const { userId } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (data: { file: File; response: any }) => {
  try {
    setLoading(true);
    setQuiz(null);

    const uploadResponse = data.response; // already from /quiz/pdf

    if (uploadResponse.jobId) {
      pollJobStatus(uploadResponse.jobId);
    } else {
      setLoading(false);
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
            fileName: data.fileName,
            totalQuestions: data.totalQuestions,
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
        onRestart={() => setQuiz(null)}
        source="pdf"
      />
    );
  }

  return (
    <>
      {/* When not loading: upload card */}
      {!loading && (
        <Card className="border border-accent/50 bg-card shadow-2xl w-full">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-center text-center rounded-xl p-6 sm:p-10 md:p-12 bg-card space-y-4">
              <p className="text-foreground text-lg sm:text-xl font-medium">
                Upload a PDF and test your knowledge with Acadlyst 🧠
              </p>

              <div className="w-full max-w-sm mx-auto">
                <FileUploadComponent feature="quiz" onUploaded={handleFileUpload} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* When loading: full quiz-shaped skeleton card in same place */}
      {loading && (
        <Card className="border border-accent/50 bg-card shadow-2xl w-full">
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
              Analyzing your PDF and generating quiz questions...
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

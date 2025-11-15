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

      const formData = new FormData();
      formData.append('pdf', data.file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/pdf`, {
        method: 'POST',
        headers: { 'x-clerk-id': userId || '' },
        body: formData,
      });

      if (res.status === 403) {
        setShowUpgrade(true);
        return;
      }

      const uploadResponse = await res.json();

      if (uploadResponse.jobId) pollJobStatus(uploadResponse.jobId);
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
      <Card className="border border-accent/50 bg-card shadow-2xl w-full">

        {/* Responsive padding: small on mobile, large on desktop */}
        <CardContent className="p-4 sm:p-6 md:p-8">

          {/* Upload block */}
          {!loading && (
            <div className="flex flex-col items-center text-center rounded-xl p-6 sm:p-10 md:p-12 bg-card space-y-4">

              <p className="text-foreground text-lg sm:text-xl font-medium">
                Upload a PDF and test your knowledge with Acadlyst 🧠
              </p>

              <div className="w-full max-w-sm mx-auto">
                <FileUploadComponent onUploaded={handleFileUpload} />
              </div>
            </div>
          )}

          {/* Loading block */}
          {loading && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg sm:text-xl mb-3 text-slate-300">
                  Generating Quiz
                </h3>

                <Skeleton className="h-32 sm:h-40 w-full bg-accent/30" />
              </div>

              <p className="text-center text-muted-foreground text-sm sm:text-base">
                Analyzing document and generating quiz questions...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="summarizer"
      />
    </>
  );
}

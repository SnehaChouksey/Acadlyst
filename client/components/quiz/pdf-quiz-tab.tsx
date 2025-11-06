'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import FileUploadComponent from '@/components/file-upload';
import QuizDisplay from '@/components/quiz/quiz-display';

interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  explanation: string;
}

interface QuizResponse {
  questions: Question[];
  fileName?: string;
  totalQuestions?: number;
}

export default function PdfQuizTab() {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (data: { file: File; response: any }) => {
    try {
      setLoading(true);
      setQuiz(null);

      const formData = new FormData();
      formData.append('pdf', data.file);

      const res = await fetch('http://localhost:8000/quiz/pdf', {
        method: 'POST',
        body: formData,
      });

      const uploadResponse = await res.json();
      
      if (uploadResponse.jobId) {
        pollJobStatus(uploadResponse.jobId);
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
        const res = await fetch(`http://localhost:8000/quiz/status/${jobId}`);
        const data = await res.json();

        if (data.status === 'completed' && data.questions) {
          clearInterval(interval);
          setQuiz({
            questions: data.questions,
            fileName: data.fileName,
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
        onRestart={() => setQuiz(null)}
        source="pdf"
      />
    );
  }

  return (
    <Card className="border border-slate-700 bg-slate-800 shadow-2xl">
      <CardContent className="p-8">
        {!loading && (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-12 bg-slate-700/30">
            <FileUploadComponent onUploaded={handleFileUpload} />
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-slate-300">Generating Quiz</h3>
              <Skeleton className="h-40 w-full bg-slate-600" />
            </div>
            <p className="text-center text-slate-400 text-sm">Analyzing document and generating quiz questions...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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

      const res = await fetch('http://localhost:8000/quiz/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'x-clerk-id': userId || '',
                 },
        body: JSON.stringify({ text: textInput })
      });

      const data = await res.json();

      if (res.status === 403) {
        // Out of credits
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
        const res = await fetch(`http://localhost:8000/quiz/status/${jobId}`);
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
    <Card className="border border-accent/40 max-h-100 shadow-2xl">
      <CardContent className="px-6 space-y-4">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste your study notes, lecture content, or any text you want to create a quiz from..."
          className="w-full h-64 p-4 bg-background text-foreground border border-foreground/20 rounded-lg resize-none focus:outline-none focus:border-blue-500"
        />

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full bg-accent/30" />
            <p className="text-center text-slate-400 text-sm">Generating quiz questions...</p>
          </div>
        )}

        {!loading && (
          <Button
            onClick={handleGenerateQuiz}
            disabled={!textInput.trim() || loading}
            className="w-full bg-pink-700 hover:bg-pink-900 text-foreground h-12 "
          >
            Generate Quiz from Text
          </Button>
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

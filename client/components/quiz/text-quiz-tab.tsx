'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function TextQuizTab() {
  const [textInput, setTextInput] = useState('');
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(false);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput })
      });

      const data = await res.json();

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
    <Card className="border border-slate-700 bg-slate-800 shadow-2xl">
      <CardContent className="p-8 space-y-4">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste your study notes, lecture content, or any text you want to create a quiz from..."
          className="w-full h-64 p-4 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg resize-none focus:outline-none focus:border-blue-500"
        />

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full bg-slate-600" />
            <p className="text-center text-slate-400 text-sm">Generating quiz questions...</p>
          </div>
        )}

        {!loading && (
          <Button
            onClick={handleGenerateQuiz}
            disabled={!textInput.trim() || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
          >
            Generate Quiz from Text
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

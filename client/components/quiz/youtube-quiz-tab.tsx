'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Youtube } from 'lucide-react';
import QuizDisplay from './quiz-display';
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

export default function YoutubeQuizTab() {
  const { userId } = useAuth(); 
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleGenerateQuiz = async () => {
  if (!youtubeUrl.trim()) {
    setError('Please paste a YouTube URL');
    return;
  }

  setLoading(true);
  setQuiz(null);
  setError('');

  // Wrapper function for retries
  async function tryGenerateQuiz(retries = 3, delay = 1600) {
    try {
      const res = await fetch('http://localhost:8000/quiz/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-clerk-id': userId || '',
        },
        body: JSON.stringify({ url: youtubeUrl })
      });

      if (res.status === 403) {
        setShowUpgrade(true);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        if (retries > 0) {
          setTimeout(() => tryGenerateQuiz(retries - 1, delay), delay);
        } else {
          setError(data.error || 'Error generating quiz');
          setLoading(false);
        }
        return;
      }

      if (data.jobId) {
        pollJobStatus(data.jobId);
      }
    } catch (error) {
      if (retries > 0) {
        setTimeout(() => tryGenerateQuiz(retries - 1, delay), delay);
      } else {
        setError('Error generating quiz. Please try again.');
        setLoading(false);
      }
    }
  }

  tryGenerateQuiz();
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
          setError('Quiz generation failed or timed out.');
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
          setYoutubeUrl('');
        }}
        source="youtube"
      />
    );
  }

  return (
    <>
    <Card className="border border-accent/30 bg-card shadow-2xl max-h-100">
      <CardContent className="p-20 space-y-4">
        
        <div className="flex items-center gap-2 flex-col mb-4">
          <Youtube className="glex-col flex h-15 w-15 text-red-500" />
          <label className="text-2xl font-semibold text-slate-300">YouTube Video URL</label>
        </div>

        <input
          type="text"
          value={youtubeUrl}
          onChange={(e) => {
            setYoutubeUrl(e.target.value);
            setError('');
          }}
          placeholder="Paste YouTube link (e.g., https://www.youtube.com/watch?v=..."
          className="w-full p-3 bg-background text-slate-100 border border-foreground/20 hover:border-white rounded-lg focus:outline-none focus:border-blue-500"
        />

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="max-h-70 w-full bg-accent/20" />
            <p className="text-center text-muted-foreground text-sm">Fetching transcript and generating quiz...</p>
          </div>
        )}

        {!loading && (
          <Button
            onClick={handleGenerateQuiz}
            disabled={!youtubeUrl.trim() || loading}
            className="w-full bg-pink-700 hover:bg-pink-900 h-12 text-foreground font-semibold"
          >
            Generate Quiz from Video
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

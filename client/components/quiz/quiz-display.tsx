'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface Question {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: string;
  explanation: string;
}

interface QuizDisplayProps {
  quiz: {
    questions: Question[];
    fileName?: string;
    totalQuestions?: number;
  };
  onRestart: () => void;
  source: 'text' | 'pdf' | 'youtube';
}

// ---------------- MAIN COMPONENT ---------------- //

export default function QuizDisplay({ quiz, onRestart }: QuizDisplayProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestionIndex];
  const isAnswered = userAnswer !== undefined;
  const isCorrect = userAnswer === currentQuestion.correct_answer;

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = quiz.totalQuestions || quiz.questions.length;

  const handleAnswerSelect = (answer: string) => {
    if (!isAnswered) {
      setUserAnswers({ ...userAnswers, [currentQuestionIndex]: answer });
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowFeedback(false);
    }
  };

  const handleSubmitQuiz = () => {
    const correctCount = quiz.questions.filter(
      (q, i) => userAnswers[i] === q.correct_answer
    ).length;

    setScore(correctCount);
    setShowResults(true);
  };

  const handleRestartAll = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowFeedback(false);
    onRestart();
  };

  if (showResults) {
    return (
      <QuizResultsView
        quiz={quiz}
        score={score}
        userAnswers={userAnswers}
        onRestart={handleRestartAll}
      />
    );
  }

  const getOptionColor = (key: string) => {
    if (!isAnswered) return 'border-slate-600 bg-slate-700/50';

    if (key === currentQuestion.correct_answer) return 'border-green-500 bg-green-900/30';
    if (key === userAnswer) return 'border-red-500 bg-red-900/30';

    return 'border-slate-600 bg-slate-700/50 opacity-50';
  };

  return (
    <div className="space-y-6 w-full">

      {/* PROGRESS CARD */}
      <Card className="border bg-card/50 shadow-lg w-full">
        <CardContent className="px-4 sm:px-5 py-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{answeredCount} answered</span>
          </div>
          <Progress
            value={(answeredCount / totalQuestions) * 100}
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* QUESTION CARD */}
      <Card className="border bg-card/50 shadow-2xl w-full max-h-[85vh] sm:max-h-[88vh] overflow-y-auto">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-accent/10 border">
                <span className="text-xs font-bold text-pink-700">{currentQuestionIndex + 1}</span>
              </div>
              <CardTitle className="text-lg sm:text-xl">{currentQuestion.question}</CardTitle>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm ml-10">
              {quiz.fileName || 'Quiz'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 space-y-6">

          {/* OPTIONS */}
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleAnswerSelect(key)}
                disabled={isAnswered}
                className={`text-left p-3 sm:p-4 rounded-lg border-2 transition-all ${getOptionColor(key)} 
                  ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border-2">
                    {userAnswer === key && key === currentQuestion.correct_answer && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {userAnswer === key && key !== currentQuestion.correct_answer && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    {!isAnswered && (
                      <span className="text-xs font-semibold text-slate-300">
                        {key}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base">{value}</p>
                </div>
              </button>
            ))}
          </div>

          {/* FEEDBACK */}
          {showFeedback && isAnswered && (
            <div
              className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                isCorrect
                  ? 'bg-green-900/20 border-green-600'
                  : 'bg-red-900/20 border-red-700'
              }`}
            >
              <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-500'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
              <p className="text-xs sm:text-sm mt-1 text-muted-foreground">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">

            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="w-full sm:flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={answeredCount !== totalQuestions}
                className="w-full sm:flex-1 bg-linear-to-br from-pink-600 to-orange-700"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isAnswered}
                className="w-full sm:flex-1 bg-linear-to-r from-pink-600 to-pink-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------- RESULTS VIEW ---------------- //

function QuizResultsView({ quiz, score, userAnswers, onRestart }: any) {
  const totalQuestions = quiz.totalQuestions || quiz.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  const wrong = totalQuestions - score;

  return (
    <div className="space-y-6 w-full">

      {/* SCORE CARD */}
      <Card className="border bg-card/50 shadow-2xl w-full">
        <CardContent className="p-4 sm:p-6">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <p className="text-xs text-muted-foreground">QUIZ RESULTS</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">{quiz.fileName || 'Quiz'}</h2>
            </div>
            <div className="text-5xl mt-3 sm:mt-0">🎯</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-2xl sm:text-3xl font-bold">{score}/{totalQuestions}</p>
            </div>
            <div className="bg-card border p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">Percentage</p>
              <p className="text-2xl sm:text-3xl font-bold">{percentage}%</p>
            </div>
            <div className="bg-card border p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">{score}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
              <p className="text-green-400 text-sm font-semibold">Correct</p>
              <p className="text-2xl font-bold">{score}</p>
            </div>
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <p className="text-red-400 text-sm font-semibold">Wrong</p>
              <p className="text-2xl font-bold">{wrong}</p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* REVIEW */}
      <Card className="border bg-card/40 shadow-lg w-full">
        <CardHeader>
          <CardTitle>Answer Review</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto px-4 sm:px-6">
          {quiz.questions.map((q: Question, i: number) => {
            const userAns = userAnswers[i];
            const right = userAns === q.correct_answer;

            return (
              <div
                key={i}
                className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                  right
                    ? 'bg-green-900/10 border-green-600'
                    : 'bg-red-900/10 border-red-600'
                }`}
              >
                <p className="font-semibold text-sm">Q{i + 1}: {q.question}</p>
                <p className="text-xs mt-1">
                  Your answer: {userAns ? `${userAns} - ${q.options[userAns as keyof typeof q.options]}` : 'Not answered'}
                </p>
                {!right && (
                  <p className="text-xs mt-1 text-green-400">
                    Correct: {q.correct_answer} - {q.options[q.correct_answer as keyof typeof q.options]}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* RESTART BUTTON */}
      <Button
        onClick={onRestart}
        className="w-full bg-linear-to-r from-pink-600 to-orange-700 h-12 font-semibold text-white"
      >
        <RotateCcw className="mr-2 w-4 h-4" /> Restart Quiz
      </Button>
    </div>
  );
}

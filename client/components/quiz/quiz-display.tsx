'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, ChevronLeft, ChevronRight, CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress"

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

interface QuizDisplayProps {
  quiz: {
    questions: Question[];
    fileName?: string;
    totalQuestions?: number;
  };
  onRestart: () => void;
  source: 'text' | 'pdf' | 'youtube';
}

export default function QuizDisplay({ quiz, onRestart, source }: QuizDisplayProps) {
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
    if (!showResults && !isAnswered) {
      setUserAnswers({
        ...userAnswers,
        [currentQuestionIndex]: answer
      });
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
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (userAnswers[index] === q.correct_answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const handleRestart = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowFeedback(false);
    onRestart();
  };

  if (showResults) {
    return <QuizResultsView quiz={quiz} score={score} userAnswers={userAnswers} onRestart={handleRestart} />;
  }

  const getOptionColor = (optionKey: string) => {
    if (!isAnswered) {
      return 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700';
    }

    if (optionKey === currentQuestion.correct_answer) {
      return 'border-green-500 bg-green-900/30';
    }

    if (optionKey === userAnswer && userAnswer !== currentQuestion.correct_answer) {
      return 'border-red-500 bg-red-900/30';
    }

    return 'border-slate-600 bg-slate-700/50 opacity-50';
  };

  const getProgressBarColor = () => {
    const percent = (answeredCount / totalQuestions) * 100;
    if (percent < 50) return 'bg-red-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <Card className="border border-slate-700 bg-slate-800/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-300">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h3>
            <span className="text-sm text-slate-400">
              {answeredCount} answered
            </span>
          </div>
          <Progress
            value={(answeredCount / totalQuestions) * 100}
            className={`h-2 ${getProgressBarColor()}`}
          />
        </CardContent>
      </Card>

      {/* Quiz Card */}
      <Card className="border border-slate-700 bg-linear-to-br from-slate-800 to-slate-900 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500">
                <span className="text-xs font-bold text-blue-400">{currentQuestionIndex + 1}</span>
              </div>
              <CardTitle className="text-xl text-slate-100">{currentQuestion.question}</CardTitle>
            </div>
            <p className="text-slate-500 text-sm ml-10">{quiz.fileName || 'Quiz'}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              const isSelected = userAnswer === key;
              const isCorrectAnswer = key === currentQuestion.correct_answer;
              const shouldShowCorrect = isAnswered && isCorrectAnswer;
              const shouldShowWrong = isAnswered && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(key)}
                  disabled={isAnswered}
                  className={`text-left p-4 rounded-lg border-2 transition-all transform hover:scale-102 ${getOptionColor(key)} ${
                    isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${
                        shouldShowCorrect
                          ? 'bg-green-500/20 border-green-500'
                          : shouldShowWrong
                          ? 'bg-red-500/20 border-red-500'
                          : 'border-slate-500'
                      }`}
                    >
                      {shouldShowCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {shouldShowWrong && <XCircle className="w-5 h-5 text-red-400" />}
                      {!shouldShowCorrect && !shouldShowWrong && (
                        <span className="text-sm font-semibold text-slate-400">{key}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200">{value}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback Section */}
          {showFeedback && isAnswered && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                isCorrect
                  ? 'bg-green-900/20 border-green-500'
                  : 'bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-slate-300 text-sm mt-1">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex-1 bg-slate-700 border-slate-600 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={answeredCount !== totalQuestions}
                className="flex-1 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <TrendingUp className="h-4 w-4 mr-2" /> Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isAnswered}
                className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Results Component
function QuizResultsView({ quiz, score, userAnswers, onRestart }: any) {
  const totalQuestions = quiz.totalQuestions || quiz.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const wrongAnswers = totalQuestions - score;

  const getResultGrade = () => {
    if (percentage === 100) return { label: 'Perfect!', color: 'text-green-400', icon: '🌟' };
    if (percentage >= 80) return { label: 'Excellent!', color: 'text-green-400', icon: '🎉' };
    if (percentage >= 60) return { label: 'Good!', color: 'text-yellow-400', icon: '👍' };
    if (percentage >= 40) return { label: 'Fair', color: 'text-orange-400', icon: '📚' };
    return { label: 'Keep Learning', color: 'text-red-400', icon: '💪' };
  };

  const result = getResultGrade();

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="border border-slate-700 bg-linear-to-br from-slate-800 to-slate-900 shadow-2xl overflow-hidden">
        <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-slate-400 text-sm font-semibold">QUIZ RESULTS</p>
              <h2 className="text-3xl font-bold text-slate-100 mt-1">{quiz.fileName || 'Quiz'}</h2>
            </div>
            <div className="text-5xl">{result.icon}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Score */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
              <p className="text-blue-400 text-xs font-semibold uppercase">Score</p>
              <p className="text-3xl font-bold text-blue-300 mt-2">
                {score}/{totalQuestions}
              </p>
            </div>

            {/* Percentage */}
            <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
              <p className="text-purple-400 text-xs font-semibold uppercase">Percentage</p>
              <p className="text-3xl font-bold text-purple-300 mt-2">{percentage}%</p>
            </div>

            {/* Grade */}
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase">Grade</p>
              <p className={`text-2xl font-bold ${result.color} mt-2`}>{result.label}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Performance</span>
              <span className="text-sm font-semibold text-slate-300">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500`}
                data-percentage={percentage}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-green-900/20 border border-green-700/30 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
              <div>
                <p className="text-green-400 text-xs font-semibold">Correct</p>
                <p className="text-2xl font-bold text-green-300">{score}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-red-900/20 border border-red-700/30 rounded-lg p-3">
              <XCircle className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <p className="text-red-400 text-xs font-semibold">Wrong</p>
                <p className="text-2xl font-bold text-red-300">{wrongAnswers}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Section */}
      <Card className="border border-slate-700 bg-slate-800/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Answer Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {quiz.questions.map((q: Question, index: number) => {
            const userAns = userAnswers[index];
            const isRight = userAns === q.correct_answer;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-lg border-l-4 ${
                  isRight
                    ? 'bg-green-900/10 border-green-500'
                    : 'bg-red-900/10 border-red-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isRight ? (
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-200 text-sm">Question {index + 1}: {q.question}</p>
                    <div className="mt-2 space-y-1 text-xs">
                      <p className="text-slate-400">
                        <span className="text-slate-500">Your answer:</span> {userAns ? `${userAns} - ${q.options[userAns as keyof typeof q.options]}` : 'Not answered'}
                      </p>
                      {!isRight && (
                        <p className="text-green-400">
                          <span className="text-slate-400">Correct:</span> {q.correct_answer} - {q.options[q.correct_answer as keyof typeof q.options]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onRestart}
          className="flex-1 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 h-12 font-semibold"
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Take Quiz Again
        </Button>
      </div>
    </div>
  );
}

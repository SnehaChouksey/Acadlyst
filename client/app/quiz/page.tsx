'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Type, Youtube } from 'lucide-react';
import TextQuizTab from '@/components/quiz/text-quiz-tab';
import PdfQuizTab from '@/components/quiz/pdf-quiz-tab';
import YoutubeQuizTab from '@/components/quiz/youtube-quiz-tab'; // NEW

export default function QuizGeneratorPage() {
  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-5xl mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Quiz Generator</h1>
        <p className="text-slate-400 text-base">
          Test your knowledge with AI-generated quizzes from your preferred source
        </p>
      </div>

      <div className="w-full max-w-5xl">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6 bg-slate-700">
            <TabsTrigger value="text" className="data-[state=active]:bg-blue-600 flex items-center gap-2">
              <Type className="h-4 w-4" /> Text
            </TabsTrigger>
            <TabsTrigger value="pdf" className="data-[state=active]:bg-purple-600 flex items-center gap-2">
              <FileText className="h-4 w-4" /> PDF/Doc
            </TabsTrigger>
            <TabsTrigger value="youtube" className="data-[state=active]:bg-red-600 flex items-center gap-2">
              <Youtube className="h-4 w-4" /> YouTube
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <TextQuizTab />
          </TabsContent>

          <TabsContent value="pdf">
            <PdfQuizTab />
          </TabsContent>

          <TabsContent value="youtube">
            <YoutubeQuizTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

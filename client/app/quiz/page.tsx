'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, FileText, Type, Youtube } from 'lucide-react';
import TextQuizTab from '@/components/quiz/text-quiz-tab';
import PdfQuizTab from '@/components/quiz/pdf-quiz-tab';
import YoutubeQuizTab from '@/components/quiz/youtube-quiz-tab'; 
import { FeatureNavbar } from '@/components/ui/featureNavbar';
import Sidebar from '@/components/sidebar';


export default function QuizGeneratorPage() {
  return (
    <>
    <FeatureNavbar/>
    <Sidebar/>
    <div className="flex flex-col items-center min-h-screen px-4 py-5 bg-background mt-15">
      <div className="w-full max-w-5xl mb-4">
        <h1 className="text-4xl font-bold mb-1">AI Quiz Generator</h1>
        <p className="text-muted-foreground text-base">
        
          Test your knowledge with Acadlyst's AI-generated quizzes from your preferred source
        </p>
      </div>

      <div className="w-full max-w-5xl">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-2 ">
            <TabsTrigger value="text">
              <Type className="h-4 w-4" /> Text
            </TabsTrigger>
            <TabsTrigger value="pdf">
              <FileText className="h-4 w-4" /> PDF/Doc
            </TabsTrigger>
            <TabsTrigger value="youtube">
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
    </>
  );
}

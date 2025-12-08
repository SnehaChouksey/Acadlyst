"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText, Type } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import TextQuizTab from "@/components/quiz/text-quiz-tab";
import PdfQuizTab from "@/components/quiz/pdf-quiz-tab";
import YoutubeQuizTab from "@/components/quiz/youtube-quiz-tab";
import { FeatureNavbar } from "@/components/ui/featureNavbar";
import Sidebar from "@/components/sidebar";

export default function QuizGeneratorPage() {
  const [openSidebar, setOpenSidebar] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

const [isMounted, setIsMounted] = React.useState(false);
React.useEffect(() => {
  setIsMounted(true);
}, []);

const sourceParam = isMounted ? searchParams.get("source") : null;
const initialTab =
  sourceParam === "pdf" || sourceParam === "youtube" || sourceParam === "text"
    ? sourceParam
    : "text";

const [activeTab, setActiveTab] = React.useState(initialTab);

React.useEffect(() => {
  if (!isMounted) return;
  if (!sourceParam) return;
  if (
    (sourceParam === "text" ||
      sourceParam === "pdf" ||
      sourceParam === "youtube") &&
    sourceParam !== activeTab
  ) {
    setActiveTab(sourceParam);
  }
}, [sourceParam, isMounted]);

  const handleTabChange = (value: string) => {
  if (!isMounted) return;
  setActiveTab(value as "text" | "pdf" | "youtube");
  const params = new URLSearchParams(searchParams.toString());
  params.set("source", value);
  router.replace(`/quiz?${params.toString()}`);
};

  return (
    <>
      <FeatureNavbar onOpenSidebar={() => setOpenSidebar(true)} />
      <Sidebar open={openSidebar} setOpen={setOpenSidebar} />

      <div className="flex flex-col items-center min-h-screen px-4 py-5 bg-background mt-16 md:ml-60">
        <div className="w-full max-w-5xl mb-4">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Brain className="h-10 w-10 text-pink-700" />
            <h1 className="text-4xl font-bold mb-1">AI Quiz Generator</h1>
          </div>
          <p className="text-muted-foreground text-base">
            Test your knowledge with Acadlyst&apos;s AI-generated quizzes from your preferred source
          </p>
        </div>

        <div className="w-full max-w-5xl">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-2">
              <TabsTrigger value="text">
                <Type className="h-4 w-4" /> Text
              </TabsTrigger>
              <TabsTrigger value="pdf">
                <FileText className="h-4 w-4" /> PDF/Doc
              </TabsTrigger>
              <TabsTrigger value="youtube">
                <FaYoutube className="h-4 w-4" /> YouTube
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

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import FileUploadComponent from '@/components/file-upload';
import { Download, RefreshCcw, FileText, Copy, Check } from 'lucide-react';

interface SummaryResponse {
  key_points: string[];
  summary: string;
  fileName?: string;
}

export default function SummarizerPage() {
  const [tab, setTab] = React.useState('pdf');
  const [summary, setSummary] = React.useState<SummaryResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleFileUpload = async (data: { file: File; response: any }) => {
    try {
      setLoading(true);
      setSummary(null);

      const formData = new FormData();
      formData.append('pdf', data.file);

      const res = await fetch('http://localhost:8000/summarizer/pdf', {
        method: 'POST',
        body: formData,
      });

      const uploadResponse = await res.json();
      console.log("Upload response:", uploadResponse);
      
      if (uploadResponse.jobId) {
        pollJobStatus(uploadResponse.jobId);
      }

    } catch (error) {
      console.error('❌ Summary Error:', error);
      alert('Error generating summary. Please try again.');
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const res = await fetch(`http://localhost:8000/summarizer/status/${jobId}`);
        const data = await res.json();

        console.log(`Poll attempt ${attempts}: Status = ${data.status}`);

        if (data.status === 'completed' && data.summary && data.key_points) {
          clearInterval(interval);
          
          // ✅ SET SUMMARY WITH CLEAN DATA
          setSummary({
            summary: data.summary,
            key_points: data.key_points,
            fileName: data.fileName
          });
          
          console.log("✅ Summary received:", data);
          setLoading(false);
        } else if (data.status === 'failed' || attempts >= maxAttempts) {
          clearInterval(interval);
          alert('Summary generation failed or timed out.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 1000);
  };

  const handleDownload = () => {
    if (!summary) return;
    
    const content = `DOCUMENT: ${summary.fileName}\n\n=== SUMMARY ===\n${summary.summary}\n\n=== KEY POINTS ===\n${summary.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${summary.fileName?.replace('.pdf', '') || 'document'}.txt`;
    a.click();
  };

  const handleCopy = () => {
    const text = `${summary?.summary}\n\nKey Points:\n${summary?.key_points?.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground">
      <div className="w-full max-w-4xl mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
          <FileText className="h-10 w-10 text-blue-400" />
          AI Summarizer
        </h1>
        <p className="text-slate-400 text-base">
          Transform lengthy documents into concise, actionable summaries.
        </p>
      </div>

      <Card className="w-full max-w-4xl border border-slate-700 bg-slate-800 shadow-2xl">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4 bg-slate-700">
            <TabsTrigger value="pdf" className="data-[state=active]:bg-blue-600">
              Document / PDF
            </TabsTrigger>
            <TabsTrigger value="video" disabled className="opacity-50">
              YouTube Video (Coming soon)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="px-6 pb-6">
            {/* UPLOAD STATE */}
            {!summary && !loading && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-12 bg-slate-700/30">
                <FileUploadComponent onUploaded={handleFileUpload} />
              </div>
            )}

            {/* LOADING STATE */}
            {loading && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-slate-300">📌 Key Points</h3>
                  <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-40 bg-slate-600" />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-slate-300">📄 Summary</h3>
                  <Skeleton className="h-40 w-full bg-slate-600" />
                </div>
                <p className="text-center text-slate-400 text-sm">⏳ Analyzing document...</p>
              </div>
            )}

            {/* RESULTS STATE */}
            {summary && !loading && (
              <div className="space-y-6">
                {/* HEADER WITH ACTIONS */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{summary.fileName?.replace('.pdf', '')}</h2>
                    <p className="text-slate-400 text-sm mt-1">PDF Document Summary</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleCopy}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleDownload}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setSummary(null)}
                      className="bg-slate-700 hover:bg-slate-600"
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" /> New
                    </Button>
                  </div>
                </div>

                {/* KEY POINTS BOX */}
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-blue-300 mb-4">📌 Key Points</h3>
                  <div className="space-y-2">
                    {summary.key_points && summary.key_points.length > 0 ? (
                      summary.key_points.map((point, i) => (
                        <div key={i} className="flex gap-3 text-slate-200">
                          <span className="font-bold text-blue-400 min-w-6">{i + 1}.</span>
                          <span>{point}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No key points available</p>
                    )}
                  </div>
                </div>

                {/* SUMMARY BOX */}
                <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-slate-200 mb-4">📄 Summary</h3>
                  <p className="text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
                    {summary.summary}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

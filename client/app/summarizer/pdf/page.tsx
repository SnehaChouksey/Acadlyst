'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import FileUploadComponent from '@/components/file-upload';
import { Download, RefreshCcw, FileText, Copy, Check, Youtube } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";
import UpgradeModal from "@/components/upgrade-modal";

interface SummaryResponse {
  key_points: string[];
  summary: string;
  fileName?: string;
}

export default function SummarizerPage() {
  const { userId } = useAuth(); 
  console.log("My Clerk ID:", userId);
  const [tab, setTab] = React.useState('pdf');
  const [summary, setSummary] = React.useState<SummaryResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [youtubeUrl, setYoutubeUrl] = React.useState('');
  const [error, setError] = React.useState('');
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  

  const handleFileUpload = async (data: { file: File; response: any }) => {
    try {
      setLoading(true);
      setSummary(null);
      setError('');

      const formData = new FormData();
      formData.append('pdf', data.file);

      const res = await fetch('http://localhost:8000/summarizer/pdf', {
        method: 'POST',
        headers: {
         'x-clerk-id': userId || '',
        },
        body: formData,
      });

      if (res.status === 403) {
        // Out of credits
        setShowUpgrade(true);
        return;
      }

      const uploadResponse = await res.json();
      console.log("Upload response:", uploadResponse);
      
      if (uploadResponse.jobId) {
        pollJobStatus(uploadResponse.jobId);
      }

    } catch (error) {
      console.error('Summary Error:', error);
      alert('Error generating summary. Please try again.');
      setLoading(false);
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) {
      setError('Please paste a YouTube URL');
      return;
    }
       // Validate URL format
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
       setError('Please paste a valid YouTube URL');
       return;
    }

    try {
      setLoading(true);
      setSummary(null);
      setError('');

      const res = await fetch('http://localhost:8000/summarizer/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                     'x-clerk-id': userId || '',
         },
        body: JSON.stringify({ url: youtubeUrl })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error generating summary');
        setLoading(false);
        return;
      }

      if (data.jobId) {
        pollJobStatus(data.jobId);
      }

    } catch (error) {
      console.error('YouTube Summary Error:', error);
      setError('Error generating summary. Please try again.');
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
          
          setSummary({
            summary: data.summary,
            key_points: data.key_points,
            fileName: data.fileName
          });
          
          console.log("Summary received:", data);
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

  const handleRestart = () => {
    setSummary(null);
    setYoutubeUrl('');
    setError('');
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
            <TabsTrigger value="video" className="data-[state=active]:bg-red-600 flex items-center gap-2">
              <Youtube className="h-4 w-4" /> YouTube Video
            </TabsTrigger>
          </TabsList>

          {/* PDF TAB */}
          <TabsContent value="pdf" className="px-6 pb-6">
            {!summary && !loading && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-12 bg-slate-700/30">
                <FileUploadComponent onUploaded={handleFileUpload} />
              </div>
            )}

            {loading && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-slate-300">Key Points</h3>
                  <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-40 bg-slate-600" />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-slate-300">Summary</h3>
                  <Skeleton className="h-40 w-full bg-slate-600" />
                </div>
                <p className="text-center text-slate-400 text-sm">Analyzing document...</p>
              </div>
            )}

            {summary && !loading && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{summary.fileName?.replace('.pdf', '')}</h2>
                    <p className="text-slate-400 text-sm mt-1">PDF Document Summary</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCopy} className="bg-blue-600 hover:bg-blue-700">
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button size="sm" onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button size="sm" onClick={handleRestart} className="bg-slate-700 hover:bg-slate-600">
                      <RefreshCcw className="h-4 w-4 mr-1" /> New
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-blue-300 mb-4">Key Points</h3>
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

                <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-slate-200 mb-4">Summary</h3>
                  <p className="text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
                    {summary.summary}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* YOUTUBE TAB */}
          <TabsContent value="video" className="px-6 pb-6">
            {!summary && !loading && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Youtube className="h-5 w-5 text-red-500" />
                  <label className="text-sm font-semibold text-slate-300">YouTube Video URL</label>
                </div>

                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setError('');
                  }}
                  placeholder="Paste YouTube link (e.g., https://www.youtube.com/watch?v=...)"
                  className="w-full p-3 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:outline-none focus:border-red-500"
                />

                {error && (
                <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm space-y-2">
                <p className="font-semibold">Error generating summary:</p>
                <p>{error}</p>
                <p className="text-xs text-red-400 mt-2">
                 💡 Tip: Make sure the YouTube video has captions/subtitles enabled. Try a different video if this one doesn't work.
                </p>
                 </div>
            )}

                <Button
                  onClick={handleYoutubeSubmit}
                  disabled={!youtubeUrl.trim() || loading}
                  className="w-full bg-red-600 hover:bg-red-700 h-12 text-base font-semibold"
                >
                  Generate Summary from Video
                </Button>
              </div>
            )}

            {loading && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-slate-300">Key Points</h3>
                  <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-40 bg-slate-600" />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-slate-300">Summary</h3>
                  <Skeleton className="h-40 w-full bg-slate-600" />
                </div>
                <p className="text-center text-slate-400 text-sm">Fetching transcript and generating summary...</p>
              </div>
            )}

            {summary && !loading && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{summary.fileName || 'YouTube Video'}</h2>
                    <p className="text-slate-400 text-sm mt-1">Video Summary</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCopy} className="bg-blue-600 hover:bg-blue-700">
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button size="sm" onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button size="sm" onClick={handleRestart} className="bg-slate-700 hover:bg-slate-600">
                      <RefreshCcw className="h-4 w-4 mr-1" /> New
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-blue-300 mb-4">Key Points</h3>
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

                <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-slate-200 mb-4">Summary</h3>
                  <p className="text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
                    {summary.summary}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
        <UpgradeModal 
        open={showUpgrade} 
        onClose={() => setShowUpgrade(false)}
        feature="summarizer"
      />
    </div>
  );
}

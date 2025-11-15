'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import FileUploadComponent from '@/components/file-upload';
import { Download, RefreshCcw, FileText, Copy, Check, Youtube } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";
import UpgradeModal from "@/components/upgrade-modal";
import Sidebar from '@/components/sidebar';
import { FeatureNavbar } from '@/components/ui/featureNavbar';

interface SummaryResponse {
  key_points: string[];
  summary: string;
  fileName?: string;
}

export default function SummarizerPage() {
  const { userId } = useAuth();

  // ✅ ADDED: Mobile sidebar state
  const [openSidebar, setOpenSidebar] = React.useState(false);

  const [tab, setTab] = React.useState('pdf');
  const [pdfSummary, setPdfSummary] = React.useState<SummaryResponse | null>(null);
  const [youtubeummary, setYoutubeummary] = React.useState<SummaryResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [youtubeUrl, setYoutubeUrl] = React.useState('');
  const [error, setError] = React.useState('');
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  // -----------------------------
  //  ALL BACKEND LOGIC UNTOUCHED
  // -----------------------------

  const handleFileUpload = async (data: { file: File; response: any }) => {
    try {
      setLoading(true);
      setPdfSummary(null);
      setError('');

      const formData = new FormData();
      formData.append('pdf', data.file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/summarizer/pdf`, {
        method: 'POST',
        headers: { 'x-clerk-id': userId || '' },
        body: formData,
      });

      if (res.status === 403) {
        setShowUpgrade(true);
        return;
      }

      const uploadResponse = await res.json();
      if (uploadResponse.jobId) pollJobStatus(uploadResponse.jobId);

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
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      setError('Please paste a valid YouTube URL');
      return;
    }

    setLoading(true);
    setYoutubeummary(null);
    setError('');

    async function tryYoutubeSummary(retries = 3, delay = 1500) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/summarizer/youtube`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-id': userId || '',
          },
          body: JSON.stringify({ url: youtubeUrl }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (retries > 0) setTimeout(() => tryYoutubeSummary(retries - 1, delay), delay);
          else {
            setError(data.error || 'Error generating summary');
            setLoading(false);
          }
          return;
        }

        if (data.jobId) pollJobStatus(data.jobId);
      } catch (error) {
        if (retries > 0) setTimeout(() => tryYoutubeSummary(retries - 1, delay), delay);
        else {
          setError('Error generating summary. Please try again.');
          setLoading(false);
        }
      }
    }

    tryYoutubeSummary();
  };

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/summarizer/status/${jobId}`);
        const data = await res.json();

        if (data.status === 'completed' && data.summary && data.key_points) {
          clearInterval(interval);

          const summaryData = {
            summary: data.summary,
            key_points: data.key_points,
            fileName: data.fileName
          };

          if (tab === 'pdf') setPdfSummary(summaryData);
          else setYoutubeummary(summaryData);

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
    const currentSummary = tab === 'pdf' ? pdfSummary : youtubeummary;
    if (!currentSummary) return;

    const content =
      `DOCUMENT: ${currentSummary.fileName}\n\n` +
      `=== SUMMARY ===\n${currentSummary.summary}\n\n` +
      `=== KEY POINTS ===\n${currentSummary.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `summary-${currentSummary.fileName?.replace('.pdf', '') || 'document'}.txt`;
    a.click();
  };

  const handleCopy = () => {
    const currentSummary = tab === 'pdf' ? pdfSummary : youtubeummary;
    const text =
      `${currentSummary?.summary}\n\nKey Points:\n` +
      currentSummary?.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestart = () => {
    if (tab === 'pdf') setPdfSummary(null);
    else setYoutubeummary(null);

    setYoutubeUrl('');
    setError('');
  };

  

  return (
    <>
      
      <FeatureNavbar onOpenSidebar={() => setOpenSidebar(true)} />

      <div className="flex h-screen bg-background">
        
      
        <Sidebar open={openSidebar} setOpen={setOpenSidebar} />

    
        <div className="flex-1 flex flex-col md:ml-60 pt-16 px-4 sm:px-8 bg-background mt-4">

          <div className="w-full max-w-5xl mb-0">
            <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
              <FileText className="h-10 w-10 text-accent" />
              AI Summarizer
            </h1>
            <p className="text-slate-400 text-base">
              Transform lengthy documents into concise, actionable summaries.
            </p>
          </div>

          
          <Card className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-background bg-linear-br from-background/30 to-background/70 shadow-2xl mb-2">
            <Tabs value={tab} onValueChange={setTab} className="w-full px-6 py-3">
              
              
              <TabsList className="w-full grid grid-cols-2 gap-3 mb-4 rounded-lg p-1 max-h-12">
                <TabsTrigger value="pdf">Document / PDF</TabsTrigger>
                <TabsTrigger value="video">
                  <Youtube className="h-10 w-10" /> YouTube Video
                </TabsTrigger>
              </TabsList>

              {/* PDF CONTENT — unchanged */}
              <TabsContent value="pdf" className="flex-1 flex flex-col">

              

                {!pdfSummary && !loading && (
                  <div className="flex-1 flex flex-col justify-centre items-center border-2 border-accent rounded-xl p-37 bg-background/30">
                    <FileUploadComponent onUploaded={handleFileUpload} />
                  </div>
                )}

                {loading && tab === 'pdf' && (
                  <div className="space-y-6">
                    <Skeleton className="h-40 w-full bg-foreground/30" />
                  </div>
                )}

                {pdfSummary && !loading && (
                  <div className="space-y-6">
                    {/* unchanged */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {pdfSummary.fileName?.replace('.pdf', '')}
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">PDF Document Summary</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleCopy}>
                          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button size="sm" onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                        <Button size="sm" onClick={handleRestart} className="bg-orange-400 hover:bg-orange-500">
                          <RefreshCcw className="h-4 w-4 mr-1" /> New
                        </Button>
                      </div>
                    </div>

                    {/* summary box unchanged */}
                    <div className="bg-accent/20 border border-accent/90 rounded-lg p-6 max-h-80 overflow-y-auto">
                      <h3 className="font-bold text-lg text-foreground mb-4">Summary</h3>
                      <p className="text-foreground leading-relaxed text-base whitespace-pre-wrap mb-6">
                        {pdfSummary.summary}
                      </p>
                      <h3 className="font-bold text-lg text-foreground mb-2 mt-4">Key Points</h3>

                      {/* unchanged keypoints */}
                      <div className="space-y-2">
                        {pdfSummary.key_points?.map((point, i) => (
                          <div key={i} className="flex gap-3 text-foreground">
                            <span className="font-bold min-w-6">{i + 1}.</span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              
              <TabsContent value="video" className="flex flex-1 flex-col">
        
                {!youtubeummary && !loading && (
                  <div className="flex flex-col flex-1 justify-center items-center gap-5 px-4 md:px-40 py-18 border-2 border-accent rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Youtube className="h-15 w-15 text-red-500" />
                      <label className="text-2xl font-bold text-slate-300">YouTube Video URL</label>
                    </div>

                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => {
                        setYoutubeUrl(e.target.value);
                        setError('');
                      }}
                      placeholder="Paste YouTube link..."
                      className="w-full p-3 bg-card text-foreground border border-muted-foreground rounded-lg"
                    />

                    {error && (
                      <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm space-y-2">
                        <p className="font-semibold">{error}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleYoutubeSubmit}
                      disabled={!youtubeUrl.trim() || loading}
                      className="w-full bg-pink-600 hover:bg-pink-700 h-12 text-base font-semibold"
                    >
                      Generate Summary from Video
                    </Button>
                  </div>
                )}

                {loading && (
                  <div className="space-y-6">
                    <Skeleton className="h-40 w-full bg-foreground/30" />
                  </div>
                )}

        
                {youtubeummary && !loading && (
                  <div className="space-y-6">
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {youtubeummary.fileName || 'YouTube Video'}
                        </h2>
                        <p className="text-foreground/70 text-sm mt-1">Video Summary</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleCopy} className="bg-pink-600 hover:bg-pink-700 text-foreground">
                          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button size="sm" onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-foreground">
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                        <Button size="sm" onClick={handleRestart} className="bg-orange-400 hover:bg-orange-500 text-foreground">
                          <RefreshCcw className="h-4 w-4 mr-1" /> New
                        </Button>
                      </div>
                    </div>

                    <div className="bg-accent/20 border border-accent/90 rounded-lg p-6 max-h-80 overflow-y-auto">
                      <h3 className="font-bold text-lg text-foreground mb-4">Summary</h3>
                      <p className="text-foreground leading-relaxed text-base whitespace-pre-wrap mb-6">
                        {youtubeummary.summary}
                      </p>
                      <h3 className="font-bold text-lg text-foreground mb-2 mt-4">Key Points</h3>

                      <div className="space-y-2">
                        {youtubeummary.key_points?.map((point, i) => (
                          <div key={i} className="flex gap-3 text-foreground">
                            <span className="font-bold min-w-6">{i + 1}.</span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
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
      </div>
    </>
  );
}

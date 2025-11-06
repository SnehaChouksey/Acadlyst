'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function YoutubeQuizTab() {
  return (
    <Card className="border border-slate-700 bg-slate-800 shadow-2xl">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">YouTube Quiz Coming Soon</h3>
          <p className="text-slate-400 text-center">
            Generate quizzes from YouTube video transcripts. Feature coming in next update.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

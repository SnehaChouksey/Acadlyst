import { Innertube } from 'youtubei.js';

export async function getYouTubeTranscript(url) {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL format. Please use a valid YouTube link.');
    }

    console.log("Fetching transcript for video ID:", videoId);
    
    try {
      const youtube = await Innertube.create();
      const info = await youtube.getInfo(videoId);
      
      const transcriptData = await info.getTranscript();
      
      if (!transcriptData || !transcriptData.transcript) {
        throw new Error('This video does not have captions available. Please try a different video with captions enabled.');
      }

      const fullText = transcriptData.transcript.content.body.initial_segments
        .map(segment => segment.snippet.text)
        .join(' ');

      if (!fullText || fullText.trim().length === 0) {
        throw new Error('Could not extract text from captions.');
      }

      console.log("Transcript fetched successfully. Length:", fullText.length, "chars");
      
      return {
        text: fullText,
        videoId: videoId,
        length: fullText.length
      };
    } catch (transcriptError) {
      console.error("Transcript fetch error:", transcriptError);
      throw new Error('Could not fetch transcript. Please ensure the video has captions enabled and try again.');
    }
  } catch (error) {
    console.error("YouTube transcript error:", error);
    throw error;
  }
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

import { YoutubeTranscript } from 'youtube-transcript';

export async function getYouTubeTranscript(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL format. Please use a valid YouTube link.');
  }

  console.log("Fetching transcript for video ID:", videoId);

  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);

    if (!segments || segments.length === 0) {
      throw new Error('This video does not have captions available. Please try a different video with captions enabled.');
    }

    const fullText = segments.map(s => s.text).join(' ');

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('Could not extract text from captions.');
    }

    console.log("Transcript fetched successfully. Length:", fullText.length, "chars");

    return {
      text: fullText,
      videoId: videoId,
      length: fullText.length
    };
  } catch (error) {
    console.error("Transcript fetch error:", error);
    throw new Error('Could not fetch transcript. Please ensure the video has captions enabled and try again.');
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

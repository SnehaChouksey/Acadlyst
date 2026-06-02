import { YoutubeTranscript } from "youtube-transcript";

export async function getYouTubeTranscript(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL format. Please use a valid YouTube link.');
  }

  console.log("Fetching transcript for video ID:", videoId);

  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error('No transcript available for this video.');
    }

    const fullText = transcriptItems.map(item => item.text).join(' ');
    console.log("Transcript fetched. Length:", fullText.length, "chars");

    return {
      text: fullText,
      videoId: videoId,
      length: fullText.length
    };
  } catch (error) {
    console.error("Transcript fetch error:", error);
    throw new Error('Could not fetch transcript. Please ensure the video has captions enabled and is publicly accessible.');
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

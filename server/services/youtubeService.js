import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getYouTubeTranscript(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL format. Please use a valid YouTube link.');
  }

  console.log("Fetching transcript for video ID:", videoId);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "video/youtube",
          fileUri: `https://www.youtube.com/watch?v=${videoId}`,
        }
      },
      {
        text: "Provide a complete verbatim transcript of all spoken words in this video. Return only the transcript text with no timestamps, labels, or commentary."
      }
    ]);

    const fullText = result.response.text();

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('Could not extract transcript from this video.');
    }

    console.log("Transcript extracted via Gemini. Length:", fullText.length, "chars");

    return {
      text: fullText,
      videoId: videoId,
      length: fullText.length
    };
  } catch (error) {
    console.error("Transcript fetch error:", error);
    throw new Error('Could not fetch transcript. Please ensure the video is publicly accessible and try again.');
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

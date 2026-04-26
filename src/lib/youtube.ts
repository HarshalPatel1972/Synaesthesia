const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

export async function searchYouTube(query: string): Promise<YouTubeSearchResult[]> {
  if (!API_KEY) {
    console.error("YouTube API Key is missing");
    return [];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(
        query
      )}&key=${API_KEY}&maxResults=8&videoCategoryId=10`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch from YouTube");
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    }));
  } catch (error) {
    console.error("YouTube Search Error:", error);
    return [];
  }
}

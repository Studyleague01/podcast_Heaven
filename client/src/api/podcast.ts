import { Podcast, AudioStream, Channel, SearchResponse, FeaturedResponse, NewestResponse, StreamResponse, ChannelResponse } from '@/types/podcast';

const API_BASE_URL = 'https://backendmix-emergeny.vercel.app';

export async function searchPodcasts(query: string): Promise<SearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export async function getFeaturedPodcasts(): Promise<FeaturedResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/featured`);
    
    if (!response.ok) {
      throw new Error(`Featured podcasts fetch failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Featured podcasts error:', error);
    throw error;
  }
}

export async function getNewestPodcasts(): Promise<NewestResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/newest`);
    
    if (!response.ok) {
      throw new Error(`Newest podcasts fetch failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Newest podcasts error:', error);
    throw error;
  }
}

export async function getAudioStream(videoId: string): Promise<StreamResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/streams/${videoId}`);
    
    if (!response.ok) {
      throw new Error(`Audio stream fetch failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Audio stream error:', error);
    throw error;
  }
}

export async function getChannelInfo(channelId: string): Promise<ChannelResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/channel/${channelId}`);
    
    if (!response.ok) {
      throw new Error(`Channel info fetch failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Channel info error:', error);
    throw error;
  }
}

export async function getMoreChannelEpisodes(channelId: string, nextPageToken: string): Promise<SearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/nextpage/channel/${channelId}?nextpage=${encodeURIComponent(nextPageToken)}`);
    
    if (!response.ok) {
      throw new Error(`Channel episodes fetch failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Channel episodes error:', error);
    throw error;
  }
}

export function extractVideoIdFromUrl(url: string): string | null {
  const match = url.match(/\/watch\?v=([^&]+)/);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(url: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string {
  const videoId = extractVideoIdFromUrl(url);
  if (!videoId) return '';
  
  switch(quality) {
    case 'default': return `https://img.youtube.com/vi/${videoId}/default.jpg`; // 120x90
    case 'medium': return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; // 320x180
    case 'high': return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; // 480x360
    case 'standard': return `https://img.youtube.com/vi/${videoId}/sddefault.jpg`; // 640x480
    case 'maxres': return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`; // 1280x720
    default: return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
}

export function extractChannelIdFromUrl(url: string): string | null {
  const match = url.match(/\/channel\/([^\/]+)/);
  return match ? match[1] : null;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  } else {
    return views.toString();
  }
}

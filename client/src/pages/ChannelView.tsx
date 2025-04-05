import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getChannelInfo, getMoreChannelEpisodes, getAudioStream } from "@/api/podcast";
import PodcastCard from "@/components/PodcastCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorMessage from "@/components/ErrorMessage";
import { Podcast, AudioStream, ChannelResponse, SearchResponse } from "@/types/podcast";
import { extractVideoIdFromUrl } from "@/api/podcast";

interface ChannelViewProps {
  id: string;
  onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void;
}

const ChannelView = ({ id, onPlayPodcast }: ChannelViewProps) => {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  
  // Get channel information with proper typing
  const { data: channelData, isLoading: isChannelLoading, isError } = useQuery<ChannelResponse>({
    queryKey: [`/api/channel/${id}`],
  });
  
  const handleLoadMore = async () => {
    if (!nextPageToken) return;
    
    try {
      setIsLoading(true);
      const response = await getMoreChannelEpisodes(id, nextPageToken);
      if (response && response.items) {
        // In a real app, we would append these items to the existing list
        setNextPageToken(response.nextpage);
      }
    } catch (err) {
      setError('Failed to load more episodes');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayPodcast = async (podcast: Podcast) => {
    try {
      setIsLoading(true);
      
      // Extract videoId faster with optimized function
      const videoId = extractVideoIdFromUrl(podcast.url);
      if (!videoId) {
        throw new Error('Invalid podcast URL');
      }
      
      // Fetch stream with timeout to prevent long-running requests
      const streamPromise = getAudioStream(videoId);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 8000);
      });
      
      // Race the promises to handle timeouts
      const streamData = await Promise.race([streamPromise, timeoutPromise]) as any;
      
      if (streamData.audioStreams && streamData.audioStreams.length > 0) {
        onPlayPodcast(podcast, streamData.audioStreams[0]);
      } else {
        throw new Error('No audio streams available');
      }
    } catch (err) {
      setError('Failed to play podcast. Please try again.');
      console.error('Play podcast error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isChannelLoading) {
    return <LoadingIndicator />;
  }
  
  if (isError || !channelData) {
    return (
      <main className="flex-grow container mx-auto px-4 py-6 pb-24">
        <div className="text-center py-12">
          <span className="material-icons text-5xl mb-2 text-gray-400">error</span>
          <h2 className="text-2xl font-semibold mb-2">Channel Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the channel you're looking for.</p>
          <button 
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full shadow-md transition-colors duration-200"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }
  
  // Set the next page token if available
  if (channelData.nextpage && !nextPageToken) {
    setNextPageToken(channelData.nextpage);
  }
  
  return (
    <main className="flex-grow container mx-auto px-4 py-6 pb-24">
      <div className="flex items-center space-x-4 mb-4">
        <button 
          className="flex items-center text-primary hover:text-primary-dark"
          onClick={() => navigate('/')}
        >
          <span className="material-icons mr-1">home</span>
          Home
        </button>
        
        <button 
          className="flex items-center text-primary hover:text-primary-dark"
          onClick={() => navigate('/')}
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back
        </button>
      </div>
      
      <div className="bg-background dark:bg-background/80 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="relative h-32 md:h-48 bg-gradient-to-r from-primary-dark to-primary">
          {channelData.bannerUrl && (
            <img 
              src={channelData.bannerUrl} 
              alt={`${channelData.name} banner`}
              className="absolute w-full h-full object-cover"
            />
          )}
          <div className="absolute -bottom-12 left-6 w-24 h-24 bg-white rounded-full p-1 shadow-md">
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {channelData.avatarUrl ? (
                <img 
                  src={channelData.avatarUrl}
                  alt={channelData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-icons text-4xl text-gray-500">podcasts</span>
              )}
            </div>
          </div>
        </div>
        <div className="pt-14 pb-6 px-6">
          <h2 className="text-2xl font-medium">{channelData.name}</h2>
          <div className="flex items-center text-muted-foreground mt-1">
            <span className="material-icons text-sm mr-1">people</span>
            <span>{channelData.subscribers || 'N/A subscribers'}</span>
          </div>
          {channelData.description && (
            <p className="mt-4 text-foreground">{channelData.description}</p>
          )}
        </div>
      </div>
      
      <h3 className="text-xl font-medium mb-4">Channel Episodes</h3>
      
      {channelData.relatedStreams && channelData.relatedStreams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channelData.relatedStreams.map((podcast: Podcast, index: number) => (
            <PodcastCard 
              key={`${podcast.url}-${index}`} 
              podcast={podcast}
              onClick={() => handlePlayPodcast(podcast)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <span className="material-icons text-3xl mb-2 text-primary/70">podcasts</span>
          <p>No episodes found for this channel</p>
        </div>
      )}
      
      {nextPageToken && (
        <div className="mt-6 text-center">
          <button 
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full shadow-md transition-colors duration-200"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
      
      {isLoading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      
      {/* Additional padding at the bottom for the audio player */}
      <div className="h-32"></div>
    </main>
  );
};

export default ChannelView;

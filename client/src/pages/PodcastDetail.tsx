import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getAudioStream, extractChannelIdFromUrl, formatDuration, formatViews } from "@/api/podcast";
import PodcastCard from "@/components/PodcastCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorMessage from "@/components/ErrorMessage";
import { Podcast, AudioStream, StreamResponse } from "@/types/podcast";

interface PodcastDetailProps {
  id: string;
  onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void;
}

const PodcastDetail = ({ id, onPlayPodcast }: PodcastDetailProps) => {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [relatedEpisodes, setRelatedEpisodes] = useState<Podcast[]>([]);
  
  // Get audio stream data - using type assertion to fix TypeScript errors
  const { data: streamData, isLoading, isError } = useQuery({
    queryKey: [`/api/streams/${id}`],
  }) as { 
    data: { 
      title: string; 
      uploader: string; 
      uploaderUrl: string | null; 
      duration: number; 
      audioStreams: AudioStream[] 
    } | undefined; 
    isLoading: boolean; 
    isError: boolean 
  };
  
  useEffect(() => {
    if (isError) {
      setError('Failed to load podcast details. Please try again.');
    } else {
      setError(null);
    }
  }, [isError]);
  
  // Mock podcast data based on stream data (would normally come from a separate endpoint)
  useEffect(() => {
    if (streamData) {
      // Create a podcast object from the stream data
      setPodcast({
        type: 'stream',
        url: `/watch?v=${id}`,
        title: streamData.title,
        thumbnail: `https://pol1.piproxy.ggtyler.dev/vi/${id}?host=i.ytimg.com`,
        uploaderName: streamData.uploader,
        uploaderUrl: streamData.uploaderUrl || '',
        uploadedDate: 'Recently',
        duration: streamData.duration,
        views: 0,
        uploaderVerified: false,
        shortDescription: 'No description available',
        uploaded: Date.now() / 1000,
        uploaderAvatar: null,
        isShort: false
      });
      
      // In a real application, we would fetch related episodes from the API
      // For now, we're just creating empty placeholders
      setRelatedEpisodes([]);
    }
  }, [streamData, id]);
  
  const handlePlay = () => {
    try {
      if (podcast && streamData && streamData.audioStreams && streamData.audioStreams.length > 0) {
        // Add memory optimization by selecting the optimal audio stream
        // Based on quality and bitrate to avoid unnecessary buffering
        let optimalStream = streamData.audioStreams[0];
        
        // Find a mid-quality stream for better performance if multiple options exist
        if (streamData.audioStreams.length > 1) {
          // Sort by bitrate, ascending
          const sortedStreams = [...streamData.audioStreams].sort((a, b) => a.bitrate - b.bitrate);
          
          // Choose a stream with medium bitrate if available (for better performance)
          const midIndex = Math.floor(sortedStreams.length / 2);
          if (midIndex > 0) {
            optimalStream = sortedStreams[midIndex];
          }
        }
        
        onPlayPodcast(podcast, optimalStream);
      } else {
        setError('Failed to play podcast. No audio stream available.');
      }
    } catch (err) {
      console.error('Error while playing podcast:', err);
      setError('An error occurred while trying to play the podcast.');
    }
  };
  
  const handleViewChannel = () => {
    if (podcast) {
      const channelId = extractChannelIdFromUrl(podcast.uploaderUrl);
      if (channelId) {
        navigate(`/channel/${channelId}`);
      } else {
        setError('Channel information not available');
      }
    }
  };
  
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  if (!podcast) {
    return (
      <main className="flex-grow container mx-auto px-4 py-6 pb-24">
        <div className="text-center py-12">
          <span className="material-icons text-5xl mb-2 text-gray-400">podcasts</span>
          <h2 className="text-2xl font-semibold mb-2">Podcast Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the podcast you're looking for.</p>
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
  
  return (
    <main className="flex-grow container mx-auto px-4 py-6 pb-24">
      <div className="mb-6 flex items-center space-x-4">
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
      
      <div className="mb-6">
        <div className="bg-background dark:bg-background/80 rounded-lg shadow-md overflow-hidden">
          <div className="relative pb-[56.25%] md:pb-[40%]">
            <img 
              src={podcast.thumbnail} 
              alt={podcast.title} 
              className="absolute w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6">
            <h2 className="text-2xl font-medium mb-2">{podcast.title}</h2>
            
            <div className="flex items-center mb-4">
              <button 
                className="flex items-center text-primary font-medium hover:underline"
                onClick={handleViewChannel}
              >
                <span>{podcast.uploaderName}</span>
                {podcast.uploaderVerified && (
                  <span className="material-icons text-primary text-sm ml-1">verified</span>
                )}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <span className="material-icons text-sm mr-1">schedule</span>
                <span>{formatDuration(podcast.duration)}</span>
              </div>
              {podcast.views > 0 && (
                <div className="flex items-center">
                  <span className="material-icons text-sm mr-1">visibility</span>
                  <span>{formatViews(podcast.views)} views</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="material-icons text-sm mr-1">calendar_today</span>
                <span>{podcast.uploadedDate}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <button 
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full shadow-md transition-colors duration-200 flex items-center"
                onClick={handlePlay}
              >
                <span className="material-icons mr-2">play_arrow</span>
                Play Episode
              </button>
            </div>
            
            {podcast.shortDescription && (
              <div className="border-t border-border/20 pt-4">
                <p className="text-foreground">{podcast.shortDescription}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {relatedEpisodes.length > 0 && (
        <>
          <h3 className="text-xl font-medium mb-4">Related Episodes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedEpisodes.map((episode, index) => (
              <PodcastCard key={`${episode.url}-${index}`} podcast={episode} />
            ))}
          </div>
        </>
      )}
      
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      
      {/* Additional padding at the bottom for the audio player */}
      <div className="h-32"></div>
    </main>
  );
};

export default PodcastDetail;

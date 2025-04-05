import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedPodcasts, getNewestPodcasts, searchPodcasts, getAudioStream } from "@/api/podcast";
import PodcastCard from "@/components/PodcastCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorMessage from "@/components/ErrorMessage";
import { useSearchStore } from "@/store/index";
import { Podcast, AudioStream } from "@/types/podcast";
import { extractVideoIdFromUrl } from "@/api/podcast";
import { cn } from "@/lib/utils";

interface HomeProps {
  onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void;
}

const Home = ({ onPlayPodcast }: HomeProps) => {
  const { searchQuery } = useSearchStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Featured podcasts query - optimized to reduce unnecessary fetches
  const featuredQuery = useQuery({
    queryKey: ['featured'],
    queryFn: getFeaturedPodcasts,
    staleTime: 30 * 60 * 1000, // 30 minutes - only refetch after 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache for 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
  
  // Newest podcasts query - optimized to reduce unnecessary fetches
  const newestQuery = useQuery({
    queryKey: ['newest'],
    queryFn: getNewestPodcasts,
    staleTime: 15 * 60 * 1000, // 15 minutes - only refetch after 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
  
  // Process podcasts to eliminate duplicates between featured and newest
  // Using a more performant implementation with useMemo
  const processedFeatured = useMemo(() => {
    // Return early for better initial rendering performance
    if (!featuredQuery.data?.items) return [];
    if (!newestQuery.data?.items) return featuredQuery.data.items;
    
    // Get URLs from newest podcasts to filter out duplicates
    // Create a Set for O(1) lookup performance
    const newestUrls = new Set(newestQuery.data.items.map(podcast => podcast.url));
    
    // Create a new array only with the non-duplicate items
    // This is faster than creating a new filtered array for large datasets
    // Using a pre-allocated array when we know the max size for performance
    const result = [];
    const featuredItems = featuredQuery.data.items;
    const featuredLength = featuredItems.length;
    
    for (let i = 0; i < featuredLength; i++) {
      if (!newestUrls.has(featuredItems[i].url)) {
        result.push(featuredItems[i]);
      }
    }
    
    return result;
  }, [featuredQuery.data, newestQuery.data]);
  
  // Search results query - enabled only when there is a search query
  const searchQuery1 = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchPodcasts(searchQuery),
    enabled: !!searchQuery,
  });
  
  useEffect(() => {
    // Set error message if any query fails
    if (featuredQuery.isError) {
      setError('Failed to load featured podcasts. Please try again.');
    } else if (newestQuery.isError) {
      setError('Failed to load newest podcasts. Please try again.');
    } else if (searchQuery1.isError && searchQuery) {
      setError('Search failed. Please try again.');
    } else {
      setError(null);
    }
    
    // Set loading state
    setIsLoading(
      featuredQuery.isLoading ||
      newestQuery.isLoading ||
      (searchQuery1.isLoading && !!searchQuery)
    );
  }, [featuredQuery.isError, featuredQuery.isLoading, newestQuery.isError, newestQuery.isLoading, searchQuery1.isError, searchQuery1.isLoading, searchQuery]);
  
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
  
  return (
    <main className="flex-grow container mx-auto px-2 py-3 pb-20">
      {/* Search Results Section (only shown when there's a search query) */}
      {searchQuery && (
        <div className="mb-10">
          <h2 className="text-2xl font-medium mb-4 text-foreground">
            Search Results for "<span className="text-primary font-semibold">{searchQuery}</span>"
          </h2>
          
          {searchQuery1.isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingIndicator />
            </div>
          ) : (
            <>
              {searchQuery1.data?.items && searchQuery1.data.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {searchQuery1.data.items.map((podcast, index) => (
                    <PodcastCard 
                      key={`search-${podcast.url}-${index}`} 
                      podcast={podcast} 
                      onClick={() => handlePlayPodcast(podcast)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <span className="material-icons text-5xl mb-2">search_off</span>
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Newest Podcasts Section - Horizontally Scrollable */}
      <div className="mb-10">
        <h2 className="text-2xl font-medium mb-4 text-foreground flex items-center">
          <span className="material-icons mr-2 text-primary">whatshot</span>
          Newest Podcasts
        </h2>
        
        {newestQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingIndicator />
          </div>
        ) : (
          <>
            {newestQuery.data?.items && newestQuery.data.items.length > 0 ? (
              <div className="relative">
                <div className="overflow-x-auto pb-4 hide-scrollbar optimize-gpu" 
                     style={{ 
                       WebkitOverflowScrolling: 'touch',
                       scrollBehavior: 'smooth',
                       msOverflowStyle: 'none',
                       transform: 'translateZ(0)',
                       willChange: 'scroll-position'
                     }}>
                  <div className="flex space-x-4 px-2 optimize-gpu" 
                       style={{ 
                         minWidth: 'min-content', 
                         transform: 'translateZ(0)'
                       }}>
                    {newestQuery.data.items.map((podcast, index) => (
                      <div className="w-64 md:w-72 flex-shrink-0 optimize-gpu" 
                           key={`newest-${podcast.url}-${index}`}
                           style={{ 
                             transform: 'translateZ(0)',
                             willChange: 'transform'
                           }}>
                        <PodcastCard 
                          podcast={podcast} 
                          onClick={() => handlePlayPodcast(podcast)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className={cn(
                  "absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-full pointer-events-none optimize-gpu",
                  "bg-gradient-to-r from-background to-transparent dark:from-background/90"
                )}
                style={{ willChange: 'opacity' }}></div>
                <div className={cn(
                  "absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-full pointer-events-none optimize-gpu",
                  "bg-gradient-to-l from-background to-transparent dark:from-background/90"
                )}
                style={{ willChange: 'opacity' }}></div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <span className="material-icons text-3xl mb-2 text-primary/70">podcasts</span>
                <p>No new podcasts available</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Featured Podcasts Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-medium mb-4 text-foreground flex items-center">
          <span className="material-icons mr-2 text-primary">star</span>
          Featured Podcasts
        </h2>
        
        {featuredQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingIndicator />
          </div>
        ) : (
          <>
            {processedFeatured.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {processedFeatured.map((podcast, index) => (
                  <PodcastCard 
                    key={`featured-${podcast.url}-${index}`} 
                    podcast={podcast} 
                    onClick={() => handlePlayPodcast(podcast)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <span className="material-icons text-3xl mb-2 text-primary/70">podcasts</span>
                <p>No additional featured podcasts available</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {isLoading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      
      {/* Additional padding at the bottom for the audio player */}
      <div className="h-28"></div>
    </main>
  );
};

export default Home;

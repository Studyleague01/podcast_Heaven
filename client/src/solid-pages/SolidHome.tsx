import { createSignal, createResource, For, Show } from 'solid-js';
import type { Podcast, AudioStream } from '../types/podcast';
import { getFeaturedPodcasts, getNewestPodcasts, getAudioStream } from '../api/podcast';

type SolidHomeProps = {
  onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void;
};

export function SolidHome(props: SolidHomeProps) {
  // Resources for data fetching (like React Query but more efficient)
  const [featured] = createResource(getFeaturedPodcasts);
  const [newest] = createResource(getNewestPodcasts);
  
  // Play podcast handler
  const handlePlayPodcast = async (podcast: Podcast) => {
    try {
      if (!podcast.url) {
        console.error("Unable to play podcast: no URL provided");
        return;
      }
      
      // Show loading state
      // ...
      
      // Fetch audio stream
      const streamData = await getAudioStream(podcast.url);
      
      if (streamData && streamData.audioStreams && streamData.audioStreams.length > 0) {
        // Call parent handler to play the podcast with the first available stream
        props.onPlayPodcast(podcast, streamData.audioStreams[0]);
      } else {
        console.error("Error fetching audio stream: No streams available");
      }
    } catch (error) {
      console.error("Error playing podcast:", error);
    }
  };
  
  // Simple podcast card component
  const PodcastCard = (podcast: Podcast) => (
    <div 
      className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow border border-gray-100 dark:border-zinc-800 cursor-pointer"
      onClick={() => handlePlayPodcast(podcast)}
    >
      <div className="relative pb-[56.25%]">
        <img 
          src={podcast.thumbnail} 
          alt={podcast.title}
          className="absolute w-full h-full object-cover"
        />
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {formatDuration(podcast.duration)}
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">{podcast.title}</h3>
        
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 mb-2">
          <span className="material-icons text-xs mr-1">person</span>
          <span className="truncate">{podcast.uploaderName}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <span className="material-icons text-xs mr-1">visibility</span>
            <span>{formatViews(podcast.views)}</span>
          </div>
          <time>{podcast.uploadedDate}</time>
        </div>
      </div>
    </div>
  );
  
  // Simple formatter functions
  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  function formatViews(views: number): string {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    } else {
      return views.toString();
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Featured Podcasts Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Featured Podcasts</h2>
        
        <Show when={!featured.loading} fallback={<div className="text-center p-8">Loading featured podcasts...</div>}>
          <Show when={featured()?.podcasts?.length} fallback={<div className="text-center p-4">No featured podcasts found</div>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <For each={featured()?.podcasts}>
                {(podcast) => PodcastCard(podcast)}
              </For>
            </div>
          </Show>
        </Show>
      </section>
      
      {/* Newest Podcasts Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Newest Podcasts</h2>
        
        <Show when={!newest.loading} fallback={<div className="text-center p-8">Loading newest podcasts...</div>}>
          <Show when={newest()?.podcasts?.length} fallback={<div className="text-center p-4">No newest podcasts found</div>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <For each={newest()?.podcasts}>
                {(podcast) => PodcastCard(podcast)}
              </For>
            </div>
          </Show>
        </Show>
      </section>
    </div>
  );
}
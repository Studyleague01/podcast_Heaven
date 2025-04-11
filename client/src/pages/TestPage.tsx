import React from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import LightAudioPlayer from "@/components/LightAudioPlayer";
import SearchBar from "@/components/SearchBar";
import { Podcast, AudioStream } from "@/types/podcast";
import { formatDuration, formatViews } from "@/api/podcast";

const TestPage = () => {
  // Sample featured creators data
  const featuredCreators = [
    { id: 1, name: "Tech Talks", avatarUrl: "https://picsum.photos/id/1/200" },
    { id: 2, name: "Music Vibes", avatarUrl: "https://picsum.photos/id/2/200" },
    { id: 3, name: "Daily News", avatarUrl: "https://picsum.photos/id/3/200" },
    { id: 4, name: "Science Hour", avatarUrl: "https://picsum.photos/id/4/200" },
    { id: 5, name: "History Channel", avatarUrl: "https://picsum.photos/id/5/200" },
    { id: 6, name: "Sports Talk", avatarUrl: "https://picsum.photos/id/6/200" },
    { id: 7, name: "Food & Travel", avatarUrl: "https://picsum.photos/id/7/200" },
    { id: 8, name: "Comedy Hour", avatarUrl: "https://picsum.photos/id/8/200" },
  ];

  // Sample podcast data
  const samplePodcast: Podcast = {
    type: "stream",
    url: "/watch?v=sample123",
    title: "Test Podcast Episode - Understanding Modern Technology",
    thumbnail: "https://picsum.photos/id/1/1280/720",
    uploaderName: "Tech Talks",
    uploaderUrl: "/channel/123",
    uploadedDate: "3 days ago",
    duration: 1200, // 20 minutes
    views: 15000,
    uploaderVerified: true,
    shortDescription: "This is a sample podcast episode for testing components and layout.",
    uploaded: Date.now() / 1000 - 60 * 60 * 24 * 3, // 3 days ago
    uploaderAvatar: "https://picsum.photos/id/1/200",
    isShort: false
  };

  // Generate sample podcasts for featured and newest sections
  const generatePodcasts = (count: number, startId: number): Podcast[] => {
    return Array.from({ length: count }).map((_, index) => ({
      type: "stream",
      url: `/watch?v=sample${startId + index}`,
      title: `Podcast ${startId + index} - ${["Technology Trends", "Music Review", "Daily News Recap", "Science Exploration", "History Facts", "Sports Analysis"][index % 6]}`,
      thumbnail: `https://picsum.photos/id/${10 + index}/1280/720`,
      uploaderName: featuredCreators[index % featuredCreators.length].name,
      uploaderUrl: `/channel/${startId + index}`,
      uploadedDate: `${index % 7 + 1} days ago`,
      duration: 1200 + (index * 300), // varying durations
      views: 10000 + (index * 5000),
      uploaderVerified: index % 3 === 0,
      shortDescription: `This is podcast ${startId + index} with interesting content about ${["technology", "music", "news", "science", "history", "sports"][index % 6]}.`,
      uploaded: Date.now() / 1000 - (60 * 60 * 24 * (index % 7 + 1)),
      uploaderAvatar: featuredCreators[index % featuredCreators.length].avatarUrl,
      isShort: false
    }));
  };

  const featuredPodcasts = generatePodcasts(6, 100);
  const newestPodcasts = generatePodcasts(8, 200);

  // Sample audio stream
  const sampleAudioStream: AudioStream = {
    url: "https://example.com/sample-audio.mp3",
    quality: "medium",
    mimeType: "audio/mpeg",
    codec: "mp3",
    bitrate: 128000,
    contentLength: 15000000,
    audioQuality: "medium"
  };

  const [isPlayerVisible, setIsPlayerVisible] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
  };

  // Podcast card component for reuse
  const PodcastCard = ({ podcast }: { podcast: Podcast }) => (
    <div className="flex flex-col rounded-lg overflow-hidden elegant-card cursor-pointer">
      <div className="relative aspect-video group">
        <img 
          src={podcast.thumbnail} 
          alt={podcast.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center">
            <span className="material-icons">play_arrow</span>
          </button>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {formatDuration(podcast.duration)}
        </div>
      </div>
      <div className="p-3 bg-white dark:bg-zinc-800">
        <h3 className="font-medium text-sm mb-1 line-clamp-2">{podcast.title}</h3>
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
          <span>{podcast.uploaderName}</span>
          {podcast.uploaderVerified && <span className="material-icons text-orange-500 text-xs ml-1">verified</span>}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {formatViews(podcast.views)} views • {podcast.uploadedDate}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Regular Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold px-4 py-3 bg-gray-100 dark:bg-zinc-800">Header Component</h2>
        <Header isAuthPage={false} />
      </div>
      
      {/* Search Bar Showcase */}
      <div className="container mx-auto mb-8 px-4">
        <h2 className="text-xl font-bold mb-4">Search Bar Component</h2>
        <div className="max-w-xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full mb-12 overflow-hidden relative">
        <div className="h-[300px] md:h-[400px] w-full bg-gradient-to-r from-orange-500 to-amber-400 dark:from-zinc-800 dark:to-zinc-700 relative">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/id/43/1920/1080')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="container mx-auto px-4 h-full flex flex-col justify-center">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">Discover Amazing Podcasts</h1>
              <p className="text-lg md:text-xl text-white/90 mb-6 drop-shadow">Listen to your favorite podcasts anytime, anywhere. Cryptune brings the best audio experience to you.</p>
              <button className="px-6 py-3 bg-white text-orange-500 hover:bg-gray-100 font-medium rounded-full shadow-lg flex items-center transition-all hover:scale-105">
                <span className="material-icons mr-2">headphones</span>
                Start Listening Now
              </button>
            </div>
          </div>
          
          {/* Wave effect at bottom */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg className="relative block w-full h-12 md:h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#ffffff" className="dark:fill-zinc-900"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Featured Creators Section */}
      <div className="container mx-auto px-4 py-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="material-icons text-orange-500 mr-2">verified</span>
          Featured Creators
        </h2>
        
        <div className="overflow-x-auto hide-scrollbar pb-4">
          <div className="flex space-x-5">
            {featuredCreators.map((creator) => (
              <div key={creator.id} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-orange-500 p-0.5 flex-shrink-0 hover:scale-105 transition-transform cursor-pointer">
                  <img 
                    src={creator.avatarUrl} 
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="mt-2 text-xs md:text-sm font-medium text-center">{creator.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Podcasts Section */}
      <div className="container mx-auto px-4 py-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="material-icons text-orange-500 mr-2">stars</span>
          Featured Podcasts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {featuredPodcasts.slice(0, 4).map((podcast, index) => (
            <PodcastCard key={index} podcast={podcast} />
          ))}
        </div>
      </div>

      {/* Newest Podcasts Section */}
      <div className="container mx-auto px-4 py-6 mb-12 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="material-icons text-orange-500 mr-2">fiber_new</span>
          Newest Podcasts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newestPodcasts.slice(0, 8).map((podcast, index) => (
            <PodcastCard key={index} podcast={podcast} />
          ))}
        </div>
      </div>

      {/* Audio Player Toggles */}
      <div className="container mx-auto px-4 mb-12">
        <h2 className="text-xl font-bold mb-4">Audio Player Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Mini Player</h3>
            <button 
              onClick={() => {
                setIsPlayerVisible(true); 
                setIsPlaying(false);
              }} 
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Show Mini Player
            </button>
          </div>
          
          <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Expanded Player</h3>
            <button 
              onClick={() => {
                setIsPlayerVisible(true);
                setIsPlaying(true);
                // Force expanded view by clicking it after a short delay
                setTimeout(() => {
                  const miniPlayer = document.querySelector('.fixed.bottom-6');
                  if (miniPlayer) {
                    (miniPlayer as HTMLElement).click();
                  }
                }, 100);
              }} 
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Show Expanded Player
            </button>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="container mx-auto px-4 py-4 mb-8 text-center">
        <Link href="/">
          <a className="text-orange-500 hover:text-orange-600 flex items-center justify-center">
            <span className="material-icons mr-1">arrow_back</span>
            Back to Main App
          </a>
        </Link>
      </div>

      {/* Audio Player */}
      {isPlayerVisible && (
        <LightAudioPlayer
          podcast={samplePodcast}
          audioStream={sampleAudioStream}
          isPlaying={isPlaying}
          onTogglePlay={setIsPlaying}
          onShare={() => console.log("Share clicked")}
        />
      )}

      {/* Extra space for the player */}
      <div className="h-24"></div>
    </div>
  );
};

export default TestPage;
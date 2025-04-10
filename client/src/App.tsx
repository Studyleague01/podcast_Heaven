import { Switch, Route, useLocation, useParams } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
// Import the lightweight audio player
import LightAudioPlayer from "@/components/LightAudioPlayer";
import DirectSharePopup from "@/components/DirectSharePopup";
import Home from "@/pages/Home";
import PodcastDetail from "@/pages/PodcastDetail";
import ChannelView from "@/pages/ChannelView";
import SearchResults from "@/pages/SearchResults";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { Podcast, AudioStream } from "@/types/podcast";
import { useAudioPlayerStore, useSearchStore, useAuthStore } from "@/store/index";
import { useShareStore } from "@/lib/useShare";

// Route components for clean mounting
const HomeRoute = ({ onPlayPodcast }: { onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void }) => {
  return <Home onPlayPodcast={onPlayPodcast} />;
};

const SearchRoute = ({ onPlayPodcast }: { onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void }) => {
  const params = useParams();
  const query = params?.query ? decodeURIComponent(params.query) : '';
  return <SearchResults query={query} onPlayPodcast={onPlayPodcast} />;
};

const PodcastRoute = ({ onPlayPodcast }: { onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void }) => {
  const params = useParams();
  return <PodcastDetail id={params?.id || ''} onPlayPodcast={onPlayPodcast} />;
};

const ChannelRoute = ({ onPlayPodcast }: { onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void }) => {
  const params = useParams();
  return <ChannelView id={params?.id || ''} onPlayPodcast={onPlayPodcast} />;
};

function App() {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [audioStream, setAudioStream] = useState<AudioStream | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const { searchQuery } = useSearchStore();
  const [location, setLocation] = useLocation();
  
  // Use our global share store
  const { sharePodcast } = useShareStore();
  
  // Access the player state to load from it if needed
  const playerStore = useAudioPlayerStore();

  // Effect to initialize player from URL if provided
  useEffect(() => {
    // If we have state in the store, use it
    if (playerStore.currentPodcast && !currentPodcast) {
      setCurrentPodcast(playerStore.currentPodcast);
      setAudioStream(playerStore.audioStream);
      setIsPlaying(playerStore.isPlaying);
    }
  }, [playerStore, currentPodcast]);

  // Handle URL sharing
  useEffect(() => {
    // Check if we have sharing parameters in the URL
    const url = new URL(window.location.href);
    const shareId = url.searchParams.get('share');
    
    if (shareId) {
      // If we have a share ID, navigate to the correct content
      setLocation(`/podcast/${shareId}`);
    }
  }, [setLocation]);

  const handlePlayPodcast = (podcast: Podcast, stream: AudioStream) => {
    setCurrentPodcast(podcast);
    setAudioStream(stream);
    setIsPlaying(true);
    
    // Update the store for persistence
    playerStore.setCurrentPodcast(podcast);
    playerStore.setAudioStream(stream);
    playerStore.setIsPlaying(true);
  };

  // Handle share functionality with our new share system
  const handleShare = () => {
    if (!currentPodcast) return;

    console.log('Sharing podcast:', currentPodcast.title);
    
    // Use our sharePodcast helper from useShareStore
    sharePodcast(currentPodcast);
  };

  const { isAuthenticated } = useAuthStore();
  const [, navigate] = useLocation();
  
  // Redirect to authentication if not authenticated and not already on the auth page
  useEffect(() => {
    if (!isAuthenticated && location !== '/auth') {
      navigate('/auth');
    }
  }, [isAuthenticated, location, navigate]);
  
  // Check if the user is on the auth page
  const isAuthPage = location === '/auth';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-900">
      {/* Only show header if authenticated or if not on auth page */}
      <Header isAuthPage={isAuthPage} />
      
      {/* Main content with YouTube-like padding */}
      <div className="px-0 lg:px-4 flex-1">
        {/* Using function components for route rendering to avoid TypeScript issues */}
        <Switch>
          {isAuthenticated ? (
            <>
              <Route path="/">
                <HomeRoute onPlayPodcast={handlePlayPodcast} />
              </Route>
              <Route path="/search/:query">
                <SearchRoute onPlayPodcast={handlePlayPodcast} />
              </Route>
              <Route path="/podcast/:id">
                <PodcastRoute onPlayPodcast={handlePlayPodcast} />
              </Route>
              <Route path="/channel/:id">
                <ChannelRoute onPlayPodcast={handlePlayPodcast} />
              </Route>
            </>
          ) : null}
          
          {/* Auth route is always accessible */}
          <Route path="/auth">
            <Auth />
          </Route>
          
          <Route>
            {isAuthenticated ? <NotFound /> : <Auth />}
          </Route>
        </Switch>
      </div>
      
      {currentPodcast && isAuthenticated && (
        <LightAudioPlayer 
          podcast={currentPodcast}
          audioStream={audioStream}
          isPlaying={isPlaying}
          onTogglePlay={(state: boolean) => setIsPlaying(state)}
          onShare={handleShare}
        />
      )}
      
      <Toaster />
      
      {/* Direct Share Popup - doesn't rely on Dialog component */}
      <DirectSharePopup />
    </div>
  );
}

export default App;
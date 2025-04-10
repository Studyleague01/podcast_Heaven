import { createSignal, createEffect } from "solid-js";
import type { Podcast, AudioStream } from "./types/podcast";
import { SolidAudioPlayer } from "./solid-components/SolidAudioPlayer";
import { SolidHome } from "./solid-pages/SolidHome";
import { SolidAuth } from "./solid-pages/SolidAuth";

type AuthState = {
  isAuthenticated: boolean;
  user: {
    email: string;
    name?: string;
  } | null;
}

type AudioPlayerState = {
  currentPodcast: Podcast | null;
  audioStream: AudioStream | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isExpanded: boolean;
  sleepTimer: number | null;
  sleepTimerEndTime: number | null;
}

export function App() {
  // Authentication state
  const [authState, setAuthState] = createSignal<AuthState>({
    isAuthenticated: false,
    user: null
  });
  
  // Audio player state
  const [playerState, setPlayerState] = createSignal<AudioPlayerState>({
    currentPodcast: null,
    audioStream: null,
    isPlaying: false,
    volume: 0.8,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    isExpanded: false,
    sleepTimer: null,
    sleepTimerEndTime: null
  });
  
  // Play podcast handler
  const handlePlayPodcast = (podcast: Podcast, stream: AudioStream) => {
    setPlayerState(prev => ({
      ...prev,
      currentPodcast: podcast,
      audioStream: stream,
      isPlaying: true
    }));
  };
  
  // Login handler
  const handleLogin = (email: string, name?: string) => {
    // Setting authenticated state
    setAuthState({
      isAuthenticated: true, 
      user: { email, name }
    });
    
    // In a real app, we would store this in localStorage or a secure cookie
    console.log("User authenticated:", email);
  };
  
  // Logout handler
  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
  };
  
  // Toggle player state
  const handleTogglePlay = (isPlaying: boolean) => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying
    }));
  };
  
  // Main App render
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-900">
      {/* Main content */}
      <div className="flex-1">
        {authState().isAuthenticated ? (
          <SolidHome onPlayPodcast={handlePlayPodcast} />
        ) : (
          <SolidAuth onLogin={handleLogin} />
        )}
      </div>
      
      {/* Audio Player */}
      {playerState().currentPodcast && (
        <SolidAudioPlayer
          podcast={playerState().currentPodcast!}
          audioStream={playerState().audioStream}
          isPlaying={playerState().isPlaying}
          onTogglePlay={handleTogglePlay}
        />
      )}
    </div>
  );
}
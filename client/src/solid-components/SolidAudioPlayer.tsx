import { createSignal, createEffect, onCleanup } from 'solid-js';
import type { Podcast, AudioStream } from '../types/podcast';

// Simple YouTube thumbnail utility (avoid importing from other files)
function getYouTubeThumbnail(url: string, quality: 'default' | 'medium' | 'high' = 'medium'): string {
  // Extract video ID
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  const videoId = match ? match[1] : null;
  
  if (!videoId) {
    return url; // Return original URL if no match
  }
  
  // Return YouTube thumbnail URL based on quality
  switch (quality) {
    case 'high':
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    case 'medium':
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    case 'default':
    default:
      return `https://img.youtube.com/vi/${videoId}/default.jpg`;
  }
}

// Simple time formatter
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

type SolidAudioPlayerProps = {
  podcast: Podcast;
  audioStream: AudioStream | null;
  isPlaying: boolean;
  onTogglePlay: (isPlaying: boolean) => void;
  onShare?: () => void;
};

export function SolidAudioPlayer(props: SolidAudioPlayerProps) {
  // Local state
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [volume, setVolume] = createSignal(0.8);
  const [isMuted, setIsMuted] = createSignal(false);
  const [isExpanded, setIsExpanded] = createSignal(false);
  
  // DOM refs using functions to assign them
  let audioRef: HTMLAudioElement | undefined;
  let progressBarRef: HTMLDivElement | undefined;
  
  const setAudioRef = (el: HTMLAudioElement) => {
    audioRef = el;
  };
  
  const setProgressBarRef = (el: HTMLDivElement) => {
    progressBarRef = el;
  };
  
  // Handle audio playback
  createEffect(() => {
    if (!audioRef) return;
    
    if (props.isPlaying) {
      const playPromise = audioRef.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio playback failed:", error);
          props.onTogglePlay(false);
        });
      }
    } else {
      audioRef.pause();
    }
  });
  
  // Handle volume changes
  createEffect(() => {
    if (!audioRef) return;
    audioRef.volume = isMuted() ? 0 : volume();
  });
  
  // Clean up on component unmount
  onCleanup(() => {
    if (audioRef) {
      audioRef.pause();
    }
  });
  
  // Event handlers
  const handleTimeUpdate = () => {
    if (audioRef) {
      setCurrentTime(audioRef.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef) {
      setDuration(audioRef.duration);
    }
  };
  
  const handleProgressBarClick = (e: any) => {
    if (!progressBarRef || !audioRef) return;
    
    const rect = progressBarRef.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration();
    
    audioRef.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleVolumeChange = (e: any) => {
    const newVolume = parseFloat((e.target as HTMLInputElement).value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted());
  };
  
  // Conditional mini player
  if (!isExpanded()) {
    return (
      <>
        <audio 
          ref={setAudioRef}
          src={props.audioStream?.url || ""}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
        
        <div className="fixed bottom-4 left-0 right-0 mx-auto w-[94%] max-w-md bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-gray-200 dark:border-zinc-700 z-40">
          <div className="flex items-center p-2">
            {/* Thumbnail */}
            <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden mr-3">
              <img 
                src={getYouTubeThumbnail(props.podcast.url, 'default')} 
                alt={props.podcast.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Title and progress */}
            <div className="flex-1 min-w-0 mr-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{props.podcast.title}</h4>
              
              {/* Simple progress bar */}
              <div className="w-full mt-1 bg-gray-200 dark:bg-zinc-700 h-1.5 rounded-full cursor-pointer" 
                   ref={setProgressBarRef}
                   onClick={handleProgressBarClick}>
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${duration() ? (currentTime() / duration() * 100) : 0}%` }}
                />
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => props.onTogglePlay(!props.isPlaying)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white"
              >
                <span className="material-icons text-lg">
                  {props.isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              
              <button 
                onClick={() => setIsExpanded(true)}
                className="text-gray-500 dark:text-gray-400 p-1"
              >
                <span className="material-icons">expand_less</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Expanded player
  return (
    <>
      <audio 
        ref={setAudioRef}
        src={props.audioStream?.url || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      
      <div className="fixed inset-0 bg-white dark:bg-zinc-900 z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 dark:text-gray-400"
          >
            <span className="material-icons">keyboard_arrow_down</span>
          </button>
          <h3 className="font-medium text-gray-900 dark:text-white">Now Playing</h3>
          {props.onShare && (
            <button 
              onClick={props.onShare}
              className="text-gray-500 dark:text-gray-400"
            >
              <span className="material-icons">share</span>
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
          {/* Album art */}
          <div className="w-full max-w-xs mx-auto aspect-video rounded-lg overflow-hidden mb-6">
            <img 
              src={getYouTubeThumbnail(props.podcast.url, 'medium')}
              alt={props.podcast.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">{props.podcast.title}</h2>
          <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
            {props.podcast.uploaderName}
            {props.podcast.uploaderVerified && <span className="material-icons text-blue-500 text-sm ml-1">verified</span>}
          </p>
          
          {/* Progress */}
          <div className="w-full max-w-md mb-2 bg-gray-200 dark:bg-zinc-700 h-2 rounded-full cursor-pointer" 
               ref={setProgressBarRef}
               onClick={handleProgressBarClick}>
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${duration() ? (currentTime() / duration() * 100) : 0}%` }}
            />
          </div>
          
          {/* Time indicators */}
          <div className="w-full max-w-md flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-8">
            <span>{formatTime(currentTime())}</span>
            <span>{formatTime(duration())}</span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center space-x-6">
            <button 
              className="p-2 text-gray-800 dark:text-gray-200"
              onClick={() => {
                if (audioRef) {
                  const newTime = Math.max(0, currentTime() - 10);
                  audioRef.currentTime = newTime;
                  setCurrentTime(newTime);
                }
              }}
            >
              <span className="material-icons text-2xl">replay_10</span>
            </button>
            
            <button 
              onClick={() => props.onTogglePlay(!props.isPlaying)}
              className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center"
            >
              <span className="material-icons text-3xl">
                {props.isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            
            <button 
              className="p-2 text-gray-800 dark:text-gray-200"
              onClick={() => {
                if (audioRef) {
                  const newTime = Math.min(duration(), currentTime() + 10);
                  audioRef.currentTime = newTime;
                  setCurrentTime(newTime);
                }
              }}
            >
              <span className="material-icons text-2xl">forward_10</span>
            </button>
          </div>
          
          {/* Volume control */}
          <div className="flex items-center space-x-2 mt-8">
            <button onClick={toggleMute} className="text-gray-700 dark:text-gray-300">
              <span className="material-icons">
                {isMuted() ? 'volume_off' : volume() < 0.5 ? 'volume_down' : 'volume_up'}
              </span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted() ? 0 : volume()}
              onInput={handleVolumeChange}
              className="w-24 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </>
  );
}
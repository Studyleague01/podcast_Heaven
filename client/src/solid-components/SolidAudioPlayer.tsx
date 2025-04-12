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
  
  // Immersive Fullscreen Player with Wilson React Music Player Style
  return (
    <>
      <audio 
        ref={setAudioRef}
        src={props.audioStream?.url || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white">
        {/* Dynamic Background with Art-Based Gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30" 
          style={{ 
            backgroundImage: `url(${getYouTubeThumbnail(props.podcast.url, 'high')})`,
            filter: 'blur(180px) saturate(150%)'
          }}
        ></div>
        
        {/* Improved Overlay Gradient - more glass-like effect */}
        <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>
        
        {/* Main Content Container with Better Organization */}
        <div className="relative z-10 flex flex-col h-full max-h-screen">
          {/* Header with Better Spacing */}
          <div className="sticky top-0 py-4 px-5 flex items-center justify-between backdrop-blur-md bg-black/30">
            <div className="flex items-center">
              <button 
                onClick={() => setIsExpanded(false)}
                className="mr-4 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"
                aria-label="Close fullscreen player"
              >
                <span className="material-icons">keyboard_arrow_down</span>
              </button>
              <div>
                <h4 className="text-xs text-gray-400 font-medium">Now Playing</h4>
                <h3 className="font-medium text-white">
                  {props.podcast.title.length > 30 ? props.podcast.title.substring(0, 30) + '...' : props.podcast.title}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Volume Control Button */}
              <button 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
                onClick={toggleMute}
              >
                <span className="material-icons">
                  {isMuted() ? 'volume_off' : volume() < 0.3 ? 'volume_down' : 'volume_up'}
                </span>
              </button>
              
              {/* Share button */}
              {props.onShare && (
                <button 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  onClick={props.onShare}
                  aria-label="Share"
                >
                  <span className="material-icons">share</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area with Better Spacing and Layout */}
          <div className="flex flex-col items-center justify-between h-full py-6 px-4 overflow-hidden">
            {/* Larger Album Art Container with Better Aspect Ratio for Mobile */}
            <div className="w-full max-w-md px-4 flex-shrink-0 mb-8">
              <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] mx-auto aspect-square transform transition-transform duration-700 group">
                {/* Album Art Image */}
                <img 
                  src={getYouTubeThumbnail(props.podcast.url, 'high')}
                  alt={props.podcast.title}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Enhanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                
                {/* Playback Info with Better Typography */}
                <div className="absolute bottom-6 left-6 flex items-center text-white text-sm backdrop-blur-sm bg-black/30 px-3 py-1.5 rounded-full">
                  <span className="material-icons mr-1.5 text-orange-400 text-sm">equalizer</span>
                  <span className="font-medium tracking-wide">{formatTime(currentTime())} / {formatTime(duration())}</span>
                </div>
                
                {/* Enhanced Play Button Overlay */}
                {!props.isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      className="w-24 h-24 rounded-full bg-black/75 hover:bg-orange-500 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 border border-white/20 backdrop-blur-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onTogglePlay(true);
                      }}
                    >
                      <span className="material-icons text-5xl ml-1.5">play_arrow</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Podcast Info */}
            <div className="w-full max-w-lg text-center mb-6 px-4 flex-shrink-0">
              <h1 className="text-white text-2xl md:text-3xl font-bold mb-3 leading-tight tracking-tight">{props.podcast.title}</h1>
              <div className="flex items-center justify-center">
                <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white mr-2 shadow-md">
                  <span className="material-icons text-sm">person</span>
                </span>
                <p className="text-gray-300 text-base md:text-lg flex items-center">
                  <span>{props.podcast.uploaderName}</span>
                  {props.podcast.uploaderVerified && (
                    <span className="material-icons text-blue-400 text-sm ml-1">verified</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Controls Section with Better Position and Spacing */}
            <div className="w-full max-w-md px-4 mt-auto flex-shrink-0">
              {/* Improved Progress Controls */}
              <div className="w-full mb-8">
                {/* Progress bar */}
                <div className="w-full cursor-pointer h-1.5 bg-gray-600 rounded-full" 
                     ref={setProgressBarRef}
                     onClick={handleProgressBarClick}>
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${duration() ? (currentTime() / duration() * 100) : 0}%`,
                      background: '#f97316'
                    }}
                  />
                </div>
                
                {/* Time indicators */}
                <div className="flex justify-between text-gray-400 mt-2 text-xs font-medium">
                  <span>{formatTime(currentTime())}</span>
                  <span>{formatTime(duration())}</span>
                </div>
              </div>
              
              {/* Media Controls */}
              <div className="flex items-center justify-center w-full mb-4">
                <button 
                  className="text-gray-400 hover:text-white p-4 rounded-full transition-all duration-300 mx-3 md:mx-6"
                  onClick={() => {
                    if (audioRef) {
                      const newTime = Math.max(0, currentTime() - 15);
                      audioRef.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                >
                  <span className="material-icons text-3xl">replay_15</span>
                </button>
                
                <button 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 hover:bg-orange-500 hover:text-white transition-all duration-200"
                  onClick={() => props.onTogglePlay(!props.isPlaying)}
                >
                  <span className="material-icons text-3xl md:text-4xl ml-0.5">
                    {props.isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                
                <button 
                  className="text-gray-400 hover:text-white p-4 rounded-full transition-all duration-300 mx-3 md:mx-6"
                  onClick={() => {
                    if (audioRef) {
                      const newTime = Math.min(duration(), currentTime() + 15);
                      audioRef.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                >
                  <span className="material-icons text-3xl">forward_15</span>
                </button>
              </div>
              
              {/* Volume Slider */}
              <div className="w-full max-w-xs mx-auto flex items-center space-x-3 mb-2">
                <span className="material-icons text-gray-400 hover:text-white cursor-pointer" onClick={toggleMute}>
                  {isMuted() ? 'volume_off' : volume() < 0.3 ? 'volume_down' : 'volume_up'}
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted() ? 0 : volume()}
                  onInput={handleVolumeChange}
                  className="w-full h-1.5 appearance-none bg-gray-600 rounded-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f97316 ${(isMuted() ? 0 : volume()) * 100}%, #3d3d3d ${(isMuted() ? 0 : volume()) * 100}%)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
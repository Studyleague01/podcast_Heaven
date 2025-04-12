import { useRef, useEffect, useState, RefObject } from "react";
import { Podcast, AudioStream } from "@/types/podcast";
import { formatDuration, getYouTubeThumbnail } from "@/api/podcast";
import { useAudioPlayerStore } from "@/store/index";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  podcast: Podcast;
  audioStream: AudioStream | null;
  isPlaying: boolean;
  onTogglePlay: (isPlaying: boolean) => void;
  onShare?: () => void;
}

const AudioPlayer = ({ podcast, audioStream, isPlaying, onTogglePlay, onShare }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const expandedProgressBarRef = useRef<HTMLInputElement>(null);
  
  // Add a force refresh state to ensure component updates
  const [forceRefresh, setForceRefresh] = useState(false);
  
  // Custom toggle to force UI updates
  const handleToggleExpanded = () => {
    toggleExpanded();
    // Force component to re-render
    setForceRefresh(prev => !prev);
    console.log("Toggling fullscreen player, isExpanded:", !isExpanded);
  };
  
  const { 
    isExpanded, 
    toggleExpanded,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    sleepTimer,
    sleepTimerEndTime
  } = useAudioPlayerStore();
  
  const { 
    handleTimeUpdate,
    handleLoadedMetadata,
    handleProgressBarClick,
    handleVolumeChange,
    handleExpandedProgressBarClick
  } = useAudioPlayer({
    audioRef,
    progressBarRef,
    volumeSliderRef,
    expandedProgressBarRef,
    isPlaying,
    onTogglePlay,
    setCurrentTime,
    setDuration,
    volume,
    setVolume,
    isMuted
  });

  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (audioElement) {
      if (isPlaying) {
        audioElement.play().catch(error => {
          console.error("Audio playback failed:", error);
          onTogglePlay(false);
        });
      } else {
        audioElement.pause();
      }
    }
  }, [isPlaying, onTogglePlay]);

  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (audioElement) {
      audioElement.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // Sleep timer effect
  useEffect(() => {
    let sleepTimerInterval: number | undefined;
    
    if (sleepTimerEndTime) {
      // Set an interval to check if the sleep timer has expired
      sleepTimerInterval = window.setInterval(() => {
        const now = Date.now();
        const timeLeft = sleepTimerEndTime - now;
        
        // If timer expired, pause playback and clear the timer
        if (timeLeft <= 0) {
          if (isPlaying) {
            onTogglePlay(false);
          }
          useAudioPlayerStore.getState().clearSleepTimer();
        }
      }, 1000);
    }
    
    // Cleanup the interval when component unmounts or timer changes
    return () => {
      if (sleepTimerInterval) {
        clearInterval(sleepTimerInterval);
      }
    };
  }, [sleepTimerEndTime, isPlaying, onTogglePlay]);

  // Add an effect to force refresh when expanded state changes
  useEffect(() => {
    console.log("Player expanded state changed:", isExpanded);
    // Force a re-render when expanded state changes
    setForceRefresh(prev => !prev);
  }, [isExpanded]);

  return (
    <>
      <audio 
        ref={audioRef}
        src={audioStream?.url || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        hidden
      />
      
      {/* Immersive Fullscreen Player with Wilson React Music Player Style */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-br from-zinc-900 via-orange-900/20 to-black text-white" key={forceRefresh ? "player-1" : "player-2"}>
          {/* Dynamic Background with Art-Based Gradient */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30" 
            style={{ 
              backgroundImage: `url(${getYouTubeThumbnail(podcast.url, 'maxres')})`,
              filter: 'blur(180px) saturate(150%)'
            }}
          ></div>
          
          {/* Wilson Style Overlay Gradient - orange accent */}
          <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-b from-black/20 via-orange-900/10 to-black/70" key={forceRefresh ? "gradient-1" : "gradient-2"}></div>
          
          {/* Main Content Container with Better Organization */}
          <div className="relative z-10 flex flex-col h-full max-h-screen">
            {/* Spotify-style Header with Better Spacing */}
            <div className="sticky top-0 py-4 px-5 flex items-center justify-between backdrop-blur-md bg-black/30">
              <div className="flex items-center">
                <button 
                  onClick={handleToggleExpanded}
                  className="mr-4 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"
                  aria-label="Close fullscreen player"
                >
                  <span className="material-icons">keyboard_arrow_down</span>
                </button>
                <div>
                  <h4 className="text-xs text-gray-400 font-medium">Now Playing</h4>
                  <h3 className="font-medium text-white">
                    {podcast.title.length > 30 ? podcast.title.substring(0, 30) + '...' : podcast.title}
                  </h3>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Volume Control Button - Spotify style */}
                <button 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                >
                  <span className="material-icons">
                    {isMuted ? 'volume_off' : volume < 0.3 ? 'volume_down' : 'volume_up'}
                  </span>
                </button>
                
                {/* Sleep Timer Button - Spotify style */}
                <button 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open sleep timer menu
                    const timerMenu = document.getElementById('sleep-timer-menu');
                    if (timerMenu) {
                      timerMenu.classList.toggle('hidden');
                    }
                  }}
                >
                  <span className="material-icons">bedtime</span>
                </button>
                
                {/* Share button - Spotify style */}
                {onShare && (
                  <button 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare();
                    }}
                    aria-label="Share"
                  >
                    <span className="material-icons">share</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Spotify-style Sleep Timer Menu */}
            <div 
              id="sleep-timer-menu" 
              className="absolute top-20 right-6 bg-zinc-800/95 backdrop-blur-md rounded-xl shadow-xl z-50 p-3 hidden border border-zinc-700/50"
            >
              <h4 className="text-sm font-semibold text-white mb-2 px-2">Sleep Timer</h4>
              <div className="flex flex-col space-y-1">
                {[5, 10, 15, 30, 45, 60].map(minutes => (
                  <button 
                    key={minutes}
                    className={cn(
                      "py-2 px-4 text-left rounded-lg text-sm flex items-center justify-between",
                      sleepTimer === minutes 
                        ? "bg-orange-500/20 text-orange-400" 
                        : "text-gray-300 hover:bg-white/5"
                    )}
                    onClick={() => {
                      // Set the sleep timer
                      useAudioPlayerStore.getState().setSleepTimer(minutes);
                      // Close the menu
                      const timerMenu = document.getElementById('sleep-timer-menu');
                      if (timerMenu) {
                        timerMenu.classList.add('hidden');
                      }
                    }}
                  >
                    <span>{minutes} minutes</span>
                    {sleepTimer === minutes && (
                      <span className="material-icons text-orange-500 text-sm">check</span>
                    )}
                  </button>
                ))}
                {sleepTimer && (
                  <button 
                    className="py-2 px-4 text-left text-red-400 hover:bg-red-500/10 rounded-lg text-sm mt-2 border-t border-zinc-700/50"
                    onClick={() => {
                      // Clear the sleep timer
                      useAudioPlayerStore.getState().clearSleepTimer();
                      // Close the menu
                      const timerMenu = document.getElementById('sleep-timer-menu');
                      if (timerMenu) {
                        timerMenu.classList.add('hidden');
                      }
                    }}
                  >
                    <span className="flex items-center">
                      <span className="material-icons text-sm mr-1">close</span>
                      Cancel Timer
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area with Better Spacing and Layout */}
            <div className="flex flex-col items-center justify-between h-full py-6 px-4 overflow-hidden">
              {/* Spotify-style Sleep Timer Indicator */}
              {sleepTimer && (
                <div className="px-6 py-2 bg-white/5 rounded-full mb-8 flex items-center space-x-2 animate-pulse">
                  <span className="material-icons text-orange-500 text-sm">bedtime</span>
                  <span className="text-sm text-gray-300">
                    Sleep timer: {sleepTimer} minutes
                  </span>
                </div>
              )}
              
              {/* Larger Album Art Container with Better Aspect Ratio for Mobile */}
              <div className="w-full max-w-md px-4 flex-shrink-0 mb-8">
                <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] mx-auto aspect-square transform transition-transform duration-700 group">
                  {/* Album Art Image */}
                  <img 
                    src={getYouTubeThumbnail(podcast.url, 'maxres')}
                    alt={podcast.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = podcast.thumbnail;
                    }}
                  />
                  
                  {/* Enhanced Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  
                  {/* Playback Info with Better Typography */}
                  <div className="absolute bottom-6 left-6 flex items-center text-white text-sm backdrop-blur-sm bg-black/30 px-3 py-1.5 rounded-full">
                    <span className="material-icons mr-1.5 text-orange-400 text-sm">equalizer</span>
                    <span className="font-medium tracking-wide">{formatDuration(currentTime)} / {formatDuration(duration)}</span>
                  </div>
                  
                  {/* Enhanced Play Button Overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        className="w-24 h-24 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 border border-white/20 backdrop-blur-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePlay(true);
                        }}
                      >
                        <span className="material-icons text-5xl ml-1.5">play_arrow</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Spotify-style Podcast Info */}
              <div className="w-full max-w-lg text-center mb-6 px-4 flex-shrink-0">
                <h1 className="text-white text-2xl md:text-3xl font-bold mb-3 leading-tight tracking-tight">{podcast.title}</h1>
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white mr-2 shadow-md">
                    <span className="material-icons text-sm">person</span>
                  </span>
                  <p className="text-gray-300 text-base md:text-lg flex items-center">
                    <span>{podcast.uploaderName}</span>
                    {podcast.uploaderVerified && (
                      <span className="material-icons text-blue-400 text-sm ml-1">verified</span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Controls Section with Better Position and Spacing */}
              <div className="w-full max-w-md px-4 mt-auto flex-shrink-0">
                {/* Improved Progress Controls */}
                <div className="w-full mb-8">
                  {/* Spotify-style progress bar */}
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={currentTime}
                    step="0.1"
                    className="w-full h-1.5 cursor-pointer smooth-transition appearance-none bg-gray-600 rounded-full"
                    onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                    ref={expandedProgressBarRef as React.RefObject<HTMLInputElement>}
                    style={{
                      background: `linear-gradient(to right, #f97316 ${(currentTime / (duration || 1)) * 100}%, #3d3d3d ${(currentTime / (duration || 1)) * 100}%)`
                    }}
                  />
                  
                  {/* Spotify-style time indicators */}
                  <div className="flex justify-between text-gray-400 mt-2 text-xs font-medium">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>
                
                {/* Spotify-style Media Controls */}
                <div className="flex items-center justify-center w-full mb-4">
                  <button 
                    className="text-gray-400 hover:text-white p-4 rounded-full transition-all duration-300 mx-3 md:mx-6"
                    onClick={() => {
                      const newTime = Math.max(0, currentTime - 15);
                      if (audioRef.current) {
                        audioRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }
                    }}
                  >
                    <span className="material-icons text-3xl">replay_15</span>
                  </button>
                  
                  <button 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xl hover:scale-105 hover:bg-orange-600 transition-all duration-200"
                    onClick={() => onTogglePlay(!isPlaying)}
                  >
                    <span className="material-icons text-3xl md:text-4xl ml-0.5">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  
                  <button 
                    className="text-gray-400 hover:text-white p-4 rounded-full transition-all duration-300 mx-3 md:mx-6"
                    onClick={() => {
                      const newTime = Math.min(duration, currentTime + 15);
                      if (audioRef.current) {
                        audioRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }
                    }}
                  >
                    <span className="material-icons text-3xl">forward_15</span>
                  </button>
                </div>
                
                {/* Spotify-style Volume Slider */}
                <div className="w-full max-w-xs mx-auto flex items-center space-x-3 mb-2">
                  <span className="material-icons text-gray-400 hover:text-white cursor-pointer" onClick={toggleMute}>
                    {isMuted ? 'volume_off' : volume < 0.3 ? 'volume_down' : 'volume_up'}
                  </span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      if (newVolume > 0 && isMuted) {
                        toggleMute();
                      }
                    }}
                    className="w-full h-1.5 appearance-none bg-gray-600 rounded-full"
                    style={{
                      background: `linear-gradient(to right, #f97316 ${(isMuted ? 0 : volume) * 100}%, #3d3d3d ${(isMuted ? 0 : volume) * 100}%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mini Player with YouTube-like blur effect */}
      <div 
        className={cn(
          "fixed bottom-4 left-0 right-0 mx-auto w-[95%] max-w-sm z-50 rounded-full shadow-xl",
          "border cursor-pointer transition-all duration-300",
          "backdrop-blur-xl backdrop-saturate-180 border-gray-200/50 dark:border-zinc-700/50 text-gray-800 dark:text-gray-200",
          "bg-white/80 dark:bg-zinc-800/70 hover:shadow-2xl hover:scale-[1.02]",
          "hover:bg-white/90 dark:hover:bg-zinc-800/80",
          isExpanded && "hidden"
        )}
        style={{zIndex: 999}}
        onClick={handleToggleExpanded}
      >
        <div className="flex items-center py-2 px-4 relative">
          {/* Now Playing Info with improved layout */}
          <div className="flex items-center flex-1 mr-12">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative flex-shrink-0 shadow-sm border border-gray-200 dark:border-zinc-700">
              <img 
                src={getYouTubeThumbnail(podcast.url, 'default')}
                alt={podcast.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = podcast.thumbnail;
                }}
              />
            </div>
            <div className="overflow-hidden w-full">
              <h4 className="font-medium text-sm dark:text-gray-200">
                {podcast.title.length > 10 
                  ? podcast.title.substring(0, 10) + '...' 
                  : podcast.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{podcast.uploaderName}</p>
            </div>
          </div>
          
          {/* Play Button */}
          <div className="absolute right-4 top-1/2 translate-y-[-50%]">
            <button 
              className={cn(
                "w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center",
                "hover:bg-primary/90 transition-all shadow-md",
                isPlaying && "play-button-pulse"
              )}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                onTogglePlay(!isPlaying);
              }}
            >
              <span className="material-icons text-xl ml-0.5">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;

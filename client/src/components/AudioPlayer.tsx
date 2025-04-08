import { useRef, useEffect, RefObject } from "react";
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

  return (
    <>
      <audio 
        ref={audioRef}
        src={audioStream?.url || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        hidden
      />
      
      {/* Improved Elegant Fullscreen Player */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
          {/* Dynamic Background with Increased Blur and Gradient */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-25" 
            style={{ 
              backgroundImage: `url(${getYouTubeThumbnail(podcast.url, 'maxres')})`,
              filter: 'blur(80px) saturate(150%)'
            }}
          ></div>
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/95 to-white dark:from-zinc-900/90 dark:via-zinc-900/95 dark:to-zinc-900"></div>
          
          {/* Main Content Container - Now without overflow */}
          <div className="relative z-10 flex flex-col h-full max-h-screen">
            {/* Enhanced Topbar with Podcast Info */}
            <div className="py-4 px-6 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/70">
              <div className="flex items-center">
                <button 
                  onClick={toggleExpanded}
                  className="mr-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-200 shadow-md hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                  aria-label="Close fullscreen player"
                >
                  <span className="material-icons">keyboard_arrow_down</span>
                </button>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Now Playing</h4>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">
                    {podcast.title.length > 35 ? podcast.title.substring(0, 35) + '...' : podcast.title}
                  </h3>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Sleep Timer Button */}
                <button 
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-200 shadow-md hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
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
                
                {/* Share button in header */}
                {onShare && (
                  <button 
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-200 shadow-md hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
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
            
            {/* Sleep Timer Menu - Hidden by default */}
            <div 
              id="sleep-timer-menu" 
              className="absolute top-20 right-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg z-50 p-3 hidden"
            >
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 px-2">Sleep Timer</h4>
              <div className="flex flex-col space-y-1">
                {[5, 10, 15, 30, 45, 60].map(minutes => (
                  <button 
                    key={minutes}
                    className="py-2 px-4 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg text-sm flex items-center justify-between"
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
                    className="py-2 px-4 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
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
                    Cancel Timer
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area - Now with fixed height */}
            <div className="flex flex-col items-center h-full justify-between py-4">
              {/* Sleep Timer Indicator */}
              {sleepTimer && (
                <div className="px-6 py-2 bg-orange-500/10 dark:bg-orange-900/20 rounded-full mb-4 flex items-center space-x-2">
                  <span className="material-icons text-orange-500 text-sm">bedtime</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Sleep timer: {sleepTimer} minutes
                  </span>
                </div>
              )}
              
              {/* Album Art Container - Fixed height */}
              <div className="w-full max-w-xl px-4 flex-shrink-0">
                <div className="relative rounded-xl overflow-hidden shadow-2xl mx-auto aspect-video transform transition-transform duration-700 group">
                  {/* Album Art Image */}
                  <img 
                    src={getYouTubeThumbnail(podcast.url, 'maxres')}
                    alt={podcast.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = podcast.thumbnail;
                    }}
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  
                  {/* Playback Info in Bottom Corner */}
                  <div className="absolute bottom-4 left-4 flex items-center text-white text-sm">
                    <span className="material-icons mr-1 text-orange-400">equalizer</span>
                    <span className="font-medium tracking-wide">{formatDuration(currentTime)} / {formatDuration(duration)}</span>
                  </div>
                  
                  {/* Button Overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        className="w-24 h-24 rounded-full bg-black/75 hover:bg-primary text-white flex items-center justify-center shadow-xl transition-all transform hover:scale-110 border border-white/20 backdrop-blur-md"
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
              
              {/* Podcast Info - Fixed height */}
              <div className="w-full max-w-xl text-center mt-4 px-4 flex-shrink-0">
                <h1 className="text-gray-800 dark:text-gray-100 text-xl md:text-2xl font-bold mb-2 line-clamp-2 leading-tight tracking-tight">{podcast.title}</h1>
                <div className="flex items-center justify-center">
                  <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white mr-2">
                    <span className="material-icons text-xs">person</span>
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base flex items-center">
                    <span>{podcast.uploaderName}</span>
                    {podcast.uploaderVerified && (
                      <span className="material-icons text-orange-500 text-sm ml-1">verified</span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Controls Section - Fixed at bottom */}
              <div className="w-full max-w-xl px-4 mt-auto mb-6 flex-shrink-0">
                {/* Progress Controls with Orange Theme */}
                <div className="w-full mb-4">
                  {/* Elegant progress bar */}
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={currentTime}
                    step="0.1"
                    className="w-full h-2 cursor-pointer smooth-transition accent-orange-500"
                    onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                    ref={expandedProgressBarRef as React.RefObject<HTMLInputElement>}
                  />
                  
                  {/* Time indicators */}
                  <div className="flex justify-between text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">
                    <span>{formatDuration(currentTime)}</span>
                    <span>-{formatDuration(duration - currentTime)}</span>
                  </div>
                </div>
                
                {/* Enhanced Media Controls with Orange Theme */}
                <div className="flex items-center justify-center w-full">
                  <button 
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 p-3 rounded-full transition-all duration-300 mx-2 md:mx-6"
                    onClick={() => {
                      const newTime = Math.max(0, currentTime - 15);
                      if (audioRef.current) {
                        audioRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }
                    }}
                  >
                    <span className="material-icons text-3xl">replay_10</span>
                  </button>
                  
                  <button 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:bg-primary/90 transition-all duration-200 hover:scale-105 border border-white/10"
                    onClick={() => onTogglePlay(!isPlaying)}
                  >
                    <span className="material-icons text-3xl md:text-4xl ml-0.5">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  
                  <button 
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 p-3 rounded-full transition-all duration-300 mx-2 md:mx-6"
                    onClick={() => {
                      const newTime = Math.min(duration, currentTime + 15);
                      if (audioRef.current) {
                        audioRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }
                    }}
                  >
                    <span className="material-icons text-3xl">forward_10</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini Player with adjusted height and radius */}
      <div 
        className={cn(
          "fixed bottom-4 left-0 right-0 mx-auto w-[90%] max-w-sm z-50 rounded-full shadow-lg",
          "border cursor-pointer transition-all duration-200",
          "backdrop-blur-md backdrop-saturate-150 border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200",
          "bg-white dark:bg-zinc-800/90 hover:shadow-lg",
          isExpanded && "hidden"
        )}
        style={{zIndex: 999}}
        onClick={toggleExpanded}
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
                "w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center",
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

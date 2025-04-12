import { useRef, useEffect, useState } from "react";
import { Podcast, AudioStream } from "@/types/podcast";
import { formatDuration, getYouTubeThumbnail } from "@/api/podcast";

// Formatted: Apr 12, 2025 - Force cache update

interface LightAudioPlayerProps {
  podcast: Podcast;
  audioStream: AudioStream | null;
  isPlaying: boolean;
  onTogglePlay: (isPlaying: boolean) => void;
  onShare?: () => void;
}

const LightAudioPlayer = ({ podcast, audioStream, isPlaying, onTogglePlay, onShare }: LightAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Handle audio playback state
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

  // Handle volume changes
  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (audioElement) {
      audioElement.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Simplified mini player - keeping original style
  if (!isExpanded) {
    return (
      <>
        <audio 
          ref={audioRef}
          src={audioStream?.url || ""}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          hidden
        />
        
        <div 
          className="fixed bottom-6 left-0 right-0 mx-auto w-[85%] max-w-sm bg-black/75 backdrop-blur-lg z-40 cursor-pointer rounded-2xl shadow-xl border border-gray-800/50 overflow-hidden hover:bg-black/85 transition-all duration-300"
          onClick={toggleExpanded}
        >
          <div className="flex items-center p-2 px-3">
            {/* Thumbnail - fully circular */}
            <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden mr-3 shadow-md border border-white/10">
              <img 
                src={getYouTubeThumbnail(podcast.url, 'default')} 
                alt={podcast.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Title and artist - white text as in original */}
            <div className="flex-1 min-w-0 mr-3">
              <h4 className="text-sm font-semibold text-white truncate">{podcast.title}</h4>
              <p className="text-xs text-gray-300 truncate">{podcast.uploaderName}</p>
            </div>
            
            {/* Play/Pause button - solid orange button */}
            <div 
              onClick={(e) => {
                e.stopPropagation(); // Prevent mini-player from expanding when clicking play button
                onTogglePlay(!isPlaying);
              }}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 transition-colors text-white shadow-lg"
            >
              <span className="material-icons text-2xl">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Expanded player with clean Spotify-like style
  return (
    <>
      <audio 
        ref={audioRef}
        src={audioStream?.url || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        hidden
      />
      
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-zinc-900 text-white">
        {/* Simple low-opacity background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10" 
          style={{ 
            backgroundImage: `url(${getYouTubeThumbnail(podcast.url, 'maxres')})`,
            filter: 'blur(30px)'
          }}
        ></div>
        
        {/* Spotify-style Header with Better Spacing */}
        <div className="sticky top-0 py-4 px-5 flex items-center justify-between bg-black/10 relative z-10">
          <div className="flex items-center">
            <button 
              onClick={toggleExpanded}
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
            {/* Volume Control Button */}
            <button 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setIsMuted(!isMuted)}
            >
              <span className="material-icons">
                {isMuted ? 'volume_off' : volume < 0.3 ? 'volume_down' : 'volume_up'}
              </span>
            </button>
            
            {/* Share button */}
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
        
        {/* Spotify-style Content Layout */}
        <div className="flex-1 overflow-auto relative z-10">
          <div className="p-6 md:p-10 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
            {/* Album Art - Rectangular */}
            <div className="w-72 h-56 md:w-96 md:h-72 mx-auto relative shadow-xl mb-10 rounded-md overflow-hidden">
              <img 
                src={getYouTubeThumbnail(podcast.url, 'medium')}
                alt={podcast.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = podcast.thumbnail;
                }}
              />
            </div>
            
            {/* Clean Song Info */}
            <div className="flex flex-col items-center mb-8 w-full text-center">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{podcast.title}</h2>
              <p className="text-sm text-gray-400">
                {podcast.uploaderName}
                {podcast.uploaderVerified && <span className="material-icons text-orange-500 text-sm ml-1 align-middle">verified</span>}
              </p>
              
              {/* Enhanced progress bar */}
              <div className="w-full max-w-md mx-auto mt-8">
                <div 
                  className="w-full h-2.5 bg-white/20 cursor-pointer rounded-full overflow-hidden relative" 
                  onClick={(e) => {
                    if (audioRef.current) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      const newTime = percentage * duration;
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                >
                  {/* Orange progress fill */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  ></div>
                  
                  {/* Playhead dot */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-orange-500 border-2 border-white rounded-full shadow-md"
                    style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - 8px)` }}
                  ></div>
                </div>
              </div>
              
              {/* Time indicators */}
              <div className="w-full max-w-md mx-auto flex justify-between text-xs text-gray-400 mt-2 mb-8">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
              
              {/* Simplified Controls */}
              <div className="flex items-center justify-center space-x-6 md:space-x-8">
                <button 
                  className="p-2 text-white/80 hover:text-white transition-all"
                  onClick={() => {
                    const newTime = Math.max(0, currentTime - 10);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                >
                  <span className="material-icons text-2xl">replay_10</span>
                </button>
                
                {/* Play button with fixed circular border */}
                <div className="w-16 h-16 md:w-18 md:h-18 rounded-full border-2 border-orange-500 flex items-center justify-center">
                  <button 
                    onClick={() => onTogglePlay(!isPlaying)}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg"
                  >
                    <span className="material-icons text-3xl">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                </div>
                
                <button 
                  className="p-2 text-white/80 hover:text-white transition-all"
                  onClick={() => {
                    const newTime = Math.min(duration, currentTime + 10);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                >
                  <span className="material-icons text-2xl">forward_10</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LightAudioPlayer;
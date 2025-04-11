import { useRef, useEffect, useState } from "react";
import { Podcast, AudioStream } from "@/types/podcast";
import { formatDuration, getYouTubeThumbnail } from "@/api/podcast";

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

  // Simplified mini player
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
          className="fixed bottom-6 left-0 right-0 mx-auto w-[85%] max-w-sm bg-black/75 backdrop-blur-lg z-40 cursor-pointer rounded-full shadow-xl border border-gray-800/50 overflow-hidden hover:bg-black/85 transition-all duration-300"
          onClick={toggleExpanded}
        >
          <div className="flex items-center p-2 px-3">
            {/* Thumbnail - circular like in example */}
            <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden mr-3 shadow-md border border-white/10">
              <img 
                src={getYouTubeThumbnail(podcast.url, 'default')} 
                alt={podcast.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Title and artist - white text as in example */}
            <div className="flex-1 min-w-0 mr-3">
              <h4 className="text-sm font-semibold text-white truncate">{podcast.title}</h4>
              <p className="text-xs text-gray-300 truncate">{podcast.uploaderName}</p>
            </div>
            
            {/* Play/Pause button - smaller orange button */}
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

  // Expanded player with enhanced styling
  return (
    <>
      <audio 
        ref={audioRef}
        src={audioStream?.url || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        hidden
      />
      
      <div className="fixed inset-0 bg-gradient-to-b from-white/95 to-gray-50/95 dark:from-zinc-900/95 dark:to-black/95 backdrop-blur-md z-50 flex flex-col">
        {/* Elegant glassmorphic header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/50 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 sticky top-0 z-10">
          <button 
            onClick={toggleExpanded}
            className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/70 rounded-full transition-colors"
          >
            <span className="material-icons">keyboard_arrow_down</span>
          </button>
          
          <div className="flex flex-col items-center">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white">Now Playing</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="text-gray-900 dark:text-white">Vel</span>
              <span className="text-orange-500">in</span>
            </p>
          </div>
          
          {onShare && (
            <button 
              onClick={onShare}
              className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/70 rounded-full transition-colors"
            >
              <span className="material-icons">share</span>
            </button>
          )}
        </div>
        
        {/* Content - responsive layout with elegant spacing */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start lg:space-x-16 max-w-7xl mx-auto w-full">
            {/* Album art with elegant shadow and subtle hover effect */}
            <div className="w-full max-w-xs lg:max-w-md mx-auto lg:mx-0 aspect-video rounded-xl overflow-hidden mb-8 lg:mb-0 lg:sticky lg:top-8 elegant-card">
              <div className="relative w-full h-full group">
                <img 
                  src={getYouTubeThumbnail(podcast.url, 'medium')}
                  alt={podcast.title}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = podcast.thumbnail;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
            
            {/* Player controls and info - larger on desktop with elegant spacing */}
            <div className="flex flex-col w-full max-w-md lg:pt-4 lg:flex-1">
              {/* Channel info with avatar */}
              <div className="hidden lg:flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src={podcast.uploaderAvatar || getYouTubeThumbnail(podcast.url, 'default')} 
                    alt={podcast.uploaderName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{podcast.uploaderName}</span>
                {podcast.uploaderVerified && <span className="material-icons text-orange-500 text-sm">verified</span>}
              </div>
              
              {/* Title with elegant typography */}
              <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center lg:text-left mb-2 leading-tight">{podcast.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center lg:text-left mb-8 lg:hidden">
                {podcast.uploaderName}
                {podcast.uploaderVerified && <span className="material-icons text-orange-500 text-sm ml-1">verified</span>}
              </p>
              
              {/* YouTube-style progress bar - smoother and more elegant */}
              <div className="w-full mb-3 mt-2">
                <div className="youtube-progress-bar w-full h-2 md:h-3 cursor-pointer rounded-full overflow-hidden" 
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
                  style={{ '--progress': `${(currentTime / (duration || 1)) * 100}%` } as React.CSSProperties}
                ></div>
              </div>
              
              {/* Time indicators with improved spacing */}
              <div className="w-full flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-10">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
              
              {/* Controls - elegant and modern */}
              <div className="flex items-center justify-center lg:justify-start space-x-10 md:space-x-12">
                <button 
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all hover:scale-110"
                  onClick={() => {
                    const newTime = Math.max(0, currentTime - 10);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                >
                  <span className="material-icons text-3xl md:text-4xl">replay_10</span>
                </button>
                
                <button 
                  onClick={() => onTogglePlay(!isPlaying)}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full player-gradient-button text-white flex items-center justify-center hover:scale-105 active:scale-95"
                >
                  <span className="material-icons text-3xl md:text-4xl ml-1">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                
                <button 
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all hover:scale-110"
                  onClick={() => {
                    const newTime = Math.min(duration, currentTime + 10);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                >
                  <span className="material-icons text-3xl md:text-4xl">forward_10</span>
                </button>
              </div>
              
              {/* Additional controls */}
              <div className="hidden lg:flex justify-center lg:justify-start mt-8 space-x-6">
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                  <span className="material-icons">playlist_add</span>
                  <span className="text-sm">Add to Playlist</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                  <span className="material-icons">thumb_up_off_alt</span>
                  <span className="text-sm">Like</span>
                </button>
              </div>
              
              {/* Episode details - desktop only with elegant card */}
              <div className="hidden lg:block mt-12 pt-6 border-t border-gray-200 dark:border-zinc-800/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="material-icons text-orange-500 mr-2">info</span>
                  About this episode
                </h3>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-5 shadow-sm">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {podcast.shortDescription || 'Listen to this amazing podcast episode by ' + podcast.uploaderName + '. Share and enjoy the content on Velin.'}
                  </p>
                </div>
                
                {/* Tags section */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {['podcast', 'audio', 'music', 'entertainment'].map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LightAudioPlayer;
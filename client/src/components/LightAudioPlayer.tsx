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
          preload="metadata" 
          aria-label={`Playing ${podcast.title} by ${podcast.uploaderName}`}
          hidden
        />
        
        <section 
          className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-sm bg-black/90 backdrop-blur-lg z-40 cursor-pointer rounded-full shadow-xl border border-gray-800/50 overflow-hidden hover:bg-black/80 transition-all duration-300 transform-gpu"
          onClick={toggleExpanded}
          role="complementary"
          aria-label="Mini Player"
        >
          <div className="flex items-center p-2 px-3">
            {/* Thumbnail - circular like in example, with loading optimization */}
            <figure className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden mr-3 shadow-md border border-white/10">
              <img 
                src={getYouTubeThumbnail(podcast.url, 'default')} 
                alt=""
                loading="eager"
                width="40"
                height="40"
                className="w-full h-full object-cover"
              />
            </figure>
            
            {/* Title and artist - white text as in example */}
            <div className="flex-1 min-w-0 mr-3">
              <h4 className="text-sm font-semibold text-white truncate">{podcast.title}</h4>
              <p className="text-xs text-gray-300 truncate">{podcast.uploaderName}</p>
            </div>
            
            {/* Play/Pause button - more accessible button with aria label */}
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent mini-player from expanding when clicking play button
                onTogglePlay(!isPlaying);
              }}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors text-white shadow-lg"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <span className="material-icons text-2xl">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>
        </section>
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
        preload="metadata"
        aria-label={`Playing ${podcast.title} by ${podcast.uploaderName}`}
        hidden
      />
      
      <div className="fixed inset-0 bg-gradient-to-b from-white/95 to-gray-50/95 dark:from-zinc-900/95 dark:to-black/95 backdrop-blur-md z-50 flex flex-col player-backdrop">
        {/* Elegant glassmorphic header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/50 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 sticky top-0 z-10">
          <button 
            onClick={toggleExpanded}
            className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/70 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700"
            aria-label="Close player"
            title="Close player"
          >
            <span className="material-icons" aria-hidden="true">keyboard_arrow_down</span>
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
              className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/70 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700"
              aria-label="Share this episode"
              title="Share this episode"
            >
              <span className="material-icons" aria-hidden="true">share</span>
            </button>
          )}
        </div>
        
        {/* Content - responsive layout with elegant spacing */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start lg:space-x-16 max-w-7xl mx-auto w-full">
            {/* Album art with elegant shadow and subtle hover effect */}
            <figure className="w-full max-w-xs lg:max-w-md mx-auto lg:mx-0 aspect-video rounded-xl overflow-hidden mb-8 lg:mb-0 lg:sticky lg:top-8 elegant-card">
              <div className="relative w-full h-full group">
                <img 
                  src={getYouTubeThumbnail(podcast.url, 'medium')}
                  alt={podcast.title}
                  className="w-full h-full object-cover rounded-xl"
                  loading="eager"
                  width="480"
                  height="270"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = podcast.thumbnail;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </figure>
            
            {/* Player controls and info - larger on desktop with elegant spacing */}
            <div className="flex flex-col w-full max-w-md lg:pt-4 lg:flex-1">
              {/* Channel info with avatar */}
              <div className="hidden lg:flex items-center space-x-2 mb-4">
                <figure className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src={podcast.uploaderAvatar || getYouTubeThumbnail(podcast.url, 'default')} 
                    alt={podcast.uploaderName}
                    width="32"
                    height="32"
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </figure>
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{podcast.uploaderName}</span>
                {podcast.uploaderVerified && (
                  <span 
                    className="material-icons text-orange-500 text-sm"
                    aria-label="Verified creator"
                    role="img"
                  >
                    verified
                  </span>
                )}
              </div>
              
              {/* Title with elegant typography */}
              <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center lg:text-left mb-2 leading-tight">{podcast.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center lg:text-left mb-8 lg:hidden">
                {podcast.uploaderName}
                {podcast.uploaderVerified && (
                  <span 
                    className="material-icons text-orange-500 text-sm ml-1"
                    aria-label="Verified creator"
                    role="img"
                  >
                    verified
                  </span>
                )}
              </p>
              
              {/* YouTube-style progress bar - smoother and more elegant */}
              {/* Use native HTML5 range input for better performance and accessibility */}
              <div className="w-full mb-3 mt-2">
                <input 
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  step="0.1"
                  onChange={handleProgressChange}
                  className="w-full h-2 md:h-3 cursor-pointer accent-orange-500 rounded-full"
                  aria-label="Audio progress"
                />
              </div>
              
              {/* Time indicators with improved spacing */}
              <div className="w-full flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-10">
                <time dateTime={`PT${Math.floor(currentTime)}S`}>{formatDuration(currentTime)}</time>
                <time dateTime={`PT${Math.floor(duration)}S`}>{formatDuration(duration)}</time>
              </div>
              
              {/* Controls - elegant and modern */}
              <div className="flex items-center justify-center lg:justify-start space-x-10 md:space-x-12" role="group" aria-label="Audio player controls">
                <button 
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700 rounded-full"
                  onClick={() => {
                    const newTime = Math.max(0, currentTime - 10);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                  aria-label="Rewind 10 seconds"
                  title="Rewind 10 seconds"
                >
                  <span className="material-icons text-3xl md:text-4xl" aria-hidden="true">replay_10</span>
                </button>
                
                <button 
                  onClick={() => onTogglePlay(!isPlaying)}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full player-gradient-button text-white flex items-center justify-center hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  <span className="material-icons text-3xl md:text-4xl ml-1" aria-hidden="true">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                
                <button 
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700 rounded-full"
                  onClick={() => {
                    const newTime = Math.min(duration, currentTime + 10);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                  aria-label="Forward 10 seconds"
                  title="Forward 10 seconds"
                >
                  <span className="material-icons text-3xl md:text-4xl" aria-hidden="true">forward_10</span>
                </button>
              </div>
              
              {/* Additional controls */}
              <div className="hidden lg:flex justify-center lg:justify-start mt-8 space-x-6" role="group" aria-label="Additional controls">
                <button 
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700"
                  title="Add to Playlist"
                  aria-label="Add to Playlist"
                >
                  <span className="material-icons" aria-hidden="true">playlist_add</span>
                  <span className="text-sm">Add to Playlist</span>
                </button>
                <button 
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700"
                  title="Like"
                  aria-label="Like this episode"
                >
                  <span className="material-icons" aria-hidden="true">thumb_up_off_alt</span>
                  <span className="text-sm">Like</span>
                </button>
              </div>
              
              {/* Episode details - desktop only with elegant card */}
              <section className="hidden lg:block mt-12 pt-6 border-t border-gray-200 dark:border-zinc-800/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="material-icons text-orange-500 mr-2" aria-hidden="true">info</span>
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
                  <ul className="flex flex-wrap gap-2" aria-label="Content tags">
                    {['podcast', 'audio', 'music', 'entertainment'].map((tag, i) => (
                      <li key={i} className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LightAudioPlayer;
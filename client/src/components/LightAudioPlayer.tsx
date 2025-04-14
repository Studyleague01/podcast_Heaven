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
          className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-sm bg-zinc-900/95 backdrop-blur-2xl z-40 rounded-full shadow-xl border border-zinc-800/40 overflow-hidden transition-all duration-300 transform-gpu"
          role="complementary"
          aria-label="Mini Player"
        >
          {/* Non-transparent dark background with blur */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-900 pointer-events-none opacity-90"></div>
          
          {/* Gradient accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-transparent pointer-events-none"></div>
          
          {/* Inner glow effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-orange-500/20 via-white/10 to-orange-500/20 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center p-2 px-3">
            {/* Interactive thumbnail element */}
            <button 
              onClick={toggleExpanded}
              className="group w-10 h-10 flex-shrink-0 rounded-full overflow-hidden mr-3 shadow-md border border-zinc-700/40 relative focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              aria-label="Expand player"
            >
              <figure className="w-full h-full">
                <img 
                  src={getYouTubeThumbnail(podcast.url, 'default')} 
                  alt={podcast.title}
                  loading="eager"
                  width="40"
                  height="40"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Image overlay with gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-orange-500/30 opacity-0 group-hover:opacity-40 blur-sm transition-opacity"></div>
              </figure>
            </button>
            
            {/* Title and artist with semantic HTML */}
            <button 
              onClick={toggleExpanded}
              className="flex-1 min-w-0 mr-3 text-left group focus:outline-none focus:ring-2 focus:ring-orange-400/40 rounded px-1 -ml-1"
              aria-label="Expand player"
            >
              <h4 className="text-sm font-semibold text-white truncate drop-shadow-sm group-hover:text-orange-300 transition-colors">{podcast.title}</h4>
              <p className="text-xs text-gray-300 truncate group-hover:text-gray-200 transition-colors">{podcast.uploaderName}</p>
            </button>
            
            {/* Play/Pause button with enhanced accessibility */}
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent mini-player from expanding when clicking play button
                onTogglePlay(!isPlaying);
              }}
              className="w-11 h-11 flex items-center justify-center rounded-full player-gradient-button focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all duration-200"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <span className="material-icons text-2xl text-white drop-shadow-md">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>
          
          {/* Progress bar (mini version) */}
          <div 
            role="progressbar" 
            aria-valuenow={progressPercent} 
            aria-valuemin="0" 
            aria-valuemax="100"
            className="relative h-1 bg-zinc-800 w-full overflow-hidden"
          >
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-600 to-orange-500 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            ></div>
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
      
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-900/95 to-black/95 backdrop-blur-md z-50 flex flex-col player-backdrop">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl"></div>
          <div className="hidden md:block absolute top-1/4 left-10 w-2 h-2 bg-orange-500/70 rounded-full"></div>
          <div className="hidden md:block absolute top-1/3 right-10 w-3 h-3 bg-orange-500/50 rounded-full"></div>
          <div className="hidden md:block absolute bottom-1/4 left-1/4 w-2 h-2 bg-orange-500/60 rounded-full"></div>
        </div>
        
        {/* Enhanced glassmorphic header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-800/70 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-10 shadow-md">
          <button 
            onClick={toggleExpanded}
            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-zinc-800/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            aria-label="Close player"
            title="Close player"
          >
            <span className="material-icons" aria-hidden="true">keyboard_arrow_down</span>
          </button>
          
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-white">Now Playing</h3>
            <p className="text-xs text-gray-400">
              <span className="text-white">Cryp</span>
              <span className="text-orange-500">tune</span>
            </p>
          </div>
          
          {onShare && (
            <button 
              onClick={onShare}
              className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-zinc-800/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              aria-label="Share this episode"
              title="Share this episode"
            >
              <span className="material-icons" aria-hidden="true">share</span>
            </button>
          )}
        </div>
        
        {/* Content - improved responsive layout with better spacing */}
        <div className="flex-1 overflow-auto">
          <div className="py-12 px-6 md:p-12 flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start lg:space-x-16 max-w-7xl mx-auto w-full">
            {/* Album art with enhanced visuals */}
            <figure className="w-full max-w-xs lg:max-w-md mx-auto lg:mx-0 aspect-video rounded-xl overflow-hidden mb-12 lg:mb-0 lg:sticky lg:top-24 group transform-gpu transition-all duration-500">
              <div className="relative w-full h-full">
                {/* Animated glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500 to-orange-600 opacity-0 group-hover:opacity-70 rounded-xl blur-md transition-opacity duration-500"></div>
                
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border border-zinc-700/50 group-hover:border-orange-500/30 transition-colors duration-500">
                  <img 
                    src={getYouTubeThumbnail(podcast.url, 'medium')}
                    alt={podcast.title}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                    width="480"
                    height="270"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = podcast.thumbnail;
                    }}
                  />
                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"></div>
                  
                  {/* Play indicator overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-orange-500/80 rounded-full flex items-center justify-center shadow-lg">
                      <span className="material-icons text-white text-3xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </figure>
            
            {/* Player controls and info - improved spacing and visuals */}
            <div className="flex flex-col w-full max-w-md lg:pt-4 lg:flex-1">
              {/* Enhanced channel info with avatar */}
              <div className="hidden lg:flex items-center space-x-3 mb-6 bg-zinc-800/50 px-4 py-2 rounded-full">
                <figure className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700/50">
                  <img 
                    src={podcast.uploaderAvatar || getYouTubeThumbnail(podcast.url, 'default')} 
                    alt={podcast.uploaderName}
                    width="32"
                    height="32"
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </figure>
                <span className="text-gray-300 text-sm font-medium">{podcast.uploaderName}</span>
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
              
              {/* Enhanced title with elegant typography */}
              <h2 className="text-2xl lg:text-4xl font-bold text-white text-center lg:text-left mb-4 leading-tight">{podcast.title}</h2>
              <p className="text-gray-300 text-center lg:text-left mb-10 lg:hidden">
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
              
              {/* Enhanced progress bar with modern styling */}
              <div className="w-full mb-4 mt-6 relative">
                <input 
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  step="0.1"
                  onChange={handleProgressChange}
                  className="w-full h-2 md:h-3 cursor-pointer accent-orange-500 rounded-full appearance-none bg-zinc-800 overflow-hidden"
                  aria-label="Audio progress"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${(currentTime / (duration || 100)) * 100}%, #27272a ${(currentTime / (duration || 100)) * 100}%, #27272a 100%)`
                  }}
                />
                {/* Interactive hover effect (decorative) */}
                <div className="absolute top-full left-0 w-2 h-2 rounded-full bg-orange-500 opacity-0 hover:opacity-100 transition-opacity" style={{ left: `${(currentTime / (duration || 100)) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}></div>
              </div>
              
              {/* Time indicators with improved styling */}
              <div className="w-full flex justify-between text-sm text-gray-400 mb-12">
                <time dateTime={`PT${Math.floor(currentTime)}S`} className="tabular-nums">{formatDuration(currentTime)}</time>
                <time dateTime={`PT${Math.floor(duration)}S`} className="tabular-nums">{formatDuration(duration)}</time>
              </div>
              
              {/* Modernized controls with enhanced styling */}
              <div className="flex items-center justify-center lg:justify-center space-x-12 md:space-x-14" role="group" aria-label="Audio player controls">
                <button 
                  className="p-2 text-gray-300 hover:text-orange-400 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-full"
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
                  <span className="material-icons text-3xl md:text-4xl drop-shadow-md" aria-hidden="true">replay_10</span>
                </button>
                
                <button 
                  onClick={() => onTogglePlay(!isPlaying)}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/30 shadow-lg shadow-orange-500/10"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  <span className="material-icons text-4xl md:text-5xl ml-1 drop-shadow-md" aria-hidden="true">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                
                <button 
                  className="p-2 text-gray-300 hover:text-orange-400 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-full"
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
                  <span className="material-icons text-3xl md:text-4xl drop-shadow-md" aria-hidden="true">forward_10</span>
                </button>
              </div>
              
              {/* Enhanced additional controls */}
              <div className="flex justify-center mt-10 space-x-6" role="group" aria-label="Additional controls">
                <button 
                  className="flex items-center space-x-2 text-gray-400 hover:text-orange-400 transition-colors rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/30"
                  title="Add to Playlist"
                  aria-label="Add to Playlist"
                >
                  <span className="material-icons" aria-hidden="true">playlist_add</span>
                  <span className="text-sm">Add to Playlist</span>
                </button>
                <button 
                  className="flex items-center space-x-2 text-gray-400 hover:text-orange-400 transition-colors rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/30"
                  title="Like"
                  aria-label="Like this episode"
                >
                  <span className="material-icons" aria-hidden="true">thumb_up_off_alt</span>
                  <span className="text-sm">Like</span>
                </button>
              </div>
              
              {/* Enhanced episode details with modern card design */}
              <section className="mt-12 pt-6 border-t border-zinc-800/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="material-icons text-orange-500 mr-2" aria-hidden="true">info</span>
                  About this episode
                </h3>
                <div className="bg-zinc-800/50 rounded-xl p-5 shadow-lg border border-zinc-700/30 backdrop-blur-sm">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {podcast.shortDescription || 'Listen to this amazing podcast episode by ' + podcast.uploaderName + '. Share and enjoy the content on Cryptune.'}
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
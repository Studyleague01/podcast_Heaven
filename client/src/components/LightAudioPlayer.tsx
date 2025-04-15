import { useRef, useEffect, useState } from "react";
import { Podcast, AudioStream, VideoStream } from "@/types/podcast";
import { formatDuration, getYouTubeThumbnail, extractVideoIdFromUrl } from "@/api/podcast";
import { useAudioPlayerStore } from "@/store/index";

interface LightAudioPlayerProps {
  podcast: Podcast;
  audioStream: AudioStream | null;
  isPlaying: boolean;
  onTogglePlay: (isPlaying: boolean) => void;
  onShare?: () => void;
}

const LightAudioPlayer = ({ podcast, audioStream, isPlaying, onTogglePlay, onShare }: LightAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get video-related state from the store
  const { videoStream, isVideoMode, toggleVideoMode } = useAudioPlayerStore();
  
  // Calculate progress percentage for progress bar
  const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
  
  // Handle audio playback state
  useEffect(() => {
    const audioElement = audioRef.current;
    const videoElement = videoRef.current;
    
    if (audioElement) {
      if (isPlaying) {
        audioElement.play().catch(error => {
          console.error("Audio playback failed:", error);
          onTogglePlay(false);
        });
        
        // If video exists and we're in video mode, play the video as well
        if (videoElement && isVideoMode) {
          videoElement.play().catch(error => {
            console.error("Video playback failed:", error);
          });
        }
      } else {
        audioElement.pause();
        
        // If video exists, pause it as well
        if (videoElement) {
          videoElement.pause();
        }
      }
    }
  }, [isPlaying, onTogglePlay, isVideoMode]);

  // Handle volume changes
  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (audioElement) {
      audioElement.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // Handle video mode toggling - fetch video stream when video mode is enabled
  useEffect(() => {
    // If video mode is enabled and no video stream is available, try to fetch it
    if (isVideoMode && podcast) {
      const videoId = extractVideoIdFromUrl(podcast.url);
      if (videoId) {
        console.log("Fetching video stream for video ID:", videoId);
        // Show some visual indication that video is loading
        
        // Use the getVideoStream API function to fetch the video stream
        fetch(`https://backendmix.vercel.app/video/${videoId}`)
          .then(response => response.json())
          .then(data => {
            console.log("Video API response:", data);
            if (data.status === "success" && data.url) {
              // Create a VideoStream object from the API response
              const videoStream: VideoStream = {
                url: data.url,
                quality: data.quality || "480p",
                mimeType: "video/mp4",
                codec: "h264",
                bitrate: 1000000, // Approximate bitrate
                contentLength: 0, // Unknown content length
                videoQuality: data.quality || "480p",
                height: parseInt(data.quality || "480", 10),
                width: Math.round(parseInt(data.quality || "480", 10) * 16 / 9)
              };
                
              // Update the video stream in the store
              useAudioPlayerStore.getState().setVideoStream(videoStream);
              console.log("Video stream set in store:", videoStream);
            }
          })
          .catch(error => {
            console.error("Failed to fetch video stream:", error);
          });
      }
    }
  }, [isVideoMode, videoStream, podcast]);
  
  // Handle video mode change
  useEffect(() => {
    console.log("Video mode changed:", isVideoMode);
  }, [isVideoMode]);
  
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
    
    // Update both audio and video time if available
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    
    // Also update video time if in video mode
    if (isVideoMode && videoRef.current) {
      videoRef.current.currentTime = newTime;
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

  // Simplified mini player with improved performance - No progress bar
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
          className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-sm bg-white dark:bg-zinc-900 backdrop-blur-[25px] z-40 rounded-full shadow-xl border border-gray-200/60 dark:border-zinc-800/40 overflow-hidden transition-all duration-300 transform-gpu will-change-transform"
          role="complementary"
          aria-label="Mini Player"
        >
          {/* Background elements merged for better performance */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-black pointer-events-none opacity-100">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 dark:from-orange-600/20 to-transparent"></div>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-orange-500/10 via-white/5 to-orange-500/10 dark:from-orange-500/20 dark:via-white/10 dark:to-orange-500/20"></div>
          </div>
          
          <div className="relative z-10 flex items-center p-2 px-3">
            {/* Thumbnail with simplified structure */}
            <button 
              onClick={toggleExpanded}
              className="group w-10 h-10 flex-shrink-0 rounded-full overflow-hidden mr-3 shadow-md border border-gray-200/60 dark:border-zinc-700/40 relative focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              aria-label="Expand player"
            >
              <img 
                src={getYouTubeThumbnail(podcast.url, 'default')} 
                alt=""
                loading="eager"
                width="40"
                height="40"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Single overlay for better performance */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 dark:from-orange-500/30 to-transparent opacity-50 group-hover:opacity-70 dark:opacity-70 dark:group-hover:opacity-90 transition-opacity"></div>
            </button>
            
            {/* Title and artist - now using HTML5 semantic elements */}
            <div 
              onClick={toggleExpanded}
              className="flex-1 min-w-0 mr-3 text-left group focus:outline-none cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Expand player"
            >
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate drop-shadow-sm group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">{podcast.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">{podcast.uploaderName}</p>
            </div>
            
            {/* Play/Pause button with simplified structure */}
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent mini-player from expanding when clicking play button
                onTogglePlay(!isPlaying);
              }}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all duration-200"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {/* Using HTML entity instead of material icon for better performance */}
              <span className="text-2xl text-white drop-shadow-md font-bold">
                {isPlaying ? '❚❚' : '▶'}
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
      
      <div className="fixed inset-0 bg-gray-100 dark:bg-zinc-900 z-50 flex flex-col player-backdrop">
        
        {/* Enhanced glassmorphic header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-[25px] sticky top-0 z-10 shadow-md">
          <button 
            onClick={toggleExpanded}
            className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            aria-label="Close player"
            title="Close player"
          >
            <span className="material-icons" aria-hidden="true">keyboard_arrow_down</span>
          </button>
          
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-gray-800 dark:text-white">Now Playing</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="text-gray-700 dark:text-white">VE</span>
              <span className="text-orange-500">LIN</span>
            </p>
          </div>
          
          {onShare && (
            <button 
              onClick={onShare}
              className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
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
                {/* Simplified container without excessive animations */}
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-zinc-700/50">
                  {isVideoMode && videoStream ? (
                    <video 
                      ref={videoRef}
                      src={videoStream.url}
                      className="w-full h-full object-cover rounded-xl"
                      poster={getYouTubeThumbnail(podcast.url, 'medium')}
                      playsInline
                      muted
                      autoPlay={isPlaying}
                      controls={false}
                      onLoadStart={() => {
                        console.log("Video loading started");
                        // If video starts loading, temporarily pause audio until video is ready
                        if (audioRef.current && isPlaying) {
                          audioRef.current.pause();
                          // Show loading indicator or message - could be added here
                        }
                      }}
                      onLoadedData={() => {
                        console.log("Video data loaded");
                        // Once video is loaded, resume audio if it was playing
                        if (audioRef.current && isPlaying) {
                          audioRef.current.play().catch(error => {
                            console.error("Error resuming audio after video loaded:", error);
                          });
                        }
                      }}
                      onError={(e) => {
                        console.error("Video error:", (e.target as HTMLVideoElement).error);
                        // If video fails to load, switch back to audio mode
                        if (isVideoMode) {
                          toggleVideoMode();
                          // Resume audio playback if it was previously playing
                          if (audioRef.current && isPlaying) {
                            audioRef.current.play().catch(error => {
                              console.error("Error resuming audio after video error:", error);
                            });
                          }
                        }
                      }}
                      onTimeUpdate={() => {
                        console.log("Video time update", videoRef.current?.currentTime);
                        // Sync video time with audio time
                        if (videoRef.current && audioRef.current && Math.abs(videoRef.current.currentTime - audioRef.current.currentTime) > 0.5) {
                          videoRef.current.currentTime = audioRef.current.currentTime;
                        }
                      }}
                      onClick={() => onTogglePlay(!isPlaying)}
                    />
                  ) : (
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
                  )}
                  
                  {/* Enhanced gradient overlay - only show when not in video mode */}
                  {!isVideoMode && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"></div>
                  )}
                  
                  {/* Remove the overlay toggle button */}
                  
                  {/* Simplified play indicator - only visible when thumbnail is clicked */}
                  {(!isVideoMode || !isPlaying) && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="material-icons text-white text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Video/Audio toggle button with enhanced visibility - positioned below thumbnail */}
              <div className="flex justify-center mt-6 mb-2">
                <button
                  onClick={() => {
                    toggleVideoMode();
                    console.log("Video toggle clicked, isVideoMode:", !isVideoMode);
                  }}
                  className="px-6 py-3 rounded-lg bg-orange-500 text-white flex items-center space-x-3 shadow-md hover:bg-orange-600 transition-colors"
                  aria-label={isVideoMode ? "Switch to audio mode" : "Switch to video mode"}
                >
                  <span className="material-icons text-white">{isVideoMode ? 'headphones' : 'video_library'}</span>
                  <span className="font-medium text-md">{isVideoMode ? "Switch to Audio" : "Show Video"}</span>
                </button>
              </div>
            </figure>
            
            {/* Player controls and info - improved spacing and visuals */}
            <div className="flex flex-col w-full max-w-md lg:pt-4 lg:flex-1">
              {/* Enhanced channel info with avatar */}
              <div className="hidden lg:flex items-center space-x-3 mb-6 bg-gray-100 dark:bg-zinc-800 backdrop-blur-sm px-4 py-2 rounded-full">
                <figure className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700/50">
                  <img 
                    src={podcast.uploaderAvatar || getYouTubeThumbnail(podcast.url, 'default')} 
                    alt={podcast.uploaderName}
                    width="32"
                    height="32"
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </figure>
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{podcast.uploaderName}</span>
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
              <h2 className="text-2xl lg:text-4xl font-bold text-gray-800 dark:text-white text-center lg:text-left mb-4 leading-tight">{podcast.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-center lg:text-left mb-10 lg:hidden">
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
                  className="w-full h-2 md:h-3 cursor-pointer accent-orange-500 rounded-full appearance-none bg-gray-200 dark:bg-zinc-800 overflow-hidden"
                  aria-label="Audio progress"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${(currentTime / (duration || 100)) * 100}%, ${document.documentElement.classList.contains('dark') ? '#27272a' : '#e5e7eb'} ${(currentTime / (duration || 100)) * 100}%, ${document.documentElement.classList.contains('dark') ? '#27272a' : '#e5e7eb'} 100%)`
                  }}
                />
                {/* Remove decorative hover effect for better performance */}
              </div>
              
              {/* Time indicators with improved styling */}
              <div className="w-full flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-12">
                <time dateTime={`PT${Math.floor(currentTime)}S`} className="tabular-nums">{formatDuration(currentTime)}</time>
                <time dateTime={`PT${Math.floor(duration)}S`} className="tabular-nums">{formatDuration(duration)}</time>
              </div>
              
              {/* Modernized controls with enhanced styling */}
              <div className="flex items-center justify-center lg:justify-center space-x-12 md:space-x-14" role="group" aria-label="Audio player controls">
                <button 
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-full"
                  onClick={() => {
                    const newTime = Math.max(0, currentTime - 10);
                    // Update both audio and video time
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                    // Sync with video if in video mode
                    if (isVideoMode && videoRef.current) {
                      videoRef.current.currentTime = newTime;
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
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-full"
                  onClick={() => {
                    const newTime = Math.min(duration, currentTime + 10);
                    // Update both audio and video time
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                    // Sync with video if in video mode
                    if (isVideoMode && videoRef.current) {
                      videoRef.current.currentTime = newTime;
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
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 backdrop-blur-sm"
                  title="Add to Playlist"
                  aria-label="Add to Playlist"
                >
                  <span className="material-icons" aria-hidden="true">playlist_add</span>
                  <span className="text-sm">Add to Playlist</span>
                </button>
                <button 
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 backdrop-blur-sm"
                  title="Like"
                  aria-label="Like this episode"
                >
                  <span className="material-icons" aria-hidden="true">thumb_up_off_alt</span>
                  <span className="text-sm">Like</span>
                </button>
              </div>
              
              {/* Enhanced episode details with modern card design */}
              <section className="mt-12 pt-6 border-t border-gray-200/50 dark:border-zinc-800/50">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <span className="material-icons text-orange-500 mr-2" aria-hidden="true">info</span>
                  About this episode
                </h3>
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-zinc-700 backdrop-blur-sm">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {podcast.shortDescription || 'Listen to this amazing podcast episode by ' + podcast.uploaderName + '. Share and enjoy the content on VELIN.'}
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
import { useRef, useEffect, useState } from "react";
import { Podcast, AudioStream } from "@/types/podcast";
import { formatDuration, getYouTubeThumbnail, extractVideoIdFromUrl } from "@/api/podcast";
import { useAudioPlayerStore } from "@/store/index";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  podcast: Podcast;
  audioStream: AudioStream | null;
  isPlaying: boolean;
  onTogglePlay: (isPlaying: boolean) => void;
}

const AudioPlayer = ({ podcast, audioStream, isPlaying, onTogglePlay }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const expandedProgressBarRef = useRef<HTMLDivElement>(null);
  
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
    setDuration
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

  return (
    <>
      <audio 
        ref={audioRef}
        src={audioStream?.url || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        hidden
      />
      
      {/* Expanded Full Screen Player */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 overflow-auto">
          {/* Background Blur Image */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute inset-0 backdrop-blur-2xl bg-background/20"></div>
            <img 
              src={getYouTubeThumbnail(podcast.url, 'maxres')}
              alt=""
              className="w-full h-full object-cover blur-2xl scale-110" 
            />
          </div>
          
          {/* Topbar with close button */}
          <div className="flex justify-between items-center p-4 relative z-10">
            <div className="flex items-center">
              <button 
                onClick={toggleExpanded}
                className="text-white mr-4 bg-black/30 p-2 rounded-full"
              >
                <span className="material-icons">arrow_back</span>
              </button>
              <div className="text-white">
                <h4 className="text-sm font-medium">{podcast.uploaderName} is On</h4>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-white bg-black/30 p-2 rounded-full">
                <span className="material-icons text-sm">1x</span>
              </button>
              <button className="text-white bg-black/30 p-2 rounded-full">
                <span className="material-icons">timer</span>
              </button>
              <button className="text-white bg-black/30 p-2 rounded-full">
                <span className="material-icons">menu</span>
              </button>
              <button className="text-white bg-black/30 p-2 rounded-full">
                <span className="material-icons">favorite_border</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col items-center justify-center h-[calc(100vh-180px)] relative z-10">
            <div className="w-full max-w-xl mb-8 mt-6 sm:mt-0">
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl max-h-[30vh] mx-auto">
                <img 
                  src={getYouTubeThumbnail(podcast.url, 'maxres')}
                  alt={podcast.title}
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = podcast.thumbnail;
                  }}
                />
              </div>
            </div>
            
            <div className="w-full max-w-xl text-center mb-8">
              <h1 className="text-white text-xl md:text-2xl font-bold mb-2 line-clamp-2">{podcast.title}</h1>
              <p className="text-white/70 text-sm md:text-base flex items-center justify-center">
                <span>{podcast.uploaderName}</span>
                {podcast.uploaderVerified && (
                  <span className="material-icons text-primary text-sm ml-1">verified</span>
                )}
              </p>
            </div>
            
            {/* Progress Bar with Times */}
            <div className="w-full max-w-xl mb-8">
              {/* Time indicators */}
              <div className="flex justify-between text-white/70 mb-2">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
              
              {/* Progress bar */}
              <div 
                className="w-full bg-white/20 h-3 rounded-full cursor-pointer overflow-hidden" 
                ref={expandedProgressBarRef}
                onClick={handleExpandedProgressBarClick}
              >
                <div 
                  className="bg-primary h-full rounded-full relative" 
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute -right-2.5 -top-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center space-x-12 w-full max-w-xl">
              <button className="text-white/70 hover:text-white transition-colors p-2 group">
                <div className="flex flex-col items-center">
                  <span className="material-icons text-3xl group-hover:scale-110 transition-transform">skip_previous</span>
                  <span className="text-xs mt-1">15s</span>
                </div>
              </button>
              
              <button 
                className={cn(
                  "w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg",
                  "transform hover:scale-105 transition-all active:scale-95",
                  isPlaying && "play-button-pulse-large"
                )}
                onClick={() => onTogglePlay(!isPlaying)}
              >
                <span className="material-icons text-4xl">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              
              <button className="text-white/70 hover:text-white transition-colors p-2 group">
                <div className="flex flex-col items-center">
                  <span className="material-icons text-3xl group-hover:scale-110 transition-transform">skip_next</span>
                  <span className="text-xs mt-1">15s</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Player (Bottom Bar) - Centered and visible on all screen sizes */}
      <div 
        className={cn(
          "fixed bottom-4 left-0 right-0 mx-auto w-[90%] max-w-sm bg-black/90 backdrop-blur-md z-50 rounded-full shadow-lg",
          "border border-white/10 audio-player-shadow text-white cursor-pointer optimize-gpu shadow-[0_0_15px_rgba(0,0,0,0.2)]",
          isExpanded && "hidden"
        )}
        style={{ 
          willChange: 'transform',
          zIndex: 999
        }}
        onClick={toggleExpanded}
      >
        <div className="flex items-center py-2 px-4 relative">
          {/* Now Playing Info */}
          <div className="flex items-center flex-1 mr-14">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative shadow-sm flex-shrink-0">
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
              <h4 className="font-medium text-sm text-white" 
                  style={{
                    display: 'inline-block',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                {podcast.title.length > 10 
                  ? podcast.title.substring(0, 10) + '...' 
                  : podcast.title}
              </h4>
              <p className="text-xs text-white/70 truncate">{podcast.uploaderName}</p>
            </div>
          </div>
          
          {/* Player Controls - Absolutely Positioned Play Button */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <button 
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md 
                         hover:bg-white/90 active:bg-white/80 optimize-gpu optimize-animation"
              style={{ 
                transition: 'all 0.1s ease',
                willChange: 'transform, background',
                transform: 'translateZ(0)'
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                onTogglePlay(!isPlaying);
              }}
            >
              <span className="material-icons text-xl">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Hidden progress bar for click handling only */}
        <div 
          className="w-full bg-transparent h-6 cursor-pointer absolute -top-3 opacity-0" 
          ref={progressBarRef}
          onClick={(e) => {
            e.stopPropagation(); // Prevent expanding when clicking on progress bar
            handleProgressBarClick(e);
          }}
        >
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;

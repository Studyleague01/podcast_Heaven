import { useLocation } from "wouter";
import { Podcast } from "@/types/podcast";
import { extractVideoIdFromUrl, formatDuration, formatViews, getYouTubeThumbnail } from "@/api/podcast";
import { memo, useCallback, useState } from "react";

interface PodcastCardProps {
  podcast: Podcast;
  onClick?: () => void;
  compact?: boolean;
  priority?: boolean;
}

const PodcastCard = memo(({ podcast, onClick, compact = false, priority = false }: PodcastCardProps) => {
  const [, setLocation] = useLocation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Handle navigation to podcast detail
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      const videoId = extractVideoIdFromUrl(podcast.url);
      if (videoId) {
        setLocation(`/podcast/${videoId}`);
      }
    }
  }, [onClick, podcast.url, setLocation]);
  
  // Thumbnail loading handlers
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
    // Fallback to the original thumbnail from API
    const img = document.getElementById(`podcast-thumb-${extractVideoIdFromUrl(podcast.url)}`) as HTMLImageElement;
    if (img) {
      img.src = podcast.thumbnail;
    }
  }, [podcast.thumbnail, podcast.url]);
  
  return (
    <article 
      className={`group bg-transparent w-full cursor-pointer transition-transform hover:scale-[1.02] duration-200 ${
        compact ? 'flex gap-4' : ''
      }`}
      onClick={handleClick}
    >
      {/* Thumbnail container with aspect ratio */}
      <div className={`relative ${compact ? 'w-32 h-20 flex-shrink-0' : 'pb-[56.25%] mb-3'} rounded-xl overflow-hidden shadow-md`}>
        {/* Skeleton loader */}
        <div className={`absolute inset-0 bg-gray-200 dark:bg-zinc-800 animate-pulse ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}></div>
        
        {/* YouTube style thumbnail with optimized loading */}
        <img 
          id={`podcast-thumb-${extractVideoIdFromUrl(podcast.url)}`}
          src={getYouTubeThumbnail(podcast.url, 'medium')} 
          alt={podcast.title} 
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`absolute w-full h-full object-cover transform transition-all duration-300 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          {formatDuration(podcast.duration)}
        </div>
        
        {/* Watch Later button */}
        {!compact && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/80"
              aria-label="Save for later"
              onClick={(e) => {
                e.stopPropagation();
                // Future functionality: Add to watch later
              }}
            >
              <span className="material-icons text-sm">bookmark_add</span>
            </button>
          </div>
        )}
        
        {/* Play button overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 group-hover:bg-black/20 transition-all duration-300"
          aria-hidden="true"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <span className="material-icons text-2xl">play_arrow</span>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className={compact ? 'flex-1 min-w-0' : 'flex'}>
        {!compact && (
          /* Channel avatar - only in full mode */
          <div className="w-9 h-9 flex-shrink-0 mr-3 mt-0.5 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800">
            {podcast.uploaderAvatar ? (
              <img 
                src={podcast.uploaderAvatar} 
                alt={podcast.uploaderName} 
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(podcast.uploaderName.substring(0, 2))}&background=random&size=36`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="material-icons text-base">person</span>
              </div>
            )}
          </div>
        )}
        
        <div className={`${compact ? '' : 'flex-1 min-w-0'}`}>
          {/* Title */}
          <h3 className={`font-medium ${compact ? 'text-sm line-clamp-1' : 'text-base line-clamp-2'} text-gray-900 dark:text-white mb-1 transition-colors duration-300`}>
            {podcast.title}
          </h3>
          
          {/* Channel info */}
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 truncate">
            <span className="truncate">{podcast.uploaderName}</span>
            {podcast.uploaderVerified && (
              <span className="material-icons text-orange-500 text-xs ml-1">verified</span>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
            <span>{formatViews(podcast.views)} views</span>
            <span className="mx-1 opacity-60">•</span>
            <time dateTime={podcast.uploadedDate} className="whitespace-nowrap">
              {podcast.uploadedDate}
            </time>
          </div>
        </div>
        
        {/* Options menu */}
        {!compact && (
          <div className="relative ml-1">
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
              aria-label="More options"
              onClick={(e) => {
                e.stopPropagation();
                // Future functionality: Show options menu
              }}
            >
              <span className="material-icons text-gray-700 dark:text-gray-300">more_vert</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
});

export default PodcastCard;

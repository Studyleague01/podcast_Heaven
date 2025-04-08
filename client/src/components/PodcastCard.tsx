import { useLocation } from "wouter";
import { Podcast } from "@/types/podcast";
import { extractVideoIdFromUrl, formatDuration, formatViews, getYouTubeThumbnail } from "@/api/podcast";
import { cn } from "@/lib/utils";

interface PodcastCardProps {
  podcast: Podcast;
  onClick?: () => void;
}

const PodcastCard = ({ podcast, onClick }: PodcastCardProps) => {
  const [, navigate] = useLocation();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      const videoId = extractVideoIdFromUrl(podcast.url);
      if (videoId) {
        navigate(`/podcast/${videoId}`);
      }
    }
  };
  
  return (
    <article 
      className="podcast-card group bg-white/95 dark:bg-zinc-900/95 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:translate-y-[-3px] cursor-pointer h-full transition-all duration-300 backdrop-blur-lg border border-gray-100/80 dark:border-zinc-800/80 w-full"
      onClick={handleClick}
      style={{ willChange: "transform, box-shadow" }}
    >
      <div className="relative pb-[56.25%] overflow-hidden rounded-t-3xl">
        {/* Thumbnail with enhanced quality */}
        <img 
          src={getYouTubeThumbnail(podcast.url, 'medium')} 
          alt={podcast.title} 
          loading="eager"
          className="absolute w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ willChange: "transform" }}
          onError={(e) => {
            // Fallback to original thumbnail if YouTube thumbnail fails to load
            (e.target as HTMLImageElement).src = podcast.thumbnail;
          }}
        />
        
        {/* Premium gradient overlay with improved opacity transitions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
        
        {/* Refined duration badge with glass morphism */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full z-10 border border-white/10 shadow-lg">
          {formatDuration(podcast.duration)}
        </div>
        
        {/* Premium floating action button with shimmer effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-xl hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-500 text-white flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 border border-white/20 hover:border-orange-400/50 hover:shadow-[0_0_25px_rgba(234,88,12,0.5)]"
            aria-label="Play podcast"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <span className="material-icons text-3xl ml-1">play_arrow</span>
            <div className="absolute inset-0 rounded-full animate-shimmer opacity-0 group-hover:opacity-50"></div>
          </button>
        </div>
      </div>
      
      <div className="p-5 flex flex-col justify-between bg-white/95 dark:bg-zinc-900 dark:border-t dark:border-zinc-800/50 group-hover:bg-gradient-to-br group-hover:from-orange-50/5 group-hover:to-transparent dark:group-hover:from-orange-900/5 dark:group-hover:to-transparent transition-colors duration-300">
        {/* Title with premium typography */}
        <h3 className="font-semibold text-base md:text-lg line-clamp-2 h-12 mb-3 text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight">{podcast.title}</h3>
        
        <div className="mt-2 space-y-3">
          {/* Channel info with modern styling */}
          <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mr-2 shadow-sm">
              <span className="material-icons text-xs text-white">person</span>
            </div>
            <span className="truncate max-w-[80%] font-medium">{podcast.uploaderName}</span>
            {podcast.uploaderVerified && (
              <span className="material-icons text-orange-500 dark:text-orange-400 text-xs ml-1 flex-shrink-0 group-hover:animate-pulse">verified</span>
            )}
          </div>
          
          {/* Stats with modern glass morphism layout */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center bg-gray-100/80 dark:bg-zinc-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm group-hover:bg-gray-50 dark:group-hover:bg-zinc-700/80 transition-colors duration-300">
              <span className="material-icons text-xs mr-1.5 text-orange-500">visibility</span>
              <span>{formatViews(podcast.views)}</span>
            </div>
            <time 
              dateTime={podcast.uploadedDate} 
              className="bg-gray-100/80 dark:bg-zinc-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs group-hover:bg-gray-50 dark:group-hover:bg-zinc-700/80 transition-colors duration-300"
            >
              {podcast.uploadedDate}
            </time>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PodcastCard;

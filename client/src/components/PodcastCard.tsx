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
    <div 
      className={cn(
        "podcast-card bg-card rounded-lg overflow-hidden shadow-sm cursor-pointer h-full",
        "transform transition-transform duration-200 hover:-translate-y-1 will-change-transform",
        "hover:shadow-md hover:shadow-primary/10 dark:hover:shadow-primary/5 dark:bg-card/95",
        "border border-border/40 optimize-gpu"
      )}
      style={{ willChange: 'transform, opacity' }}
      onClick={handleClick}
    >
      <div className="relative pb-[56.25%] overflow-hidden group">
        {/* Thumbnail image - optimized loading */}
        <img 
          src={getYouTubeThumbnail(podcast.url, 'high')} 
          alt={podcast.title} 
          loading="eager"
          decoding="async"
          className="absolute w-full h-full object-cover transform transition-transform group-hover:scale-105 duration-300 ease-out optimize-gpu"
          style={{ 
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
          onError={(e) => {
            // Fallback to original thumbnail if YouTube thumbnail fails to load
            (e.target as HTMLImageElement).src = podcast.thumbnail;
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300"></div>
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm z-10 group-hover:bg-primary/80 transition-colors duration-300">
          {formatDuration(podcast.duration)}
        </div>
        
        {/* Play button overlay (appears on hover) - optimized for performance */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 optimize-gpu"
             style={{ willChange: 'opacity' }}>
          <div className="w-14 h-14 rounded-full bg-primary/90 text-white flex items-center justify-center backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform shadow-lg optimize-gpu"
               style={{ willChange: 'transform' }}>
            <span className="material-icons text-2xl">play_arrow</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col justify-between h-[calc(100%-56.25%)]">
        <h3 className="font-medium text-sm md:text-base line-clamp-2 min-h-[3rem] text-foreground group-hover:text-primary/90 transition-colors duration-300">{podcast.title}</h3>
        <div className="mt-auto pt-2">
          <div className="flex items-center text-xs md:text-sm text-muted-foreground">
            <span className="material-icons text-xs md:text-sm mr-1">person</span>
            <span className="truncate max-w-[80%]">{podcast.uploaderName}</span>
            {podcast.uploaderVerified && (
              <span className="material-icons text-primary text-xs md:text-sm ml-1 flex-shrink-0">verified</span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground mt-1">
            <div className="flex items-center">
              <span className="material-icons text-xs md:text-sm mr-1">visibility</span>
              <span>{formatViews(podcast.views)} views</span>
            </div>
            <span className="text-xs">{podcast.uploadedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastCard;

import { useLocation } from "wouter";
import { Podcast } from "@/types/podcast";
import { extractVideoIdFromUrl, formatDuration, formatViews, getYouTubeThumbnail } from "@/api/podcast";

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
      className="group bg-transparent w-full cursor-pointer transition-transform hover:scale-[1.02] duration-200"
      onClick={handleClick}
    >
      <div className="relative pb-[56.25%] mb-3 rounded-xl overflow-hidden">
        {/* YouTube style thumbnail */}
        <img 
          src={getYouTubeThumbnail(podcast.url, 'medium')} 
          alt={podcast.title} 
          loading="lazy"
          className="absolute w-full h-full object-cover transform transition-all duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = podcast.thumbnail;
          }}
        />
        
        {/* Duration badge - YouTube style */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(podcast.duration)}
        </div>
        
        {/* Watch Later button (YouTube style) */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center"
            aria-label="Add to watch later"
            onClick={(e) => {
              e.stopPropagation();
              // Future functionality: Add to watch later
            }}
          >
            <span className="material-icons text-sm">schedule</span>
          </button>
        </div>
        
        {/* Play button - appears on hover */}
        <button 
          className="absolute inset-0 flex items-center justify-center w-full h-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Play podcast"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <div className="w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center">
            <span className="material-icons text-2xl">play_arrow</span>
          </div>
        </button>
      </div>
      
      <div className="flex">
        {/* Avatar (YouTube style) */}
        <div className="w-9 h-9 flex-shrink-0 mr-3 mt-0.5 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800">
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="material-icons text-base">person</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Title - YouTube style */}
          <h3 className="font-medium text-base text-gray-900 dark:text-white line-clamp-2 mb-1">{podcast.title}</h3>
          
          {/* Channel info - YouTube style */}
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <span className="truncate">{podcast.uploaderName}</span>
            {podcast.uploaderVerified && (
              <span className="material-icons text-gray-400 text-xs ml-1">verified</span>
            )}
          </div>
          
          {/* Stats - YouTube style */}
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span>{formatViews(podcast.views)} views</span>
            <span className="mx-1">•</span>
            <time dateTime={podcast.uploadedDate}>
              {podcast.uploadedDate}
            </time>
          </div>
        </div>
        
        {/* Options menu (YouTube style) */}
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
      </div>
    </article>
  );
};

export default PodcastCard;

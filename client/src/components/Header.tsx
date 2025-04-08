import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import SearchBar from "./SearchBar";
import UserProfile from "./UserProfile";
import ThemeToggle from "./ThemeToggle";
import { useSearchStore, useAuthStore } from "@/store/index";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useShareStore } from "@/lib/useShare";

interface HeaderProps {
  isAuthPage?: boolean;
}

const Header = ({ isAuthPage }: HeaderProps) => {
  const [location, navigate] = useLocation();
  const { setSearchQuery } = useSearchStore();
  const { isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShareButton, setShowShareButton] = useState(false);
  
  // Use our global share hook with all the share functionality
  const { isShareOpen, shareContent, closeShare, shareApp } = useShareStore();
  
  // Determine if we're on the home page (to conditionally show/hide buttons)
  const isHomePage = location === '/';
  
  // Check if we need to show the home/share buttons based on the current route
  useEffect(() => {
    // Only show home/share buttons when NOT on the home page
    setShowShareButton(!isHomePage);
  }, [location, isHomePage]);
  
  // Updated to use dedicated search route
  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchQuery(query);
      navigate(`/search/${encodeURIComponent(query)}`);
    }
  };
  
  // We no longer need the old share code since we're using our global share system
  
  // Don't render the header at all on auth page if both conditions are true
  if (isAuthPage && !isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg text-black dark:text-white sticky top-0 z-40 shadow-md border-b border-gray-100/50 dark:border-zinc-800/50">
      <div className="container mx-auto px-3 py-3 flex items-center justify-between">
        {/* Enhanced Logo with animation */}
        <div 
          className="flex items-center cursor-pointer group" 
          onClick={() => {
            setSearchQuery(''); // Clear search when going to home
            navigate('/');
          }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mr-2.5 shadow-lg group-hover:shadow-orange-500/20 group-hover:scale-105 transition-all duration-300">
            <span className="material-icons text-white text-xl group-hover:animate-pulse">podcasts</span>
          </div>
          <h1 className="text-xl font-bold">
            <span className="text-black dark:text-white transition-colors">Podcast</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-600 font-medium">Heaven</span>
          </h1>
        </div>
        
        {/* Enhanced Search Bar - Glass morphism style */}
        {!isAuthPage && (
          <div className="flex justify-center absolute left-0 right-0 mx-auto pointer-events-none">
            <div className="w-full max-w-xl mx-auto hidden md:block pointer-events-auto z-10">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        )}
        
        {/* Auth Buttons with refined styling */}
        <div className="flex items-center ml-2 md:ml-4 space-x-3 md:space-x-4 z-20">
          {isAuthenticated ? (
            <UserProfile 
              showThemeToggle={true}
              showShareButton={true}
            />
          ) : (
            !isAuthPage && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center border-orange-500 text-orange-500 dark:text-orange-400 dark:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 hover:shadow-md hover:scale-105"
                onClick={() => navigate('/auth')}
              >
                <span className="material-icons text-sm md:mr-1">account_circle</span>
                <span className="hidden md:inline">Sign In</span>
              </Button>
            )
          )}
        
          {/* Enhanced Mobile Search Toggle */}
          {!isAuthPage && (
            <button 
              className="md:hidden ml-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-zinc-800/80 p-2 rounded-full transition-all duration-200 active:scale-95"
              onClick={() => {
                // Handle mobile search toggle
                const searchContainer = document.getElementById('mobile-search-container');
                if (searchContainer) {
                  searchContainer.classList.toggle('hidden');
                }
              }}
            >
              <span className="material-icons">search</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Enhanced Mobile Search Bar Container */}
      {!isAuthPage && (
        <div id="mobile-search-container" className="md:hidden hidden w-full px-4 py-3 border-t border-gray-200/50 dark:border-zinc-800/50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-inner">
          <SearchBar onSearch={(query) => {
            handleSearch(query);
            const searchContainer = document.getElementById('mobile-search-container');
            if (searchContainer) {
              searchContainer.classList.add('hidden');
            }
          }} />
        </div>
      )}
    </header>
  );
};

export default Header;

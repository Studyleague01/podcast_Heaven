import { useState } from "react";
import { useLocation } from "wouter";
import SearchBar from "./SearchBar";
import UserProfile from "./UserProfile";
import { useSearchStore, useAuthStore } from "@/store/index";
import { useShareStore } from "@/lib/useShare";

interface HeaderProps {
  isAuthPage?: boolean;
}

const Header = ({ isAuthPage }: HeaderProps) => {
  const [location, navigate] = useLocation();
  const { setSearchQuery } = useSearchStore();
  const { isAuthenticated } = useAuthStore();
  const { shareApp } = useShareStore();
  
  // Determine if we're on the home page
  const isHomePage = location === '/';
  
  // Simple search handler
  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchQuery(query);
      navigate(`/search/${encodeURIComponent(query)}`);
    }
  };
  
  // Don't render the header at all on auth page if not authenticated
  if (isAuthPage && !isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-zinc-800/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Enhanced Logo with Animation */}
        <div className="flex items-center flex-shrink-0">
          <div 
            className="flex items-center cursor-pointer group mr-2" 
            onClick={() => {
              setSearchQuery(''); // Clear search when going to home
              navigate('/');
            }}
          >
            <span className="material-icons text-orange-500 mr-1.5 group-hover:text-orange-600 transition-colors text-2xl group-hover:animate-pulse">headphones</span>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-white">Vel</span>
              <span className="text-orange-500 group-hover:text-orange-600 transition-colors">in</span>
            </h1>
          </div>
        </div>
        
        {/* Search Bar - Desktop Only with Enhanced Styling */}
        {!isAuthPage && (
          <div className="w-full max-w-xl mx-4 hidden md:block flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
        )}
        
        {/* User controls with Better Spacing */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Create/Upload button with Enhanced Styling */}
          {!isAuthPage && (
            <a 
              href="/create.html" 
              className="flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors group"
              aria-label="Create podcast"
            >
              <span className="material-icons mr-1">add</span>
              <span className="hidden sm:inline text-sm font-medium group-hover:underline">Create</span>
            </a>
          )}
          
          {isAuthenticated ? (
            <UserProfile 
              showThemeToggle={true}
              showShareButton={true}
              handleShareApp={shareApp}
            />
          ) : (
            !isAuthPage && (
              <button 
                className="flex items-center px-4 py-2 text-orange-500 border border-orange-500 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                onClick={() => navigate('/auth')}
              >
                <span className="material-icons text-sm mr-1 align-text-bottom">account_circle</span>
                <span>Sign In</span>
              </button>
            )
          )}
        
          {/* Mobile Search Toggle with Animation */}
          {!isAuthPage && (
            <button 
              className="md:hidden w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 hover:rotate-15 transition-all"
              onClick={() => {
                const searchContainer = document.getElementById('mobile-search-container');
                if (searchContainer) {
                  // Use a smooth slide animation
                  if (searchContainer.classList.contains('hidden')) {
                    searchContainer.classList.remove('hidden');
                    setTimeout(() => {
                      searchContainer.classList.add('opacity-100');
                      searchContainer.classList.add('translate-y-0');
                    }, 10);
                  } else {
                    searchContainer.classList.remove('opacity-100');
                    searchContainer.classList.remove('translate-y-0');
                    setTimeout(() => {
                      searchContainer.classList.add('hidden');
                    }, 300);
                  }
                }
              }}
            >
              <span className="material-icons">search</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Enhanced Mobile Search Bar with Animation */}
      {!isAuthPage && (
        <div 
          id="mobile-search-container" 
          className="md:hidden hidden w-full px-4 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800/50 opacity-0 -translate-y-2 transition-all duration-300 ease-in-out shadow-inner"
        >
          <SearchBar onSearch={(query) => {
            handleSearch(query);
            // Use a smooth slide animation when hiding
            const searchContainer = document.getElementById('mobile-search-container');
            if (searchContainer) {
              searchContainer.classList.remove('opacity-100');
              searchContainer.classList.remove('translate-y-0');
              setTimeout(() => {
                searchContainer.classList.add('hidden');
              }, 300);
            }
          }} />
        </div>
      )}
    </header>
  );
};

export default Header;

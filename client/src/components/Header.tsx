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
    <header className="bg-white dark:bg-zinc-900 sticky top-0 z-30 shadow-sm border-b border-gray-200 dark:border-zinc-800">
      <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div 
            className="flex items-center cursor-pointer mr-4" 
            onClick={() => {
              setSearchQuery(''); // Clear search when going to home
              navigate('/');
            }}
          >
            <span className="material-icons text-orange-500 mr-1">music_note</span>
            <h1 className="text-xl font-bold">
              <span className="text-gray-900 dark:text-white">Crypt</span>
              <span className="text-orange-500">une</span>
            </h1>
          </div>
        </div>
        
        {/* Search Bar - Desktop Only */}
        {!isAuthPage && (
          <div className="w-full max-w-xl mx-auto hidden md:flex">
            <SearchBar onSearch={handleSearch} />
          </div>
        )}
        
        {/* User controls */}
        <div className="flex items-center space-x-3">
          {/* Create/Upload button (YouTube-inspired) */}
          {!isAuthPage && (
            <a 
              href="/create.html" 
              className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"
              aria-label="Create podcast"
            >
              <span className="material-icons">video_call</span>
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
                className="flex items-center px-4 py-2 text-blue-600 border border-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                onClick={() => navigate('/auth')}
              >
                <span className="material-icons text-sm mr-1 align-text-bottom">account_circle</span>
                <span>Sign In</span>
              </button>
            )
          )}
        
          {/* Mobile Search Toggle */}
          {!isAuthPage && (
            <button 
              className="md:hidden w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"
              onClick={() => {
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
      
      {/* Mobile Search Bar */}
      {!isAuthPage && (
        <div id="mobile-search-container" className="md:hidden hidden w-full px-4 py-3 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
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

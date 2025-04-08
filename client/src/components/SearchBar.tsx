import { useState, useEffect } from "react";
import { useSearchStore } from "@/store/index";
import { useLocation } from "wouter";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const { searchQuery } = useSearchStore();
  const [query, setQuery] = useState(searchQuery);
  const [, navigate] = useLocation();
  
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // First navigate to home page
      navigate('/');
      
      // Small delay to ensure we're on the home page before searching
      setTimeout(() => {
        onSearch(query.trim());
      }, 50);
    }
  };
  
  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="w-full relative flex items-center">
          {/* Enhanced premium search field */}
          <div className="absolute left-4 text-orange-500 dark:text-orange-400 z-10">
            <span className="material-icons text-xl">search</span>
          </div>
          <input 
            type="text" 
            className="w-full py-3 pl-12 pr-14 shadow-md bg-white/90 dark:bg-zinc-800/90 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:shadow-lg dark:focus:ring-orange-500/40 text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 backdrop-blur-lg border border-gray-100/50 dark:border-zinc-700/50 transition-all duration-300" 
            placeholder="Search podcasts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck="false"
            autoComplete="off"
          />
          
          {/* Premium clear button with smoother transition */}
          {query && (
            <button 
              type="button"
              className="absolute right-14 p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-zinc-700/50 rounded-full transition-all duration-200"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <span className="material-icons text-sm">close</span>
            </button>
          )}
          
          {/* Enhanced submit button with animation */}
          <button 
            type="submit"
            className="absolute right-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-1.5 rounded-full transition-all duration-300 shadow-md hover:shadow-orange-500/20 active:scale-95 border border-orange-400/20"
            aria-label="Search"
          >
            <span className="material-icons text-base">arrow_forward</span>
          </button>
          
          {/* Subtle glow effect on focus */}
          <div className="absolute inset-0 rounded-full -z-10 opacity-0 focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" 
               style={{ 
                 boxShadow: "0 0 20px rgba(249, 115, 22, 0.1)", 
                 filter: "blur(8px)" 
               }}>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;

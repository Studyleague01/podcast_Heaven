import { useState, useEffect } from "react";
import { useSearchStore } from "@/store/index";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const { searchQuery } = useSearchStore();
  const [query, setQuery] = useState(searchQuery);
  
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="flex w-full h-10">
          {/* Enhanced search field with modern design */}
          <div className="grow flex items-center h-full group border border-gray-200 dark:border-zinc-700/80 rounded-l-full overflow-hidden hover:border-gray-300 dark:hover:border-zinc-600 focus-within:border-orange-500 dark:focus-within:border-orange-500 focus-within:shadow-[0_0_0_2px_rgba(249,115,22,0.2)] dark:focus-within:shadow-[0_0_0_2px_rgba(249,115,22,0.15)] transition-all duration-200 bg-gray-50/90 dark:bg-zinc-800/50 backdrop-blur-sm">
            {/* Animated Search icon */}
            <div className="pl-4 text-gray-400 group-focus-within:text-orange-500 transition-colors">
              <span className="material-icons text-[18px]">search</span>
            </div>
            
            <input 
              type="text" 
              className="h-full w-full py-1 px-3 bg-transparent border-0 focus:outline-none text-gray-800 dark:text-gray-200 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Search podcasts, channels, or topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            
            {/* Enhanced Clear button with animation */}
            {query && (
              <button 
                type="button"
                className="w-8 h-8 flex items-center justify-center mr-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full transition-all"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <span className="material-icons text-[18px]">close</span>
              </button>
            )}
          </div>
          
          {/* Enhanced submit button with orange accent */}
          <button 
            type="submit"
            className="h-full bg-orange-500 hover:bg-orange-600 px-4 rounded-r-full border border-l-0 border-orange-500 hover:border-orange-600 text-white transition-all duration-200 shadow-sm flex items-center justify-center"
            aria-label="Search"
          >
            <span className="material-icons text-[18px]">search</span>
          </button>
        </div>
        
        {/* Search suggestions - could be enabled in the future */}
        {/* query.length > 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 max-h-60 overflow-y-auto z-50">
            <div className="p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">Suggestions</div>
              <div className="flex flex-col">
                {["podcast name", "another suggestion"].map((suggestion, index) => (
                  <button
                    key={index}
                    className="px-3 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md text-sm flex items-center"
                    onClick={() => {
                      setQuery(suggestion);
                      onSearch(suggestion);
                    }}
                  >
                    <span className="material-icons text-gray-400 text-sm mr-2">search</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) */}
      </form>
    </div>
  );
};

export default SearchBar;

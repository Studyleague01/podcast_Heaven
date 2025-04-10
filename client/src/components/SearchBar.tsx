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
      <form onSubmit={handleSubmit} className="flex items-center max-w-[500px] mx-auto">
        <div className="flex w-full h-9">
          {/* Better search field with clean YouTube style */}
          <div className="grow flex items-center h-full border border-gray-300 dark:border-zinc-700 rounded-l-full overflow-hidden hover:border-gray-400 dark:hover:border-zinc-600 focus-within:border-orange-500 dark:focus-within:border-orange-500 focus-within:shadow-sm transition-colors">
            {/* Search icon */}
            <div className="pl-3 text-gray-500">
              <span className="material-icons text-[18px]">search</span>
            </div>
            
            <input 
              type="text" 
              className="h-full w-full py-1 px-2 bg-transparent border-0 focus:outline-none text-gray-800 dark:text-gray-200 text-sm"
              placeholder="Search podcasts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            
            {/* Clear button - only show when text exists */}
            {query && (
              <button 
                type="button"
                className="px-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <span className="material-icons text-[16px]">close</span>
              </button>
            )}
          </div>
          
          {/* Better submit button - YouTube style */}
          <button 
            type="submit"
            className="h-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 px-4 rounded-r-full border border-l-0 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 transition-colors"
            aria-label="Search"
          >
            <span className="material-icons text-[18px]">search</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;

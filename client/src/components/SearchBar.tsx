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
    <div className="relative w-full max-w-md mx-2">
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="w-full py-2 px-4 pr-10 rounded-full border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground" 
          placeholder="Search podcasts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          type="submit"
          className="absolute right-3 top-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="material-icons">search</span>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;

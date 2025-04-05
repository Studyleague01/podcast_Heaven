import { useState } from "react";
import { useLocation } from "wouter";
import SearchBar from "./SearchBar";
import { useSearchStore } from "@/store/index";

const Header = () => {
  const [, navigate] = useLocation();
  const { setSearchQuery } = useSearchStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate('/');
  };
  
  return (
    <header className="bg-background border-b border-border/20 sticky top-0 z-10 dark:bg-background/95 dark:backdrop-blur-md">
      <div className="container mx-auto px-2 py-3 flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => {
            setSearchQuery(''); // Clear search when going to home
            navigate('/');
          }}
        >
          <span className="material-icons text-primary mr-2">podcasts</span>
          <h1 className="text-xl font-bold text-foreground">
            <span className="text-primary">Podcast</span> Heaven
          </h1>
        </div>
        
        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-4 mr-4">
          <button 
            className="flex items-center text-foreground hover:text-primary transition-colors"
            onClick={() => {
              setSearchQuery('');
              navigate('/');
            }}
          >
            <span className="material-icons mr-1">home</span>
            Home
          </button>
        </div>
        
        <SearchBar onSearch={handleSearch} />
        
        <button 
          className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-icons">menu</span>
        </button>
        
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-t border-border/20 shadow-md md:hidden dark:bg-background/95 dark:backdrop-blur-md">
            <nav className="container mx-auto px-4 py-2">
              <ul>
                <li className="py-2">
                  <button 
                    className="text-primary font-medium w-full text-left hover:text-primary/80 transition-colors"
                    onClick={() => {
                      setSearchQuery('');
                      navigate('/');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Home
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

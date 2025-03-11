import { useState } from 'react';
import { navigateToProxy } from '@/lib/proxyService';
import { HistoryItem } from '@/types';

interface SearchBarProps {
  addToHistory: (item: HistoryItem) => void;
  showNotification: (title: string, message: string) => void;
}

const SearchBar = ({ addToHistory, showNotification }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    
    showNotification('Launching Proxy', `Navigating to: ${trimmedQuery}`);
    
    // Add to history and navigate to proxy
    try {
      navigateToProxy(trimmedQuery, addToHistory);
    } catch (error) {
      console.error('Navigation error:', error);
      showNotification('Error', 'Failed to load the requested page');
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-6 relative">
      {/* Glow effect that appears when the search bar is focused */}
      <div 
        className={`absolute inset-0 -m-1 bg-gradient-to-r from-purple-500/25 via-indigo-500/25 to-cyan-400/25 rounded-[18px] blur-lg transition-opacity duration-500 ${
          isFocused ? 'opacity-100' : 'opacity-0'
        }`}
      ></div>
      
      <div className="relative z-10">
        <div className="flex items-center bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
          {/* Search Icon */}
          <div className="pl-5 text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          {/* Input field */}
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search the cosmos or enter a URL..." 
            className="w-full bg-transparent py-4 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-0 transition-all duration-300"
            aria-label="Search or enter URL"
          />
          
          {/* Submit button */}
          <button 
            type="submit" 
            className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white py-4 px-6 transition-all duration-300 flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/20"
            aria-label="Go"
          >
            <span className="mr-1">Go</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 px-1">
        <p className="text-xs text-slate-400">Powered by <span className="text-purple-400 font-medium">foreverkyx.lavipet.info</span></p>
        <p className="text-xs text-slate-400">For educational purposes only</p>
      </div>
    </form>
  );
};

export default SearchBar;

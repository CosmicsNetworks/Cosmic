import { useState, useEffect } from 'react';
import { HistoryItem } from '@/types';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  historyItems: HistoryItem[];
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
  showNotification: (title: string, message: string) => void;
}

const RecentActivity = ({ 
  historyItems, 
  clearHistory, 
  removeHistoryItem,
  showNotification
}: RecentActivityProps) => {
  
  const handleClearHistory = () => {
    clearHistory();
    showNotification('History Cleared', 'Your browsing history has been cleared');
  };

  const handleRemoveItem = (id: string) => {
    removeHistoryItem(id);
  };

  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  return (
    <section className="max-w-3xl mx-auto bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-xl p-6 mb-16">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h2 className="font-heading text-xl font-semibold">Recent Activity</h2>
        </div>
        <button 
          onClick={handleClearHistory}
          className="text-red-400 hover:text-red-300 transition-colors text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg> Clear
        </button>
      </div>

      {/* Empty state */}
      {historyItems.length === 0 ? (
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p className="text-gray-400">No recent activity</p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {historyItems.map((item) => (
            <li 
              key={item.id} 
              className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-lg p-3 flex justify-between items-center hover:bg-slate-700/60 transition-colors group"
            >
              <div className="flex items-center">
                {item.icon === 'globe' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                )}
                {item.icon === 'google' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="21.17" y1="8" x2="12" y2="8"></line>
                    <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                    <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                  </svg>
                )}
                {item.icon === 'youtube' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                )}
                {item.icon === 'book' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                )}
                <div>
                  <h4 className="text-white font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-400">{new URL(item.url).hostname}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-3">{formatTime(item.timestamp)}</span>
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RecentActivity;

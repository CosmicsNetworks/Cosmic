import { QuickLink } from '@/types';
import { navigateToProxy } from '@/lib/proxyService';

interface QuickLinksProps {
  addToHistory: (item: any) => void;
}

const QuickLinks = ({ addToHistory }: QuickLinksProps) => {
  const quickLinks: QuickLink[] = [
    {
      id: '1',
      name: 'Google',
      icon: 'search',
      url: 'https://www.google.com'
    },
    {
      id: '2',
      name: 'YouTube',
      icon: 'video',
      url: 'https://www.youtube.com'
    },
    {
      id: '3',
      name: 'Wikipedia',
      icon: 'book',
      url: 'https://www.wikipedia.org'
    },
    {
      id: '4',
      name: 'Games',
      icon: 'gamepad',
      url: 'https://www.coolmathgames.com'
    },
    {
      id: '5',
      name: 'Weather',
      icon: 'cloud',
      url: 'https://www.weather.com'
    },
    {
      id: '6',
      name: 'News',
      icon: 'globe',
      url: 'https://news.google.com'
    }
  ];

  const handleQuickLink = (link: QuickLink) => {
    navigateToProxy(link.url, addToHistory);
  };

  // Function to get random rotation for planet tilt effect
  const getRandomRotation = () => {
    const rotations = ['-rotate-3', 'rotate-0', 'rotate-3'];
    return rotations[Math.floor(Math.random() * rotations.length)];
  };

  return (
    <div className="mt-8 mb-4">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="4"></circle>
          <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
          <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
          <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
          <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
          <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
        </svg>
        Cosmic Destinations
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {quickLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => handleQuickLink(link)}
            className={`relative bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-4 text-center transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 group ${getRandomRotation()}`}
          >
            {/* Subtle glow behind icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/5 to-cyan-500/5 blur-xl"></div>
            </div>
            
            <div className="flex flex-col items-center justify-center relative">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-purple-500/30">
                {link.icon === 'search' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                )}
                {link.icon === 'video' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 group-hover:text-red-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                )}
                {link.icon === 'book' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                )}
                {link.icon === 'gamepad' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="12" x2="10" y2="12"></line>
                    <line x1="8" y1="10" x2="8" y2="14"></line>
                    <line x1="15" y1="13" x2="15.01" y2="13"></line>
                    <line x1="18" y1="11" x2="18.01" y2="11"></line>
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  </svg>
                )}
                {link.icon === 'cloud' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                  </svg>
                )}
                {link.icon === 'globe' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 group-hover:text-orange-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                )}
              </div>
              <p className="text-sm font-medium text-white group-hover:text-purple-200 transition-colors">{link.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;

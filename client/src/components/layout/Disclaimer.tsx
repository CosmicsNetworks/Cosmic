import { useState } from 'react';

const Disclaimer = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-600 text-white text-center py-1 px-4 z-50 flex justify-between items-center">
      <div></div>
      <p className="font-bold tracking-wide text-sm md:text-base">⚠️ ONLY FOR EDUCATIONAL PURPOSES ⚠️</p>
      <button 
        onClick={() => setVisible(false)} 
        className="text-white hover:text-yellow-200 transition-colors"
        aria-label="Close disclaimer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export default Disclaimer;

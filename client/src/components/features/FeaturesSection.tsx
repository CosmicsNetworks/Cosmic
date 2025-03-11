import { Feature } from '@/types';

const FeaturesSection = () => {
  const features: Feature[] = [
    {
      id: '1',
      name: 'Tab Cloaking',
      description: 'Hide your browsing activity',
      icon: 'lock'
    },
    {
      id: '2',
      name: 'Privacy Protection',
      description: 'Enhanced security measures',
      icon: 'shield'
    },
    {
      id: '3',
      name: 'Fast Browsing',
      description: 'Optimized for speed',
      icon: 'zap'
    },
    {
      id: '4',
      name: 'History Control',
      description: 'Manage your data easily',
      icon: 'clock'
    }
  ];

  return (
    <section className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-xl p-6 shadow-lg h-full">
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <h2 className="font-heading text-xl font-semibold">Features</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {features.map(feature => (
          <div 
            key={feature.id} 
            className="bg-slate-800/50 backdrop-blur-lg border border-white/10 p-4 rounded-lg flex flex-col items-center text-center hover:bg-slate-700/60 transition-colors"
          >
            {feature.icon === 'lock' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            )}
            {feature.icon === 'shield' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            )}
            {feature.icon === 'zap' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            )}
            {feature.icon === 'clock' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            )}
            <h3 className="font-medium text-white text-sm md:text-base">{feature.name}</h3>
            <p className="text-xs text-gray-300 mt-1">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;

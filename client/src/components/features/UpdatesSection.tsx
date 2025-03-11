import { Update } from '@/types';

const UpdatesSection = () => {
  const updates: Update[] = [
    {
      id: '1',
      title: 'Improved Speed',
      description: 'Enhanced proxy performance for faster browsing',
      date: 'May 15, 2023'
    },
    {
      id: '2',
      title: 'New Tab Cloaking Feature',
      description: 'Disguise your browsing sessions with our new tab cloaker',
      date: 'May 10, 2023'
    },
    {
      id: '3',
      title: 'Improved Security',
      description: 'Enhanced encryption and privacy features',
      date: 'May 3, 2023'
    }
  ];

  return (
    <section className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-xl p-6 shadow-lg h-full">
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        <h2 className="font-heading text-xl font-semibold">Latest Updates</h2>
      </div>
      <div className="space-y-4">
        {updates.map(update => (
          <div key={update.id} className="border-l-2 border-purple-500 pl-4 py-1">
            <h3 className="font-medium text-white">{update.title}</h3>
            <p className="text-sm text-gray-300">{update.description}</p>
            <p className="text-xs text-gray-400 mt-1">{update.date}</p>
          </div>
        ))}
      </div>
      <button className="mt-4 text-cyan-400 text-sm hover:text-purple-500 transition-colors flex items-center">
        View all updates 
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </section>
  );
};

export default UpdatesSection;

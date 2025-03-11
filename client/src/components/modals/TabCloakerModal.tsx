import { useState } from 'react';
import { useModal } from '@/lib/modalContext';
import { TabCloaking, defaultTabCloaking } from '@/types';

interface TabCloakerModalProps {
  cloakSettings: TabCloaking;
  updateCloakSettings: (settings: TabCloaking) => void;
  showNotification: (title: string, message: string) => void;
}

const TabCloakerModal = ({
  cloakSettings,
  updateCloakSettings,
  showNotification
}: TabCloakerModalProps) => {
  const { activeModal, closeModal } = useModal();
  const [formState, setFormState] = useState<TabCloaking>(cloakSettings);

  const presets = [
    { title: 'Google', iconType: 'google', icon: 'search' },
    { title: 'Google Classroom', iconType: 'classroom', icon: 'book-open' },
    { title: 'Google Docs', iconType: 'docs', icon: 'file-text' },
    { title: 'Microsoft', iconType: 'microsoft', icon: 'grid' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value
    });
  };

  const applyPreset = (preset: { title: string, iconType: string }) => {
    setFormState({
      title: preset.title,
      iconType: preset.iconType
    });
  };

  const handleApplyCloaking = () => {
    updateCloakSettings(formState);
    
    // Actually change the document title
    document.title = formState.title;
    
    // Change favicon (this would usually use various icon URLs based on iconType)
    // In a real implementation, we'd set different favicons based on the iconType
    
    showNotification('Tab Cloaker', 'Tab disguise applied successfully');
    closeModal();
  };

  if (activeModal !== 'tabCloaker') return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-slate-800/95 backdrop-blur-lg border border-white/10 rounded-xl max-w-md w-11/12">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading font-semibold">Tab Cloaker</h2>
            <button 
              onClick={closeModal} 
              className="text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            Change how this tab appears in your browser history and taskbar.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="tab-title" className="block text-sm font-medium text-gray-300 mb-1">Tab Title</label>
              <input 
                type="text" 
                id="tab-title" 
                name="title"
                value={formState.title}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            
            <div>
              <label htmlFor="iconType" className="block text-sm font-medium text-gray-300 mb-1">Tab Icon</label>
              <div className="flex items-center space-x-2">
                <select 
                  id="iconType" 
                  name="iconType"
                  value={formState.iconType}
                  onChange={handleInputChange}
                  className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="google">Google</option>
                  <option value="classroom">Google Classroom</option>
                  <option value="docs">Google Docs</option>
                  <option value="drive">Google Drive</option>
                  <option value="canvas">Canvas</option>
                  <option value="custom">Custom URL</option>
                </select>
                <div className="w-10 h-10 flex items-center justify-center bg-slate-900/80 backdrop-blur-lg border border-white/10 rounded-lg">
                  {formState.iconType === 'google' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="4"></circle>
                      <line x1="21.17" y1="8" x2="12" y2="8"></line>
                      <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                      <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                    </svg>
                  )}
                  {formState.iconType === 'classroom' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  )}
                  {(formState.iconType !== 'google' && formState.iconType !== 'classroom') && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  )}
                </div>
              </div>
            </div>
            
            {formState.iconType === 'custom' && (
              <div>
                <label htmlFor="customIconUrl" className="block text-sm font-medium text-gray-300 mb-1">Custom Icon URL</label>
                <input 
                  type="text" 
                  id="customIconUrl" 
                  name="customIconUrl"
                  value={formState.customIconUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/favicon.ico" 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            )}
            
            <div className="pt-4">
              <h3 className="text-cyan-400 font-medium mb-3">Preset Disguises</h3>
              <div className="grid grid-cols-2 gap-3">
                {presets.map((preset, index) => (
                  <button 
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="bg-slate-900/80 backdrop-blur-lg border border-white/10 p-3 rounded-lg text-center hover:bg-slate-700/80 transition-colors"
                  >
                    {preset.icon === 'search' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    )}
                    {preset.icon === 'book-open' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    )}
                    {preset.icon === 'file-text' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    )}
                    {preset.icon === 'grid' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                    )}
                    <span className="text-sm">{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end">
            <button 
              onClick={closeModal}
              className="px-4 py-2 text-white text-sm mr-2"
            >
              Cancel
            </button>
            <button 
              onClick={handleApplyCloaking}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium"
            >
              Apply Cloaking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabCloakerModal;

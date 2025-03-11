import { useState } from 'react';
import { useModal } from '@/lib/modalContext';
import { UserSettings, defaultSettings } from '@/types';

interface SettingsModalProps {
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => void;
  clearAllData: () => void;
  showNotification: (title: string, message: string) => void;
}

const SettingsModal = ({ 
  settings, 
  updateSettings, 
  clearAllData, 
  showNotification 
}: SettingsModalProps) => {
  const { activeModal, closeModal } = useModal();
  const [formState, setFormState] = useState<UserSettings>(settings);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormState({
        ...formState,
        [name]: checkbox.checked
      });
    } else {
      setFormState({
        ...formState,
        [name]: value
      });
    }
  };

  const handleSaveSettings = () => {
    updateSettings(formState);
    showNotification('Settings Saved', 'Your settings have been updated');
    closeModal();
  };

  const handleClearAllData = () => {
    clearAllData();
    showNotification('Data Cleared', 'All your data has been cleared');
    closeModal();
  };

  if (activeModal !== 'settings') return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-slate-800/95 backdrop-blur-lg border border-white/10 rounded-xl max-w-md w-11/12 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading font-semibold">Settings</h2>
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
          
          <div className="space-y-6">
            {/* Appearance */}
            <div>
              <h3 className="text-cyan-400 font-medium mb-3">Appearance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="theme" className="text-sm">Theme</label>
                  <select 
                    id="theme" 
                    name="theme"
                    value={formState.theme} 
                    onChange={handleInputChange}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="dark">Dark Space</option>
                    <option value="light">Light Nova</option>
                    <option value="blue">Deep Blue</option>
                    <option value="purple">Cosmic Purple</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="fontSize" className="text-sm">Font Size</label>
                  <select 
                    id="fontSize" 
                    name="fontSize"
                    value={formState.fontSize} 
                    onChange={handleInputChange}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm">Motion Effects</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="motionEffects"
                      className="sr-only peer" 
                      checked={formState.motionEffects}
                      onChange={(e) => setFormState({
                        ...formState,
                        motionEffects: e.target.checked
                      })}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-cyan-400 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Privacy */}
            <div>
              <h3 className="text-cyan-400 font-medium mb-3">Privacy & Data</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Save History</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="saveHistory"
                      className="sr-only peer" 
                      checked={formState.saveHistory}
                      onChange={(e) => setFormState({
                        ...formState,
                        saveHistory: e.target.checked
                      })}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-cyan-400 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="autoClearHistory" className="text-sm">Auto-clear History</label>
                  <select 
                    id="autoClearHistory" 
                    name="autoClearHistory"
                    value={formState.autoClearHistory} 
                    onChange={handleInputChange}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="never">Never</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="exit">On Exit</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleClearAllData}
                  className="w-full py-2 mt-2 bg-red-500/30 hover:bg-red-500/50 transition-colors text-white rounded-lg text-sm font-medium"
                >
                  Clear All Data
                </button>
              </div>
            </div>
            
            {/* Advanced */}
            <div>
              <h3 className="text-cyan-400 font-medium mb-3">Advanced</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Page Preloading</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="preloading"
                      className="sr-only peer" 
                      checked={formState.preloading}
                      onChange={(e) => setFormState({
                        ...formState,
                        preloading: e.target.checked
                      })}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-cyan-400 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="proxyMethod" className="text-sm">Proxy Method</label>
                  <select 
                    id="proxyMethod" 
                    name="proxyMethod"
                    value={formState.proxyMethod} 
                    onChange={handleInputChange}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="auto">Auto (Recommended)</option>
                    <option value="direct">Direct</option>
                    <option value="stealth">Stealth Mode</option>
                  </select>
                </div>
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
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

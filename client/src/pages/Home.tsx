import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/layout/Header';
import Background from '@/components/layout/Background';
import SearchBar from '@/components/search/SearchBar';
import QuickLinks from '@/components/search/QuickLinks';
import UpdatesSection from '@/components/features/UpdatesSection';
import FeaturesSection from '@/components/features/FeaturesSection';
import RecentActivity from '@/components/history/RecentActivity';
import Disclaimer from '@/components/layout/Disclaimer';
import Footer from '@/components/layout/Footer';
import Notification from '@/components/ui/Notification';
import SettingsModal from '@/components/modals/SettingsModal';
import TabCloakerModal from '@/components/modals/TabCloakerModal';
import HelpModal from '@/components/modals/HelpModal';
import { ModalProvider } from '@/lib/modalContext';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { 
  HistoryItem, 
  UserSettings, 
  defaultSettings,
  TabCloaking,
  defaultTabCloaking,
  Notification as NotificationType
} from '@/types';

const Home = () => {
  // Local storage hooks
  const [historyItems, setHistoryItems] = useLocalStorage<HistoryItem[]>('cosmiclink-history', []);
  const [settings, setSettings] = useLocalStorage<UserSettings>('cosmiclink-settings', defaultSettings);
  const [cloakSettings, setCloakSettings] = useLocalStorage<TabCloaking>('cosmiclink-cloak', defaultTabCloaking);
  
  // Notification state
  const [notification, setNotification] = useState<NotificationType>({
    title: '',
    message: '',
    visible: false
  });

  // Show notification helper
  const showNotification = (title: string, message: string) => {
    setNotification({
      title,
      message,
      visible: true
    });
  };

  // History management
  const addToHistory = (item: HistoryItem) => {
    if (!settings.saveHistory) return;
    
    setHistoryItems(prev => {
      // Remove duplicates if the URL already exists
      const filtered = prev.filter(historyItem => historyItem.url !== item.url);
      // Add new item at the beginning
      return [item, ...filtered];
    });
  };

  const clearHistory = () => {
    setHistoryItems([]);
  };

  const removeHistoryItem = (id: string) => {
    setHistoryItems(prev => prev.filter(item => item.id !== id));
  };
  
  // Settings management
  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    
    // Apply settings immediately 
    // (in a full implementation, this would update theme, font size, etc.)
  };
  
  // Tab cloaking management
  const updateCloakSettings = (newSettings: TabCloaking) => {
    setCloakSettings(newSettings);
    // Actual title change happens in the TabCloakerModal component
  };
  
  // Clear all data
  const clearAllData = () => {
    clearHistory();
    setSettings(defaultSettings);
    setCloakSettings(defaultTabCloaking);
    localStorage.clear();
  };
  
  // Apply tab cloaking on page load
  useEffect(() => {
    if (cloakSettings.title) {
      document.title = cloakSettings.title;
    }
  }, [cloakSettings]);

  return (
    <ModalProvider>
      <Background />
      <Disclaimer />
      <Notification 
        notification={notification} 
        setNotification={setNotification} 
      />
      
      <div className="container mx-auto px-4 pt-16 pb-10">
        <Header />
        
        <section className="max-w-3xl mx-auto mb-14">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <SearchBar 
              addToHistory={addToHistory} 
              showNotification={showNotification} 
            />
            <QuickLinks addToHistory={addToHistory} />
          </div>
        </section>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
          <UpdatesSection />
          <FeaturesSection />
        </div>
        
        <RecentActivity 
          historyItems={historyItems}
          clearHistory={clearHistory}
          removeHistoryItem={removeHistoryItem}
          showNotification={showNotification}
        />
      </div>
      
      <Footer />
      
      <SettingsModal 
        settings={settings}
        updateSettings={updateSettings}
        clearAllData={clearAllData}
        showNotification={showNotification}
      />
      
      <TabCloakerModal 
        cloakSettings={cloakSettings}
        updateCloakSettings={updateCloakSettings}
        showNotification={showNotification}
      />
      
      <HelpModal />
    </ModalProvider>
  );
};

export default Home;

import React, { useState } from 'react';
import { useModal } from '@/lib/modalContext';
import { useToast } from "@/hooks/use-toast";
import AuthModal from '@/components/modals/AuthModal';
import PremiumModal from '@/components/modals/PremiumModal';
import AdminPanel from '@/components/admin/AdminPanel';
import { defaultSettings, defaultTabCloaking, UserSettings, TabCloaking } from '@/types';

interface ModalsProps {
  // These props will be passed through to the individual modals
  clearAllData?: () => void;
}

const Modals: React.FC<ModalsProps> = ({ clearAllData = () => {} }) => {
  const { activeModal, closeModal, openModal } = useModal();
  const { toast } = useToast();
  
  // State for settings and notifications
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [tabCloakSettings, setTabCloakSettings] = useState<TabCloaking>(defaultTabCloaking);
  
  // Function to handle notifications from modals
  const showNotification = (title: string, message: string) => {
    toast({
      title,
      description: message,
      duration: 3000,
    });
  };
  
  // Functions to update state
  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };
  
  const updateCloakSettings = (newSettings: TabCloaking) => {
    setTabCloakSettings(newSettings);
  };

  // Function to open auth modal with login/signup selection
  const openAuthModal = (initialView: 'login' | 'signup' = 'login') => {
    openModal(initialView);
  };
  
  return (
    <>
      {/* We'll add the SettingsModal, TabCloakerModal, and HelpModal later */}
      
      {/* Auth Modal */}
      {(activeModal === 'login' || activeModal === 'signup') && (
        <AuthModal
          isOpen={activeModal === 'login' || activeModal === 'signup'}
          onClose={closeModal}
          showNotification={showNotification}
          initialView={activeModal as 'login' | 'signup'}
        />
      )}
      
      {/* Premium Modal */}
      {activeModal === 'premium' && (
        <PremiumModal
          isOpen={activeModal === 'premium'}
          onClose={closeModal}
          showNotification={showNotification}
          openAuthModal={() => openAuthModal('login')}
        />
      )}
      
      {/* Admin Panel */}
      {activeModal === 'adminPanel' && (
        <AdminPanel
          isOpen={activeModal === 'adminPanel'}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default Modals;
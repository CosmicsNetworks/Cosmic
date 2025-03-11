import { createContext, useContext, useState, ReactNode } from 'react';
import { ModalType } from '@/types';

// Define the modal context type
interface ModalContextType {
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
}

// Create the modal context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

// Create the ModalProvider component
export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Open a modal
  const openModal = (modal: ModalType) => {
    setActiveModal(modal);
  };

  // Close the active modal
  const closeModal = () => {
    setActiveModal(null);
  };

  // Provide the modal context to the children
  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use the modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
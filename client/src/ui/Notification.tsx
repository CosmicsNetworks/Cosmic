import { useState, useEffect, useCallback } from 'react';
import { Notification as NotificationType } from '@/types';

interface NotificationProps {
  notification: NotificationType;
  setNotification: (notification: NotificationType) => void;
}

const Notification = ({ notification, setNotification }: NotificationProps) => {
  const hideNotification = useCallback(() => {
    setNotification({ ...notification, visible: false });
  }, [notification, setNotification]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (notification.visible) {
      timer = setTimeout(hideNotification, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [notification.visible, hideNotification]);

  if (!notification.visible) return null;

  return (
    <div 
      className="fixed top-12 right-4 z-50 bg-space-blue/50 backdrop-blur-lg border border-white/10 rounded-lg p-4 max-w-xs shadow-lg transition-transform duration-300 transform-gpu"
      style={{ transform: notification.visible ? 'translateY(0)' : 'translateY(-100px)' }}
    >
      <div className="flex items-center">
        <div className="text-cyan-400 mr-3">
          <i className="fas fa-info-circle text-xl"></i>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white">{notification.title}</h4>
          <p className="text-sm text-gray-300">{notification.message}</p>
        </div>
        <button 
          onClick={hideNotification} 
          className="text-gray-400 hover:text-white ml-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notification;

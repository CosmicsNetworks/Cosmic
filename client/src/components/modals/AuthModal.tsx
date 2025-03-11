import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Login from '@/components/auth/Login';
import Signup from '@/components/auth/Signup';
import { useAuth } from '@/lib/authContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification: (title: string, message: string) => void;
  initialView?: 'login' | 'signup';
}

const AuthModal = ({ isOpen, onClose, showNotification, initialView = 'login' }: AuthModalProps) => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialView);
  
  // Auto-close if user is authenticated
  if (isAuthenticated && isOpen) {
    onClose();
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
          <TabsList className="grid grid-cols-2 mb-2 mx-auto bg-black/50 border border-blue-500/30">
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0">
            <Login 
              onSwitchToSignup={() => setActiveTab('signup')} 
              showNotification={showNotification}
              onSuccess={onClose}
            />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-0">
            <Signup
              onSwitchToLogin={() => setActiveTab('login')}
              showNotification={showNotification}
              onSuccess={() => {
                setActiveTab('login');
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
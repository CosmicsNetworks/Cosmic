import { Dialog, DialogContent } from '@/components/ui/dialog';
import PremiumCode from '@/components/auth/PremiumCode';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { RocketIcon, StarIcon, ZapIcon, Activity } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification: (title: string, message: string) => void;
  openAuthModal?: () => void;
}

const PremiumModal = ({ isOpen, onClose, showNotification, openAuthModal }: PremiumModalProps) => {
  const { isAuthenticated, premiumStatus } = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-4xl p-0 border-none bg-gradient-to-b from-black/80 to-purple-950/20 backdrop-blur-md overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left side: Features Showcase */}
          <div className="bg-black/40 p-6 space-y-6 border-r border-purple-500/10">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                <StarIcon className="h-6 w-6 text-yellow-400" />
                Premium Features
              </h2>
              <p className="text-gray-400 text-sm">
                Unlock the full power of our proxy service with premium access
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/10 p-2 rounded-full group-hover:bg-blue-500/20 transition-all">
                    <ZapIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-400">Instant Search</h3>
                    <p className="text-xs text-gray-400">No more waiting! Premium users get instant search results with zero loading delay.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500/10 p-2 rounded-full group-hover:bg-purple-500/20 transition-all">
                    <RocketIcon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-purple-400">Advanced Search Tools</h3>
                    <p className="text-xs text-gray-400">Access advanced filtering options, custom search engines, and location-based results.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4 border border-indigo-500/20 hover:border-indigo-500/40 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-500/10 p-2 rounded-full group-hover:bg-indigo-500/20 transition-all">
                    <Activity className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-indigo-400">Search History & Analytics</h3>
                    <p className="text-xs text-gray-400">Track your search history, analyze trends, and get better search strategies.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {!isAuthenticated && (
              <div className="mt-6 bg-black/30 p-4 rounded-lg border border-blue-500/20">
                <p className="text-sm text-gray-300 mb-3">
                  You need to be logged in to redeem premium codes and access premium features.
                </p>
                <Button 
                  variant="default" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  onClick={openAuthModal}
                >
                  Login or Create Account
                </Button>
              </div>
            )}
          </div>
          
          {/* Right side: Code Redemption */}
          <div className="p-6 flex items-center justify-center">
            <PremiumCode showNotification={showNotification} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;
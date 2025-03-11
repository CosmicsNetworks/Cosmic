
import React from 'react';
import { X, HelpCircle, Search, LifeBuoy, MessageSquare, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-400" />
            Help & Support
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search for help topics..." 
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm text-slate-400 font-medium">COMMON QUESTIONS</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-left pl-3 h-auto py-2">
                How do I redeem a premium code?
              </Button>
              <Button variant="ghost" className="w-full justify-start text-left pl-3 h-auto py-2">
                How do I change my password?
              </Button>
              <Button variant="ghost" className="w-full justify-start text-left pl-3 h-auto py-2">
                What is tab cloaking?
              </Button>
              <Button variant="ghost" className="w-full justify-start text-left pl-3 h-auto py-2">
                How do I report a bug?
              </Button>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h3 className="text-sm text-slate-400 font-medium">NEED MORE HELP?</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="bg-slate-800 border-slate-700 flex flex-col h-auto p-3">
                <LifeBuoy className="h-5 w-5 mb-1" />
                <span>Help Center</span>
              </Button>
              <Button variant="outline" className="bg-slate-800 border-slate-700 flex flex-col h-auto p-3">
                <MessageSquare className="h-5 w-5 mb-1" />
                <span>Live Chat</span>
              </Button>
              <Button variant="outline" className="bg-slate-800 border-slate-700 flex flex-col h-auto p-3 col-span-2">
                <Mail className="h-5 w-5 mb-1" />
                <span>Email Support</span>
              </Button>
            </div>
          </div>
          
          <div className="text-center pt-2">
            <p className="text-sm text-gray-400">If you need further assistance, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;

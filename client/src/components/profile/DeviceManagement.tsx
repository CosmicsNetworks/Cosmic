import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { HardDrive, Smartphone, Laptop, Monitor, Trash2, Lock, Shield, Loader2 } from 'lucide-react';

interface DeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const DeviceManagement = () => {
  const { user, isPremium } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<DeviceSession | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/devices');
      if (response.data.sessions) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching device sessions:', error);
      toast.error('Failed to load device sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setIsRevoking(true);
      const response = await axios.delete(`/api/users/devices/${sessionId}`);
      if (response.data.message) {
        setSessions(sessions.filter(session => session.id !== sessionId));
        toast.success('Device logged out successfully');
        setShowConfirmDialog(false);
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Failed to log out device');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      setIsRevoking(true);
      const response = await axios.delete('/api/users/devices');
      if (response.data.message) {
        // Keep only the current session
        setSessions(sessions.filter(session => session.isCurrent));
        toast.success('All other devices logged out successfully');
        setShowLogoutAllDialog(false);
      }
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      toast.error('Failed to log out all devices');
    } finally {
      setIsRevoking(false);
    }
  };

  // Format time relative to now
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'Just now';

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;

    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo ago`;
  };

  const getDeviceIcon = (deviceName: string, operatingSystem: string) => {
    if (deviceName.includes('Phone') || operatingSystem.includes('Android') || operatingSystem.includes('iOS')) {
      return <Smartphone className="h-8 w-8 text-blue-400" />;
    } else if (deviceName.includes('Laptop') || operatingSystem.includes('Mac') || operatingSystem.includes('Windows')) {
      return <Laptop className="h-8 w-8 text-purple-400" />;
    } else if (deviceName.includes('Tablet') || operatingSystem.includes('iPad')) {
      return <Monitor className="h-8 w-8 text-green-400" />;
    } else {
      return <HardDrive className="h-8 w-8 text-gray-400" />;
    }
  };

  if (!isPremium) {
    return (
      <Card className="border border-amber-500/20 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            Device Management
          </CardTitle>
          <CardDescription>
            Upgrade to Premium to manage device access
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="grid grid-cols-2 gap-4 w-full max-w-md opacity-70">
            <div className="bg-black/20 border border-slate-700 rounded-md p-4 flex items-start space-x-3">
              <Laptop className="h-8 w-8 text-slate-500" />
              <div>
                <div className="h-3 bg-slate-700 rounded w-24 mb-2"></div>
                <div className="h-2 bg-slate-700 rounded w-16 mb-4"></div>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="h-2 bg-slate-700 rounded w-12"></div>
                </div>
              </div>
            </div>
            <div className="bg-black/20 border border-slate-700 rounded-md p-4 flex items-start space-x-3">
              <Smartphone className="h-8 w-8 text-slate-500" />
              <div>
                <div className="h-3 bg-slate-700 rounded w-20 mb-2"></div>
                <div className="h-2 bg-slate-700 rounded w-16 mb-4"></div>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                  <div className="h-2 bg-slate-700 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
          <Lock className="h-10 w-10 text-amber-500/50" />
          <p className="text-sm text-center text-gray-400 max-w-xs">
            Premium users can view and manage all devices that have access to their account, and remotely log out from any device
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black" disabled>
            Premium Feature
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border border-amber-500/20 bg-black/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            Device Management
          </CardTitle>
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-8 text-xs"
            onClick={() => setShowLogoutAllDialog(true)}
            disabled={sessions.length <= 1 || isRevoking}
          >
            Log out all other devices
          </Button>
        </div>
        <CardDescription>
          Manage devices that have access to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <Shield className="h-12 w-12 text-gray-500 mx-auto" />
            <h3 className="text-lg font-medium">No Active Devices</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              There are currently no active sessions on your account
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  session.isCurrent 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-slate-700 hover:border-slate-600 bg-black/20'
                }`}
              >
                <div className="flex-shrink-0">
                  {getDeviceIcon(session.deviceName, session.operatingSystem)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">
                        {session.deviceName}
                        {session.isCurrent && (
                          <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {session.browser} on {session.operatingSystem}
                      </p>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => {
                          setSelectedSession(session);
                          setShowConfirmDialog(true);
                        }}
                        disabled={isRevoking}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${session.isCurrent ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      {session.isCurrent ? 'Active now' : `Last active ${getRelativeTime(session.lastActive)}`}
                    </div>
                    <div>
                      {session.location || 'Unknown location'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Confirm single logout dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-slate-900 border border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out device?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedSession && (
                <span>
                  This will log out your account from {selectedSession.deviceName}.
                  <br />
                  <span className="text-slate-400 text-xs mt-1 block">
                    {selectedSession.browser} on {selectedSession.operatingSystem}
                    {selectedSession.location && ` · ${selectedSession.location}`}
                  </span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking} className="border-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (selectedSession) {
                  handleRevokeSession(selectedSession.id);
                }
              }}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRevoking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm all logout dialog */}
      <AlertDialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
        <AlertDialogContent className="bg-slate-900 border border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out all other devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will log out your account from all devices except the current one.
              Anyone using your account on other devices will need to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking} className="border-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRevokeAllSessions();
              }}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRevoking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Log out all other devices
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default DeviceManagement;
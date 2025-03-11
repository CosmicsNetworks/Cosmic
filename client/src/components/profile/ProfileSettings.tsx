
import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, ShieldCheck, Lock, Key, UserCog } from 'lucide-react';
import TwoFactorAuth from '@/components/auth/TwoFactorAuth';

interface ProfileSettingsProps {
  showNotification: (title: string, message: string) => void;
}

const ProfileSettings = ({ showNotification }: ProfileSettingsProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account preferences and security settings</p>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card className="border border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-purple-400" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium text-gray-400">Username</p>
                    <p className="text-lg">{user?.username}</p>
                  </div>
                  
                  <div className="grid gap-1">
                    <p className="text-sm font-medium text-gray-400">Email</p>
                    <p className="text-lg">{user?.email}</p>
                  </div>
                  
                  <div className="grid gap-1">
                    <p className="text-sm font-medium text-gray-400">Account Type</p>
                    <div className="flex items-center">
                      <p className="text-lg">{user?.isPremium ? 'Premium' : 'Standard'}</p>
                      {user?.isPremium && (
                        <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-medium rounded">
                          PREMIUM
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-1">
                    <p className="text-sm font-medium text-gray-400">Member Since</p>
                    <p className="text-lg">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <TwoFactorAuth showNotification={showNotification} />
            
            <Card className="border border-white/10 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-400" />
                  <CardTitle>Password</CardTitle>
                </div>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-400">
                  Updating your password regularly helps keep your account secure.
                </p>
                
                <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-300">
                    Password last changed on:
                  </p>
                  <p className="text-lg font-medium">
                    Not available
                  </p>
                </div>
                
                {/* Placeholder for change password form */}
                <div className="pt-4">
                  <button className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-black font-medium rounded">
                    Change Password
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-400" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>Manage additional security features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-black/30">
                  <div>
                    <p className="font-medium">Session Management</p>
                    <p className="text-sm text-gray-400">View and manage active sessions</p>
                  </div>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                    Manage
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-black/30">
                  <div>
                    <p className="font-medium">Activity Log</p>
                    <p className="text-sm text-gray-400">View recent account activity</p>
                  </div>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                    View
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-black/30">
                  <div>
                    <p className="font-medium">Download Your Data</p>
                    <p className="text-sm text-gray-400">Export a copy of your data</p>
                  </div>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                    Download
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-400" />
                <CardTitle>App Preferences</CardTitle>
              </div>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-black/30">
                  <div>
                    <p className="font-medium">Appearance</p>
                    <p className="text-sm text-gray-400">Theme: {user?.settings?.theme || 'Dark'}</p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Change
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-black/30">
                  <div>
                    <p className="font-medium">Tab Cloaking</p>
                    <p className="text-sm text-gray-400">
                      Current: {user?.tabCloaking?.title || 'Google Classroom'}
                    </p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Configure
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-black/30">
                  <div>
                    <p className="font-medium">Search History</p>
                    <p className="text-sm text-gray-400">
                      {user?.settings?.saveHistory ? 'Saving history' : 'Not saving history'}
                    </p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Manage
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-black/30">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-gray-400">
                      {user?.settings?.enableNotifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Configure
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;

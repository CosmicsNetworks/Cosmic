import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PremiumCodeGenerator from './PremiumCodeGenerator';
import PremiumCodesList from './PremiumCodesList';
import SupportTickets from './SupportTickets';
import UserManagement from './UserManagement';
import SiteShutdown from './SiteShutdown';
import ActivityLogs from './ActivityLogs';
import SecurityDashboard from './SecurityDashboard';
import IntrusionPrevention from './IntrusionPrevention';
import BotDetection from './BotDetection';
import { 
  Shield, 
  Users, 
  Ticket, 
  Key, 
  Settings, 
  Power, 
  Clock, 
  BarChart,
  Bot,
  Lock,
  Globe,
  Award,
  MessageSquare
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState(0);
  const [pendingTickets, setPendingTickets] = useState(0);
  const [premiumUsers, setPremiumUsers] = useState(0);
  const [securityAlerts, setSecurityAlerts] = useState(0);
  const [isShutdownActive, setIsShutdownActive] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setActiveUsers(data.activeUsers || 0);
          setPendingTickets(data.pendingTickets || 0);
          setPremiumUsers(data.premiumUsers || 0);
          setSecurityAlerts(data.securityAlerts || 4); // Mock data for now
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    const fetchShutdownStatus = async () => {
      try {
        const response = await fetch('/api/admin/shutdown/status', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsShutdownActive(data.isActive);
        }
      } catch (error) {
        console.error('Error fetching shutdown status:', error);
      }
    };

    if (user && user.role === 'admin') {
      fetchStats();
      fetchShutdownStatus();

      // Set up interval to refresh stats every 60 seconds
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <div className="text-sm text-muted-foreground">
          Logged in as <span className="font-medium text-primary">{user?.username}</span> ({user?.role})
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-black/40 backdrop-blur-sm border-indigo-500/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold mt-1">{activeUsers}</h3>
            </div>
            <Users className="h-8 w-8 text-indigo-400 opacity-70" />
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-red-500/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Tickets</p>
              <h3 className="text-2xl font-bold mt-1">{pendingTickets}</h3>
            </div>
            <Ticket className="h-8 w-8 text-red-400 opacity-70" />
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-yellow-500/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Premium Users</p>
              <h3 className="text-2xl font-bold mt-1">{premiumUsers}</h3>
            </div>
            <Key className="h-8 w-8 text-yellow-400 opacity-70" />
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-green-500/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
              <h3 className="text-2xl font-bold mt-1">{securityAlerts}</h3>
            </div>
            <Shield className="h-8 w-8 text-green-400 opacity-70" />
          </CardContent>
        </Card>
      </div>

      {isShutdownActive && (
        <Card className="mb-6 bg-red-950/20 border-red-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Power className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="font-medium text-red-400">Site is in Shutdown Mode</h3>
              <p className="text-sm text-slate-400">
                The site is currently offline for regular users. Only admins can access it.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-10 lg:grid-cols-12 gap-2">
          <TabsTrigger value="security" className="flex items-center gap-1">
            <Shield className="h-4 w-4" /> <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" /> <span className="hidden md:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-1">
            <Key className="h-4 w-4" /> <span className="hidden md:inline">Premium</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-1">
            <Ticket className="h-4 w-4" /> <span className="hidden md:inline">Support</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> <span className="hidden md:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="ips" className="flex items-center gap-1">
            <Lock className="h-4 w-4" /> <span className="hidden md:inline">IPS</span>
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center gap-1">
            <Bot className="h-4 w-4" /> <span className="hidden md:inline">Bot Detection</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" /> <span className="hidden md:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" /> <span className="hidden md:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="shutdown" className="flex items-center gap-1">
            <Power className="h-4 w-4" /> <span className="hidden md:inline">Shutdown</span>
          </TabsTrigger>
          <TabsTrigger value="ip" className="flex items-center gap-1">
            <Globe className="h-4 w-4" /> <span className="hidden md:inline">IP Management</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-1">
            <Award className="h-4 w-4" /> <span className="hidden md:inline">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> <span className="hidden md:inline">Community</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="mt-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="premium" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <PremiumCodeGenerator />
            </div>
            <div>
              <PremiumCodesList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <SupportTickets />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <ActivityLogs />
        </TabsContent>

        <TabsContent value="ips" className="mt-6">
          <IntrusionPrevention />
        </TabsContent>

        <TabsContent value="bots" className="mt-6">
          <BotDetection />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-400" />
                Site Analytics
              </CardTitle>
              <CardDescription>
                Detailed traffic and user engagement analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[600px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Analytics dashboard will be available soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-400" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and security options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                System settings will be implemented soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shutdown" className="mt-6">
          <SiteShutdown />
        </TabsContent>
        <TabsContent value="ip" className="mt-6">
          {/* IP Management Component will go here */}
        </TabsContent>
        <TabsContent value="achievements" className="mt-6">
          {/* Achievements Component will go here */}
        </TabsContent>
        <TabsContent value="community" className="mt-6">
          {/* Community Component will go here */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
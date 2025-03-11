
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/authContext';
import UserManagement from './UserManagement';
import SupportTickets from './SupportTickets';
import PremiumCodes from './PremiumCodes';
import SystemSettings from './SystemSettings';
import SiteShutdown from './SiteShutdown';
import ActivityLogs from './ActivityLogs';
import { Shield, Users, Ticket, Key, Settings, Power, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState(0);
  const [pendingTickets, setPendingTickets] = useState(0);
  const [premiumUsers, setPremiumUsers] = useState(0);
  
  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setActiveUsers(data.activeUsers);
          setPendingTickets(data.pendingTickets);
          setPremiumUsers(data.premiumUsers);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    
    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Logged in as <span className="font-medium text-primary">{user?.username}</span> ({user?.role})
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
      
      {/* Main Admin Panel Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-7 gap-2">
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" /> <span className="hidden md:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-1">
            <Ticket className="h-4 w-4" /> <span className="hidden md:inline">Tickets</span>
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-1">
            <Key className="h-4 w-4" /> <span className="hidden md:inline">Premium</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> <span className="hidden md:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" /> <span className="hidden md:inline">Settings</span>
          </TabsTrigger>
          {user?.role === 'admin' && (
            <TabsTrigger value="shutdown" className="flex items-center gap-1">
              <Power className="h-4 w-4" /> <span className="hidden md:inline">Shutdown</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="tickets" className="space-y-4">
          <SupportTickets />
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-4">
          <PremiumCodes />
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <ActivityLogs />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <SystemSettings />
        </TabsContent>
        
        {user?.role === 'admin' && (
          <TabsContent value="shutdown" className="space-y-4">
            <SiteShutdown />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

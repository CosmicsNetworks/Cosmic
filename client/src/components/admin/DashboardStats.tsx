
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Key,
  Globe,
  Ticket,
  Clock,
  Shield,
  Server,
  BarChart,
  Activity
} from 'lucide-react';

const DashboardStats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [serverLoad, setServerLoad] = useState({
    cpu: 45,
    memory: 52,
    disk: 34,
    uptime: '12d 5h 32m'
  });
  
  const [stats, setStats] = useState({
    totalUsers: 245,
    activeUsers: 32,
    premiumUsers: 67,
    pendingTickets: 3,
    dailyVisits: 234,
    securityAlerts: 5,
    newUsers: {
      today: 12,
      yesterday: 8,
      growth: 50
    },
    trafficSources: [
      { name: 'Direct', value: 45 },
      { name: 'Search', value: 30 },
      { name: 'Social', value: 15 },
      { name: 'Other', value: 10 }
    ]
  });
  
  useEffect(() => {
    // Fetch dashboard stats in a real implementation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <BarChart className="h-6 w-6 text-indigo-400" />
        Dashboard Stats
      </h2>
      
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-indigo-500 border-indigo-500/30"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard statistics...</p>
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-black/40 backdrop-blur-sm border-indigo-500/20">
              <CardContent className="pt-6 pb-4 px-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
                    <div className="flex items-center mt-1 gap-1 text-xs">
                      <Badge className="bg-green-600 hover:bg-green-600 px-1 py-0">+{stats.newUsers.today} today</Badge>
                      <span className="text-muted-foreground">vs {stats.newUsers.yesterday} yesterday</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-indigo-400 opacity-70" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-sm border-amber-500/20">
              <CardContent className="pt-6 pb-4 px-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Premium Users</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.premiumUsers}</h3>
                    <div className="flex items-center mt-1 gap-1 text-xs">
                      <span className="text-amber-400">{Math.round((stats.premiumUsers / stats.totalUsers) * 100)}%</span>
                      <span className="text-muted-foreground">of total users</span>
                    </div>
                  </div>
                  <Key className="h-8 w-8 text-amber-400 opacity-70" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-sm border-blue-500/20">
              <CardContent className="pt-6 pb-4 px-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Visits</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.dailyVisits}</h3>
                    <div className="flex items-center mt-1 gap-1 text-xs">
                      <Badge className="bg-green-600 hover:bg-green-600 px-1 py-0">+12%</Badge>
                      <span className="text-muted-foreground">vs last week</span>
                    </div>
                  </div>
                  <Globe className="h-8 w-8 text-blue-400 opacity-70" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-sm border-red-500/20">
              <CardContent className="pt-6 pb-4 px-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Tickets</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.pendingTickets}</h3>
                    <div className="flex items-center mt-1 text-xs">
                      <span className={stats.pendingTickets > 0 ? "text-red-400" : "text-green-400"}>
                        {stats.pendingTickets > 0 ? 'Needs attention' : 'All resolved'}
                      </span>
                    </div>
                  </div>
                  <Ticket className="h-8 w-8 text-red-400 opacity-70" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Security and Server Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Server Stats */}
            <Card className="bg-black/40 backdrop-blur-sm border-slate-800 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="h-5 w-5 text-slate-400" />
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">{serverLoad.cpu}%</span>
                  </div>
                  <Progress value={serverLoad.cpu} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">{serverLoad.memory}%</span>
                  </div>
                  <Progress value={serverLoad.memory} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Disk Usage</span>
                    <span className="text-sm font-medium">{serverLoad.disk}%</span>
                  </div>
                  <Progress value={serverLoad.disk} className="h-2" />
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <Badge variant="outline" className="font-mono">
                      {serverLoad.uptime}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Security Alerts */}
            <Card className="bg-black/40 backdrop-blur-sm border-slate-800 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-black/30 rounded-lg border border-slate-800 p-4 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Security Alerts</span>
                      <Badge variant={stats.securityAlerts > 0 ? "destructive" : "outline"}>
                        {stats.securityAlerts}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {stats.securityAlerts > 0 ? 'Active threats detected' : 'No active threats'}
                    </div>
                    <div className="mt-auto pt-3">
                      <Badge 
                        variant="outline" 
                        className={
                          stats.securityAlerts === 0 
                            ? "bg-green-900/20 text-green-400 border-green-400/30" 
                            : "bg-red-900/20 text-red-400 border-red-400/30"
                        }
                      >
                        {stats.securityAlerts === 0 ? 'Secure' : 'Attention Required'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg border border-slate-800 p-4 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Active Users</span>
                      <span className="font-medium">{stats.activeUsers}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Currently online
                    </div>
                    <div className="mt-auto pt-3">
                      <div className="flex -space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs"
                          >
                            {i + 1}
                          </div>
                        ))}
                        {stats.activeUsers > 5 && (
                          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs">
                            +{stats.activeUsers - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg border border-slate-800 p-4 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Uptime</span>
                      <span className="font-medium">99.9%</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last 30 days
                    </div>
                    <div className="mt-auto pt-3">
                      <Badge className="bg-green-900/20 text-green-400 border-green-400/30">
                        Excellent
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Traffic Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Traffic Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border border-slate-800/50 rounded-md">
                  <div className="text-center text-muted-foreground">
                    <span>Traffic chart visualization will be displayed here</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">New user registered</span>
                      </p>
                      <p className="text-xs text-muted-foreground">10 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Premium code redeemed</span>
                      </p>
                      <p className="text-xs text-muted-foreground">25 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-red-500"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Failed login attempt blocked</span>
                      </p>
                      <p className="text-xs text-muted-foreground">42 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Support ticket resolved</span>
                      </p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-purple-500"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">System backup completed</span>
                      </p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardStats;

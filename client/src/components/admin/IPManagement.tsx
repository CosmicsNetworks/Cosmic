
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Shield, Ban, UserX, Search, RefreshCw, AlertTriangle, Check, X } from 'lucide-react';

interface BlockedIP {
  id: number;
  ip: string;
  reason: string;
  blockedAt: string;
  blockedBy: number;
  blockedByUsername: string;
  expiresAt: string | null;
}

interface IPLog {
  id: number;
  ipAddress: string;
  userId: number | null;
  username: string | null;
  action: string;
  timestamp: string;
  userAgent: string;
  location: string;
}

const IPManagement = () => {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [ipLogs, setIPLogs] = useState<IPLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newIPBlock, setNewIPBlock] = useState({
    ip: '',
    reason: '',
    expiry: ''
  });

  useEffect(() => {
    // Mock data - in a real implementation, fetch from API
    const mockBlockedIPs: BlockedIP[] = [
      {
        id: 1,
        ip: '192.168.1.1',
        reason: 'Multiple failed login attempts',
        blockedAt: '2023-05-10T15:45:00Z',
        blockedBy: 1,
        blockedByUsername: 'Kyx',
        expiresAt: '2023-06-10T15:45:00Z'
      },
      {
        id: 2,
        ip: '10.0.0.5',
        reason: 'Suspicious activity - potential bot',
        blockedAt: '2023-05-12T09:30:00Z',
        blockedBy: 1,
        blockedByUsername: 'Kyx',
        expiresAt: null
      },
      {
        id: 3,
        ip: '172.16.0.10',
        reason: 'Attempting to access admin pages',
        blockedAt: '2023-05-15T12:15:00Z',
        blockedBy: 1,
        blockedByUsername: 'Kyx',
        expiresAt: '2023-05-22T12:15:00Z'
      }
    ];
    
    const mockIPLogs: IPLog[] = [
      {
        id: 1,
        ipAddress: '192.168.1.1',
        userId: 2,
        username: 'user123',
        action: 'login',
        timestamp: '2023-05-10T15:40:00Z',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, US'
      },
      {
        id: 2,
        ipAddress: '192.168.1.1',
        userId: 2,
        username: 'user123',
        action: 'login_failed',
        timestamp: '2023-05-10T15:41:00Z',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, US'
      },
      {
        id: 3,
        ipAddress: '10.0.0.5',
        userId: null,
        username: null,
        action: 'page_access',
        timestamp: '2023-05-12T09:25:00Z',
        userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        location: 'Mountain View, US'
      },
      {
        id: 4,
        ipAddress: '172.16.0.10',
        userId: 3,
        username: 'hacker',
        action: 'admin_access_attempt',
        timestamp: '2023-05-15T12:10:00Z',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G960F)',
        location: 'Unknown'
      }
    ];
    
    setBlockedIPs(mockBlockedIPs);
    setIPLogs(mockIPLogs);
    setLoading(false);
  }, []);

  const handleBlockIP = () => {
    if (!newIPBlock.ip) return;
    
    const newBlock: BlockedIP = {
      id: blockedIPs.length + 1,
      ip: newIPBlock.ip,
      reason: newIPBlock.reason || 'Manual block by admin',
      blockedAt: new Date().toISOString(),
      blockedBy: 1, // Assuming current admin ID
      blockedByUsername: 'Kyx', // Assuming current admin username
      expiresAt: newIPBlock.expiry ? new Date(newIPBlock.expiry).toISOString() : null
    };
    
    setBlockedIPs([...blockedIPs, newBlock]);
    
    // Reset form
    setNewIPBlock({
      ip: '',
      reason: '',
      expiry: ''
    });
  };

  const handleUnblockIP = (id: number) => {
    setBlockedIPs(blockedIPs.filter(ip => ip.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredBlockedIPs = blockedIPs.filter(ip => 
    ip.ip.includes(searchTerm) || ip.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredIPLogs = ipLogs.filter(log => 
    log.ipAddress.includes(searchTerm) || 
    (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-400" />
          IP Management
        </h2>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setLoading(true)}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search IP, username, or action..."
            className="pl-9 bg-black/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="blocked">
        <TabsList className="bg-slate-900">
          <TabsTrigger value="blocked" className="flex items-center gap-1">
            <Ban className="h-4 w-4" /> Blocked IPs
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1">
            <Shield className="h-4 w-4" /> IP Logs
          </TabsTrigger>
          <TabsTrigger value="block" className="flex items-center gap-1">
            <UserX className="h-4 w-4" /> Block New IP
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="blocked">
          <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl">Blocked IP Addresses</CardTitle>
              <CardDescription>
                Manage IP addresses that are currently blocked from accessing the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                </div>
              ) : filteredBlockedIPs.length > 0 ? (
                <div className="rounded-md border border-slate-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-900/50 hover:bg-slate-900">
                        <TableHead>IP Address</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Blocked By</TableHead>
                        <TableHead>Blocked At</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBlockedIPs.map((ip) => (
                        <TableRow key={ip.id} className="border-slate-800 hover:bg-slate-900/50">
                          <TableCell className="font-mono">{ip.ip}</TableCell>
                          <TableCell>{ip.reason}</TableCell>
                          <TableCell>{ip.blockedByUsername}</TableCell>
                          <TableCell>{formatDate(ip.blockedAt)}</TableCell>
                          <TableCell>
                            {ip.expiresAt ? formatDate(ip.expiresAt) : (
                              <Badge variant="destructive">Permanent</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleUnblockIP(ip.id)}
                            >
                              Unblock
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
                  <p className="text-slate-400">
                    {searchTerm ? "No blocked IPs match your search" : "No IPs are currently blocked"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl">IP Activity Logs</CardTitle>
              <CardDescription>
                View detailed logs of all IP activities on the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                </div>
              ) : filteredIPLogs.length > 0 ? (
                <div className="rounded-md border border-slate-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-900/50 hover:bg-slate-900">
                        <TableHead>IP Address</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIPLogs.map((log) => (
                        <TableRow key={log.id} className="border-slate-800 hover:bg-slate-900/50">
                          <TableCell className="font-mono">{log.ipAddress}</TableCell>
                          <TableCell>{log.username || 'Anonymous'}</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                log.action.includes('failed') || log.action.includes('attempt')
                                  ? 'bg-red-900/60 text-red-200'
                                  : log.action === 'login'
                                  ? 'bg-green-900/60 text-green-200'
                                  : 'bg-blue-900/60 text-blue-200'
                              }
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.location}</TableCell>
                          <TableCell>{formatDate(log.timestamp)}</TableCell>
                          <TableCell className="text-right">
                            {blockedIPs.some(ip => ip.ip === log.ipAddress) ? (
                              <Badge variant="destructive" className="flex items-center gap-1 ml-auto w-fit">
                                <Ban className="h-3 w-3" /> Blocked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center gap-1 ml-auto w-fit">
                                <Check className="h-3 w-3" /> Active
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
                  <p className="text-slate-400">
                    {searchTerm ? "No logs match your search" : "No IP activity logs found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="block">
          <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-500" />
                Block IP Address
              </CardTitle>
              <CardDescription>
                Block an IP address from accessing the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip">IP Address</Label>
                    <Input
                      id="ip"
                      placeholder="e.g., 192.168.1.1"
                      value={newIPBlock.ip}
                      onChange={(e) => setNewIPBlock({...newIPBlock, ip: e.target.value})}
                      className="bg-black/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Block</Label>
                    <Input
                      id="reason"
                      placeholder="e.g., Suspicious activity"
                      value={newIPBlock.reason}
                      onChange={(e) => setNewIPBlock({...newIPBlock, reason: e.target.value})}
                      className="bg-black/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiry" className="flex items-center justify-between">
                      <span>Block Expiry (leave empty for permanent)</span>
                    </Label>
                    <Input
                      id="expiry"
                      type="datetime-local"
                      value={newIPBlock.expiry}
                      onChange={(e) => setNewIPBlock({...newIPBlock, expiry: e.target.value})}
                      className="bg-black/30"
                    />
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-lg bg-yellow-950/20 border border-yellow-700/30">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-yellow-300">
                    Blocking an IP address will prevent all traffic from this address from accessing the site.
                    Make sure you've verified suspicious activity before blocking.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setNewIPBlock({ip: '', reason: '', expiry: ''})}
              >
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleBlockIP}
                disabled={!newIPBlock.ip}
              >
                <Ban className="h-4 w-4 mr-2" /> Block IP
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IPManagement;

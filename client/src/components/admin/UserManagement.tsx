
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  UserCog, 
  Shield, 
  Ban, 
  Eye, 
  Key, 
  PauseCircle, 
  PlayCircle, 
  UserX, 
  History, 
  LockKeyhole, 
  Mail, 
  Calendar, 
  Clock, 
  Smartphone,
  Globe,
  ArrowUpDown
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'banned';
  isPremium: boolean;
  premiumExpiry?: string;
  lastLogin?: string;
  registeredAt: string;
  twoFactorEnabled: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/users', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setFilteredUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users based on search term and status filter
  useEffect(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => {
        if (statusFilter === 'premium') return user.isPremium;
        if (statusFilter === 'non-premium') return !user.isPremium;
        return user.status === statusFilter;
      });
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, statusFilter, users]);
  
  // Handle ban user
  const handleBanUser = async () => {
    if (!selectedUser || !banReason) return;
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: banReason }),
        credentials: 'include',
      });
      
      if (response.ok) {
        // Update user status in the list
        const updatedUsers = users.map((user) =>
          user.id === selectedUser.id ? { ...user, status: 'banned' } : user
        );
        setUsers(updatedUsers);
        setBanReason('');
        setShowBanDialog(false);
      }
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };
  
  // Render user status badge
  const renderStatusBadge = (status: string, isPremium: boolean) => {
    if (status === 'banned') {
      return <Badge variant="destructive">Banned</Badge>;
    } else if (status === 'suspended') {
      return <Badge variant="outline" className="bg-amber-800/20 text-amber-400 border-amber-400/30">Suspended</Badge>;
    } else if (isPremium) {
      return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black">Premium</Badge>;
    } else {
      return <Badge variant="outline" className="border-green-400/30 text-green-400">Active</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <UserCog className="h-5 w-5 text-blue-400" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, permissions, and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by username or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="non-premium">Non-Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Users table */}
          <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-black/60">
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {renderStatusBadge(user.status, user.isPremium)}
                      </TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <Badge className="bg-purple-900/40 border-purple-400/30 text-purple-400">
                            <Shield className="h-3 w-3 mr-1" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-400/30 text-slate-400">
                            User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.lastLogin)}</TableCell>
                      <TableCell>
                        {user.twoFactorEnabled ? (
                          <Badge className="bg-green-900/40 border-green-400/30 text-green-400">
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-400/30 text-slate-400">
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetails(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.status !== 'banned' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBanDialog(true);
                              }}
                              title="Ban User"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="bg-black/80 backdrop-blur-sm border-red-500/20">
          <DialogHeader>
            <DialogTitle className="text-red-400">Ban User: {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              This action will prevent the user from accessing the platform. Please provide a reason for the ban.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Reason for ban..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="bg-black/30 border-red-500/20"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBanUser}
              disabled={!banReason.trim()}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="bg-black/80 backdrop-blur-sm border-slate-700/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-blue-400" />
              User Details: {selectedUser?.username}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-400">Account Info</h3>
                  <div className="rounded-md bg-black/30 p-3 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">User ID:</span>
                      <span>{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Username:</span>
                      <span>{selectedUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Role:</span>
                      <span>{selectedUser.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span>{selectedUser.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-400">Activity Info</h3>
                  <div className="rounded-md bg-black/30 p-3 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registered:</span>
                      <span>{formatDate(selectedUser.registeredAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Login:</span>
                      <span>{formatDate(selectedUser.lastLogin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">2FA Status:</span>
                      <span>{selectedUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-400">Premium Status</h3>
                <div className="rounded-md bg-black/30 p-3 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-yellow-400" />
                      <span>{selectedUser.isPremium ? 'Premium User' : 'Basic User'}</span>
                    </div>
                    
                    {selectedUser.isPremium && selectedUser.premiumExpiry && (
                      <Badge variant="outline" className="border-yellow-400/20 text-yellow-400">
                        Expires: {formatDate(selectedUser.premiumExpiry)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                  Close
                </Button>
                {selectedUser.status === 'active' && (
                  <Button 
                    variant="secondary"
                    className="bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                  >
                    Suspend User
                  </Button>
                )}
                {selectedUser.status !== 'banned' && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setShowUserDetails(false);
                      setShowBanDialog(true);
                    }}
                  >
                    Ban User
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;

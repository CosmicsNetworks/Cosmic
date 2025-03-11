
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, PlusCircle, Edit, Trash2, Save, EyeOff, Eye, Search, RefreshCw } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isEnabled: boolean;
  requirement: string;
  requiredValue: number;
  category: string;
  premiumOnly: boolean;
}

const AchievementManager = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [newAchievement, setNewAchievement] = useState<Partial<Achievement>>({
    name: '',
    description: '',
    icon: 'award',
    color: 'blue',
    isEnabled: true,
    requirement: 'login_count',
    requiredValue: 5,
    category: 'general',
    premiumOnly: false
  });

  useEffect(() => {
    // Mock data - in a real implementation, fetch from API
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        name: 'Premium Member',
        description: 'Subscribe to premium membership',
        icon: 'star',
        color: 'yellow',
        isEnabled: true,
        requirement: 'premium_status',
        requiredValue: 1,
        category: 'premium',
        premiumOnly: false
      },
      {
        id: '2',
        name: 'Power User',
        description: 'Use the platform for 30 days',
        icon: 'zap',
        color: 'blue',
        isEnabled: true,
        requirement: 'active_days',
        requiredValue: 30,
        category: 'activity',
        premiumOnly: false
      },
      {
        id: '3',
        name: 'Search Master',
        description: 'Complete 100 searches',
        icon: 'shield',
        color: 'purple',
        isEnabled: true,
        requirement: 'search_count',
        requiredValue: 100,
        category: 'searches',
        premiumOnly: false
      },
      {
        id: '4',
        name: 'Premium Explorer',
        description: 'Use all premium features at least once',
        icon: 'compass',
        color: 'emerald',
        isEnabled: true,
        requirement: 'premium_features_used',
        requiredValue: 5,
        category: 'premium',
        premiumOnly: true
      },
      {
        id: '5',
        name: 'Community Helper',
        description: 'Help 5 users in the community',
        icon: 'users',
        color: 'green',
        isEnabled: true,
        requirement: 'help_count',
        requiredValue: 5,
        category: 'community',
        premiumOnly: false
      },
      {
        id: '6',
        name: 'Early Adopter',
        description: 'Join during the platform launch period',
        icon: 'clock',
        color: 'cyan',
        isEnabled: true,
        requirement: 'join_date',
        requiredValue: 1685577600, // Unix timestamp for June 1, 2023
        category: 'special',
        premiumOnly: false
      },
    ];
    
    setAchievements(mockAchievements);
    setLoading(false);
  }, []);

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
  };

  const handleUpdateAchievement = () => {
    if (!editingAchievement) return;
    
    setAchievements(prevAchievements => 
      prevAchievements.map(a => 
        a.id === editingAchievement.id ? editingAchievement : a
      )
    );
    
    setEditingAchievement(null);
  };

  const handleDeleteAchievement = (id: string) => {
    setAchievements(achievements.filter(a => a.id !== id));
  };

  const handleToggleAchievement = (id: string) => {
    setAchievements(prevAchievements => 
      prevAchievements.map(a => 
        a.id === id ? { ...a, isEnabled: !a.isEnabled } : a
      )
    );
  };

  const handleCreateAchievement = () => {
    const newId = `${achievements.length + 1}`;
    const createdAchievement: Achievement = {
      id: newId,
      name: newAchievement.name || 'New Achievement',
      description: newAchievement.description || 'Description',
      icon: newAchievement.icon || 'award',
      color: newAchievement.color || 'blue',
      isEnabled: newAchievement.isEnabled !== undefined ? newAchievement.isEnabled : true,
      requirement: newAchievement.requirement || 'login_count',
      requiredValue: newAchievement.requiredValue || 1,
      category: newAchievement.category || 'general',
      premiumOnly: newAchievement.premiumOnly || false
    };
    
    setAchievements([...achievements, createdAchievement]);
    
    // Reset form
    setNewAchievement({
      name: '',
      description: '',
      icon: 'award',
      color: 'blue',
      isEnabled: true,
      requirement: 'login_count',
      requiredValue: 5,
      category: 'general',
      premiumOnly: false
    });
  };

  const filteredAchievements = achievements.filter(achievement => 
    achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-400" />
          Achievement Manager
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
      
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search achievements..."
            className="pl-9 bg-black/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="h-4 w-4 mr-2" /> Create Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800">
            <DialogHeader>
              <DialogTitle>Create New Achievement</DialogTitle>
              <DialogDescription>
                Create a new achievement for users to earn on the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Achievement Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Search Master"
                    value={newAchievement.name}
                    onChange={(e) => setNewAchievement({...newAchievement, name: e.target.value})}
                    className="bg-black/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newAchievement.category}
                    onValueChange={(value) => setNewAchievement({...newAchievement, category: value})}
                  >
                    <SelectTrigger className="bg-black/30">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="searches">Searches</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe how to earn this achievement"
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                  className="bg-black/30"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select 
                    value={newAchievement.icon}
                    onValueChange={(value) => setNewAchievement({...newAchievement, icon: value})}
                  >
                    <SelectTrigger className="bg-black/30">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="star">Star</SelectItem>
                      <SelectItem value="award">Award</SelectItem>
                      <SelectItem value="shield">Shield</SelectItem>
                      <SelectItem value="zap">Lightning</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="clock">Clock</SelectItem>
                      <SelectItem value="compass">Compass</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Select 
                    value={newAchievement.color}
                    onValueChange={(value) => setNewAchievement({...newAchievement, color: value})}
                  >
                    <SelectTrigger className="bg-black/30">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="cyan">Cyan</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                      <SelectItem value="emerald">Emerald</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requirement">Requirement Type</Label>
                  <Select 
                    value={newAchievement.requirement}
                    onValueChange={(value) => setNewAchievement({...newAchievement, requirement: value})}
                  >
                    <SelectTrigger className="bg-black/30">
                      <SelectValue placeholder="Select requirement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="login_count">Login Count</SelectItem>
                      <SelectItem value="active_days">Active Days</SelectItem>
                      <SelectItem value="search_count">Search Count</SelectItem>
                      <SelectItem value="premium_features_used">Premium Features Used</SelectItem>
                      <SelectItem value="help_count">Help Count</SelectItem>
                      <SelectItem value="join_date">Join Date</SelectItem>
                      <SelectItem value="premium_status">Premium Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requiredValue">Required Value</Label>
                  <Input
                    id="requiredValue"
                    type="number"
                    placeholder="e.g., 5"
                    value={newAchievement.requiredValue?.toString() || ''}
                    onChange={(e) => setNewAchievement({...newAchievement, requiredValue: parseInt(e.target.value) || 0})}
                    className="bg-black/30"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="premiumOnly"
                  checked={newAchievement.premiumOnly}
                  onChange={(e) => setNewAchievement({...newAchievement, premiumOnly: e.target.checked})}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600"
                />
                <Label htmlFor="premiumOnly">Premium Users Only</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateAchievement}
                disabled={!newAchievement.name || !newAchievement.description}
              >
                Create Achievement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl">Manage Achievements</CardTitle>
          <CardDescription>
            Create, edit, and manage achievements for your users to earn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : filteredAchievements.length > 0 ? (
            <div className="rounded-md border border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-900/50 hover:bg-slate-900">
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAchievements.map((achievement) => (
                    <TableRow key={achievement.id} className="border-slate-800 hover:bg-slate-900/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${achievement.color}-900/50`}>
                            {achievement.icon === 'star' && <Award className={`h-4 w-4 text-${achievement.color}-500`} />}
                            {achievement.icon === 'award' && <Award className={`h-4 w-4 text-${achievement.color}-500`} />}
                            {achievement.icon === 'shield' && <Award className={`h-4 w-4 text-${achievement.color}-500`} />}
                            {achievement.icon === 'zap' && <Award className={`h-4 w-4 text-${achievement.color}-500`} />}
                            {achievement.icon === 'users' && <Award className={`h-4 w-4 text-${achievement.color}-500`} />}
                            {achievement.icon === 'clock' && <Award className={`h-4 w-4 text-${achievement.color}-500`} />}
                          </div>
                          <div>
                            <p className="font-medium">{achievement.name}</p>
                            <p className="text-xs text-slate-400">{achievement.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {achievement.category}
                        </Badge>
                        {achievement.premiumOnly && (
                          <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-black text-xs">
                            Premium
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-300 capitalize">
                          {achievement.requirement.replace(/_/g, ' ')} ≥ {achievement.requiredValue}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={achievement.isEnabled ? "default" : "destructive"} className="capitalize">
                          {achievement.isEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleAchievement(achievement.id)}
                            title={achievement.isEnabled ? "Disable Achievement" : "Enable Achievement"}
                          >
                            {achievement.isEnabled ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Edit Achievement"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800">
                              <DialogHeader>
                                <DialogTitle>Edit Achievement</DialogTitle>
                                <DialogDescription>
                                  Update achievement details
                                </DialogDescription>
                              </DialogHeader>
                              {editingAchievement && (
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-name">Achievement Name</Label>
                                      <Input
                                        id="edit-name"
                                        value={editingAchievement.name}
                                        onChange={(e) => setEditingAchievement({...editingAchievement, name: e.target.value})}
                                        className="bg-black/30"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-category">Category</Label>
                                      <Select 
                                        value={editingAchievement.category}
                                        onValueChange={(value) => setEditingAchievement({...editingAchievement, category: value})}
                                      >
                                        <SelectTrigger className="bg-black/30">
                                          <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="general">General</SelectItem>
                                          <SelectItem value="activity">Activity</SelectItem>
                                          <SelectItem value="searches">Searches</SelectItem>
                                          <SelectItem value="premium">Premium</SelectItem>
                                          <SelectItem value="community">Community</SelectItem>
                                          <SelectItem value="special">Special</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Textarea
                                      id="edit-description"
                                      value={editingAchievement.description}
                                      onChange={(e) => setEditingAchievement({...editingAchievement, description: e.target.value})}
                                      className="bg-black/30"
                                    />
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="edit-premiumOnly"
                                      checked={editingAchievement.premiumOnly}
                                      onChange={(e) => setEditingAchievement({...editingAchievement, premiumOnly: e.target.checked})}
                                      className="rounded border-slate-700 bg-slate-900 text-blue-600"
                                    />
                                    <Label htmlFor="edit-premiumOnly">Premium Users Only</Label>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button 
                                  variant="destructive"
                                  onClick={() => setEditingAchievement(null)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={handleUpdateAchievement}
                                >
                                  <Save className="h-4 w-4 mr-2" /> Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteAchievement(achievement.id)}
                            title="Delete Achievement"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
              <p className="text-slate-400">
                {searchTerm ? "No achievements match your search" : "No achievements created yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementManager;

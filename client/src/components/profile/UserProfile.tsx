
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AchievementDisplay from './AchievementDisplay';
import SocialFeed from '../social/SocialFeed';
import { User, Settings, Star, Clock, History, Heart, Award, Edit, Eye } from 'lucide-react';

const UserProfile = () => {
  const { user, premiumStatus } = useAuth();
  const [achievements, setAchievements] = useState([
    {
      id: '1',
      name: 'Premium Member',
      description: 'Subscribe to premium membership',
      icon: 'star',
      color: 'yellow',
      unlocked: !!premiumStatus?.isPremium,
    },
    {
      id: '2',
      name: 'Power User',
      description: 'Use the platform for 30 days',
      icon: 'zap',
      color: 'blue',
      unlocked: false,
      progress: 12,
      maxProgress: 30
    },
    {
      id: '3',
      name: 'Search Master',
      description: 'Complete 100 searches',
      icon: 'shield',
      color: 'purple',
      unlocked: false,
      progress: 42,
      maxProgress: 100
    },
    {
      id: '4',
      name: 'Community Helper',
      description: 'Help 5 users in the community',
      icon: 'users',
      color: 'green',
      unlocked: false,
      progress: 2,
      maxProgress: 5
    },
    {
      id: '5',
      name: 'Early Adopter',
      description: 'Join during the platform launch period',
      icon: 'clock',
      color: 'cyan',
      unlocked: true,
    },
    {
      id: '6',
      name: 'Content Creator',
      description: 'Create 10 posts that receive engagement',
      icon: 'award',
      color: 'orange',
      unlocked: false,
      progress: 3,
      maxProgress: 10
    },
  ]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              Please sign in to view your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
            <Button className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm hover:bg-black/50">
              <Edit className="h-4 w-4 mr-2" /> Edit Cover
            </Button>
          </div>
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-slate-800 bg-slate-700">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.username.substring(0, 2)}&background=10b981&color=fff&size=128`} />
                <AvatarFallback className="text-2xl">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  {premiumStatus?.isPremium && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-amber-600 text-black">
                      <Star className="h-3.5 w-3.5 mr-1" /> Premium
                    </Badge>
                  )}
                  {user.role === 'admin' && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-600">
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-slate-400">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="text-sm text-slate-400">
                    <span className="font-medium">Member since:</span> {new Date().toLocaleDateString()}
                  </div>
                  {premiumStatus?.isPremium && (
                    <div className="text-sm text-yellow-400">
                      <span className="font-medium">Premium until:</span> {new Date(premiumStatus.expiresAt || '').toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-transparent border border-slate-700 hover:bg-slate-800">
                  <Eye className="h-4 w-4 mr-2" /> View as Public
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <AchievementDisplay achievements={achievements} />

            <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-400" />
                  User Stats
                </CardTitle>
                <CardDescription>
                  Your activity on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5 text-blue-400" />
                      <span>Searches</span>
                    </div>
                    <span className="font-medium">42</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-400" />
                      <span>Days Active</span>
                    </div>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-rose-400" />
                      <span>Contributions</span>
                    </div>
                    <span className="font-medium">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!premiumStatus?.isPremium && (
              <Card className="border border-yellow-500/20 bg-black/40 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                      Upgrade to Premium
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Unlock all features and benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Benefits include:</p>
                    <ul className="text-sm space-y-1 text-slate-300">
                      <li className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400" /> Instant search results
                      </li>
                      <li className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400" /> Advanced search tools
                      </li>
                      <li className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400" /> Premium-only content
                      </li>
                      <li className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400" /> Exclusive badges
                      </li>
                    </ul>
                    <Button className="w-full mt-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black">
                      Get Premium
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="posts">
              <TabsList className="w-full bg-slate-900 mb-6">
                <TabsTrigger value="posts" className="flex-1">My Posts</TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                <TabsTrigger value="saved" className="flex-1">Saved Items</TabsTrigger>
              </TabsList>
              <TabsContent value="posts">
                <SocialFeed />
              </TabsContent>
              <TabsContent value="activity">
                <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent activity on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-2 border-blue-500 pl-4 py-2">
                        <p className="text-blue-400 text-sm">Today</p>
                        <p className="mt-1">Completed 5 searches</p>
                      </div>
                      <div className="border-l-2 border-green-500 pl-4 py-2">
                        <p className="text-green-400 text-sm">Yesterday</p>
                        <p className="mt-1">Updated profile settings</p>
                      </div>
                      <div className="border-l-2 border-purple-500 pl-4 py-2">
                        <p className="text-purple-400 text-sm">3 days ago</p>
                        <p className="mt-1">Earned the "Early Adopter" badge</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="saved">
                <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
                  <CardHeader>
                    <CardTitle>Saved Items</CardTitle>
                    <CardDescription>
                      Posts and content you've saved for later
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
                      <p className="text-slate-400">You haven't saved any items yet</p>
                      <Button className="mt-2 bg-blue-600 hover:bg-blue-700">
                        Browse Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, BookmarkPlus, MoreHorizontal, Image, Video, Send, Flag, UserPlus, Star } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

interface Post {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  images?: string[];
  video?: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isPremiumContent: boolean;
  userIsPremium: boolean;
}

const SocialFeed = () => {
  const { user, premiumStatus } = useAuth();
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      userId: '1',
      username: 'TechExplorer',
      avatar: 'https://ui-avatars.com/api/?name=TE&background=6366f1&color=fff',
      content: 'Just discovered an amazing search technique using the premium tools! 🚀 The results are so much faster now.',
      createdAt: '2023-05-10T12:30:00Z',
      likes: 45,
      comments: 12,
      shares: 5,
      isLiked: false,
      isPremiumContent: true,
      userIsPremium: true
    },
    {
      id: '2',
      userId: '2',
      username: 'Kyx',
      avatar: 'https://ui-avatars.com/api/?name=KX&background=3b82f6&color=fff',
      content: 'We just released a new update with improved search functionality and better proxy performance. Check it out and let us know what you think!',
      createdAt: '2023-05-09T15:45:00Z',
      likes: 128,
      comments: 32,
      shares: 18,
      isLiked: true,
      isPremiumContent: false,
      userIsPremium: true
    },
    {
      id: '3',
      userId: '3',
      username: 'SearchMaster',
      avatar: 'https://ui-avatars.com/api/?name=SM&background=a855f7&color=fff',
      content: 'Here\'s a quick tutorial on how to optimize your searches. I\'ve been using these techniques for months and they work great!',
      images: ['https://placehold.co/600x400/222/ddd?text=Search+Optimization+Tutorial'],
      createdAt: '2023-05-08T09:15:00Z',
      likes: 76,
      comments: 24,
      shares: 12,
      isLiked: false,
      isPremiumContent: false,
      userIsPremium: false
    }
  ]);

  const [newPost, setNewPost] = useState('');
  const [isPremiumPost, setIsPremiumPost] = useState(false);

  const handleLike = (postId: string) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const submitPost = () => {
    if (!newPost.trim()) return;

    const newPostObj: Post = {
      id: `temp-${Date.now()}`,
      userId: user?.id.toString() || 'unknown',
      username: user?.username || 'Anonymous',
      avatar: `https://ui-avatars.com/api/?name=${user?.username?.substring(0, 2) || 'AN'}&background=10b981&color=fff`,
      content: newPost,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isPremiumContent: isPremiumPost,
      userIsPremium: !!premiumStatus?.isPremium
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
    setIsPremiumPost(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle>Social Feed</CardTitle>
          <CardDescription>
            Share your experiences and connect with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user ? (
              <>
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${user.username.substring(0, 2)}&background=10b981&color=fff`} />
                    <AvatarFallback>{user.username.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea 
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share something with the community..."
                      className="min-h-[80px] bg-black/30"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Image className="h-4 w-4 mr-1" /> Image
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Video className="h-4 w-4 mr-1" /> Video
                        </Button>
                        {premiumStatus?.isPremium && (
                          <Button 
                            variant={isPremiumPost ? "default" : "outline"} 
                            size="sm" 
                            className={`${isPremiumPost ? "bg-yellow-600 text-white" : "bg-transparent"}`}
                            onClick={() => setIsPremiumPost(!isPremiumPost)}
                          >
                            <Star className={`h-4 w-4 mr-1 ${isPremiumPost ? "text-white" : "text-yellow-500"}`} /> 
                            Premium Post
                          </Button>
                        )}
                      </div>
                      <Button 
                        onClick={submitPost} 
                        disabled={!newPost.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-1" /> Post
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-slate-800 my-2" />
              </>
            ) : (
              <div className="text-center p-4 border border-dashed border-slate-700 rounded-lg">
                <p className="text-slate-400">Sign in to share your thoughts with the community</p>
                <Button className="mt-2 bg-blue-600 hover:bg-blue-700">Sign In</Button>
              </div>
            )}

            <Tabs defaultValue="all">
              <TabsList className="bg-slate-900">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="premium">Premium Only</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4 mt-4">
                    {posts.map(post => (
                      <Card key={post.id} className={`bg-slate-900/60 border-slate-800 ${post.isPremiumContent ? 'border-l-4 border-l-yellow-600' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarImage src={post.avatar} />
                                <AvatarFallback>{post.username.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center">
                                  <p className="font-medium">{post.username}</p>
                                  {post.userIsPremium && (
                                    <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-black text-xs py-0">
                                      Premium
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          {post.isPremiumContent && !premiumStatus?.isPremium ? (
                            <div className="bg-yellow-950/30 border border-yellow-600/30 p-4 rounded-lg">
                              <p className="text-yellow-400 flex items-center gap-2">
                                <Star className="h-4 w-4" /> Premium Content
                              </p>
                              <p className="text-slate-400 text-sm mt-1">
                                Upgrade to premium to view this content
                              </p>
                              <Button className="mt-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black">
                                Upgrade Now
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-slate-300">{post.content}</p>
                              {post.images && post.images.length > 0 && (
                                <div className="mt-3 rounded-lg overflow-hidden">
                                  <img src={post.images[0]} alt="Post attachment" className="w-full" />
                                </div>
                              )}
                              {post.video && (
                                <div className="mt-3 rounded-lg overflow-hidden">
                                  <video src={post.video} controls className="w-full" />
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                        <CardFooter>
                          <div className="w-full flex items-center justify-between">
                            <div className="flex gap-4">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`flex items-center gap-1 ${post.isLiked ? 'text-rose-500' : ''}`}
                                onClick={() => handleLike(post.id)}
                              >
                                <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                <span>{post.likes}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.comments}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <Share className="h-4 w-4" />
                                <span>{post.shares}</span>
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <BookmarkPlus className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Flag className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="premium">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4 mt-4">
                    {posts.filter(post => post.isPremiumContent).length > 0 ? (
                      posts
                        .filter(post => post.isPremiumContent)
                        .map(post => (
                          <Card key={post.id} className="bg-slate-900/60 border-slate-800 border-l-4 border-l-yellow-600">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <Avatar>
                                    <AvatarImage src={post.avatar} />
                                    <AvatarFallback>{post.username.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center">
                                      <p className="font-medium">{post.username}</p>
                                      {post.userIsPremium && (
                                        <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-black text-xs py-0">
                                          Premium
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                              {!premiumStatus?.isPremium ? (
                                <div className="bg-yellow-950/30 border border-yellow-600/30 p-4 rounded-lg">
                                  <p className="text-yellow-400 flex items-center gap-2">
                                    <Star className="h-4 w-4" /> Premium Content
                                  </p>
                                  <p className="text-slate-400 text-sm mt-1">
                                    Upgrade to premium to view this content
                                  </p>
                                  <Button className="mt-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black">
                                    Upgrade Now
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <p className="text-slate-300">{post.content}</p>
                                  {post.images && post.images.length > 0 && (
                                    <div className="mt-3 rounded-lg overflow-hidden">
                                      <img src={post.images[0]} alt="Post attachment" className="w-full" />
                                    </div>
                                  )}
                                  {post.video && (
                                    <div className="mt-3 rounded-lg overflow-hidden">
                                      <video src={post.video} controls className="w-full" />
                                    </div>
                                  )}
                                </>
                              )}
                            </CardContent>
                            <CardFooter>
                              <div className="w-full flex items-center justify-between">
                                <div className="flex gap-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={`flex items-center gap-1 ${post.isLiked ? 'text-rose-500' : ''}`}
                                    onClick={() => handleLike(post.id)}
                                  >
                                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                    <span>{post.likes}</span>
                                  </Button>
                                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{post.comments}</span>
                                  </Button>
                                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                    <Share className="h-4 w-4" />
                                    <span>{post.shares}</span>
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <BookmarkPlus className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Flag className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardFooter>
                          </Card>
                        ))
                    ) : (
                      <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
                        <p className="text-slate-400">No premium posts available</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="following">
                <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg mt-4">
                  <p className="text-slate-400">Follow other users to see their posts here</p>
                  <Button className="mt-2 bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" /> Find Users to Follow
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialFeed;

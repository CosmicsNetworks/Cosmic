import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Award, Medal, Shield, Sparkles, Clock, Lock, Star, TrendingUp } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface BadgeType {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlockCondition: string;
  isUnlocked: boolean;
  isHidden: boolean;
  awardedAt: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const PremiumBadges = () => {
  const { user, isPremium } = useAuth();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/badges');
      if (response.data.badges) {
        setBadges(response.data.badges);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const toggleBadgeVisibility = async (badgeId: number, isHidden: boolean) => {
    try {
      const response = await axios.patch(`/api/users/badges/${badgeId}`, { isHidden });
      if (response.data.badge) {
        setBadges(badges.map(badge => 
          badge.id === badgeId ? { ...badge, isHidden } : badge
        ));
        toast.success(`Badge ${isHidden ? 'hidden' : 'shown'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling badge visibility:', error);
      toast.error('Failed to update badge visibility');
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'award': return <Award className="h-5 w-5" />;
      case 'medal': return <Medal className="h-5 w-5" />;
      case 'shield': return <Shield className="h-5 w-5" />;
      case 'sparkles': return <Sparkles className="h-5 w-5" />;
      case 'clock': return <Clock className="h-5 w-5" />;
      case 'star': return <Star className="h-5 w-5" />;
      case 'trending-up': return <TrendingUp className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  const getBadgeColorClass = (tier?: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-700 hover:bg-amber-600';
      case 'silver': return 'bg-slate-400 hover:bg-slate-300';
      case 'gold': return 'bg-yellow-500 hover:bg-yellow-400';
      case 'platinum': return 'bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500';
      default: return 'bg-purple-700 hover:bg-purple-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isPremium) {
    return (
      <Card className="border border-amber-500/20 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Premium Badges
          </CardTitle>
          <CardDescription>
            Upgrade to Premium to unlock special badges and achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="relative">
            <div className="flex gap-2 mb-4 opacity-60">
              {['bronze', 'silver', 'gold', 'platinum'].map((tier) => (
                <Badge key={tier} className={`${getBadgeColorClass(tier)} p-2`}>
                  <Award className="h-4 w-4" />
                </Badge>
              ))}
            </div>
            <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-yellow-500/80" />
          </div>
          <p className="text-sm text-center text-gray-400 max-w-xs">
            Premium members can unlock exclusive badges by completing special actions and reaching milestones
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
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-400" />
          Premium Badges
        </CardTitle>
        <CardDescription>
          View and manage your earned premium badges
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
          </div>
        ) : badges.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="flex justify-center">
              <Medal className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium">No Badges Yet</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Complete premium activities and earn special achievements to unlock badges
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`relative border rounded-lg p-3 cursor-pointer transition-all 
                  ${badge.isUnlocked 
                    ? `border-${badge.tier || 'purple'}-500/30 hover:border-${badge.tier || 'purple'}-500/50 hover:bg-${badge.tier || 'purple'}-900/10` 
                    : 'border-gray-700 grayscale opacity-50'
                  }`}
                onClick={() => {
                  if (badge.isUnlocked) {
                    setSelectedBadge(badge);
                    setDialogOpen(true);
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-md ${getBadgeColorClass(badge.tier)}`}>
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{badge.name}</h3>
                    {badge.isUnlocked && (
                      <p className="text-xs text-gray-400">Earned: {formatDate(badge.awardedAt)}</p>
                    )}
                  </div>
                  {badge.isHidden && badge.isUnlocked && (
                    <div className="absolute top-1 right-1">
                      <Badge variant="outline" className="h-5 border-gray-600 bg-black/40 text-gray-400 text-xs px-1">
                        Hidden
                      </Badge>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {badge.isUnlocked ? badge.description : badge.unlockCondition}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border border-slate-800">
          {selectedBadge && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${getBadgeColorClass(selectedBadge.tier)}`}>
                    {getBadgeIcon(selectedBadge.icon)}
                  </div>
                  {selectedBadge.name}
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>{selectedBadge.description}</p>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-sm">Earned: {formatDate(selectedBadge.awardedAt)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Show on profile:</span>
                      <Switch 
                        checked={!selectedBadge.isHidden}
                        onCheckedChange={(checked) => toggleBadgeVisibility(selectedBadge.id, !checked)}
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-slate-700">Close</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PremiumBadges;
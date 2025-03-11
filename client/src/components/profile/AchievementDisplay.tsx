
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Star, Award, Shield, Zap, Users, Clock, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: 'star' | 'award' | 'shield' | 'zap' | 'users' | 'clock' | 'sparkles';
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementDisplayProps {
  achievements: Achievement[];
  className?: string;
}

const AchievementDisplay = ({ achievements, className = '' }: AchievementDisplayProps) => {
  const renderIcon = (icon: string, color: string) => {
    switch (icon) {
      case 'star':
        return <Star className={`h-5 w-5 text-${color}-500`} />;
      case 'award':
        return <Award className={`h-5 w-5 text-${color}-500`} />;
      case 'shield':
        return <Shield className={`h-5 w-5 text-${color}-500`} />;
      case 'zap':
        return <Zap className={`h-5 w-5 text-${color}-500`} />;
      case 'users':
        return <Users className={`h-5 w-5 text-${color}-500`} />;
      case 'clock':
        return <Clock className={`h-5 w-5 text-${color}-500`} />;
      case 'sparkles':
        return <Sparkles className={`h-5 w-5 text-${color}-500`} />;
      default:
        return <Star className={`h-5 w-5 text-${color}-500`} />;
    }
  };

  return (
    <Card className={`bg-black/40 backdrop-blur-sm border-slate-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-400" />
          Achievements & Badges
        </CardTitle>
        <CardDescription>
          Track your progress and showcase your accomplishments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <TooltipProvider key={achievement.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`
                        relative flex items-center gap-3 p-3 rounded-lg
                        ${achievement.unlocked 
                          ? `bg-gradient-to-r from-${achievement.color}-950/40 to-${achievement.color}-900/20 border border-${achievement.color}-500/30` 
                          : 'bg-slate-900/40 border border-slate-700/30 opacity-60'}
                      `}
                    >
                      <div className={`
                        flex items-center justify-center 
                        ${achievement.unlocked ? `bg-${achievement.color}-900/50` : 'bg-slate-800'} 
                        p-2 rounded-full
                        `}
                      >
                        {renderIcon(achievement.icon, achievement.unlocked ? achievement.color : 'slate')}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${achievement.unlocked ? `text-${achievement.color}-400` : 'text-slate-400'}`}>
                          {achievement.name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {achievement.description}
                        </p>
                        {achievement.progress !== undefined && achievement.maxProgress && (
                          <div className="mt-1">
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-${achievement.color}-500`} 
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-500 text-right mt-0.5">
                              {achievement.progress}/{achievement.maxProgress}
                            </p>
                          </div>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <Badge className={`absolute top-1 right-1 bg-${achievement.color}-600`}>
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{achievement.unlocked ? 'Achieved!' : `Unlock by ${achievement.description.toLowerCase()}`}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AchievementDisplay;

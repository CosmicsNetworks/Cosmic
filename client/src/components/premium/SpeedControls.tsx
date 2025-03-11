
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Gauge, Zap, SaveIcon, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface SpeedControlsProps {
  onSave?: () => void;
}

const SpeedControls = ({ onSave }: SpeedControlsProps) => {
  const { user, isPremium } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    instantSearchResults: true,
    priorityProxyRouting: true,
    preloadingLevel: 80,
    cacheLevel: 70,
    responseTimeOptimization: 75,
    reducedLatency: true,
  });

  useEffect(() => {
    if (isPremium) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [isPremium]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/premium/speed-controls');
      if (response.data?.speedControls) {
        setSettings(response.data.speedControls);
      }
    } catch (error) {
      console.error('Error fetching speed controls:', error);
      toast.error('Failed to load speed settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isPremium) {
      toast.error('Premium subscription required');
      return;
    }

    try {
      setSaving(true);
      const response = await axios.patch('/api/premium/speed-controls', settings);
      if (response.data?.speedControls) {
        setSettings(response.data.speedControls);
        toast.success('Speed settings saved successfully');
        if (onSave) onSave();
      }
    } catch (error) {
      console.error('Error saving speed controls:', error);
      toast.error('Failed to save speed settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      instantSearchResults: true,
      priorityProxyRouting: true,
      preloadingLevel: 80,
      cacheLevel: 70,
      responseTimeOptimization: 75,
      reducedLatency: true,
    });
    toast.info('Settings reset to defaults');
  };

  if (!isPremium) {
    return (
      <Card className="border border-amber-500/20 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Speed Controls
          </CardTitle>
          <CardDescription>
            Upgrade to Premium to customize performance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 opacity-70">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Instant Results</Label>
              <Switch disabled checked={false} />
            </div>
            <p className="text-xs text-muted-foreground">
              Remove all waiting times from search results
            </p>
          </div>

          <div className="space-y-2">
            <Label>Preloading Level</Label>
            <Slider disabled value={[50]} max={100} step={1} />
            <p className="text-xs text-muted-foreground">
              Control how aggressively the system preloads content
            </p>
          </div>
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
          <Zap className="h-5 w-5 text-amber-400" />
          Premium Speed Controls
        </CardTitle>
        <CardDescription>
          Customize performance settings for optimal experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="instantResults">Instant Search Results</Label>
                  <Switch 
                    id="instantResults" 
                    checked={settings.instantSearchResults}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, instantSearchResults: checked})
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Remove all waiting times from search results
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="priorityRouting">Priority Proxy Routing</Label>
                  <Switch 
                    id="priorityRouting" 
                    checked={settings.priorityProxyRouting}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, priorityProxyRouting: checked})
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use premium-only proxy servers for faster connections
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="reducedLatency">Reduced Latency Mode</Label>
                  <Switch 
                    id="reducedLatency" 
                    checked={settings.reducedLatency}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, reducedLatency: checked})
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Optimize connection for lower latency
                </p>
              </div>
            </div>

            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Preloading Level: {settings.preloadingLevel}%</Label>
                  <Gauge className="h-4 w-4 text-amber-400" />
                </div>
                <Slider 
                  value={[settings.preloadingLevel]} 
                  max={100} 
                  step={5}
                  onValueChange={(value) => 
                    setSettings({...settings, preloadingLevel: value[0]})
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Control how aggressively the system preloads content for faster browsing
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Cache Level: {settings.cacheLevel}%</Label>
                  <Gauge className="h-4 w-4 text-amber-400" />
                </div>
                <Slider 
                  value={[settings.cacheLevel]} 
                  max={100} 
                  step={5}
                  onValueChange={(value) => 
                    setSettings({...settings, cacheLevel: value[0]})
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Higher values improve performance but may occasionally show outdated content
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Response Time Optimization: {settings.responseTimeOptimization}%</Label>
                  <Gauge className="h-4 w-4 text-amber-400" />
                </div>
                <Slider 
                  value={[settings.responseTimeOptimization]} 
                  max={100} 
                  step={5}
                  onValueChange={(value) => 
                    setSettings({...settings, responseTimeOptimization: value[0]})
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Balance between speed and quality of responses
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReset}
          disabled={saving || loading}
          className="border-amber-500/30 hover:bg-amber-500/10"
        >
          <RotateCw className="h-4 w-4 mr-1" /> Reset
        </Button>
        <Button 
          className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-600 hover:to-yellow-700"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4 mr-2" /> Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpeedControls;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Robot, Shield, AlertTriangle, Activity, Eye, EyeOff, Loader2, Save, Trash2 } from 'lucide-react';

interface BotRule {
  id: number;
  name: string;
  pattern: string;
  action: 'block' | 'log' | 'captcha';
  enabled: boolean;
  detectionCount: number;
  lastDetected: string | null;
}

interface BotDetection {
  id: number;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  method: string;
  url: string;
  ruleTriggered: string;
  action: string;
}

const BotDetection = () => {
  const [rules, setRules] = useState<BotRule[]>([]);
  const [detections, setDetections] = useState<BotDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [settings, setSettings] = useState({
    botProtectionEnabled: true,
    captchaThreshold: 60,
    blockThreshold: 85,
    detectionSensitivity: 70,
    autoBlockEnabled: true,
    ipBlockDuration: '24h', // 1h, 24h, 7d, 30d, permanent
    alertOnDetection: true,
    monitorUserAgents: true,
    monitorRequestPatterns: true,
    preventHeadlessBrowsers: true,
  });

  const [newRule, setNewRule] = useState({
    name: '',
    pattern: '',
    action: 'block' as const,
  });

  useEffect(() => {
    fetchRules();
    fetchDetections();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      // Mock data - would be replaced with real API call
      const mockRules: BotRule[] = [
        {
          id: 1,
          name: 'Suspicious User Agent',
          pattern: '(bot|crawler|spider|wget|curl)',
          action: 'log',
          enabled: true,
          detectionCount: 156,
          lastDetected: '2023-05-15T14:23:45Z',
        },
        {
          id: 2,
          name: 'Rapid Fire Requests',
          pattern: 'request-rate {">"} 30/minute',
          action: 'captcha',
          enabled: true,
          detectionCount: 78,
          lastDetected: '2023-05-14T09:12:32Z',
        },
        {
          id: 3,
          name: 'Known Bad Bot Signatures',
          pattern: '(AhrefsBot|SemrushBot|DotBot)',
          action: 'block',
          enabled: true,
          detectionCount: 423,
          lastDetected: '2023-05-15T18:47:19Z',
        },
        {
          id: 4,
          name: 'Headless Browser Detection',
          pattern: 'headless-chrome-detection',
          action: 'block',
          enabled: true,
          detectionCount: 64,
          lastDetected: '2023-05-14T22:35:11Z',
        },
      ];

      setRules(mockRules);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bot rules:', error);
      toast.error('Failed to load bot detection rules');
      setLoading(false);
    }
  };

  const fetchDetections = async () => {
    try {
      // Mock data - would be replaced with real API call
      const mockDetections: BotDetection[] = [
        {
          id: 1,
          ipAddress: '198.51.100.32',
          userAgent: 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
          timestamp: '2023-05-15T18:47:19Z',
          method: 'GET',
          url: '/api/search?q=test',
          ruleTriggered: 'Known Bad Bot Signatures',
          action: 'Blocked',
        },
        {
          id: 2,
          ipAddress: '203.0.113.45',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2023-05-15T14:23:45Z',
          method: 'POST',
          url: '/api/auth/login',
          ruleTriggered: 'Rapid Fire Requests',
          action: 'CAPTCHA',
        },
        {
          id: 3,
          ipAddress: '192.0.2.18',
          userAgent: 'curl/7.64.1',
          timestamp: '2023-05-14T09:12:32Z',
          method: 'GET',
          url: '/api/users',
          ruleTriggered: 'Suspicious User Agent',
          action: 'Logged',
        },
      ];

      setDetections(mockDetections);
    } catch (error) {
      console.error('Error fetching bot detections:', error);
      toast.error('Failed to load bot detection history');
    }
  };

  const toggleRuleStatus = async (ruleId: number, enabled: boolean) => {
    try {
      // Would send API request to toggle rule status
      setRules(rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled } : rule
      ));
      toast.success(`Rule ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling rule status:', error);
      toast.error('Failed to update rule status');
    }
  };

  const deleteRule = async (ruleId: number) => {
    try {
      // Would send API request to delete rule
      setRules(rules.filter(rule => rule.id !== ruleId));
      toast.success('Rule deleted successfully');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const addRule = async () => {
    try {
      if (!newRule.name || !newRule.pattern) {
        toast.error('Rule name and pattern are required');
        return;
      }

      // Would send API request to add rule
      const mockNewRule: BotRule = {
        id: Math.max(...rules.map(r => r.id), 0) + 1,
        name: newRule.name,
        pattern: newRule.pattern,
        action: newRule.action,
        enabled: true,
        detectionCount: 0,
        lastDetected: null,
      };

      setRules([...rules, mockNewRule]);
      setNewRule({
        name: '',
        pattern: '',
        action: 'block',
      });

      toast.success('Rule added successfully');
    } catch (error) {
      console.error('Error adding rule:', error);
      toast.error('Failed to add rule');
    }
  };

  const saveSettings = async () => {
    try {
      setSavingSettings(true);
      // Would send API request to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API delay

      toast.success('Bot detection settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'blocked':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'captcha':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'logged':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="border border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Robot className="h-5 w-5 text-purple-400" />
          Bot Detection & Prevention
        </CardTitle>
        <CardDescription>
          Configure and monitor automated bot detection and prevention measures
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="settings">
          <TabsList className="w-full rounded-none border-b border-slate-800 bg-slate-950">
            <TabsTrigger value="settings" className="rounded-none">Settings</TabsTrigger>
            <TabsTrigger value="rules" className="rounded-none">Detection Rules</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-none">Bot Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <h3 className="font-medium">Bot Protection</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Enable or disable the bot detection and prevention system
                </p>
              </div>
              <Switch
                checked={settings.botProtectionEnabled}
                onCheckedChange={checked => setSettings({ ...settings, botProtectionEnabled: checked })}
              />
            </div>

            <Separator className="my-6" />

            <div className="space-y-8">
              <div className="space-y-3">
                <Label>Detection Sensitivity: {settings.detectionSensitivity}%</Label>
                <Slider
                  value={[settings.detectionSensitivity]}
                  max={100}
                  step={5}
                  onValueChange={value => setSettings({ ...settings, detectionSensitivity: value[0] })}
                />
                <p className="text-xs text-slate-400">
                  Higher sensitivity may detect more bots but could increase false positives
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>CAPTCHA Threshold: {settings.captchaThreshold}%</Label>
                  <Slider
                    value={[settings.captchaThreshold]}
                    max={100}
                    step={5}
                    onValueChange={value => setSettings({ ...settings, captchaThreshold: value[0] })}
                  />
                  <p className="text-xs text-slate-400">
                    Confidence level required to trigger a CAPTCHA challenge
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Block Threshold: {settings.blockThreshold}%</Label>
                  <Slider
                    value={[settings.blockThreshold]}
                    max={100}
                    step={5}
                    onValueChange={value => setSettings({ ...settings, blockThreshold: value[0] })}
                  />
                  <p className="text-xs text-slate-400">
                    Confidence level required to automatically block a bot
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Block Enabled</Label>
                      <p className="text-xs text-slate-400 mt-1">
                        Automatically block IPs that exceed the block threshold
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoBlockEnabled}
                      onCheckedChange={checked => setSettings({ ...settings, autoBlockEnabled: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>IP Block Duration</Label>
                    <Select
                      value={settings.ipBlockDuration}
                      onValueChange={value => setSettings({ ...settings, ipBlockDuration: value })}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-700">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alert on Detection</Label>
                      <p className="text-xs text-slate-400 mt-1">
                        Send admin alerts for high-confidence bot detections
                      </p>
                    </div>
                    <Switch
                      checked={settings.alertOnDetection}
                      onCheckedChange={checked => setSettings({ ...settings, alertOnDetection: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Advanced Browser Fingerprinting</Label>
                      <p className="text-xs text-slate-400 mt-1">
                        Detect bots using advanced browser fingerprinting techniques
                      </p>
                    </div>
                    <Switch
                      checked={settings.preventHeadlessBrowsers}
                      onCheckedChange={checked => setSettings({ ...settings, preventHeadlessBrowsers: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={saveSettings}
                disabled={savingSettings}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {savingSettings ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="px-0 py-4">
            <div className="space-y-6">
              <div className="px-6">
                <h3 className="font-medium mb-4">Add New Detection Rule</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input
                      id="rule-name"
                      placeholder="E.g. Suspicious User Agent"
                      className="bg-slate-950 border-slate-700"
                      value={newRule.name}
                      onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="rule-pattern">Pattern</Label>
                    <Input
                      id="rule-pattern"
                      placeholder="E.g. (bot|crawler|spider)"
                      className="bg-slate-950 border-slate-700"
                      value={newRule.pattern}
                      onChange={e => setNewRule({ ...newRule, pattern: e.target.value })}
                    />
                    <p className="text-xs text-slate-500">
                      Use regex patterns or special syntax like 'request-rate {'>'} 30/minute'
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rule-action">Action</Label>
                    <Select
                      value={newRule.action}
                      onValueChange={value => setNewRule({ ...newRule, action: value as 'block' | 'log' | 'captcha' })}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-700">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="log">Log Only</SelectItem>
                        <SelectItem value="captcha">Show CAPTCHA</SelectItem>
                        <SelectItem value="block">Block Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={addRule}>
                  Add Rule
                </Button>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h3 className="font-medium px-6 mb-4">Active Detection Rules</h3>
                <div className="rounded-md overflow-auto">
                  <Table>
                    <TableHeader className="bg-slate-900">
                      <TableRow>
                        <TableHead className="w-[250px]">Rule Name</TableHead>
                        <TableHead className="w-[300px]">Pattern</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Detections</TableHead>
                        <TableHead>Last Detected</TableHead>
                        <TableHead className="text-right">Controls</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map(rule => (
                        <TableRow key={rule.id} className="hover:bg-slate-900/50">
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>
                            <code className="bg-slate-800 px-2 py-1 rounded text-xs">
                              {rule.pattern}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs border px-2 py-1 rounded-full ${
                              rule.action === 'block' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                rule.action === 'captcha' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                  'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            }`}>
                              {rule.action === 'block' ? 'Block' :
                                rule.action === 'captcha' ? 'CAPTCHA' : 'Log Only'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={checked => toggleRuleStatus(rule.id, checked)}
                              className="scale-75 data-[state=checked]:bg-green-500"
                            />
                          </TableCell>
                          <TableCell>{rule.detectionCount.toLocaleString()}</TableCell>
                          <TableCell>{formatDate(rule.lastDetected)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => deleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="p-0">
            <div className="p-6 pb-2 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-medium">Recent Bot Detections</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span>Blocked</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span>CAPTCHA</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Logged</span>
                </div>
              </div>
            </div>

            <div className="rounded-md overflow-auto">
              <Table>
                <TableHeader className="bg-slate-900">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Request</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Rule Triggered</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detections.map(detection => (
                    <TableRow key={detection.id} className="hover:bg-slate-900/50">
                      <TableCell>{formatDate(detection.timestamp)}</TableCell>
                      <TableCell className="font-mono text-xs">{detection.ipAddress}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-bold px-1 rounded ${
                            detection.method === 'GET' ? 'text-green-400' :
                              detection.method === 'POST' ? 'text-blue-400' :
                                detection.method === 'DELETE' ? 'text-red-400' : 'text-purple-400'
                          }`}>
                            {detection.method}
                          </span>
                          <span className="text-xs font-mono truncate max-w-[200px] overflow-hidden">
                            {detection.url}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="truncate max-w-[200px] text-xs text-slate-400">
                          {detection.userAgent}
                        </div>
                      </TableCell>
                      <TableCell>{detection.ruleTriggered}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-xs border px-2 py-1 rounded-full ${getActionBadgeColor(detection.action)}`}>
                          {detection.action}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-6 flex justify-end">
              <Button variant="outline" size="sm" className="border-slate-700">
                View Full History
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BotDetection;
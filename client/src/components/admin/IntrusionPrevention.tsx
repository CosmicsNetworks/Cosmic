
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Lock,
  AlertTriangle,
  Globe,
  Code,
  Server,
  Network,
  ArrowUpDown,
  CheckSquare,
  XSquare,
  PlusCircle,
  Trash2,
  Save
} from 'lucide-react';

const IntrusionPrevention = () => {
  const [activeRules, setActiveRules] = useState(true);
  const [blockXSS, setBlockXSS] = useState(true);
  const [blockSQLi, setBlockSQLi] = useState(true);
  const [blockBruteForce, setBlockBruteForce] = useState(true);
  const [ddosProtection, setDdosProtection] = useState(true);
  const [consoleProtection, setConsoleProtection] = useState(true);
  const [ipBlacklist, setIpBlacklist] = useState([
    { id: 1, ip: '103.77.12.56', reason: 'Multiple intrusion attempts', count: 45, added: '2023-07-15' },
    { id: 2, ip: '45.33.21.89', reason: 'XSS attacks', count: 12, added: '2023-07-16' },
    { id: 3, ip: '192.168.1.45', reason: 'SQL injection attempts', count: 7, added: '2023-07-18' }
  ]);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newIpReason, setNewIpReason] = useState('');
  
  const [customRules, setCustomRules] = useState([
    { id: 1, name: 'Block PHP File Uploads', pattern: '*.php$', action: 'block', enabled: true },
    { id: 2, name: 'Restrict API Access', pattern: '/api/admin/*', action: 'authenticate', enabled: true },
    { id: 3, name: 'Log All Script Tags', pattern: '<script>', action: 'log', enabled: false }
  ]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleAction, setNewRuleAction] = useState('block');
  
  const handleAddIpToBlacklist = () => {
    if (newIpAddress.trim() === '') return;
    
    const newId = ipBlacklist.length > 0 ? Math.max(...ipBlacklist.map(ip => ip.id)) + 1 : 1;
    
    setIpBlacklist([
      ...ipBlacklist,
      {
        id: newId,
        ip: newIpAddress,
        reason: newIpReason || 'Manual addition',
        count: 0,
        added: new Date().toISOString().split('T')[0]
      }
    ]);
    
    setNewIpAddress('');
    setNewIpReason('');
  };
  
  const handleRemoveIp = (id: number) => {
    setIpBlacklist(ipBlacklist.filter(ip => ip.id !== id));
  };
  
  const handleAddCustomRule = () => {
    if (newRuleName.trim() === '' || newRulePattern.trim() === '') return;
    
    const newId = customRules.length > 0 ? Math.max(...customRules.map(rule => rule.id)) + 1 : 1;
    
    setCustomRules([
      ...customRules,
      {
        id: newId,
        name: newRuleName,
        pattern: newRulePattern,
        action: newRuleAction,
        enabled: true
      }
    ]);
    
    setNewRuleName('');
    setNewRulePattern('');
    setNewRuleAction('block');
  };
  
  const handleToggleRule = (id: number) => {
    setCustomRules(
      customRules.map(rule => 
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };
  
  const handleRemoveRule = (id: number) => {
    setCustomRules(customRules.filter(rule => rule.id !== id));
  };
  
  const renderActionBadge = (action: string) => {
    switch(action) {
      case 'block':
        return <Badge className="bg-red-600 hover:bg-red-600">Block</Badge>;
      case 'authenticate':
        return <Badge className="bg-amber-600 hover:bg-amber-600">Authenticate</Badge>;
      case 'log':
        return <Badge className="bg-blue-600 hover:bg-blue-600">Log</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="h-6 w-6 text-green-400" />
        Intrusion Prevention System
      </h2>
      
      <Tabs defaultValue="protections" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="protections" className="flex items-center gap-1">
            <Shield className="h-4 w-4" /> Protections
          </TabsTrigger>
          <TabsTrigger value="blacklist" className="flex items-center gap-1">
            <Globe className="h-4 w-4" /> IP Blacklist
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-1">
            <Code className="h-4 w-4" /> Custom Rules
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Lock className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Protection Tab */}
        <TabsContent value="protections">
          <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Security Protections
              </CardTitle>
              <CardDescription>
                Configure active protection measures against common attack vectors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall IPS toggle */}
              <div className="flex items-center justify-between rounded-lg border border-green-500/20 p-4 bg-green-950/10">
                <div className="space-y-0.5">
                  <Label className="text-base">Intrusion Prevention System</Label>
                  <p className="text-sm text-muted-foreground">
                    Enables active protection against attacks and malicious activities
                  </p>
                </div>
                <Switch
                  checked={activeRules}
                  onCheckedChange={setActiveRules}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              
              {/* Protection modules */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 bg-black/20">
                  <div className="space-y-0.5">
                    <Label>Cross-Site Scripting (XSS) Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Blocks malicious scripts and code injection attempts
                    </p>
                  </div>
                  <Switch
                    checked={blockXSS}
                    onCheckedChange={setBlockXSS}
                    disabled={!activeRules}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 bg-black/20">
                  <div className="space-y-0.5">
                    <Label>SQL Injection Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevents database manipulation through malicious SQL queries
                    </p>
                  </div>
                  <Switch
                    checked={blockSQLi}
                    onCheckedChange={setBlockSQLi}
                    disabled={!activeRules}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 bg-black/20">
                  <div className="space-y-0.5">
                    <Label>Brute Force Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Blocks multiple failed login attempts from the same source
                    </p>
                  </div>
                  <Switch
                    checked={blockBruteForce}
                    onCheckedChange={setBlockBruteForce}
                    disabled={!activeRules}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 bg-black/20">
                  <div className="space-y-0.5">
                    <Label>DDoS Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Mitigates traffic spikes and distributed denial of service attacks
                    </p>
                  </div>
                  <Switch
                    checked={ddosProtection}
                    onCheckedChange={setDdosProtection}
                    disabled={!activeRules}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 bg-black/20">
                  <div className="space-y-0.5">
                    <Label>Console Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevents users from using browser console for malicious actions
                    </p>
                  </div>
                  <Switch
                    checked={consoleProtection}
                    onCheckedChange={setConsoleProtection}
                    disabled={!activeRules}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" /> Save Protection Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* IP Blacklist Tab */}
        <TabsContent value="blacklist">
          <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-400" />
                IP Blacklist
              </CardTitle>
              <CardDescription>
                Manage blocked IP addresses and ranges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add IP form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border border-slate-700/30 bg-black/20">
                <div>
                  <Label htmlFor="ip-address">IP Address</Label>
                  <Input
                    id="ip-address"
                    placeholder="e.g. 192.168.1.1"
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                    className="mt-1.5 bg-black/30"
                  />
                </div>
                <div>
                  <Label htmlFor="ip-reason">Reason (Optional)</Label>
                  <Input
                    id="ip-reason"
                    placeholder="Why is this IP being blocked?"
                    value={newIpReason}
                    onChange={(e) => setNewIpReason(e.target.value)}
                    className="mt-1.5 bg-black/30"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleAddIpToBlacklist}
                    disabled={!newIpAddress}
                    className="w-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add to Blacklist
                  </Button>
                </div>
              </div>
              
              {/* IP Blacklist table */}
              <div className="rounded-md border border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-black/60">
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Incidents</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ipBlacklist.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No IP addresses blacklisted
                        </TableCell>
                      </TableRow>
                    ) : (
                      ipBlacklist.map((ip) => (
                        <TableRow key={ip.id}>
                          <TableCell className="font-mono">{ip.ip}</TableCell>
                          <TableCell>{ip.reason}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-red-500/30 text-red-400">
                              {ip.count}
                            </Badge>
                          </TableCell>
                          <TableCell>{ip.added}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveIp(ip.id)}
                              className="h-8 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Custom Rules Tab */}
        <TabsContent value="rules">
          <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-400" />
                Custom Security Rules
              </CardTitle>
              <CardDescription>
                Create custom rules to block or monitor specific patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Custom Rule form */}
              <div className="p-4 rounded-lg border border-slate-700/30 bg-black/20 space-y-4">
                <h3 className="font-medium">Add New Rule</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input
                      id="rule-name"
                      placeholder="e.g. Block .env Access"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      className="mt-1.5 bg-black/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rule-pattern">Pattern</Label>
                    <Input
                      id="rule-pattern"
                      placeholder="e.g. /.env$"
                      value={newRulePattern}
                      onChange={(e) => setNewRulePattern(e.target.value)}
                      className="mt-1.5 bg-black/30"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-action">Action</Label>
                    <select
                      id="rule-action"
                      value={newRuleAction}
                      onChange={(e) => setNewRuleAction(e.target.value)}
                      className="w-full mt-1.5 rounded-md border border-slate-700/50 bg-black/30 px-3 py-2 text-sm"
                    >
                      <option value="block">Block Request</option>
                      <option value="authenticate">Require Authentication</option>
                      <option value="log">Log Only</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleAddCustomRule}
                      disabled={!newRuleName || !newRulePattern}
                      className="w-full"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Rule
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Custom Rules table */}
              <div className="rounded-md border border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-black/60">
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Pattern</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No custom rules defined
                        </TableCell>
                      </TableRow>
                    ) : (
                      customRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>{rule.name}</TableCell>
                          <TableCell className="font-mono text-sm">{rule.pattern}</TableCell>
                          <TableCell>{renderActionBadge(rule.action)}</TableCell>
                          <TableCell>
                            {rule.enabled ? (
                              <Badge className="bg-green-600 hover:bg-green-600">Active</Badge>
                            ) : (
                              <Badge variant="outline">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleToggleRule(rule.id)}
                                className="h-8"
                                title={rule.enabled ? "Disable rule" : "Enable rule"}
                              >
                                {rule.enabled ? (
                                  <XSquare className="h-4 w-4 text-amber-400" />
                                ) : (
                                  <CheckSquare className="h-4 w-4 text-green-400" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveRule(rule.id)}
                                className="h-8 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                                title="Delete rule"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-400" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure global security parameters and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 rounded-lg border border-slate-700/30 bg-black/20 p-4">
                  <h3 className="font-medium">Brute Force Protection Settings</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-attempts">Max Login Attempts</Label>
                    <Input
                      id="login-attempts"
                      type="number"
                      defaultValue={5}
                      min={1}
                      max={20}
                      className="bg-black/30"
                    />
                    <p className="text-xs text-slate-400">
                      Number of failed attempts before temporary IP block
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="block-duration">Block Duration (minutes)</Label>
                    <Input
                      id="block-duration"
                      type="number"
                      defaultValue={30}
                      min={5}
                      max={1440}
                      className="bg-black/30"
                    />
                    <p className="text-xs text-slate-400">
                      How long IPs stay blocked after exceeding the limit
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 rounded-lg border border-slate-700/30 bg-black/20 p-4">
                  <h3 className="font-medium">Rate Limiting Settings</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rate-limit">Requests per Minute</Label>
                    <Input
                      id="rate-limit"
                      type="number"
                      defaultValue={60}
                      min={10}
                      max={1000}
                      className="bg-black/30"
                    />
                    <p className="text-xs text-slate-400">
                      Maximum requests allowed from a single IP per minute
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rate-limit-action">Action when Exceeded</Label>
                    <select
                      id="rate-limit-action"
                      defaultValue="block"
                      className="w-full rounded-md border border-slate-700/50 bg-black/30 px-3 py-2 text-sm"
                    >
                      <option value="block">Block Temporarily</option>
                      <option value="captcha">Show CAPTCHA</option>
                      <option value="slow">Slow Down Responses</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 rounded-lg border border-slate-700/30 bg-black/20 p-4">
                  <h3 className="font-medium">Content Security Policy</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="csp-settings">CSP Configuration</Label>
                    <Textarea
                      id="csp-settings"
                      rows={5}
                      defaultValue="default-src 'self'; script-src 'self' https://trusted-cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
                      className="font-mono text-xs bg-black/30"
                    />
                    <p className="text-xs text-slate-400">
                      Content Security Policy header to prevent XSS attacks
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 rounded-lg border border-slate-700/30 bg-black/20 p-4">
                  <h3 className="font-medium">General Security Settings</h3>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label>HTTP Strict Transport Security (HSTS)</Label>
                      <p className="text-xs text-slate-400">
                        Force browsers to use HTTPS
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label>Block Known Malicious User Agents</Label>
                      <p className="text-xs text-slate-400">
                        Block requests from known malicious bots
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label>Security Headers</Label>
                      <p className="text-xs text-slate-400">
                        Add security-related HTTP headers to all responses
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="mr-2 h-4 w-4" /> Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntrusionPrevention;

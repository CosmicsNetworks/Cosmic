import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, RefreshCw, Star } from 'lucide-react';

const PremiumCodeGenerator: React.FC = () => {
  const [count, setCount] = useState<number>(1);
  const [duration, setDuration] = useState<string>("30");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const { toast } = useToast();

  // Handle generating premium codes
  const generateCodes = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/generate-premium-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          count: count,
          duration: parseInt(duration)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCodes(data.codes);
        toast({
          title: "Codes Generated",
          description: `Successfully generated ${data.codes.length} premium codes`,
          variant: "default",
        });
      } else {
        throw new Error(data.error || "Failed to generate codes");
      }
    } catch (error) {
      console.error('Generate codes error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate premium codes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy all codes to clipboard
  const copyAllCodes = () => {
    if (generatedCodes.length > 0) {
      navigator.clipboard.writeText(generatedCodes.join('\n'));
      toast({
        title: "Copied",
        description: "All codes copied to clipboard",
        variant: "default",
      });
    }
  };

  // Clear generated codes
  const clearCodes = () => {
    setGeneratedCodes([]);
  };

  return (
    <Card className="w-full bg-slate-900/80 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient-blue-purple">
          <Star className="h-5 w-5" />
          Premium Code Generator
        </CardTitle>
        <CardDescription>
          Generate premium upgrade codes for your users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Number of Codes</label>
            <Input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Duration (days)</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">365 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {generatedCodes.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-slate-300">Generated Codes</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyAllCodes}
                  className="text-xs h-8 border-slate-700"
                >
                  <Clipboard className="h-3.5 w-3.5 mr-1" />
                  Copy All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearCodes}
                  className="text-xs h-8 border-slate-700"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            <div className="bg-slate-800 rounded-md p-3 max-h-40 overflow-y-auto text-xs font-mono">
              {generatedCodes.map((code, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-1 px-2 hover:bg-slate-700/50 rounded"
                >
                  <span>{code}</span>
                  <span className="text-slate-400">{duration} days</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateCodes}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isGenerating ? 'Generating...' : 'Generate Premium Codes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PremiumCodeGenerator;
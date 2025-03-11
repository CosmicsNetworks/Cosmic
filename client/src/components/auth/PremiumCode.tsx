import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Form schema for premium code
const formSchema = z.object({
  code: z.string().min(8, {
    message: 'Premium code must be at least 8 characters',
  }),
});

interface PremiumCodeProps {
  showNotification: (title: string, message: string) => void;
}

const PremiumCode = ({ showNotification }: PremiumCodeProps) => {
  const { isAuthenticated, redeemCode, premiumStatus, user } = useAuth();
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  // Define the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isAuthenticated) {
      showNotification('Error', 'You must be logged in to redeem a premium code');
      return;
    }
    
    setIsRedeeming(true);
    try {
      const success = await redeemCode(values.code);
      
      if (success) {
        showNotification('Success', 'Premium code redeemed successfully! Your account has been upgraded.');
        form.reset();
      } else {
        showNotification('Error', 'Invalid or already used premium code');
      }
    } catch (error) {
      console.error('Redeem error:', error);
      showNotification('Error', 'An error occurred while redeeming the code');
    } finally {
      setIsRedeeming(false);
    }
  };
  
  // Format expiry date
  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Card className="w-full max-w-md border border-yellow-500/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-400" />
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Premium Access
          </span>
        </CardTitle>
        <CardDescription>
          Enter your premium code to unlock all features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {premiumStatus?.isPremium ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Badge className="px-3 py-1 text-sm bg-gradient-to-r from-yellow-400 to-amber-600 text-black">
                Premium Active
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-300">Your premium access is active</p>
              <p className="text-sm text-yellow-500">Expires: {formatExpiryDate(premiumStatus.expiresAt)}</p>
            </div>
            <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
              <h3 className="text-yellow-400 font-medium">Your Premium Benefits:</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-300">
                <li>• Instant search results with no delays</li>
                <li>• Advanced search tools and filters</li>
                <li>• Extended search history tracking</li>
                <li>• Priority proxy access with faster loading</li>
              </ul>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <KeyRound className="h-3 w-3" /> Premium Code
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your premium code" 
                        {...field} 
                        className="bg-black/30 border-yellow-500/30 focus:border-yellow-400 focus:ring-yellow-400/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isRedeeming || !isAuthenticated}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black"
              >
                {isRedeeming ? 'Redeeming...' : 'Redeem Code'}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 border-t border-yellow-500/10 pt-4">
        <div className="text-xs text-gray-400 text-center">
          <p>Premium codes can be purchased from our official channels only.</p>
          <p className="mt-1">Contact support if you have any issues with your premium code.</p>
        </div>
        
        {premiumStatus?.isPremium && (
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Want to extend your premium access? You can redeem another code:
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 flex items-stretch gap-2">
                <Input 
                  placeholder="Enter premium code" 
                  {...form.register('code')} 
                  className="h-9 text-sm bg-black/30 border-yellow-500/30"
                />
                <Button 
                  type="submit" 
                  disabled={isRedeeming}
                  className="h-9 px-3 bg-amber-500 hover:bg-amber-600 text-black text-sm"
                >
                  Extend
                </Button>
              </form>
            </Form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PremiumCode;
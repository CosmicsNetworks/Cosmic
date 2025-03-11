
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, LockKeyhole, KeyRound } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const twoFactorSchema = z.object({
  token: z.string().min(6, "Verification code must be at least 6 characters"),
});

const recoveryCodeSchema = z.object({
  recoveryCode: z.string().min(8, "Recovery code must be at least 8 characters"),
});

interface TwoFactorLoginFormProps {
  username: string;
  onSubmit: (token: string, recoveryCode?: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const TwoFactorLoginForm = ({ 
  username, 
  onSubmit, 
  onCancel, 
  isLoading 
}: TwoFactorLoginFormProps) => {
  const [tab, setTab] = useState<'token' | 'recovery'>('token');
  
  const tokenForm = useForm<z.infer<typeof twoFactorSchema>>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      token: '',
    },
  });
  
  const recoveryForm = useForm<z.infer<typeof recoveryCodeSchema>>({
    resolver: zodResolver(recoveryCodeSchema),
    defaultValues: {
      recoveryCode: '',
    },
  });
  
  const handleTokenSubmit = async (values: z.infer<typeof twoFactorSchema>) => {
    await onSubmit(values.token);
  };
  
  const handleRecoverySubmit = async (values: z.infer<typeof recoveryCodeSchema>) => {
    await onSubmit('', values.recoveryCode);
  };
  
  return (
    <Card className="w-full max-w-md border border-cyan-500/20 bg-black/80 backdrop-blur-xl shadow-xl animate-in fade-in-50 slide-in-from-bottom-5">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-cyan-500" />
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold text-center">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-center">
          Enter the verification code from your authenticator app
        </CardDescription>
        <div className="bg-cyan-500/10 text-cyan-400 py-1 px-3 rounded-full text-xs font-medium mx-auto inline-flex items-center">
          <LockKeyhole className="h-3 w-3 mr-1" />
          {username}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="token" value={tab} onValueChange={(value) => setTab(value as 'token' | 'recovery')}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="token">Authenticator</TabsTrigger>
            <TabsTrigger value="recovery">Recovery Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="token">
            <Form {...tokenForm}>
              <form onSubmit={tokenForm.handleSubmit(handleTokenSubmit)} className="space-y-4">
                <FormField
                  control={tokenForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Verification Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter 6-digit code" 
                          className="text-center font-mono tracking-widest bg-black/50"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-gray-400 hover:text-gray-300"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="recovery">
            <Form {...recoveryForm}>
              <form onSubmit={recoveryForm.handleSubmit(handleRecoverySubmit)} className="space-y-4">
                <FormField
                  control={recoveryForm.control}
                  name="recoveryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Recovery Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter recovery code" 
                          className="font-mono bg-black/50"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Use Recovery Code'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-gray-400 hover:text-gray-300"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3 border-t border-white/5 pt-4">
        <div className="text-xs text-gray-400 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <KeyRound className="h-3 w-3" />
            <span>Need help?</span>
          </div>
          <p>Contact support if you're having trouble accessing your account.</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TwoFactorLoginForm;

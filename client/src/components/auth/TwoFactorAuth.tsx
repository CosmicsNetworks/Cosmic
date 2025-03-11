
import { useState, useEffect } from 'react';
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
import { Lock, LockOpen, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form schema for 2FA verification
const verificationSchema = z.object({
  token: z.string().min(6, {
    message: 'Token must be at least 6 characters',
  }),
});

// Form schema for disabling 2FA
const disableSchema = z.object({
  password: z.string().min(1, {
    message: 'Password is required',
  }),
  token: z.string().min(6, {
    message: 'Token must be at least 6 characters',
  }),
});

// Form schema for enabling 2FA
const enableSchema = z.object({
  password: z.string().min(1, {
    message: 'Password is required',
  }),
});

interface TwoFactorAuthProps {
  showNotification: (title: string, message: string) => void;
}

const TwoFactorAuth = ({ showNotification }: TwoFactorAuthProps) => {
  const { isAuthenticated, user, fetchUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret?: string;
    qrCodeUrl?: string;
    recoveryCodes?: string[];
  }>({});
  const [setupStep, setSetupStep] = useState<'initial' | 'setup' | 'verify'>('initial');
  
  // Load 2FA status
  useEffect(() => {
    if (user?.twoFactorEnabled) {
      setIs2FAEnabled(true);
    } else {
      setIs2FAEnabled(false);
    }
  }, [user]);
  
  // Define the forms
  const verificationForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      token: '',
    },
  });
  
  const disableForm = useForm<z.infer<typeof disableSchema>>({
    resolver: zodResolver(disableSchema),
    defaultValues: {
      password: '',
      token: '',
    },
  });
  
  const enableForm = useForm<z.infer<typeof enableSchema>>({
    resolver: zodResolver(enableSchema),
    defaultValues: {
      password: '',
    },
  });
  
  // Start 2FA setup
  const startSetup = async (values: z.infer<typeof enableSchema>) => {
    if (!isAuthenticated) {
      showNotification('Error', 'You must be logged in to set up 2FA');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: values.password,
        }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up 2FA');
      }
      
      setSetupData({
        secret: data.secret,
        qrCodeUrl: data.qrCodeUrl,
        recoveryCodes: data.recoveryCodes,
      });
      
      setSetupStep('verify');
      showNotification('Success', 'Please scan the QR code with your authenticator app and enter the code to complete setup');
    } catch (error: any) {
      console.error('2FA setup error:', error);
      showNotification('Error', error.message || 'An error occurred while setting up 2FA');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verify and enable 2FA
  const verifyAndEnable = async (values: z.infer<typeof verificationSchema>) => {
    if (!isAuthenticated) {
      showNotification('Error', 'You must be logged in to verify 2FA');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: values.token,
        }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify 2FA token');
      }
      
      setIs2FAEnabled(true);
      setSetupStep('initial');
      await fetchUserData();
      showNotification('Success', '2FA has been enabled successfully! Keep your recovery codes in a safe place.');
    } catch (error: any) {
      console.error('2FA verification error:', error);
      showNotification('Error', error.message || 'An error occurred while verifying the 2FA token');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disable 2FA
  const disable2FA = async (values: z.infer<typeof disableSchema>) => {
    if (!isAuthenticated) {
      showNotification('Error', 'You must be logged in to disable 2FA');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: values.password,
          token: values.token,
        }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA');
      }
      
      setIs2FAEnabled(false);
      disableForm.reset();
      await fetchUserData();
      showNotification('Success', '2FA has been disabled successfully');
    } catch (error: any) {
      console.error('2FA disable error:', error);
      showNotification('Error', error.message || 'An error occurred while disabling 2FA');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md border border-cyan-500/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          {is2FAEnabled ? (
            <ShieldCheck className="h-6 w-6 text-green-400" />
          ) : (
            <Lock className="h-6 w-6 text-cyan-400" />
          )}
          <span className={`${is2FAEnabled ? 'text-green-400' : 'text-cyan-400'}`}>
            Two-Factor Authentication
          </span>
        </CardTitle>
        <CardDescription>
          {is2FAEnabled 
            ? 'Your account is protected with two-factor authentication'
            : 'Add an extra layer of security to your account'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 2FA Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-white/10">
          <div className="flex items-center gap-3">
            {is2FAEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-400" />
            ) : (
              <LockOpen className="h-5 w-5 text-amber-400" />
            )}
            <div>
              <p className="font-medium">
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-sm text-gray-400">
                {is2FAEnabled 
                  ? 'Your account has an extra layer of security'
                  : 'Your account could be more secure with 2FA'}
              </p>
            </div>
          </div>
          
          {!is2FAEnabled && setupStep === 'initial' && (
            <Button
              onClick={() => setSetupStep('setup')}
              className="bg-cyan-600 hover:bg-cyan-700"
              size="sm"
            >
              Enable
            </Button>
          )}
        </div>
        
        {/* Setup 2FA */}
        {!is2FAEnabled && setupStep === 'setup' && (
          <div className="space-y-4">
            <Alert className="bg-cyan-900/20 border-cyan-500/30">
              <AlertTriangle className="h-4 w-4 text-cyan-400" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to set up 2FA.
              </AlertDescription>
            </Alert>
            
            <Form {...enableForm}>
              <form onSubmit={enableForm.handleSubmit(startSetup)} className="space-y-4">
                <FormField
                  control={enableForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm your password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your current password" 
                          {...field} 
                          className="bg-black/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setSetupStep('initial')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    {isLoading ? 'Processing...' : 'Continue'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
        {/* Verify 2FA */}
        {!is2FAEnabled && setupStep === 'verify' && setupData.qrCodeUrl && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="mb-2 text-gray-300">Scan this QR code with your authenticator app:</p>
              <div className="flex justify-center mb-4">
                <img 
                  src={setupData.qrCodeUrl} 
                  alt="2FA QR Code" 
                  className="border-4 border-white/10 rounded-lg" 
                  width={200} 
                  height={200} 
                />
              </div>
              {setupData.secret && (
                <div className="mb-4 text-sm">
                  <p className="text-gray-400 mb-1">Or enter this code manually:</p>
                  <code className="bg-black/30 px-2 py-1 rounded font-mono text-amber-300">
                    {setupData.secret}
                  </code>
                </div>
              )}
            </div>
            
            {setupData.recoveryCodes && (
              <div className="mt-4">
                <Alert className="bg-amber-900/20 border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <AlertTitle>Save your recovery codes</AlertTitle>
                  <AlertDescription>
                    If you lose access to your authenticator app, you'll need these codes to log in.
                    Store them in a safe place.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-black/40 rounded-lg border border-white/10">
                  {setupData.recoveryCodes.map((code, index) => (
                    <code key={index} className="font-mono text-xs bg-black/30 p-1 rounded text-amber-300 text-center">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            )}
            
            <Form {...verificationForm}>
              <form onSubmit={verificationForm.handleSubmit(verifyAndEnable)} className="space-y-4">
                <FormField
                  control={verificationForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter the 6-digit code" 
                          {...field} 
                          className="bg-black/30 text-center font-mono tracking-widest"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setSetupStep('initial')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    {isLoading ? 'Verifying...' : 'Enable 2FA'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
        {/* Disable 2FA */}
        {is2FAEnabled && (
          <div className="space-y-4">
            <Alert className="bg-red-900/20 border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Disabling 2FA will reduce your account security. You'll need to provide your password and a verification code to continue.
              </AlertDescription>
            </Alert>
            
            <Form {...disableForm}>
              <form onSubmit={disableForm.handleSubmit(disable2FA)} className="space-y-4">
                <FormField
                  control={disableForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your current password" 
                          {...field} 
                          className="bg-black/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={disableForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter the 6-digit code" 
                          {...field} 
                          className="bg-black/30 text-center font-mono tracking-widest"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : 'Disable 2FA'}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center border-t border-white/10 pt-4">
        <p className="text-xs text-gray-400 text-center">
          Two-factor authentication adds an extra layer of security by requiring a 
          code from your authenticator app in addition to your password.
        </p>
      </CardFooter>
    </Card>
  );
};

export default TwoFactorAuth;

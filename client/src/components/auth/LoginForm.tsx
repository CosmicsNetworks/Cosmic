import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useModal } from '@/lib/modalContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { LogIn, UserPlus, Shield } from 'lucide-react';

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
import TwoFactorLoginForm from './TwoFactorLoginForm';

// Form schema
const formSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters',
  }),
});

interface LoginFormProps {
  onSuccess?: () => void;
  showNotification: (title: string, message: string) => void;
}

const LoginForm = ({ onSuccess, showNotification }: LoginFormProps) => {
  const { login, validate2FA } = useAuth();
  const { openModal } = useModal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [username, setUsername] = useState('');

  // Define the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoggingIn(true);
    try {
      const result = await login(values.username, values.password);

      if (result.success) {
        showNotification('Welcome back!', 'You have successfully logged in');
        onSuccess?.();
      } else if (result.requires2FA) {
        // Switch to 2FA verification
        setRequires2FA(true);
        setUsername(values.username);
      } else {
        showNotification('Error', 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification('Error', 'An error occurred during login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle 2FA verification
  const handle2FASubmit = async (token: string, recoveryCode?: string) => {
    setIsLoggingIn(true);
    try {
      const success = await validate2FA(username, token, recoveryCode);

      if (success) {
        showNotification('Welcome back!', 'You have successfully logged in');
        onSuccess?.();
      } else {
        showNotification('Error', 'Invalid verification code');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      showNotification('Error', 'An error occurred during 2FA verification');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const cancelTwoFactor = () => {
    setRequires2FA(false);
    setUsername('');
  };

  if (requires2FA) {
    return (
      <TwoFactorLoginForm
        username={username}
        onSubmit={handle2FASubmit}
        onCancel={cancelTwoFactor}
        isLoading={isLoggingIn}
      />
    );
  }

  return (
    <Card className="w-full max-w-md border border-purple-500/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your username and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your username" 
                      {...field} 
                      className="bg-black/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your password" 
                      {...field} 
                      className="bg-black/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>Logging in...</>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t border-purple-500/10 pt-4">
        <div className="text-sm text-center text-gray-400">
          <span>Don't have an account? </span>
          <Button 
            variant="link" 
            className="p-0 text-purple-400 hover:text-purple-300"
            onClick={() => openModal('signup')}
          >
            Sign up
          </Button>
        </div>

        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={() => openModal('premium')}>
            <UserPlus className="mr-2 h-4 w-4" /> Redeem Premium Code
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => {}}>
            <Shield className="mr-2 h-4 w-4" /> Forgot Password
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
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
import { Lock, LogIn } from 'lucide-react';

// Form schema for login
const formSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters',
  }),
});

interface LoginProps {
  onSwitchToSignup: () => void;
  showNotification: (title: string, message: string) => void;
  onSuccess?: () => void;
}

const Login = ({ onSwitchToSignup, showNotification, onSuccess }: LoginProps) => {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
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
      const success = await login(values.username, values.password);
      
      if (success) {
        showNotification('Success', 'Logged in successfully');
        form.reset();
        if (onSuccess) onSuccess();
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
  
  return (
    <Card className="w-full max-w-md border border-blue-500/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <LogIn className="h-6 w-6 text-blue-400" />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Login
          </span>
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account
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
                      className="bg-black/30 border-blue-500/30 focus:border-blue-400 focus:ring-blue-400/20"
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
                      className="bg-black/30 border-blue-500/30 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col border-t border-blue-500/10 pt-4 gap-4">
        <div className="text-xs text-center text-gray-400">
          <span>Secure, encrypted connection</span>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Lock className="h-3 w-3" />
            <span>Your credentials are never shared</span>
          </div>
        </div>
        <div className="text-sm text-center">
          <span className="text-gray-400">Don't have an account?</span>{' '}
          <Button 
            variant="link" 
            onClick={onSwitchToSignup} 
            className="p-0 text-blue-400 hover:text-blue-300"
          >
            Sign up
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Login;
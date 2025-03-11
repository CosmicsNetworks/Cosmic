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
import { Lock, UserPlus } from 'lucide-react';

// Form schema for signup
const formSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters',
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface SignupProps {
  onSwitchToLogin: () => void;
  showNotification: (title: string, message: string) => void;
  onSuccess?: () => void;
}

const Signup = ({ onSwitchToLogin, showNotification, onSuccess }: SignupProps) => {
  const { signup } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  // Define the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSigningUp(true);
    try {
      const success = await signup(values.username, values.email, values.password);
      
      if (success) {
        showNotification('Success', 'Account created successfully. You can now log in.');
        form.reset();
        if (onSuccess) onSuccess();
        onSwitchToLogin(); // Redirect to login after successful signup
      } else {
        showNotification('Error', 'Username or email may already be taken.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showNotification('Error', 'An error occurred during signup.');
    } finally {
      setIsSigningUp(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md border border-purple-500/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-purple-400" />
          <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Create Account
          </span>
        </CardTitle>
        <CardDescription>
          Join to unlock premium features and faster access
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
                      placeholder="Choose a username" 
                      {...field} 
                      className="bg-black/30 border-purple-500/30 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      {...field} 
                      className="bg-black/30 border-purple-500/30 focus:border-purple-400 focus:ring-purple-400/20"
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
                      placeholder="Create a password" 
                      {...field} 
                      className="bg-black/30 border-purple-500/30 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirm your password" 
                      {...field} 
                      className="bg-black/30 border-purple-500/30 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isSigningUp}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isSigningUp ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col border-t border-purple-500/10 pt-4 gap-4">
        <div className="text-xs text-center text-gray-400">
          <span>Secure, encrypted connection</span>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Lock className="h-3 w-3" />
            <span>Your information is never shared</span>
          </div>
        </div>
        <div className="text-sm text-center">
          <span className="text-gray-400">Already have an account?</span>{' '}
          <Button 
            variant="link" 
            onClick={onSwitchToLogin} 
            className="p-0 text-purple-400 hover:text-purple-300"
          >
            Log in
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Signup;
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle2 } from 'lucide-react';

const CreateAdminOwner = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const { toast } = useToast();

  const createAdminAccount = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/create-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setIsCreated(true);
        toast({
          title: "Admin Created",
          description: "The owner admin account has been created successfully",
          variant: "default"
        });
      } else {
        throw new Error(data.error || 'Failed to create admin account');
      }
    } catch (error) {
      console.error('Create admin error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create admin account',
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-900/90 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient-blue-purple">
          <Shield className="h-5 w-5" />
          Admin Account Setup
        </CardTitle>
        <CardDescription>
          Create the main admin account for the site owner
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCreated ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-2" />
            <h3 className="text-xl font-medium text-white">Admin Account Created!</h3>
            <p className="text-slate-300">
              Username: <span className="font-mono font-semibold">Kyx</span>
            </p>
            <p className="text-slate-300">
              Password: <span className="font-mono font-semibold">Kyx2025###</span>
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Please save these credentials. You can now log in with the admin account.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700 text-slate-300">
              <p className="mb-2">This will create the main admin account with:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Username: <span className="font-mono font-semibold">Kyx</span></li>
                <li>Password: <span className="font-mono font-semibold">Kyx2025###</span></li>
                <li>Role: Admin (full access)</li>
              </ul>
            </div>
            <p className="text-amber-400 text-sm">
              ⚠️ This operation can only be performed once. The admin account cannot be recreated if it already exists.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!isCreated && (
          <Button 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            disabled={isCreating || isCreated}
            onClick={createAdminAccount}
          >
            {isCreating ? 'Creating Admin...' : 'Create Admin Account'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CreateAdminOwner;
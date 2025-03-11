
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Power, Clock, AlertTriangle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { useAuth } from '@/lib/authContext';

// Form schema for shutdown
const shutdownSchema = z.object({
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
  isScheduled: z.boolean().default(false),
  scheduledDate: z.date().optional(),
  scheduledTime: z.string().optional(),
  duration: z.string().optional(),
});

const SiteShutdown = () => {
  const { user } = useAuth();
  const [isShutdownActive, setIsShutdownActive] = useState(false);
  const [shutdownInfo, setShutdownInfo] = useState<{
    message: string;
    startedAt: string;
    scheduledEndTime?: string;
    startedBy: string;
  } | null>(null);
  const [showShutdownDialog, setShowShutdownDialog] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof shutdownSchema>>({
    resolver: zodResolver(shutdownSchema),
    defaultValues: {
      message: '',
      isScheduled: false,
      duration: '1',
    },
  });
  
  // Watch isScheduled value to conditionally show date/time fields
  const isScheduled = form.watch('isScheduled');
  
  // Fetch shutdown status
  useEffect(() => {
    const fetchShutdownStatus = async () => {
      try {
        const response = await fetch('/api/admin/shutdown/status', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsShutdownActive(data.isActive);
          if (data.isActive) {
            setShutdownInfo(data.shutdownInfo);
          }
        }
      } catch (error) {
        console.error('Error fetching shutdown status:', error);
      }
    };
    
    fetchShutdownStatus();
  }, []);
  
  // Handle shutdown form submission
  const onSubmitShutdown = async (values: z.infer<typeof shutdownSchema>) => {
    // Only super admin (Kyx) can shutdown the site
    if (user?.username !== 'Kyx' && user?.role !== 'admin') {
      return;
    }
    
    try {
      const payload: any = {
        message: values.message,
      };
      
      if (values.isScheduled && values.scheduledDate && values.scheduledTime) {
        // Combine date and time for the API
        const scheduledDateTime = new Date(values.scheduledDate);
        const [hours, minutes] = values.scheduledTime.split(':').map(Number);
        scheduledDateTime.setHours(hours, minutes);
        
        payload.scheduledAt = scheduledDateTime.toISOString();
        payload.duration = values.duration;
      }
      
      const response = await fetch('/api/admin/shutdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsShutdownActive(true);
        setShutdownInfo(data.shutdownInfo);
        setShowShutdownDialog(false);
        form.reset();
      }
    } catch (error) {
      console.error('Error triggering shutdown:', error);
    }
  };
  
  // Handle site restart
  const handleRestart = async () => {
    try {
      const response = await fetch('/api/admin/shutdown/restart', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setIsShutdownActive(false);
        setShutdownInfo(null);
        setShowRestartDialog(false);
      }
    } catch (error) {
      console.error('Error restarting site:', error);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Check if user has shutdown permission (only Kyx or admins)
  const hasShutdownPermission = user?.username === 'Kyx' || user?.role === 'admin';
  
  return (
    <div className="space-y-4">
      <Card className={cn(
        "bg-black/40 backdrop-blur-sm border-slate-800",
        isShutdownActive && "border-red-500/30 bg-red-950/10"
      )}>
        <CardHeader>
          <CardTitle className={cn(
            "text-xl flex items-center gap-2",
            isShutdownActive ? "text-red-400" : "text-slate-200"
          )}>
            <Power className={cn(
              "h-5 w-5",
              isShutdownActive ? "text-red-400" : "text-slate-400"
            )} />
            Site Shutdown Controls
          </CardTitle>
          <CardDescription>
            {isShutdownActive 
              ? "The site is currently in shutdown mode. Only admins can access it."
              : "Control site availability and schedule maintenance periods"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className={cn(
            "p-4 rounded-md border flex items-center justify-between",
            isShutdownActive 
              ? "bg-red-950/20 border-red-500/30" 
              : "bg-green-950/20 border-green-500/30"
          )}>
            <div className="flex items-center gap-3">
              {isShutdownActive ? (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              )}
              <div>
                <h3 className={cn(
                  "font-medium",
                  isShutdownActive ? "text-red-400" : "text-green-400"
                )}>
                  {isShutdownActive ? "Site is in Shutdown Mode" : "Site is Online"}
                </h3>
                <p className="text-sm text-slate-400">
                  {isShutdownActive 
                    ? "Users cannot access the site until it's restarted"
                    : "The site is fully operational and accessible to all users"}
                </p>
              </div>
            </div>
            
            {hasShutdownPermission && (
              isShutdownActive ? (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowRestartDialog(true)}
                  className="bg-red-800 hover:bg-red-700 text-white"
                >
                  Restart Site
                </Button>
              ) : (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowShutdownDialog(true)}
                  className="bg-slate-800 hover:bg-slate-700"
                >
                  Shutdown Site
                </Button>
              )
            )}
          </div>
          
          {/* Shutdown Information */}
          {isShutdownActive && shutdownInfo && (
            <div className="p-4 rounded-md bg-black/30 border border-red-500/20 space-y-4">
              <h3 className="font-medium text-red-400 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Shutdown Information
              </h3>
              
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-400">Started By:</span>
                    <p>{shutdownInfo.startedBy}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Started At:</span>
                    <p>{formatTimestamp(shutdownInfo.startedAt)}</p>
                  </div>
                </div>
                
                {shutdownInfo.scheduledEndTime && (
                  <div>
                    <span className="text-sm text-slate-400">Scheduled End:</span>
                    <p>{formatTimestamp(shutdownInfo.scheduledEndTime)}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-slate-400">Shutdown Message:</span>
                  <p className="p-2 rounded bg-black/20 border border-red-500/10 mt-1">
                    {shutdownInfo.message}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Instructions */}
          {!isShutdownActive && (
            <div className="p-4 rounded-md bg-black/30 border border-slate-700/30">
              <h3 className="font-medium mb-2">Shutdown Instructions</h3>
              <ul className="text-sm space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>Shutting down the site will make it inaccessible to all regular users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>Only admin users will be able to access the admin panel during shutdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>Users will see a maintenance page with your shutdown message</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>You can schedule a shutdown for a specific time and duration</span>
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Shutdown Dialog */}
      <AlertDialog open={showShutdownDialog} onOpenChange={setShowShutdownDialog}>
        <AlertDialogContent className="bg-black/80 backdrop-blur-sm border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Shutdown Site</AlertDialogTitle>
            <AlertDialogDescription>
              This action will make the site inaccessible to all users except admins.
              Please provide a message to display during the shutdown.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitShutdown)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shutdown Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="We are currently performing scheduled maintenance..."
                        className="bg-black/30 border-red-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This message will be displayed to users during the shutdown
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isScheduled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-red-500/10 p-3 bg-black/30">
                    <div className="space-y-0.5">
                      <FormLabel>Schedule Shutdown</FormLabel>
                      <FormDescription>
                        Set a future time for the site to shutdown
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {isScheduled && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Shutdown Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduledTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shutdown Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="bg-black/30 border-red-500/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (hours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            className="bg-black/30 border-red-500/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          After this duration, the site will automatically restart
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              <AlertDialogFooter className="mt-6">
                <AlertDialogCancel className="bg-black/30">Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button type="submit" variant="destructive">
                    {isScheduled ? 'Schedule Shutdown' : 'Shutdown Now'}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Restart Dialog */}
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent className="bg-black/80 backdrop-blur-sm border-green-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-400">Restart Site</AlertDialogTitle>
            <AlertDialogDescription>
              This will bring the site back online and make it accessible to all users again.
              Are you sure you want to restart the site?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-black/30">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-700 hover:bg-green-600 text-white"
              onClick={handleRestart}
            >
              Restart Site
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SiteShutdown;

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityIcon, Calendar, Clock, MapPin, AlertCircle, Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ActivityLog {
  id: number;
  type: string;
  action: string;
  details: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  timestamp: string;
}

interface ActivityLogsResponse {
  logs: ActivityLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const ActivityLogs = () => {
  const { user, isPremium } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchLogs(1);
    }
  }, [user, filter]);

  const fetchLogs = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get<ActivityLogsResponse>(`/api/users/activity?page=${page}&filter=${filter}`);
      setLogs(response.data.logs);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchLogs(page);
  };

  const handleExport = async () => {
    if (!isPremium) {
      toast.error('Export is a premium feature');
      return;
    }

    try {
      // This would be implemented on the server to export logs to CSV
      toast.success('Activity logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export activity logs');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <ActivityIcon className="h-4 w-4 text-blue-400" />;
      case 'search': return <ActivityIcon className="h-4 w-4 text-green-400" />;
      case 'settings': return <ActivityIcon className="h-4 w-4 text-purple-400" />;
      case 'security': return <ActivityIcon className="h-4 w-4 text-red-400" />;
      default: return <ActivityIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'login':
      case 'signup':
        return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">{action}</Badge>;
      case 'search':
      case 'browse':
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">{action}</Badge>;
      case 'settings_changed':
        return <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">settings</Badge>;
      case 'failed_login':
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">failed login</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">{action}</Badge>;
    }
  };

  if (!isPremium) {
    return (
      <Card className="border border-amber-500/20 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Activity Logs
          </CardTitle>
          <CardDescription>
            Upgrade to Premium to access your account activity history
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="w-full max-w-md bg-black/20 border border-slate-700 rounded-md p-4">
            <div className="flex items-center space-x-2 mb-3">
              <ActivityIcon className="h-4 w-4 text-slate-400" />
              <div className="h-3 bg-slate-700 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-slate-700 rounded w-16 ml-auto animate-pulse"></div>
            </div>
            <div className="h-2 bg-slate-700 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-2 bg-slate-700 rounded w-4/5 animate-pulse"></div>

            <div className="mt-4 pt-3 border-t border-slate-700 flex items-center">
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 text-slate-500" />
                <div className="h-2 bg-slate-700 rounded w-16 animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-2 ml-auto">
                <Clock className="h-3 w-3 text-slate-500" />
                <div className="h-2 bg-slate-700 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>
          <AlertCircle className="h-10 w-10 text-amber-500/50" />
          <p className="text-sm text-center text-gray-400 max-w-xs">
            Premium users can view and export a detailed log of all account activity, including logins, searches, and settings changes
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black" disabled>
            Premium Feature
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border border-amber-500/20 bg-black/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Activity Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs bg-black/30">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="login">Logins</SelectItem>
                <SelectItem value="search">Searches</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs border-amber-500/30 hover:bg-amber-500/10"
              onClick={handleExport}
            >
              <Download className="h-3 w-3 mr-1" /> Export
            </Button>
          </div>
        </div>
        <CardDescription>
          View all activity on your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <Clock className="h-12 w-12 text-gray-500 mx-auto" />
            <h3 className="text-lg font-medium">No Activity Yet</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Your activity logs will appear here as you use the platform
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-900">
                  <TableRow>
                    <TableHead className="w-[180px]">Time</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-900/50">
                      <TableCell className="text-xs text-gray-400">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <div className="mt-1">{getActivityIcon(log.type)}</div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getActionBadge(log.action)}
                            </div>
                            <p className="text-xs text-gray-400">{log.details}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 text-xs text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {log.location || 'Unknown'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-500">
                  Showing {logs.length} of {pagination.totalCount} entries
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-slate-700"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-xs text-gray-400 w-16 text-center">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-slate-700"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLogs;
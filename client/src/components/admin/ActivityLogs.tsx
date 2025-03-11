
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface LogEntry {
  id: number;
  type: string;
  action: string;
  userId: number;
  username: string;
  ipAddress: string;
  details: string;
  timestamp: string;
}

const ActivityLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 15;
  
  // Fetch logs data
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/logs?page=${currentPage}&limit=${logsPerPage}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setLogs(data.logs);
          setFilteredLogs(data.logs);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
  }, [currentPage]);
  
  // Filter logs based on search term and type filter
  useEffect(() => {
    let filtered = [...logs];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (logTypeFilter !== 'all') {
      filtered = filtered.filter((log) => log.type === logTypeFilter);
    }
    
    setFilteredLogs(filtered);
  }, [searchTerm, logTypeFilter, logs]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Render log type badge
  const renderLogTypeBadge = (type: string) => {
    switch (type) {
      case 'auth':
        return <Badge className="bg-blue-900/30 text-blue-400 border-blue-400/30">Auth</Badge>;
      case 'admin':
        return <Badge className="bg-purple-900/30 text-purple-400 border-purple-400/30">Admin</Badge>;
      case 'code':
        return <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-400/30">Premium</Badge>;
      case 'ticket':
        return <Badge className="bg-green-900/30 text-green-400 border-green-400/30">Support</Badge>;
      case 'system':
        return <Badge className="bg-red-900/30 text-red-400 border-red-400/30">System</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            Activity Logs
          </CardTitle>
          <CardDescription>
            Track user and admin activities on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by username, action, or details..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="admin">Admin Actions</SelectItem>
                <SelectItem value="code">Premium Codes</SelectItem>
                <SelectItem value="ticket">Support Tickets</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Logs table */}
          <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-black/60">
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Loading logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-slate-400">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        {renderLogTypeBadge(log.type)}
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.username}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;

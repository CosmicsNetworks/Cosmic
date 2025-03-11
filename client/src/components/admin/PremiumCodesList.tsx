
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PremiumCode {
  id: number;
  code: string;
  duration: string;
  durationHours: number;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  usedBy: number | null;
  usedAt: string | null;
  notes: string | null;
  isActive: boolean;
  username?: string;
}

const PremiumCodesList = () => {
  const [codes, setCodes] = useState<PremiumCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/premium/codes');
      setCodes(response.data.codes);
    } catch (error) {
      console.error('Error fetching premium codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load premium codes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: 'Copied!',
      description: 'Premium code copied to clipboard',
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (duration: string) => {
    switch (duration) {
      case '1hour':
        return '1 Hour';
      case '1day':
        return '1 Day';
      case '1week':
        return '1 Week';
      case '1month':
        return '1 Month';
      case '3months':
        return '3 Months';
      case '6months':
        return '6 Months';
      case '1year':
        return '1 Year';
      default:
        return duration;
    }
  };

  const deactivateCode = async (id: number) => {
    try {
      await axios.put(`/api/admin/premium/codes/${id}/deactivate`);
      toast({
        title: 'Success',
        description: 'Code deactivated successfully',
      });
      fetchCodes();
    } catch (error) {
      console.error('Error deactivating code:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate code',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Premium Codes</CardTitle>
        <CardDescription>
          Manage all premium codes and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading codes...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No premium codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          {code.code}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(code.code, code.id)}
                          >
                            {copiedCode === code.id ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{formatDuration(code.duration)}</TableCell>
                      <TableCell>{formatDate(code.createdAt)}</TableCell>
                      <TableCell>{formatDate(code.expiresAt)}</TableCell>
                      <TableCell>
                        {code.isUsed ? (
                          <Badge variant="secondary">Used</Badge>
                        ) : code.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Deactivated</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {code.username || (code.usedBy ? `User #${code.usedBy}` : 'Not Used')}
                      </TableCell>
                      <TableCell>
                        <span className="truncate block max-w-[150px]" title={code.notes || ''}>
                          {code.notes || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {!code.isUsed && code.isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deactivateCode(code.id)}
                            title="Deactivate Code"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <Button className="mt-4" onClick={fetchCodes}>
          Refresh Codes
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumCodesList;

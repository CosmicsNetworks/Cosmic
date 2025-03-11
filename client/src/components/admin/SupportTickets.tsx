
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/lib/auth';
import { 
  MessageSquare, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { Ticket, TicketReply } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const SupportTickets = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchAllTickets();
    }
  }, [isAuthenticated, user]);
  
  const fetchAllTickets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/support/tickets', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTicketDetails = async (ticketId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentTicket(data.ticket);
        setTicketReplies(data.replies);
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      
      if (response.ok) {
        // Update local state
        setTickets(tickets.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status } : ticket
        ));
        
        if (currentTicket && currentTicket.id === ticketId) {
          setCurrentTicket({ ...currentTicket, status });
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Open</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Closed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-red-500 text-red-500">High</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Filter tickets based on selected filter
  const filteredTickets = tickets.filter(ticket => {
    if (selectedFilter === 'all') return true;
    return ticket.status === selectedFilter;
  });
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <Card className="w-full bg-black/40 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            Admin access required
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <p className="text-slate-400">You don't have permission to access this section.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full bg-black/40 backdrop-blur-sm border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Support Tickets
        </CardTitle>
        <CardDescription>
          Manage and respond to user support requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setSelectedFilter('all')}>All</TabsTrigger>
              <TabsTrigger value="open" onClick={() => setSelectedFilter('open')}>Open</TabsTrigger>
              <TabsTrigger value="pending" onClick={() => setSelectedFilter('pending')}>Pending</TabsTrigger>
              <TabsTrigger value="resolved" onClick={() => setSelectedFilter('resolved')}>Resolved</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {isLoading ? (
              <div className="text-center py-8">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-slate-500 opacity-50" />
                <p>No support tickets found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="p-3 border border-slate-800 rounded-md bg-black/20 hover:bg-black/30 cursor-pointer transition-colors"
                    onClick={() => fetchTicketDetails(ticket.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{ticket.title}</h3>
                        <div className="flex gap-2 items-center mt-1">
                          <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                            {ticket.category}
                          </Badge>
                          {getPriorityBadge(ticket.priority)}
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs text-slate-500">
                        User ID: {ticket.userId}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTicketStatus(ticket.id, 'resolved');
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                        {ticket.status !== 'closed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTicketStatus(ticket.id, 'closed');
                            }}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SupportTickets;

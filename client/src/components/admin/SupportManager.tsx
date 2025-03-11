
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  TicketIcon, 
  Search, 
  Loader2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  User,
  Calendar,
  Tag
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

interface Ticket {
  id: number;
  userId: number;
  username: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  isPremiumUser: boolean;
}

interface TicketReply {
  id: number;
  ticketId: number;
  userId: number;
  username: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  isPremium: boolean;
  ticketCount: number;
}

const SupportManager = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  
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
  
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTicket || !replyMessage.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/support/tickets/${currentTicket.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: replyMessage }),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTicketReplies([...ticketReplies, data.reply]);
        setReplyMessage('');
        
        // Refresh the current ticket
        fetchTicketDetails(currentTicket.id);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTicketStatus = async (ticketId: number, status: string) => {
    setIsLoading(true);
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
        const data = await response.json();
        
        // Update ticket in the tickets array
        setTickets(tickets.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status: data.ticket.status } : ticket
        ));
        
        // Update current ticket if it's the one being updated
        if (currentTicket && currentTicket.id === ticketId) {
          setCurrentTicket({ ...currentTicket, status: data.ticket.status });
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    } finally {
      setIsLoading(false);
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
  
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'general':
        return <Badge variant="outline" className="border-gray-500 text-gray-300">General</Badge>;
      case 'payment':
        return <Badge variant="outline" className="border-green-500 text-green-400">Payment</Badge>;
      case 'account':
        return <Badge variant="outline" className="border-blue-500 text-blue-400">Account</Badge>;
      case 'technical':
        return <Badge variant="outline" className="border-orange-500 text-orange-400">Technical</Badge>;
      case 'premium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-400">Premium</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Filter tickets based on search, status, and category
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      searchQuery === '' || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  // Sort tickets by priority and creation date
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    // First sort by priority (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <Card className="w-full bg-black/40 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle>Support Management</CardTitle>
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
          <TicketIcon className="h-5 w-5" />
          Support Ticket Management
        </CardTitle>
        <CardDescription>
          View and manage all support tickets from users
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {currentTicket ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <Button 
                variant="outline" 
                className="border-slate-700"
                onClick={() => setCurrentTicket(null)}
              >
                Back to Tickets
              </Button>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(currentTicket.status)}
                {getPriorityBadge(currentTicket.priority)}
                {currentTicket.isPremiumUser && (
                  <Badge className="bg-amber-500">Premium User</Badge>
                )}
              </div>
            </div>
            
            <div className="bg-black/30 p-4 rounded-md border border-slate-800">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">{currentTicket.title}</h3>
                <span className="text-xs text-slate-400">
                  {format(new Date(currentTicket.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              
              <div className="flex gap-2 items-center mt-1 mb-2">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-500" />
                  <span className="text-sm text-slate-300">{currentTicket.username}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-slate-500" />
                  <span className="text-sm text-slate-300">{currentTicket.category}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                <span className="text-xs text-slate-500">Ticket #{currentTicket.id}</span>
              </div>
              
              <p className="mt-3 text-slate-300 border-t border-slate-800 pt-3">{currentTicket.description}</p>
            </div>
            
            <div className="bg-black/20 p-3 rounded-md border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Update Ticket Status</h4>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-blue-500 text-blue-400 hover:bg-blue-950"
                    onClick={() => updateTicketStatus(currentTicket.id, 'open')}
                    disabled={currentTicket.status === 'open'}
                  >
                    Open
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-yellow-500 text-yellow-400 hover:bg-yellow-950"
                    onClick={() => updateTicketStatus(currentTicket.id, 'pending')}
                    disabled={currentTicket.status === 'pending'}
                  >
                    Pending
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-green-500 text-green-400 hover:bg-green-950"
                    onClick={() => updateTicketStatus(currentTicket.id, 'resolved')}
                    disabled={currentTicket.status === 'resolved'}
                  >
                    Resolved
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-500 text-gray-400 hover:bg-gray-800"
                    onClick={() => updateTicketStatus(currentTicket.id, 'closed')}
                    disabled={currentTicket.status === 'closed'}
                  >
                    Closed
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2 text-slate-300">
                <MessageSquare className="h-4 w-4 text-slate-500" /> 
                Conversation History
              </h4>
              
              {ticketReplies.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  No replies yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {ticketReplies.map((reply) => (
                    <div 
                      key={reply.id} 
                      className={`flex gap-3 ${reply.isAdmin ? 'bg-indigo-950/20' : 'bg-black/30'} p-3 rounded-md border ${reply.isAdmin ? 'border-indigo-500/20' : 'border-slate-800'}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={reply.isAdmin ? 'bg-indigo-800' : 'bg-slate-700'}>
                          {reply.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {reply.username}
                            </span>
                            {reply.isAdmin && (
                              <Badge className="bg-indigo-500 text-xs">Staff</Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {format(new Date(reply.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{reply.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {currentTicket.status !== 'closed' && (
                <form onSubmit={handleReplySubmit} className="mt-4">
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="bg-black/30 border-slate-700 min-h-[100px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading || !replyMessage.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search tickets by title, user, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-black/30 border-slate-700"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="w-40">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="bg-black/30 border-slate-700">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-40">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="bg-black/30 border-slate-700">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <h3 className="text-sm font-medium mb-2 text-slate-400">
                {filteredTickets.length} Ticket{filteredTickets.length !== 1 ? 's' : ''}
              </h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className="text-slate-400">Loading tickets...</p>
                </div>
              ) : sortedTickets.length === 0 ? (
                <div className="text-center py-8 bg-black/20 rounded-md border border-slate-800">
                  <TicketIcon className="h-12 w-12 mx-auto mb-2 text-slate-500 opacity-50" />
                  <p className="text-slate-400">No tickets found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-slate-800 rounded-md bg-black/20">
                      <div 
                        className="p-3 cursor-pointer"
                        onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            <div 
                              className={`h-2 w-2 rounded-full flex-shrink-0 mt-2 ${
                                ticket.status === 'open' ? 'bg-blue-500' :
                                ticket.status === 'pending' ? 'bg-yellow-500' :
                                ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
                              }`}
                            ></div>
                            <div>
                              <h3 className="font-medium">{ticket.title}</h3>
                              <div className="flex flex-wrap gap-2 items-center mt-1">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-slate-500" />
                                  <span className="text-xs text-slate-300">{ticket.username}</span>
                                </div>
                                <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-slate-500" />
                                  <span className="text-xs text-slate-400">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                                {ticket.isPremiumUser && (
                                  <Badge className="bg-amber-500/80 text-xs px-1.5 py-0">Premium</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            {getCategoryBadge(ticket.category)}
                            {getPriorityBadge(ticket.priority)}
                            {expandedTicket === ticket.id ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {expandedTicket === ticket.id && (
                        <div className="p-3 border-t border-slate-800 bg-black/20">
                          <p className="text-sm text-slate-300 mb-3">{ticket.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs border-slate-600 bg-black/30">
                                {ticket.replyCount} {ticket.replyCount === 1 ? 'reply' : 'replies'}
                              </Badge>
                              <span className="text-xs text-slate-500">Ticket #{ticket.id}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-7 border-slate-700 bg-black/30"
                                onClick={() => fetchTicketDetails(ticket.id)}
                              >
                                View Details
                              </Button>
                              <Button 
                                size="sm" 
                                className="text-xs h-7 bg-blue-600 hover:bg-blue-700"
                                onClick={() => fetchTicketDetails(ticket.id)}
                              >
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupportManager;

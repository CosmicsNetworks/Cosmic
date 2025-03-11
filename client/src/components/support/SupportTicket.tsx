
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TicketPlus, MessageSquare, PaperclipIcon, SendHorizontal, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Ticket {
  id: number;
  userId: number;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
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

const SupportTicket = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  
  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    category: 'general',
    title: '',
    description: '',
    priority: 'medium',
  });
  
  // File attachment
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);
  
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/support/tickets', {
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
  
  const handleNewTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('category', newTicket.category);
      formData.append('title', newTicket.title);
      formData.append('description', newTicket.description);
      formData.append('priority', newTicket.priority);
      
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }
      
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets([...tickets, data.ticket]);
        setShowNewTicketForm(false);
        setNewTicket({
          category: 'general',
          title: '',
          description: '',
          priority: 'medium',
        });
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
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
        
        // Refresh the current ticket to get updated status
        fetchTicketDetails(currentTicket.id);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
  
  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            Please sign in to create or view your support tickets.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Button>Sign In</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/40 backdrop-blur-sm border-slate-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Support Center
            </CardTitle>
            <CardDescription>
              Create tickets or chat with our support team
            </CardDescription>
          </div>
          {!showNewTicketForm && (
            <Button 
              onClick={() => setShowNewTicketForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <TicketPlus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {showNewTicketForm ? (
          <form onSubmit={handleNewTicketSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-title">Title</Label>
              <Input
                id="ticket-title"
                placeholder="Brief summary of your issue"
                value={newTicket.title}
                onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                required
                className="bg-black/30 border-slate-700"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-category">Category</Label>
                <Select 
                  value={newTicket.category}
                  onValueChange={(value) => setNewTicket({...newTicket, category: value})}
                >
                  <SelectTrigger className="bg-black/30 border-slate-700">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Support</SelectItem>
                    <SelectItem value="payment">Payment Issues</SelectItem>
                    <SelectItem value="account">Account Issues</SelectItem>
                    <SelectItem value="technical">Technical Issues</SelectItem>
                    <SelectItem value="premium">Premium Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ticket-priority">Priority</Label>
                <Select 
                  value={newTicket.priority}
                  onValueChange={(value) => setNewTicket({...newTicket, priority: value as 'low' | 'medium' | 'high'})}
                >
                  <SelectTrigger className="bg-black/30 border-slate-700">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ticket-description">Description</Label>
              <Textarea
                id="ticket-description"
                placeholder="Please describe your issue in detail"
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                required
                className="bg-black/30 border-slate-700 min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ticket-attachment">Attachment (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="ticket-attachment"
                  type="file"
                  onChange={handleFileChange}
                  className="bg-black/30 border-slate-700"
                />
                {selectedFile && (
                  <span className="text-sm text-slate-300">
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Allowed file types: .jpg, .png, .pdf (max 5MB)
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewTicketForm(false)}
                className="border-slate-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </form>
        ) : currentTicket ? (
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
              </div>
            </div>
            
            <div className="bg-black/30 p-4 rounded-md border border-slate-800">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">{currentTicket.title}</h3>
                <span className="text-xs text-slate-400">
                  {format(new Date(currentTicket.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <p className="mt-2 text-slate-300">{currentTicket.description}</p>
              <div className="mt-2 flex gap-2 items-center">
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  {currentTicket.category}
                </Badge>
                <span className="text-xs text-slate-500">Ticket #{currentTicket.id}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-slate-400">Conversation</h4>
              
              {ticketReplies.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  No replies yet. Add a response below.
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
                      <SendHorizontal className="h-4 w-4 mr-2" />
                      {isLoading ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-black/40 border-b border-slate-800 rounded-none w-full justify-start mb-4">
              <TabsTrigger value="active">Active Tickets</TabsTrigger>
              <TabsTrigger value="resolved">Resolved Tickets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {isLoading ? (
                <div className="text-center py-8">Loading tickets...</div>
              ) : tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-slate-500 opacity-50" />
                  <p>You don't have any active support tickets.</p>
                  <Button 
                    onClick={() => setShowNewTicketForm(true)}
                    variant="outline"
                    className="mt-4 border-slate-700"
                  >
                    Create Your First Ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets
                    .filter(t => t.status !== 'resolved' && t.status !== 'closed')
                    .map((ticket) => (
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
                              <span className="text-xs text-slate-500">
                                #{ticket.id} · {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="resolved">
              {isLoading ? (
                <div className="text-center py-8">Loading tickets...</div>
              ) : tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-slate-500 opacity-50" />
                  <p>You don't have any resolved support tickets.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets
                    .filter(t => t.status === 'resolved' || t.status === 'closed')
                    .map((ticket) => (
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
                              <span className="text-xs text-slate-500">
                                #{ticket.id} · {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(ticket.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default SupportTicket;

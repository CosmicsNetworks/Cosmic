import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, UserCircle, PlusCircle } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/hooks/use-toast';

const LiveChatSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsConnecting(true);

    // Simulate connecting to an agent
    setTimeout(() => {
      setIsConnecting(false);
      setAgentName('Support Agent');
      addMessage({
        sender: 'agent',
        message: 'Hello! How can I assist you today?',
        timestamp: new Date(),
      });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    addMessage({
      sender: 'user',
      message: message.trim(),
      timestamp: new Date(),
    });

    // Clear input and simulate agent typing
    setMessage('');
    setIsTyping(true);

    // Simulate agent response after typing delay
    setTimeout(() => {
      setIsTyping(false);
      addMessage({
        sender: 'agent',
        message: 'Thank you for your message. Our team will look into this and get back to you shortly.',
        timestamp: new Date(),
      });
    }, 3000);
  };

  const addMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpenChat}
        className="fixed bottom-5 right-5 rounded-full w-12 h-12 flex items-center justify-center shadow-lg bg-blue-600 hover:bg-blue-700"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 w-96 shadow-xl">
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg py-3 flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Live Support
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0 text-white">
              ✕
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {isConnecting ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center space-y-2">
                    <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-blue-200 rounded-full mx-auto"></div>
                    <p className="text-sm text-slate-400">Connecting to support...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                      <MessageSquare className="h-12 w-12 text-slate-500" />
                      <p className="text-slate-400">Start a conversation with our support team</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'} rounded-lg px-3 py-2`}>
                          {msg.sender === 'agent' && (
                            <div className="flex items-center gap-1 mb-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="bg-green-600 text-[10px]">SA</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{agentName}</span>
                            </div>
                          )}
                          <p>{msg.message}</p>
                          <p className="text-right text-xs mt-1 opacity-70">{formatTime(msg.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 text-slate-200 rounded-lg px-4 py-2">
                        <div className="flex gap-1">
                          <div className="animate-bounce h-1.5 w-1.5 bg-slate-400 rounded-full delay-0"></div>
                          <div className="animate-bounce h-1.5 w-1.5 bg-slate-400 rounded-full delay-150"></div>
                          <div className="animate-bounce h-1.5 w-1.5 bg-slate-400 rounded-full delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t border-slate-800 p-3">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isConnecting}
                className="bg-slate-800 border-slate-700"
              />
              <Button type="submit" 
                className="bg-blue-600 hover:bg-blue-700 px-3"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default LiveChatSupport;
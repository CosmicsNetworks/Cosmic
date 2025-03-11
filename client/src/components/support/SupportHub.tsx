
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, TicketIcon, HelpCircle } from 'lucide-react';
import SupportTicket from './SupportTicket';
import FAQSection from '../faq/FAQSection';
import LiveChatSupport from './LiveChatSupport';

const SupportHub = () => {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Get help with your account, troubleshoot issues, or learn more about our services through our comprehensive support system.
        </p>
      </div>
      
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="faq" className="data-[state=active]:bg-slate-800">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ & Help
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-slate-800">
            <TicketIcon className="h-4 w-4 mr-2" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-slate-800">
            <MessageSquare className="h-4 w-4 mr-2" />
            Live Chat
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="faq">
          <FAQSection />
        </TabsContent>
        
        <TabsContent value="tickets">
          <SupportTicket />
        </TabsContent>
        
        <TabsContent value="chat">
          <Card className="bg-black/40 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Live Chat Support
              </CardTitle>
              <CardDescription>
                Chat with our support team in real-time for immediate assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-6">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-blue-500 opacity-70" />
                <h3 className="text-xl font-medium mb-2">Start a Live Chat</h3>
                <p className="text-slate-400 max-w-md">
                  Our support team is ready to help you with any questions or issues you might have.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 items-center">
                <p className="text-sm text-slate-500">
                  Click the chat icon in the bottom right corner to start a conversation.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* The actual chat widget is rendered by LiveChatSupport component */}
          <LiveChatSupport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportHub;

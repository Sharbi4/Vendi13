import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MessageSquare, Filter } from 'lucide-react';
import Header from '../components/layout/Header';
import ConversationsList from '../components/messaging/ConversationsList';
import ChatInterface from '../components/messaging/ChatInterface';
import { createPageUrl } from '@/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    checkAuth();
    
    // Check for conversation ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('Messages'));
      return;
    }
    setIsAuthenticated(authenticated);
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const loadConversation = async (conversationId) => {
    try {
      const conversations = await base44.entities.Conversation.filter({ id: conversationId });
      if (conversations.length > 0) {
        setSelectedConversation(conversations[0]);
        setShowChat(true);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      const asHost = await base44.entities.Conversation.filter(
        { host_email: user.email, status: 'active' }
      );
      
      const asGuest = await base44.entities.Conversation.filter(
        { guest_email: user.email, status: 'active' }
      );
      
      const allConvs = [...asHost, ...asGuest];
      return allConvs.sort((a, b) => {
        const dateA = new Date(a.last_message_date || 0);
        const dateB = new Date(b.last_message_date || 0);
        return dateB - dateA;
      });
    },
    enabled: !!user?.email,
    refetchInterval: 3000,
  });

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedConversation(null);
    // Clear conversation ID from URL
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const isHost = user?.email === conv.host_email;
    const unreadCount = isHost ? conv.unread_count_host : conv.unread_count_guest;
    
    // Search filter
    const matchesSearch = !searchQuery || 
      conv.listing_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.host_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.guest_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = filterType === 'all' ||
      (filterType === 'unread' && unreadCount > 0) ||
      (filterType === 'host' && isHost) ||
      (filterType === 'guest' && !isHost);
    
    return matchesSearch && matchesType;
  });

  const unreadCount = conversations.reduce((sum, conv) => {
    const isHost = user?.email === conv.host_email;
    return sum + (isHost ? conv.unread_count_host : conv.unread_count_guest);
  }, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 md:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <MessageSquare className="w-8 h-8" />
                  Messages
                  {unreadCount > 0 && (
                    <Badge className="bg-[#FF5124] text-white text-lg px-3 py-1">
                      {unreadCount}
                    </Badge>
                  )}
                </h1>
                <p className="text-slate-500 mt-1">
                  Communicate with hosts and guests
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Tabs value={filterType} onValueChange={setFilterType} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread
                    {unreadCount > 0 && (
                      <Badge className="ml-2 bg-[#FF5124] text-white text-xs px-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="host">As Host</TabsTrigger>
                  <TabsTrigger value="guest">As Guest</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversations ({filteredConversations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {searchQuery ? 'No matching conversations' : 'No messages yet'}
                  </h3>
                  <p className="text-slate-500">
                    {searchQuery 
                      ? 'Try a different search term' 
                      : 'Start browsing listings to connect with hosts'}
                  </p>
                </div>
              ) : (
                <ConversationsList 
                  user={user} 
                  onSelectConversation={handleSelectConversation}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Chat Interface */}
      {selectedConversation && (
        <ChatInterface
          open={showChat}
          onClose={handleCloseChat}
          conversationId={selectedConversation.id}
          listing={{ 
            id: selectedConversation.listing_id,
            title: selectedConversation.listing_title,
            listing_mode: 'rent'
          }}
          hostEmail={selectedConversation.host_email}
          user={user}
        />
      )}
    </div>
  );
}
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, Loader2, MapPin, Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationsList({ user, onSelectConversation }) {
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
      
      // Combine and sort by last message date
      const allConvs = [...asHost, ...asGuest];
      return allConvs.sort((a, b) => {
        const dateA = new Date(a.last_message_date || 0);
        const dateB = new Date(b.last_message_date || 0);
        return dateB - dateA; // Most recent first
      });
    },
    enabled: !!user?.email,
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages yet</h3>
        <p className="text-slate-500">
          Your conversations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => {
        const isHost = user.email === conversation.host_email;
        const otherPartyEmail = isHost ? conversation.guest_email : conversation.host_email;
        const unreadCount = isHost ? conversation.unread_count_host : conversation.unread_count_guest;
        
        return (
          <Card
            key={conversation.id}
            className={`p-4 cursor-pointer hover:shadow-md transition-all ${
              unreadCount > 0 ? 'bg-orange-50 border-[#FF5124] border-2' : ''
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarFallback className="bg-slate-200 text-slate-700">
                  {otherPartyEmail.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate">
                      {conversation.listing_title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {isHost ? 'Guest' : 'Host'}: {otherPartyEmail}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <Badge className="bg-[#FF5124] text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </div>

                {conversation.last_message && (
                  <p className="text-sm text-slate-600 truncate mb-2">
                    {conversation.last_message}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {conversation.last_message_date && (
                    <span>
                      {formatDistanceToNow(new Date(conversation.last_message_date), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
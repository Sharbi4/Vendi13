import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, Loader2, AlertCircle, MapPin, Calendar,
  ExternalLink, FileText, Clock, Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';
import TemplatesManager from './TemplatesManager';
import ScheduleMessageModal from './ScheduleMessageModal';
import ReportMessageModal from './ReportMessageModal';

export default function ChatInterface({ 
  open, 
  onClose, 
  conversationId,
  listing,
  hostEmail,
  user 
}) {
  const queryClient = useQueryClient();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  // Fetch or create conversation
  const { data: conversationData, isLoading: loadingConversation } = useQuery({
    queryKey: ['conversation', conversationId, listing?.id],
    queryFn: async () => {
      if (conversationId) {
        const convs = await base44.entities.Conversation.filter({ id: conversationId });
        return convs[0];
      } else if (listing && hostEmail && user) {
        // Check if conversation exists
        const existing = await base44.entities.Conversation.filter({
          listing_id: listing.id,
          host_email: hostEmail,
          guest_email: user.email
        });
        
        if (existing.length > 0) {
          return existing[0];
        }
        
        // Create new conversation
        return await base44.entities.Conversation.create({
          listing_id: listing.id,
          host_email: hostEmail,
          guest_email: user.email,
          listing_title: listing.title,
          last_message: '',
          last_message_date: new Date().toISOString(),
          status: 'active'
        });
      }
      return null;
    },
    enabled: open && (!!conversationId || (!!listing && !!hostEmail && !!user)),
  });

  // Real-time message subscription
  useEffect(() => {
    if (!conversationData?.id) return;

    const unsubscribe = base44.entities.Message.subscribe(
      { conversation_id: conversationData.id },
      (updatedMessages) => {
        setMessages(updatedMessages.sort((a, b) => 
          new Date(a.created_date) - new Date(b.created_date)
        ));
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationData?.id]);

  // Real-time typing indicator subscription
  useEffect(() => {
    if (!conversationData?.id || !user) return;

    const unsubscribe = base44.entities.Conversation.subscribe(
      { id: conversationData.id },
      (conversations) => {
        const conv = conversations[0];
        if (!conv) return;

        // Check if other user is typing
        if (conv.typing_user_email && conv.typing_user_email !== user.email) {
          const typingTime = new Date(conv.typing_updated_at).getTime();
          const now = Date.now();
          
          // Show typing indicator if updated within last 3 seconds
          if (now - typingTime < 3000) {
            setOtherUserTyping(true);
          } else {
            setOtherUserTyping(false);
          }
        } else {
          setOtherUserTyping(false);
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationData?.id, user]);

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0 && user && conversationData) {
      const unreadMessages = messages.filter(
        m => m.sender_email !== user.email && !m.read
      );
      
      unreadMessages.forEach(msg => {
        base44.entities.Message.update(msg.id, { 
          read: true, 
          read_at: new Date().toISOString() 
        });
      });

      // Update conversation unread count
      if (unreadMessages.length > 0) {
        const isHost = user.email === conversationData.host_email;
        base44.entities.Conversation.update(conversationData.id, {
          [isHost ? 'unread_count_host' : 'unread_count_guest']: 0
        });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    }
  }, [messages, user, conversationData]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ messageText, attachments }) => {
      const message = await base44.entities.Message.create({
        conversation_id: conversationData.id,
        sender_email: user.email,
        sender_name: user.full_name || 'User',
        message_text: messageText,
        attachments: attachments || [],
        read: false
      });

      // Update conversation
      const isHost = user.email === conversationData.host_email;
      const recipientEmail = isHost ? conversationData.guest_email : conversationData.host_email;
      
      await base44.entities.Conversation.update(conversationData.id, {
        last_message: messageText.substring(0, 100),
        last_message_date: new Date().toISOString(),
        [isHost ? 'unread_count_guest' : 'unread_count_host']: 
          (isHost ? conversationData.unread_count_guest : conversationData.unread_count_host) + 1
      });

      // Create notification for recipient
      await base44.entities.Notification.create({
        user_email: recipientEmail,
        type: 'message',
        title: 'New Message',
        message: `${user.full_name || 'Someone'} sent you a message about ${conversationData.listing_title}`,
        reference_id: conversationData.id,
        link: '/Dashboard',
      });

      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleTyping = async () => {
    if (!conversationData || !user) return;
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Update conversation with typing status
    try {
      await base44.entities.Conversation.update(conversationData.id, {
        typing_user_email: user.email,
        typing_updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating typing status:', err);
    }
    
    // Clear typing after 2 seconds of inactivity
    const timeout = setTimeout(async () => {
      try {
        await base44.entities.Conversation.update(conversationData.id, {
          typing_user_email: null,
          typing_updated_at: null
        });
      } catch (err) {
        console.error('Error clearing typing status:', err);
      }
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  const handleSendMessage = async (messageText, attachments = []) => {
    await sendMessageMutation.mutateAsync({ messageText, attachments });
  };

  const handleScheduleMessage = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ScheduledMessage.create({
        conversation_id: conversationData.id,
        sender_email: user.email,
        ...data,
        status: 'pending'
      });
    },
    onSuccess: () => {
      setShowScheduleModal(false);
    },
  });

  const handleTemplateSelect = (templateText) => {
    setCurrentMessage(templateText);
    setShowTemplates(false);
  };

  const isHost = user && conversationData && user.email === conversationData.host_email;

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please sign in to send messages</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg truncate">
                {conversationData?.listing_title || listing?.title || 'Loading...'}
              </DialogTitle>
              {listing && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {listing.listing_mode === 'rent' ? 'For Rent' : 'For Sale'}
                  </Badge>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.public_location_label}
                  </span>
                </div>
              )}
            </div>
            {listing && (
              <a
                href={`${createPageUrl('ListingDetail')}?id=${listing.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="rounded-full">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowReportModal(true)}
              className="rounded-full text-slate-500 hover:text-red-600"
              title="Report user"
            >
              <Flag className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages */}
        {loadingConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-slate-600 mb-2">No messages yet</p>
              <p className="text-sm text-slate-500">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <MessageThread messages={messages} currentUserEmail={user.email} />
        )}

        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="px-4 py-2 flex items-center gap-2 border-t bg-gray-50">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-slate-500 italic">typing...</span>
          </div>
        )}

        {/* Templates Panel (Host Only) */}
        {showTemplates && isHost && (
          <div className="border-t bg-gray-50 p-4 max-h-[40vh] overflow-y-auto">
            <TemplatesManager
              userEmail={user.email}
              onSelectTemplate={handleTemplateSelect}
            />
          </div>
        )}

        {/* Input */}
        <div className="border-t flex-shrink-0">
          {isHost && (
            <div className="px-4 pt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-2" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScheduleModal(true)}
                className="text-xs"
              >
                <Clock className="w-3 h-3 mr-2" />
                Schedule
              </Button>
            </div>
          )}
          <MessageInput
            onSend={handleSendMessage}
            onTyping={handleTyping}
            disabled={!conversationData}
            initialMessage={currentMessage}
            onMessageChange={setCurrentMessage}
          />
        </div>

        {/* Schedule Message Modal */}
        <ScheduleMessageModal
          open={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={(data) => handleScheduleMessage.mutate(data)}
          isLoading={handleScheduleMessage.isPending}
        />

        {/* Report Modal */}
        <ReportMessageModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          message={null}
          reportedUserEmail={conversationData ? 
            (isHost ? conversationData.guest_email : conversationData.host_email) : 
            null
          }
        />
      </DialogContent>
    </Dialog>
  );
}
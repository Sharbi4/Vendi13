import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format, isToday, isYesterday } from 'date-fns';
import { CheckCheck, Check, Paperclip, Download, X, Image as ImageIcon } from 'lucide-react';

export default function MessageThread({ messages, currentUserEmail }) {
  const messagesEndRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isImageUrl = (url) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.created_date);
      let key;
      if (isToday(date)) {
        key = 'Today';
      } else if (isYesterday(date)) {
        key = 'Yesterday';
      } else {
        key = format(date, 'MMMM d, yyyy');
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(msg);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
        <div key={dateLabel}>
          {/* Date Separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-gray-200" />
            <Badge variant="outline" className="bg-white text-slate-500 text-xs">
              {dateLabel}
            </Badge>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {msgs.map((message) => {
              const isCurrentUser = message.sender_email === currentUserEmail;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={isCurrentUser ? 'bg-[#FF5124] text-white' : 'bg-slate-200 text-slate-700'}>
                      {message.sender_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Bubble */}
                  <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        isCurrentUser
                          ? 'bg-[#FF5124] text-white'
                          : 'bg-white border border-gray-200 text-slate-900'
                      }`}
                    >
                      {message.message_text && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.message_text}
                        </p>
                      )}
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className={`space-y-2 ${message.message_text ? 'mt-2' : ''}`}>
                          {message.attachments.map((url, idx) => {
                            if (isImageUrl(url)) {
                              // Image preview
                              return (
                                <div
                                  key={idx}
                                  onClick={() => setImagePreview(url)}
                                  className="cursor-pointer group relative overflow-hidden rounded-lg"
                                >
                                  <img
                                    src={url}
                                    alt="Shared image"
                                    className="max-w-full max-h-64 rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              );
                            } else {
                              // File attachment
                              return (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isCurrentUser 
                                      ? 'bg-white/20 hover:bg-white/30' 
                                      : 'bg-gray-100 hover:bg-gray-200'
                                  }`}
                                >
                                  <Paperclip className="w-4 h-4" />
                                  <span className="flex-1 truncate">
                                    {url.split('/').pop()?.substring(0, 25)}...
                                  </span>
                                  <Download className="w-4 h-4" />
                                </a>
                              );
                            }
                          })}
                        </div>
                      )}
                    </div>

                    {/* Timestamp and Read Status */}
                    <div className={`flex items-center gap-1 mt-1 px-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-xs text-slate-500">
                        {formatMessageTime(message.created_date)}
                      </span>
                      {isCurrentUser && (
                        <span className="text-slate-400">
                          {message.read ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />

      {/* Image Preview Modal */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>
          {imagePreview && (
            <div className="flex items-center justify-center p-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
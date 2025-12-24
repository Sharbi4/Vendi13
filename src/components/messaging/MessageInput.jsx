import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MessageInput({ onSend, onTyping, disabled = false, initialMessage, onMessageChange }) {
  const [message, setMessage] = useState(initialMessage || '');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setAttachments(prev => [...prev, ...uploadedUrls]);
      toast.success(`${files.length} file(s) uploaded`);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && attachments.length === 0) || isSending) return;

    setIsSending(true);
    try {
      await onSend(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((url, index) => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
            return (
              <div key={index} className="relative group">
                {isImage ? (
                  <div className="relative">
                    <img
                      src={url}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                    <Paperclip className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">
                      {url.split('/').pop()?.substring(0, 20)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <Textarea
            value={message}
            onChange={(e) => {
              const newMessage = e.target.value;
              setMessage(newMessage);
              if (onMessageChange) onMessageChange(newMessage);
              if (onTyping) onTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || isSending}
            className="min-h-[44px] max-h-32 resize-none rounded-xl"
            rows={1}
          />
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={disabled || isUploading}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isUploading}
            className="rounded-xl h-11 px-4 flex-shrink-0"
            asChild
          >
            <div>
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </div>
          </Button>
        </label>

        <Button
          type="submit"
          disabled={(!message.trim() && attachments.length === 0) || disabled || isSending}
          className="bg-[#FF5124] hover:bg-[#e5481f] rounded-xl h-11 px-4 flex-shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
      <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span>•</span>
        <ImageIcon className="w-3 h-3" />
        <span>Images & files supported</span>
      </p>
    </form>
  );
}
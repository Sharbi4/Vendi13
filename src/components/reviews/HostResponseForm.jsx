import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function HostResponseForm({ review, onCancel }) {
  const [response, setResponse] = useState(review.host_response || '');
  const queryClient = useQueryClient();

  const submitResponseMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Review.update(review.id, {
        host_response: response,
        host_response_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Response posted successfully!');
      if (onCancel) onCancel();
    },
    onError: () => {
      toast.error('Failed to post response');
    },
  });

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-blue-600" />
        <span className="font-semibold text-blue-900">
          {review.host_response ? 'Edit Your Response' : 'Respond to This Review'}
        </span>
      </div>
      
      <Textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Thank the guest and address any concerns professionally..."
        className="mb-3 min-h-[100px] bg-white"
      />
      
      <Alert className="mb-3 bg-white border-blue-300">
        <AlertDescription className="text-xs text-blue-900">
          <strong>Tip:</strong> Keep responses professional, thank guests for feedback, and address any concerns constructively.
        </AlertDescription>
      </Alert>

      <div className="flex gap-2">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={submitResponseMutation.isPending}
            size="sm"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={() => submitResponseMutation.mutate()}
          disabled={!response.trim() || response.length < 20 || submitResponseMutation.isPending}
          size="sm"
          className="bg-[#FF5124] hover:bg-[#e5481f]"
        >
          {submitResponseMutation.isPending ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            'Post Response'
          )}
        </Button>
      </div>
      {response.length < 20 && response.length > 0 && (
        <p className="text-xs text-slate-500 mt-2">
          Minimum 20 characters ({response.length}/20)
        </p>
      )}
    </div>
  );
}
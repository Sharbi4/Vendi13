import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function LeaveUserReviewModal({ 
  open, 
  onClose, 
  transaction,
  reviewedUserEmail,
  reviewerRole 
}) {
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState({
    overall: 0,
    communication: 0,
    professionalism: 0,
    reliability: 0
  });
  const [reviewText, setReviewText] = useState('');
  const [wouldTransactAgain, setWouldTransactAgain] = useState(true);

  const submitMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.UserReview.create({
        transaction_id: transaction.id,
        listing_id: transaction.reference_id,
        reviewer_email: transaction.user_email,
        reviewed_user_email: reviewedUserEmail,
        reviewer_role: reviewerRole,
        rating: ratings.overall,
        communication_rating: ratings.communication,
        professionalism_rating: ratings.professionalism,
        reliability_rating: ratings.reliability,
        review_text: reviewText,
        would_transact_again: wouldTransactAgain,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-reviews']);
      toast.success('Review submitted for moderation');
      onClose();
    },
    onError: () => {
      toast.error('Failed to submit review');
    }
  });

  const RatingStars = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= value 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const canSubmit = ratings.overall > 0 && ratings.communication > 0 && 
                    ratings.professionalism > 0 && ratings.reliability > 0 && 
                    reviewText.trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Leave a Review for {reviewerRole === 'buyer' ? 'Seller' : 'Buyer'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RatingStars
            value={ratings.overall}
            onChange={(v) => setRatings(prev => ({ ...prev, overall: v }))}
            label="Overall Experience"
          />
          
          <RatingStars
            value={ratings.communication}
            onChange={(v) => setRatings(prev => ({ ...prev, communication: v }))}
            label="Communication"
          />
          
          <RatingStars
            value={ratings.professionalism}
            onChange={(v) => setRatings(prev => ({ ...prev, professionalism: v }))}
            label="Professionalism"
          />
          
          <RatingStars
            value={ratings.reliability}
            onChange={(v) => setRatings(prev => ({ ...prev, reliability: v }))}
            label="Reliability"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Share your experience
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others about your experience..."
              className="min-h-32"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="transact-again"
              checked={wouldTransactAgain}
              onChange={(e) => setWouldTransactAgain(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="transact-again" className="text-sm text-slate-600">
              I would transact with this person again
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!canSubmit || submitMutation.isPending}
              className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Reviews are moderated before publication
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
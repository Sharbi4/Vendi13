import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function LeaveReviewModal({ open, onClose, booking, listing, type = 'listing' }) {
  const [ratings, setRatings] = useState({
    overall: 0,
    cleanliness: 0,
    communication: 0,
    value: type === 'listing' ? 0 : null,
    accuracy: type === 'listing' ? 0 : null,
    respect: type === 'guest' ? 0 : null,
  });
  const [reviewText, setReviewText] = useState('');
  const [wouldRentAgain, setWouldRentAgain] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const queryClient = useQueryClient();

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      if (type === 'listing') {
        return await base44.entities.Review.create(reviewData);
      } else {
        return await base44.entities.GuestReview.create(reviewData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['listing'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    },
  });

  const resetForm = () => {
    setRatings({
      overall: 0,
      cleanliness: 0,
      communication: 0,
      value: type === 'listing' ? 0 : null,
      accuracy: type === 'listing' ? 0 : null,
      respect: type === 'guest' ? 0 : null,
    });
    setReviewText('');
    setShowSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ratings.overall === 0) {
      return;
    }

    const reviewData = type === 'listing' 
      ? {
          listing_id: listing.id,
          booking_id: booking.id,
          reviewer_email: booking.guest_email,
          reviewer_name: booking.guest_name,
          rating: ratings.overall,
          cleanliness_rating: ratings.cleanliness || ratings.overall,
          accuracy_rating: ratings.accuracy || ratings.overall,
          communication_rating: ratings.communication || ratings.overall,
          value_rating: ratings.value || ratings.overall,
          review_text: reviewText,
          status: 'published',
        }
      : {
          booking_id: booking.id,
          guest_email: booking.guest_email,
          guest_name: booking.guest_name,
          host_email: listing.created_by,
          rating: ratings.overall,
          cleanliness_rating: ratings.cleanliness || ratings.overall,
          communication_rating: ratings.communication || ratings.overall,
          respect_rating: ratings.respect || ratings.overall,
          review_text: reviewText,
          would_rent_again: wouldRentAgain,
          status: 'published',
        };

    submitReviewMutation.mutate(reviewData);
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
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

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Review Submitted!
            </h3>
            <p className="text-slate-600">
              Thank you for sharing your feedback
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === 'listing' ? 'Review Your Stay' : 'Review Guest'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Listing/Guest Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">
              {type === 'listing' ? listing.title : booking.guest_name}
            </h3>
            <p className="text-sm text-slate-600">
              {type === 'listing' 
                ? listing.public_location_label 
                : booking.guest_email}
            </p>
          </div>

          {/* Overall Rating */}
          <div>
            <StarRating
              label="Overall Rating *"
              value={ratings.overall}
              onChange={(val) => setRatings({ ...ratings, overall: val })}
            />
          </div>

          {/* Category Ratings */}
          <div className="grid sm:grid-cols-2 gap-6">
            <StarRating
              label="Cleanliness"
              value={ratings.cleanliness}
              onChange={(val) => setRatings({ ...ratings, cleanliness: val })}
            />
            <StarRating
              label="Communication"
              value={ratings.communication}
              onChange={(val) => setRatings({ ...ratings, communication: val })}
            />
            {type === 'listing' ? (
              <>
                <StarRating
                  label="Accuracy"
                  value={ratings.accuracy}
                  onChange={(val) => setRatings({ ...ratings, accuracy: val })}
                />
                <StarRating
                  label="Value"
                  value={ratings.value}
                  onChange={(val) => setRatings({ ...ratings, value: val })}
                />
              </>
            ) : (
              <StarRating
                label="Respect for Property"
                value={ratings.respect}
                onChange={(val) => setRatings({ ...ratings, respect: val })}
              />
            )}
          </div>

          {/* Would Rent Again (Guest Reviews Only) */}
          {type === 'guest' && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label>Would you rent to this guest again?</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={wouldRentAgain ? 'default' : 'outline'}
                  onClick={() => setWouldRentAgain(true)}
                  className={wouldRentAgain ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!wouldRentAgain ? 'default' : 'outline'}
                  onClick={() => setWouldRentAgain(false)}
                  className={!wouldRentAgain ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  No
                </Button>
              </div>
            </div>
          )}

          {/* Review Text */}
          <div>
            <Label htmlFor="review_text">Your Review</Label>
            <Textarea
              id="review_text"
              placeholder={
                type === 'listing'
                  ? 'Share details about your experience with this listing...'
                  : 'Share your experience with this guest...'
              }
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="mt-2 min-h-[120px]"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Minimum 50 characters ({reviewText.length}/50)
            </p>
          </div>

          {ratings.overall === 0 && (
            <Alert>
              <AlertDescription>
                Please provide an overall rating before submitting
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitReviewMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={ratings.overall === 0 || reviewText.length < 50 || submitReviewMutation.isPending}
              className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
            >
              {submitReviewMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
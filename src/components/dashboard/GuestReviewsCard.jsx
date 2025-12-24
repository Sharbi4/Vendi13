import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, ThumbsDown, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function GuestReviewsCard({ userEmail }) {
  const { data: guestReviews = [], isLoading } = useQuery({
    queryKey: ['guest-reviews', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return await base44.entities.GuestReview.filter(
        { host_email: userEmail },
        '-created_date',
        20
      );
    },
    enabled: !!userEmail,
  });

  const averageRating = guestReviews.length > 0
    ? (guestReviews.reduce((sum, r) => sum + r.rating, 0) / guestReviews.length).toFixed(1)
    : 0;

  const wouldRentAgainCount = guestReviews.filter(r => r.would_rent_again).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Guest Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (guestReviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Guest Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-slate-500">No guest reviews yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Reviews you leave for guests will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Guest Reviews</span>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-xl font-bold">{averageRating}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{guestReviews.length}</p>
            <p className="text-sm text-slate-600">Total Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{wouldRentAgainCount}</p>
            <p className="text-sm text-slate-600">Would Rent Again</p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {guestReviews.map((review) => (
            <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF5124] to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.guest_name?.charAt(0) || 'G'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{review.guest_name}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(review.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{review.rating}</span>
                </div>
              </div>

              {/* Category Ratings */}
              <div className="flex flex-wrap gap-3 mb-2 text-xs">
                {review.cleanliness_rating && (
                  <span className="text-slate-600">
                    Cleanliness: {review.cleanliness_rating}★
                  </span>
                )}
                {review.communication_rating && (
                  <span className="text-slate-600">
                    Communication: {review.communication_rating}★
                  </span>
                )}
                {review.respect_rating && (
                  <span className="text-slate-600">
                    Respect: {review.respect_rating}★
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-700 mb-2">{review.review_text}</p>

              <Badge className={review.would_rent_again ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {review.would_rent_again ? (
                  <>
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Would rent again
                  </>
                ) : (
                  <>
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Would not rent again
                  </>
                )}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
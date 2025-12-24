import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import HostResponseForm from './HostResponseForm';

export default function ReviewsList({ reviews, showListingInfo = false, canRespond = false, hostEmail = null }) {
  const [respondingToId, setRespondingToId] = useState(null);
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-slate-500">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF5124] to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {review.reviewer_name?.charAt(0) || 'U'}
                </div>
                
                {/* Info */}
                <div>
                  <p className="font-semibold text-slate-900">
                    {review.reviewer_name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {format(new Date(review.created_date), 'MMMM yyyy')}
                  </p>
                </div>
              </div>

              {/* Overall Rating */}
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-900">{review.rating}</span>
              </div>
            </div>

            {/* Category Ratings */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              {review.cleanliness_rating && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">Cleanliness:</span>
                  <span className="font-medium">{review.cleanliness_rating}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
              )}
              {review.communication_rating && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">Communication:</span>
                  <span className="font-medium">{review.communication_rating}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
              )}
              {review.accuracy_rating && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">Accuracy:</span>
                  <span className="font-medium">{review.accuracy_rating}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
              )}
              {review.value_rating && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">Value:</span>
                  <span className="font-medium">{review.value_rating}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
              )}
            </div>

            {/* Review Text */}
            <p className="text-slate-700 leading-relaxed mb-4">
              {review.review_text}
            </p>

            {/* Would Rent Again Badge (for guest reviews) */}
            {review.would_rent_again !== undefined && (
              <Badge className={review.would_rent_again ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                <ThumbsUp className="w-3 h-3 mr-1" />
                {review.would_rent_again ? 'Would rent again' : 'Would not rent again'}
              </Badge>
            )}

            {/* Host Response */}
            {review.host_response && respondingToId !== review.id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-[#FF5124]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900">
                    Response from host
                  </p>
                  {canRespond && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRespondingToId(review.id)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                  )}
                </div>
                <p className="text-sm text-slate-700">
                  {review.host_response}
                </p>
                {review.host_response_date && (
                  <p className="text-xs text-slate-500 mt-2">
                    {format(new Date(review.host_response_date), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            )}

            {/* Response Form */}
            {canRespond && !review.host_response && respondingToId !== review.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRespondingToId(review.id)}
                className="mt-4 gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Respond to Review
              </Button>
            )}

            {respondingToId === review.id && (
              <HostResponseForm
                review={review}
                onCancel={() => setRespondingToId(null)}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
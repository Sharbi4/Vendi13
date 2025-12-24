import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';

export default function UserReviewsList({ reviews, showResponses = true }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12 bg-slate-200">
                <span className="text-lg font-medium">
                  {review.reviewer_email?.charAt(0).toUpperCase()}
                </span>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">
                        {review.reviewer_email?.split('@')[0]}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {review.reviewer_role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-500">
                        {format(new Date(review.created_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  {review.would_transact_again ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <ThumbsUp className="w-4 h-4" />
                      <span>Would work with again</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <ThumbsDown className="w-4 h-4" />
                      <span>Would not work with again</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Communication:</span>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.communication_rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Professionalism:</span>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.professionalism_rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Reliability:</span>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.reliability_rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  {review.review_text}
                </p>

                {showResponses && review.response_text && (
                  <div className="mt-4 pl-4 border-l-2 border-slate-200">
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      Response from seller:
                    </p>
                    <p className="text-sm text-slate-600">
                      {review.response_text}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(review.response_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
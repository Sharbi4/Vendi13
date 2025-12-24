import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewsManagement({ userEmail, listings }) {
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState('');
  const queryClient = useQueryClient();

  const listingIds = listings.map(l => l.id);

  const { data: reviews = [] } = useQuery({
    queryKey: ['host-reviews', userEmail],
    queryFn: async () => {
      if (listingIds.length === 0) return [];
      const allReviews = await base44.entities.Review.list('-created_date', 100);
      return allReviews.filter(r => listingIds.includes(r.listing_id));
    },
    enabled: listingIds.length > 0,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ reviewId, responseText }) => {
      return await base44.entities.Review.update(reviewId, {
        host_response: responseText,
        host_response_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-reviews'] });
      setRespondingTo(null);
      setResponse('');
    },
  });

  const handleRespond = (reviewId) => {
    respondMutation.mutate({ reviewId, responseText: response });
  };

  const getListingTitle = (listingId) => {
    const listing = listings.find(l => l.id === listingId);
    return listing?.title || 'Unknown Listing';
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const needsResponse = reviews.filter(r => !r.host_response).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            Reviews & Ratings
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{avgRating}</p>
              <p className="text-xs text-slate-500">{reviews.length} reviews</p>
            </div>
            {needsResponse > 0 && (
              <Badge className="bg-amber-100 text-amber-800">
                {needsResponse} need response
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No reviews yet
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-4 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-slate-200 text-slate-700">
                      {review.reviewer_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{review.reviewer_name}</p>
                        <p className="text-xs text-slate-500">{getListingTitle(review.listing_id)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-slate-900">{review.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-2 text-xs">
                      {review.cleanliness_rating && (
                        <Badge variant="outline">Cleanliness: {review.cleanliness_rating}</Badge>
                      )}
                      {review.communication_rating && (
                        <Badge variant="outline">Communication: {review.communication_rating}</Badge>
                      )}
                      {review.value_rating && (
                        <Badge variant="outline">Value: {review.value_rating}</Badge>
                      )}
                    </div>

                    <p className="text-sm text-slate-700 mb-2">{review.review_text}</p>
                    <p className="text-xs text-slate-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {format(new Date(review.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {review.host_response ? (
                  <div className="ml-14 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-[#FF5124]" />
                      <p className="text-sm font-medium text-slate-900">Your Response</p>
                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                    </div>
                    <p className="text-sm text-slate-700">{review.host_response}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(review.host_response_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                ) : (
                  <div className="ml-14">
                    {respondingTo === review.id ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Write your response..."
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRespond(review.id)}
                            className="bg-[#FF5124] hover:bg-[#e5481f]"
                            size="sm"
                          >
                            Submit Response
                          </Button>
                          <Button
                            onClick={() => {
                              setRespondingTo(null);
                              setResponse('');
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setRespondingTo(review.id)}
                        variant="outline"
                        size="sm"
                        className="text-[#FF5124] border-[#FF5124]"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Respond
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
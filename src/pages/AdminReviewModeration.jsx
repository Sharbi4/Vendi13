import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle, XCircle, Flag, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminReviewModeration() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin();
      return;
    }
    const userData = await base44.auth.me();
    if (userData.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    setUser(userData);
  };

  const { data: userReviews = [] } = useQuery({
    queryKey: ['admin-user-reviews'],
    queryFn: () => base44.entities.UserReview.list('-created_date', 100),
    enabled: !!user
  });

  const { data: listingReviews = [] } = useQuery({
    queryKey: ['admin-listing-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 100),
    enabled: !!user
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ id, status, notes, isUserReview }) => {
      const entity = isUserReview ? base44.entities.UserReview : base44.entities.Review;
      return await entity.update(id, {
        status,
        moderation_notes: notes,
        moderated_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-user-reviews']);
      queryClient.invalidateQueries(['admin-listing-reviews']);
      toast.success('Review moderated successfully');
    }
  });

  const ReviewCard = ({ review, isUserReview }) => {
    const [notes, setNotes] = useState(review.moderation_notes || '');
    
    return (
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={
                review.status === 'published' ? 'default' :
                review.status === 'pending' ? 'secondary' :
                review.status === 'flagged' ? 'destructive' : 'outline'
              }>
                {review.status}
              </Badge>
              {isUserReview && (
                <Badge variant="outline">{review.reviewer_role}</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 mb-2">
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
              <span className="text-sm text-slate-500 ml-2">
                {format(new Date(review.created_date), 'MMM d, yyyy')}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-2">
              <strong>Reviewer:</strong> {review.reviewer_email}
            </p>
            {isUserReview ? (
              <p className="text-sm text-slate-600 mb-2">
                <strong>Reviewed User:</strong> {review.reviewed_user_email}
              </p>
            ) : (
              <p className="text-sm text-slate-600 mb-2">
                <strong>Listing ID:</strong> {review.listing_id}
              </p>
            )}
            
            <p className="text-slate-700 mt-3">
              {review.review_text}
            </p>

            {review.flagged_reason && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Flagged:</strong> {review.flagged_reason}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Moderation notes (internal only)"
            className="text-sm"
          />
          
          <div className="flex gap-2">
            <Button
              onClick={() => moderateMutation.mutate({ 
                id: review.id, 
                status: 'published', 
                notes,
                isUserReview 
              })}
              disabled={moderateMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            
            <Button
              onClick={() => moderateMutation.mutate({ 
                id: review.id, 
                status: 'flagged', 
                notes,
                isUserReview 
              })}
              disabled={moderateMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              <Flag className="w-4 h-4 mr-2" />
              Flag
            </Button>
            
            <Button
              onClick={() => moderateMutation.mutate({ 
                id: review.id, 
                status: 'hidden', 
                notes,
                isUserReview 
              })}
              disabled={moderateMutation.isPending}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Hide
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
      </div>
    );
  }

  const pendingUserReviews = userReviews.filter(r => r.status === 'pending');
  const flaggedUserReviews = userReviews.filter(r => r.status === 'flagged');
  const pendingListingReviews = listingReviews.filter(r => r.status === 'pending');
  const flaggedListingReviews = listingReviews.filter(r => r.status === 'flagged');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Review Moderation</h1>
          <p className="text-slate-600 mt-2">Approve, flag, or hide user and listing reviews</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-slate-600">Pending User Reviews</p>
            <p className="text-2xl font-bold text-slate-900">{pendingUserReviews.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-slate-600">Flagged User Reviews</p>
            <p className="text-2xl font-bold text-red-600">{flaggedUserReviews.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-slate-600">Pending Listing Reviews</p>
            <p className="text-2xl font-bold text-slate-900">{pendingListingReviews.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-slate-600">Flagged Listing Reviews</p>
            <p className="text-2xl font-bold text-red-600">{flaggedListingReviews.length}</p>
          </div>
        </div>

        <Tabs defaultValue="user-pending">
          <TabsList className="mb-6">
            <TabsTrigger value="user-pending">
              User Reviews - Pending ({pendingUserReviews.length})
            </TabsTrigger>
            <TabsTrigger value="user-flagged">
              User Reviews - Flagged ({flaggedUserReviews.length})
            </TabsTrigger>
            <TabsTrigger value="listing-pending">
              Listing Reviews - Pending ({pendingListingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="listing-flagged">
              Listing Reviews - Flagged ({flaggedListingReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user-pending" className="space-y-4">
            {pendingUserReviews.length > 0 ? (
              pendingUserReviews.map(review => (
                <ReviewCard key={review.id} review={review} isUserReview={true} />
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                No pending user reviews
              </div>
            )}
          </TabsContent>

          <TabsContent value="user-flagged" className="space-y-4">
            {flaggedUserReviews.length > 0 ? (
              flaggedUserReviews.map(review => (
                <ReviewCard key={review.id} review={review} isUserReview={true} />
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                No flagged user reviews
              </div>
            )}
          </TabsContent>

          <TabsContent value="listing-pending" className="space-y-4">
            {pendingListingReviews.length > 0 ? (
              pendingListingReviews.map(review => (
                <ReviewCard key={review.id} review={review} isUserReview={false} />
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                No pending listing reviews
              </div>
            )}
          </TabsContent>

          <TabsContent value="listing-flagged" className="space-y-4">
            {flaggedListingReviews.length > 0 ? (
              flaggedListingReviews.map(review => (
                <ReviewCard key={review.id} review={review} isUserReview={false} />
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                No flagged listing reviews
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
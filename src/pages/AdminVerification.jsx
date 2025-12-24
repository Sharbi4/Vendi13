import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Shield, CheckCircle, XCircle, Clock, FileText, 
  ExternalLink, Loader2, User, Mail, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Header from '../components/layout/Header';

export default function AdminVerification() {
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
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
    setUser(userData);
    
    // Check if user is admin
    if (userData.role !== 'admin') {
      window.location.href = '/';
    }
  };

  const { data: verificationRequests = [], isLoading } = useQuery({
    queryKey: ['verification-requests'],
    queryFn: async () => {
      return await base44.entities.VerificationRequest.list('-created_date', 100);
    },
    enabled: !!user,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['all-listings'],
    queryFn: async () => {
      return await base44.entities.Listing.list('-created_date', 200);
    },
    enabled: !!user,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, listing_id }) => {
      // Update verification request
      await base44.entities.VerificationRequest.update(id, {
        status,
        reviewed_by: user.email,
        reviewed_date: new Date().toISOString(),
        rejection_reason: status === 'rejected' ? rejectionReason : null,
        admin_notes: adminNotes,
      });

      // Update listing verification status
      await base44.entities.Listing.update(listing_id, {
        verification_status: status === 'approved' ? 'verified' : 'unverified'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-listings'] });
      setShowReviewModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      setRejectionReason('');
      toast.success('Review submitted successfully');
    },
  });

  const categorizeRequests = () => {
    return {
      pending: verificationRequests.filter(r => r.status === 'pending'),
      approved: verificationRequests.filter(r => r.status === 'approved'),
      rejected: verificationRequests.filter(r => r.status === 'rejected'),
    };
  };

  const categories = categorizeRequests();

  const getListing = (listingId) => {
    return listings.find(l => l.id === listingId);
  };

  const handleReview = (request, status) => {
    if (status === 'rejected' && !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    reviewMutation.mutate({
      id: request.id,
      status,
      listing_id: request.listing_id,
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Verification Management
            </h1>
            <p className="text-slate-500">Review and approve listing verification requests</p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Pending Review</p>
                    <p className="text-3xl font-bold text-amber-600">{categories.pending.length}</p>
                  </div>
                  <Clock className="w-10 h-10 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{categories.approved.length}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{categories.rejected.length}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="pending">
                Pending ({categories.pending.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({categories.approved.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({categories.rejected.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <RequestsList 
                requests={categories.pending}
                listings={listings}
                getListing={getListing}
                onReview={(req) => {
                  setSelectedRequest(req);
                  setShowReviewModal(true);
                }}
              />
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <RequestsList 
                requests={categories.approved}
                listings={listings}
                getListing={getListing}
              />
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              <RequestsList 
                requests={categories.rejected}
                listings={listings}
                getListing={getListing}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Review Modal */}
      {selectedRequest && (
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Verification Request</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Listing Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-slate-900">
                  {getListing(selectedRequest.listing_id)?.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {selectedRequest.host_email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(selectedRequest.created_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              {/* Verification Type */}
              <div>
                <Label className="font-medium">Verification Type</Label>
                <Badge className="mt-2 capitalize">{selectedRequest.verification_type}</Badge>
              </div>

              {/* Documents */}
              {selectedRequest.ownership_documents?.length > 0 && (
                <div>
                  <Label className="font-medium mb-3 block">Ownership Documents</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedRequest.ownership_documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-700 flex-1">Document {idx + 1}</span>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.identity_documents?.length > 0 && (
                <div>
                  <Label className="font-medium mb-3 block">Identity Documents</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedRequest.identity_documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-700 flex-1">Document {idx + 1}</span>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {selectedRequest.additional_notes && (
                <div>
                  <Label className="font-medium">Host Notes</Label>
                  <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-slate-700">
                    {selectedRequest.additional_notes}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this verification..."
                  className="mt-2"
                />
              </div>

              {/* Rejection Reason */}
              <div>
                <Label htmlFor="rejection_reason">Rejection Reason (If Rejecting)</Label>
                <Textarea
                  id="rejection_reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this verification is being rejected..."
                  className="mt-2"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  disabled={reviewMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReview(selectedRequest, 'rejected')}
                  disabled={reviewMutation.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleReview(selectedRequest, 'approved')}
                  disabled={reviewMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function RequestsList({ requests, listings, getListing, onReview }) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-slate-500">No verification requests</p>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: 'bg-amber-100 text-amber-800', icon: Clock },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const listing = getListing(request.listing_id);
        const config = statusConfig[request.status];
        const StatusIcon = config.icon;

        return (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">
                    {listing?.title || 'Unknown Listing'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {request.host_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(request.created_date), 'MMM d, yyyy')}
                    </span>
                    <Badge className="capitalize">{request.verification_type}</Badge>
                  </div>
                </div>
                <Badge className={`${config.color} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {request.status}
                </Badge>
              </div>

              {request.rejection_reason && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-900">
                    <strong>Rejection Reason:</strong> {request.rejection_reason}
                  </p>
                </div>
              )}

              {request.status === 'pending' && onReview && (
                <Button
                  onClick={() => onReview(request)}
                  size="sm"
                  className="bg-[#FF5124] hover:bg-[#e5481f]"
                >
                  Review Request
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
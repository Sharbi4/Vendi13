import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, XCircle, Clock, AlertTriangle, Shield, 
  Eye, Loader2, MapPin, DollarSign, Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminListingVerification() {
  const [user, setUser] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
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
      window.location.href = createPageUrl('Home');
      return;
    }
    setUser(userData);
  };

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: async () => {
      return await base44.entities.Listing.list('-created_date', 500);
    },
    enabled: !!user,
  });

  const updateVerificationMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => {
      return await base44.entities.Listing.update(id, {
        verification_status: status,
        verification_notes: notes,
        verification_date: new Date().toISOString(),
        verified_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setSelectedListing(null);
      setReviewNotes('');
    },
  });

  const handleApprove = (listing) => {
    updateVerificationMutation.mutate({
      id: listing.id,
      status: 'verified',
      notes: reviewNotes || 'Listing verified by admin'
    });
  };

  const handleReject = (listing) => {
    if (!reviewNotes.trim()) {
      alert('Please provide rejection notes');
      return;
    }
    updateVerificationMutation.mutate({
      id: listing.id,
      status: 'unverified',
      notes: reviewNotes
    });
  };

  const pendingListings = listings.filter(l => l.verification_status === 'pending');
  const verifiedListings = listings.filter(l => l.verification_status === 'verified');
  const rejectedListings = listings.filter(l => l.verification_status === 'unverified');

  // Automated checks
  const runAutomatedChecks = (listing) => {
    const issues = [];
    
    if (!listing.media || listing.media.length < 3) {
      issues.push('Insufficient photos (minimum 3 required)');
    }
    if (listing.description?.length < 50) {
      issues.push('Description too short (minimum 50 characters)');
    }
    if (!listing.public_location_label) {
      issues.push('Missing location information');
    }
    if (listing.listing_mode === 'rent' && !listing.daily_price && !listing.weekly_price && !listing.monthly_price) {
      issues.push('No rental pricing set');
    }
    if (listing.listing_mode === 'sale' && !listing.sale_price) {
      issues.push('No sale price set');
    }
    if (!listing.asset_category) {
      issues.push('Missing category');
    }
    if (listing.listing_mode === 'rent' && !listing.pickup_enabled && !listing.delivery_available) {
      issues.push('No pickup or delivery method enabled');
    }
    
    return issues;
  };

  if (!user) {
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Listing Verification
              </h1>
              <p className="text-slate-600 mt-1">Review and approve platform listings</p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 border-0">
              <Shield className="w-4 h-4 mr-1" />
              Admin
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Pending Review</p>
                    <p className="text-3xl font-bold text-slate-900">{pendingListings.length}</p>
                  </div>
                  <Clock className="w-10 h-10 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Verified</p>
                    <p className="text-3xl font-bold text-slate-900">{verifiedListings.length}</p>
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
                    <p className="text-3xl font-bold text-slate-900">{rejectedListings.length}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingListings.length})</TabsTrigger>
              <TabsTrigger value="verified">Verified ({verifiedListings.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedListings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <ListingsGrid 
                listings={pendingListings} 
                isLoading={isLoading}
                onReview={setSelectedListing}
                runChecks={runAutomatedChecks}
              />
            </TabsContent>

            <TabsContent value="verified" className="mt-6">
              <ListingsGrid 
                listings={verifiedListings} 
                isLoading={isLoading}
                onReview={setSelectedListing}
                runChecks={runAutomatedChecks}
              />
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              <ListingsGrid 
                listings={rejectedListings} 
                isLoading={isLoading}
                onReview={setSelectedListing}
                runChecks={runAutomatedChecks}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Review Modal */}
      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Listing</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Listing Preview */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                    {selectedListing.media?.[0] ? (
                      <img 
                        src={selectedListing.media[0]} 
                        alt={selectedListing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{selectedListing.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3">{selectedListing.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Details</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge>{selectedListing.listing_mode}</Badge>
                        <Badge variant="outline">{selectedListing.asset_category}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        {selectedListing.public_location_label || 'No location'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        {selectedListing.listing_mode === 'rent' 
                          ? `$${selectedListing.daily_price}/day`
                          : `$${selectedListing.sale_price}`
                        }
                      </div>
                      <div className="text-sm text-slate-500">
                        Created: {format(new Date(selectedListing.created_date), 'PPP')}
                      </div>
                      <div className="text-sm text-slate-500">
                        By: {selectedListing.created_by}
                      </div>
                    </div>
                  </div>

                  {/* Automated Checks */}
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-2">Automated Checks</p>
                    {runAutomatedChecks(selectedListing).length > 0 ? (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1">
                            {runAutomatedChecks(selectedListing).map((issue, idx) => (
                              <li key={idx} className="text-sm">{issue}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-green-700">
                          All automated checks passed
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <label className="text-sm font-medium text-slate-900 mb-2 block">
                  Review Notes {selectedListing.verification_status === 'pending' && '(Required for rejection)'}
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this review..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open(createPageUrl('ListingDetail') + '?id=' + selectedListing.id, '_blank')}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Listing
                </Button>
                {selectedListing.verification_status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleReject(selectedListing)}
                      disabled={updateVerificationMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedListing)}
                      disabled={updateVerificationMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ListingsGrid({ listings, isLoading, onReview, runChecks }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No listings in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing) => {
        const issues = runChecks(listing);
        
        return (
          <Card key={listing.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                {listing.media?.[0] ? (
                  <img 
                    src={listing.media[0]} 
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                {listing.title}
              </h3>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {listing.description}
              </p>

              <div className="flex items-center justify-between mb-3">
                <Badge className={
                  listing.verification_status === 'verified' ? 'bg-green-100 text-green-800 border-0' :
                  listing.verification_status === 'pending' ? 'bg-amber-100 text-amber-800 border-0' :
                  'bg-red-100 text-red-800 border-0'
                }>
                  {listing.verification_status}
                </Badge>
                {issues.length > 0 && (
                  <Badge variant="destructive">
                    {issues.length} issues
                  </Badge>
                )}
              </div>

              <Button
                onClick={() => onReview(listing)}
                variant="outline"
                className="w-full"
              >
                Review
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
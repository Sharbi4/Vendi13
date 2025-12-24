import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, User, Building, CheckCircle, 
  AlertCircle, Info, ArrowLeft
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import StripeIdentityVerification from '../components/verification/StripeIdentityVerification';
import SubmitVerificationModal from '../components/verification/SubmitVerificationModal';

export default function VerificationCenter() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
    
    // Check if returning from Stripe Identity verification
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      // Remove session_id from URL
      window.history.replaceState({}, '', window.location.pathname);
      toast.success('Identity verification submitted! Processing your verification...');
      
      // Refresh user data after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries(['user']);
        window.location.reload();
      }, 2000);
    }
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('VerificationCenter'));
      return;
    }
    setIsAuthenticated(authenticated);
    const userData = await base44.auth.me();
    setUser(userData);
  };

  // Fetch user's listings
  const { data: myListings = [] } = useQuery({
    queryKey: ['my-listings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Listing.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  // Fetch verification requests
  const { data: verificationRequests = [] } = useQuery({
    queryKey: ['verification-requests', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.VerificationRequest.filter({ host_email: user.email });
    },
    enabled: !!user?.email,
  });

  // Fetch fresh user data with polling for identity verification status
  const { data: freshUser } = useQuery({
    queryKey: ['fresh-user', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      return await base44.auth.me();
    },
    enabled: !!user?.email,
    refetchInterval: 3000, // Poll every 3 seconds for verification updates
  });

  const currentUser = freshUser || user;
  const identityVerified = currentUser?.identity_verification_status === 'verified';
  const hasListings = myListings.length > 0;
  const unverifiedListings = myListings.filter(l => 
    l.verification_status !== 'verified' &&
    !verificationRequests.some(vr => vr.listing_id === l.id && vr.status === 'pending')
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to={createPageUrl('Dashboard')}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#FF5124] rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Verification Center</h1>
                <p className="text-slate-500">Verify your identity and listings to build trust</p>
              </div>
            </div>
          </div>

          {/* Overview Alert */}
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>Build trust on Vendibook:</strong> Verified users receive up to 3x more bookings. 
              Complete both identity and listing verification to maximize your success.
            </AlertDescription>
          </Alert>

          {/* Verification Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Identity</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {identityVerified ? (
                        <span className="text-green-600">Verified</span>
                      ) : (
                        <span className="text-amber-600">Pending</span>
                      )}
                    </p>
                  </div>
                  {identityVerified ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Verified Listings</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {myListings.filter(l => l.verification_status === 'verified').length}
                      <span className="text-base font-normal text-slate-500">
                        /{myListings.length}
                      </span>
                    </p>
                  </div>
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Pending Requests</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {verificationRequests.filter(vr => vr.status === 'pending').length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="identity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="identity" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Identity Verification
              </TabsTrigger>
              <TabsTrigger value="listings" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Listing Verification
              </TabsTrigger>
            </TabsList>

            {/* Identity Verification Tab */}
            <TabsContent value="identity" className="space-y-6">
              <StripeIdentityVerification user={currentUser} />
            </TabsContent>

            {/* Listing Verification Tab */}
            <TabsContent value="listings" className="space-y-6">
              {!hasListings ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Listings Yet</h3>
                    <p className="text-slate-500 mb-4">
                      Create your first listing to get it verified
                    </p>
                    <Link to={createPageUrl('CreateListing')}>
                      <button className="px-6 py-2 bg-[#FF5124] hover:bg-[#e5481f] text-white rounded-xl font-medium">
                        Create Listing
                      </button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Unverified Listings */}
                  {unverifiedListings.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Listings Awaiting Verification</CardTitle>
                        <CardDescription>
                          Submit verification documents for these listings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {unverifiedListings.map((listing) => (
                          <div
                            key={listing.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {listing.media?.[0] && (
                                <img
                                  src={listing.media[0]}
                                  alt=""
                                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 truncate">{listing.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {listing.verification_status || 'unverified'}
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    {listing.public_location_label}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedListing(listing);
                                setShowSubmitModal(true);
                              }}
                              className="px-4 py-2 bg-[#FF5124] hover:bg-[#e5481f] text-white rounded-xl font-medium text-sm flex-shrink-0 ml-4"
                            >
                              Submit for Verification
                            </button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Verification Requests */}
                  {verificationRequests.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Verification Requests</CardTitle>
                        <CardDescription>Track your verification submissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {verificationRequests.map((request) => {
                          const listing = myListings.find(l => l.id === request.listing_id);
                          const statusConfig = {
                            pending: { color: 'bg-amber-100 text-amber-800', icon: AlertCircle },
                            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
                            rejected: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
                          }[request.status];
                          const StatusIcon = statusConfig.icon;

                          return (
                            <div
                              key={request.id}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {listing?.media?.[0] && (
                                  <img
                                    src={listing.media[0]}
                                    alt=""
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900">{listing?.title || 'Unknown'}</h4>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Submitted {new Date(request.created_date).toLocaleDateString()}
                                  </p>
                                  {request.rejection_reason && (
                                    <p className="text-xs text-red-600 mt-1">{request.rejection_reason}</p>
                                  )}
                                </div>
                              </div>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {request.status}
                              </Badge>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {/* Verified Listings */}
                  {myListings.some(l => l.verification_status === 'verified') && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Verified Listings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {myListings
                          .filter(l => l.verification_status === 'verified')
                          .map((listing) => (
                            <div
                              key={listing.id}
                              className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
                            >
                              {listing.media?.[0] && (
                                <img
                                  src={listing.media[0]}
                                  alt=""
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900">{listing.title}</h4>
                                <Badge className="bg-green-100 text-green-800 mt-1">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Submit Verification Modal */}
      {showSubmitModal && selectedListing && (
        <SubmitVerificationModal
          open={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
        />
      )}
    </div>
  );
}
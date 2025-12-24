import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Plus, LayoutDashboard, Package, Calendar, DollarSign,
  Eye, Edit, MoreHorizontal, Loader2, Clock, Bookmark, MessageSquare, Star, Edit3,
  User, CheckCircle, Shield, ArrowRight
} from 'lucide-react';
import SavedSearches from '../components/search/SavedSearches';
import ConversationsList from '../components/messaging/ConversationsList';
import ChatInterface from '../components/messaging/ChatInterface';
import AnalyticsOverview from '../components/dashboard/AnalyticsOverview';
import EarningsReport from '../components/dashboard/EarningsReport';
import ReviewsManagement from '../components/dashboard/ReviewsManagement';
import AvailabilityManager from '../components/dashboard/AvailabilityManager';
import ListingManagementCard from '../components/dashboard/ListingManagementCard';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import InteractiveTutorial from '../components/onboarding/InteractiveTutorial';
import BookingRequestsCard from '../components/dashboard/BookingRequestsCard';
import GuestReviewsCard from '../components/dashboard/GuestReviewsCard';
import UpcomingRentalsCard from '../components/dashboard/UpcomingRentalsCard';
import ManageBookingsView from '../components/dashboard/ManageBookingsView';
import AddonRequestsCard from '../components/dashboard/AddonRequestsCard';
import BulkEditModal from '../components/dashboard/BulkEditModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedListingForAvailability, setSelectedListingForAvailability] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userListingMode, setUserListingMode] = useState(null);
  const [selectedListings, setSelectedListings] = useState([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('Dashboard'));
      return;
    }
    setIsAuthenticated(authenticated);
    const userData = await base44.auth.me();
    setUser(userData);
    
    // Detect user's listing mode
    const userListings = await base44.entities.Listing.filter({ created_by: userData.email }, '-created_date', 10);
    if (userListings.length > 0) {
      const hasRentals = userListings.some(l => l.listing_mode === 'rent');
      const hasSales = userListings.some(l => l.listing_mode === 'sale');
      
      if (hasRentals && !hasSales) {
        navigate(createPageUrl('HostDashboard'));
        return;
      }
      if (hasSales && !hasRentals) {
        navigate(createPageUrl('SellerDashboard'));
        return;
      }
      setUserListingMode('both');
    }
  };

  const { data: myListings = [], isLoading } = useQuery({
    queryKey: ['my-listings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Listing.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  // Fetch bookings for my listings
  const { data: allBookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const myListingIds = myListings.map(l => l.id);
      if (myListingIds.length === 0) return [];
      
      // Fetch all bookings and filter client-side
      const bookings = await base44.entities.Booking.list('-created_date', 100);
      return bookings.filter(b => myListingIds.includes(b.listing_id));
    },
    enabled: !!user?.email && myListings.length > 0,
  });

  const activeListings = myListings.filter(l => l.status === 'active');
  const draftListings = myListings.filter(l => l.status === 'draft');
  const pendingBookings = allBookings.filter(b => b.status === 'pending');
  const confirmedBookings = allBookings.filter(b => ['confirmed', 'active'].includes(b.status));

  // Calculate total earnings
  const totalEarnings = allBookings
    .filter(b => b.payment_status === 'paid' && b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  // Calculate average rating across all listings
  const listingsWithReviews = myListings.filter(l => l.review_count > 0);
  const averageRating = listingsWithReviews.length > 0
    ? (listingsWithReviews.reduce((sum, l) => sum + (l.average_rating || 0), 0) / listingsWithReviews.length).toFixed(1)
    : 0;

  // Fetch unread messages count
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const asHost = await base44.entities.Conversation.filter({ host_email: user.email, status: 'active' });
      const asGuest = await base44.entities.Conversation.filter({ guest_email: user.email, status: 'active' });
      return [...asHost, ...asGuest];
    },
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const unreadCount = conversations.reduce((sum, conv) => {
    const isHost = user?.email === conv.host_email;
    return sum + (isHost ? conv.unread_count_host : conv.unread_count_guest);
  }, 0);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedConversation(null);
  };

  const handleTutorialComplete = async () => {
    if (user?.email) {
      await base44.auth.updateMe({
        onboarding_steps: {
          ...(user.onboarding_steps || {}),
          tutorial_viewed: true,
        }
      });
    }
  };

  const handleDismissOnboarding = async () => {
    setShowOnboarding(false);
    if (user?.email) {
      await base44.auth.updateMe({
        onboarding_completed: true,
      });
    }
  };

  // Track onboarding progress automatically
  useEffect(() => {
    const trackProgress = async () => {
      if (!user?.email || !myListings) return;

      const updates = {};
      let hasUpdates = false;

      // Check if first listing was created
      if (myListings.length > 0 && !user.onboarding_steps?.first_listing_created) {
        updates.first_listing_created = true;
        hasUpdates = true;
      }

      // Check if profile is completed
      if (user.phone && user.bio && user.profile_image && !user.onboarding_steps?.profile_completed) {
        updates.profile_completed = true;
        hasUpdates = true;
      }

      // Check if payment method is set up
      if (user.stripe_connect_account_id && !user.onboarding_steps?.payment_method_added) {
        updates.payment_method_added = true;
        hasUpdates = true;
      }

      if (hasUpdates) {
        await base44.auth.updateMe({
          onboarding_steps: {
            ...(user.onboarding_steps || {}),
            ...updates,
          },
        });
      }
    };

    trackProgress();
  }, [user, myListings]);

  if (!isAuthenticated) {
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
      
      <main className="pt-32 md:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500">Welcome back, {user?.full_name || 'Host'}!</p>
              
              {userListingMode === 'both' && (
                <div className="flex gap-3 mt-3">
                  <Link to={createPageUrl('HostDashboard')}>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Host Dashboard
                    </Button>
                  </Link>
                  <Link to={createPageUrl('SellerDashboard')}>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Seller Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {selectedListings.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowBulkEdit(true)}
                  className="rounded-full"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Bulk Edit ({selectedListings.length})
                </Button>
              )}
              <Link to={createPageUrl('CreateListing')}>
                <Button className="bg-[#FF5124] hover:bg-[#e5481f] rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create a Listing
                </Button>
              </Link>
            </div>
          </div>

          {/* Onboarding Checklist */}
          {showOnboarding && !user?.onboarding_completed && (
            <div className="mb-8">
              <OnboardingChecklist
                user={user}
                onDismiss={handleDismissOnboarding}
                onStartTutorial={() => setShowTutorial(true)}
              />
            </div>
          )}

          {/* Profile Summary Card */}
          <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#FF5124] rounded-full flex items-center justify-center relative flex-shrink-0">
                    <span className="text-white text-2xl font-bold">
                      {user?.full_name?.charAt(0) || 'U'}
                    </span>
                    {user?.identity_verification_status === 'verified' && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-slate-900">{user?.full_name || 'User'}</h3>
                      {user?.identity_verification_status === 'verified' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{user?.email}</p>
                    {user?.phone_number && (
                      <p className="text-xs text-slate-500 mt-1">{user?.phone_number}</p>
                    )}
                  </div>
                </div>
                <Link to={createPageUrl('Profile')}>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              {(!user?.phone_number || !user?.address || user?.identity_verification_status !== 'verified') && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-900 font-medium mb-2">Complete your profile to unlock:</p>
                  <div className="flex flex-wrap gap-2">
                    {!user?.phone_number && (
                      <Badge variant="outline" className="text-xs bg-white">
                        Add phone number
                      </Badge>
                    )}
                    {!user?.address && (
                      <Badge variant="outline" className="text-xs bg-white">
                        Add address
                      </Badge>
                    )}
                    {user?.identity_verification_status !== 'verified' && (
                      <Badge variant="outline" className="text-xs bg-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Verify identity
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Active Listings</p>
                    <p className="text-3xl font-bold text-slate-900">{activeListings.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Bookings</p>
                    <p className="text-3xl font-bold text-slate-900">{allBookings.length}</p>
                    {pendingBookings.length > 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        {pendingBookings.length} pending
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Earnings</p>
                    <p className="text-3xl font-bold text-slate-900">${totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {allBookings.filter(b => b.payment_status === 'paid').length} paid bookings
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg Rating</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {averageRating > 0 ? averageRating : '—'}
                    </p>
                    {listingsWithReviews.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        {listingsWithReviews.reduce((sum, l) => sum + l.review_count, 0)} reviews
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>My Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active ({activeListings.length})</TabsTrigger>
                  <TabsTrigger value="drafts">Drafts ({draftListings.length})</TabsTrigger>
                  <TabsTrigger value="all">All ({myListings.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                  <ListingsGrid 
                    listings={activeListings} 
                    isLoading={isLoading}
                    onManageAvailability={setSelectedListingForAvailability}
                    user={user}
                    selectedListings={selectedListings}
                    onToggleSelection={setSelectedListings}
                  />
                </TabsContent>
                <TabsContent value="drafts">
                  <ListingsGrid 
                    listings={draftListings} 
                    isLoading={isLoading}
                    onManageAvailability={setSelectedListingForAvailability}
                    user={user}
                    selectedListings={selectedListings}
                    onToggleSelection={setSelectedListings}
                  />
                </TabsContent>
                <TabsContent value="all">
                  <ListingsGrid 
                    listings={myListings} 
                    isLoading={isLoading}
                    onManageAvailability={setSelectedListingForAvailability}
                    user={user}
                    selectedListings={selectedListings}
                    onToggleSelection={setSelectedListings}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Booking Requests - Priority Section */}
          {pendingBookings.length > 0 && (
            <div className="mb-8">
              <BookingRequestsCard bookings={pendingBookings} listings={myListings} />
            </div>
          )}

          {/* Upcoming Rentals & Guest Reviews */}
          {confirmedBookings.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <UpcomingRentalsCard bookings={allBookings} listings={myListings} />
              <GuestReviewsCard userEmail={user?.email} />
            </div>
          )}

          {/* Add-on Requests */}
          <div className="mb-8">
            <AddonRequestsCard userEmail={user?.email} />
          </div>

          {/* Analytics Overview */}
          {activeListings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Performance Overview</h2>
              <AnalyticsOverview userEmail={user?.email} listings={myListings} />
            </div>
          )}

          {/* Earnings Report */}
          {myListings.length > 0 && (
            <div className="mb-8">
              <EarningsReport 
                userEmail={user?.email} 
                listingIds={myListings.map(l => l.id)} 
              />
            </div>
          )}

          {/* Reviews Management */}
          {myListings.length > 0 && (
            <div className="mb-8">
              <ReviewsManagement 
                userEmail={user?.email} 
                listings={myListings} 
              />
            </div>
          )}

          {/* Manage All Bookings */}
          {allBookings.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Manage Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ManageBookingsView 
                  bookings={allBookings} 
                  listings={myListings}
                  user={user}
                />
              </CardContent>
            </Card>
          )}

          {/* Quick Payouts Link */}
          {totalEarnings > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-green-900">${totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  {allBookings.filter(b => b.payment_status === 'paid').length} paid bookings
                </p>
              </div>
              <Link to={createPageUrl('PayoutsPage')}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Payouts
                </Button>
              </Link>
            </div>
          </CardContent>
          </Card>
          )}

          {/* Messages */}
          <Card className="mb-8">
          <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
              {unreadCount > 0 && (
                <Badge className="bg-[#FF5124] text-white">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
          </div>
          </CardHeader>
          <CardContent>
          <ConversationsList 
            user={user} 
            onSelectConversation={handleSelectConversation}
          />
          </CardContent>
          </Card>

          {/* Saved Searches */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                Saved Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SavedSearches user={user} />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Chat Interface */}
      {selectedConversation && (
        <ChatInterface
          open={showChat}
          onClose={handleCloseChat}
          conversationId={selectedConversation.id}
          listing={{ 
            id: selectedConversation.listing_id,
            title: selectedConversation.listing_title,
            listing_mode: 'rent'
          }}
          hostEmail={selectedConversation.host_email}
          user={user}
        />
      )}

      {/* Availability Manager Modal */}
      {selectedListingForAvailability && (
        <Dialog open={!!selectedListingForAvailability} onOpenChange={() => setSelectedListingForAvailability(null)}>
          <DialogContent className="max-w-3xl">
            <AvailabilityManager listing={selectedListingForAvailability} />
          </DialogContent>
        </Dialog>
      )}

      {/* Interactive Tutorial */}
      <InteractiveTutorial
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        open={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        selectedListings={selectedListings}
      />
    </div>
  );
}

function ListingsGrid({ listings, isLoading, onManageAvailability, user, selectedListings, onToggleSelection }) {
  const handleToggle = (listing) => {
    const isSelected = selectedListings.some(l => l.id === listing.id);
    if (isSelected) {
      onToggleSelection(selectedListings.filter(l => l.id !== listing.id));
    } else {
      onToggleSelection([...selectedListings, listing]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-slate-500">No listings yet</p>
        <Link to={createPageUrl('CreateListing')}>
          <Button variant="outline" className="mt-4 rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Create your first listing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((listing) => {
        const isSelected = selectedListings.some(l => l.id === listing.id);
        return (
          <div key={listing.id} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggle(listing)}
              className="mt-6 w-4 h-4 rounded border-gray-300 text-[#FF5124] focus:ring-[#FF5124]"
            />
            <div className="flex-1">
              <ListingManagementCard
                listing={listing}
                onManageAvailability={onManageAvailability}
                user={user}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BookingsTable({ bookings, listings }) {
  const { mutate: updateBooking } = useMutation({
    mutationFn: async ({ id, status }) => {
      return await base44.entities.Booking.update(id, { status });
    },
  });

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-slate-500">No bookings yet</p>
      </div>
    );
  }

  const getListingTitle = (listingId) => {
    const listing = listings.find(l => l.id === listingId);
    return listing?.title || 'Unknown Listing';
  };

  const handleConfirm = (bookingId) => {
    if (window.confirm('Confirm this booking?')) {
      updateBooking({ id: bookingId, status: 'confirmed' });
    }
  };

  const handleCancel = (bookingId) => {
    if (window.confirm('Cancel this booking?')) {
      updateBooking({ id: bookingId, status: 'cancelled' });
    }
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-green-100 text-green-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">
              {getListingTitle(booking.listing_id)}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {booking.guest_name} • {booking.guest_email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                className={`text-xs ${statusColors[booking.status]}`}
              >
                {booking.status}
              </Badge>
              <span className="text-xs text-slate-500">
                {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
              </span>
              <span className="text-xs text-slate-500">
                ({booking.total_days} days)
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">
              ${booking.total_amount?.toLocaleString()}
            </p>
            {booking.status === 'pending' && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => handleConfirm(booking.id)}
                  className="bg-green-600 hover:bg-green-700 text-xs"
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancel(booking.id)}
                  className="text-xs"
                >
                  Decline
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
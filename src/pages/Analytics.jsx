import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';
import Header from '../components/layout/Header';
import BookingTrendsChart from '../components/analytics/BookingTrendsChart';
import OccupancyRateChart from '../components/analytics/OccupancyRateChart';
import EarningsBreakdownChart from '../components/analytics/EarningsBreakdownChart';
import GuestDemographicsChart from '../components/analytics/GuestDemographicsChart';
import InquiryTopicsChart from '../components/analytics/InquiryTopicsChart';
import PerformanceMetrics from '../components/analytics/PerformanceMetrics';

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedListing, setSelectedListing] = useState('all');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin();
      return;
    }
    setIsAuthenticated(authenticated);
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: myListings = [] } = useQuery({
    queryKey: ['my-listings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Listing.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const myListingIds = myListings.map(l => l.id);
      if (myListingIds.length === 0) return [];
      const bookings = await base44.entities.Booking.list('-created_date', 200);
      return bookings.filter(b => myListingIds.includes(b.listing_id));
    },
    enabled: !!user?.email && myListings.length > 0,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['my-conversations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Conversation.filter({ host_email: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const myListingIds = myListings.map(l => l.id);
      if (myListingIds.length === 0) return [];
      const allReviews = await base44.entities.Review.list('-created_date', 200);
      return allReviews.filter(r => myListingIds.includes(r.listing_id));
    },
    enabled: !!user?.email && myListings.length > 0,
  });

  // Filter data based on selected listing and time range
  const filteredBookings = selectedListing === 'all' 
    ? allBookings 
    : allBookings.filter(b => b.listing_id === selectedListing);

  const filteredConversations = selectedListing === 'all'
    ? conversations
    : conversations.filter(c => c.listing_id === selectedListing);

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
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-slate-500">Track your listing performance and insights</p>
            </div>
            <div className="flex gap-3">
              <Select value={selectedListing} onValueChange={setSelectedListing}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select listing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  {myListings.map(listing => (
                    <SelectItem key={listing.id} value={listing.id}>
                      {listing.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Performance Metrics */}
          <PerformanceMetrics 
            bookings={filteredBookings}
            listings={selectedListing === 'all' ? myListings : myListings.filter(l => l.id === selectedListing)}
            reviews={reviews}
            timeRange={parseInt(timeRange)}
          />

          {/* Charts */}
          <Tabs defaultValue="bookings" className="space-y-6 mt-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="bookings">
                <Calendar className="w-4 h-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="occupancy">
                <TrendingUp className="w-4 h-4 mr-2" />
                Occupancy
              </TabsTrigger>
              <TabsTrigger value="earnings">
                <DollarSign className="w-4 h-4 mr-2" />
                Earnings
              </TabsTrigger>
              <TabsTrigger value="guests">
                <Users className="w-4 h-4 mr-2" />
                Guests
              </TabsTrigger>
              <TabsTrigger value="inquiries">
                Inquiries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <BookingTrendsChart bookings={filteredBookings} timeRange={parseInt(timeRange)} />
            </TabsContent>

            <TabsContent value="occupancy">
              <OccupancyRateChart 
                bookings={filteredBookings} 
                listings={selectedListing === 'all' ? myListings : myListings.filter(l => l.id === selectedListing)}
                timeRange={parseInt(timeRange)} 
              />
            </TabsContent>

            <TabsContent value="earnings">
              <EarningsBreakdownChart bookings={filteredBookings} timeRange={parseInt(timeRange)} />
            </TabsContent>

            <TabsContent value="guests">
              <GuestDemographicsChart bookings={filteredBookings} reviews={reviews} />
            </TabsContent>

            <TabsContent value="inquiries">
              <InquiryTopicsChart conversations={filteredConversations} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
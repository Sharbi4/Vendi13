import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Calendar, DollarSign, TrendingUp, MessageSquare, 
  Home, CheckCircle, Clock, XCircle, Plus, Loader2
} from 'lucide-react';
import { format, isFuture, isPast, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import ChatInterface from '../components/messaging/ChatInterface';

export default function HostDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('HostDashboard'));
      return;
    }
    const userData = await base44.auth.me();
    setUser(userData);
    setIsLoading(false);
  };

  // Fetch rental listings only
  const { data: listings = [] } = useQuery({
    queryKey: ['host-listings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Listing.filter({ 
        created_by: user.email,
        listing_mode: 'rent'
      }, '-created_date');
    },
    enabled: !!user?.email,
  });

  // Fetch bookings for rental listings
  const { data: bookings = [] } = useQuery({
    queryKey: ['host-bookings', listings],
    queryFn: async () => {
      if (listings.length === 0) return [];
      const listingIds = listings.map(l => l.id);
      const allBookings = await base44.entities.Booking.list('-created_date', 500);
      return allBookings.filter(b => listingIds.includes(b.listing_id));
    },
    enabled: listings.length > 0,
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['host-conversations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Conversation.filter({ 
        host_email: user.email 
      }, '-last_message_date');
    },
    enabled: !!user?.email,
  });

  // Calculate stats
  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && isFuture(new Date(b.start_date))
  );
  
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  
  const activeBookings = bookings.filter(b => {
    const start = new Date(b.start_date);
    const end = new Date(b.end_date);
    const now = new Date();
    return b.status === 'confirmed' && now >= start && now <= end;
  });

  const totalRevenue = bookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const monthlyRevenue = bookings
    .filter(b => {
      const date = new Date(b.created_date);
      const now = new Date();
      return b.payment_status === 'paid' && 
        date.getMonth() === now.getMonth() && 
        date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const unreadMessages = conversations.reduce((sum, c) => sum + (c.unread_count_host || 0), 0);

  if (isLoading) {
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Host Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage your rental business</p>
            </div>
            <Link to={createPageUrl('CreateListing')}>
              <Button className="bg-[#FF5124] hover:bg-[#e5481f]">
                <Plus className="w-4 h-4 mr-2" />
                New Listing
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Active Rentals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-900">{activeBookings.length}</div>
                  <Home className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-900">{upcomingBookings.length}</div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-900">${monthlyRevenue.toLocaleString()}</div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-900">{unreadMessages}</div>
                  <MessageSquare className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="listings">My Assets</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              {/* Pending Requests */}
              {pendingBookings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-500" />
                      Pending Requests ({pendingBookings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingBookings.map((booking) => {
                      const listing = listings.find(l => l.id === booking.listing_id);
                      return (
                        <div key={booking.id} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-slate-900">{listing?.title}</h4>
                              <p className="text-sm text-slate-600">{booking.guest_name} • {booking.guest_email}</p>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800 border-0">Pending</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                            <span>{format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-900">${booking.total_amount?.toLocaleString()}</span>
                          </div>
                          <Link to={`${createPageUrl('Dashboard')}?tab=bookings`}>
                            <Button size="sm" className="bg-[#FF5124] hover:bg-[#e5481f]">
                              Review Request
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Upcoming Bookings ({upcomingBookings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingBookings.map((booking) => {
                        const listing = listings.find(l => l.id === booking.listing_id);
                        return (
                          <div key={booking.id} className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FF5124] transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-slate-900">{listing?.title}</h4>
                                <p className="text-sm text-slate-600">{booking.guest_name}</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800 border-0">Confirmed</Badge>
                            </div>
                            <div className="text-sm text-slate-600">
                              {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No upcoming bookings</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Listings Tab */}
            <TabsContent value="listings">
              <Card>
                <CardHeader>
                  <CardTitle>Your Rental Assets ({listings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {listings.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {listings.map((listing) => (
                        <Link key={listing.id} to={`${createPageUrl('ListingDetail')}?id=${listing.id}`}>
                          <div className="group cursor-pointer">
                            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-3">
                              <img
                                src={listing.media?.[0] || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=400'}
                                alt={listing.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-1">{listing.title}</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">${listing.daily_price}/day</span>
                              <Badge className={listing.status === 'active' ? 'bg-green-100 text-green-800 border-0' : 'bg-gray-100 text-gray-800 border-0'}>
                                {listing.status}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">No rental listings yet</p>
                      <Link to={createPageUrl('CreateListing')}>
                        <Button className="bg-[#FF5124] hover:bg-[#e5481f]">
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Listing
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Conversations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {conversations.length > 0 ? (
                      conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className="w-full p-3 rounded-lg border border-gray-200 hover:border-[#FF5124] text-left transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-slate-900 text-sm">{conv.listing_title}</p>
                            {conv.unread_count_host > 0 && (
                              <Badge className="bg-red-500 text-white border-0 text-xs">
                                {conv.unread_count_host}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 truncate">{conv.last_message}</p>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-8">No messages yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardContent className="p-6">
                    {selectedConversation ? (
                      <ChatInterface
                        open={true}
                        conversationId={selectedConversation.id}
                        user={user}
                      />
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        Select a conversation to view messages
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Revenue Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">This Month</p>
                      <p className="text-2xl font-bold text-slate-900">${monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">Total Bookings</p>
                      <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bookings
                        .filter(b => b.payment_status === 'paid')
                        .slice(0, 5)
                        .map((booking) => {
                          const listing = listings.find(l => l.id === booking.listing_id);
                          return (
                            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{listing?.title}</p>
                                <p className="text-xs text-slate-500">{format(new Date(booking.created_date), 'MMM d, yyyy')}</p>
                              </div>
                              <p className="font-semibold text-green-600">${booking.total_amount?.toLocaleString()}</p>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
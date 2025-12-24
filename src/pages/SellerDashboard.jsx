import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  DollarSign, TrendingUp, MessageSquare, Package,
  CheckCircle, Clock, Plus, Loader2, ShoppingCart
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import ChatInterface from '../components/messaging/ChatInterface';

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('SellerDashboard'));
      return;
    }
    const userData = await base44.auth.me();
    setUser(userData);
    setIsLoading(false);
  };

  // Fetch for-sale listings only
  const { data: listings = [] } = useQuery({
    queryKey: ['seller-listings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Listing.filter({ 
        created_by: user.email,
        listing_mode: 'sale'
      }, '-created_date');
    },
    enabled: !!user?.email,
  });

  // Fetch sale transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['seller-transactions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allTransactions = await base44.entities.Transaction.list('-created_date', 500);
      return allTransactions.filter(t => 
        t.transaction_type === 'sale_purchase' && 
        listings.some(l => l.id === t.reference_id)
      );
    },
    enabled: listings.length > 0,
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['seller-conversations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Conversation.filter({ 
        host_email: user.email 
      }, '-last_message_date');
    },
    enabled: !!user?.email,
  });

  // Calculate stats
  const activeListings = listings.filter(l => l.status === 'active');
  const soldListings = listings.filter(l => l.status === 'sold');
  
  const totalEarnings = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const monthlyEarnings = transactions
    .filter(t => {
      const date = new Date(t.created_date);
      const now = new Date();
      return t.status === 'completed' && 
        date.getMonth() === now.getMonth() && 
        date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Seller Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage your sales and inventory</p>
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
                <CardTitle className="text-sm font-medium text-slate-600">Active Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-900">{activeListings.length}</div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Items Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-900">{soldListings.length}</div>
                  <ShoppingCart className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-900">${monthlyEarnings.toLocaleString()}</div>
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

          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>

            {/* Listings Tab */}
            <TabsContent value="listings">
              <Card>
                <CardHeader>
                  <CardTitle>Your For-Sale Listings ({listings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {listings.length > 0 ? (
                    <div className="space-y-3">
                      {listings.map((listing) => (
                        <div key={listing.id} className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FF5124] transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={listing.media?.[0] || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=200'}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-slate-900">{listing.title}</h4>
                                  <p className="text-sm text-slate-600 mt-1">{listing.asset_category}</p>
                                </div>
                                <Badge className={
                                  listing.status === 'active' ? 'bg-green-100 text-green-800 border-0' :
                                  listing.status === 'sold' ? 'bg-blue-100 text-blue-800 border-0' :
                                  'bg-gray-100 text-gray-800 border-0'
                                }>
                                  {listing.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-[#FF5124]">
                                  ${listing.sale_price?.toLocaleString()}
                                </span>
                                <Link to={`${createPageUrl('ListingDetail')}?id=${listing.id}`}>
                                  <Button size="sm" variant="outline">View Details</Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">No for-sale listings yet</p>
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

            {/* Sales Tab */}
            <TabsContent value="sales" className="space-y-6">
              {/* Pending Sales */}
              {pendingTransactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-500" />
                      Pending Sales ({pendingTransactions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingTransactions.map((transaction) => {
                      const listing = listings.find(l => l.id === transaction.reference_id);
                      return (
                        <div key={transaction.id} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-slate-900">{listing?.title}</h4>
                              <p className="text-sm text-slate-600">{transaction.user_email}</p>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800 border-0">Pending</Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-semibold text-slate-900">
                              ${transaction.amount?.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500">
                              {format(new Date(transaction.created_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Completed Sales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Completed Sales ({transactions.filter(t => t.status === 'completed').length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.filter(t => t.status === 'completed').length > 0 ? (
                    <div className="space-y-3">
                      {transactions
                        .filter(t => t.status === 'completed')
                        .map((transaction) => {
                          const listing = listings.find(l => l.id === transaction.reference_id);
                          return (
                            <div key={transaction.id} className="p-4 bg-white rounded-xl border border-gray-200">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-slate-900">{listing?.title}</h4>
                                  <p className="text-sm text-slate-600">{transaction.user_email}</p>
                                </div>
                                <Badge className="bg-green-100 text-green-800 border-0">Completed</Badge>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-semibold text-green-600">
                                  ${transaction.amount?.toLocaleString()}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {format(new Date(transaction.created_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No completed sales yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Buyer Inquiries</CardTitle>
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

            {/* Earnings Tab */}
            <TabsContent value="earnings">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Earnings Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
                      <p className="text-3xl font-bold text-slate-900">${totalEarnings.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">This Month</p>
                      <p className="text-2xl font-bold text-slate-900">${monthlyEarnings.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">Total Sales</p>
                      <p className="text-2xl font-bold text-slate-900">{soldListings.length}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transactions
                        .filter(t => t.status === 'completed')
                        .slice(0, 5)
                        .map((transaction) => {
                          const listing = listings.find(l => l.id === transaction.reference_id);
                          return (
                            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{listing?.title}</p>
                                <p className="text-xs text-slate-500">{format(new Date(transaction.created_date), 'MMM d, yyyy')}</p>
                              </div>
                              <p className="font-semibold text-green-600">${transaction.amount?.toLocaleString()}</p>
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
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getCurrentUser, onAuthStateChange } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, Mail, Calendar, Shield, Loader2, 
  Package, MapPin, DollarSign, Eye, Edit2, Save, X, CheckCircle, Star,
  Phone, Home, Instagram, Facebook, Twitter, Linkedin, MessageSquare, Trash2, Info,
  Copy, PowerOff, Power, ChevronDown, ChevronUp, Search, Filter
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import UserReviewsList from '../components/reviews/UserReviewsList';
import StripeIdentityVerification from '../components/verification/StripeIdentityVerification';
import ListingAnalytics from '../components/listings/ListingAnalytics';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [editedCity, setEditedCity] = useState('');
  const [editedState, setEditedState] = useState('');
  const [editedZip, setEditedZip] = useState('');
  const [editedCountry, setEditedCountry] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedHowHeard, setEditedHowHeard] = useState('');
  const [editedNewsletter, setEditedNewsletter] = useState(false);
  const [editedSocialInstagram, setEditedSocialInstagram] = useState('');
  const [editedSocialFacebook, setEditedSocialFacebook] = useState('');
  const [editedSocialTwitter, setEditedSocialTwitter] = useState('');
  const [editedSocialLinkedin, setEditedSocialLinkedin] = useState('');
  const [editedSocialTiktok, setEditedSocialTiktok] = useState('');
  const [selectedListings, setSelectedListings] = useState([]);
  const [listingFilter, setListingFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAnalytics, setExpandedAnalytics] = useState(null);
  const queryClient = useQueryClient();

  // Check authentication and load user profile
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { user: authUser, error } = await getCurrentUser();
        
        if (error || !authUser) {
          // Redirect to login
          navigate('/login?redirect=/Profile');
          return;
        }

        setUser(authUser);
        setIsAuthenticated(true);

        // Fetch user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        const userData = profile || {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || '',
          created_at: authUser.created_at
        };

        setUserProfile(userData);
        initializeEditFields(userData);
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/login?redirect=/Profile');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  const initializeEditFields = (userData) => {
    setEditedName(userData.full_name || '');
    setEditedPhone(userData.phone_number || '');
    setEditedAddress(userData.address || '');
    setEditedCity(userData.city || '');
    setEditedState(userData.state || '');
    setEditedZip(userData.zip_code || '');
    setEditedCountry(userData.country || '');
    setEditedBio(userData.bio || '');
    setEditedHowHeard(userData.how_heard_about_us || '');
    setEditedNewsletter(userData.receive_newsletter || false);
    setEditedSocialInstagram(userData.social_instagram || '');
    setEditedSocialFacebook(userData.social_facebook || '');
    setEditedSocialTwitter(userData.social_twitter || '');
    setEditedSocialLinkedin(userData.social_linkedin || '');
    setEditedSocialTiktok(userData.social_tiktok || '');
  };

  // Fetch user's listings
  const { data: myListings = [] } = useQuery({
    queryKey: ['profile-listings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching listings:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch user reviews
  const { data: userReviews = [] } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_reviews')
        .select('*')
        .eq('reviewed_user_id', user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch bookings where user is the guest
  const { data: myBookings = [] } = useQuery({
    queryKey: ['profile-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('guest_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch bookings where user is the host
  const { data: hostBookings = [] } = useQuery({
    queryKey: ['profile-host-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id || myListings.length === 0) return [];
      const listingIds = myListings.map(l => l.id);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching host bookings:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id && myListings.length > 0,
  });


  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          ...data,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      // Refetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserProfile(profile);
        initializeEditFields(profile);
      }
      
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile-listings'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    },
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (listingId) => {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-listings'] });
      toast.success('Listing deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete listing:', error);
      toast.error('Failed to delete listing. Please try again.');
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (listingIds) => {
      const { error } = await supabase
        .from('listings')
        .delete()
        .in('id', listingIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-listings'] });
      setSelectedListings([]);
      toast.success('Listings deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete listings:', error);
      toast.error('Failed to delete listings. Please try again.');
    },
  });

  // Bulk update status mutation
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ listingIds, status }) => {
      const { error } = await supabase
        .from('listings')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', listingIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-listings'] });
      setSelectedListings([]);
      toast.success('Listings updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update listings:', error);
      toast.error('Failed to update listings. Please try again.');
    },
  });

  // Duplicate listing mutation
  const duplicateListingMutation = useMutation({
    mutationFn: async (listing) => {
      const { id, created_at, updated_at, created_by, ...listingData } = listing;
      
      const { data, error } = await supabase
        .from('listings')
        .insert({
          ...listingData,
          title: `${listing.title} (Copy)`,
          status: 'draft',
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-listings'] });
      toast.success('Listing duplicated successfully');
    },
    onError: (error) => {
      console.error('Failed to duplicate listing:', error);
      toast.error('Failed to duplicate listing. Please try again.');
    },
  });

  const handleDeleteListing = (listing) => {
    if (window.confirm(`Are you sure you want to delete "${listing.title}"? This action cannot be undone.`)) {
      deleteListingMutation.mutate(listing.id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedListings.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedListings.length} listing(s)? This action cannot be undone.`)) {
      bulkDeleteMutation.mutate(selectedListings);
    }
  };

  const handleBulkActivate = () => {
    if (selectedListings.length === 0) return;
    bulkUpdateStatusMutation.mutate({ listingIds: selectedListings, status: 'active' });
  };

  const handleBulkDeactivate = () => {
    if (selectedListings.length === 0) return;
    bulkUpdateStatusMutation.mutate({ listingIds: selectedListings, status: 'paused' });
  };

  const handleDuplicate = (listing) => {
    duplicateListingMutation.mutate(listing);
  };

  const toggleSelectListing = (listingId) => {
    setSelectedListings(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleEditListing = (listing) => {
    window.location.href = `${createPageUrl('CreateListing')}?edit=${listing.id}`;
  };

  const handleSaveProfile = () => {
    if (!editedName || editedName.trim().length === 0) {
      toast.error('Name cannot be empty');
      return;
    }
    updateProfileMutation.mutate({ 
      full_name: editedName.trim(),
      phone_number: editedPhone.trim(),
      address: editedAddress.trim(),
      city: editedCity.trim(),
      state: editedState.trim(),
      zip_code: editedZip.trim(),
      country: editedCountry.trim(),
      bio: editedBio.trim(),
      how_heard_about_us: editedHowHeard,
      receive_newsletter: editedNewsletter,
      social_instagram: editedSocialInstagram.trim(),
      social_facebook: editedSocialFacebook.trim(),
      social_twitter: editedSocialTwitter.trim(),
      social_linkedin: editedSocialLinkedin.trim(),
      social_tiktok: editedSocialTiktok.trim(),
    });
  };


  // Filter helpers
  const toggleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map(l => l.id));
    }
  };

  // Loading state
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

  if (!isAuthenticated || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  const CATEGORY_LABELS = {
    food_truck: 'Food Truck',
    food_trailer: 'Food Trailer',
    ghost_kitchen: 'Ghost Kitchen',
    vendor_lot: 'Vendor Lot',
    equipment: 'Equipment',
    other: 'Other',
  };

  // Filter and search listings
  const filteredListings = myListings.filter((listing) => {
    const matchesStatus = listingFilter === 'all' || listing.status === listingFilter;
    const matchesCategory = categoryFilter === 'all' || listing.asset_category === categoryFilter;
    const matchesSearch = !searchQuery || 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-green-100 text-green-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  // Combined user data for display (profile takes precedence)
  const displayUser = {
    ...user,
    ...userProfile,
    identity_verified: userProfile?.identity_verification_status === 'verified',
    created_date: userProfile?.created_at || user?.created_at
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 md:pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-[#FF5124] rounded-full flex items-center justify-center relative">
                <span className="text-white text-2xl font-bold">
                  {displayUser.full_name?.charAt(0) || 'U'}
                </span>
                {displayUser.identity_verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-slate-900">{displayUser.full_name || 'User'}</h1>
                  {displayUser.identity_verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-slate-500">{displayUser.email}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Personal Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-[#FF5124] hover:text-[#e5481f]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">{isEditing ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      <div>
                        <Label>Full Name *</Label>
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          type="tel"
                          value={editedPhone}
                          onChange={(e) => setEditedPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Bio</Label>
                        <Textarea
                          value={editedBio}
                          onChange={(e) => setEditedBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div className="pt-2">
                        <Label className="text-sm font-semibold">Address</Label>
                        <div className="space-y-3 mt-2">
                          <Input
                            value={editedAddress}
                            onChange={(e) => setEditedAddress(e.target.value)}
                            placeholder="Street address"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={editedCity}
                              onChange={(e) => setEditedCity(e.target.value)}
                              placeholder="City"
                            />
                            <Input
                              value={editedState}
                              onChange={(e) => setEditedState(e.target.value)}
                              placeholder="State"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={editedZip}
                              onChange={(e) => setEditedZip(e.target.value)}
                              placeholder="ZIP code"
                            />
                            <Input
                              value={editedCountry}
                              onChange={(e) => setEditedCountry(e.target.value)}
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>How did you hear about us?</Label>
                        <Select value={editedHowHeard} onValueChange={setEditedHowHeard}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="search_engine">Search Engine</SelectItem>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="friend_referral">Friend Referral</SelectItem>
                            <SelectItem value="advertisement">Advertisement</SelectItem>
                            <SelectItem value="news_article">News Article</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <Checkbox
                          id="newsletter"
                          checked={editedNewsletter}
                          onCheckedChange={setEditedNewsletter}
                        />
                        <Label htmlFor="newsletter" className="cursor-pointer flex-1 text-sm">
                          I want to receive newsletters and updates
                        </Label>
                      </div>


                      <div className="pt-2">
                        <Label className="text-sm font-semibold">Social Media (Optional)</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-slate-400" />
                            <Input
                              value={editedSocialInstagram}
                              onChange={(e) => setEditedSocialInstagram(e.target.value)}
                              placeholder="Instagram URL"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Facebook className="w-4 h-4 text-slate-400" />
                            <Input
                              value={editedSocialFacebook}
                              onChange={(e) => setEditedSocialFacebook(e.target.value)}
                              placeholder="Facebook URL"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Twitter className="w-4 h-4 text-slate-400" />
                            <Input
                              value={editedSocialTwitter}
                              onChange={(e) => setEditedSocialTwitter(e.target.value)}
                              placeholder="Twitter/X URL"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4 text-slate-400" />
                            <Input
                              value={editedSocialLinkedin}
                              onChange={(e) => setEditedSocialLinkedin(e.target.value)}
                              placeholder="LinkedIn URL"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                            <Input
                              value={editedSocialTiktok}
                              onChange={(e) => setEditedSocialTiktok(e.target.value)}
                              placeholder="TikTok URL"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isPending}
                          className="bg-[#FF5124] hover:bg-[#e5481f] flex-1"
                        >
                          {updateProfileMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            initializeEditFields(userProfile);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-slate-600">
                        <User className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Full Name</p>
                          <p className="font-medium text-slate-900">{displayUser.full_name || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="font-medium text-slate-900">{displayUser.email}</p>
                        </div>
                      </div>
                      
                      {displayUser.phone_number && (
                        <div className="flex items-center gap-3 text-slate-600">
                          <Phone className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Phone</p>
                            <p className="font-medium text-slate-900">{displayUser.phone_number}</p>
                          </div>
                        </div>
                      )}

                      {(displayUser.address || displayUser.city) && (
                        <div className="flex items-start gap-3 text-slate-600">
                          <Home className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500">Address</p>
                            <p className="font-medium text-slate-900 text-sm">
                              {displayUser.address && <>{displayUser.address}<br /></>}
                              {displayUser.city && displayUser.state && `${displayUser.city}, ${displayUser.state} `}
                              {displayUser.zip_code}
                              {displayUser.country && <><br />{displayUser.country}</>}
                            </p>
                          </div>
                        </div>
                      )}

                      {displayUser.bio && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Bio</p>
                          <p className="text-sm text-slate-900">{displayUser.bio}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 text-slate-600">
                        <Shield className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Role</p>
                          <Badge className="mt-1 capitalize">{displayUser.role || 'user'}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Member Since</p>
                          <p className="font-medium text-slate-900">
                            {displayUser.created_date ? format(new Date(displayUser.created_date), 'MMM yyyy') : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {(displayUser.social_instagram || displayUser.social_facebook || displayUser.social_twitter || displayUser.social_linkedin || displayUser.social_tiktok) && (
                        <div className="pt-2">
                          <p className="text-xs text-slate-500 mb-2">Social Media</p>
                          <div className="flex gap-2 flex-wrap">
                            {displayUser.social_instagram && (
                              <a href={displayUser.social_instagram} target="_blank" rel="noopener noreferrer" 
                                className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                                <Instagram className="w-4 h-4 text-white" />
                              </a>
                            )}
                            {displayUser.social_facebook && (
                              <a href={displayUser.social_facebook} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                                <Facebook className="w-4 h-4 text-white" />
                              </a>
                            )}
                            {displayUser.social_twitter && (
                              <a href={displayUser.social_twitter} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 bg-black rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                                <Twitter className="w-4 h-4 text-white" />
                              </a>
                            )}
                            {displayUser.social_linkedin && (
                              <a href={displayUser.social_linkedin} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                                <Linkedin className="w-4 h-4 text-white" />
                              </a>
                            )}
                            {displayUser.social_tiktok && (
                              <a href={displayUser.social_tiktok} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 bg-black rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                                <MessageSquare className="w-4 h-4 text-white" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>


              {/* Identity Verification Section */}
              {!isEditing && (
                <div className="mt-6 relative">
                  {/* Show blurred/locked state if profile incomplete */}
                  {!(displayUser.full_name && displayUser.phone_number && displayUser.address) && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                      <Card className="border-blue-200 bg-blue-50 shadow-lg max-w-md">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Complete Your Profile First</h3>
                            <p className="text-sm text-slate-600 mb-4">
                              Please add your name, phone number, and address to unlock identity verification.
                            </p>
                            <Button
                              onClick={() => setIsEditing(true)}
                              className="bg-[#FF5124] hover:bg-[#e5481f]"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Complete Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {/* Always render the component (blurred when locked) */}
                  <div className={!(displayUser.full_name && displayUser.phone_number && displayUser.address) ? 'opacity-30 pointer-events-none' : ''}>
                    <StripeIdentityVerification user={displayUser} />
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userReviews.length > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Average Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-900">
                            {(userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Total Reviews</span>
                        <span className="font-semibold text-slate-900">{userReviews.length}</span>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Listings</span>
                    <span className="font-semibold text-slate-900">
                      {myListings.filter(l => l.status === 'active').length}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Bookings</span>
                    <span className="font-semibold text-slate-900">{myBookings.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Bookings Received</span>
                    <span className="font-semibold text-slate-900">{hostBookings.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Listings and Bookings */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="listings" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="listings">
                    My Listings ({myListings.length})
                  </TabsTrigger>
                  <TabsTrigger value="bookings">
                    My Bookings ({myBookings.length})
                  </TabsTrigger>
                  <TabsTrigger value="received">
                    Received ({hostBookings.length})
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews ({userReviews.length})
                  </TabsTrigger>
                </TabsList>

                {/* My Listings Tab */}
                <TabsContent value="listings" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <CardTitle>My Listings ({filteredListings.length})</CardTitle>
                          <Link to={createPageUrl('CreateListing')}>
                            <Button className="bg-[#FF5124] hover:bg-[#e5481f]">
                              Create Listing
                            </Button>
                          </Link>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              placeholder="Search listings..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <Select value={listingFilter} onValueChange={setListingFilter}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="sold">Sold</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-[170px]">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              <SelectItem value="food_truck">Food Truck</SelectItem>
                              <SelectItem value="food_trailer">Food Trailer</SelectItem>
                              <SelectItem value="ghost_kitchen">Ghost Kitchen</SelectItem>
                              <SelectItem value="vendor_lot">Vendor Lot</SelectItem>
                              <SelectItem value="equipment">Equipment</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>


                        {/* Bulk Actions */}
                        {selectedListings.length > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="text-sm font-medium text-blue-900">
                              {selectedListings.length} selected
                            </span>
                            <div className="flex gap-2 ml-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBulkActivate}
                                disabled={bulkUpdateStatusMutation.isPending}
                                className="bg-white"
                              >
                                <Power className="w-4 h-4 mr-1" />
                                Activate
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBulkDeactivate}
                                disabled={bulkUpdateStatusMutation.isPending}
                                className="bg-white"
                              >
                                <PowerOff className="w-4 h-4 mr-1" />
                                Deactivate
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={bulkDeleteMutation.isPending}
                                className="bg-white text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {myListings.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-slate-500">No listings yet</p>
                          <Link to={createPageUrl('CreateListing')}>
                            <Button variant="outline" className="mt-4">
                              Create your first listing
                            </Button>
                          </Link>
                        </div>
                      ) : filteredListings.length === 0 ? (
                        <div className="text-center py-12">
                          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-slate-500">No listings match your filters</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => {
                              setListingFilter('all');
                              setCategoryFilter('all');
                              setSearchQuery('');
                            }}
                          >
                            Clear filters
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Select All */}
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Checkbox
                              checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                            <span className="text-sm text-slate-600">Select all</span>
                          </div>

                          {filteredListings.map((listing) => (
                            <div key={listing.id} className="space-y-3">
                              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <Checkbox
                                  checked={selectedListings.includes(listing.id)}
                                  onCheckedChange={() => toggleSelectListing(listing.id)}
                                />
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                {listing.media?.[0] ? (
                                  <img
                                    src={listing.media[0]}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 truncate">{listing.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {CATEGORY_LABELS[listing.asset_category]}
                                  </Badge>
                                  <Badge className={`text-xs ${
                                    listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                    listing.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {listing.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                  {listing.listing_mode === 'rent'
                                    ? `$${listing.daily_price || 0}/day`
                                    : `$${listing.sale_price?.toLocaleString() || 0}`
                                  }
                                </p>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setExpandedAnalytics(expandedAnalytics === listing.id ? null : listing.id)}
                                  title="View analytics"
                                >
                                  {expandedAnalytics === listing.id ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDuplicate(listing)}
                                  disabled={duplicateListingMutation.isPending}
                                  title="Duplicate listing"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditListing(listing)}
                                  title="Edit listing"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Link to={`${createPageUrl('ListingDetail')}?id=${listing.id}`}>
                                  <Button variant="outline" size="sm" title="View listing">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteListing(listing)}
                                  disabled={deleteListingMutation.isPending}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete listing"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Analytics Dropdown */}
                            {expandedAnalytics === listing.id && (
                              <div className="p-4 bg-white border rounded-xl">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3">Analytics</h4>
                                <ListingAnalytics listingId={listing.id} />
                              </div>
                            )}
                          </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>


                {/* My Bookings Tab */}
                <TabsContent value="bookings" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Bookings</CardTitle>
                      <CardDescription>Bookings you've made as a guest</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {myBookings.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-slate-500">No bookings yet</p>
                          <Link to={createPageUrl('SearchResults')}>
                            <Button variant="outline" className="mt-4">
                              Browse listings
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {myBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="p-4 bg-gray-50 rounded-xl"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-slate-900">
                                    Booking #{booking.id.slice(0, 8)}
                                  </h3>
                                  <p className="text-sm text-slate-500 mt-1">
                                    {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                <Badge className={`${statusColors[booking.status]}`}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">{booking.total_days} days</span>
                                <span className="font-semibold text-slate-900">
                                  ${booking.total_amount?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Received Bookings Tab */}
                <TabsContent value="received" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Received Bookings</CardTitle>
                      <CardDescription>Bookings for your listings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hostBookings.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-slate-500">No bookings received yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {hostBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="p-4 bg-gray-50 rounded-xl"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-slate-900">
                                    {booking.guest_name}
                                  </h3>
                                  <p className="text-sm text-slate-500">{booking.guest_email}</p>
                                  <p className="text-sm text-slate-500 mt-1">
                                    {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                <Badge className={`${statusColors[booking.status]}`}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">{booking.total_days} days</span>
                                <span className="font-semibold text-slate-900">
                                  ${booking.total_amount?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Reviews</CardTitle>
                      <CardDescription>Reviews from buyers and sellers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <UserReviewsList reviews={userReviews} showResponses={true} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
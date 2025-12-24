import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  User, Mail, MapPin, Calendar, Star, Shield, CheckCircle, 
  MessageSquare, Package, TrendingUp, Award, Loader2,
  Instagram, Facebook, Twitter, Linkedin, MessageSquare as TikTok
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import ListingCard from '../components/listings/ListingCard';
import UserReviewsList from '../components/reviews/UserReviewsList';

export default function PublicProfile() {
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
    }
  };

  // Fetch profile user data
  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: ['public-profile-user', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const users = await base44.entities.User.filter({ email: userEmail });
      return users[0] || null;
    },
    enabled: !!userEmail,
  });

  // Fetch user's listings
  const { data: userListings = [] } = useQuery({
    queryKey: ['public-profile-listings', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return await base44.entities.Listing.filter({ 
        created_by: userEmail,
        status: 'active'
      }, '-created_date');
    },
    enabled: !!userEmail,
  });

  // Fetch user reviews
  const { data: userReviews = [] } = useQuery({
    queryKey: ['public-profile-reviews', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return await base44.entities.UserReview.filter({ 
        reviewed_user_email: userEmail,
        status: 'published'
      }, '-created_date');
    },
    enabled: !!userEmail,
  });

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">User not found</h3>
              <p className="text-slate-600">Please provide a valid user email.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">User not found</h3>
              <p className="text-slate-600">This user does not exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const initials = profileUser.full_name
    ? profileUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : profileUser.email[0].toUpperCase();

  const avgRating = userReviews.length > 0
    ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
    : 0;

  const isOwnProfile = currentUser?.email === profileUser.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 md:pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Profile Header Card */}
          <Card className="mb-8 overflow-hidden">
            {/* Cover Photo */}
            <div className="h-32 bg-gradient-to-r from-[#FF5124] to-[#ff7a5c]" />
            
            <CardContent className="relative pt-0 pb-6">
              {/* Profile Photo */}
              <div className="flex flex-col sm:flex-row items-start gap-6 -mt-16 sm:-mt-12">
                <div className="relative">
                  <div className="w-32 h-32 bg-white rounded-full p-2 shadow-xl">
                    <div className="w-full h-full bg-[#FF5124] rounded-full flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">{initials}</span>
                    </div>
                  </div>
                  {profileUser.identity_verification_status === 'verified' && (
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 sm:mt-12 space-y-4">
                  {/* Name and Badges */}
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                        {profileUser.full_name || 'Anonymous User'}
                      </h1>
                      {profileUser.identity_verification_status === 'verified' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {profileUser.role === 'admin' && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 flex-wrap text-sm text-slate-600">
                      {userReviews.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-slate-900">{avgRating}</span>
                          <span>({userReviews.length} reviews)</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{userListings.length} listings</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {format(new Date(profileUser.created_date), 'MMM yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {profileUser.bio && (
                    <p className="text-slate-700 max-w-2xl">{profileUser.bio}</p>
                  )}

                  {/* Location */}
                  {(profileUser.city || profileUser.state) && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {profileUser.city}
                        {profileUser.city && profileUser.state && ', '}
                        {profileUser.state}
                      </span>
                    </div>
                  )}

                  {/* Social Media */}
                  {(profileUser.social_instagram || profileUser.social_facebook || 
                    profileUser.social_twitter || profileUser.social_linkedin || 
                    profileUser.social_tiktok) && (
                    <div className="flex gap-2 flex-wrap">
                      {profileUser.social_instagram && (
                        <a href={profileUser.social_instagram} target="_blank" rel="noopener noreferrer" 
                          className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                          <Instagram className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {profileUser.social_facebook && (
                        <a href={profileUser.social_facebook} target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                          <Facebook className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {profileUser.social_twitter && (
                        <a href={profileUser.social_twitter} target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 bg-black rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                          <Twitter className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {profileUser.social_linkedin && (
                        <a href={profileUser.social_linkedin} target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                          <Linkedin className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {profileUser.social_tiktok && (
                        <a href={profileUser.social_tiktok} target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 bg-black rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                          <TikTok className="w-5 h-5 text-white" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  {isOwnProfile ? (
                    <Link to={createPageUrl('Profile')}>
                      <Button variant="outline" className="rounded-xl">
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <Button className="bg-[#FF5124] hover:bg-[#e5481f] rounded-xl">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl shadow-sm p-1">
              <TabsTrigger value="listings" className="rounded-lg">
                Listings ({userListings.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg">
                Reviews ({userReviews.length})
              </TabsTrigger>
              <TabsTrigger value="about" className="rounded-lg">
                About
              </TabsTrigger>
            </TabsList>

            {/* Listings Tab */}
            <TabsContent value="listings" className="mt-6">
              {userListings.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-20 text-center">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No listings yet</h3>
                    <p className="text-slate-600">This user hasn't created any listings.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Reviews</CardTitle>
                  {userReviews.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="text-2xl font-bold text-slate-900">{avgRating}</span>
                      </div>
                      <span className="text-slate-600">({userReviews.length} reviews)</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <UserReviewsList reviews={userReviews} showResponses={true} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium text-slate-900">{profileUser.email}</p>
                      </div>
                    </div>
                    
                    {(profileUser.city || profileUser.state) && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Location</p>
                          <p className="font-medium text-slate-900">
                            {profileUser.city}
                            {profileUser.city && profileUser.state && ', '}
                            {profileUser.state}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Member Since</p>
                        <p className="font-medium text-slate-900">
                          {format(new Date(profileUser.created_date), 'MMMM yyyy')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profileUser.identity_verification_status === 'verified' && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Identity Verified</p>
                          <p className="text-xs text-slate-600">Confirmed by Stripe Identity</p>
                        </div>
                      </div>
                    )}

                    {userReviews.length >= 10 && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Highly Reviewed</p>
                          <p className="text-xs text-slate-600">Received 10+ reviews</p>
                        </div>
                      </div>
                    )}

                    {userListings.length >= 5 && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Power Host</p>
                          <p className="text-xs text-slate-600">5+ active listings</p>
                        </div>
                      </div>
                    )}

                    {profileUser.role === 'admin' && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Admin</p>
                          <p className="text-xs text-slate-600">Vendibook team member</p>
                        </div>
                      </div>
                    )}

                    {!profileUser.identity_verification_status && userReviews.length < 10 && 
                     userListings.length < 5 && profileUser.role !== 'admin' && (
                      <div className="text-center py-8">
                        <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No achievements yet</p>
                      </div>
                    )}
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
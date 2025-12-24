import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Menu, User, LogOut, LayoutDashboard, Plus, Calendar, DollarSign, TrendingUp, Shield, Heart, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import SearchModal from '../search/SearchModal';
import NotificationsDropdown from '../notifications/NotificationsDropdown';

export default function Header() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    checkAuth();
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const userData = await base44.auth.me();
      setUser(userData);
    }
  };

  const handleCreateListing = () => {
    if (isAuthenticated) {
      window.location.href = createPageUrl('HostOnboarding');
    } else {
      base44.auth.redirectToLogin(createPageUrl('HostOnboarding'));
    }
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex-shrink-0">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/fdd825e98_VendibookOfficialFavicon2026.jpg"
                alt="Vendibook"
                className="h-8 md:h-10 w-auto"
              />
            </Link>

            {/* Center Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <button
                onClick={() => setShowSearchModal(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors"
                aria-label="Open search for food trucks, trailers, ghost kitchens, or equipment"
              >
                <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
                <span className="text-gray-500 text-sm">Search food trucks, trailers, ghost kitchens, or equipment</span>
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Mobile Search */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                aria-label="Open search modal"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* Notifications */}
              {isAuthenticated && user && (
                <NotificationsDropdown userEmail={user.email} />
              )}

              {/* Create Listing CTA */}
              <Button
                onClick={handleCreateListing}
                className="hidden sm:flex bg-[#FF5124] hover:bg-[#e5481f] text-white rounded-full px-4 py-2 font-medium"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Become a Host
              </Button>

              {/* Auth Actions */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full border border-gray-200"
                      aria-label="Open user menu"
                      aria-expanded="false"
                    >
                      <Menu className="w-4 h-4 text-gray-600" />
                      <div className="w-7 h-7 bg-[#FF5124] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium" aria-hidden="true">
                          {user?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 max-h-[calc(100vh-100px)] overflow-y-auto">
                    {/* User Info Header - Sticky */}
                    <div className="sticky top-0 bg-white z-10 px-3 py-2 mb-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#FF5124] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {user?.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name || 'User'}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Account Section */}
                    <div className="mb-1">
                      <div className="px-3 py-1">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Account</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Profile')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors">
                          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors">
                          <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                            <LayoutDashboard className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-2" />

                    {/* Activity Section */}
                    <div className="mb-1">
                      <div className="px-3 py-1">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Activity</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('MyBookings')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors">
                          <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5 text-orange-600" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">My Bookings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Messages')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors">
                          <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-slate-700">Messages</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('SavedListings')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors">
                          <div className="w-7 h-7 bg-pink-50 rounded-lg flex items-center justify-center">
                            <Heart className="w-3.5 h-3.5 text-pink-600" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">Saved</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-2" />

                    {/* Host Tools */}
                    <div className="mb-1">
                      <div className="px-3 py-1">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Host Tools</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Analytics')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors">
                          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">Analytics</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('PayoutsPage')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors">
                          <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">Payouts</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-2" />

                    {/* Tools */}
                    <div className="mb-1">
                      <div className="px-3 py-1">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tools</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AIAssistant')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors">
                          <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">AI Assistant</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('PaymentHistory')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors">
                          <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-slate-700">Payments</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-2" />

                    {/* Help */}
                    <div className="mb-1">
                      <div className="px-3 py-1">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Support</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('HelpCenter')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors">
                          <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-slate-700">Help Center</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    {/* Admin Section */}
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator className="my-1" />
                        <div className="mb-1">
                          <div className="px-3 py-1">
                            <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Admin</p>
                          </div>
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl('AdminListingVerification')} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-red-50 transition-colors">
                              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                                <Shield className="w-3.5 h-3.5 text-red-600" />
                              </div>
                              <span className="text-xs font-medium text-red-700">Verify Listings</span>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </>
                    )}

                    <DropdownMenuSeparator className="my-1" />

                    {/* Sign Out */}
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-red-50 transition-colors">
                      <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                      </div>
                      <span className="text-xs font-medium text-red-600">Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => base44.auth.redirectToLogin()}
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    variant="outline"
                    className="hidden sm:inline-flex rounded-full border-gray-300"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 text-sm">Search assets...</span>
            </button>
          </div>
        </div>
      </header>

      <SearchModal open={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </>
  );
}
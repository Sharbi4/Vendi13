import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import {
  Search, MapPin, Truck, UtensilsCrossed, Building2,
  Wrench, Package, ParkingCircle, Shield, Clock, Headphones, ArrowRight,
  ChevronRight } from
'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ListingCard from '../components/listings/ListingCard';
import SearchModal from '../components/search/SearchModal';
import EventProsPopup from '../components/modals/EventProsPopup';
import NewsletterSignup from '../components/newsletter/NewsletterSignup';

const CATEGORIES = [
{ id: 'food_truck', label: 'Food Trucks', icon: Truck, image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/83b32595d_karl-muscat-exz4cpNZEjY-unsplash1.jpg' },
{ id: 'food_trailer', label: 'Food Trailers', icon: UtensilsCrossed, image: 'https://images.unsplash.com/photo-1567129937968-cdad8f07e2f8?w=600' },
{ id: 'ghost_kitchen', label: 'Ghost Kitchens', icon: Building2, image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/7f1cf903c_barbara-burgess-v9jraQ0tM9A-unsplash.jpg' },
{ id: 'vendor_lot', label: 'Vendor Lots', icon: ParkingCircle, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
{ id: 'equipment', label: 'Equipment', icon: Wrench, image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/9f8e5f231_deepthi-clicks-dXBD--2XgNU-unsplash1.jpg' },
{ id: 'other', label: 'Other Assets', icon: Package, image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/47bf29737_joshua-tsu-02mWrtCxMSM-unsplash.jpg' }];


const TRUST_ITEMS = [
{ icon: Shield, title: 'Secure Transactions', desc: 'Every booking is protected with our secure payment system' },
{ icon: Clock, title: 'Instant Booking', desc: 'Book assets instantly or send booking requests to hosts' },
{ icon: Headphones, title: '24/7 Support', desc: 'Our team is here to help you every step of the way' }];


export default function Home() {
  const [showSearchModal, setShowSearchModal] = useState(false);

  const { data: featuredListings = [] } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ status: 'active' }, '-created_date', 6);
      return listings;
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 md:pt-28 pb-16 md:pb-24 bg-gradient-to-br from-slate-50 to-orange-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <motion.img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/0c53b4695_25c425f5-dd2e-45b8-bc8b-2978838cf387_20251220_000850_0000.png"
              alt="Vendibook"
              className="h-32 md:h-40 lg:h-48 mx-auto mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }} />


            <motion.p className="text-lg md:text-xl text-slate-600 mb-8"

            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}>Rent or buy food trucks, trailers, ghost kitchens, and mobile kitchens


            </motion.p>

            {/* Hero Search */}
            <motion.button
              onClick={() => setShowSearchModal(true)}
              className="w-full max-w-2xl mx-auto flex items-center gap-4 px-6 py-4 bg-white shadow-lg hover:shadow-xl rounded-full border border-gray-100 transition-all group"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>

              <Search className="w-5 h-5 text-gray-400 group-hover:text-[#FF5124] transition-colors" />
              <span className="text-gray-500 text-left flex-1">Search food trucks, trailers, ghost kitchens, or equipment</span>
              <div className="bg-[#FF5124] text-white px-4 py-2 rounded-full text-sm font-medium">
                Search
              </div>
            </motion.button>

            {/* Quick Category Pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}>

              {CATEGORIES.slice(0, 4).map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 + idx * 0.1 }}>

                    <Link
                      to={`${createPageUrl('SearchResults')}?category=${cat.id}&mode=rent`}
                      className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-gray-200 hover:border-[#FF5124] hover:text-[#FF5124] transition-all text-sm text-slate-700">

                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </Link>
                  </motion.div>);

              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Explore Categories</h2>
            <Link
              to={createPageUrl('SearchResults')}
              className="text-[#FF5124] hover:text-[#e5481f] font-medium flex items-center gap-1">

              Browse all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`${createPageUrl('SearchResults')}?category=${cat.id}&mode=rent`}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden">

                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 text-white">
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{cat.label}</span>
                    </div>
                  </div>
                </Link>);

            })}
          </div>
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Rent CTA */}
            <Link
              to={`${createPageUrl('SearchResults')}?mode=rent`}
              className="group relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[4/3]">

              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/2dc5f6e71_a-n-v-e-s-h--0K-RcWEuFU-unsplash.jpg"
                alt="Rent assets"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Rentals
                </h3>
                <p className="text-white/80 mb-4">Find food trucks and equipment for your next event</p>
                <div className="flex items-center gap-2 text-[#FF5124] font-medium">
                  Browse rentals <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Buy CTA */}
            <Link to={`${createPageUrl('SearchResults')}?mode=sale`}
            className="group relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[4/3]">

              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/cc2143010_adam-gonzales-h_v53lHosJY-unsplash.jpg"
                alt="Buy assets"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">For Sale
                </h3>
                <p className="text-white/80 mb-4">Purchase food trucks, trailers, and equipment for sale</p>
                <div className="flex items-center gap-2 text-[#FF5124] font-medium">
                  Browse for sale <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Featured Listings</h2>
              <Link
              to={createPageUrl('SearchResults')}
              className="text-[#FF5124] hover:text-[#e5481f] font-medium flex items-center gap-1">

                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) =>
            <ListingCard key={listing.id} listing={listing} />
            )}
            </div>
          </div>
        </section>
      }

      {/* Trust Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            Why Choose Vendibook
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TRUST_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-[#FF5124]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-[#FF5124]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>);

            })}
          </div>
        </div>
      </section>

      {/* List Your Asset CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Ready to list your asset?
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of hosts earning income by renting or selling their food trucks, trailers, and equipment.
          </p>
          <Link to={createPageUrl('CreateListing')}>
            <Button className="bg-[#FF5124] hover:bg-[#e5481f] text-white px-8 py-6 rounded-full text-lg font-medium">
              Create a Listing
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-orange-50 to-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <NewsletterSignup />
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <SearchModal open={showSearchModal} onClose={() => setShowSearchModal(false)} />
      <EventProsPopup />
    </div>);

}
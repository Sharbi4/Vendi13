import React, { useEffect, useState } from 'react';
import FeatureTooltip from './FeatureTooltip';

const TOOLTIPS_CONFIG = {
  dashboard_listings: {
    id: 'dashboard_listings',
    title: 'Your Listings Hub',
    description: 'Manage all your listings here. Create new ones, edit pricing, or toggle availability with just a click.',
  },
  dashboard_bookings: {
    id: 'dashboard_bookings',
    title: 'Booking Management',
    description: 'Review booking requests, confirm reservations, and track your upcoming rentals all in one place.',
  },
  dashboard_earnings: {
    id: 'dashboard_earnings',
    title: 'Track Your Earnings',
    description: 'Monitor your income, view payout history, and see detailed financial reports.',
  },
  search_filters: {
    id: 'search_filters',
    title: 'Smart Filters',
    description: 'Use filters to find exactly what you need. Filter by price, location, amenities, delivery options, and more.',
  },
  instant_book: {
    id: 'instant_book',
    title: 'Instant Book',
    description: 'Enable this to let guests book without waiting for approval. Increase your bookings by up to 3x!',
  },
  availability_calendar: {
    id: 'availability_calendar',
    title: 'Availability Calendar',
    description: 'Block dates when your asset isn\'t available. Guests can only book open dates.',
  },
  pricing_strategy: {
    id: 'pricing_strategy',
    title: 'Smart Pricing',
    description: 'Set daily, weekly, and monthly rates. Offer discounts for longer rentals to attract more bookings.',
  },
  bulk_actions: {
    id: 'bulk_actions',
    title: 'Bulk Edit',
    description: 'Select multiple listings and update their prices, status, or settings all at once. Save time!',
  },
  featured_listing: {
    id: 'featured_listing',
    title: 'Featured Listings',
    description: 'Featured listings appear at the top of search results and get 5x more views. Great for new listings!',
  },
  messaging: {
    id: 'messaging',
    title: 'Secure Messaging',
    description: 'Communicate with guests through our platform. Your contact info stays private until booking.',
  },
  verification_badge: {
    id: 'verification_badge',
    title: 'Get Verified',
    description: 'Verified listings build trust and get 2x more bookings. Submit documents to get your badge.',
  },
  analytics: {
    id: 'analytics',
    title: 'Performance Analytics',
    description: 'Track views, inquiries, bookings, and revenue. Use insights to optimize your listings.',
  },
};

export function useTooltip(tooltipId, user) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Don't show tooltips if onboarding is not completed
    if (!user.onboarding_completed) return;

    // Check if this tooltip was dismissed
    const dismissals = user.tooltip_dismissals || {};
    if (dismissals[tooltipId]) {
      setShouldShow(false);
      return;
    }

    // Show tooltip after a delay
    const timer = setTimeout(() => setShouldShow(true), 1000);
    return () => clearTimeout(timer);
  }, [tooltipId, user]);

  return shouldShow;
}

export default TOOLTIPS_CONFIG;
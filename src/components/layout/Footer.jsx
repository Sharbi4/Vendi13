import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CATEGORIES = [
  { id: 'food_truck', label: 'Food Trucks' },
  { id: 'food_trailer', label: 'Food Trailers' },
  { id: 'ghost_kitchen', label: 'Ghost Kitchens' },
  { id: 'equipment', label: 'Equipment' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69422c4cef88af5e1ed3a6cc/944eae60f_Untitleddesign-2.png"
              alt="Vendibook"
              className="h-8 mb-4"
            />
            <p className="text-slate-500 text-sm">
              The marketplace for mobile food assets
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to={`${createPageUrl('SearchResults')}?mode=rent`} className="hover:text-[#FF5124]">Rent</Link></li>
              <li><Link to={`${createPageUrl('SearchResults')}?mode=sale`} className="hover:text-[#FF5124]">Buy</Link></li>
              <li><Link to={createPageUrl('CreateListing')} className="hover:text-[#FF5124]">List Your Asset</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link to={`${createPageUrl('SearchResults')}?category=${cat.id}`} className="hover:text-[#FF5124]">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to={createPageUrl('LearnMore')} className="hover:text-[#FF5124]">How It Works</Link></li>
              <li><Link to={createPageUrl('HelpCenter')} className="hover:text-[#FF5124]">Help Center</Link></li>
              <li><Link to={createPageUrl('Insurance')} className="hover:text-[#FF5124]">Insurance Info</Link></li>
              <li><Link to={createPageUrl('TermsAndConditions')} className="hover:text-[#FF5124]">Terms & Conditions</Link></li>
              <li><Link to={createPageUrl('Privacy')} className="hover:text-[#FF5124]">Privacy Policy</Link></li>
              <li><Link to={createPageUrl('CCPADisclosure')} className="hover:text-[#FF5124]">Do Not Sell or Share My Info</Link></li>
              <li>
                <button 
                  onClick={() => window.openCookiePreferences?.()} 
                  className="hover:text-[#FF5124] text-left"
                >
                  Privacy Settings
                </button>
              </li>
              <li><a href="mailto:support@vendibook.com" className="hover:text-[#FF5124]">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Vendibook. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
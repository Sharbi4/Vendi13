import React from 'react';
import Header from '../components/layout/Header';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-[#FF5124] mb-4">404</h1>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <p className="text-slate-700 mb-6">
              Here are some helpful links instead:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Home')}>
                <Button className="w-full sm:w-auto bg-[#FF5124] hover:bg-[#e5481f]">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              <Link to={createPageUrl('SearchResults')}>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Listings
                </Button>
              </Link>
            </div>
          </div>

          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#FF5124] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </>
  );
}
import React from 'react';
import Header from '../components/layout/Header';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, RefreshCw, AlertTriangle, Mail } from 'lucide-react';

export default function ErrorPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Something Went Wrong
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              We encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <p className="text-slate-700 mb-6">
              Try one of these options:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleRefresh}
                variant="outline" 
                className="w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Link to={createPageUrl('Home')}>
                <Button className="w-full sm:w-auto bg-[#FF5124] hover:bg-[#e5481f]">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <p className="text-sm text-slate-600 mb-3">
              Still having issues? Contact our support team:
            </p>
            <a 
              href="mailto:support@vendibook.com"
              className="inline-flex items-center gap-2 text-[#FF5124] hover:underline font-medium"
            >
              <Mail className="w-4 h-4" />
              support@vendibook.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
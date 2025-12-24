import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie } from 'lucide-react';

const CONSENT_COOKIE_NAME = 'vendibook_cookie_consent';
const CONSENT_EXPIRY_DAYS = 365;

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always on
    analytics: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = getConsent();
    if (!consent) {
      setShowBanner(true);
    } else {
      // Apply stored preferences
      setPreferences(consent.preferences);
      applyConsent(consent.preferences);
    }
  }, []);

  const getConsent = () => {
    try {
      const stored = localStorage.getItem(CONSENT_COOKIE_NAME);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const saveConsent = (prefs) => {
    const consent = {
      preferences: prefs,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(consent));
    
    // Also set a cookie for backend tracking
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + CONSENT_EXPIRY_DAYS);
    document.cookie = `${CONSENT_COOKIE_NAME}=${JSON.stringify(prefs)}; expires=${expiry.toUTCString()}; path=/; SameSite=Strict`;
  };

  const applyConsent = (prefs) => {
    // Only load analytics if user consented
    if (prefs.analytics && !window.gtag) {
      loadGoogleAnalytics();
    }
    
    // Remove analytics if user rejected
    if (!prefs.analytics && window.gtag) {
      window['ga-disable-G-NNWR0V8SH2'] = true;
    }
  };

  const loadGoogleAnalytics = () => {
    // Google Analytics will be loaded by Layout.js
    // This is just a placeholder to indicate consent was given
    console.log('Analytics consent granted');
  };

  const handleAcceptAll = () => {
    const allConsent = {
      essential: true,
      analytics: true,
      functional: true
    };
    setPreferences(allConsent);
    saveConsent(allConsent);
    applyConsent(allConsent);
    setShowBanner(false);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      functional: false
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
    applyConsent(essentialOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    applyConsent(preferences);
    setShowPreferences(false);
    setShowBanner(false);
  };

  const openPreferences = () => {
    setShowBanner(false);
    setShowPreferences(true);
  };

  // Expose function to reopen preferences from footer link
  useEffect(() => {
    window.openCookiePreferences = () => setShowPreferences(true);
    return () => {
      delete window.openCookiePreferences;
    };
  }, []);

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-200 shadow-2xl p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-6 h-6 text-[#FF5124] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">We value your privacy</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Vendibook uses cookies and similar technologies to operate the platform, process bookings, 
                    analyze usage, and improve your experience. You can accept all cookies, reject non-essential 
                    cookies, or manage your preferences.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleRejectNonEssential}
                  className="w-full sm:w-auto"
                >
                  Reject Non-Essential
                </Button>
                <Button
                  variant="outline"
                  onClick={openPreferences}
                  className="w-full sm:w-auto"
                >
                  Manage Preferences
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="bg-[#FF5124] hover:bg-[#e5481f] w-full sm:w-auto"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Cookie Preferences</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <p className="text-slate-600">
              Vendibook uses the following categories of cookies:
            </p>

            {/* Essential Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label className="text-base font-semibold text-slate-900">
                    Essential Cookies
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Required for core functionality such as account login, secure payments, bookings, and fraud prevention.
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={preferences.essential}
                    disabled
                    className="opacity-50"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">Always On</span>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label htmlFor="analytics" className="text-base font-semibold text-slate-900">
                    Analytics Cookies
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Help us understand how users interact with Vendibook so we can improve performance and features.
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, analytics: checked })
                  }
                  className="ml-4"
                />
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label htmlFor="functional" className="text-base font-semibold text-slate-900">
                    Functional Cookies
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Remember your preferences and settings to enhance your experience.
                  </p>
                </div>
                <Switch
                  id="functional"
                  checked={preferences.functional}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, functional: checked })
                  }
                  className="ml-4"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 pt-4 border-t">
              You may change your preferences at any time via the "Privacy Settings" link in the footer.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPreferences(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="bg-[#FF5124] hover:bg-[#e5481f]"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function EventProsPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const currentPage = location.pathname;

  // Determine page-specific copy
  const getPageCopy = () => {
    if (currentPage.includes('SearchResults') || currentPage.includes('search')) {
      return {
        headline: "Need staff, DJ, or mobile bar too?",
        subtext: "Add an Event Pro to your booking—book local pros fast."
      };
    } else if (currentPage.includes('ListingDetail') || currentPage.includes('listing')) {
      return {
        headline: "Complete your event setup",
        subtext: "Add a DJ, mobile bar, or staff—in one step."
      };
    }
    return {
      headline: "Need a vendor to show up and serve your event?",
      subtext: "Book mobile bartenders, DJs, and event pros in minutes on Vendibook Event Pros."
    };
  };

  useEffect(() => {
    // Don't show on Event Pros pages
    if (currentPage.includes('event-pro')) return;

    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('eventProsPopupDismissed');
    if (dismissed) return;

    let triggered = false;

    // Time-based trigger: 8-12 seconds (using 10 seconds as middle)
    const timeoutId = setTimeout(() => {
      if (!triggered) {
        triggered = true;
        setIsVisible(true);
      }
    }, 10000);

    // Scroll-based trigger: 40-55% scroll (using 45% as middle)
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      if (scrollPercent >= 45 && !triggered) {
        triggered = true;
        setIsVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage]);

  const handleDismiss = () => {
    sessionStorage.setItem('eventProsPopupDismissed', 'true');
    setIsVisible(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleDismiss();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  const pageCopy = getPageCopy();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 max-w-sm w-full mx-4 md:w-96"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Header */}
            <div className="relative h-32 overflow-hidden">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/39d7fa6b3_pablo-lancaster-jones-vh7vdASlspA-unsplash.jpg"
                alt="Vendibook Event Pros"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              {/* Icon & Headline */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg border-2 border-[#FF5124] bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/08aafd3ee_VendibookOfficialFavicon2026.jpg"
                    alt="Vendibook"
                    className="w-6 h-6 rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 font-semibold text-base leading-tight mb-1">
                    {pageCopy.headline}
                  </h3>
                  <p className="text-slate-600 text-sm leading-snug">
                    {pageCopy.subtext}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <a
                  href="https://eventpros.vendibook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-[#FF5124] hover:bg-[#e5481f] text-white rounded-lg h-10 text-sm font-medium">
                    Book an Event Pro
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg h-10 px-4 text-sm"
                >
                  Not now
                </Button>
              </div>
            </div>

            {/* Sparkle Effect */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0],
                  x: [0, Math.cos(i * 30 * Math.PI / 180) * 30],
                  y: [0, Math.sin(i * 30 * Math.PI / 180) * 30]
                }}
                transition={{ 
                  duration: 3,
                  times: [0, 0.1, 0.8, 1],
                  ease: "easeOut"
                }}
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  width: '8px',
                  height: '8px',
                }}
              >
                <div className="w-2 h-2 bg-[#FF5124] rounded-full shadow-lg" 
                     style={{ boxShadow: '0 0 10px #FF5124' }} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ChevronRight, ChevronLeft, X, Search, Package, 
  Calendar, DollarSign, MessageCircle, Star 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Vendibook! 🎉',
    description: 'Your marketplace for mobile food businesses and equipment',
    icon: '👋',
    content: 'Whether you\'re looking to rent assets for your next event or purchase equipment for your business, Vendibook connects you with verified hosts and sellers nationwide.',
  },
  {
    title: 'Search & Discover',
    description: 'Find the perfect asset in seconds',
    icon: Search,
    content: 'Use powerful filters to search for food trucks, trailers, ghost kitchens, and equipment. Filter by category, location, price, amenities, delivery options, and more.',
    highlight: 'Pro tip: Use AI search to find listings with natural language',
    actionable: true,
  },
  {
    title: 'Create Your Listing',
    description: 'List your assets and start earning',
    icon: Package,
    content: 'Our step-by-step wizard makes listing easy. Add photos, set pricing, define availability, and publish in minutes. Enable Instant Book to get 3x more bookings.',
    highlight: 'Average hosts earn $2,500/month from rentals',
    actionable: true,
  },
  {
    title: 'Manage Availability',
    description: 'Full control over your calendar',
    icon: Calendar,
    content: 'Block dates when your asset isn\'t available, set minimum rental periods, and manage bookings with our visual calendar. Update pricing by season or demand.',
    highlight: 'Quick tip: Offer weekly/monthly discounts for more bookings',
  },
  {
    title: 'Communicate Securely',
    description: 'Built-in messaging system',
    icon: MessageCircle,
    content: 'Chat with guests directly in the app. Your contact info stays private until booking is confirmed. Use message templates to save time on common responses.',
    highlight: 'Hosts with 90%+ response rate get highlighted in search',
  },
  {
    title: 'Track Performance',
    description: 'Analytics and insights',
    icon: DollarSign,
    content: 'Monitor views, bookings, revenue, and guest demographics. Access detailed reports to understand what\'s working and optimize your listings.',
    highlight: 'Use analytics to adjust pricing and boost bookings',
  },
  {
    title: 'Secure Payments',
    description: 'Get paid on time, every time',
    icon: Star,
    content: 'All payments are processed through Stripe. Funds are held securely and released to you automatically. Connect your bank account to receive instant payouts.',
    highlight: 'Set up Stripe Connect to start receiving payments',
    actionable: true,
  },
  {
    title: 'You\'re All Set!',
    description: 'Ready to start your journey',
    icon: '🚀',
    content: 'You now know the basics! Complete your profile, create your first listing, and start earning. Our support team is here 24/7 if you need help.',
    highlight: 'Next step: Complete the onboarding checklist on your dashboard',
  },
];

export default function InteractiveTutorial({ open, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = typeof step.icon === 'string' ? null : step.icon;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 w-full">
          <div 
            className="h-full bg-[#FF5124] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Icon/Emoji */}
              <div className="flex justify-center">
                {Icon ? (
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    <Icon className="w-10 h-10 text-[#FF5124]" />
                  </div>
                ) : (
                  <div className="text-6xl">{step.icon}</div>
                )}
              </div>

              {/* Title & Description */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">{step.title}</h2>
                <p className="text-slate-600">{step.description}</p>
              </div>

              {/* Content */}
              <Card className="p-6 bg-gray-50 border-0">
                <p className="text-slate-700 leading-relaxed mb-4">
                  {step.content}
                </p>
                {step.highlight && (
                  <div className="flex items-center gap-2 p-3 bg-orange-100 rounded-lg">
                    <span className="text-[#FF5124] font-semibold text-sm">
                      💡 {step.highlight}
                    </span>
                  </div>
                )}
              </Card>

              {/* Step Indicator */}
              <div className="flex justify-center gap-2">
                {TUTORIAL_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep 
                        ? 'w-8 bg-[#FF5124]' 
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-slate-500">
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </span>

          <Button
            onClick={handleNext}
            className="bg-[#FF5124] hover:bg-[#e5481f] rounded-full"
          >
            {isLastStep ? (
              <>
                Get Started
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleComplete}
          className="absolute top-4 right-4 rounded-full"
        >
          Skip Tutorial
        </Button>
      </DialogContent>
    </Dialog>
  );
}
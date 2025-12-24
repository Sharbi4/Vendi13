import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, User, Package, Search, BookOpen, X, DollarSign } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ONBOARDING_STEPS = [
  {
    id: 'tutorial_viewed',
    title: 'Take the Interactive Tour',
    description: 'Learn the basics in 2 minutes',
    icon: BookOpen,
    action: 'Start Tutorial',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'profile_completed',
    title: 'Complete Your Profile',
    description: 'Add photo, bio, and contact info',
    icon: User,
    action: 'Complete Profile',
    link: createPageUrl('Profile'),
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'first_listing_created',
    title: 'Create Your First Listing',
    description: 'List an asset to start earning',
    icon: Package,
    action: 'Create Listing',
    link: createPageUrl('CreateListing'),
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'payment_method_added',
    title: 'Set Up Payouts',
    description: 'Connect Stripe to receive payments',
    icon: DollarSign,
    action: 'Set Up Payouts',
    link: createPageUrl('PayoutsPage'),
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    id: 'first_search_performed',
    title: 'Explore the Marketplace',
    description: 'Search for assets to rent or buy',
    icon: Search,
    action: 'Start Searching',
    link: createPageUrl('SearchResults'),
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
];

export default function OnboardingChecklist({ user, onDismiss, onStartTutorial }) {
  const steps = user?.onboarding_steps || {};
  const completedCount = ONBOARDING_STEPS.filter(step => steps[step.id]).length;
  const progress = (completedCount / ONBOARDING_STEPS.length) * 100;

  if (user?.onboarding_completed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-[#FF5124] shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">Welcome to Vendibook! 🎉</CardTitle>
                <p className="text-sm text-slate-600">
                  Complete these steps to get the most out of your experience
                </p>
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className="rounded-full -mt-2 -mr-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-slate-900">
                  {completedCount} of {ONBOARDING_STEPS.length} completed
                </span>
                <span className="text-slate-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ONBOARDING_STEPS.map((step) => {
              const Icon = step.icon;
              const isComplete = steps[step.id];

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    isComplete
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-[#FF5124]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{step.title}</h3>
                      {isComplete && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>

                  {!isComplete && (
                    step.id === 'tutorial_viewed' ? (
                      <Button
                        onClick={onStartTutorial}
                        size="sm"
                        className="bg-[#FF5124] hover:bg-[#e5481f] rounded-full"
                      >
                        {step.action}
                      </Button>
                    ) : (
                      <Link to={step.link}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                        >
                          {step.action}
                        </Button>
                      </Link>
                    )
                  )}
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
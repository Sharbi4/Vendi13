import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import AIAssistedListingForm from '../components/onboarding/AIAssistedListingForm';
import PayoutSetupStep from '../components/onboarding/PayoutSetupStep';
import ProfileCompletionStep from '../components/onboarding/ProfileCompletionStep';
import AnalyticsDashboardTour from '../components/onboarding/AnalyticsDashboardTour';

const STEPS = [
  { id: 'welcome', title: 'Welcome', desc: 'Get started as a host' },
  { id: 'listing', title: 'Create Listing', desc: 'AI-assisted setup' },
  { id: 'payout', title: 'Payment Setup', desc: 'Connect Stripe' },
  { id: 'profile', title: 'Complete Profile', desc: 'Tell us about yourself' },
  { id: 'analytics', title: 'Dashboard Tour', desc: 'Learn key metrics' },
];

export default function HostOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [createdListingId, setCreatedListingId] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('HostOnboarding'));
      return;
    }
    const userData = await base44.auth.me();
    setUser(userData);

    // Check if already onboarded
    if (userData.onboarding_completed) {
      navigate(createPageUrl('Dashboard'));
    }
  };

  const handleStepComplete = (stepId, data) => {
    setCompletedSteps([...completedSteps, stepId]);
    if (stepId === 'listing' && data?.listingId) {
      setCreatedListingId(data.listingId);
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = async () => {
    await base44.auth.updateMe({ onboarding_completed: true });
    navigate(createPageUrl('Dashboard'));
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />
      
      <main className="pt-32 md:pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#FF5124]" />
                  Host Onboarding
                </h1>
                <p className="text-slate-500">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="text-slate-500"
              >
                Skip for now
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Step indicators */}
            <div className="flex items-center justify-between mt-6">
              {STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-2 ${
                    idx <= currentStep ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      completedSteps.includes(step.id)
                        ? 'bg-green-500 text-white'
                        : idx === currentStep
                        ? 'bg-[#FF5124] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{idx + 1}</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 text-center hidden sm:block">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-xl border-0">
            {STEPS[currentStep].id === 'welcome' && (
              <WelcomeStep onNext={() => handleStepComplete('welcome')} user={user} />
            )}
            {STEPS[currentStep].id === 'listing' && (
              <AIAssistedListingForm
                user={user}
                onComplete={(listingId) => handleStepComplete('listing', { listingId })}
                onSkip={handleSkipStep}
              />
            )}
            {STEPS[currentStep].id === 'payout' && (
              <PayoutSetupStep
                user={user}
                onComplete={() => handleStepComplete('payout')}
                onSkip={handleSkipStep}
              />
            )}
            {STEPS[currentStep].id === 'profile' && (
              <ProfileCompletionStep
                user={user}
                onComplete={() => handleStepComplete('profile')}
                onSkip={handleSkipStep}
              />
            )}
            {STEPS[currentStep].id === 'analytics' && (
              <AnalyticsDashboardTour
                user={user}
                listingId={createdListingId}
                onComplete={handleFinish}
              />
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

function WelcomeStep({ onNext, user }) {
  return (
    <>
      <CardHeader className="text-center pb-6">
        <div className="w-20 h-20 bg-[#FF5124] rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-2xl">Welcome to Vendibook, {user?.full_name}!</CardTitle>
        <p className="text-slate-500 mt-2">
          Let's get you set up as a host in just a few minutes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">AI-Powered Setup</h3>
            <p className="text-sm text-blue-700">
              Our AI will help you create compelling listings and optimize your profile
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Secure Payments</h3>
            <p className="text-sm text-green-700">
              Connect with Stripe for fast, secure payouts directly to your account
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Analytics Dashboard</h3>
            <p className="text-sm text-purple-700">
              Track your performance with detailed insights and metrics
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-2">Instant Bookings</h3>
            <p className="text-sm text-amber-700">
              Start earning with our streamlined booking and payment system
            </p>
          </div>
        </div>

        <Button
          onClick={onNext}
          className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-lg"
        >
          Let's Get Started
        </Button>
      </CardContent>
    </>
  );
}
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Calendar, Eye, ArrowRight, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const METRICS = [
  {
    icon: DollarSign,
    title: 'Total Revenue',
    desc: 'Track your earnings from all bookings. Monitor daily, weekly, and monthly income.',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: Calendar,
    title: 'Booking Trends',
    desc: 'Visualize booking patterns over time. Identify peak seasons and optimize pricing.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: TrendingUp,
    title: 'Occupancy Rate',
    desc: 'See how often your listings are booked. Aim for 70%+ for optimal performance.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: Eye,
    title: 'Listing Views',
    desc: 'Monitor how many people view your listings. Higher views lead to more bookings.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
];

export default function AnalyticsDashboardTour({ user, listingId, onComplete }) {
  const [currentMetric, setCurrentMetric] = useState(0);

  const handleNext = () => {
    if (currentMetric < METRICS.length - 1) {
      setCurrentMetric(currentMetric + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    // Celebrate!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const metric = METRICS[currentMetric];
  const Icon = metric.icon;

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#FF5124]" />
          Your Analytics Dashboard
        </CardTitle>
        <p className="text-sm text-slate-500">
          Learn about key metrics to track your success
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {METRICS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentMetric
                  ? 'w-8 bg-[#FF5124]'
                  : idx < currentMetric
                  ? 'w-2 bg-green-500'
                  : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Current Metric */}
        <div className="text-center py-8">
          <div className={`w-20 h-20 ${metric.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-10 h-10 ${metric.color}`} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">{metric.title}</h3>
          <p className="text-slate-600 max-w-md mx-auto">{metric.desc}</p>
        </div>

        {/* Tips */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Pro Tip:</h4>
          <p className="text-sm text-blue-800">
            {currentMetric === 0 && "Set competitive pricing based on market rates and your asset's unique features."}
            {currentMetric === 1 && "Review booking trends monthly to adjust your availability and marketing strategy."}
            {currentMetric === 2 && "A higher occupancy rate means better income. Consider offering discounts for longer rentals."}
            {currentMetric === 3 && "Improve views by adding quality photos, detailed descriptions, and competitive pricing."}
          </p>
        </div>

        <div className="flex gap-3">
          {currentMetric > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentMetric(currentMetric - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className={`${currentMetric === 0 ? 'w-full' : 'flex-1'} bg-[#FF5124] hover:bg-[#e5481f]`}
          >
            {currentMetric === METRICS.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Finish Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-slate-500">
          {currentMetric + 1} of {METRICS.length}
        </p>
      </CardContent>
    </>
  );
}
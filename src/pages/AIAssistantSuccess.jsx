import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import confetti from 'canvas-confetti';

export default function AIAssistantSuccess() {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Card className="text-center shadow-xl border-2 border-purple-200">
            <CardContent className="py-12 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Welcome to AI Assistant! 🎉
              </h1>

              <p className="text-lg text-slate-600 mb-8">
                Your 7-day free trial has started. You now have access to all AI-powered hosting features.
              </p>

              <div className="bg-purple-50 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-slate-900">What's Next?</h3>
                </div>
                <ul className="text-left space-y-2 text-sm text-slate-700">
                  <li>✓ Get AI-powered responses to guest inquiries</li>
                  <li>✓ Generate professional review responses</li>
                  <li>✓ Create compelling listing descriptions</li>
                  <li>✓ Receive smart pricing recommendations</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => window.location.href = createPageUrl('Dashboard')}
                  className="bg-purple-600 hover:bg-purple-700 px-8"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = createPageUrl('AIAssistant')}
                >
                  Explore AI Features
                </Button>
              </div>

              <p className="text-xs text-slate-500 mt-6">
                You won't be charged until your trial ends. Cancel anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
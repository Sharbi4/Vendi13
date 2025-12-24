import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, Loader2, MessageSquare, Star, DollarSign, 
  FileText, Check, Crown, Zap, Calendar 
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/layout/Header';
import { format } from 'date-fns';

const FEATURES = [
  { icon: MessageSquare, title: 'Auto-Reply Suggestions', desc: 'AI-powered responses to guest inquiries' },
  { icon: Star, title: 'Review Response Generator', desc: 'Professional responses to guest reviews' },
  { icon: FileText, title: 'Listing Description Writer', desc: 'Compelling descriptions that convert' },
  { icon: DollarSign, title: 'Smart Pricing Advice', desc: 'Optimize your rates based on market data' },
];

export default function AIAssistant() {
  const [user, setUser] = useState(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin();
      return;
    }
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const origin = window.location.origin;
      const response = await base44.functions.invoke('createAIAssistantSubscription', {
        success_url: `${origin}/ai-assistant-success`,
        cancel_url: `${origin}/ai-assistant`
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to start subscription');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('cancelAIAssistantSubscription');
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to cancel subscription');
    }
  });

  const testAIMutation = useMutation({
    mutationFn: async (prompt) => {
      const response = await base44.functions.invoke('getAIAssistantResponse', {
        prompt,
        context_type: 'general'
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAiResponse(data.response);
    },
    onError: (error) => {
      if (error.response?.data?.subscription_required) {
        toast.error('Please subscribe to use AI Assistant features');
      } else {
        toast.error('Failed to get AI response');
      }
    }
  });

  const hasActiveSubscription = user?.ai_assistant_subscription_status === 'active' || 
                                 user?.ai_assistant_subscription_status === 'trialing';

  const isTrialing = user?.ai_assistant_subscription_status === 'trialing';

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      
      <main className="pt-32 md:pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Hosting
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              AI Chat Assistance
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Let AI help you respond faster, write better, and host smarter
            </p>
          </div>

          {/* Subscription Status */}
          {hasActiveSubscription && (
            <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Crown className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          AI Assistant {isTrialing ? 'Trial' : 'Active'}
                        </h3>
                        <Badge className="bg-green-100 text-green-700 border-0">
                          {isTrialing ? 'Trial Active' : 'Subscribed'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {isTrialing ? (
                          <>Trial ends {user.ai_assistant_trial_end && format(new Date(user.ai_assistant_trial_end), 'MMM dd, yyyy')}</>
                        ) : (
                          <>Next billing: {user.ai_assistant_current_period_end && format(new Date(user.ai_assistant_current_period_end), 'MMM dd, yyyy')}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-slate-600">{feature.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pricing Card */}
          {!hasActiveSubscription && (
            <Card className="max-w-lg mx-auto mb-12 border-2 border-purple-200 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Start Your Free Trial</CardTitle>
                <CardDescription>
                  Try AI Chat Assistance free for 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-slate-900">$20</span>
                    <span className="text-slate-500">/ month</span>
                  </div>
                  <p className="text-sm text-slate-500">Cancel anytime</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-slate-700">7-day free trial</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-slate-700">Unlimited AI responses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-slate-700">All features included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-slate-700">Priority support</span>
                  </div>
                </div>

                <Button
                  onClick={() => subscribeMutation.mutate()}
                  disabled={subscribeMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base font-medium"
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Start Free Trial
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-slate-500">
                  No credit card required during trial. Cancel anytime.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Try It Out Section */}
          {hasActiveSubscription && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Try AI Assistant</CardTitle>
                <CardDescription>
                  Test the AI assistant with your own prompts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Example: How should I respond to a guest asking about delivery options?"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="min-h-24"
                />
                
                <Button
                  onClick={() => testAIMutation.mutate(testPrompt)}
                  disabled={testAIMutation.isPending || !testPrompt}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {testAIMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get AI Response
                    </>
                  )}
                </Button>

                {aiResponse && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">AI Response:</p>
                    <p className="text-slate-600 whitespace-pre-wrap">{aiResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
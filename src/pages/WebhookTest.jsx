import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Webhook, CheckCircle, AlertCircle, Loader2, 
  Copy, ExternalLink, Terminal, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import Header from '../components/layout/Header';

export default function WebhookTest() {
  const [isTestingPayment, setIsTestingPayment] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const webhookUrl = 'https://vendibook.com/api/webhooks/stripe';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const testPaymentWebhook = async () => {
    setIsTestingPayment(true);
    setTestResult(null);
    
    try {
      // Create a test checkout session to trigger webhook
      const response = await base44.functions.invoke('createAddonCheckout', {
        amount: 0.50, // $0.50 test amount
        description: 'Webhook Test Payment',
        metadata: {
          test: 'true',
          type: 'webhook_test'
        }
      });

      toast.success('Test checkout created! Complete payment to trigger webhook.');
      setTestResult({
        status: 'success',
        message: 'Test checkout session created. Complete the payment to trigger webhook events.',
        checkoutUrl: response.data?.url
      });
      
    } catch (err) {
      console.error('Test error:', err);
      setTestResult({
        status: 'error',
        message: err.message || 'Failed to create test checkout'
      });
    } finally {
      setIsTestingPayment(false);
    }
  };

  const stripeCliCommands = [
    {
      title: 'Install Stripe CLI',
      command: 'brew install stripe/stripe-cli/stripe',
      description: 'Install on macOS (or download from stripe.com/docs/stripe-cli)'
    },
    {
      title: 'Login to Stripe',
      command: 'stripe login',
      description: 'Authenticate with your Stripe account'
    },
    {
      title: 'Forward Webhooks Locally',
      command: `stripe listen --forward-to ${webhookUrl}`,
      description: 'Forward webhook events to your endpoint'
    },
    {
      title: 'Trigger Test Event',
      command: 'stripe trigger payment_intent.succeeded',
      description: 'Trigger a test payment success event'
    }
  ];

  const webhookEvents = [
    { event: 'payment_intent.succeeded', description: 'Payment completed successfully' },
    { event: 'payment_intent.payment_failed', description: 'Payment failed' },
    { event: 'charge.refunded', description: 'Charge was refunded' },
    { event: 'checkout.session.completed', description: 'Checkout session completed' },
    { event: 'account.updated', description: 'Connect account updated' },
    { event: 'customer.subscription.created', description: 'Subscription created' },
    { event: 'customer.subscription.deleted', description: 'Subscription cancelled' },
    { event: 'identity.verification_session.verified', description: 'Identity verified' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <Link 
              to={createPageUrl('Dashboard')}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Webhook className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Stripe Webhook Testing</h1>
                <p className="text-slate-500">Test and monitor your webhook integration</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="config" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="test">Live Test</TabsTrigger>
              <TabsTrigger value="cli">CLI Testing</TabsTrigger>
            </TabsList>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Endpoint</CardTitle>
                  <CardDescription>Configure this endpoint in your Stripe Dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <code className="text-sm font-mono text-slate-900">{webhookUrl}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(webhookUrl)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>

                  <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Setup Instructions:</strong>
                      <ol className="list-decimal ml-4 mt-2 space-y-1">
                        <li>Go to Stripe Dashboard → Developers → Webhooks</li>
                        <li>Click "Add endpoint"</li>
                        <li>Paste the webhook URL above</li>
                        <li>Select the events listed below</li>
                        <li>Copy the signing secret and add it to your environment variables</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Events to Subscribe:</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {webhookEvents.map((item) => (
                        <div
                          key={item.event}
                          className="flex items-start gap-2 p-3 bg-white border border-slate-200 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-mono text-slate-900">{item.event}</p>
                            <p className="text-xs text-slate-500">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://dashboard.stripe.com/webhooks', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Stripe Dashboard
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Live Test Tab */}
            <TabsContent value="test" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Payment Test</CardTitle>
                  <CardDescription>Create a real test payment to trigger webhook events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm text-amber-900">
                      This will create a real Stripe checkout session with a $0.50 test charge. 
                      Use a test card (4242 4242 4242 4242) to complete the payment.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Button
                      onClick={testPaymentWebhook}
                      disabled={isTestingPayment}
                      className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                    >
                      {isTestingPayment ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating Test...
                        </>
                      ) : (
                        <>
                          <Webhook className="w-5 h-5 mr-2" />
                          Create Test Payment
                        </>
                      )}
                    </Button>

                    {testResult && (
                      <Alert className={testResult.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                        {testResult.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription>
                          {testResult.message}
                          {testResult.checkoutUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => window.open(testResult.checkoutUrl, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Complete Test Payment
                            </Button>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-2">Test Card Numbers:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Success:</span>
                        <code className="bg-white px-2 py-1 rounded">4242 4242 4242 4242</code>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Decline:</span>
                        <code className="bg-white px-2 py-1 rounded">4000 0000 0000 0002</code>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">3D Secure:</span>
                        <code className="bg-white px-2 py-1 rounded">4000 0025 0000 3155</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CLI Testing Tab */}
            <TabsContent value="cli" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stripe CLI Testing</CardTitle>
                  <CardDescription>Test webhooks locally using Stripe CLI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stripeCliCommands.map((cmd, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-900">{cmd.title}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(cmd.command)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg">
                        <code className="text-sm text-green-400 font-mono">{cmd.command}</code>
                      </div>
                      <p className="text-xs text-slate-500">{cmd.description}</p>
                    </div>
                  ))}

                  <Alert className="bg-blue-50 border-blue-200">
                    <Terminal className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-900">
                      The Stripe CLI is the recommended way to test webhooks during development. 
                      It forwards events from Stripe to your local endpoint in real-time.
                    </AlertDescription>
                  </Alert>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://stripe.com/docs/stripe-cli', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Stripe CLI Documentation
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
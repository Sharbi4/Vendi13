import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Lock, AlertCircle, Loader2 } from 'lucide-react';

// Load Stripe with publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QdMSiP3FsRmqjbkC4Gcd5QMWYlmPKDdmCE3uRYrpVt9IBGKQGWsFaF3nCkxXXqD7yVT00BRJjCIoB');

export default function PaymentForm({ amount, onPaymentComplete, isProcessing }) {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm 
        amount={amount} 
        onPaymentComplete={onPaymentComplete} 
        isProcessing={isProcessing} 
      />
    </Elements>
  );
}

function StripePaymentForm({ amount, onPaymentComplete, isProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);

      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (methodError) {
        throw new Error(methodError.message);
      }

      // In production with backend:
      // 1. Send paymentMethod.id to your backend
      // 2. Backend creates PaymentIntent with Stripe API
      // 3. Backend returns client_secret
      // 4. Frontend confirms payment with stripe.confirmCardPayment(client_secret)
      
      // For demo: simulate successful payment
      setTimeout(() => {
        onPaymentComplete({
          paymentIntentId: `pi_demo_${Date.now()}`,
          paymentMethodId: paymentMethod.id,
          status: 'succeeded',
          amount: amount
        });
        setProcessing(false);
      }, 2000);

    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666EE8',
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Lock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Your payment is secured with Stripe's industry-leading encryption
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border-2 border-gray-200 rounded-lg focus-within:border-[#FF5124] transition-colors">
            <CardElement options={cardElementOptions} />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!stripe || processing || isProcessing}
            className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-lg font-medium"
          >
            {processing || isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay ${amount.toLocaleString()}</>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Lock className="w-3 h-3" />
            <span>Secured by Stripe</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
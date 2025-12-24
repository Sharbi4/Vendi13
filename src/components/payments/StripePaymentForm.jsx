import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Lock, AlertCircle, RefreshCcw, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const ERROR_MESSAGES = {
  card_declined: 'Your card was declined. Please try a different payment method.',
  insufficient_funds: 'Insufficient funds. Please use a different card.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: 'Incorrect security code. Please check and try again.',
  incorrect_number: 'Invalid card number. Please check and try again.',
  incomplete_number: 'Please enter a complete card number.',
  incomplete_cvc: 'Please enter the security code.',
  incomplete_expiry: 'Please enter the expiration date.',
  processing_error: 'Payment processing error. Please try again.',
  authentication_required: 'Payment requires additional authentication.',
  default: 'Payment failed. Please verify your card details and try again.'
};

export default function StripePaymentForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [cardError, setCardError] = useState(null);

  const getErrorMessage = (error) => {
    if (error?.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code];
    }
    if (error?.message) {
      return error.message;
    }
    return ERROR_MESSAGES.default;
  };

  const handleCardChange = (event) => {
    if (event.error) {
      setCardError(getErrorMessage(event.error));
    } else {
      setCardError(null);
    }
  };

  const handleSubmit = async (e, isRetry = false) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError({ message: 'Payment system not ready. Please refresh the page.' });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError({ message: 'Card information missing. Please try again.' });
      return;
    }

    if (isRetry) {
      setRetryCount(prev => prev + 1);
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (methodError) {
        throw methodError;
      }

      // Simulate occasional failures for testing
      if (Math.random() < 0.15 && retryCount === 0) {
        throw {
          code: 'card_declined',
          message: 'Your card was declined'
        };
      }
      
      // For demo, simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = {
        paymentMethodId: paymentMethod.id,
        transactionId: `pi_demo_${Date.now()}`,
      };
      
      toast.success('Payment successful!');
      onSuccess(result);
      setRetryCount(0);

    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = getErrorMessage(err);
      setError({ message: errorMessage, code: err?.code });
      toast.error(errorMessage);
      
      if (onError) onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = (e) => {
    e.preventDefault();
    handleSubmit(e, true);
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
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-red-900">{error.message}</span>
                {retryCount < 3 && !isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 h-auto py-1 px-2 flex-shrink-0"
                  >
                    <RefreshCcw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                )}
              </div>
              {retryCount >= 3 && (
                <div className="text-xs text-red-800 space-y-1">
                  <p className="font-medium">Multiple attempts failed. Try:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>Verifying your card details</li>
                    <li>Using a different payment method</li>
                    <li>Contacting your bank</li>
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-5 h-5 text-slate-600" />
          <span className="font-medium text-slate-900">Card Information</span>
        </div>
        <div className={`p-4 border rounded-lg bg-white transition-colors ${
          cardError ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}>
          <CardElement 
            options={cardElementOptions}
            onChange={handleCardChange}
          />
        </div>
        {cardError && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
            <AlertCircle className="w-3 h-3" />
            {cardError}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Lock className="w-3 h-3" />
        <span>Secure payment powered by Stripe</span>
        <HelpCircle className="w-3 h-3" />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || !!cardError}
        className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {retryCount > 0 ? `Retrying (${retryCount + 1}/3)...` : 'Processing...'}
          </>
        ) : (
          `Pay $${amount.toLocaleString()}`
        )}
      </Button>

      {retryCount > 0 && !isProcessing && (
        <p className="text-xs text-center text-amber-600">
          Attempt {retryCount + 1} of 3
        </p>
      )}
    </form>
  );
}
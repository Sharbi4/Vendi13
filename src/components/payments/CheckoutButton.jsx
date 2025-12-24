import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, ShoppingCart, AlertCircle, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QdMSiP3FsRmqjbkC4Gcd5QMWYlmPKDdmCE3uRYrpVt9IBGKQGWsFaF3nCkxXXqD7yVT00BRJjCIoB');

const ERROR_MESSAGES = {
  card_declined: 'Your card was declined. Please try a different payment method.',
  insufficient_funds: 'Insufficient funds. Please use a different card.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: 'Incorrect security code. Please check and try again.',
  processing_error: 'Payment processing error. Please try again.',
  network_error: 'Network connection issue. Please check your internet and retry.',
  authentication_required: 'Payment requires additional authentication.',
  default: 'Payment failed. Please try again or use a different payment method.'
};

export default function CheckoutButton({ 
  amount, 
  description, 
  metadata = {}, 
  onSuccess,
  onError,
  buttonText = 'Checkout',
  icon = 'card',
  className = '',
  disabled = false
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const getErrorMessage = (error) => {
    if (error?.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code];
    }
    if (error?.message) {
      return error.message;
    }
    return ERROR_MESSAGES.default;
  };

  const handleCheckout = async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1);
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Import base44 client dynamically
      const { base44 } = await import('@/api/base44Client');
      
      // Create checkout session via backend
      const response = await base44.functions.invoke('createAddonCheckout', {
        amount,
        description,
        metadata
      });
      
      if (!response?.data?.url) {
        throw new Error('Failed to create checkout session');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
      
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = getErrorMessage(err);
      setError({ message: errorMessage, code: err?.code });
      toast.error(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    handleCheckout(true);
  };

  const Icon = icon === 'cart' ? ShoppingCart : CreditCard;

  return (
    <div className="space-y-3">
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-red-900">{error.message}</span>
                {retryCount < 3 && !isLoading && (
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
                <p className="text-xs text-red-800">
                  Multiple attempts failed. Please try a different payment method or contact support.
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={() => handleCheckout(false)}
        disabled={disabled || isLoading}
        className={className || 'w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-base font-medium'}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {retryCount > 0 ? `Retrying (${retryCount}/3)...` : 'Processing...'}
          </>
        ) : (
          <>
            <Icon className="w-5 h-5 mr-2" />
            {buttonText}
          </>
        )}
      </Button>

      {retryCount > 0 && !isLoading && (
        <p className="text-xs text-center text-slate-500">
          Attempt {retryCount + 1} of 3
        </p>
      )}
    </div>
  );
}
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Shield, Lock, Camera, FileText, ExternalLink, 
  CheckCircle, Clock, AlertCircle, Smartphone
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

/**
 * Production-Ready Stripe Identity FAQ Modal
 * 
 * Provides comprehensive information about the verification process
 * with accessible design and clear explanations.
 */
export default function StripeIdentityFAQModal({ open, onClose }) {
  const faqs = [
    {
      icon: Camera,
      question: 'How does identity verification work?',
      answer: (
        <div className="space-y-3">
          <p>
            VendiBook uses Stripe Identity to verify your identity securely. The process includes:
          </p>
          <div className="space-y-2 pl-3 border-l-2 border-[#FF5124]/30">
            <div>
              <p className="font-medium text-slate-900">📸 Document Capture</p>
              <p className="text-xs text-slate-600">
                Take photos of your government-issued ID (driver's license, passport, or ID card).
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-900">👤 Selfie Verification</p>
              <p className="text-xs text-slate-600">
                Take a selfie that matches the photo on your ID using biometric technology.
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-900">✅ Data Validation</p>
              <p className="text-xs text-slate-600">
                Your information is validated against secure databases.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: FileText,
      question: 'What documents are accepted?',
      answer: (
        <div className="space-y-2">
          <p>We accept the following government-issued photo IDs:</p>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Driver's License
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Passport
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              National ID Card
            </li>
          </ul>
          <p className="text-xs text-slate-500 mt-2">
            Your ID must be valid (not expired) and clearly readable.
          </p>
        </div>
      ),
    },
    {
      icon: Smartphone,
      question: 'Tips for successful verification',
      answer: (
        <div className="space-y-2">
          <p className="font-medium">For best results:</p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#FF5124]">✓</span>
              Use good lighting — avoid glare and shadows
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5124]">✓</span>
              Hold your ID flat and capture all corners
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5124]">✓</span>
              Remove glasses, hats, or masks for your selfie
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5124]">✓</span>
              Use a mobile device for best camera quality
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF5124]">✓</span>
              Ensure your face is clearly visible and centered
            </li>
          </ul>
        </div>
      ),
    },
    {
      icon: Clock,
      question: 'How long does verification take?',
      answer: (
        <p>
          Most verifications are completed within <strong>2-5 minutes</strong>. 
          In some cases, manual review may be required, which can take up to 24 hours. 
          You'll receive a notification once your verification is complete.
        </p>
      ),
    },
    {
      icon: Lock,
      question: 'Is my data secure?',
      answer: (
        <div className="space-y-2">
          <p>
            Yes, your data is protected by industry-leading security measures:
          </p>
          <ul className="space-y-1 text-sm">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-green-600 mt-0.5" />
              End-to-end encryption for all data
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-green-600 mt-0.5" />
              SOC 2 Type II certified infrastructure
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-green-600 mt-0.5" />
              GDPR and CCPA compliant
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-green-600 mt-0.5" />
              Data is never sold to third parties
            </li>
          </ul>
        </div>
      ),
    },
    {
      icon: AlertCircle,
      question: 'What if my verification fails?',
      answer: (
        <div className="space-y-2">
          <p>
            If your verification fails, you can try again. Common reasons for failure include:
          </p>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• Blurry or unclear document photos</li>
            <li>• Expired ID document</li>
            <li>• Selfie doesn't match ID photo</li>
            <li>• Poor lighting conditions</li>
          </ul>
          <p className="text-sm mt-2">
            If you continue to have issues, please{' '}
            <a 
              href="mailto:support@vendibook.com" 
              className="text-[#FF5124] hover:underline"
            >
              contact our support team
            </a>.
          </p>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF5124]/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#FF5124]" />
            </div>
            <div>
              <DialogTitle className="text-xl">Identity Verification FAQ</DialogTitle>
              <DialogDescription>
                Learn about our secure verification process
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Trust Badge */}
            <Alert className="border-blue-200 bg-blue-50">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                <strong>Powered by Stripe</strong> — trusted by millions of businesses worldwide including Amazon, Google, and Shopify.
              </AlertDescription>
            </Alert>

            {/* FAQ Items */}
            <div className="space-y-6">
              {faqs.map((faq, index) => {
                const Icon = faq.icon;
                return (
                  <div key={index}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">
                          {faq.question}
                        </h3>
                        <div className="text-sm text-slate-700">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                    {index < faqs.length - 1 && <Separator className="mt-6" />}
                  </div>
                );
              })}
            </div>

            {/* Privacy Notice */}
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600">
              <p className="font-medium text-slate-900 mb-2">Privacy & Data Usage</p>
              <p>
                We use Stripe Identity for verification services. Stripe collects identifying 
                information and uses cookies for fraud detection, authentication, and analytics. 
                Your data is processed in accordance with{' '}
                <a 
                  href="https://stripe.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#FF5124] hover:underline inline-flex items-center gap-1"
                >
                  Stripe's Privacy Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
                {' '}and our own privacy policy.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 pt-4 border-t bg-slate-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              Still have questions?{' '}
              <a
                href="mailto:support@vendibook.com"
                className="text-[#FF5124] hover:underline font-medium"
              >
                Contact Support
              </a>
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

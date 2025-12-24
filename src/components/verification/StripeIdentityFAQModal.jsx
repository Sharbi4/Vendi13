import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Lock, Camera, FileText, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StripeIdentityFAQModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-5 h-5 text-blue-600" />
            Stripe Identity Verification FAQ
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-80px)] pr-4">
          <div className="space-y-6">
            {/* Trust Badge */}
            <Alert className="border-blue-200 bg-blue-50">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                <strong>Powered by Stripe.</strong> Trusted by millions of companies worldwide including Amazon, Google, and Zoom.
              </AlertDescription>
            </Alert>

            {/* How does it work */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                How does identity verification work?
              </h3>
              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  Vendibook works with Stripe to conduct identity verification online. Stripe helps us confirm your identity by conducting the following checks:
                </p>
                
                <div className="space-y-2 pl-3 border-l-2 border-blue-200">
                  <div>
                    <p className="font-medium text-slate-900">📸 Document Verification</p>
                    <p className="text-xs">
                      Stripe captures images of your government-issued photo ID and uses automated technology to verify it's authentic.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-slate-900">👤 Selfie Verification</p>
                    <p className="text-xs">
                      Stripe captures photos of your face and matches them with your ID photo using biometric technology.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-slate-900">✅ Data Validation</p>
                    <p className="text-xs">
                      Stripe validates your name, date of birth, and ID number against global databases.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tips for a successful verification
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-medium">What you need:</p>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>Valid government-issued photo ID (not expired)</li>
                  <li>Device with a camera (mobile preferred)</li>
                </ul>
                
                <p className="font-medium mt-3">Best practices:</p>
                <div className="space-y-1.5 text-xs">
                  <p>✓ Use good lighting - avoid glare and shadows</p>
                  <p>✓ Capture clear, focused images</p>
                  <p>✓ Don't block your ID or face</p>
                  <p>✓ Remove sunglasses and masks</p>
                </div>
              </div>
            </div>

            {/* Data Access */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Who has access to my data?
              </h3>
              <p className="text-sm text-slate-700">
                Both Vendibook and Stripe have access to your verification information. Stripe uses security standards that are at least as stringent as those used for their payments compliance data.
              </p>
            </div>

            {/* Why verify */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Why verify my identity?
              </h3>
              <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                <li>Build trust with verified badge</li>
                <li>Increase booking rates</li>
                <li>Access premium features</li>
                <li>Help keep the community safe</li>
              </ul>
            </div>

            {/* Privacy */}
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-900 mb-1">Privacy & Data Usage</p>
              <p>
                We use Stripe Identity for verification services. Stripe collects identifying information and uses cookies for fraud detection, authentication, and analytics. Learn more at{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  stripe.com/privacy
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            {/* Contact */}
            <div className="border-t pt-4 text-center">
              <p className="text-sm text-slate-600 mb-2">Still have questions?</p>
              <a
                href="mailto:support@vendibook.com"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Contact Support →
              </a>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
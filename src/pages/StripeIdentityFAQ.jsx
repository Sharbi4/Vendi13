import React from 'react';
import Header from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Camera, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StripeIdentityFAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Identity Verification FAQ
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to know about our secure identity verification process powered by Stripe
            </p>
          </div>

          {/* Trust Badge */}
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Your security is our priority.</strong> Vendibook partners with Stripe, trusted by millions of companies worldwide including Amazon, Google, and Zoom.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* How does it work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-slate-600" />
                  How does identity verification work?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-700">
                <p>
                  Vendibook works with Stripe to conduct identity verification online. Stripe builds technology that's used by millions of companies around the world such as Amazon, Google, and Zoom. Stripe helps with everything from accepting payments to managing subscriptions to verifying identities.
                </p>
                
                <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">📸 Document Verification</p>
                    <p>
                      Stripe captures images of the front and back of your government-issued photo ID and reviews it to make sure that the document is authentic. They've built an automated identity verification technology that looks for patterns to help determine if a government-issued ID document is real or fake. This process is like a bank teller checking your ID document to confirm that it's real.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">👤 Selfie Verification</p>
                    <p>
                      Stripe captures photos of your face and reviews them to confirm that the photo ID belongs to you. They've built automated identity verification technology that uses distinctive physiological characteristics of your face (known as biometric identifiers) to match the photos of your face with the photo on the ID document. This process is similar to a bank teller confirming that the photo on your ID document is you based on your appearance—but it's a higher-tech and more accurate way to identify you as a unique person.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">✅ Data Validation</p>
                    <p>
                      Stripe collects your name, date of birth, and government ID number, and validates that it's real. They'll check this information against a global set of databases to confirm that it exists.
                    </p>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Stripe asks for your consent before collecting and using your biometric information. They'll only use your verification data in accordance with the permissions you grant before starting the verification process, and based on their{' '}
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>.
                  </AlertDescription>
                </Alert>

                <div className="bg-slate-50 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-slate-900 mb-2">Privacy & Data Usage</p>
                  <p>
                    We use Stripe Identity for identity verification and other business services. Stripe collects identifying information about you and the devices that connect to its services, which includes the use of cookies. Stripe uses this information to operate and improve the services it provides to us, including for fraud detection, authentication, and analytics. You can learn more about Stripe, Stripe Identity, and read its privacy policy at{' '}
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      https://stripe.com/privacy
                    </a>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  What are the best practices for a successful verification?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-700">
                <p className="font-semibold text-slate-900">Before starting the verification process, here's what you need:</p>
                
                <ul className="space-y-2 list-disc list-inside">
                  <li>A valid government-issued photo ID document. Not a photocopy or a picture of a government-issued ID document. Make sure that the ID document isn't expired.</li>
                  <li>A device with a camera—use a mobile device if possible. Cameras on mobile devices typically take higher-quality photos than a webcam.</li>
                </ul>

                <p className="font-semibold text-slate-900 mt-6">Tips for success:</p>
                
                <div className="space-y-3 pl-4 border-l-2 border-green-200">
                  <div>
                    <p className="font-medium text-slate-900">✓ Capture a clear image</p>
                    <p className="text-sm">Make sure that the images aren't too dark or bright, and don't have a glare. Hold steady and allow your camera to focus to avoid blurry photos.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-slate-900">✓ Don't block your ID</p>
                    <p className="text-sm">Don't block any part of your ID document in the image. Ideally you can lay it flat to take the photo.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-slate-900">✓ Show your full face</p>
                    <p className="text-sm">Don't block any part of your face. Remove sunglasses, masks, or other accessories.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-slate-900">✓ Use good lighting</p>
                    <p className="text-sm">Find a location with ambient lighting. Avoid spaces with strong overhead lights that cast a shadow on your face or ID document. Avoid sitting directly in front of a bright light which can wash out your face and add a glare to your ID document.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-slate-600" />
                  Who has access to my verification data?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-700">
                <p>
                  Both Vendibook and Stripe have access to the information that you submit through the verification flow. We rely on Stripe to help store your verification data. Stripe uses access controls and security standards that are at least as stringent as those used to handle their own KYC and payments compliance data.
                </p>
                
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Learn more about how Stripe handles and stores your data at{' '}
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      stripe.com/privacy
                    </a>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Why verify */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                  Why am I asked to verify my identity?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-700">
                <p>
                  Identity verification helps us build a trusted community on Vendibook. By verifying your identity, you:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Build trust with potential renters and buyers who can see you're verified</li>
                  <li>Get a verified badge on your listings</li>
                  <li>Increase your booking conversion rates</li>
                  <li>Access premium platform features</li>
                  <li>Help prevent fraud and keep the community safe</li>
                </ul>
              </CardContent>
            </Card>

            {/* Rejection */}
            <Card>
              <CardHeader>
                <CardTitle>Why was my verification rejected?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-700">
                <p>
                  Verifications can fail for several reasons, including:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>The document image was too blurry or had glare</li>
                  <li>The document was expired or damaged</li>
                  <li>The selfie didn't match the ID photo</li>
                  <li>The information couldn't be validated</li>
                </ul>
                <p className="mt-4">
                  You can try again with a different device or better lighting. If you continue to have issues, please{' '}
                  <a href="mailto:support@vendibook.com" className="text-blue-600 hover:underline">
                    contact our support team
                  </a>.
                </p>
              </CardContent>
            </Card>

            {/* Data deletion */}
            <Card>
              <CardHeader>
                <CardTitle>How can I access or delete my verification data?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-700">
                <p>
                  You have the right to access and delete your verification data. To request access or deletion of your information, please contact us at{' '}
                  <a href="mailto:privacy@vendibook.com" className="text-blue-600 hover:underline">
                    privacy@vendibook.com
                  </a>.
                </p>
                <p>
                  We'll process your request in accordance with applicable privacy laws, including GDPR and CCPA requirements. Note that Stripe stores verification data on our behalf as a processor, and we may need time to coordinate deletion across both systems.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900 mb-2">Still have questions?</h3>
                <p className="text-slate-700 mb-4">
                  Our support team is here to help with any concerns about identity verification.
                </p>
                <a
                  href="mailto:support@vendibook.com"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Contact Support →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
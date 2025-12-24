import React from 'react';
import Header from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, AlertTriangle, CheckCircle, ExternalLink, 
  FileText, Users, DollarSign, Truck, Package 
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Insurance() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Insurance Information
            </h1>
            <p className="text-lg text-slate-600">
              Understanding your insurance responsibilities when renting on Vendibook
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Last Updated: December 13, 2025
            </p>
          </div>

          {/* Important Notice */}
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <strong>Important Notice:</strong> Vendibook does not provide insurance coverage by default. 
              Renters are responsible for obtaining any insurance required by the Host before completing a booking. 
              Please review this page carefully to understand your insurance obligations.
            </AlertDescription>
          </Alert>

          {/* Table of Contents */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="#overview" className="block text-blue-600 hover:underline">1. Overview</a>
              <a href="#policy" className="block text-blue-600 hover:underline">2. Vendibook Policy</a>
              <a href="#responsibility" className="block text-blue-600 hover:underline">3. Renter Responsibility</a>
              <a href="#options" className="block text-blue-600 hover:underline">4. Recommended Options</a>
              <a href="#requirements" className="block text-blue-600 hover:underline">5. Host Requirements</a>
              <a href="#faq" className="block text-blue-600 hover:underline">6. FAQ</a>
            </CardContent>
          </Card>

          {/* 1. Overview */}
          <section id="overview" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              1. Insurance Overview
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  When renting equipment, food trucks, trailers, or other assets through Vendibook, it's important to understand the insurance landscape. 
                  This page explains how insurance works on our platform and what you need to know before booking.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Insurance protects both renters and hosts from financial loss due to accidents, damage, theft, or liability claims. 
                  The specific coverage needed depends on the type of equipment being rented and how it will be used.
                </p>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Key Point:</strong> Always verify your insurance coverage before operating any rented equipment. 
                    Lack of proper insurance could result in significant financial liability.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-8" />

          {/* 2. Vendibook Policy */}
          <section id="policy" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              2. Vendibook Insurance Policy
            </h2>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-red-700">Vendibook Does Not Provide Insurance</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700">
                Vendibook is a marketplace platform that connects equipment owners with renters. 
                We do not provide, underwrite, or guarantee any insurance coverage for rentals conducted through our platform.
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">What This Means for You</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Vendibook does not offer liability insurance for renters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Vendibook does not offer damage protection plans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Vendibook does not cover theft, accidents, or equipment malfunction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Any insurance requirements are set by individual Hosts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Renters must obtain their own coverage when required</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Protections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  While we don't provide insurance, Vendibook does offer certain platform protections:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Secure Payments</p>
                      <p className="text-sm text-slate-600">All transactions via Stripe</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Security Deposits</p>
                      <p className="text-sm text-slate-600">Refundable deposits available</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Users className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Dispute Resolution</p>
                      <p className="text-sm text-slate-600">Mediation for booking disputes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Identity Verification</p>
                      <p className="text-sm text-slate-600">Stripe Identity verification</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-8" />

          {/* 3. Renter Responsibility */}
          <section id="responsibility" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              3. Renter Responsibility
            </h2>
            
            <Card className="mb-6">
              <CardContent className="p-6">
                <p className="text-slate-700 leading-relaxed mb-6">
                  As a renter on Vendibook, you are responsible for ensuring you have appropriate insurance coverage for any equipment you rent. 
                  This is especially important for:
                </p>

                <h3 className="font-semibold text-slate-900 mb-4">Types of Coverage to Consider</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">General Liability Insurance</h4>
                    <p className="text-sm text-slate-700">
                      Covers third-party bodily injury and property damage claims. Essential for food service operations and public events.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">Commercial Auto Insurance</h4>
                    <p className="text-sm text-slate-700">
                      Required for operating food trucks and trailers on public roads. Your personal auto policy typically won't cover commercial use.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">Equipment/Inland Marine Insurance</h4>
                    <p className="text-sm text-slate-700">
                      Covers damage to or theft of rented equipment. May be required by Hosts for high-value items.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">Product Liability Insurance</h4>
                    <p className="text-sm text-slate-700">
                      Covers claims arising from food products you sell. Critical for any food service operation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Before You Book</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Review the listing's insurance requirements carefully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Contact your insurance provider to verify coverage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Obtain any additional coverage needed before the rental period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Keep proof of insurance readily available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Understand what is and isn't covered by your policy</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-8" />

          {/* 4. Recommended Options */}
          <section id="options" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              4. Recommended Options
            </h2>
            
            <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">FLIP Insurance</h3>
                    <p className="text-slate-700 mb-4">
                      FLIP (Food Liability Insurance Program) offers short-term liability insurance designed for food vendors, 
                      event professionals, and mobile business operators. Coverage can be purchased for single events or ongoing operations.
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.open('https://www.fliprogram.com/food-truck-insurance', '_blank')}
                    >
                      Visit FLIP Website
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="mb-6 border-slate-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm text-slate-700">
                <strong>Important Disclaimer:</strong> Vendibook is not affiliated with, endorsed by, or partnered with FLIP or any other insurance provider. 
                This recommendation is provided for informational purposes only. You must confirm eligibility, coverage terms, and pricing directly with FLIP 
                or any insurance provider you choose. Vendibook makes no guarantees about the availability, suitability, or adequacy of any third-party insurance products.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Other Options to Explore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Your Existing Insurance</p>
                    <p className="text-sm text-slate-600">Check if your current business or personal policies can be extended</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Event Insurance Providers</p>
                    <p className="text-sm text-slate-600">Companies like Thimble, Next Insurance, or Hiscox offer short-term coverage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Local Insurance Agents</p>
                    <p className="text-sm text-slate-600">A local agent can help find coverage tailored to your needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Industry Associations</p>
                    <p className="text-sm text-slate-600">Food truck associations often offer group insurance programs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-8" />

          {/* 5. Host Requirements */}
          <section id="requirements" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-600" />
              5. Host Requirements
            </h2>
            
            <Card className="mb-6">
              <CardContent className="p-6">
                <p className="text-slate-700 leading-relaxed mb-6">
                  Individual Hosts on Vendibook may set their own insurance requirements for their listings. 
                  These requirements will be clearly displayed on the listing page and must be met before you can complete a booking.
                </p>

                <h3 className="font-semibold text-slate-900 mb-4">Common Host Requirements</h3>
                <ul className="space-y-2 text-slate-700 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Proof of Business Insurance:</strong> Certificate of insurance showing liability coverage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Additional Insured Endorsement:</strong> Adding the Host as an additional insured on your policy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Minimum Coverage Amounts:</strong> Specific dollar amounts for liability coverage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Commercial Auto Insurance:</strong> For vehicle rentals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Workers' Compensation:</strong> If you have employees</span>
                  </li>
                </ul>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tip:</strong> If you frequently rent equipment, consider getting a COI that can be easily updated with additional insured endorsements. 
                    This makes the booking process faster and smoother.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-8" />

          {/* 6. FAQ */}
          <section id="faq" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">6. Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Does Vendibook provide any insurance coverage?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">
                  No. Vendibook is a marketplace platform and does not provide, underwrite, or guarantee any insurance coverage. 
                  Renters must obtain their own insurance when required by Hosts.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What happens if I damage rented equipment?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">
                  You are financially responsible for any damage to rented equipment. If you have appropriate insurance, you can file a claim with your provider. 
                  Security deposits may also be used to cover damage costs.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I book without insurance if the Host doesn't require it?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">
                  Yes, if a Host doesn't require insurance documentation, you can complete the booking. However, we strongly recommend having appropriate coverage 
                  regardless of Host requirements to protect yourself from potential liability.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I know what insurance a Host requires?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">
                  Insurance requirements are displayed on the listing detail page under the "Requirements" section. 
                  You'll also see them during checkout before completing your booking.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is FLIP the only insurance option?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">
                  No. FLIP is one option we mention for informational purposes, but there are many insurance providers that offer coverage for food vendors and event professionals. 
                  We encourage you to shop around and find the coverage that best fits your needs and budget.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if I have questions about insurance requirements?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">
                  You can message the Host directly through Vendibook to ask questions about their specific insurance requirements. 
                  For general insurance questions, we recommend consulting with a licensed insurance professional.
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {/* Footer CTA */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Still Have Questions?</h3>
          <p className="text-slate-300 mb-6">
            Contact us if you need clarification on insurance requirements or have concerns about coverage.
          </p>
          <Button variant="outline" className="bg-white text-slate-900 hover:bg-slate-100">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
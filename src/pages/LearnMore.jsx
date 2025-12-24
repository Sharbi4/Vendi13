import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, FileText, Calendar, CheckCircle, Package,
  Truck, ShoppingCart, Shield, MessageSquare, MapPin,
  DollarSign, ArrowRight, Sparkles
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const RENT_STEPS = [
  {
    number: 1,
    title: 'Browse rentals',
    description: 'Search by category and city to find food trucks, food trailers, ghost kitchens, and equipment available to rent.',
    icon: Search
  },
  {
    number: 2,
    title: 'Review the listing details',
    description: 'Each listing shows what\'s included, pricing, availability, pickup options, and whether delivery is available. Locations are masked for safety.',
    icon: FileText
  },
  {
    number: 3,
    title: 'Request your booking',
    description: 'Select your dates and submit a booking request. Some hosts may require documents such as insurance or permits depending on the asset.',
    icon: Calendar
  },
  {
    number: 4,
    title: 'Confirm, then coordinate pickup or delivery',
    description: 'After confirmation, you\'ll receive the full access details and instructions. Use platform messaging for coordination.',
    icon: Truck
  },
  {
    number: 5,
    title: 'Return and close out',
    description: 'At the end of the rental period, return the asset based on the listing instructions. If a deposit applies, it\'s handled according to the host\'s inspection timeline and policy.',
    icon: CheckCircle
  }
];

const BUY_STEPS = [
  {
    number: 1,
    title: 'Browse for sale listings',
    description: 'Search for food trucks, food trailers, vendor carts, and equipment for sale. Compare condition, photos, and included features.',
    icon: Search
  },
  {
    number: 2,
    title: 'Choose delivery or pickup',
    description: 'Sellers may offer local pickup, freight delivery, or seller delivery. If delivery applies, it appears as a line item during checkout.',
    icon: Truck
  },
  {
    number: 3,
    title: 'Add optional transaction services',
    description: 'Depending on the listing, you may be able to add services like title verification or online notary to increase trust for higher-value purchases.',
    icon: Shield
  },
  {
    number: 4,
    title: 'Complete checkout',
    description: 'Pay through the platform to keep the transaction documented and secure.',
    icon: ShoppingCart
  },
  {
    number: 5,
    title: 'Receive your asset',
    description: 'After payment confirmation, coordinate handoff details through platform messaging and complete delivery or pickup.',
    icon: Package
  }
];

const TRUST_FEATURES = [
  {
    icon: MapPin,
    title: 'Address masking until confirmed transactions',
    description: 'Locations remain private until bookings are confirmed'
  },
  {
    icon: DollarSign,
    title: 'Clear line-item totals at checkout',
    description: 'Transparent pricing with no hidden fees'
  },
  {
    icon: MessageSquare,
    title: 'Platform messaging for coordination',
    description: 'Secure communication between hosts and guests'
  },
  {
    icon: Shield,
    title: 'Optional verification and transaction add-ons',
    description: 'Additional trust services for higher-value sales'
  }
];

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 md:pt-24 pb-12">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#FF5124] to-[#e5481f] text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              How Vendibook Works
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Vendibook is a marketplace for mobile business assets. You can rent food trucks and trailers, 
              or buy equipment and vehicles for sale, in one clean, high-trust platform.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8">
          {/* Rent Section */}
          <section className="mb-16">
            <Card className="border-0 shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-t-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-8 h-8" />
                  <h2 className="text-3xl font-bold">Rent</h2>
                </div>
                <p className="text-blue-100">Find and rent mobile food assets for your business</p>
              </div>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {RENT_STEPS.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.number} className="flex gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-blue-600">{step.number}</span>
                            <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Buy Section */}
          <section className="mb-16">
            <Card className="border-0 shadow-xl">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-t-xl">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingCart className="w-8 h-8" />
                  <h2 className="text-3xl font-bold">Buy</h2>
                </div>
                <p className="text-green-100">Purchase equipment and vehicles for your business</p>
              </div>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {BUY_STEPS.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.number} className="flex gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Icon className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-green-600">{step.number}</span>
                            <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Trust Features */}
          <section className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Built for trust</h2>
              <p className="text-lg text-slate-600">Security and transparency at every step</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {TRUST_FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#FF5124]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-[#FF5124]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                          <p className="text-sm text-slate-600">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Available Add-ons */}
          <section className="mb-16">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                  <h2 className="text-3xl font-bold text-slate-900">Available Add-ons for Listings</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Title Verification
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Professional verification of vehicle title and ownership documentation for buyer confidence.
                    </p>
                    <span className="text-xs text-slate-500">$35 add-on</span>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Online Notary
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Virtual notary services for transaction documents, available for both parties.
                    </p>
                    <span className="text-xs text-slate-500">$50 add-on</span>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      Escrow Service
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Secure payment holding until delivery confirmation, protecting both buyer and seller.
                    </p>
                    <span className="text-xs text-slate-500">Free service</span>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600" />
                      Notarized Sale Receipt
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Both-party notarized sale receipt provided by Proof for official transaction documentation.
                    </p>
                    <span className="text-xs text-slate-500">$60 add-on</span>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#FF5124]" />
                      Featured Listing
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Boost your listing to the top of search results and get 5x more views.
                    </p>
                    <span className="text-xs text-slate-500">$30/month subscription</span>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Package className="w-5 h-5 text-teal-600" />
                      Custom Add-ons
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Renters can request custom equipment, services, or modifications during booking.
                    </p>
                    <span className="text-xs text-slate-500">Priced by host</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA Section */}
          <section>
            <Card className="border-0 shadow-xl bg-gradient-to-r from-[#FF5124] to-[#e5481f] text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to start?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Whether you're looking to rent for your next event or purchase equipment for your business, 
                  Vendibook makes it simple and secure.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to={`${createPageUrl('SearchResults')}?mode=rent`}>
                    <Button className="bg-white text-[#FF5124] hover:bg-gray-50 hover:shadow-lg h-12 px-8 text-base font-semibold transition-all shadow-md">
                      Browse Rentals
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to={`${createPageUrl('SearchResults')}?mode=sale`}>
                    <Button className="bg-white text-[#FF5124] hover:bg-gray-50 hover:shadow-lg h-12 px-8 text-base font-semibold transition-all shadow-md">
                      Browse For Sale
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to={createPageUrl('HostOnboarding')}>
                    <Button className="bg-white text-[#FF5124] hover:bg-gray-50 hover:shadow-lg h-12 px-8 text-base font-semibold transition-all shadow-md">
                      List Your Asset
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
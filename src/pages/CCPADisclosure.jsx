import React from 'react';
import Header from '../components/layout/Header';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Mail } from 'lucide-react';

export default function CCPADisclosure() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <Link 
            to={createPageUrl('Home')} 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#FF5124] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">California Privacy Notice</h1>
            
            <p className="text-slate-700 leading-relaxed mb-8">
              Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), 
              California residents have specific rights regarding their personal information.
            </p>

            <div className="prose prose-slate max-w-none space-y-8">
              
              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
                <p className="text-slate-700 leading-relaxed">
                  We may collect the following categories of personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 mt-3">
                  <li>
                    <strong>Identifiers:</strong> Name, email address, phone number, IP address, and device identifiers
                  </li>
                  <li>
                    <strong>Commercial Information:</strong> Bookings, transactions, payment information, and listing details
                  </li>
                  <li>
                    <strong>Internet Activity:</strong> Browsing history, search history, and interaction with our platform
                  </li>
                  <li>
                    <strong>Business Profile Data:</strong> Information about listings you create, messages, and reviews
                  </li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Information</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  We use your personal information to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Operate user accounts and manage listings</li>
                  <li>Process bookings and secure payments</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Improve and secure the platform</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                </ul>
              </section>

              {/* Selling or Sharing */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Selling or Sharing Personal Information</h2>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-4">
                  <p className="text-slate-900 font-semibold text-lg">
                    Vendibook <strong className="text-green-700">does not sell personal information</strong>.
                  </p>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  We may share limited data with service providers (such as payment processors, email services, 
                  and analytics providers) strictly to operate the platform. These parties are contractually 
                  obligated to protect your information and use it only for the purposes we specify.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  California residents have the right to:
                </p>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Right to Know</h3>
                    <p className="text-sm text-slate-700">
                      Request disclosure of what personal information we collect, use, disclose, and sell (if applicable).
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Right to Delete</h3>
                    <p className="text-sm text-slate-700">
                      Request deletion of personal information we have collected about you.
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Right to Opt-Out</h3>
                    <p className="text-sm text-slate-700">
                      Opt out of the sale or sharing of personal information (though we do not sell data).
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Right to Non-Discrimination</h3>
                    <p className="text-sm text-slate-700">
                      We will not discriminate against you for exercising your privacy rights.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Right to Correct</h3>
                    <p className="text-sm text-slate-700">
                      Request correction of inaccurate personal information.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Right to Limit Use</h3>
                    <p className="text-sm text-slate-700">
                      Limit the use and disclosure of sensitive personal information.
                    </p>
                  </div>
                </div>
              </section>

              {/* How to Submit a Request */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Submit a Request</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  To exercise your CCPA/CPRA rights, please contact us:
                </p>
                
                <div className="bg-orange-50 border-2 border-[#FF5124] rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-[#FF5124]" />
                    <div>
                      <p className="font-semibold text-slate-900">Email:</p>
                      <a 
                        href="mailto:privacy@vendibook.com?subject=California Privacy Request" 
                        className="text-[#FF5124] hover:underline"
                      >
                        privacy@vendibook.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="border-t border-orange-200 pt-4">
                    <p className="text-sm text-slate-700 mb-2">
                      <strong>Subject line:</strong> <em>California Privacy Request</em>
                    </p>
                    <p className="text-sm text-slate-700">
                      Please include:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-slate-700 mt-2">
                      <li>Your full name</li>
                      <li>Email associated with your account</li>
                      <li>Type of request (access, deletion, correction, etc.)</li>
                      <li>Any additional details to help us verify your identity</li>
                    </ul>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mt-4">
                  We will verify your request and respond within the time required by California law (typically 45 days).
                </p>
              </section>

              {/* Authorized Agent */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Authorized Agent</h2>
                <p className="text-slate-700 leading-relaxed">
                  You may designate an authorized agent to make a request on your behalf. The authorized agent 
                  must provide proof of authorization and we may require you to verify your identity directly with us.
                </p>
              </section>

              {/* General Data Rights Template */}
              <section className="bg-slate-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Rights Request Template</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  To exercise your GDPR or CCPA rights, please email{' '}
                  <a 
                    href="mailto:privacy@vendibook.com" 
                    className="text-[#FF5124] hover:underline font-medium"
                  >
                    privacy@vendibook.com
                  </a>{' '}
                  with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Your full name</li>
                  <li>Email associated with your account</li>
                  <li>Type of request (access, deletion, correction, portability)</li>
                  <li>Specific information you're inquiring about (if applicable)</li>
                </ul>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions?</h2>
                <p className="text-slate-700 leading-relaxed">
                  If you have questions about this notice or our privacy practices, please contact us at{' '}
                  <a href="mailto:privacy@vendibook.com" className="text-[#FF5124] hover:underline font-medium">
                    privacy@vendibook.com
                  </a>.
                </p>
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
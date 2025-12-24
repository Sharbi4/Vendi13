import React from 'react';
import Header from '../components/layout/Header';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
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
            <h1 className="text-4xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
            
            <div className="space-y-2 mb-8 text-sm text-slate-600">
              <p><strong>Effective Date:</strong> December 23, 2025</p>
              <p><strong>Last Updated:</strong> December 23, 2025</p>
            </div>

            <div className="prose prose-slate max-w-none space-y-8">
              <p className="text-slate-700 leading-relaxed">
                Vendibook, LLC ("Vendibook," "we," "us," "our") respects your privacy and is committed to protecting your personal data. 
                This Privacy Policy explains how we collect, use, share, and protect your personal information when you use{' '}
                <a href="https://vendibook.com" className="text-[#FF5124] hover:underline">https://vendibook.com</a> (the "Site") and related services (collectively, the "Services").
                Vendibook operates as a digital <strong>marketplace</strong> where users can <strong>rent, list, and book food trucks, trailers, ghost kitchens, vendor lots, and other mobile business assets</strong> quickly and securely.
              </p>

              <p className="text-slate-700 leading-relaxed">
                This policy also explains your rights under <strong>GDPR</strong> (for users in the European Union) and <strong>CCPA / CPRA</strong> (for California residents).
              </p>

              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.1 Information You Provide</h3>
                <p className="text-slate-700 leading-relaxed mb-3">
                  We collect information you submit directly when you use our Services, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Account Data:</strong> Name, email address, phone number, password, business name, and profile information.</li>
                  <li><strong>Listings:</strong> Photos, descriptions, pricing, location details, and availability for assets you list.</li>
                  <li><strong>Booking & Transactions:</strong> Payment method information (e.g., credit card info processed via third-party processors), booking dates, order history.</li>
                  <li><strong>Communications:</strong> Messages between users, support inquiries, reviews, and feedback.</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.2 Information Collected Automatically</h3>
                <p className="text-slate-700 leading-relaxed mb-3">
                  When you visit or use the Services, we automatically collect:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Usage Data:</strong> IP address, device identifiers, browser type, pages viewed, time spent on pages, and referral sources.</li>
                  <li><strong>Cookies & Tracking:</strong> Cookies, web beacons, analytics tags to improve the Site and personalize your experience.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How and Why We Use Your Information</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  We use your information for the following purposes:
                </p>

                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.1 Provide & Improve the Service</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Create and manage your account</li>
                  <li>Process transactions and bookings</li>
                  <li>Support user listings and marketplace functions</li>
                  <li>Improve, personalize, and maintain the Site</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.2 Communication</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Send confirmations, updates, and service-related announcements</li>
                  <li>Respond to support inquiries</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.3 Analytics & Research</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Analyze usage trends and performance to improve features</li>
                  <li>Generate aggregated reports for internal insights</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.4 Legal & Safety</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Prevent fraud and abuse</li>
                  <li>Comply with applicable laws and enforce our Terms of Service</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Legal Grounds for Processing (GDPR)</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  If you are in the European Union, we process your data based on:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Contract Necessity:</strong> To perform the contract (e.g., complete a booking)</li>
                  <li><strong>Consent:</strong> Where you have consented (e.g., marketing communications)</li>
                  <li><strong>Legitimate Interests:</strong> To improve services, detect fraud, and ensure security</li>
                  <li><strong>Legal Obligations:</strong> To comply with laws</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Sharing and Disclosure of Data</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  We <strong>do not sell your personal information.</strong>
                </p>
                <p className="text-slate-700 leading-relaxed mb-3">
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Service Providers:</strong> Parties that help operate the marketplace, payment processors, analytics providers</li>
                  <li><strong>Legal Authorities:</strong> To comply with law enforcement or legal process</li>
                  <li><strong>Business Transfers:</strong> If Vendibook is acquired or merges with another company</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Retention</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  We retain your information only as long as necessary to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Provide and improve services</li>
                  <li>Comply with legal and accounting requirements</li>
                  <li>Resolve disputes and enforce agreements</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  When data is no longer needed, we securely delete or anonymize it.
                </p>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Your Rights</h2>

                <h3 className="text-xl font-semibold text-slate-800 mb-3">6.1 GDPR Rights</h3>
                <p className="text-slate-700 leading-relaxed mb-3">
                  If you are in the EU, you have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Access your personal data</li>
                  <li>Correct inaccuracies</li>
                  <li>Request deletion ("right to be forgotten")</li>
                  <li>Restrict or object to processing</li>
                  <li>Data portability</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">6.2 CCPA / CPRA Rights</h3>
                <p className="text-slate-700 leading-relaxed mb-3">
                  If you are a California resident:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Right to Know:</strong> Information we collect, how it's used, and with whom it's shared</li>
                  <li><strong>Right to Delete:</strong> Request removal of personal data</li>
                  <li><strong>Right to Opt-Out of Sale or Sharing:</strong> Vendibook does not sell personal data</li>
                  <li><strong>Right to Non-Discrimination:</strong> We will not penalize you for exercising your privacy rights</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  To exercise any of these rights, contact us at the address below.
                </p>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies and Tracking</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Enable essential site functionality</li>
                  <li>Analyze and improve the Services</li>
                  <li>Deliver personalized content</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-3">
                  You can manage your cookie preferences in your browser settings.
                </p>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Third-Party Services</h2>
                <p className="text-slate-700 leading-relaxed">
                  Vendibook may integrate with third-party tools such as payment processors and analytics services (e.g., Stripe, Google Analytics). 
                  These third parties have their own privacy practices and may set cookies or collect information independently.
                </p>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Children's Privacy</h2>
                <p className="text-slate-700 leading-relaxed">
                  The Site and Services are <strong>not directed to children under 16</strong>. We do not knowingly collect personal data from minors; 
                  if we discover that we have, we will delete it promptly.
                </p>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Security</h2>
                <p className="text-slate-700 leading-relaxed">
                  We use industry-standard security measures to protect personal data. However, no system is fully secure, and we cannot guarantee absolute protection.
                </p>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">11. International Transfers</h2>
                <p className="text-slate-700 leading-relaxed">
                  Your information may be processed and stored outside your home jurisdiction, including the United States. 
                  When we transfer data internationally, we use appropriate safeguards required by applicable law (e.g., Standard Contractual Clauses under GDPR).
                </p>
              </section>

              {/* Section 12 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Changes to This Privacy Policy</h2>
                <p className="text-slate-700 leading-relaxed">
                  We may update this policy. We will post changes on the Site with a revised "Last Updated" date.
                </p>
              </section>

              {/* Section 13 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Contact Us</h2>
                <p className="text-slate-700 leading-relaxed mb-3">
                  If you have questions, want to exercise your rights, or need help with privacy preferences:
                </p>
                <div className="bg-slate-50 p-6 rounded-xl space-y-2">
                  <p className="text-slate-700">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:privacy@vendibook.com" className="text-[#FF5124] hover:underline">
                      privacy@vendibook.com
                    </a>
                  </p>
                  <p className="text-slate-700">
                    <strong>Address:</strong> Vendibook, LLC, Tucson, Arizona, USA
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
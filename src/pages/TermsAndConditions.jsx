import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link 
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="prose prose-slate max-w-none">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Vendibook Terms and Conditions
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Vendibook Rent and Sale Marketplace<br />
              Last Updated: December 22, 2025
            </p>

            <div className="text-slate-700 leading-relaxed space-y-6">
              <p>
                These Terms and Conditions ("Terms") govern your access to and use of Vendibook's rent and sale marketplace (the "Platform"), including any websites, web apps, mobile experiences, tools, messaging, and payment flows we provide. By accessing or using the Platform, you agree to these Terms.
              </p>
              <p className="font-semibold">
                If you do not agree, do not use the Platform.
              </p>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Who We Are</h2>
                <p><strong>Platform Operator:</strong> Vendibook LC ("Vendibook," "we," "us," "our")</p>
                <p><strong>Business Address:</strong> 3029 S Mountain Ave, Tucson, AZ 85719, USA</p>
                <p><strong>Contact:</strong> Support and legal inquiries should be submitted via the Platform's support/contact method.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Key Marketplace Concept</h2>
                <p>Vendibook is a marketplace that enables users to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>rent mobile business assets (e.g., food trucks, food trailers, kitchens, equipment),</li>
                  <li>buy or sell eligible assets through for-sale listings,</li>
                  <li>communicate and transact using Platform tools.</li>
                </ul>
                <p>
                  Vendibook is not the owner of listed assets unless explicitly stated on a specific listing. Vendibook does not guarantee a transaction will complete, and Vendibook is not a party to agreements between users unless explicitly stated.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>"Host"</strong> means a user listing an asset for rent.</li>
                  <li><strong>"Renter"</strong> means a user booking a rental listing.</li>
                  <li><strong>"Seller"</strong> means a user listing an asset for sale.</li>
                  <li><strong>"Buyer"</strong> means a user purchasing a for-sale listing.</li>
                  <li><strong>"Listing"</strong> means an offer to rent or sell posted on the Platform.</li>
                  <li><strong>"Transaction"</strong> means any rental booking, purchase, payment, refund, dispute, or related Platform-mediated activity.</li>
                  <li><strong>"Fees"</strong> means Platform fees, commissions, payment processing fees, optional add-ons, shipping/freight, taxes, or other charges presented at checkout.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Eligibility, Accounts, and Identity</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must be at least 18 years old to use the Platform.</li>
                  <li>You agree to provide accurate account information, and keep it updated.</li>
                  <li>You are responsible for all activity under your account, including actions taken by anyone who gains access to your account.</li>
                  <li>We may require identity verification, business verification, or additional documentation to enable certain features, reduce fraud, or comply with law.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Platform Rules, User Conduct</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>use the Platform for unlawful, fraudulent, abusive, deceptive, or harmful activity,</li>
                  <li>post misleading listings, false availability, or inaccurate pricing,</li>
                  <li>attempt to bypass the Platform to avoid fees (off-platform payments, off-platform deals that originate on the Platform),</li>
                  <li>harass, threaten, or discriminate against other users,</li>
                  <li>upload malware, scrape the Platform, or interfere with Platform operations,</li>
                  <li>misuse messaging tools, or request highly sensitive personal data not needed to complete a transaction.</li>
                </ul>
                <p>We may remove content, suspend features, or terminate accounts when we believe these rules are violated.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Listings, Accuracy, and Availability</h2>
                
                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">6.1 Listing Content Standards</h3>
                <p>
                  Hosts and Sellers must provide complete, accurate, and non-misleading listing details, including condition, included equipment, limitations, requirements, and any operational constraints. Photos must reflect the current state of the asset. Stock images may be restricted or labeled.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">6.2 Availability and Booking Commitments</h3>
                <p>
                  Hosts are responsible for maintaining accurate availability and honoring accepted bookings. Sellers are responsible for keeping availability and "for sale" status current.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">6.3 Address Masking and Location</h3>
                <p>
                  For trust and safety, listings may show only general location information until a booking or purchase is confirmed. Users agree not to attempt to obtain or share exact location details to circumvent Platform protections.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Rentals, Use, and Return</h2>
                
                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7.1 Rental Use Requirements</h3>
                <p>
                  Renters must use rental assets safely, legally, and in accordance with the Host's rules and the listing terms. Renters are responsible for permits, licensing, and compliance applicable to their specific event, location, and business operations.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7.2 Condition, Damage, and Incident Reporting</h3>
                <p>
                  Renters must return the asset on time and in the same condition as received, normal wear and tear excepted. Any damage, theft, loss, or incident must be reported promptly through the Platform.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7.3 Inspections and Return Confirmation</h3>
                <p>
                  A Host may be required to confirm return and condition via Platform workflow. The Platform may restrict future bookings if return steps are incomplete, or if disputes are active.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. For-Sale Transactions, Title, and Disclosures</h2>
                <p>
                  Sellers must accurately disclose condition, known issues, included equipment, and any material defects. If a listing involves a titled asset (where applicable), the Seller is responsible for providing lawful transfer documentation and cooperating with any chosen verification or notary steps. Buyers are responsible for conducting due diligence prior to purchase, including inspection, verification, and confirming compatibility with local regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Payments, Checkout, and Fees</h2>
                <p>
                  All amounts shown at checkout may include multiple line items, including the item price, optional add-ons, freight or delivery, platform fees (where applicable), payment processing fees (where applicable), and taxes.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">9.1 Rentals Fees (Rent Site)</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Host commission: 12.9% of the booking subtotal</li>
                  <li>Renter platform fee: 12.9% of the booking subtotal</li>
                  <li>Additional optional add-ons, delivery fees (if offered), and taxes may apply.</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">9.2 For-Sale Fees (Sale Site)</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Seller commission: 12.9% of the sale price (unless otherwise presented on the listing or in a separate seller agreement)</li>
                  <li>Buyer platform fee: 0%</li>
                  <li>Optional Buyer card fee: up to 3% may apply if Buyer chooses to pay by credit card</li>
                  <li>Optional add-ons, freight, and taxes may apply.</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">9.3 No Earnings Transparency</h3>
                <p>
                  Vendibook does not display Host earnings, Seller earnings, or Platform earnings in checkout; you will see user-facing line items only (price, add-ons, fees presented to you, taxes, total).
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">9.4 Payment Processing</h3>
                <p>
                  Transactions may be processed by third-party payment processors. You agree to comply with their terms as required to complete checkout.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Freight, Delivery, Pickup</h2>
                
                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">10.1 Freight for For-Sale Listings</h3>
                <p>
                  Freight may be offered for eligible items within the contiguous 48 United States. Freight may be calculated at $4 per mile, based on origin-to-delivery distance. Sellers may choose to offer local pickup, pass freight to Buyer as a checkout line item, or pay freight and offer "free shipping" as presented to Buyer.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">10.2 Delivery for Rentals</h3>
                <p>
                  If a Host offers delivery or travel, the listing may specify maximum delivery distance in miles, a per-mile delivery or travel rate, and any additional terms for setup, drop-off, or return logistics. If the delivery address exceeds the Host's maximum radius, delivery may be blocked or disabled.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Cancellations, Refunds, and Disputes</h2>
                
                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">11.1 Cancellations and Refunds</h3>
                <p>
                  Cancellation and refund rules may vary by listing type and Host/Seller policies, and will be presented during booking or checkout. If a cancellation occurs, the Platform may apply the listing's cancellation policy and applicable processor rules.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">11.2 Dispute Process</h3>
                <p>
                  Vendibook may provide a dispute submission workflow. Dispute review timelines may vary, and resolution may depend on evidence such as messages, photos, documentation, and transaction details. Users agree to provide accurate information and respond promptly when a dispute is opened.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">11.3 Chargebacks</h3>
                <p>
                  If you initiate a chargeback, the Platform may suspend account features during investigation, and you agree to cooperate and provide documentation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Insurance, Safety, and Compliance</h2>
                <p>
                  Vendibook does not provide rental insurance by default, unless explicitly stated in writing on the Platform for a specific program or listing. Renters are responsible for obtaining and maintaining any required insurance coverage, and for providing proof if requested by a Host or required by Platform policy. Users are responsible for complying with all applicable laws, permits, and safety requirements related to use, transport, and operation of equipment and mobile assets.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">13. Messaging, Documents, and User Content</h2>
                <p>
                  The Platform may provide messaging features for user coordination and document exchange. You grant Vendibook a limited license to host, store, display, and transmit content you submit as needed to operate the Platform. You represent that you have the rights to any content you upload, and that it does not violate law or third-party rights. We may remove content that violates these Terms or presents fraud, safety, or legal risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">14. Optional Add-Ons</h2>
                <p>Optional add-ons may be offered at checkout or during listing creation, which may include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>escrow-style support services,</li>
                  <li>title verification,</li>
                  <li>online notary services,</li>
                  <li>listing boosts or featured placement,</li>
                  <li>printed marketing or QR materials.</li>
                </ul>
                <p>Add-on pricing, scope, and availability will be disclosed at the time of selection.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">15. Intellectual Property</h2>
                <p>
                  Vendibook's branding, software, UI, workflows, and content (excluding user-generated content) are owned by Vendibook or its licensors and are protected by intellectual property laws. You may not copy, modify, reverse engineer, or exploit the Platform except as permitted by law or explicitly authorized in writing.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">16. Disclaimers</h2>
                <p>The Platform is provided "as is" and "as available."</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Vendibook does not guarantee listings will be available, that bookings will be accepted, or that transactions will complete.</li>
                  <li>Vendibook does not guarantee the quality, safety, legality, or suitability of any listing, asset, Host, Renter, Seller, or Buyer.</li>
                  <li>Users assume risk related to renting, purchasing, operating, transporting, or using any asset obtained through the Platform.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">17. Limitation of Liability</h2>
                <p>To the maximum extent permitted by law:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Vendibook will not be liable for indirect, incidental, special, consequential, or punitive damages, including lost profits, lost revenue, or business interruption.</li>
                  <li>Vendibook's total liability for any claim arising out of or relating to the Platform will not exceed the total fees paid to Vendibook by you in the six months preceding the event giving rise to the claim, or $100, whichever is greater, unless applicable law requires otherwise.</li>
                </ul>
                <p>Some jurisdictions do not allow certain limitations; in that case, limitations apply to the maximum extent permitted.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">18. Indemnification</h2>
                <p>You agree to indemnify and hold Vendibook harmless from claims, damages, liabilities, losses, and expenses (including reasonable attorney fees) arising from:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>your use of the Platform,</li>
                  <li>your listings, content, or communications,</li>
                  <li>your violation of these Terms,</li>
                  <li>your violation of law or third-party rights,</li>
                  <li>your rental, purchase, sale, or operation of any asset.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">19. Suspension, Termination, and Enforcement</h2>
                <p>
                  We may suspend or terminate access to the Platform, remove listings, or restrict features at any time if we believe you violated these Terms, created risk, engaged in fraud, or harmed other users. Termination may not eliminate obligations related to active disputes, payments owed, or legal compliance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">20. Arbitration, Class Action Waiver</h2>
                <p>
                  Where permitted by law, Vendibook may require that disputes be resolved through binding arbitration rather than court, and that claims be brought on an individual basis only. If you are a consumer, you may have additional rights under your state's laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">21. Governing Law</h2>
                <p>
                  These Terms are governed by the laws of the State of Arizona, without regard to conflict of laws principles, except where consumer protection laws require otherwise.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">22. Changes to These Terms</h2>
                <p>
                  We may update these Terms from time to time. The "Last Updated" date will change when updates are posted. Continued use of the Platform after updates constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">23. Contact</h2>
                <p>
                  For support, policy, or legal inquiries, contact Vendibook through the support/contact method available on the Platform. Written notices may also be directed to:
                </p>
                <p className="font-semibold mt-2">
                  Vendibook LC<br />
                  3029 S Mountain Ave<br />
                  Tucson, AZ 85719, USA
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
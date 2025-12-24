import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, Loader2, Package, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import LeaveUserReviewModal from '../components/reviews/LeaveUserReviewModal';
import confetti from 'canvas-confetti';
import { syncToGoogleSheets, formatSaleForSheets } from '../components/integrations/GoogleSheetsSync';

export default function SaleSuccess() {
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const listingId = urlParams.get('listing_id');

      if (!listingId) {
        navigate(createPageUrl('Home'));
        return;
      }

      const listings = await base44.entities.Listing.filter({ id: listingId });
      const listingData = listings[0];

      if (listingData) {
        setListing(listingData);
        
        // Get user and transaction info
        const userData = await base44.auth.me();
        setUser(userData);
        
        const transactions = await base44.entities.Transaction.filter({ 
          reference_id: listingId,
          user_email: userData.email 
        }, '-created_date', 1);
        
        if (transactions.length > 0) {
          setTransaction(transactions[0]);
        }
        
        // Check if there's an escrow for this purchase
        const escrows = await base44.entities.Escrow.filter({ 
          listing_id: listingId,
          buyer_email: userData.email
        }, '-created_date', 1);
        
        if (escrows.length > 0) {
          setEscrow(escrows[0]);
        }

        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Sync to Google Sheets if configured
        try {
          if (userData?.google_sheets_config?.enabled && userData?.google_sheets_config?.spreadsheet_id && transactions.length > 0) {
            const buyerInfo = {
              name: transactions[0]?.metadata?.buyer_name || userData.full_name || 'N/A',
              email: userData.email,
              phone: transactions[0]?.metadata?.buyer_phone || 'N/A',
              notes: transactions[0]?.metadata?.notes || 'N/A'
            };
            await syncToGoogleSheets(
              userData.google_sheets_config.spreadsheet_id,
              'Sales',
              formatSaleForSheets(transactions[0], listingData, buyerInfo)
            );
          }
        } catch (error) {
          console.error('Failed to sync to Google Sheets:', error);
        }
      }
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 md:pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                Purchase Successful!
              </h1>
              <p className="text-slate-600 mb-8">
                Your payment has been processed successfully. The seller will be notified.
              </p>

              {listing && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                  <h2 className="font-semibold text-slate-900 mb-4">Purchase Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Item</p>
                        <p className="font-medium text-slate-900">{listing.title}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Paid</span>
                        <span className="font-bold text-slate-900 text-lg">
                          ${listing.sale_price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {escrow && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-blue-900 mb-1">Escrow Protection Active</h3>
                      <p className="text-sm text-blue-700">
                        Your payment is held securely in escrow. Funds will be released to the seller 
                        once you confirm receipt of the item.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {escrow && (
                  <Button
                    onClick={() => navigate(createPageUrl('MyEscrows'))}
                    className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-base font-medium"
                  >
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    View Escrow Status
                  </Button>
                )}
                <Button
                  onClick={() => setShowReviewModal(true)}
                  variant="outline"
                  className="w-full h-12 text-base font-medium"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Leave a Review for Seller
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(createPageUrl('Home'))}
                  className="w-full h-12 text-base font-medium"
                >
                  Back to Home
                </Button>
              </div>

              <p className="text-xs text-slate-500 mt-6">
                A confirmation email has been sent to your inbox
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {transaction && listing && (
        <LeaveUserReviewModal
          open={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          transaction={transaction}
          reviewedUserEmail={listing.created_by}
          reviewerRole="buyer"
        />
      )}
    </div>
  );
}
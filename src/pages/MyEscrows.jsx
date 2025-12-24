import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import EscrowStatusCard from '../components/payments/EscrowStatusCard';
import ConfirmDeliveryModal from '../components/escrow/ConfirmDeliveryModal';
import ConfirmReceiptModal from '../components/escrow/ConfirmReceiptModal';

export default function MyEscrows() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('MyEscrows'));
      return;
    }
    setIsAuthenticated(authenticated);
    const userData = await base44.auth.me();
    setUser(userData);
  };

  // Fetch escrows where user is buyer
  const { data: buyerEscrows = [], isLoading: loadingBuyer } = useQuery({
    queryKey: ['buyer-escrows', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Escrow.filter({ buyer_email: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  // Fetch escrows where user is seller
  const { data: sellerEscrows = [], isLoading: loadingSeller } = useQuery({
    queryKey: ['seller-escrows', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Escrow.filter({ seller_email: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  // Fetch all listings for display
  const { data: allListings = [] } = useQuery({
    queryKey: ['all-listings-escrow'],
    queryFn: async () => {
      return await base44.entities.Listing.list('-created_date', 100);
    },
  });

  const handleConfirmDelivery = (escrow) => {
    setSelectedEscrow(escrow);
    setShowDeliveryModal(true);
  };

  const handleConfirmReceipt = (escrow) => {
    setSelectedEscrow(escrow);
    setShowReceiptModal(true);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['buyer-escrows'] });
    queryClient.invalidateQueries({ queryKey: ['seller-escrows'] });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  const getListing = (listingId) => allListings.find(l => l.id === listingId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#FF5124] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Escrow Transactions</h1>
              <p className="text-slate-500">Track your secure purchases and sales</p>
            </div>
          </div>

          <Tabs defaultValue="buying" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buying">
                Buying ({buyerEscrows.length})
              </TabsTrigger>
              <TabsTrigger value="selling">
                Selling ({sellerEscrows.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buying" className="space-y-4">
              {loadingBuyer ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
                </div>
              ) : buyerEscrows.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-slate-500">No purchases with escrow protection yet</p>
                </div>
              ) : (
                buyerEscrows.map((escrow) => {
                  const listing = getListing(escrow.listing_id);
                  return (
                    <EscrowStatusCard
                      key={escrow.id}
                      escrow={escrow}
                      listing={listing}
                      isBuyer={true}
                      onConfirmReceipt={() => handleConfirmReceipt(escrow)}
                      onDispute={() => alert('Dispute feature coming soon')}
                    />
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="selling" className="space-y-4">
              {loadingSeller ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
                </div>
              ) : sellerEscrows.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-slate-500">No sales with escrow protection yet</p>
                </div>
              ) : (
                sellerEscrows.map((escrow) => {
                  const listing = getListing(escrow.listing_id);
                  return (
                    <EscrowStatusCard
                      key={escrow.id}
                      escrow={escrow}
                      listing={listing}
                      isBuyer={false}
                      onConfirmDelivery={() => handleConfirmDelivery(escrow)}
                    />
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Modals */}
      {selectedEscrow && (
        <>
          <ConfirmDeliveryModal
            open={showDeliveryModal}
            onClose={() => {
              setShowDeliveryModal(false);
              setSelectedEscrow(null);
            }}
            escrow={selectedEscrow}
            onSuccess={handleRefresh}
          />
          <ConfirmReceiptModal
            open={showReceiptModal}
            onClose={() => {
              setShowReceiptModal(false);
              setSelectedEscrow(null);
            }}
            escrow={selectedEscrow}
            listing={getListing(selectedEscrow.listing_id)}
            onSuccess={handleRefresh}
          />
        </>
      )}
    </div>
  );
}
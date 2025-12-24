import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfirmReceiptModal({ open, onClose, escrow, listing, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      // Update escrow status
      await base44.entities.Escrow.update(escrow.id, {
        status: 'completed',
        buyer_confirmed_date: new Date().toISOString(),
        funds_released_date: new Date().toISOString(),
      });

      // Update listing to sold
      await base44.entities.Listing.update(listing.id, {
        status: 'sold'
      });

      // Create payout for seller
      const platformFeeRate = 0.05; // 5% for escrow transactions
      const platformFee = Math.round(escrow.amount * platformFeeRate);
      const netAmount = escrow.amount - platformFee;

      await base44.entities.Payout.create({
        host_email: escrow.seller_email,
        amount: escrow.amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: 'pending',
        payout_method: 'Bank Transfer',
      });

      toast.success('Receipt confirmed! Funds released to seller.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error confirming receipt:', err);
      toast.error('Failed to confirm receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Confirm Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              By confirming, you verify that you have received the item in satisfactory condition.
            </AlertDescription>
          </Alert>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-900 text-sm">
              <strong>What happens next:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Funds ($${escrow.amount?.toLocaleString()}) will be released to seller</li>
                <li>Transaction will be marked as complete</li>
                <li>This action cannot be undone</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 text-sm">
              If there's an issue with the item, click "Report Issue" instead to open a dispute.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Receipt
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { Loader2, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfirmDeliveryModal({ open, onClose, escrow, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await base44.entities.Escrow.update(escrow.id, {
        status: 'pending_buyer_confirmation',
        delivery_confirmed_date: new Date().toISOString(),
        tracking_number: trackingNumber || null,
        notes: notes || escrow.notes,
      });

      toast.success('Delivery confirmed! Buyer will be notified.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error confirming delivery:', err);
      toast.error('Failed to confirm delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#FF5124]" />
            Confirm Delivery
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tracking">Tracking Number (Optional)</Label>
            <Input
              id="tracking"
              placeholder="e.g., 1Z999AA10123456784"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Provide tracking info if shipped via carrier
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Delivery Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional delivery details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

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
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm Delivery'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
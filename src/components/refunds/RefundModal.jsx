import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from '@/api/base44Client';
import { Loader2, AlertTriangle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const REFUND_REASONS = [
  { value: 'requested_by_customer', label: 'Customer Request' },
  { value: 'duplicate', label: 'Duplicate Payment' },
  { value: 'fraudulent', label: 'Fraudulent' },
  { value: 'cancelled_booking', label: 'Booking Cancelled' },
  { value: 'service_not_provided', label: 'Service Not Provided' },
  { value: 'other', label: 'Other' }
];

export default function RefundModal({ open, onClose, transaction, booking, onRefundComplete }) {
  const [refundType, setRefundType] = useState('full');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const maxRefundAmount = transaction?.amount || 0;

  const handleSubmit = async () => {
    if (refundType === 'partial' && (!refundAmount || parseFloat(refundAmount) <= 0)) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    if (refundType === 'partial' && parseFloat(refundAmount) > maxRefundAmount) {
      toast.error('Refund amount cannot exceed original payment');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await base44.functions.invoke('processRefund', {
        transaction_id: transaction.id,
        booking_id: booking?.id,
        refund_amount: refundType === 'full' ? maxRefundAmount : parseFloat(refundAmount),
        refund_reason: refundReason,
        notes: additionalNotes
      });

      if (result.data?.success) {
        toast.success('Refund processed successfully');
        if (onRefundComplete) {
          onRefundComplete(result.data);
        }
        onClose();
      } else {
        throw new Error(result.data?.error || 'Failed to process refund');
      }
    } catch (err) {
      console.error('Refund error:', err);
      toast.error(err.message || 'Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Refund payment for {booking ? `Booking #${booking.id.slice(0, 8)}` : 'this transaction'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Details */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Original Amount:</span>
              <span className="font-semibold">${maxRefundAmount.toFixed(2)}</span>
            </div>
            {transaction?.refund_amount && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Already Refunded:</span>
                <span className="font-semibold text-red-600">${transaction.refund_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Available to Refund:</span>
              <span className="font-semibold text-green-600">
                ${(maxRefundAmount - (transaction?.refund_amount || 0)).toFixed(2)}
              </span>
            </div>
          </div>

          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              Refunds are processed immediately and cannot be undone. The customer will receive the refund within 5-10 business days.
            </AlertDescription>
          </Alert>

          {/* Refund Type */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Refund Type</Label>
            <RadioGroup value={refundType} onValueChange={setRefundType}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="full" id="full" />
                <label htmlFor="full" className="flex-1 cursor-pointer">
                  <p className="font-medium">Full Refund</p>
                  <p className="text-sm text-slate-500">${maxRefundAmount.toFixed(2)}</p>
                </label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="partial" id="partial" />
                <label htmlFor="partial" className="flex-1 cursor-pointer">
                  <p className="font-medium">Partial Refund</p>
                  <p className="text-sm text-slate-500">Specify custom amount</p>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Partial Amount */}
          {refundType === 'partial' && (
            <div>
              <Label htmlFor="amount" className="text-sm font-medium">Refund Amount</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxRefundAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {/* Refund Reason */}
          <div>
            <Label htmlFor="reason" className="text-sm font-medium">Reason for Refund</Label>
            <RadioGroup value={refundReason} onValueChange={setRefundReason} className="mt-2">
              {REFUND_REASONS.map(reason => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <label htmlFor={reason.value} className="text-sm cursor-pointer">
                    {reason.label}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Add any additional details about this refund..."
              className="mt-2 min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Process Refund ${refundType === 'full' ? `($${maxRefundAmount.toFixed(2)})` : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
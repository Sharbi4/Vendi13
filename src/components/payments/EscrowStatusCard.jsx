import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, Clock, Package, CheckCircle, 
  AlertTriangle, Truck, Info 
} from 'lucide-react';

const STATUS_CONFIG = {
  pending_payment: {
    label: 'Pending Payment',
    color: 'bg-amber-100 text-amber-800',
    icon: Clock,
    description: 'Waiting for buyer payment'
  },
  funds_held: {
    label: 'Funds Held in Escrow',
    color: 'bg-blue-100 text-blue-800',
    icon: Shield,
    description: 'Payment received, funds safely held'
  },
  pending_delivery: {
    label: 'Pending Delivery',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
    description: 'Waiting for seller to ship/deliver'
  },
  pending_buyer_confirmation: {
    label: 'Awaiting Buyer Confirmation',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Package,
    description: 'Delivered, waiting for buyer to confirm receipt'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Transaction completed, funds released'
  },
  disputed: {
    label: 'Disputed',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    description: 'Issue reported, under review'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: AlertTriangle,
    description: 'Transaction cancelled'
  }
};

export default function EscrowStatusCard({ 
  escrow, 
  listing, 
  isBuyer, 
  onConfirmDelivery,
  onConfirmReceipt,
  onDispute 
}) {
  const statusConfig = STATUS_CONFIG[escrow.status];
  const StatusIcon = statusConfig.icon;

  const canConfirmDelivery = !isBuyer && escrow.status === 'funds_held';
  const canConfirmReceipt = isBuyer && escrow.status === 'pending_buyer_confirmation';
  const canDispute = isBuyer && ['pending_buyer_confirmation', 'pending_delivery'].includes(escrow.status);

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Escrow Protection
          </CardTitle>
          <Badge className={statusConfig.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Description */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            {statusConfig.description}
          </AlertDescription>
        </Alert>

        {/* Transaction Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Escrow Amount:</span>
            <span className="font-semibold text-slate-900">${escrow.amount?.toLocaleString()}</span>
          </div>
          {escrow.tracking_number && (
            <div className="flex justify-between">
              <span className="text-slate-600">Tracking Number:</span>
              <span className="font-mono text-slate-900">{escrow.tracking_number}</span>
            </div>
          )}
          {escrow.delivery_confirmed_date && (
            <div className="flex justify-between">
              <span className="text-slate-600">Delivery Confirmed:</span>
              <span className="text-slate-900">
                {new Date(escrow.delivery_confirmed_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              escrow.payment_intent_id ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {escrow.payment_intent_id ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Clock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Payment Received</p>
              <p className="text-xs text-slate-500">Funds held securely</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              escrow.delivery_confirmed_date ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {escrow.delivery_confirmed_date ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Clock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Item Delivered</p>
              <p className="text-xs text-slate-500">Seller confirms shipment</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              escrow.buyer_confirmed_date ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {escrow.buyer_confirmed_date ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Clock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Buyer Confirms Receipt</p>
              <p className="text-xs text-slate-500">Transaction complete</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          {canConfirmDelivery && (
            <Button 
              onClick={onConfirmDelivery}
              className="w-full bg-[#FF5124] hover:bg-[#e5481f]"
            >
              <Truck className="w-4 h-4 mr-2" />
              Confirm Delivery/Shipment
            </Button>
          )}

          {canConfirmReceipt && (
            <Button 
              onClick={onConfirmReceipt}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Receipt & Release Funds
            </Button>
          )}

          {canDispute && (
            <Button 
              onClick={onDispute}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          )}
        </div>

        {/* Escrow Info */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Funds are held securely until buyer confirms receipt. 
            If there's an issue, dispute resolution protects both parties.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
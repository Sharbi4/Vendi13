import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, Building2, Wallet, Plus, Check, 
  AlertCircle, Trash2, Loader2, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import StripeConnectButton from './StripeConnectButton';

export default function PayoutMethodsManager({ userEmail }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const queryClient = useQueryClient();

  const { data: payoutMethods = [], isLoading } = useQuery({
    queryKey: ['payout-methods', userEmail],
    queryFn: async () => {
      return await base44.entities.PayoutMethod.filter({ host_email: userEmail });
    },
    enabled: !!userEmail,
  });

  const addMethodMutation = useMutation({
    mutationFn: async (data) => {
      // If this is set as default, unset other defaults first
      if (data.is_default) {
        const defaults = payoutMethods.filter(m => m.is_default);
        for (const method of defaults) {
          await base44.entities.PayoutMethod.update(method.id, { is_default: false });
        }
      }
      return await base44.entities.PayoutMethod.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payout-methods']);
      setShowAddModal(false);
      toast.success('Payout method added successfully');
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.PayoutMethod.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payout-methods']);
      toast.success('Payout method removed');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id) => {
      // Unset all defaults
      for (const method of payoutMethods) {
        if (method.is_default) {
          await base44.entities.PayoutMethod.update(method.id, { is_default: false });
        }
      }
      // Set new default
      return await base44.entities.PayoutMethod.update(id, { is_default: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payout-methods']);
      toast.success('Default payout method updated');
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this payout method?')) {
      deleteMethodMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
      </div>
    );
  }

  const stripeMethod = payoutMethods.find(m => m.method_type === 'stripe');

  return (
    <div className="space-y-6">
      {/* Stripe Connect Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Stripe Connect (Recommended)</h3>
        <p className="text-sm text-slate-500 mb-4">Fast, automatic payouts directly to your bank</p>
        <StripeConnectButton userEmail={userEmail} existingStripeMethod={stripeMethod} />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">Or use other methods</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Other Payout Methods</h3>
          <p className="text-sm text-slate-500">Bank transfer or PayPal</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Method
        </Button>
      </div>

      {payoutMethods.filter(m => m.method_type !== 'stripe').length === 0 ? (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            No additional payout methods configured.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {payoutMethods
            .filter(m => m.method_type !== 'stripe')
            .map((method) => (
              <PayoutMethodCard
                key={method.id}
                method={method}
                onSetDefault={() => setDefaultMutation.mutate(method.id)}
                onDelete={() => handleDelete(method.id)}
              />
            ))}
        </div>
      )}

      <AddPayoutMethodModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        userEmail={userEmail}
        selectedMethod={selectedMethod}
        setSelectedMethod={setSelectedMethod}
        onAdd={(data) => addMethodMutation.mutate(data)}
        isLoading={addMethodMutation.isPending}
      />
    </div>
  );
}

function PayoutMethodCard({ method, onSetDefault, onDelete }) {
  const methodIcons = {
    bank_transfer: Building2,
    paypal: Wallet,
    stripe: CreditCard,
  };

  const Icon = methodIcons[method.method_type] || CreditCard;

  const getDisplayInfo = () => {
    if (method.method_type === 'bank_transfer') {
      return `${method.bank_name || 'Bank'} •••• ${method.bank_account_number?.slice(-4) || '****'}`;
    } else if (method.method_type === 'paypal') {
      return method.paypal_email;
    } else if (method.method_type === 'stripe') {
      return `Stripe Account`;
    }
  };

  const statusConfig = {
    verified: { color: 'bg-green-100 text-green-800', text: 'Verified' },
    pending_verification: { color: 'bg-amber-100 text-amber-800', text: 'Pending' },
    failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
  };

  const status = statusConfig[method.status] || statusConfig.pending_verification;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#FF5124]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-slate-900 capitalize">
                  {method.method_type.replace('_', ' ')}
                </p>
                {method.is_default && (
                  <Badge className="bg-[#FF5124] text-white text-xs">Default</Badge>
                )}
                <Badge className={`${status.color} text-xs border-0`}>
                  {status.text}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{getDisplayInfo()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!method.is_default && method.status === 'verified' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSetDefault}
              >
                <Check className="w-4 h-4 mr-2" />
                Set Default
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddPayoutMethodModal({ open, onClose, userEmail, selectedMethod, setSelectedMethod, onAdd, isLoading }) {
  const [formData, setFormData] = useState({
    bank_account_number: '',
    bank_routing_number: '',
    bank_account_name: '',
    bank_name: '',
    paypal_email: '',
    is_default: false,
  });

  const handleSubmit = () => {
    const data = {
      host_email: userEmail,
      method_type: selectedMethod,
      is_default: formData.is_default,
      status: 'pending_verification',
    };

    if (selectedMethod === 'bank_transfer') {
      if (!formData.bank_account_number || !formData.bank_routing_number || !formData.bank_account_name) {
        toast.error('Please fill in all bank account details');
        return;
      }
      data.bank_account_number = formData.bank_account_number;
      data.bank_routing_number = formData.bank_routing_number;
      data.bank_account_name = formData.bank_account_name;
      data.bank_name = formData.bank_name;
    } else if (selectedMethod === 'paypal') {
      if (!formData.paypal_email) {
        toast.error('Please enter PayPal email');
        return;
      }
      data.paypal_email = formData.paypal_email;
    }

    onAdd(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Payout Method</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="w-4 h-4" />
            <AlertDescription className="text-sm text-blue-900">
              Your payment information is encrypted and secure
            </AlertDescription>
          </Alert>

          <div>
            <Label className="text-sm font-medium mb-3 block">Select Method</Label>
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="bank_transfer" />
                <Building2 className="w-5 h-5 text-slate-600" />
                <div className="flex-1">
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-xs text-slate-500">Direct deposit to bank account</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 mt-3">
                <RadioGroupItem value="paypal" />
                <Wallet className="w-5 h-5 text-slate-600" />
                <div className="flex-1">
                  <p className="font-medium">PayPal</p>
                  <p className="text-xs text-slate-500">Receive via PayPal account</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {selectedMethod === 'bank_transfer' && (
            <div className="space-y-4">
              <div>
                <Label>Account Holder Name *</Label>
                <Input
                  value={formData.bank_account_name}
                  onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Bank Name *</Label>
                <Input
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="Chase Bank"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Account Number *</Label>
                <Input
                  type="password"
                  value={formData.bank_account_number}
                  onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                  placeholder="••••••••••"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Routing Number *</Label>
                <Input
                  value={formData.bank_routing_number}
                  onChange={(e) => setFormData({ ...formData, bank_routing_number: e.target.value })}
                  placeholder="123456789"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'paypal' && (
            <div>
              <Label>PayPal Email *</Label>
              <Input
                type="email"
                value={formData.paypal_email}
                onChange={(e) => setFormData({ ...formData, paypal_email: e.target.value })}
                placeholder="your@paypal.com"
                className="mt-2"
              />
            </div>
          )}

          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label className="text-sm">Set as default payout method</Label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Method'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
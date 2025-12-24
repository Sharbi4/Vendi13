import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function SaleFeaturesStep({ formData, updateField }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-4">Delivery Options * (select at least one)</p>
        
        {/* Local Pickup */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-3">
          <div>
            <Label className="text-sm font-medium">Local Pickup</Label>
            <p className="text-xs text-slate-500">Buyer arranges pickup from your location</p>
          </div>
          <Switch
            checked={formData.local_pickup_available}
            onCheckedChange={(v) => updateField('local_pickup_available', v)}
          />
        </div>

        {/* Third-Party Freight Delivery */}
        <div className="p-4 bg-gray-50 rounded-xl mb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-sm font-medium">Third-Party Freight Shipping</Label>
              <p className="text-xs text-slate-500">Professional freight provider ($4/mile, 48 states)</p>
            </div>
            <Switch
              checked={formData.freight_delivery_available}
              onCheckedChange={(v) => updateField('freight_delivery_available', v)}
              aria-label="Enable third-party freight shipping"
            />
          </div>
          {formData.freight_delivery_available && (
            <div>
              <Label className="text-xs text-slate-500 mb-2 block">Who Pays Freight?</Label>
              <Select value={formData.freight_paid_by} onValueChange={(v) => updateField('freight_paid_by', v)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer Pays Freight</SelectItem>
                  <SelectItem value="seller">Seller Pays (included in price)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-2">
                $4 per mile • Contiguous 48 states only
              </p>
            </div>
          )}
        </div>

        {/* Seller-Provided Freight Shipping */}
        <div className="p-4 bg-gray-50 rounded-xl mb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-sm font-medium">Seller-Provided Freight Shipping</Label>
              <p className="text-xs text-slate-500">You arrange and provide freight shipping</p>
            </div>
            <Switch
              checked={formData.seller_delivery_available}
              onCheckedChange={(v) => updateField('seller_delivery_available', v)}
              aria-label="Enable seller-provided freight shipping"
            />
          </div>
        </div>

        {/* Free Shipping */}
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Label className="text-sm font-medium text-green-900">Free Shipping Included</Label>
              <p className="text-xs text-green-700">Delivery included in the sale price</p>
            </div>
            <Switch
              checked={formData.delivery_included}
              onCheckedChange={(v) => {
                updateField('delivery_included', v);
                if (!v) updateField('delivery_included_max_miles', null);
              }}
              aria-label="Include free shipping"
            />
          </div>
          {formData.delivery_included && (
            <div className="mt-3">
              <Label className="text-xs text-green-800 mb-2 block">Maximum Free Delivery Distance (miles)</Label>
              <input
                type="number"
                placeholder="e.g., 100"
                value={formData.delivery_included_max_miles || ''}
                onChange={(e) => updateField('delivery_included_max_miles', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
              />
              <p className="text-xs text-green-700 mt-1">
                Leave blank for unlimited distance
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add-ons */}
      <div>
        <Label className="text-sm font-medium mb-4 block">Optional Add-ons</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div>
              <Label className="text-sm font-medium">Title Verification</Label>
              <p className="text-xs text-slate-500">Professional title verification ($35)</p>
            </div>
            <Switch
              checked={formData.title_verification_available}
              onCheckedChange={(v) => updateField('title_verification_available', v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div>
              <Label className="text-sm font-medium">Online Notary</Label>
              <p className="text-xs text-slate-500">Virtual notary service ($50)</p>
            </div>
            <Switch
              checked={formData.online_notary_available}
              onCheckedChange={(v) => updateField('online_notary_available', v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div>
              <Label className="text-sm font-medium">Escrow Service</Label>
              <p className="text-xs text-slate-500">Secure transaction (free)</p>
            </div>
            <Switch
              checked={formData.escrow_available}
              onCheckedChange={(v) => updateField('escrow_available', v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/9bb0d1b8a_Proof-lockup-black.jpg" 
                alt="Proof"
                className="h-5 w-auto"
              />
              <div>
                <Label className="text-sm font-medium">Both Party Notarized Sale Receipt</Label>
                <p className="text-xs text-slate-500">Provided by Proof - Professional notary service ($60)</p>
              </div>
            </div>
            <Switch
              checked={formData.notarized_receipt_available}
              onCheckedChange={(v) => updateField('notarized_receipt_available', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
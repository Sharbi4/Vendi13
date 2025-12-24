import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';

export default function LocationStep({ formData, updateField }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800 font-medium">Privacy & Safety</p>
          <p className="text-sm text-amber-700 mt-1">
            Your full address is kept private. Only city, state, and ZIP will be shown publicly on your listing. 
            The exact address is only revealed after successful booking or purchase.
          </p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Full Address (Private)</Label>
        <Input
          placeholder="123 Main Street, Phoenix, AZ 85001"
          value={formData.private_address}
          onChange={(e) => updateField('private_address', e.target.value)}
          className="mt-2 h-12 rounded-xl"
        />
        <p className="text-xs text-slate-500 mt-1">Used for logistics only, never shown publicly</p>
      </div>

      <div>
        <Label className="text-sm font-medium">Public Location (City, State) *</Label>
        <Input
          placeholder="Phoenix, AZ"
          value={formData.public_location_label}
          onChange={(e) => updateField('public_location_label', e.target.value)}
          className="mt-2 h-12 rounded-xl"
        />
        <p className="text-xs text-slate-500 mt-1">This will be displayed on your listing</p>
      </div>

      <div>
        <Label className="text-sm font-medium">ZIP Code *</Label>
        <Input
          placeholder="85001"
          value={formData.zip_code}
          onChange={(e) => updateField('zip_code', e.target.value)}
          className="mt-2 h-12 rounded-xl max-w-[200px]"
          maxLength={10}
        />
        <p className="text-xs text-slate-500 mt-1">Shown publicly for local search</p>
      </div>
    </div>
  );
}
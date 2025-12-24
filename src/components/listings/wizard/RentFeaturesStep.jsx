import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const DOCUMENT_OPTIONS = [
  'General Liability Insurance',
  'Business License',
  'Food Handler Certificate',
  'Health Permit',
  'Vehicle Insurance',
  'Driver\'s License',
];

export default function RentFeaturesStep({ formData, updateField }) {
  const toggleDocument = (doc) => {
    const current = formData.required_documents || [];
    if (current.includes(doc)) {
      updateField('required_documents', current.filter(d => d !== doc));
    } else {
      updateField('required_documents', [...current, doc]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pickup */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-sm font-medium">Pickup Available *</Label>
            <p className="text-xs text-slate-500">Renter picks up from your location</p>
          </div>
          <Switch
            checked={formData.pickup_enabled}
            onCheckedChange={(v) => updateField('pickup_enabled', v)}
          />
        </div>
        {formData.pickup_enabled && (
          <Textarea
            placeholder="Pickup instructions (hours, location details, parking info, etc.)"
            value={formData.pickup_instructions}
            onChange={(e) => updateField('pickup_instructions', e.target.value)}
            className="h-20 rounded-xl"
          />
        )}
      </div>

      {/* Delivery */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-sm font-medium">Delivery Available *</Label>
            <p className="text-xs text-slate-500">You deliver to renter's location</p>
          </div>
          <Switch
            checked={formData.delivery_available}
            onCheckedChange={(v) => updateField('delivery_available', v)}
          />
        </div>
        {formData.delivery_available && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Max Delivery Distance (miles)</Label>
              <Input
                type="number"
                placeholder="50"
                value={formData.delivery_max_miles}
                onChange={(e) => updateField('delivery_max_miles', e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Rate per Mile ($)</Label>
              <Input
                type="number"
                step="0.50"
                placeholder="2.50"
                value={formData.delivery_rate_per_mile}
                onChange={(e) => updateField('delivery_rate_per_mile', e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          </div>
        )}
      </div>

      {/* Required Documents */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Required Documents from Renter</Label>
        <p className="text-xs text-slate-500 mb-3">Select all documents you require before renting</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {DOCUMENT_OPTIONS.map((doc) => (
            <label key={doc} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.required_documents?.includes(doc)}
                onChange={() => toggleDocument(doc)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{doc}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, UtensilsCrossed, Building2, Wrench, Package, MapPin } from 'lucide-react';

const CATEGORIES = [
  { id: 'food_truck', label: 'Food Truck', icon: Truck, desc: 'Mobile food service vehicle' },
  { id: 'food_trailer', label: 'Food Trailer', icon: UtensilsCrossed, desc: 'Towable food trailer' },
  { id: 'ghost_kitchen', label: 'Ghost Kitchen', icon: Building2, desc: 'Commercial kitchen space' },
  { id: 'vendor_lot', label: 'Vendor Lot', icon: MapPin, desc: 'Space for food trucks/vendors' },
  { id: 'equipment', label: 'Equipment', icon: Wrench, desc: 'Commercial kitchen equipment' },
  { id: 'other', label: 'Other', icon: Package, desc: 'Other mobile assets' },
];

export default function CategorySelector({ value, onChange }) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid sm:grid-cols-2 gap-3">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <label
            key={cat.id}
            className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              value === cat.id
                ? 'border-[#FF5124] bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <RadioGroupItem value={cat.id} className="sr-only" />
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              value === cat.id ? 'bg-[#FF5124] text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{cat.label}</p>
              <p className="text-sm text-slate-500">{cat.desc}</p>
            </div>
          </label>
        );
      })}
    </RadioGroup>
  );
}
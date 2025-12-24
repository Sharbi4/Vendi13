import React from 'react';
import { Truck, UtensilsCrossed, Building2, Wrench, Package, ParkingCircle } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'food_truck', label: 'Food Trucks', icon: Truck },
  { id: 'food_trailer', label: 'Food Trailers', icon: UtensilsCrossed },
  { id: 'ghost_kitchen', label: 'Ghost Kitchens', icon: Building2 },
  { id: 'vendor_lot', label: 'Vendor Lots', icon: ParkingCircle },
  { id: 'equipment', label: 'Equipment', icon: Wrench },
  { id: 'other', label: 'Other', icon: Package },
];

export default function CategoryPills({ selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selected === cat.id || (!selected && cat.id === 'all');
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id === 'all' ? null : cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all flex-shrink-0 ${
              isSelected
                ? 'bg-[#FF5124] text-white border-[#FF5124]'
                : 'bg-white text-slate-700 border-gray-200 hover:border-[#FF5124]'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span className="text-sm font-medium">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
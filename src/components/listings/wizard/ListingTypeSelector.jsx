import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, DollarSign } from 'lucide-react';

export default function ListingTypeSelector({ value, onChange }) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label
        className={`relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 cursor-pointer transition-all ${
          value === 'rent'
            ? 'border-[#FF5124] bg-orange-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <RadioGroupItem value="rent" className="sr-only" />
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          value === 'rent' ? 'bg-[#FF5124] text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          <Calendar className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-slate-900">Rent this asset</p>
          <p className="text-sm text-slate-500 mt-1">Earn recurring income by renting out</p>
        </div>
      </label>
      
      <label
        className={`relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 cursor-pointer transition-all ${
          value === 'sale'
            ? 'border-[#FF5124] bg-orange-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <RadioGroupItem value="sale" className="sr-only" />
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          value === 'sale' ? 'bg-[#FF5124] text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          <DollarSign className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-slate-900">Sell this asset</p>
          <p className="text-sm text-slate-500 mt-1">List for sale to buyers</p>
        </div>
      </label>
    </RadioGroup>
  );
}
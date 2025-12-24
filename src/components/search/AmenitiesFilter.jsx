import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Wifi, Snowflake, Zap, Droplets, Flame, Wind,
  Refrigerator, UtensilsCrossed, Coffee, Microwave,
  ChefHat, Sparkles, Camera, Music, ChevronDown, ChevronUp
} from 'lucide-react';

const AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi, category: 'connectivity' },
  { id: 'ac', label: 'Air Conditioning', icon: Snowflake, category: 'climate' },
  { id: 'heating', label: 'Heating', icon: Flame, category: 'climate' },
  { id: 'ventilation', label: 'Ventilation Hood', icon: Wind, category: 'climate' },
  { id: 'generator', label: 'Generator', icon: Zap, category: 'power' },
  { id: 'shore_power', label: 'Shore Power', icon: Zap, category: 'power' },
  { id: 'water_tank', label: 'Fresh Water Tank', icon: Droplets, category: 'water' },
  { id: 'hot_water', label: 'Hot Water System', icon: Droplets, category: 'water' },
  { id: 'refrigerator', label: 'Refrigerator', icon: Refrigerator, category: 'equipment' },
  { id: 'freezer', label: 'Freezer', icon: Snowflake, category: 'equipment' },
  { id: 'griddle', label: 'Flat Top Griddle', icon: UtensilsCrossed, category: 'cooking' },
  { id: 'fryer', label: 'Deep Fryer', icon: ChefHat, category: 'cooking' },
  { id: 'oven', label: 'Oven', icon: ChefHat, category: 'cooking' },
  { id: 'stove', label: 'Stove/Burners', icon: Flame, category: 'cooking' },
  { id: 'grill', label: 'Grill', icon: Flame, category: 'cooking' },
  { id: 'microwave', label: 'Microwave', icon: Microwave, category: 'cooking' },
  { id: 'coffee_maker', label: 'Coffee Maker', icon: Coffee, category: 'beverage' },
  { id: 'ice_maker', label: 'Ice Maker', icon: Snowflake, category: 'beverage' },
  { id: 'pos_system', label: 'POS System', icon: Camera, category: 'tech' },
  { id: 'sound_system', label: 'Sound System', icon: Music, category: 'tech' },
  { id: 'fire_suppression', label: 'Fire Suppression', icon: Sparkles, category: 'safety' },
  { id: 'prep_station', label: 'Prep Station', icon: UtensilsCrossed, category: 'workspace' },
  { id: 'sink', label: 'Hand Wash Sink', icon: Droplets, category: 'workspace' },
  { id: 'storage', label: 'Storage Shelving', icon: Refrigerator, category: 'workspace' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Amenities' },
  { id: 'essential', label: 'Essential', items: ['wifi', 'ac', 'generator', 'water_tank'] },
  { id: 'cooking', label: 'Cooking Equipment', items: ['griddle', 'fryer', 'oven', 'stove', 'grill', 'microwave'] },
  { id: 'refrigeration', label: 'Refrigeration', items: ['refrigerator', 'freezer', 'ice_maker'] },
  { id: 'power', label: 'Power & Climate', items: ['generator', 'shore_power', 'ac', 'heating', 'ventilation'] },
];

export default function AmenitiesFilter({ selected = [], onChange }) {
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const getDisplayAmenities = () => {
    if (activeCategory === 'all') {
      return showAll ? AMENITIES : AMENITIES.slice(0, 12);
    }
    
    const category = CATEGORIES.find(c => c.id === activeCategory);
    if (category && category.items) {
      return AMENITIES.filter(a => category.items.includes(a.id));
    }
    
    return AMENITIES;
  };

  const handleToggle = (amenityId) => {
    const newSelected = selected.includes(amenityId)
      ? selected.filter(id => id !== amenityId)
      : [...selected, amenityId];
    onChange(newSelected);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const displayAmenities = getDisplayAmenities();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-900">
          Amenities {selected.length > 0 && `(${selected.length} selected)`}
        </Label>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs text-[#FF5124] h-auto p-0"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-[#FF5124] text-white'
                : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Amenities Grid */}
      <div className="grid grid-cols-2 gap-3">
        {displayAmenities.map((amenity) => {
          const Icon = amenity.icon;
          const isSelected = selected.includes(amenity.id);
          
          return (
            <label
              key={amenity.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#FF5124] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggle(amenity.id)}
                className="data-[state=checked]:bg-[#FF5124] data-[state=checked]:border-[#FF5124]"
              />
              <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#FF5124]' : 'text-slate-400'}`} />
              <span className={`text-sm ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                {amenity.label}
              </span>
            </label>
          );
        })}
      </div>

      {/* Show More/Less */}
      {activeCategory === 'all' && AMENITIES.length > 12 && (
        <Button
          variant="ghost"
          onClick={() => setShowAll(!showAll)}
          className="w-full text-sm text-slate-600 hover:text-slate-900"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show {AMENITIES.length - 12} more amenities
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export { AMENITIES };
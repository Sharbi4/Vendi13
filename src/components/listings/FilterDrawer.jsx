import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Star, Zap, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import AmenitiesFilter from '../search/AmenitiesFilter';

export default function FilterDrawer({ open, onClose, filters, setFilters, mode, onApply, onReset }) {
  const maxPrice = mode === 'rent' ? 1000 : 200000;
  const priceStep = mode === 'rent' ? 10 : 1000;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-slate-900">Filters</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">
              Price Range {mode === 'rent' ? '(per day)' : ''}
            </Label>
            <Slider
              value={[filters.minPrice || 0, filters.maxPrice || maxPrice]}
              onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
              max={maxPrice}
              step={priceStep}
              className="mb-4"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Min Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    value={filters.minPrice || 0}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      minPrice: Math.max(0, Math.min(parseInt(e.target.value) || 0, maxPrice))
                    }))}
                    className="pl-8 rounded-lg"
                    min={0}
                    max={maxPrice}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Max Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    value={filters.maxPrice || maxPrice}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      maxPrice: Math.max(0, Math.min(parseInt(e.target.value) || maxPrice, maxPrice))
                    }))}
                    className="pl-8 rounded-lg"
                    min={0}
                    max={maxPrice}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Availability Dates - For Rentals */}
          {mode === 'rent' && (
            <>
              <div>
                <Label className="text-sm font-medium text-slate-900 mb-3 block">
                  Availability Dates
                </Label>
                <div className="space-y-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal rounded-xl"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDate ? (
                          format(new Date(filters.startDate), 'MMM dd, yyyy')
                        ) : (
                          <span className="text-gray-500">Check-in date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.startDate ? new Date(filters.startDate) : undefined}
                        onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date?.toISOString() }))}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal rounded-xl"
                        disabled={!filters.startDate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.endDate ? (
                          format(new Date(filters.endDate), 'MMM dd, yyyy')
                        ) : (
                          <span className="text-gray-500">Check-out date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.endDate ? new Date(filters.endDate) : undefined}
                        onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date?.toISOString() }))}
                        disabled={(date) => 
                          date < new Date() || 
                          (filters.startDate && date <= new Date(filters.startDate))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {(filters.startDate || filters.endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        startDate: null, 
                        endDate: null 
                      }))}
                      className="w-full text-sm text-gray-600"
                    >
                      Clear dates
                    </Button>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Condition Filter - For Both Rent & Sale */}
          <div>
            <Label className="text-sm font-medium text-slate-900 mb-2 block">Condition</Label>
            <Select
              value={filters.condition || 'any'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, condition: v === 'any' ? null : v }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Instant Book */}
          {mode === 'rent' && (
            <>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-600" />
                    <div>
                      <Label className="text-sm font-medium text-slate-900">Instant Book</Label>
                      <p className="text-xs text-slate-500">Book without waiting for approval</p>
                    </div>
                  </div>
                  <Switch
                    checked={filters.instant_book || false}
                    onCheckedChange={(v) => setFilters(prev => ({ ...prev, instant_book: v }))}
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Rating Filter */}
          <div>
            <Label className="text-sm font-medium text-slate-900 mb-3 block">Minimum Rating</Label>
            <div className="space-y-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <label
                  key={rating}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    (filters.min_rating || 0) === rating
                      ? 'border-[#FF5124] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rating-drawer"
                    checked={(filters.min_rating || 0) === rating}
                    onChange={() => setFilters(prev => ({ ...prev, min_rating: rating }))}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-1">
                    {rating === 0 ? (
                      <span className="text-sm font-medium text-slate-700">Any rating</span>
                    ) : (
                      <>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-slate-900">{rating}+</span>
                      </>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Equipment & Features */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Equipment & Features</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-700">Refrigeration</Label>
                <Switch
                  checked={filters.refrigeration || false}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, refrigeration: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-700">Hood System</Label>
                <Switch
                  checked={filters.hood_system || false}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, hood_system: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-700">Generator</Label>
                <Switch
                  checked={filters.generator_included || false}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, generator_included: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-700">Propane</Label>
                <Switch
                  checked={filters.propane || false}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, propane: v }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <AmenitiesFilter
              selected={filters.amenities || []}
              onChange={(amenities) => setFilters(prev => ({ ...prev, amenities }))}
            />
          </div>

          <Separator />

          {/* Listing Type Specific Filters */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              {mode === 'rent' ? 'Rental' : 'Sale'} Options
            </h3>
            {mode === 'rent' ? (
              <div className="space-y-4">
                {/* Delivery */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-slate-900">Delivery available</Label>
                    <p className="text-xs text-slate-500">Asset can be delivered</p>
                  </div>
                  <Switch
                    checked={filters.delivery_available || false}
                    onCheckedChange={(v) => setFilters(prev => ({ ...prev, delivery_available: v }))}
                  />
                </div>

                {/* Power Type */}
                <div>
                  <Label className="text-sm font-medium text-slate-900 mb-2 block">Power Type</Label>
                  <Select
                    value={filters.power_type || 'any'}
                    onValueChange={(v) => setFilters(prev => ({ ...prev, power_type: v === 'any' ? null : v }))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                      <SelectItem value="generator">Generator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Water Hookup */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-slate-900">Water hookup</Label>
                    <p className="text-xs text-slate-500">Has water connection</p>
                  </div>
                  <Switch
                    checked={filters.water_hookup || false}
                    onCheckedChange={(v) => setFilters(prev => ({ ...prev, water_hookup: v }))}
                  />
                </div>

                {/* Verified */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-slate-900">Verified only</Label>
                    <p className="text-xs text-slate-500">Show only verified listings</p>
                  </div>
                  <Switch
                    checked={filters.verified_only || false}
                    onCheckedChange={(v) => setFilters(prev => ({ ...prev, verified_only: v }))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Local Pickup */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-slate-900">Local pickup</Label>
                    <p className="text-xs text-slate-500">Available for pickup</p>
                  </div>
                  <Switch
                    checked={filters.local_pickup || false}
                    onCheckedChange={(v) => setFilters(prev => ({ ...prev, local_pickup: v }))}
                  />
                </div>

                {/* Delivery Included */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-slate-900">Delivery included</Label>
                    <p className="text-xs text-slate-500">Delivery in price</p>
                  </div>
                  <Switch
                    checked={filters.delivery_included || false}
                    onCheckedChange={(v) => setFilters(prev => ({ ...prev, delivery_included: v }))}
                  />
                </div>

                {/* Title Verified */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-slate-900">Title verified</Label>
                    <p className="text-xs text-slate-500">Title has been verified</p>
                  </div>
                  <Switch
                    checked={filters.title_verified || false}
                    onCheckedChange={(v) => setFilters(prev => ({ ...prev, title_verified: v }))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1 rounded-xl"
          >
            Reset
          </Button>
          <Button
            onClick={onApply}
            className="flex-1 bg-[#FF5124] hover:bg-[#e5481f] rounded-xl"
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
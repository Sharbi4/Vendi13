import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, DollarSign, X } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function AvailabilityManager({ listing }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [priceOverride, setPriceOverride] = useState('');
  const [pricingTiers, setPricingTiers] = useState({
    daily: listing.daily_price || '',
    weekly: listing.weekly_price || '',
    monthly: listing.monthly_price || '',
  });
  const queryClient = useQueryClient();

  const updateListingMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Listing.update(listing.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      setSelectedDates([]);
      setPriceOverride('');
    },
  });

  const handleBlockDates = () => {
    const blockedDates = listing.blocked_dates || [];
    const newBlockedDates = selectedDates.map(d => format(d, 'yyyy-MM-dd'));
    const updated = [...new Set([...blockedDates, ...newBlockedDates])];
    
    updateListingMutation.mutate({ blocked_dates: updated });
  };

  const handleUnblockDate = (dateStr) => {
    const blockedDates = listing.blocked_dates || [];
    const updated = blockedDates.filter(d => d !== dateStr);
    
    updateListingMutation.mutate({ blocked_dates: updated });
  };

  const handleQuickBlock = (days) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      dates.push(addDays(new Date(), i));
    }
    setSelectedDates(dates);
  };

  const handlePricingUpdate = () => {
    const updates = {};
    if (priceOverride) {
      updates.daily_price = parseFloat(priceOverride);
    }
    updateListingMutation.mutate(updates);
  };

  const handlePricingTiersUpdate = () => {
    updateListingMutation.mutate({
      daily_price: parseFloat(pricingTiers.daily) || listing.daily_price,
      weekly_price: parseFloat(pricingTiers.weekly) || null,
      monthly_price: parseFloat(pricingTiers.monthly) || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Availability & Pricing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="availability">
          <TabsList className="mb-4">
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Overrides</TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleQuickBlock(7)}
                variant="outline"
                size="sm"
              >
                Block Next 7 Days
              </Button>
              <Button
                onClick={() => handleQuickBlock(14)}
                variant="outline"
                size="sm"
              >
                Block Next 14 Days
              </Button>
              <Button
                onClick={() => handleQuickBlock(30)}
                variant="outline"
                size="sm"
              >
                Block Next Month
              </Button>
            </div>

            {/* Calendar */}
            <div className="border rounded-xl p-4">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={setSelectedDates}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="w-full"
              />
            </div>

            {selectedDates.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-900">
                  {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                </p>
                <Button
                  onClick={handleBlockDates}
                  className="bg-[#FF5124] hover:bg-[#e5481f]"
                  size="sm"
                >
                  Block Dates
                </Button>
              </div>
            )}

            {/* Currently Blocked Dates */}
            {listing.blocked_dates && listing.blocked_dates.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Currently Blocked Dates</Label>
                <div className="flex flex-wrap gap-2">
                  {listing.blocked_dates.map((dateStr) => (
                    <div
                      key={dateStr}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-sm"
                    >
                      <span className="text-red-900">{format(new Date(dateStr), 'MMM d, yyyy')}</span>
                      <button
                        onClick={() => handleUnblockDate(dateStr)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="space-y-4">
              {/* Pricing Tiers */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <Label className="text-sm font-semibold text-slate-900 mb-3 block">
                  Pricing Tiers
                </Label>
                <div className="grid sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Daily Rate ($)</Label>
                    <Input
                      type="number"
                      value={pricingTiers.daily}
                      onChange={(e) => setPricingTiers({ ...pricingTiers, daily: e.target.value })}
                      placeholder="250"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Weekly Rate ($)</Label>
                    <Input
                      type="number"
                      value={pricingTiers.weekly}
                      onChange={(e) => setPricingTiers({ ...pricingTiers, weekly: e.target.value })}
                      placeholder="1500"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Monthly Rate ($)</Label>
                    <Input
                      type="number"
                      value={pricingTiers.monthly}
                      onChange={(e) => setPricingTiers({ ...pricingTiers, monthly: e.target.value })}
                      placeholder="5000"
                      className="bg-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handlePricingTiersUpdate}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                  size="sm"
                >
                  Update All Pricing Tiers
                </Button>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <Label className="text-sm font-medium mb-2 block">Current Pricing</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Daily Rate</span>
                    <span className="font-semibold text-slate-900">${listing.daily_price}</span>
                  </div>
                  {listing.weekly_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Weekly Rate</span>
                      <span className="font-semibold text-slate-900">${listing.weekly_price}</span>
                    </div>
                  )}
                  {listing.monthly_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Monthly Rate</span>
                      <span className="font-semibold text-slate-900">${listing.monthly_price}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-900">
                  <strong>Pro Tip:</strong> Offer weekly and monthly discounts to encourage longer bookings and reduce vacancy.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
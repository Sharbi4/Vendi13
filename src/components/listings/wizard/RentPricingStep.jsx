import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RentPricingStep({ formData, updateField }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const handleGetPricingSuggestions = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Based on the following rental listing details, suggest competitive daily, weekly, and monthly pricing:

Asset Category: ${formData.asset_category || 'food truck'}
Year: ${formData.year || 'not specified'}
Condition: ${formData.condition || 'used'}
Location: ${formData.public_location_label || 'United States'}
Equipment: ${formData.whats_included?.join(', ') || 'standard'}
Features: ${formData.amenities?.join(', ') || 'basic'}
Power Type: ${formData.power_type || 'standard'}

Provide competitive market-based pricing suggestions with reasoning. Return JSON with:
- daily_rate (number)
- weekly_rate (number) 
- monthly_rate (number)
- reasoning (string explaining the pricing)
- market_comparison (string comparing to similar listings)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            daily_rate: { type: 'number' },
            weekly_rate: { type: 'number' },
            monthly_rate: { type: 'number' },
            reasoning: { type: 'string' },
            market_comparison: { type: 'string' }
          }
        }
      });

      setSuggestions(result);
      toast.success('AI pricing suggestions ready!');
    } catch (err) {
      console.error('Error getting pricing suggestions:', err);
      toast.error('Failed to get pricing suggestions');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestions = () => {
    if (suggestions) {
      updateField('daily_price', suggestions.daily_rate?.toString());
      updateField('weekly_price', suggestions.weekly_rate?.toString());
      updateField('monthly_price', suggestions.monthly_rate?.toString());
      toast.success('Pricing applied!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-slate-900">AI Pricing Assistant</p>
            <p className="text-xs text-slate-600">Get market-based pricing suggestions</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleGetPricingSuggestions}
          disabled={isAnalyzing}
          className="bg-blue-600 hover:bg-blue-700 rounded-full"
          size="sm"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get Suggestions
            </>
          )}
        </Button>
      </div>

      {suggestions && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="font-medium text-green-900">Suggested Pricing:</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-green-700">Daily: ${suggestions.daily_rate}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Weekly: ${suggestions.weekly_rate}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Monthly: ${suggestions.monthly_rate}</p>
                  </div>
                </div>
                <p className="text-xs text-green-800 mt-2">{suggestions.reasoning}</p>
                <p className="text-xs text-green-700 italic">{suggestions.market_comparison}</p>
              </div>
              <Button
                type="button"
                onClick={applySuggestions}
                size="sm"
                className="bg-green-600 hover:bg-green-700 ml-3"
              >
                Apply
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label className="text-sm font-medium mb-2 block">Primary Rate Unit</Label>
        <Select value={formData.rate_unit} onValueChange={(v) => updateField('rate_unit', v)}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500 mt-1">This will be the main rate shown in search results</p>
      </div>

      <div>
        <Label className="text-sm font-medium">Daily Rate ($) {formData.rate_unit === 'daily' ? '*' : ''}</Label>
        <div className="relative mt-2">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="number"
            placeholder="250"
            value={formData.daily_price}
            onChange={(e) => updateField('daily_price', e.target.value)}
            className="pl-10 h-12 rounded-xl text-lg"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">Your daily rental rate</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Weekly Rate ($) {formData.rate_unit === 'weekly' ? '*' : ''}</Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="number"
              placeholder="1500"
              value={formData.weekly_price}
              onChange={(e) => updateField('weekly_price', e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          {formData.daily_price && formData.weekly_price && (
            <p className="text-xs text-green-600 mt-1">
              {((1 - (formData.weekly_price / (formData.daily_price * 7))) * 100).toFixed(0)}% discount
            </p>
          )}
        </div>
        <div>
          <Label className="text-sm font-medium">Monthly Rate ($) {formData.rate_unit === 'monthly' ? '*' : ''}</Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="number"
              placeholder="5000"
              value={formData.monthly_price}
              onChange={(e) => updateField('monthly_price', e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          {formData.daily_price && formData.monthly_price && (
            <p className="text-xs text-green-600 mt-1">
              {((1 - (formData.monthly_price / (formData.daily_price * 30))) * 100).toFixed(0)}% discount
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Security Deposit ($)</Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="number"
              placeholder="500"
              value={formData.security_deposit}
              onChange={(e) => updateField('security_deposit', e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Refundable deposit</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Cleaning Fee ($)</Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="number"
              placeholder="100"
              value={formData.cleaning_fee}
              onChange={(e) => updateField('cleaning_fee', e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">One-time cleaning fee</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Minimum Duration (days)</Label>
          <Input
            type="number"
            min="1"
            value={formData.min_duration_days}
            onChange={(e) => updateField('min_duration_days', e.target.value)}
            className="mt-2 h-12 rounded-xl"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Maximum Duration (days)</Label>
          <Input
            type="number"
            min="1"
            value={formData.max_duration_days}
            onChange={(e) => updateField('max_duration_days', e.target.value)}
            className="mt-2 h-12 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
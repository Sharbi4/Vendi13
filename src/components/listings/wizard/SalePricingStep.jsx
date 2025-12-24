import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SalePricingStep({ formData, updateField }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const handleGetPricingSuggestion = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Based on the following asset details, suggest a competitive sale price:

Asset Category: ${formData.asset_category || 'food truck'}
Year: ${formData.year || 'not specified'}
Make/Model: ${formData.make || ''} ${formData.model || ''}
Condition: ${formData.condition || 'used'}
Location: ${formData.public_location_label || 'United States'}
Equipment: ${formData.whats_included?.join(', ') || 'standard'}
Features: ${formData.amenities?.join(', ') || 'basic'}
Size: ${formData.size_length ? `${formData.size_length}' x ${formData.size_width}'` : 'not specified'}

Provide a competitive market-based sale price with detailed reasoning. Return JSON with:
- suggested_price (number)
- price_range_low (number)
- price_range_high (number)
- reasoning (string explaining the valuation)
- market_factors (string describing market conditions)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            suggested_price: { type: 'number' },
            price_range_low: { type: 'number' },
            price_range_high: { type: 'number' },
            reasoning: { type: 'string' },
            market_factors: { type: 'string' }
          }
        }
      });

      setSuggestion(result);
      toast.success('AI pricing suggestion ready!');
    } catch (err) {
      console.error('Error getting pricing suggestion:', err);
      toast.error('Failed to get pricing suggestion');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      updateField('sale_price', suggestion.suggested_price?.toString());
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
            <p className="text-xs text-slate-600">Get market-based valuation</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleGetPricingSuggestion}
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
              Get Valuation
            </>
          )}
        </Button>
      </div>

      {suggestion && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="font-medium text-green-900">Suggested Price: ${suggestion.suggested_price?.toLocaleString()}</p>
                <p className="text-sm text-green-800">
                  Range: ${suggestion.price_range_low?.toLocaleString()} - ${suggestion.price_range_high?.toLocaleString()}
                </p>
                <p className="text-xs text-green-800 mt-2">{suggestion.reasoning}</p>
                <p className="text-xs text-green-700 italic">{suggestion.market_factors}</p>
              </div>
              <Button
                type="button"
                onClick={applySuggestion}
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
        <Label className="text-sm font-medium">Sale Price * ($)</Label>
        <div className="relative mt-2">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="number"
            placeholder="75000"
            value={formData.sale_price}
            onChange={(e) => updateField('sale_price', e.target.value)}
            className="pl-10 h-14 rounded-xl text-xl"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">Your asking price</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <Label className="text-sm font-medium">Accept Offers</Label>
          <p className="text-xs text-slate-500">Allow buyers to make offers below asking price</p>
        </div>
        <Switch
          checked={formData.accept_offers}
          onCheckedChange={(v) => updateField('accept_offers', v)}
        />
      </div>
    </div>
  );
}
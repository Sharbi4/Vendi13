import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BasicInfoStep({ formData, updateField }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const handleGenerateDescription = async () => {
    if (!formData.title && !formData.asset_category) {
      toast.error('Please provide at least a title or category to generate description');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate a compelling listing description for a ${formData.asset_category || 'food service asset'} ${formData.listing_mode === 'sale' ? 'for sale' : 'for rent'}.
      
Title: ${formData.title || 'Not provided'}
Category: ${formData.asset_category || 'Not specified'}
Features: ${formData.whats_included?.join(', ') || 'Standard equipment'}
Condition: ${formData.condition || 'Used'}
Year: ${formData.year || 'Not specified'}
Make/Model: ${formData.make || ''} ${formData.model || ''}

Generate:
1. A catchy title (max 80 characters) if title not provided
2. A short description (max 100 characters) - one compelling sentence
3. A full description (200-400 words) that highlights key features, benefits, and selling points

Format as JSON with keys: title, short_description, description`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            short_description: { type: 'string' },
            description: { type: 'string' }
          }
        }
      });

      if (result.title && !formData.title) updateField('title', result.title.substring(0, 100));
      if (result.short_description) updateField('short_description', result.short_description.substring(0, 120));
      if (result.description) updateField('description', result.description.substring(0, 2000));
      
      toast.success('AI description generated!');
    } catch (err) {
      console.error('Error generating description:', err);
      toast.error('Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600">Let AI help you write compelling descriptions</p>
        <Button
          type="button"
          onClick={handleGenerateDescription}
          disabled={isGenerating}
          variant="outline"
          className="rounded-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
      </div>

      <div>
        <Label className="text-sm font-medium">Listing Title *</Label>
        <Input
          placeholder="e.g., 2020 Custom Food Truck - Fully Equipped"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="mt-2 h-12 rounded-xl"
          maxLength={100}
        />
        <p className="text-xs text-slate-500 mt-1">{formData.title.length}/100 characters (min 5)</p>
      </div>

      <div>
        <Label className="text-sm font-medium">Short Description *</Label>
        <Input
          placeholder="One-line summary that appears in search results"
          value={formData.short_description}
          onChange={(e) => updateField('short_description', e.target.value)}
          className="mt-2 h-12 rounded-xl"
          maxLength={120}
        />
        <p className="text-xs text-slate-500 mt-1">{formData.short_description.length}/120 characters (min 10)</p>
      </div>

      <div>
        <Label className="text-sm font-medium">Full Description *</Label>
        <Textarea
          placeholder="Describe your asset in detail. Include features, condition, history, and what makes it special. Be specific about equipment, recent upgrades, and any unique selling points."
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="mt-2 min-h-[200px] rounded-xl"
          maxLength={2000}
        />
        <p className="text-xs text-slate-500 mt-1">{formData.description.length}/2000 characters (min 20)</p>
      </div>
    </div>
  );
}
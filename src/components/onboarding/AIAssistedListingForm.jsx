import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, Upload, X, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIAssistedListingForm({ user, onComplete, onSkip }) {
  const [formData, setFormData] = useState({
    asset_category: '',
    title: '',
    description: '',
    media: [],
    public_location_label: '',
    daily_price: '',
    condition: 'used',
  });
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateDescriptionMutation = useMutation({
    mutationFn: async () => {
      if (!formData.asset_category || !formData.title) {
        throw new Error('Please provide category and title first');
      }

      const prompt = `Generate a compelling, professional listing description for a ${formData.asset_category.replace('_', ' ')} with the title "${formData.title}". 
      
      The description should:
      - Be 150-200 words
      - Highlight key features and benefits
      - Include what makes it special or unique
      - Mention condition (${formData.condition})
      - Be persuasive but honest
      - End with a call to action
      
      Write in a friendly, professional tone.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      return response;
    },
    onSuccess: (description) => {
      updateField('description', description);
      toast.success('AI description generated!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData(prev => ({
          ...prev,
          media: [...prev.media, file_url],
        }));
        toast.success('Image uploaded');
      } catch (error) {
        toast.error('Failed to upload image');
      }
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const createListingMutation = useMutation({
    mutationFn: async () => {
      const listingData = {
        listing_mode: 'rent',
        asset_category: formData.asset_category,
        title: formData.title,
        description: formData.description,
        media: formData.media,
        public_location_label: formData.public_location_label,
        daily_price: parseFloat(formData.daily_price),
        condition: formData.condition,
        status: 'draft',
      };

      return await base44.entities.Listing.create(listingData);
    },
    onSuccess: (listing) => {
      toast.success('Listing created!');
      onComplete(listing.id);
    },
    onError: (error) => {
      toast.error('Failed to create listing');
    },
  });

  const canSubmit = formData.title && formData.description && formData.asset_category && 
                     formData.public_location_label && formData.daily_price && formData.media.length > 0;

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF5124]" />
          Create Your First Listing
        </CardTitle>
        <p className="text-sm text-slate-500">AI will help you create a compelling listing</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Tip: Fill in the basic details, then let our AI generate a professional description for you!
          </AlertDescription>
        </Alert>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Asset Category *</Label>
            <Select value={formData.asset_category} onValueChange={(v) => updateField('asset_category', v)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food_truck">Food Truck</SelectItem>
                <SelectItem value="food_trailer">Food Trailer</SelectItem>
                <SelectItem value="ghost_kitchen">Ghost Kitchen</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Condition *</Label>
            <Select value={formData.condition} onValueChange={(v) => updateField('condition', v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Listing Title *</Label>
          <Input
            placeholder="e.g., 2020 Custom Food Truck - Fully Equipped"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Description *</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => generateDescriptionMutation.mutate()}
              disabled={!formData.title || !formData.asset_category || generateDescriptionMutation.isPending}
              className="gap-2"
            >
              {generateDescriptionMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
          <Textarea
            placeholder="Describe your asset... or let AI do it for you!"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Location (City, State) *</Label>
            <Input
              placeholder="e.g., Phoenix, AZ"
              value={formData.public_location_label}
              onChange={(e) => updateField('public_location_label', e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Daily Rate ($) *</Label>
            <Input
              type="number"
              placeholder="250"
              value={formData.daily_price}
              onChange={(e) => updateField('daily_price', e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label>Photos * (at least 1)</Label>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {formData.media.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF5124] cursor-pointer flex flex-col items-center justify-center transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="sr-only"
              />
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Upload</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
          >
            Skip for Now
          </Button>
          <Button
            onClick={() => createListingMutation.mutate()}
            disabled={!canSubmit || createListingMutation.isPending}
            className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
          >
            {createListingMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Listing'
            )}
          </Button>
        </div>
      </CardContent>
    </>
  );
}
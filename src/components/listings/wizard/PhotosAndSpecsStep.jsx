import React from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { validateFile } from '../../utils/fileValidator';

export default function PhotosAndSpecsStep({ formData, updateField }) {
  const [uploading, setUploading] = React.useState(false);
  const [analyzingImage, setAnalyzingImage] = React.useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate each file before uploading
    for (const file of files) {
      const validation = await validateFile(file, {
        allowedTypes: 'images',
        maxSize: 10 * 1024 * 1024, // 10 MB
        checkDimensions: true,
        dimensionOptions: {
          minWidth: 800,
          minHeight: 600
        }
      });
      
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }
    
    setUploading(true);
    
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        updateField('media', [...formData.media, file_url]);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setUploading(false);
  };

  const handleAnalyzeImages = async () => {
    if (formData.media.length === 0) {
      toast.error('Please upload at least one image first');
      return;
    }

    setAnalyzingImage(true);
    try {
      const prompt = `Analyze these food truck/trailer/equipment images and provide:
1. Suggested equipment/features visible (as array)
2. Estimated condition assessment (new/used)
3. Visible amenities or special features
4. Any notable characteristics for listing description

Return JSON with: equipment_detected (array), condition_estimate (string), amenities (array), notable_features (string)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: formData.media.slice(0, 3), // Analyze first 3 images
        response_json_schema: {
          type: 'object',
          properties: {
            equipment_detected: { type: 'array', items: { type: 'string' } },
            condition_estimate: { type: 'string' },
            amenities: { type: 'array', items: { type: 'string' } },
            notable_features: { type: 'string' }
          }
        }
      });

      // Update form with AI suggestions
      if (result.equipment_detected?.length > 0) {
        const currentIncluded = formData.whats_included || [];
        const newItems = [...new Set([...currentIncluded, ...result.equipment_detected])];
        updateField('whats_included', newItems);
      }

      if (result.amenities?.length > 0) {
        const currentAmenities = formData.amenities || [];
        const newAmenities = [...new Set([...currentAmenities, ...result.amenities])];
        updateField('amenities', newAmenities);
      }

      if (result.condition_estimate) {
        const condition = result.condition_estimate.toLowerCase().includes('new') ? 'new' : 'used';
        updateField('condition', condition);
      }

      if (result.notable_features) {
        const currentCustom = formData.custom_included_items || '';
        const separator = currentCustom ? '\n' : '';
        updateField('custom_included_items', currentCustom + separator + result.notable_features);
      }

      toast.success('AI analysis complete! Check suggested features below.');
    } catch (err) {
      console.error('Error analyzing images:', err);
      toast.error('Failed to analyze images');
    } finally {
      setAnalyzingImage(false);
    }
  };

  const removeImage = (index) => {
    updateField('media', formData.media.filter((_, i) => i !== index));
  };

  const moveImage = (index, direction) => {
    const newMedia = [...formData.media];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newMedia.length) return;
    [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
    updateField('media', newMedia);
  };

  const STANDARD_ITEMS = [
    'Griddle', 'Fryer', 'Grill', 'Oven', 'Refrigerator', 'Freezer',
    'Prep Tables', 'Serving Window', 'Fire Suppression System', 'Hand Sink',
    '3-Compartment Sink', 'Hot Water Heater', 'Generator', 'Awning',
    'Point of Sale System', 'Menu Board'
  ];

  const toggleIncludedItem = (item) => {
    const current = formData.whats_included || [];
    if (current.includes(item)) {
      updateField('whats_included', current.filter(i => i !== item));
    } else {
      updateField('whats_included', [...current, item]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-sm font-medium">Photos * (minimum 3, recommended 8+)</Label>
            <p className="text-xs text-slate-500">First photo will be the main image. Drag to reorder.</p>
          </div>
          {formData.media.length > 0 && (
            <Button
              type="button"
              onClick={handleAnalyzeImages}
              disabled={analyzingImage}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              {analyzingImage ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {formData.media.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {idx > 0 && (
                  <button
                    onClick={() => moveImage(idx, -1)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"
                  >
                    ←
                  </button>
                )}
                <button
                  onClick={() => removeImage(idx)}
                  className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                {idx < formData.media.length - 1 && (
                  <button
                    onClick={() => moveImage(idx, 1)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"
                  >
                    →
                  </button>
                )}
              </div>
              {idx === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-[#FF5124] text-white text-xs rounded-full">
                  Main
                </div>
              )}
            </div>
          ))}
          
          {formData.media.length < 15 && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-[#FF5124] cursor-pointer flex flex-col items-center justify-center transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="sr-only"
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Add photos</span>
                </>
              )}
            </label>
          )}
        </div>
        
        <p className="text-xs text-slate-500 mt-2">
          {formData.media.length}/15 photos • {formData.media.length >= 3 ? '✓ Minimum met' : `Need ${3 - formData.media.length} more`}
        </p>
      </div>

      {/* What's Included */}
      <div>
        <Label className="text-sm font-medium">What's Included</Label>
        <p className="text-xs text-slate-500 mb-3">Select all equipment and features that come with this listing</p>
        
        <div className="grid sm:grid-cols-2 gap-2">
          {STANDARD_ITEMS.map((item) => (
            <label key={item} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.whats_included?.includes(item)}
                onChange={() => toggleIncludedItem(item)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-3">
          <Label className="text-xs text-slate-500">Additional Items (Custom)</Label>
          <Textarea
            placeholder="List any other included items not in the checklist above"
            value={formData.custom_included_items}
            onChange={(e) => updateField('custom_included_items', e.target.value)}
            className="mt-2 h-20 rounded-xl"
          />
        </div>
      </div>

      {/* Specs */}
      <div>
        <Label className="text-sm font-medium">Specifications</Label>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          <div>
            <Label className="text-xs text-slate-500">Condition *</Label>
            <Select value={formData.condition} onValueChange={(v) => updateField('condition', v)}>
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-500">Power Type</Label>
            <Select value={formData.power_type} onValueChange={(v) => updateField('power_type', v)}>
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue placeholder="Select power type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="gas">Gas</SelectItem>
                <SelectItem value="generator">Generator</SelectItem>
                <SelectItem value="propane">Propane</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-500">Number of Sinks</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={formData.sinks}
              onChange={(e) => updateField('sinks', e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs text-slate-500">Year</Label>
            <Input
              placeholder="2020"
              value={formData.year}
              onChange={(e) => updateField('year', e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs text-slate-500">Make</Label>
            <Input
              placeholder="Brand/Manufacturer"
              value={formData.make}
              onChange={(e) => updateField('make', e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs text-slate-500">Model</Label>
            <Input
              placeholder="Model name/number"
              value={formData.model}
              onChange={(e) => updateField('model', e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <Label className="text-sm">Water Hookup</Label>
            <Switch
              checked={formData.water_hookup}
              onCheckedChange={(v) => updateField('water_hookup', v)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <Label className="text-sm">Propane</Label>
            <Switch
              checked={formData.propane}
              onCheckedChange={(v) => updateField('propane', v)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <Label className="text-sm">Hood System</Label>
            <Switch
              checked={formData.hood_system}
              onCheckedChange={(v) => updateField('hood_system', v)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <Label className="text-sm">Refrigeration</Label>
            <Switch
              checked={formData.refrigeration}
              onCheckedChange={(v) => updateField('refrigeration', v)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <Label className="text-sm">Generator Included</Label>
            <Switch
              checked={formData.generator_included}
              onCheckedChange={(v) => updateField('generator_included', v)}
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <div>
            <Label className="text-xs text-slate-500">Length (ft)</Label>
            <Input
              placeholder="20"
              value={formData.size_length}
              onChange={(e) => updateField('size_length', e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500">Width (ft)</Label>
            <Input
              placeholder="8"
              value={formData.size_width}
              onChange={(e) => updateField('size_width', e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500">Height (ft)</Label>
            <Input
              placeholder="10"
              value={formData.size_height}
              onChange={(e) => updateField('size_height', e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label className="text-xs text-slate-500">Weight (lbs)</Label>
          <Input
            placeholder="5000"
            value={formData.weight}
            onChange={(e) => updateField('weight', e.target.value)}
            className="mt-1 h-11 rounded-xl max-w-[200px]"
          />
        </div>
      </div>
    </div>
  );
}
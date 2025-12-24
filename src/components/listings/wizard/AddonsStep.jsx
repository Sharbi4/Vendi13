import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, DollarSign } from 'lucide-react';

export default function AddonsStep({ formData, updateField }) {
  const [addons, setAddons] = useState(formData.custom_addons || []);

  const addNewAddon = () => {
    if (addons.length >= 5) return;
    
    const newAddon = {
      id: Date.now().toString(),
      title: '',
      description: '',
      price: ''
    };
    
    const updatedAddons = [...addons, newAddon];
    setAddons(updatedAddons);
    updateField('custom_addons', updatedAddons);
  };

  const removeAddon = (id) => {
    const updatedAddons = addons.filter(a => a.id !== id);
    setAddons(updatedAddons);
    updateField('custom_addons', updatedAddons);
  };

  const updateAddon = (id, field, value) => {
    const updatedAddons = addons.map(addon => 
      addon.id === id ? { ...addon, [field]: value } : addon
    );
    setAddons(updatedAddons);
    updateField('custom_addons', updatedAddons);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Custom Add-ons</h3>
        <p className="text-sm text-slate-600">
          Offer optional extras to boost your earnings. Add up to 5 custom add-ons with pricing.
        </p>
      </div>

      <div className="space-y-4">
        {addons.map((addon, index) => (
          <Card key={addon.id} className="relative">
            <CardContent className="pt-6">
              <button
                onClick={() => removeAddon(addon.id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[#FF5124] text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-700">Add-on {index + 1}</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={addon.title}
                      onChange={(e) => updateAddon(addon.id, 'title', e.target.value)}
                      placeholder="e.g., Extra Generator, Chef Service"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Price *</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        value={addon.price}
                        onChange={(e) => updateAddon(addon.id, 'price', e.target.value)}
                        placeholder="0"
                        className="pl-9"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={addon.description}
                    onChange={(e) => updateAddon(addon.id, 'description', e.target.value)}
                    placeholder="Brief description of what's included..."
                    className="mt-1"
                    rows={2}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {addon.description?.length || 0}/200 characters
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {addons.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">No add-ons yet</p>
            <p className="text-sm text-slate-500">Add optional extras to increase your revenue</p>
          </div>
        )}

        {addons.length < 5 && (
          <Button
            type="button"
            variant="outline"
            onClick={addNewAddon}
            className="w-full border-dashed border-2 h-12"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Add-on ({addons.length}/5)
          </Button>
        )}
      </div>

      {addons.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-medium text-blue-900 mb-2">💡 Add-on Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about what's included</li>
            <li>• Price competitively based on your costs</li>
            <li>• Popular add-ons: equipment, delivery, setup service, extra hours</li>
            <li>• Guests can select these during checkout</li>
          </ul>
        </div>
      )}
    </div>
  );
}
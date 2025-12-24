import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Package } from 'lucide-react';

const ADDON_TYPES = [
  { value: 'equipment', label: 'Equipment', icon: '🔧' },
  { value: 'service', label: 'Service', icon: '🛎️' },
  { value: 'customization', label: 'Customization', icon: '✨' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export default function AddonsStep({ addons, onAddonsChange }) {
  const [newAddon, setNewAddon] = useState({
    addon_type: 'equipment',
    title: '',
    description: '',
    quantity: 1,
    requested_price: ''
  });

  const handleAddAddon = () => {
    if (!newAddon.title.trim()) return;

    onAddonsChange([...addons, { ...newAddon, id: Date.now().toString() }]);
    setNewAddon({
      addon_type: 'equipment',
      title: '',
      description: '',
      quantity: 1,
      requested_price: ''
    });
  };

  const handleRemoveAddon = (id) => {
    onAddonsChange(addons.filter(addon => addon.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 mb-2">Request Add-ons or Customizations</h3>
        <p className="text-sm text-slate-600">
          Need extra equipment, special services, or customizations? Request them here and the host will review your requests.
        </p>
      </div>

      {/* Existing Add-ons */}
      {addons.length > 0 && (
        <div className="space-y-3">
          {addons.map((addon) => {
            const type = ADDON_TYPES.find(t => t.value === addon.addon_type);
            return (
              <Card key={addon.id} className="bg-slate-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{type?.icon}</span>
                        <h4 className="font-medium text-slate-900">{addon.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {type?.label}
                        </Badge>
                        {addon.quantity > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            Qty: {addon.quantity}
                          </Badge>
                        )}
                      </div>
                      {addon.description && (
                        <p className="text-sm text-slate-600 mb-2">{addon.description}</p>
                      )}
                      {addon.requested_price && (
                        <p className="text-sm text-slate-500">
                          Your budget: ${parseFloat(addon.requested_price).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAddon(addon.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add New Add-on Form */}
      <Card className="border-2 border-dashed border-slate-200">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-slate-700 mb-2">
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm">Add New Request</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="addon_type">Type</Label>
              <Select
                value={newAddon.addon_type}
                onValueChange={(value) => setNewAddon({ ...newAddon, addon_type: value })}
              >
                <SelectTrigger id="addon_type" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADDON_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="addon_title">What do you need?</Label>
              <Input
                id="addon_title"
                placeholder="e.g., Extra generator"
                value={newAddon.title}
                onChange={(e) => setNewAddon({ ...newAddon, title: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="addon_description">Details (Optional)</Label>
            <Textarea
              id="addon_description"
              placeholder="Describe what you need or any special requirements"
              value={newAddon.description}
              onChange={(e) => setNewAddon({ ...newAddon, description: e.target.value })}
              className="mt-2"
              rows={2}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="addon_quantity">Quantity</Label>
              <Input
                id="addon_quantity"
                type="number"
                min="1"
                value={newAddon.quantity}
                onChange={(e) => setNewAddon({ ...newAddon, quantity: parseInt(e.target.value) || 1 })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="addon_price">Your Budget (Optional)</Label>
              <Input
                id="addon_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newAddon.requested_price}
                onChange={(e) => setNewAddon({ ...newAddon, requested_price: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddAddon}
            disabled={!newAddon.title.trim()}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Request
          </Button>
        </CardContent>
      </Card>

      {addons.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-4">
          No add-ons requested. Skip if you don't need anything extra.
        </p>
      )}
    </div>
  );
}
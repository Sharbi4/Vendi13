import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkEditModal({ open, onClose, selectedListings }) {
  const queryClient = useQueryClient();
  const [editFields, setEditFields] = useState({
    status: null,
    daily_price: null,
    weekly_price: null,
    monthly_price: null,
    sale_price: null,
    delivery_available: null,
    instant_book: null,
  });

  const { mutate: bulkUpdate, isPending } = useMutation({
    mutationFn: async (updates) => {
      const promises = selectedListings.map(listing => 
        base44.entities.Listing.update(listing.id, updates)
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success(`${selectedListings.length} listings updated successfully`);
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update listings');
      console.error('Bulk update error:', error);
    },
  });

  const handleApply = () => {
    // Filter out null values
    const updates = {};
    Object.entries(editFields).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        if (key.includes('price')) {
          updates[key] = parseFloat(value);
        } else {
          updates[key] = value;
        }
      }
    });

    if (Object.keys(updates).length === 0) {
      toast.error('Please select at least one field to update');
      return;
    }

    bulkUpdate(updates);
  };

  const isRental = selectedListings.every(l => l.listing_mode === 'rent');
  const isSale = selectedListings.every(l => l.listing_mode === 'sale');
  const isMixed = !isRental && !isSale;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Edit {selectedListings.length} Listings</DialogTitle>
          <DialogDescription>
            Update multiple listings at once. Only changed fields will be applied.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={editFields.status || 'unchanged'}
              onValueChange={(value) => 
                setEditFields(prev => ({ ...prev, status: value === 'unchanged' ? null : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Don't change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unchanged">Don't change</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rental Pricing */}
          {(isRental || isMixed) && (
            <>
              <div className="space-y-2">
                <Label>Daily Price ($)</Label>
                <Input
                  type="number"
                  placeholder="Leave blank to not change"
                  value={editFields.daily_price || ''}
                  onChange={(e) => 
                    setEditFields(prev => ({ ...prev, daily_price: e.target.value || null }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Weekly Price ($)</Label>
                <Input
                  type="number"
                  placeholder="Leave blank to not change"
                  value={editFields.weekly_price || ''}
                  onChange={(e) => 
                    setEditFields(prev => ({ ...prev, weekly_price: e.target.value || null }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Monthly Price ($)</Label>
                <Input
                  type="number"
                  placeholder="Leave blank to not change"
                  value={editFields.monthly_price || ''}
                  onChange={(e) => 
                    setEditFields(prev => ({ ...prev, monthly_price: e.target.value || null }))
                  }
                />
              </div>
            </>
          )}

          {/* Sale Pricing */}
          {(isSale || isMixed) && (
            <div className="space-y-2">
              <Label>Sale Price ($)</Label>
              <Input
                type="number"
                placeholder="Leave blank to not change"
                value={editFields.sale_price || ''}
                onChange={(e) => 
                  setEditFields(prev => ({ ...prev, sale_price: e.target.value || null }))
                }
              />
            </div>
          )}

          {/* Delivery Available */}
          {isRental && (
            <div className="flex items-center justify-between">
              <Label>Delivery Available</Label>
              <Select
                value={editFields.delivery_available === null ? 'unchanged' : editFields.delivery_available.toString()}
                onValueChange={(value) => 
                  setEditFields(prev => ({ 
                    ...prev, 
                    delivery_available: value === 'unchanged' ? null : value === 'true' 
                  }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unchanged">Don't change</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Instant Book */}
          {isRental && (
            <div className="flex items-center justify-between">
              <Label>Instant Book</Label>
              <Select
                value={editFields.instant_book === null ? 'unchanged' : editFields.instant_book.toString()}
                onValueChange={(value) => 
                  setEditFields(prev => ({ 
                    ...prev, 
                    instant_book: value === 'unchanged' ? null : value === 'true' 
                  }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unchanged">Don't change</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={isPending}
            className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Apply Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
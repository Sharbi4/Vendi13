import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SubmitVerificationModal from '../verification/SubmitVerificationModal';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye, Edit2, MoreHorizontal, Package, Calendar, DollarSign,
  Power, PowerOff, Trash2, Check, X, Shield, Copy, Star
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const CATEGORY_LABELS = {
  food_truck: 'Food Truck',
  food_trailer: 'Food Trailer',
  ghost_kitchen: 'Ghost Kitchen',
  equipment: 'Equipment',
  other: 'Other',
};

export default function ListingManagementCard({ listing, onManageAvailability, user }) {
  const [showEditPricing, setShowEditPricing] = useState(false);
  const [showEditStatus, setShowEditStatus] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: verificationRequests = [] } = useQuery({
    queryKey: ['verification-requests', listing.id],
    queryFn: async () => {
      return await base44.entities.VerificationRequest.filter({ 
        listing_id: listing.id 
      }, '-created_date');
    },
  });

  const pendingVerification = verificationRequests.find(r => r.status === 'pending');

  const updateListingMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Listing.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-listings']);
      toast.success('Listing updated successfully');
      setShowEditPricing(false);
      setShowEditStatus(false);
    },
    onError: () => {
      toast.error('Failed to update listing');
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.Listing.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-listings']);
      toast.success('Listing deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete listing');
    },
  });

  const duplicateListingMutation = useMutation({
    mutationFn: async (originalListing) => {
      const duplicate = {
        ...originalListing,
        title: `${originalListing.title} (Copy)`,
        status: 'draft',
        featured: false,
      };
      // Remove system fields
      delete duplicate.id;
      delete duplicate.created_date;
      delete duplicate.updated_date;
      delete duplicate.created_by;
      
      return await base44.entities.Listing.create(duplicate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-listings']);
      toast.success('Listing duplicated successfully');
    },
    onError: (error) => {
      toast.error('Failed to duplicate listing');
      console.error('Duplicate error:', error);
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }) => {
      return await base44.entities.Listing.update(id, { featured });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['my-listings']);
      toast.success(variables.featured ? 'Listing marked as featured' : 'Featured status removed');
    },
    onError: (error) => {
      toast.error('Failed to update featured status');
      console.error('Featured toggle error:', error);
    },
  });

  const handleToggleStatus = () => {
    const newStatus = listing.status === 'active' ? 'paused' : 'active';
    updateListingMutation.mutate({
      id: listing.id,
      data: { status: newStatus }
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${listing.title}"? This action cannot be undone.`)) {
      deleteListingMutation.mutate(listing.id);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FF5124] transition-colors">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {listing.media?.[0] ? (
            <img
              src={listing.media[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{listing.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {CATEGORY_LABELS[listing.asset_category] || listing.asset_category}
            </Badge>
            <Badge
              className={`text-xs border-0 ${
                listing.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : listing.status === 'paused'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {listing.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {listing.listing_mode === 'rent' ? 'For Rent' : 'For Sale'}
            </Badge>
            {listing.verification_status === 'verified' && (
              <Badge className="bg-green-100 text-green-800 text-xs border-0">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {listing.verification_status === 'pending' && (
              <Badge className="bg-amber-100 text-amber-800 text-xs border-0">
                Pending
              </Badge>
            )}
            {listing.featured && (
              <Badge className="bg-amber-100 text-amber-800 text-xs border-0">
                <Star className="w-3 h-3 mr-1 fill-amber-500" />
                Featured
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {listing.listing_mode === 'rent' ? (
              <span>
                ${listing.daily_price || 0}/day
                {listing.weekly_price && ` • $${listing.weekly_price}/wk`}
                {listing.monthly_price && ` • $${listing.monthly_price}/mo`}
              </span>
            ) : (
              <span>${listing.sale_price?.toLocaleString() || 0}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`${createPageUrl('ListingDetail')}?id=${listing.id}`}>
            <Button variant="outline" size="sm" className="rounded-full">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Listing
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setShowEditPricing(true)}>
                <DollarSign className="w-4 h-4 mr-2" />
                Update Pricing
              </DropdownMenuItem>

              {listing.listing_mode === 'rent' && (
                <DropdownMenuItem onClick={() => onManageAvailability(listing)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </DropdownMenuItem>
              )}

              {listing.listing_mode === 'sale' && (
                <DropdownMenuItem onClick={() => setShowEditStatus(true)}>
                  <Package className="w-4 h-4 mr-2" />
                  Update Status
                </DropdownMenuItem>
              )}

              {listing.verification_status !== 'verified' && !pendingVerification && (
                <DropdownMenuItem onClick={() => setShowVerificationModal(true)}>
                  <Shield className="w-4 h-4 mr-2 text-[#FF5124]" />
                  Get Verified
                </DropdownMenuItem>
              )}

              <DropdownMenuItem 
                onClick={() => duplicateListingMutation.mutate(listing)} 
                disabled={duplicateListingMutation.isPending}
              >
                <Copy className="w-4 h-4 mr-2" />
                {duplicateListingMutation.isPending ? 'Duplicating...' : 'Duplicate Listing'}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => toggleFeaturedMutation.mutate({ id: listing.id, featured: !listing.featured })}
                disabled={toggleFeaturedMutation.isPending}
              >
                <Star className={`w-4 h-4 mr-2 ${listing.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                {listing.featured ? 'Remove Featured' : 'Mark as Featured'}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleToggleStatus}>
                {listing.status === 'active' ? (
                  <>
                    <PowerOff className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Listing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit Pricing Modal */}
      <EditPricingModal
        open={showEditPricing}
        onClose={() => setShowEditPricing(false)}
        listing={listing}
        onSave={(data) => updateListingMutation.mutate({ id: listing.id, data })}
      />

      {/* Edit Status Modal (For Sale Listings) */}
      <EditStatusModal
        open={showEditStatus}
        onClose={() => setShowEditStatus(false)}
        listing={listing}
        onSave={(data) => updateListingMutation.mutate({ id: listing.id, data })}
      />

      {/* Verification Modal */}
      {user && (
        <SubmitVerificationModal
          open={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          listing={listing}
          user={user}
        />
      )}
    </>
  );
}

function EditPricingModal({ open, onClose, listing, onSave }) {
  const [pricing, setPricing] = useState({
    daily_price: listing.daily_price || '',
    weekly_price: listing.weekly_price || '',
    monthly_price: listing.monthly_price || '',
    sale_price: listing.sale_price || '',
  });

  const handleSave = () => {
    const data = listing.listing_mode === 'rent'
      ? {
          daily_price: parseFloat(pricing.daily_price) || null,
          weekly_price: parseFloat(pricing.weekly_price) || null,
          monthly_price: parseFloat(pricing.monthly_price) || null,
        }
      : {
          sale_price: parseFloat(pricing.sale_price) || null,
        };
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Pricing</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {listing.listing_mode === 'rent' ? (
            <>
              <div>
                <Label className="text-sm font-medium">Daily Rate ($)</Label>
                <Input
                  type="number"
                  value={pricing.daily_price}
                  onChange={(e) => setPricing({ ...pricing, daily_price: e.target.value })}
                  placeholder="250"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Weekly Rate ($) <span className="text-slate-500">optional</span></Label>
                <Input
                  type="number"
                  value={pricing.weekly_price}
                  onChange={(e) => setPricing({ ...pricing, weekly_price: e.target.value })}
                  placeholder="1500"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Monthly Rate ($) <span className="text-slate-500">optional</span></Label>
                <Input
                  type="number"
                  value={pricing.monthly_price}
                  onChange={(e) => setPricing({ ...pricing, monthly_price: e.target.value })}
                  placeholder="5000"
                  className="mt-2"
                />
              </div>
            </>
          ) : (
            <div>
              <Label className="text-sm font-medium">Sale Price ($)</Label>
              <Input
                type="number"
                value={pricing.sale_price}
                onChange={(e) => setPricing({ ...pricing, sale_price: e.target.value })}
                placeholder="75000"
                className="mt-2"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#FF5124] hover:bg-[#e5481f]">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditStatusModal({ open, onClose, listing, onSave }) {
  const [saleStatus, setSaleStatus] = useState({
    accept_offers: listing.accept_offers || false,
    status: listing.status || 'active',
  });

  const handleSave = () => {
    onSave({
      accept_offers: saleStatus.accept_offers,
      status: saleStatus.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Listing Status</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Listing Status</Label>
            <Select
              value={saleStatus.status}
              onValueChange={(value) => setSaleStatus({ ...saleStatus, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Accept Offers</Label>
              <p className="text-xs text-slate-500">Allow buyers to make offers</p>
            </div>
            <button
              onClick={() => setSaleStatus({ ...saleStatus, accept_offers: !saleStatus.accept_offers })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                saleStatus.accept_offers ? 'bg-[#FF5124]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  saleStatus.accept_offers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#FF5124] hover:bg-[#e5481f]">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
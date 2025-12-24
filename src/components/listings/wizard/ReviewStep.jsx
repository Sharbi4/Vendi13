import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin } from 'lucide-react';

const CATEGORY_LABELS = {
  food_truck: 'Food Truck',
  food_trailer: 'Food Trailer',
  ghost_kitchen: 'Ghost Kitchen',
  equipment: 'Equipment',
  other: 'Other',
};

export default function ReviewStep({ formData }) {
  const isRental = formData.listing_mode === 'rent';
  
  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-green-800 font-medium">Ready to publish!</p>
          <p className="text-sm text-green-700 mt-1">
            Review your listing details below before publishing.
          </p>
        </div>
      </div>

      {/* Preview Card */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        {formData.media[0] && (
          <img
            src={formData.media[0]}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-[#FF5124] text-white">
              {CATEGORY_LABELS[formData.asset_category]}
            </Badge>
            <Badge variant="outline">
              {isRental ? 'For Rent' : 'For Sale'}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {formData.condition}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg text-slate-900">{formData.title || 'Untitled'}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {formData.public_location_label || 'Location TBD'} • {formData.zip_code}
          </p>
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{formData.short_description}</p>
          <div className="mt-3 pt-3 border-t">
            {isRental ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  ${formData.daily_price || formData.weekly_price || formData.monthly_price || '0'}
                </span>
                <span className="text-sm text-slate-500">
                  / {formData.rate_unit}
                </span>
              </div>
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                ${parseInt(formData.sale_price || 0).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Listing Summary</h3>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-slate-500">Photos</span>
          <span className="font-medium">{formData.media.length} uploaded</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-slate-500">What's Included</span>
          <span className="font-medium">{formData.whats_included?.length || 0} items</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-slate-500">Condition</span>
          <span className="font-medium capitalize">{formData.condition}</span>
        </div>

        {formData.power_type && (
          <div className="flex justify-between py-2 border-b">
            <span className="text-slate-500">Power Type</span>
            <span className="font-medium capitalize">{formData.power_type}</span>
          </div>
        )}

        {isRental ? (
          <>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-500">Pickup</span>
              <span className="font-medium">{formData.pickup_enabled ? 'Available' : 'Not available'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-500">Delivery</span>
              <span className="font-medium">{formData.delivery_available ? 'Available' : 'Not available'}</span>
            </div>
            {formData.required_documents?.length > 0 && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Required Documents</span>
                <span className="font-medium">{formData.required_documents.length}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-500">Local Pickup</span>
              <span className="font-medium">{formData.local_pickup_available ? 'Available' : 'Not available'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-500">Freight Delivery</span>
              <span className="font-medium">{formData.freight_delivery_available ? 'Available' : 'Not available'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-500">Accept Offers</span>
              <span className="font-medium">{formData.accept_offers ? 'Yes' : 'No'}</span>
            </div>
          </>
        )}
      </div>

      {/* Quality Checklist */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="font-semibold text-sm text-blue-900 mb-3">Quality Checklist</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`w-4 h-4 ${formData.title.length >= 5 ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={formData.title.length >= 5 ? 'text-green-800' : 'text-gray-600'}>Title (min 5 characters)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`w-4 h-4 ${formData.description.length >= 20 ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={formData.description.length >= 20 ? 'text-green-800' : 'text-gray-600'}>Description (min 20 characters)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`w-4 h-4 ${formData.media.length >= 3 ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={formData.media.length >= 3 ? 'text-green-800' : 'text-gray-600'}>Minimum 3 photos</span>
          </div>
          {isRental ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className={`w-4 h-4 ${(formData.daily_price || formData.weekly_price || formData.monthly_price) ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={(formData.daily_price || formData.weekly_price || formData.monthly_price) ? 'text-green-800' : 'text-gray-600'}>Pricing set</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className={`w-4 h-4 ${(formData.pickup_enabled || formData.delivery_available) ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={(formData.pickup_enabled || formData.delivery_available) ? 'text-green-800' : 'text-gray-600'}>Delivery method enabled</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className={`w-4 h-4 ${formData.sale_price ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={formData.sale_price ? 'text-green-800' : 'text-gray-600'}>Sale price set</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className={`w-4 h-4 ${(formData.local_pickup_available || formData.freight_delivery_available || formData.seller_delivery_available) ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={(formData.local_pickup_available || formData.freight_delivery_available || formData.seller_delivery_available) ? 'text-green-800' : 'text-gray-600'}>Delivery option enabled</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
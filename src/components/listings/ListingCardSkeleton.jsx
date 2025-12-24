import React from 'react';

export default function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category badge */}
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        
        {/* Location */}
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        
        {/* Rating */}
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        
        {/* Price */}
        <div className="h-7 bg-gray-200 rounded w-2/5" />
      </div>
    </div>
  );
}
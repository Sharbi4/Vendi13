import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker for listings
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const CATEGORY_LABELS = {
  food_truck: 'Food Truck',
  food_trailer: 'Food Trailer',
  ghost_kitchen: 'Ghost Kitchen',
  equipment: 'Equipment',
  other: 'Other',
};

function MapBoundsUpdater({ listings, onBoundsChange }) {
  const map = useMap();
  
  useEffect(() => {
    if (listings.length === 0) return;
    
    const validCoords = listings
      .filter(l => l.lat && l.lng)
      .map(l => [l.lat, l.lng]);
    
    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [listings, map]);

  useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
  });
  
  return null;
}

export default function MapView({ listings, mode, onBoundsChange }) {
  const [center] = useState([37.0902, -95.7129]); // Center of USA
  const [visibleListings, setVisibleListings] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getListingCoordinates = (listing) => {
    // Use existing lat/lng if available
    if (listing.lat && listing.lng) {
      return { lat: listing.lat, lng: listing.lng };
    }
    
    // Approximate based on zip code (simplified - in production use geocoding API)
    if (listing.zip_code) {
      const zip = listing.zip_code.substring(0, 5);
      const hash = zip.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return {
        lat: 30 + (hash % 20), // Rough approximation
        lng: -120 + (hash % 40)
      };
    }
    
    return null;
  };

  const validListings = listings
    .map(listing => ({ ...listing, coords: getListingCoordinates(listing) }))
    .filter(listing => listing.coords);

  // Filter listings based on visible map bounds
  useEffect(() => {
    if (!mapBounds) {
      setVisibleListings(validListings);
      return;
    }

    setIsUpdating(true);
    const timer = setTimeout(() => {
      const filtered = validListings.filter(listing => {
        const { lat, lng } = listing.coords;
        return (
          lat >= mapBounds.south &&
          lat <= mapBounds.north &&
          lng >= mapBounds.west &&
          lng <= mapBounds.east
        );
      });
      setVisibleListings(filtered);
      setIsUpdating(false);
      
      // Notify parent of visible listings
      if (onBoundsChange) {
        onBoundsChange(filtered);
      }
    }, 300); // Debounce updates

    return () => clearTimeout(timer);
  }, [mapBounds, listings]);

  const handleBoundsChange = (bounds) => {
    setMapBounds(bounds);
  };

  if (validListings.length === 0) {
    return (
      <div className="h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No listings with location data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] rounded-xl overflow-hidden border border-gray-200">
      {/* Loading indicator */}
      {isUpdating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#FF5124]" />
          <span className="text-sm font-medium">Updating results...</span>
        </div>
      )}

      {/* Results counter */}
      <div className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg">
        <span className="text-sm font-medium">
          {visibleListings.length} listing{visibleListings.length !== 1 ? 's' : ''} visible
        </span>
      </div>

      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsUpdater 
          listings={validListings} 
          onBoundsChange={handleBoundsChange}
        />
        
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {visibleListings.map((listing) => (
            <Marker
              key={listing.id}
              position={[listing.coords.lat, listing.coords.lng]}
              icon={customIcon}
            >
              <Popup maxWidth={300}>
                <div className="p-2">
                  {listing.media?.[0] && (
                    <img
                      src={listing.media[0]}
                      alt={listing.title}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-sm mb-1">{listing.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[listing.asset_category]}
                    </Badge>
                    {listing.average_rating > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{listing.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#FF5124]">
                      {mode === 'rent'
                        ? `$${listing.daily_price || 0}/day`
                        : `$${listing.sale_price?.toLocaleString() || 0}`
                      }
                    </span>
                    <a
                      href={`${createPageUrl('ListingDetail')}?id=${listing.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View details →
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
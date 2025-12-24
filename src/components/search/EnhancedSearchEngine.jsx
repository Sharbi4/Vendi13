import Fuse from 'fuse.js';

/**
 * Calculate listing quality score based on completeness and features
 * Higher score = better/more complete listing
 */
export function calculateListingScore(listing) {
  let score = 0;
  
  // Verification status (up to 25 points)
  if (listing.verification_status === 'verified') score += 25;
  else if (listing.verification_status === 'pending') score += 10;
  
  // Number of photos (up to 20 points)
  const photoCount = listing.media?.length || 0;
  score += Math.min(photoCount * 4, 20); // 4 points per photo, max 20
  
  // Description completeness (up to 15 points)
  if (listing.description) {
    const descLength = listing.description.length;
    if (descLength > 500) score += 15;
    else if (descLength > 250) score += 10;
    else if (descLength > 100) score += 5;
  }
  
  // Reviews and ratings (up to 20 points)
  if (listing.review_count > 0) {
    score += Math.min(listing.review_count * 2, 10); // 2 points per review, max 10
    score += (listing.average_rating || 0) * 2; // Up to 10 points for rating
  }
  
  // Specs completeness (up to 10 points)
  let specsCount = 0;
  if (listing.size_length) specsCount++;
  if (listing.size_width) specsCount++;
  if (listing.size_height) specsCount++;
  if (listing.year) specsCount++;
  if (listing.make) specsCount++;
  if (listing.model) specsCount++;
  if (listing.condition) specsCount++;
  score += Math.min(specsCount * 1.5, 10);
  
  // Amenities and features (up to 10 points)
  const amenitiesCount = listing.amenities?.length || 0;
  score += Math.min(amenitiesCount, 10);
  
  return score;
}

/**
 * Calculate distance-based relevance (if location is provided)
 */
export function calculateLocationScore(listing, searchLocation) {
  if (!searchLocation || !listing.lat || !listing.lng) return 0;
  
  // Simple distance calculation (in production, use actual geocoding)
  // For now, give points for location match in text
  const locationText = `${listing.public_location_label} ${listing.zip_code}`.toLowerCase();
  const searchLower = searchLocation.toLowerCase();
  
  if (locationText.includes(searchLower)) return 50;
  
  // Partial match
  const searchWords = searchLower.split(' ');
  let matches = 0;
  searchWords.forEach(word => {
    if (locationText.includes(word)) matches++;
  });
  
  return (matches / searchWords.length) * 30;
}

/**
 * Enhanced search with fuzzy matching using Fuse.js
 */
export function performEnhancedSearch(listings, searchParams) {
  const {
    keywords = '',
    location = '',
    mode,
    category,
    filters = {},
    sortBy = 'relevance'
  } = searchParams;
  
  let results = [...listings];
  
  // 1. Apply exact filters first
  results = results.filter(listing => {
    if (listing.status !== 'active') return false;
    if (mode && listing.listing_mode !== mode) return false;
    if (category && listing.asset_category !== category) return false;
    
    // Apply all filters
    if (filters.delivery_available && !listing.delivery_available) return false;
    if (filters.water_hookup && !listing.water_hookup) return false;
    if (filters.verified_only && listing.verification_status !== 'verified') return false;
    if (filters.power_type && listing.power_type !== filters.power_type) return false;
    if (filters.local_pickup && !listing.local_pickup_available) return false;
    if (filters.delivery_included && !listing.delivery_included) return false;
    if (filters.title_verified && !listing.title_verified) return false;
    if (filters.condition && listing.condition !== filters.condition) return false;
    if (filters.instant_book && !listing.instant_book) return false;
    
    // Equipment/Features filters
    if (filters.refrigeration && !listing.refrigeration) return false;
    if (filters.hood_system && !listing.hood_system) return false;
    if (filters.generator_included && !listing.generator_included) return false;
    if (filters.propane && !listing.propane) return false;
    
    // Price filter
    const price = mode === 'rent' ? listing.daily_price : listing.sale_price;
    if (price) {
      if (filters.minPrice && price < filters.minPrice) return false;
      if (filters.maxPrice && price > filters.maxPrice) return false;
    }
    
    // Rating filter
    if (filters.min_rating > 0) {
      if (!listing.average_rating || listing.average_rating < filters.min_rating) return false;
    }
    
    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      const listingAmenities = listing.amenities || [];
      const hasAllAmenities = filters.amenities.every(amenity => 
        listingAmenities.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }
    
    return true;
  });
  
  // 2. Apply keyword search with fuzzy matching if keywords provided
  if (keywords && keywords.trim()) {
    const fuse = new Fuse(results, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'short_description', weight: 0.2 },
        { name: 'public_location_label', weight: 0.1 }
      ],
      threshold: 0.4, // 0 = exact match, 1 = match anything
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
      useExtendedSearch: true
    });
    
    const fuseResults = fuse.search(keywords);
    
    // If we have fuzzy matches, use them; otherwise keep all results
    if (fuseResults.length > 0) {
      results = fuseResults.map(result => ({
        ...result.item,
        fuzzyScore: 1 - (result.score || 0) // Convert to 0-1 where 1 is best
      }));
    }
  }
  
  // 3. Apply location-based scoring
  if (location && location.trim()) {
    results = results.filter(listing => {
      const locationText = `${listing.public_location_label || ''} ${listing.private_address || ''} ${listing.zip_code || ''}`.toLowerCase();
      const searchLower = location.toLowerCase().trim();
      
      // Exact or partial match
      return locationText.includes(searchLower) || 
             searchLower.split(' ').some(word => locationText.includes(word));
    });
    
    // Add location score
    results = results.map(listing => ({
      ...listing,
      locationScore: calculateLocationScore(listing, location)
    }));
  }
  
  // 4. Calculate overall relevance score for each listing
  results = results.map(listing => {
    const qualityScore = calculateListingScore(listing);
    const fuzzyScore = listing.fuzzyScore || 0;
    const locationScore = listing.locationScore || 0;
    
    // Weighted combination
    let relevanceScore = qualityScore * 0.4; // Quality is 40%
    
    if (keywords) relevanceScore += fuzzyScore * 50 * 0.5; // Keyword match is 50%
    else relevanceScore += qualityScore * 0.5; // If no keywords, quality is 90% total
    
    if (location) relevanceScore += locationScore * 0.1; // Location is 10%
    
    return {
      ...listing,
      qualityScore,
      relevanceScore
    };
  });
  
  // 5. Sort based on criteria
  results.sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return b.relevanceScore - a.relevanceScore;
      case 'quality':
        return b.qualityScore - a.qualityScore;
      case 'price_low':
        const priceA = mode === 'rent' ? (a.daily_price || 0) : (a.sale_price || 0);
        const priceB = mode === 'rent' ? (b.daily_price || 0) : (b.sale_price || 0);
        return priceA - priceB;
      case 'price_high':
        const priceA2 = mode === 'rent' ? (a.daily_price || 0) : (a.sale_price || 0);
        const priceB2 = mode === 'rent' ? (b.daily_price || 0) : (b.sale_price || 0);
        return priceB2 - priceA2;
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0);
      case 'newest':
        return new Date(b.created_date) - new Date(a.created_date);
      default:
        return b.relevanceScore - a.relevanceScore;
    }
  });
  
  return results;
}

/**
 * Generate autocomplete suggestions based on partial query
 */
export function generateAutocompleteSuggestions(query, allListings) {
  if (!query || query.length < 2) return [];
  
  const suggestions = new Set();
  const queryLower = query.toLowerCase();
  
  // Extract keywords from listings
  allListings.forEach(listing => {
    // Add title words
    const titleWords = listing.title?.split(' ') || [];
    titleWords.forEach(word => {
      if (word.toLowerCase().startsWith(queryLower) && word.length > 2) {
        suggestions.add(word);
      }
    });
    
    // Add categories
    if (listing.asset_category?.toLowerCase().includes(queryLower)) {
      const categoryLabels = {
        food_truck: 'Food Truck',
        food_trailer: 'Food Trailer',
        ghost_kitchen: 'Ghost Kitchen',
        equipment: 'Equipment',
        other: 'Other'
      };
      suggestions.add(categoryLabels[listing.asset_category] || listing.asset_category);
    }
    
    // Add locations
    if (listing.public_location_label?.toLowerCase().includes(queryLower)) {
      suggestions.add(listing.public_location_label);
    }
    
    // Add makes and models
    if (listing.make?.toLowerCase().includes(queryLower)) {
      suggestions.add(listing.make);
    }
    if (listing.model?.toLowerCase().includes(queryLower)) {
      suggestions.add(listing.model);
    }
  });
  
  // Convert to array and limit
  return Array.from(suggestions).slice(0, 8);
}

/**
 * Extract and normalize location from user input
 */
export function normalizeLocation(locationInput) {
  if (!locationInput) return null;
  
  // Remove common prefixes
  let normalized = locationInput.trim();
  normalized = normalized.replace(/^(near|in|at|around)\s+/i, '');
  
  // Extract ZIP code if present
  const zipMatch = normalized.match(/\b\d{5}\b/);
  if (zipMatch) {
    return { type: 'zip', value: zipMatch[0] };
  }
  
  // Check for city, state pattern
  const cityStateMatch = normalized.match(/^([^,]+),\s*([A-Z]{2})$/i);
  if (cityStateMatch) {
    return {
      type: 'city_state',
      city: cityStateMatch[1].trim(),
      state: cityStateMatch[2].trim().toUpperCase()
    };
  }
  
  // Just a city or generic location
  return { type: 'generic', value: normalized };
}
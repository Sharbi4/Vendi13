/**
 * Automated validation checks for listing data
 */

export function validateListing(formData) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!formData.title || formData.title.length < 5) {
    errors.push('Title must be at least 5 characters');
  }
  if (!formData.description || formData.description.length < 50) {
    errors.push('Description must be at least 50 characters');
  }
  if (!formData.asset_category) {
    errors.push('Please select an asset category');
  }

  // Location validation
  if (!formData.public_location_label || formData.public_location_label.length < 3) {
    errors.push('Please provide a valid location');
  }
  if (!formData.zip_code || formData.zip_code.length < 5) {
    warnings.push('ZIP code should be at least 5 digits');
  }

  // Media validation
  if (!formData.media || formData.media.length === 0) {
    errors.push('At least one photo is required');
  } else if (formData.media.length < 3) {
    warnings.push('Adding at least 3 photos significantly improves listing visibility');
  }

  // Pricing validation
  if (formData.listing_mode === 'rent') {
    if (!formData.daily_price && !formData.weekly_price && !formData.monthly_price) {
      errors.push('At least one rental rate (daily, weekly, or monthly) is required');
    }
    if (formData.daily_price && formData.daily_price < 1) {
      errors.push('Daily price must be greater than $0');
    }
  }

  if (formData.listing_mode === 'sale') {
    if (!formData.sale_price) {
      errors.push('Sale price is required');
    }
    if (formData.sale_price && formData.sale_price < 1) {
      errors.push('Sale price must be greater than $0');
    }
  }

  // Delivery/pickup validation
  if (formData.listing_mode === 'rent') {
    if (!formData.pickup_enabled && !formData.delivery_available) {
      errors.push('At least one fulfillment method (pickup or delivery) must be enabled');
    }
  }

  if (formData.listing_mode === 'sale') {
    if (!formData.local_pickup_available && !formData.freight_delivery_available && !formData.seller_delivery_available) {
      errors.push('At least one delivery method must be enabled');
    }
  }

  // Equipment/specs validation
  if (!formData.condition) {
    warnings.push('Specifying item condition helps build trust');
  }

  // Price reasonableness checks
  if (formData.daily_price && formData.daily_price > 10000) {
    warnings.push('Daily rental price seems unusually high. Please verify.');
  }
  if (formData.sale_price && formData.sale_price > 1000000) {
    warnings.push('Sale price seems unusually high. Please verify.');
  }

  // Delivery logic validation
  if (formData.delivery_available) {
    if (!formData.delivery_max_miles || formData.delivery_max_miles < 1) {
      warnings.push('Specify maximum delivery distance');
    }
    if (!formData.delivery_rate_per_mile) {
      warnings.push('Specify delivery rate per mile');
    }
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

/**
 * Calculate listing quality score (0-100)
 */
export function calculateQualityScore(formData) {
  let score = 0;

  // Title (10 points)
  if (formData.title?.length >= 10) score += 10;
  else if (formData.title?.length >= 5) score += 5;

  // Description (20 points)
  if (formData.description?.length >= 200) score += 20;
  else if (formData.description?.length >= 100) score += 15;
  else if (formData.description?.length >= 50) score += 10;

  // Photos (25 points)
  const photoCount = formData.media?.length || 0;
  if (photoCount >= 5) score += 25;
  else if (photoCount >= 3) score += 20;
  else if (photoCount >= 1) score += 10;

  // Location (10 points)
  if (formData.public_location_label && formData.zip_code) score += 10;
  else if (formData.public_location_label || formData.zip_code) score += 5;

  // Pricing (10 points)
  if (formData.listing_mode === 'rent') {
    const hasMultipleRates = [formData.daily_price, formData.weekly_price, formData.monthly_price].filter(Boolean).length;
    score += Math.min(hasMultipleRates * 5, 10);
  } else if (formData.sale_price) {
    score += 10;
  }

  // Specs/Details (15 points)
  let detailsCount = 0;
  if (formData.year) detailsCount++;
  if (formData.make) detailsCount++;
  if (formData.model) detailsCount++;
  if (formData.size_length) detailsCount++;
  if (formData.condition) detailsCount++;
  score += Math.min(detailsCount * 3, 15);

  // Features (10 points)
  const features = [
    formData.water_hookup,
    formData.propane,
    formData.hood_system,
    formData.refrigeration,
    formData.generator_included
  ].filter(Boolean).length;
  score += Math.min(features * 2, 10);

  return Math.min(score, 100);
}

/**
 * Get quality score label and color
 */
export function getQualityScoreLabel(score) {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
  if (score >= 40) return { label: 'Fair', color: 'text-amber-600', bgColor: 'bg-amber-50' };
  return { label: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-50' };
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import ListingTypeSelector from '../components/listings/wizard/ListingTypeSelector';
import CategorySelector from '../components/listings/wizard/CategorySelector';
import BasicInfoStep from '../components/listings/wizard/BasicInfoStep';
import LocationStep from '../components/listings/wizard/LocationStep';
import PhotosAndSpecsStep from '../components/listings/wizard/PhotosAndSpecsStep';
import RentPricingStep from '../components/listings/wizard/RentPricingStep';
import SalePricingStep from '../components/listings/wizard/SalePricingStep';
import RentFeaturesStep from '../components/listings/wizard/RentFeaturesStep';
import SaleFeaturesStep from '../components/listings/wizard/SaleFeaturesStep';
import AddonsStep from '../components/listings/wizard/AddonsStep';
import ReviewStep from '../components/listings/wizard/ReviewStep';
import CheckoutButton from '../components/payments/CheckoutButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { validateListing, calculateQualityScore, getQualityScoreLabel } from '../components/listings/AutomatedListingValidator';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from 'lucide-react';

const STEPS = [
  { id: 'type', title: 'Listing Type', desc: 'Rent or sell?' },
  { id: 'category', title: 'Category', desc: 'What are you listing?' },
  { id: 'basics', title: 'Basic Info', desc: 'Title and description' },
  { id: 'location', title: 'Location', desc: 'Where is it located?' },
  { id: 'photos_specs', title: 'Photos & Specs', desc: 'Images and details' },
  { id: 'pricing', title: 'Pricing', desc: 'Set your price' },
  { id: 'features', title: 'Features', desc: 'Additional options' },
  { id: 'addons', title: 'Add-ons', desc: 'Optional extras' },
  { id: 'review', title: 'Review', desc: 'Review and publish' },
];

export default function CreateListing() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [notarizedReceiptPaid, setNotarizedReceiptPaid] = useState(false);
  
  const [formData, setFormData] = useState({
    listing_mode: '',
    asset_category: '',
    title: '',
    short_description: '',
    description: '',
    media: [],
    private_address: '',
    public_location_label: '',
    zip_code: '',
    condition: 'used',
    whats_included: [],
    custom_included_items: '',
    power_type: '',
    water_hookup: false,
    propane: false,
    hood_system: false,
    refrigeration: false,
    sinks: 0,
    generator_included: false,
    size_length: '',
    size_width: '',
    size_height: '',
    weight: '',
    year: '',
    make: '',
    model: '',
    // Rent specific
    daily_price: '',
    weekly_price: '',
    monthly_price: '',
    rate_unit: 'daily',
    min_duration_days: 1,
    max_duration_days: 30,
    security_deposit: '',
    cleaning_fee: '',
    delivery_available: false,
    delivery_max_miles: '',
    delivery_rate_per_mile: '',
    pickup_enabled: true,
    pickup_instructions: '',
    required_documents: [],
    // Sale specific
    sale_price: '',
    accept_offers: false,
    local_pickup_available: false,
    freight_delivery_available: false,
    seller_delivery_available: false,
    freight_paid_by: 'buyer',
    title_verification_available: false,
    online_notary_available: false,
    escrow_available: false,
    notarized_receipt_available: false,
    // Extras
    equipment_included: [],
    featured: false,
    amenities: [],
    want_featured: false,
    custom_addons: [],
    });

  useEffect(() => {
    checkAuth();
    loadSavedData();
  }, []);

  useEffect(() => {
    // Save form data to localStorage whenever it changes
    if (isAuthenticated && formData.listing_mode) {
      localStorage.setItem('draft_listing', JSON.stringify({
        formData,
        currentStep
      }));
    }
  }, [formData, currentStep, isAuthenticated]);

  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('draft_listing');
      if (saved) {
        const { formData: savedFormData, currentStep: savedStep } = JSON.parse(saved);
        setFormData(savedFormData);
        setCurrentStep(savedStep);
      }
    } catch (err) {
      console.error('Error loading saved data:', err);
    }
  };

  const clearSavedData = () => {
    localStorage.removeItem('draft_listing');
  };

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('CreateListing'));
      return;
    }
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFields = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const canProceed = () => {
    const step = STEPS[currentStep].id;
    const validation = validateListing(formData);
    
    // For review step, check full validation
    if (step === 'review') {
      return validation.isValid;
    }
    
    switch (step) {
      case 'type':
        return !!formData.listing_mode;
      case 'category':
        return !!formData.asset_category;
      case 'basics':
        return formData.title.length >= 5 && 
               formData.short_description.length >= 10 &&
               formData.description.length >= 20;
      case 'location':
        return formData.public_location_label.length >= 3 && formData.zip_code.length >= 5;
      case 'photos_specs':
        return formData.media.length >= 1;
      case 'pricing':
        if (formData.listing_mode === 'rent') {
          return !!formData.daily_price || !!formData.weekly_price || !!formData.monthly_price;
        }
        return !!formData.sale_price;
      case 'features':
        if (formData.listing_mode === 'rent') {
          return formData.pickup_enabled || formData.delivery_available;
        }
        return formData.local_pickup_available || formData.freight_delivery_available || formData.seller_delivery_available;
      case 'addons':
        return true;
      case 'review':
        return true;
      default:
        return true;
    }
  };

  // Get current validation state
  const getCurrentValidation = () => {
    return validateListing(formData);
  };

  const handleSubmit = async (asDraft = false) => {
    // Check if notarized receipt is enabled and not paid
    if (!asDraft && formData.listing_mode === 'sale' && formData.notarized_receipt_available && !notarizedReceiptPaid) {
      setShowPaymentModal(true);
      return;
    }

    // Check if featured listing is wanted
    if (!asDraft && formData.want_featured) {
      await createListingAndRedirectToFeatured();
      return;
    }

    setIsSaving(true);
    try {
      // Quality checks before publishing
      if (!asDraft) {
        const checks = [];
        
        // Required fields
        if (!formData.title || !formData.description || !formData.asset_category) {
          checks.push('Missing required fields');
        }
        
        // Minimum photos
        if (formData.media.length < 3) {
          checks.push('Need at least 3 photos');
        }
        
        // Rent-specific checks
        if (formData.listing_mode === 'rent') {
          if (!formData.daily_price && !formData.weekly_price && !formData.monthly_price) {
            checks.push('Must set at least one rental rate');
          }
          if (!formData.pickup_enabled && !formData.delivery_available) {
            checks.push('Must enable pickup or delivery');
          }
        }
        
        // Sale-specific checks
        if (formData.listing_mode === 'sale') {
          if (!formData.sale_price) {
            checks.push('Must set sale price');
          }
          if (!formData.local_pickup_available && !formData.freight_delivery_available && !formData.seller_delivery_available) {
            checks.push('Must enable at least one delivery method');
          }
        }
        
        if (checks.length > 0) {
          alert('Cannot publish:\n' + checks.join('\n'));
          setIsSaving(false);
          return;
        }
      }
      
      const listingData = {
        ...formData,
        status: asDraft ? 'draft' : 'active',
        daily_price: formData.daily_price ? parseFloat(formData.daily_price) : null,
        weekly_price: formData.weekly_price ? parseFloat(formData.weekly_price) : null,
        monthly_price: formData.monthly_price ? parseFloat(formData.monthly_price) : null,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
        cleaning_fee: formData.cleaning_fee ? parseFloat(formData.cleaning_fee) : null,
        delivery_max_miles: formData.delivery_max_miles ? parseInt(formData.delivery_max_miles) : null,
        delivery_rate_per_mile: formData.delivery_rate_per_mile ? parseFloat(formData.delivery_rate_per_mile) : null,
        sinks: formData.sinks ? parseInt(formData.sinks) : 0,
      };
      
      const result = await base44.entities.Listing.create(listingData);
      clearSavedData();
      navigate(`${createPageUrl('ListingDetail')}?id=${result.id}`);
      } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
      } finally {
      setIsSaving(false);
      }
      };

      const createListingAndRedirectToFeatured = async () => {
        setIsSaving(true);
        try {
          const listingData = {
            ...formData,
            status: 'active',
            featured: false, // Will be set to true after payment
            daily_price: formData.daily_price ? parseFloat(formData.daily_price) : null,
            weekly_price: formData.weekly_price ? parseFloat(formData.weekly_price) : null,
            monthly_price: formData.monthly_price ? parseFloat(formData.monthly_price) : null,
            sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
            security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
            cleaning_fee: formData.cleaning_fee ? parseFloat(formData.cleaning_fee) : null,
            delivery_max_miles: formData.delivery_max_miles ? parseInt(formData.delivery_max_miles) : null,
            delivery_rate_per_mile: formData.delivery_rate_per_mile ? parseFloat(formData.delivery_rate_per_mile) : null,
            sinks: formData.sinks ? parseInt(formData.sinks) : 0,
          };

          const result = await base44.entities.Listing.create(listingData);
          clearSavedData();

          // Create Stripe checkout session
          const checkoutResponse = await base44.functions.invoke('createFeaturedListingCheckout', {
            listing_id: result.id
          });

          console.log('Checkout response:', checkoutResponse);

          // Handle response - could be checkoutResponse.data.url or checkoutResponse.url
          const checkoutUrl = checkoutResponse?.data?.url || checkoutResponse?.url;
          
          if (!checkoutUrl) {
            console.error('Full response:', checkoutResponse);
            throw new Error('No checkout URL in response');
          }

          // Redirect to Stripe checkout
          window.location.href = checkoutUrl;

        } catch (error) {
          console.error('Error creating listing:', error);
          alert(`Failed to create checkout: ${error.message || 'Please try again.'}`);
          setIsSaving(false);
        }
      };

      const handleNotarizedReceiptPayment = async (paymentData) => {
        try {
          // Record addon payment
          const user = await base44.auth.me();
          await base44.entities.Transaction.create({
            user_email: user.email,
            transaction_type: 'addon_payment',
            amount: 60,
            status: 'completed',
            payment_intent_id: paymentData.paymentIntentId,
            description: 'Notarized Sale Receipt Add-on',
            metadata: {
              addon_type: 'notarized_receipt',
              listing_title: formData.title
            }
          });

          setNotarizedReceiptPaid(true);
          setShowPaymentModal(false);
          // Proceed with listing creation
          setTimeout(() => handleSubmit(false), 100);
        } catch (err) {
          console.error('Error recording payment:', err);
          setShowPaymentModal(false);
          setTimeout(() => handleSubmit(false), 100);
        }
      };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isRental = formData.listing_mode === 'rent';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 md:pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-900">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
              </span>
              <span className="text-sm text-slate-500">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl">{STEPS[currentStep].title}</CardTitle>
              <CardDescription>{STEPS[currentStep].desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {STEPS[currentStep].id === 'type' && (
                <ListingTypeSelector value={formData.listing_mode} onChange={(value) => updateField('listing_mode', value)} />
              )}
              
              {STEPS[currentStep].id === 'category' && (
                <CategorySelector value={formData.asset_category} onChange={(value) => updateField('asset_category', value)} />
              )}
              
              {STEPS[currentStep].id === 'basics' && (
                <BasicInfoStep formData={formData} updateField={updateField} />
              )}
              
              {STEPS[currentStep].id === 'location' && (
                <LocationStep formData={formData} updateField={updateField} />
              )}
              
              {STEPS[currentStep].id === 'photos_specs' && (
                <PhotosAndSpecsStep formData={formData} updateField={updateField} updateFields={updateFields} />
              )}
              
              {STEPS[currentStep].id === 'pricing' && (
                <>
                  {isRental ? (
                    <RentPricingStep formData={formData} updateField={updateField} />
                  ) : (
                    <SalePricingStep formData={formData} updateField={updateField} />
                  )}
                </>
              )}
              
              {STEPS[currentStep].id === 'features' && (
                <>
                  {isRental ? (
                    <RentFeaturesStep formData={formData} updateField={updateField} updateFields={updateFields} />
                  ) : (
                    <SaleFeaturesStep formData={formData} updateField={updateField} />
                  )}
                </>
              )}

              {STEPS[currentStep].id === 'addons' && (
                <AddonsStep formData={formData} updateField={updateField} />
              )}

              {STEPS[currentStep].id === 'review' && (
                <>
                  {/* Validation Summary */}
                  {(() => {
                    const validation = getCurrentValidation();
                    const qualityScore = calculateQualityScore(formData);
                    const qualityLabel = getQualityScoreLabel(qualityScore);

                    return (
                      <div className="space-y-4 mb-6">
                        {/* Quality Score */}
                        <div className={`p-4 rounded-xl ${qualityLabel.bgColor}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-900">Listing Quality Score</span>
                            <span className={`text-2xl font-bold ${qualityLabel.color}`}>
                              {qualityScore}/100
                            </span>
                          </div>
                          <div className="w-full bg-white rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                qualityScore >= 80 ? 'bg-green-500' :
                                qualityScore >= 60 ? 'bg-blue-500' :
                                qualityScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${qualityScore}%` }}
                            />
                          </div>
                          <p className={`text-sm ${qualityLabel.color}`}>{qualityLabel.label}</p>
                        </div>

                        {/* Validation Errors */}
                        {validation.errors.length > 0 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <p className="font-medium mb-2">Please fix these issues before publishing:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {validation.errors.map((error, idx) => (
                                  <li key={idx}>{error}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Validation Warnings */}
                        {validation.warnings.length > 0 && validation.errors.length === 0 && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                              <p className="font-medium mb-2">Recommendations:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {validation.warnings.map((warning, idx) => (
                                  <li key={idx}>{warning}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Success */}
                        {validation.isValid && validation.warnings.length === 0 && (
                          <Alert>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              Your listing looks great! Ready to publish.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })()}

                  <ReviewStep formData={formData} />

                  {/* Featured Listing Option */}
                  <div className="mt-6 p-4 border-2 border-amber-200 bg-amber-50 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.want_featured}
                        onChange={(e) => updateField('want_featured', e.target.checked)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">⭐</span>
                          <span className="font-semibold text-slate-900">Make this a Featured Listing</span>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">
                          Get your listing seen first! Featured listings appear at the top of search results and get 5x more views.
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#FF5124]">$30/month</span>
                          <span className="text-xs text-slate-500">• Cancel anytime</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === STEPS.length - 1 ? (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={isSaving}
                  className="rounded-xl"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isSaving}
                  className="bg-[#FF5124] hover:bg-[#e5481f] rounded-xl"
                >
                  {isSaving ? 'Publishing...' : 'Publish Listing'}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="bg-[#FF5124] hover:bg-[#e5481f] rounded-xl"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
        </main>

        {/* Payment Modal for Notarized Receipt */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Add-on Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="font-medium text-slate-900 mb-2">Both Party Notarized Sale Receipt</p>
              <p className="text-sm text-slate-600 mb-3">
                Professional notary service provided by Proof for your sale transaction.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Add-on Fee:</span>
                <span className="text-2xl font-bold text-slate-900">$60</span>
              </div>
            </div>

            <CheckoutButton
              amount={60}
              description="Notarized Sale Receipt Add-on"
              metadata={{
                listing_title: formData.title,
                type: 'notarized_receipt_addon'
              }}
              onSuccess={handleNotarizedReceiptPayment}
              onError={(err) => {
                console.error('Payment error:', err);
                setShowPaymentModal(false);
              }}
              buttonText="Pay $60 & Publish Listing"
              className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-base font-medium"
            />

            <p className="text-xs text-center text-slate-500">
              Secure payment via Stripe. Listing will be published after successful payment.
            </p>
          </div>
        </DialogContent>
        </Dialog>
        </div>
        );
        }
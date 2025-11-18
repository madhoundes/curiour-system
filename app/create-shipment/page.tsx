"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWizardBack } from "@/lib/wizard";
import { useShipment } from "@/lib/shipment-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createStepperSteps, Stepper } from "@/components/ui/stepper";
import { profileService } from "@/lib/api/profile";
import { shippingService } from "@/lib/api/shipping";
import type { UserProfile } from "@/lib/api/types";

// Default fallback data if profile loading fails
const defaultSenderData = {
  business_name: "Your Business",
  contactName: "Contact Name",
  address: "Business Address",
  city: "City",
  province: "Province",
  postalCode: "Postal Code",
  phone: "Phone Number",
  email: "Email Address"
};



export default function CreateShipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wizardBack = useWizardBack();
  const { 
    formData, 
    updateFormField, 
    resetForm,
    isFormValid 
  } = useShipment();
  
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [senderData, setSenderData] = useState(defaultSenderData);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [senderAddressError, setSenderAddressError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Postal code validation functions (reused for sender validation)
  const isTorontoPostalCode = (postalCode: string): boolean => {
    const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!normalized.startsWith('M')) {
      return false;
    }
    const digit1 = parseInt(normalized.charAt(1));
    return digit1 >= 1 && digit1 <= 9;
  };

  const isMississaugaPostalCode = (postalCode: string): boolean => {
    const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!normalized.startsWith('L')) {
      return false;
    }
    const fsa = normalized.substring(0, 3);
    const digit1 = parseInt(fsa.charAt(1));
    const letter2 = fsa.charAt(2);
    
    if (digit1 === 4) {
      return ['T', 'W', 'X', 'Y', 'Z'].includes(letter2);
    }
    if (digit1 === 5) {
      return ['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W'].includes(letter2);
    }
    return false;
  };

  const isPostalCodeInServiceArea = (postalCode: string): boolean => {
    return isTorontoPostalCode(postalCode) || isMississaugaPostalCode(postalCode);
  };

  const validateSenderAddress = (city: string, postalCode: string): string | null => {
    if (!city || !postalCode) {
      return null; // Don't validate if data is missing
    }

    const normalizedCity = city.trim().toLowerCase();
    const normalizedPostalCode = postalCode.trim().toUpperCase().replace(/\s+/g, '');
    
    const isToronto = normalizedCity === 'toronto' || normalizedCity.includes('downtown');
    const isMississauga = normalizedCity === 'mississauga';
    const isValidPostalCode = isPostalCodeInServiceArea(normalizedPostalCode);

    if (!isToronto && !isMississauga) {
      return `Your pickup location (sender address) must be in Downtown Toronto or Mississauga. Currently set to "${city}". Please update your profile address.`;
    }

    if (!isValidPostalCode) {
      return `Your pickup location postal code "${postalCode}" is not in our service area. Pickup is only available in Downtown Toronto (M prefix) and Mississauga (L4T-L5W prefix). Please update your profile address.`;
    }

    if (isToronto && !isTorontoPostalCode(normalizedPostalCode)) {
      return `Your pickup location postal code "${postalCode}" does not belong to Toronto. Please update your profile address.`;
    }

    if (isMississauga && !isMississaugaPostalCode(normalizedPostalCode)) {
      return `Your pickup location postal code "${postalCode}" does not belong to Mississauga. Please update your profile address.`;
    }

    return null;
  };

  // Load user profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        setSenderAddressError(null);
        
        const profile = await profileService.getProfile();
        
        // Check if profile data is available before accessing properties
        if (profile) {
          // Map profile data to sender data format
          const newSenderData = {
            business_name: profile.business_name || (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : "Your Business"),
            contactName: (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : "Contact Name"),
            address: profile.street_address || "Business Address",
            city: profile.city || "City",
            province: profile.province || "Province", 
            postalCode: profile.postal_code || "Postal Code",
            phone: profile.phone_number || "Phone Number",
            email: profile.email || "Email Address"
          };
          
          setSenderData(newSenderData);
          
          // Validate sender address
          if (newSenderData.city && newSenderData.postalCode) {
            const validationError = validateSenderAddress(newSenderData.city, newSenderData.postalCode);
            if (validationError) {
              setSenderAddressError(validationError);
            }
          }
        } else {
          console.warn('Profile data is undefined, using default values');
          // Keep default sender data if profile is undefined
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setProfileError(error instanceof Error ? error.message : 'Failed to load profile');
        // Keep default data if profile loading fails
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Initialize form - allow cached data to load
  useEffect(() => {
    // Only run once on initial mount
    if (hasInitialized) return;
    setHasInitialized(true);
  }, [hasInitialized]);

  // Set default province to "ON" for recipient address (service area is Ontario)
  useEffect(() => {
    if (!formData.recipientProvince || formData.recipientProvince.trim() === '') {
      updateFormField('recipientProvince', 'ON');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const validatePostalCode = (postalCode: string, city: string): string | null => {
    if (!postalCode || postalCode.trim() === '') {
      return 'Postal code is required';
    }

    // Basic format validation
    const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    if (!canadianPostalCodeRegex.test(postalCode.trim())) {
      return 'Invalid postal code format. Please use format A1A 1A1';
    }

    // Check if postal code is in service area
    if (!isPostalCodeInServiceArea(postalCode)) {
      return 'This postal code is not in our service area. Delivery is only available in Downtown Toronto (M prefix) and Mississauga (L4T-L5W prefix).';
    }

    // Check if postal code matches selected city
    if (city === 'Toronto' && !isTorontoPostalCode(postalCode)) {
      return 'This postal code does not belong to Toronto. Toronto postal codes start with M.';
    }

    if (city === 'Mississauga' && !isMississaugaPostalCode(postalCode)) {
      return 'This postal code does not belong to Mississauga. Mississauga postal codes start with L4T-L5W.';
    }

    // Auto-detect city from postal code if city is not selected
    if (!city && isTorontoPostalCode(postalCode)) {
      updateFormField('recipientCity', 'Toronto');
    } else if (!city && isMississaugaPostalCode(postalCode)) {
      updateFormField('recipientCity', 'Mississauga');
    }

    return null;
  };

  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    updateFormField(field as keyof typeof formData, value);
    
    // Clear error for this field when user starts typing
    if (hasAttemptedSubmit && fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Auto-set province to "ON" when city is selected (both cities are in Ontario)
    if (field === 'recipientCity' && (value === 'Toronto' || value === 'Mississauga')) {
      updateFormField('recipientProvince', 'ON');
      // Re-validate postal code when city changes
      if (formData.recipientPostalCode) {
        const error = validatePostalCode(formData.recipientPostalCode, value as string);
        setPostalCodeError(error);
        if (hasAttemptedSubmit) {
          setFieldErrors(prev => ({
            ...prev,
            recipientPostalCode: error || ''
          }));
        }
      }
    }

    // Validate postal code when it changes
    if (field === 'recipientPostalCode') {
      const error = validatePostalCode(value as string, formData.recipientCity);
      setPostalCodeError(error);
      if (hasAttemptedSubmit) {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          if (error) {
            newErrors.recipientPostalCode = error;
          } else {
            delete newErrors.recipientPostalCode;
          }
          return newErrors;
        });
      }
    }
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate sender address
    if (senderAddressError) {
      errors.senderAddress = senderAddressError;
    }
    
    // Validate recipient fields
    if (!formData.recipientName || formData.recipientName.trim() === '') {
      errors.recipientName = 'Full name is required';
    }
    
    if (!formData.recipientAddress || formData.recipientAddress.trim() === '') {
      errors.recipientAddress = 'Street address is required';
    }
    
    if (!formData.recipientCity || formData.recipientCity.trim() === '') {
      errors.recipientCity = 'City is required';
    }
    
    if (!formData.recipientProvince || formData.recipientProvince.trim() === '') {
      errors.recipientProvince = 'Province is required';
    }
    
    if (!formData.recipientPostalCode || formData.recipientPostalCode.trim() === '') {
      errors.recipientPostalCode = 'Postal code is required';
    } else {
      const postalError = validatePostalCode(formData.recipientPostalCode, formData.recipientCity);
      if (postalError) {
        errors.recipientPostalCode = postalError;
        setPostalCodeError(postalError);
      } else {
        setPostalCodeError(null);
      }
    }
    
    if (!formData.recipientPhone || formData.recipientPhone.trim() === '') {
      errors.recipientPhone = 'Phone number is required';
    }
    
    if (!formData.recipientEmail || formData.recipientEmail.trim() === '') {
      errors.recipientEmail = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      errors.recipientEmail = 'Please enter a valid email address';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToPackageDetails = async () => {
    setHasAttemptedSubmit(true);
    
    // Validate all fields
    const isValid = validateAllFields();
    
    if (!isValid) {
      // Scroll to first error
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        const element = document.getElementById(`parcego-recipient-${firstErrorField}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real implementation, you might want to save draft shipment data here
      // For now, we'll just proceed to the next step
      router.push('/package-details');
    } catch (error) {
      console.error('Error proceeding to package details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    wizardBack();
  };

  const stepperSteps = createStepperSteps(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PageHeader
          title="Create New Shipment"
          description="Fill in the details below to create your shipment"
        />

        {/* Stepper Component - Added here */}
        <div className="mb-8">
          <Stepper 
            steps={stepperSteps} 
            variant="centered"
            className="bg-white rounded-lg border border-gray-200 p-6"
          />
        </div>

        <div className="space-y-8">
          
          {/* Sender Information */}
          <Card className="parcego-card parcego-card--sender">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="User" size={20} className="text-blue-600" />
                    <span>Sender Information</span>
                  </CardTitle>
                  <CardDescription>
                    This information is automatically filled from your business profile
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/profile'}
                  className="parcego-sender-edit-btn"
                  aria-label="Edit sender information"
                >
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit Info
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <div className="flex items-center">
                    <Icon name="AlertTriangle" size={16} className="text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      Unable to load profile data: {profileError}. Using default values.
                    </span>
                  </div>
                </div>
              )}
              
              {senderAddressError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 mb-1">
                        Pickup Location Not Supported
                      </p>
                      <p className="text-sm text-red-700 mb-2">
                        {senderAddressError}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/profile'}
                        className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                      >
                        <Icon name="Edit" size={14} className="mr-2" />
                        Update Profile Address
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {!senderAddressError && senderData.city && senderData.postalCode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-700">
                      ✓ Pickup location verified: {senderData.city}, {senderData.postalCode}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-business-name">Business Name</Label>
                  <Input
                    id="parcego-sender-business-name"
                    value={profileLoading ? "Loading..." : senderData.business_name}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-contact-name">Contact Name</Label>
                  <Input
                    id="parcego-sender-contact-name"
                    value={profileLoading ? "Loading..." : senderData.contactName}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parcego-sender-address">Address</Label>
                <Input
                  id="parcego-sender-address"
                  value={profileLoading ? "Loading..." : senderData.address}
                  readOnly
                  className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-city">City</Label>
                  <Input
                    id="parcego-sender-city"
                    value={profileLoading ? "Loading..." : senderData.city}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-province">Province</Label>
                  <Input
                    id="parcego-sender-province"
                    value={profileLoading ? "Loading..." : senderData.province}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-postal-code">Postal Code</Label>
                  <Input
                    id="parcego-sender-postal-code"
                    value={profileLoading ? "Loading..." : senderData.postalCode}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-phone">Phone</Label>
                  <Input
                    id="parcego-sender-phone"
                    value={profileLoading ? "Loading..." : senderData.phone}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-email">Email</Label>
                  <Input
                    id="parcego-sender-email"
                    value={profileLoading ? "Loading..." : senderData.email}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Information */}
          <Card className="parcego-card parcego-card--recipient">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="MapPin" size={20} className="text-green-600" />
                <span>Recipient Information</span>
              </CardTitle>
              <CardDescription>
                Enter the delivery destination and recipient details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Area Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Service Area Restriction
                    </p>
                    <p className="text-sm text-blue-700">
                      Both <strong>pickup</strong> (sender) and <strong>delivery</strong> (recipient) addresses must be in <strong>Downtown Toronto</strong> or <strong>Mississauga</strong>, Ontario. Please ensure both addresses are in one of these areas.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="parcego-recipient-name"
                    placeholder="Enter recipient's full name"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className={`parcego-form__input ${fieldErrors.recipientName ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                    required
                    aria-invalid={!!fieldErrors.recipientName}
                    aria-describedby={fieldErrors.recipientName ? 'parcego-recipient-name-error' : undefined}
                  />
                  {fieldErrors.recipientName && (
                    <p id="parcego-recipient-name-error" className="text-sm text-red-600 mt-1">
                      {fieldErrors.recipientName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-company">Company (Optional)</Label>
                  <Input
                    id="parcego-recipient-company"
                    placeholder="Company name (if applicable)"
                    value={formData.recipientCompany}
                    onChange={(e) => handleInputChange('recipientCompany', e.target.value)}
                    className="parcego-form__input"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parcego-recipient-address">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="parcego-recipient-address"
                  placeholder="Enter street address"
                  value={formData.recipientAddress}
                  onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                  className={`parcego-form__input ${fieldErrors.recipientAddress ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                  required
                  aria-invalid={!!fieldErrors.recipientAddress}
                  aria-describedby={fieldErrors.recipientAddress ? 'parcego-recipient-address-error' : undefined}
                />
                {fieldErrors.recipientAddress && (
                  <p id="parcego-recipient-address-error" className="text-sm text-red-600 mt-1">
                    {fieldErrors.recipientAddress}
                  </p>
                )}
              </div>
              

              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.recipientCity}
                    onValueChange={(value) => handleInputChange('recipientCity', value)}
                    required
                  >
                    <SelectTrigger 
                      id="parcego-recipient-city" 
                      className={`parcego-form__input ${fieldErrors.recipientCity ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                      aria-invalid={!!fieldErrors.recipientCity}
                      aria-describedby={fieldErrors.recipientCity ? 'parcego-recipient-city-error' : undefined}
                    >
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Toronto">Toronto</SelectItem>
                      <SelectItem value="Mississauga">Mississauga</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.recipientCity ? (
                    <p id="parcego-recipient-city-error" className="text-sm text-red-600 mt-1">
                      {fieldErrors.recipientCity}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Delivery is only available in Downtown Toronto and Mississauga
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-province">
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="parcego-recipient-province"
                    placeholder="ON"
                    value={formData.recipientProvince || 'ON'}
                    readOnly
                    className="parcego-form__input bg-gray-50 cursor-not-allowed"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ontario (service area only)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-postal-code">
                    Postal Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="parcego-recipient-postal-code"
                    placeholder={formData.recipientCity === 'Toronto' ? 'M5V 3A8' : formData.recipientCity === 'Mississauga' ? 'L5A 1B2' : 'M5V 3A8 or L5A 1B2'}
                    value={formData.recipientPostalCode}
                    onChange={(e) => handleInputChange('recipientPostalCode', e.target.value)}
                    className={`parcego-form__input ${(postalCodeError || fieldErrors.recipientPostalCode) ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                    required
                    aria-invalid={!!(postalCodeError || fieldErrors.recipientPostalCode)}
                    aria-describedby={(postalCodeError || fieldErrors.recipientPostalCode) ? 'parcego-recipient-postal-code-error' : undefined}
                  />
                  {(postalCodeError || fieldErrors.recipientPostalCode) && (
                    <p id="parcego-recipient-postal-code-error" className="text-sm text-red-600 mt-1">
                      {postalCodeError || fieldErrors.recipientPostalCode}
                    </p>
                  )}
                  {!postalCodeError && !fieldErrors.recipientPostalCode && formData.recipientPostalCode && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Valid postal code for {formData.recipientCity || 'service area'}
                    </p>
                  )}
                  {!postalCodeError && !fieldErrors.recipientPostalCode && !formData.recipientPostalCode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a postal code in Downtown Toronto (M prefix) or Mississauga (L4T-L5W prefix). Both pickup and delivery must be in the service area.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-phone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="parcego-recipient-phone"
                    placeholder="(555) 123-4567"
                    value={formData.recipientPhone}
                    onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                    className={`parcego-form__input ${fieldErrors.recipientPhone ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                    required
                    aria-invalid={!!fieldErrors.recipientPhone}
                    aria-describedby={fieldErrors.recipientPhone ? 'parcego-recipient-phone-error' : undefined}
                  />
                  {fieldErrors.recipientPhone && (
                    <p id="parcego-recipient-phone-error" className="text-sm text-red-600 mt-1">
                      {fieldErrors.recipientPhone}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="parcego-recipient-email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={formData.recipientEmail}
                    onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                    className={`parcego-form__input ${fieldErrors.recipientEmail ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                    required
                    aria-invalid={!!fieldErrors.recipientEmail}
                    aria-describedby={fieldErrors.recipientEmail ? 'parcego-recipient-email-error' : undefined}
                  />
                  {fieldErrors.recipientEmail && (
                    <p id="parcego-recipient-email-error" className="text-sm text-red-600 mt-1">
                      {fieldErrors.recipientEmail}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Package Information */}
          <Card className="parcego-card parcego-card--package">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Package" size={20} className="text-purple-600" />
                <span>Package Information</span>
              </CardTitle>
              <CardDescription>
                Specify package type and service level for accurate pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Package Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Package Type</Label>
                <div className="grid grid-cols-1 w-full">
                  <div className="parcego-package-type__selected p-6 border-2 border-blue-500 bg-blue-50 rounded-lg text-center text-blue-700 w-full">
                    <div className="text-2xl mb-3">📦</div>
                    <div className="font-semibold text-lg">Box</div>
                    <div className="text-sm text-blue-600 mt-1">Default Package Type</div>
                  </div>
                </div>
                <input type="hidden" name="packageType" value="box" />
              </div>

              {/* Service Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Service Type</Label>
                <div className="parcego-service-type__container">
                  <div className="parcego-service-type__selected p-4 border-2 border-blue-500 bg-blue-50 rounded-lg text-left w-full">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg width="24" height="15" viewBox="0 0 41 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="parcego-service-type__logo">
                          <g clipPath="url(#clip0_35_54)">
                            <path d="M36.7788 0.29657C37.4253 0.290178 38.1103 0.279704 38.6929 0.601257C39.3833 0.917694 39.8396 1.65685 39.8716 2.40692C39.8631 7.44951 39.875 12.4932 39.8696 17.5358C39.7716 18.647 39.2814 19.7392 38.4653 20.5085C37.5629 21.4162 36.6484 22.312 35.7417 23.2155C35.0428 24.0636 33.9099 24.4037 32.8423 24.3952C30.9939 24.4144 29.1467 24.3926 27.2983 24.4001C26.5494 24.3798 25.7991 24.4373 25.0522 24.3659C24.5942 24.3318 24.1678 23.9777 24.0718 23.5251C23.9194 23.0053 24.207 22.4059 24.7065 22.197C25.2563 21.9658 25.8683 22.0931 26.4458 22.0622C26.4426 20.4429 26.4525 18.8231 26.4419 17.2038C25.9688 17.7269 25.4567 18.2118 24.9399 18.6901C23.4602 20.1944 22.0101 21.7265 20.5122 23.2116C19.8314 23.9605 18.8263 24.4108 17.811 24.3874C15.8593 24.3938 13.9054 24.4304 11.9536 24.3718C11.3049 24.3888 10.6973 23.8466 10.6929 23.1872C10.6971 21.4931 10.6834 19.7963 10.6919 18.1022C8.34069 18.1246 5.98842 18.096 3.63721 18.112C3.26217 18.1248 2.95718 17.8521 2.77393 17.5495C2.43939 16.906 2.86903 15.9601 3.63721 15.9431C6.37311 15.9409 9.11029 15.9394 11.8462 15.9362C12.3842 15.8735 12.9411 16.3484 12.9155 16.8991C12.9272 18.6143 12.9602 20.3294 12.9282 22.0446C14.4507 22.0723 15.975 22.0518 17.4976 22.0593C17.768 22.0656 18.0657 22.0379 18.2573 21.8239C19.5847 20.5189 20.8327 19.1353 22.1548 17.8249C22.9049 17.0695 23.6161 16.2751 24.3608 15.5143C23.4553 15.5026 22.5496 15.5242 21.644 15.4997C21.1838 15.4965 20.6972 15.2986 20.4575 14.8884C20.1166 14.3258 20.372 13.5162 20.9644 13.236C21.3031 13.0411 21.7015 13.0527 22.0786 13.0612C23.9633 13.0687 25.8473 13.0532 27.731 13.0671C28.3711 13.0939 28.8517 13.7241 28.7739 14.3483C28.6685 15.5148 28.7121 16.6865 28.7036 17.8561C28.6962 19.2528 28.7193 20.6508 28.6948 22.0485C29.8689 22.0698 31.0432 22.0493 32.2173 22.0632C32.2045 17.3124 32.2088 12.5601 32.2173 7.80927C25.7831 7.82738 19.3488 7.79959 12.9146 7.82196C12.9146 9.56605 12.9135 11.3103 12.9146 13.0544C9.3251 13.0373 5.73545 13.0495 2.146 13.0495C1.81684 13.0516 1.47774 12.9368 1.2583 12.6833C0.78784 12.2186 0.870102 11.3002 1.46338 10.9743C1.76058 10.7711 2.13152 10.8314 2.47021 10.8239C5.20516 10.826 7.94035 10.825 10.6753 10.8239C10.6987 9.41007 10.6213 7.9914 10.7417 6.58075C10.7567 6.22927 10.9511 5.93034 11.187 5.68329L11.7632 5.10712C12.8585 3.99551 13.9041 2.83527 15.0171 1.74091C15.9834 0.806605 17.3221 0.284588 18.6655 0.300476C24.7034 0.291953 30.7409 0.299766 36.7788 0.29657ZM37.5874 4.21259C37.2699 4.40863 37.0198 4.68735 36.7534 4.94305C35.9885 5.69522 35.2247 6.45101 34.48 7.22235C34.4704 11.8964 34.4994 16.5783 34.4771 21.2556C35.0992 20.6888 35.6702 20.0685 36.2817 19.489C36.6216 19.1459 37.0077 18.8274 37.2251 18.3864C37.5063 17.8697 37.6097 17.2738 37.6108 16.6911C37.6183 12.5317 37.5981 8.37201 37.5874 4.21259ZM5.13525 5.5993C6.06101 5.6174 6.98782 5.58226 7.91357 5.61102C8.48142 5.74633 8.83014 6.47 8.57666 7.00165C8.43709 7.35217 8.0916 7.64271 7.70166 7.62567C6.77366 7.59797 5.84548 7.63384 4.91748 7.62958C4.25708 7.63478 3.79911 6.83349 4.06201 6.24969C4.16429 5.98014 4.37893 5.76027 4.64209 5.6452C4.79648 5.57724 4.97131 5.60782 5.13525 5.5993ZM35.8687 2.58466C30.0641 2.59531 24.2591 2.58537 18.4546 2.58856C17.7686 2.55675 17.1816 2.99085 16.6958 3.42548C15.9906 4.09557 15.3537 4.83512 14.6304 5.48602C20.7267 5.51159 26.823 5.49268 32.9204 5.49481C33.8611 4.48275 34.9492 3.61484 35.8687 2.58466Z" fill="#0091F5"/>
                          </g>
                          <defs>
                            <clipPath id="clip0_35_54">
                              <rect width="39.5" height="24.5" fill="white" transform="translate(0.75 0.25)"/>
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-blue-700 text-lg">Parcego Standard</div>
                        <div className="text-sm text-blue-600 mt-1">3-5 business days</div>
                      </div>
                    </div>
                  </div>
                </div>
                <input type="hidden" name="serviceType" value="standard" />
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="parcego-special-instructions">Special Instructions (Optional)</Label>
                <textarea
                  id="parcego-special-instructions"
                  rows={3}
                  placeholder="Any special handling instructions or delivery notes..."
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  className="parcego-form__textarea w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="parcego-action-btn parcego-action-btn--cancel"
              id="parcego-cancel-shipment-btn"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleContinueToPackageDetails}
              disabled={isLoading}
              className="parcego-action-btn parcego-action-btn--continue bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              id="parcego-continue-package-details-btn"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  Continue to Package Details
                  <Icon name="ArrowRight" size={18} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

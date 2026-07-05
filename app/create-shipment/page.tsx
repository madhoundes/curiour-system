"use client";

import React, { useState, useEffect, Suspense } from "react";
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
import { buildFullAddress, geocodeAddress } from "@/lib/geocoding";

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

// Main component content
function CreateShipmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wizardBack = useWizardBack();
  const { 
    formData, 
    updateFormField,
    updateMultipleFields,
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

  // Pre-fill form from URL parameters (from quote modal)
  useEffect(() => {
    const weight = searchParams.get('weight');
    const postalCode = searchParams.get('destinationPostalCode');
    const packageSize = searchParams.get('packageSize');
    const deliverySpeed = searchParams.get('deliverySpeed');
    
    if (weight || postalCode || packageSize || deliverySpeed) {
      console.log('Pre-filling form from quote modal:', { weight, postalCode, packageSize, deliverySpeed });
      
      // Update form fields with data from quote modal
      if (weight) {
        updateFormField('weight', weight);
      }
      
      if (postalCode) {
        updateFormField('recipientPostalCode', postalCode);
        
        // Auto-detect city from postal code
        if (isTorontoPostalCode(postalCode)) {
          updateFormField('recipientCity', 'Toronto');
        } else if (isMississaugaPostalCode(postalCode)) {
          updateFormField('recipientCity', 'Mississauga');
        }
      }

      if (
        deliverySpeed === 'next_day' ||
        deliverySpeed === 'standard_2_3' ||
        deliverySpeed === 'legacy'
      ) {
        updateFormField('deliverySpeed', deliverySpeed);
      }
      
      // Note: packageSize from quote modal doesn't directly map to our form
      // Quote uses: small/medium/large
      // Form uses: box/envelope/tube/pallet
      // We'll just use the default 'box' for now
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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

  useEffect(() => {
    const { recipientAddress, recipientCity, recipientProvince, recipientPostalCode } = formData;
    if (!recipientAddress?.trim() || !recipientCity || !recipientPostalCode?.trim()) {
      return;
    }

    const postalError = validatePostalCode(recipientPostalCode, recipientCity);
    if (postalError) {
      return;
    }

    let cancelled = false;
    const runGeocode = async () => {
      const fullAddress = buildFullAddress({
        street: recipientAddress,
        city: recipientCity,
        province: recipientProvince || 'ON',
        postalCode: recipientPostalCode,
      });
      const coords = await geocodeAddress(fullAddress);
      if (cancelled || !coords) {
        return;
      }

      updateMultipleFields({
        recipientLatitude: coords.latitude,
        recipientLongitude: coords.longitude,
      });
    };

    void runGeocode();

    return () => {
      cancelled = true;
    };
  }, [
    formData.recipientAddress,
    formData.recipientCity,
    formData.recipientProvince,
    formData.recipientPostalCode,
    updateMultipleFields,
  ]);

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
    
    // Validate phone number when it changes
    if (field === 'recipientPhone' && hasAttemptedSubmit) {
      const phoneValue = value as string;
      const digitsOnly = phoneValue.replace(/\D/g, '');
      
      let phoneError = '';
      if (!phoneValue.trim()) {
        phoneError = 'Phone number is required';
      } else if (digitsOnly.length < 10) {
        phoneError = 'Phone number must be at least 10 digits';
      } else if (digitsOnly.length > 11) {
        phoneError = 'Phone number is too long';
      } else if (digitsOnly.length === 11 && digitsOnly[0] !== '1') {
        phoneError = 'Invalid country code. Use 1 for North America';
      }
      
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        if (phoneError) {
          newErrors.recipientPhone = phoneError;
        } else {
          delete newErrors.recipientPhone;
        }
        return newErrors;
      });
    }
    
    // Validate email when it changes
    if (field === 'recipientEmail' && hasAttemptedSubmit) {
      const emailValue = (value as string).trim();
      let emailError = '';
      
      if (!emailValue) {
        emailError = 'Email address is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
          emailError = 'Please enter a valid email address';
        } else {
          const [localPart, domain] = emailValue.split('@');
          
          if (localPart.length > 64) {
            emailError = 'Email address is too long';
          } else if (localPart.startsWith('.') || localPart.endsWith('.')) {
            emailError = 'Email cannot start or end with a period';
          } else if (localPart.includes('..')) {
            emailError = 'Email cannot contain consecutive periods';
          } else if (domain && !domain.includes('.')) {
            emailError = 'Email must have a valid domain (e.g., example.com)';
          }
          
          // Check for common typos
          const domainLower = domain?.toLowerCase();
          const possibleTypos: Record<string, string> = {
            'gmial.com': 'gmail.com',
            'gmai.com': 'gmail.com',
            'yahooo.com': 'yahoo.com',
            'yaho.com': 'yahoo.com',
            'hotmial.com': 'hotmail.com',
            'outlok.com': 'outlook.com'
          };
          
          if (domainLower && possibleTypos[domainLower]) {
            emailError = `Did you mean ${possibleTypos[domainLower]}?`;
          }
        }
      }
      
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        if (emailError) {
          newErrors.recipientEmail = emailError;
        } else {
          delete newErrors.recipientEmail;
        }
        return newErrors;
      });
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
    
    // Phone validation - Canadian/North American format
    if (!formData.recipientPhone || formData.recipientPhone.trim() === '') {
      errors.recipientPhone = 'Phone number is required';
    } else {
      // Remove all non-digit characters for validation
      const digitsOnly = formData.recipientPhone.replace(/\D/g, '');
      
      // Check if it's a valid North American phone number (10 digits)
      if (digitsOnly.length < 10) {
        errors.recipientPhone = 'Phone number must be at least 10 digits';
      } else if (digitsOnly.length > 11) {
        errors.recipientPhone = 'Phone number is too long';
      } else if (digitsOnly.length === 11 && digitsOnly[0] !== '1') {
        errors.recipientPhone = 'Invalid country code. Use 1 for North America';
      } else if (digitsOnly.length === 10 || (digitsOnly.length === 11 && digitsOnly[0] === '1')) {
        // Valid format - extract area code and check if it's valid
        const areaCode = digitsOnly.length === 11 ? digitsOnly.substring(1, 4) : digitsOnly.substring(0, 3);
        const invalidAreaCodes = ['000', '111', '555']; // Common invalid area codes
        
        if (invalidAreaCodes.includes(areaCode)) {
          errors.recipientPhone = 'Invalid area code';
        }
      }
    }
    
    // Email validation - comprehensive check
    if (!formData.recipientEmail || formData.recipientEmail.trim() === '') {
      errors.recipientEmail = 'Email address is required';
    } else {
      const email = formData.recipientEmail.trim();
      
      // Basic format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.recipientEmail = 'Please enter a valid email address';
      } else {
        // Additional validation checks
        const [localPart, domain] = email.split('@');
        
        // Check local part (before @)
        if (localPart.length > 64) {
          errors.recipientEmail = 'Email address is too long';
        } else if (localPart.startsWith('.') || localPart.endsWith('.')) {
          errors.recipientEmail = 'Email cannot start or end with a period';
        } else if (localPart.includes('..')) {
          errors.recipientEmail = 'Email cannot contain consecutive periods';
        }
        
        // Check domain part (after @)
        if (domain && domain.length > 255) {
          errors.recipientEmail = 'Domain name is too long';
        } else if (domain && !domain.includes('.')) {
          errors.recipientEmail = 'Email must have a valid domain (e.g., example.com)';
        } else if (domain && domain.split('.').some(part => part.length === 0)) {
          errors.recipientEmail = 'Invalid domain format';
        }
        
        // Check for common typos in popular domains
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const domainLower = domain?.toLowerCase();
        const possibleTypos: Record<string, string> = {
          'gmial.com': 'gmail.com',
          'gmai.com': 'gmail.com',
          'yahooo.com': 'yahoo.com',
          'yaho.com': 'yahoo.com',
          'hotmial.com': 'hotmail.com',
          'outlok.com': 'outlook.com'
        };
        
        if (domainLower && possibleTypos[domainLower]) {
          errors.recipientEmail = `Did you mean ${possibleTypos[domainLower]}?`;
        }
      }
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
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="MapPin" size={20} className="text-green-600" />
                    <span>Recipient Information</span>
                  </CardTitle>
                  <CardDescription>
                    Enter the delivery destination and recipient details
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (confirm('Clear all recipient information? This will reset all recipient fields but keep your package details.')) {
                      // Clear all recipient fields
                      updateFormField('recipientName', '');
                      updateFormField('recipientCompany', '');
                      updateFormField('recipientAddress', '');
                      updateFormField('recipientCity', '');
                      updateFormField('recipientProvince', 'ON'); // Keep default province
                      updateFormField('recipientPostalCode', '');
                      updateFormField('recipientPhone', '');
                      updateFormField('recipientEmail', '');
                      // Clear any field errors
                      setFieldErrors({});
                      setPostalCodeError(null);
                    }
                  }}
                  className="parcego-recipient-clear-btn border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  aria-label="Clear all recipient information"
                  title="Clear all recipient fields"
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Clear Recipient
                </Button>
              </div>
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
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.recipientPhone}
                    onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                    className={`parcego-form__input ${fieldErrors.recipientPhone ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                    required
                    aria-invalid={!!fieldErrors.recipientPhone}
                    aria-describedby={fieldErrors.recipientPhone ? 'parcego-recipient-phone-error' : 'parcego-recipient-phone-hint'}
                  />
                  {fieldErrors.recipientPhone ? (
                    <p id="parcego-recipient-phone-error" className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {fieldErrors.recipientPhone}
                    </p>
                  ) : formData.recipientPhone && formData.recipientPhone.replace(/\D/g, '').length >= 10 ? (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Icon name="CheckCircle" size={14} />
                      Valid phone number
                    </p>
                  ) : (
                    <p id="parcego-recipient-phone-hint" className="text-xs text-gray-500 mt-1">
                      Enter 10-digit phone number (e.g., 555-123-4567)
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
                    aria-describedby={fieldErrors.recipientEmail ? 'parcego-recipient-email-error' : 'parcego-recipient-email-hint'}
                  />
                  {fieldErrors.recipientEmail ? (
                    <p id="parcego-recipient-email-error" className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {fieldErrors.recipientEmail}
                    </p>
                  ) : formData.recipientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail) ? (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Icon name="CheckCircle" size={14} />
                      Valid email address
                    </p>
                  ) : (
                    <p id="parcego-recipient-email-hint" className="text-xs text-gray-500 mt-1">
                      We'll send tracking updates to this email
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
                <Label className="text-base font-medium">Delivery Speed</Label>
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg text-sm text-blue-800">
                  Delivery speed options (next day or 2–3 day) are shown at checkout based on your recipient address.
                </div>
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
          <div className="pt-6 border-t border-gray-200">
            {/* Error Summary */}
            {(Object.keys(fieldErrors).length > 0 || postalCodeError || senderAddressError) && (
              <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      Please fix the following errors:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                      {senderAddressError && (
                        <li>Sender address: {senderAddressError}</li>
                      )}
                      {Object.entries(fieldErrors).map(([field, error]) => (
                        <li key={field}>
                          {field.replace('recipient', '').replace(/([A-Z])/g, ' $1').trim()}: {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
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
                disabled={isLoading || Object.keys(fieldErrors).length > 0 || !!postalCodeError || !!senderAddressError}
                className="parcego-action-btn parcego-action-btn--continue bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                id="parcego-continue-package-details-btn"
                title={
                  Object.keys(fieldErrors).length > 0 || postalCodeError || senderAddressError
                    ? 'Please fix all errors before continuing'
                    : ''
                }
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
    </div>
  );
}

// Wrap with Suspense boundary for useSearchParams
export default function CreateShipmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shipment form...</p>
        </div>
      </div>
    }>
      <CreateShipmentContent />
    </Suspense>
  );
}

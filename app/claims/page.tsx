"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stepper, StepperStep } from "@/components/ui/stepper";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, Calendar as CalendarIcon } from "lucide-react";
import { profileService } from "@/lib/api/profile";
import { claimsService } from "@/lib/api/claims";
import { shippingService } from "@/lib/api/shipping";
import type { CreateClaimRequest, DetailedShipment } from "@/lib/api/types";

// Types for the claims form
interface ClaimFormData {
  shipmentNumber: string;
  claimType: string;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  estimatedValue: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  business_name: string;
  documents: File[];
}

// Insurance coverage information
const insuranceCoverage = {
  basic: {
    name: "Basic Coverage",
    description: "Standard protection for common shipping risks",
    coverage: ["Loss", "Damage", "Theft"],
    deductible: "$50",
    maxCoverage: "$500",
    premium: "2.5% of declared value"
  },
  premium: {
    name: "Premium Coverage",
    description: "Comprehensive protection with extended benefits",
    coverage: ["Loss", "Damage", "Theft", "Delay", "Weather Damage", "Handling Damage"],
    deductible: "$25",
    maxCoverage: "$2,500",
    premium: "3.5% of declared value"
  },
  express: {
    name: "Express Coverage",
    description: "High-value item protection with expedited claims",
    coverage: ["Loss", "Damage", "Theft", "Delay", "Weather Damage", "Handling Damage", "Accidental Damage"],
    deductible: "$0",
    maxCoverage: "$10,000",
    premium: "5.0% of declared value"
  }
};

// Claim types - Updated to match API requirements
const claimTypes = [
  { value: "lost", label: "Lost", description: "Package lost during transit" },
  { value: "damaged", label: "Damaged", description: "Package damaged during shipping" },
  { value: "late_delivery", label: "Late Delivery", description: "Significant delivery delay" },
  { value: "wrong_address", label: "Wrong Address", description: "Package delivered to incorrect address" },
  { value: "missing_items", label: "Missing Items", description: "Some items missing from package" },
  { value: "other", label: "Other", description: "Other shipping issues" }
];

// Stepper steps
const stepperSteps: StepperStep[] = [
  { id: "shipment", title: "Shipment Details", status: "current" },
  { id: "incident", title: "Incident Information", status: "upcoming" },
  { id: "documents", title: "Documents & Proof", status: "upcoming" },
  { id: "contact", title: "Contact Information", status: "upcoming" },
  { id: "review", title: "Review & Submit", status: "upcoming" }
];

// Mock claims data for the modal (removed as not currently used)

// Status configuration for claims (commented out as not currently used)
// const claimStatusConfig = {
//   approved: { label: "Approved", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
//   pending_review: { label: "Pending Review", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
//   under_investigation: { label: "Under Investigation", color: "bg-blue-50 text-blue-700 border-blue-200", icon: AlertTriangle },
//   rejected: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle }
// };

// Claim type configuration (commented out as not currently used)
// const claimTypeConfig = {
//   damage: { label: "Damage", color: "bg-orange-50 text-orange-700" },
//   loss: { label: "Loss", color: "bg-red-50 text-red-700" },
//   delay: { label: "Delay", color: "bg-yellow-50 text-yellow-700" },
//   theft: { label: "Theft", color: "bg-purple-50 text-purple-700" },
//   handling: { label: "Handling", color: "bg-yellow-50 text-yellow-700" }
// };

export default function ClaimsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formData, setFormData] = useState<ClaimFormData>({
    shipmentNumber: "",
    claimType: "",
    incidentDate: "",
    incidentLocation: "",
    description: "",
    estimatedValue: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    business_name: "",
    documents: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Whether the claimant has acknowledged the accuracy attestation on the
  // review step. Required to submit; gates both the trigger button and
  // ``handleSubmit`` so the form can't be bypassed by, e.g., re-enabling the
  // button via devtools.
  const [hasAttested, setHasAttested] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [shipments, setShipments] = useState<DetailedShipment[]>([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [shipmentsError, setShipmentsError] = useState<string | null>(null);

  const [claimNumber, setClaimNumber] = useState<string>("");

  useEffect(() => {
    if (!claimNumber) {
      setClaimNumber(`CLM-${Date.now().toString().slice(-8)}`);
    }
  }, [claimNumber]);

  // Load user profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        
        const profile = await profileService.getProfile();
        
        if (profile) {
          // Update form data with profile information
          setFormData(prev => ({
            ...prev,
            contactName: profile.first_name && profile.last_name 
              ? `${profile.first_name} ${profile.last_name}` 
              : prev.contactName,
            contactEmail: profile.email || prev.contactEmail,
            contactPhone: profile.phone_number || prev.contactPhone,
            business_name: profile.business_name || prev.business_name
          }));
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setProfileError('Unable to load profile data');
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Load user shipments on component mount
  useEffect(() => {
    const loadShipments = async () => {
      try {
        setShipmentsLoading(true);
        setShipmentsError(null);
        
        // The claims form needs the user's full shipment history so the
        // dropdown can show every claim-eligible package. The backend caps
        // ``per_page`` at 100, so page through ``getShipmentsPaginated`` and
        // collect everything client-side. A bounded loop keeps us safe even
        // if the response metadata is somehow inconsistent.
        const PAGE_SIZE = 100;
        const MAX_PAGES = 50; // 5,000 shipments – more than enough for the UI
        const collected: DetailedShipment[] = [];
        for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum += 1) {
          const response = await shippingService.getShipmentsPaginated({
            page: pageNum,
            per_page: PAGE_SIZE,
          });
          collected.push(...response.shipments);
          if (pageNum >= response.total_pages) {
            break;
          }
        }

        // Filter to only show shipments with tracking codes and exclude CANCELLED and DRAFT statuses
        const validShipments = collected.filter(
          shipment =>
            shipment.tracking_code &&
            shipment.tracking_code.trim() !== '' &&
            shipment.status !== 'CANCELLED' &&
            shipment.status !== 'DRAFT'
        );

        setShipments(validShipments);
      } catch (error) {
        console.error('Failed to load shipments:', error);
        setShipmentsError('Unable to load shipments. You can still enter a tracking number manually.');
        setShipments([]);
      } finally {
        setShipmentsLoading(false);
      }
    };

    loadShipments();
  }, []);

  // Handle form data updates
  const handleInputChange = (field: keyof ClaimFormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  // Handle file uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < stepperSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      updateStepperStatus(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      updateStepperStatus(currentStep - 1);
    }
  };

  // Update stepper status
  const updateStepperStatus = (activeStep: number) => {
    stepperSteps.forEach((step, index) => {
      if (index < activeStep) {
        step.status = "completed";
      } else if (index === activeStep) {
        step.status = "current";
      } else {
        step.status = "upcoming";
      }
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null); // Clear any previous errors

    try {
      // The Submit button is normally disabled until the attestation is
      // checked, but guard here too in case the button is re-enabled via
      // devtools or the handler is invoked programmatically in the future.
      if (!hasAttested) {
        throw new Error('Please confirm that the information provided is accurate before submitting.');
      }

      // Validate description length
      if (!formData.description || formData.description.trim().length < 10) {
        throw new Error('Description must be at least 10 characters long');
      }

      // Validate shipment number
      if (!formData.shipmentNumber || formData.shipmentNumber.trim().length === 0) {
        throw new Error('Shipment number is required');
      }

      // Validate claim type
      if (!formData.claimType) {
        throw new Error('Please select a claim type');
      }

      // Find shipment_id from tracking_code
      const selectedShipment = shipments.find(
        s => s.tracking_code === formData.shipmentNumber
      );
      
      if (!selectedShipment) {
        throw new Error('Selected shipment not found. Please select a valid shipment.');
      }

      // Map form data to API request format
      const claimRequest: CreateClaimRequest = {
        description: formData.description.trim(),
        reason: formData.claimType as 'damaged' | 'lost' | 'late_delivery' | 'wrong_address' | 'missing_items' | 'other',
        shipment_id: selectedShipment.id
      };

      // Submit the claim to the API
      const response = await claimsService.createClaim(claimRequest);
      
      console.log('Claim submitted successfully:', response);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Failed to submit claim:', error);
      setSubmitError(error.message || 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle claims history modal open/close (commented out as not currently used)
  // const handleClaimsHistoryOpen = () => {
  //   setIsClaimsHistoryOpen(true);
  // };

  // const handleClaimsHistoryClose = () => {
  //   setIsClaimsHistoryOpen(false);
  // };

  // Get status configuration for claims (commented out as not currently used)
  // const getClaimStatusConfig = (status: string) => {
  //   return claimStatusConfig[status as keyof typeof claimStatusConfig] || claimStatusConfig.pending_review;
  // };

  // Get claim type configuration (commented out as not currently used)
  // const getClaimTypeConfig = (type: string) => {
  //   return claimTypeConfig[type as keyof typeof claimTypeConfig] || claimTypeConfig.damage;
  // };

  // Calculate processing time for claims (commented out as not currently used)
  // const getClaimProcessingTime = (submittedDate: string, resolvedDate: string | null) => {
  //   if (!resolvedDate) return "In Progress";
  //   
  //   const submitted = new Date(submittedDate);
  //   const resolved = new Date(resolvedDate);
  //   const diffTime = Math.abs(resolved.getTime() - submitted.getTime());
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   
  //   return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  // };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="parcego-claims-shipment-number">Shipment Number *</Label>
                {shipmentsLoading ? (
                  <div className="mt-2">
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Loading shipments..." />
                      </SelectTrigger>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Loading your shipments...</p>
                  </div>
                ) : shipmentsError ? (
                  <div className="mt-2 space-y-2">
                    <Input
                      id="parcego-claims-shipment-number"
                      placeholder="Enter your shipment tracking number"
                      value={formData.shipmentNumber}
                      onChange={(e) => handleInputChange("shipmentNumber", e.target.value)}
                      className={`${
                        formData.shipmentNumber.length === 0 && submitError?.includes('Shipment number')
                          ? 'border-red-300 focus:border-red-500' 
                          : ''
                      }`}
                    />
                    <p className="text-xs text-amber-600">{shipmentsError}</p>
                  </div>
                ) : shipments.length > 0 ? (
                  <Select
                    value={formData.shipmentNumber}
                    onValueChange={(value) => handleInputChange("shipmentNumber", value)}
                  >
                    <SelectTrigger
                      id="parcego-claims-shipment-number"
                      className={`mt-2 ${
                        formData.shipmentNumber.length === 0 && submitError?.includes('Shipment number')
                          ? 'border-red-300 focus:border-red-500' 
                          : ''
                      }`}
                    >
                      <SelectValue placeholder="Select a shipment">
                        {formData.shipmentNumber ? (
                          <span>{formData.shipmentNumber}</span>
                        ) : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {shipments.map((shipment) => (
                        <SelectItem key={shipment.id} value={shipment.tracking_code || ''}>
                          <div className="flex flex-col">
                            <span className="font-medium">{shipment.tracking_code}</span>
                            <span className="text-sm text-gray-500">
                              {shipment.status} • Created {new Date(shipment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2 space-y-2">
                    <Input
                      id="parcego-claims-shipment-number"
                      placeholder="Enter your shipment tracking number"
                      value={formData.shipmentNumber}
                      onChange={(e) => handleInputChange("shipmentNumber", e.target.value)}
                      className={`${
                        formData.shipmentNumber.length === 0 && submitError?.includes('Shipment number')
                          ? 'border-red-300 focus:border-red-500' 
                          : ''
                      }`}
                    />
                    <p className="text-xs text-gray-500">No shipments found. Please enter your tracking number manually.</p>
                  </div>
                )}
                {formData.shipmentNumber.length === 0 && submitError?.includes('Shipment number') && (
                  <p className="text-xs text-red-600 mt-1">Shipment number is required</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="parcego-claims-type">Type of Claim *</Label>
                <Select value={formData.claimType} onValueChange={(value) => handleInputChange("claimType", value)}>
                  <SelectTrigger className={`mt-2 ${
                    !formData.claimType && submitError?.includes('claim type')
                      ? 'border-red-300 focus:border-red-500' 
                      : ''
                  }`}>
                    <SelectValue placeholder="Select claim type">
                      {formData.claimType ? (
                        <span className="py-1">{claimTypes.find(t => t.value === formData.claimType)?.label}</span>
                      ) : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {claimTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.label}</span>
                          <span className="text-sm text-gray-500">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.claimType && submitError?.includes('claim type') && (
                  <p className="text-xs text-red-600 mt-1">Please select a claim type</p>
                )}
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <strong>Insurance Coverage:</strong> Your shipment is covered under our Premium Coverage plan. 
                Maximum coverage: $2,500 with a $25 deductible.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parcego-claims-incident-date">Incident Date *</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="parcego-claims-incident-date"
                      className="w-full justify-start text-left font-normal mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.incidentDate ? new Date(formData.incidentDate).toLocaleDateString() : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.incidentDate ? new Date(formData.incidentDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          handleInputChange("incidentDate", date.toISOString().split('T')[0]);
                          setCalendarOpen(false); // Automatically close the popover
                        }
                      }}
                      weekStartsOn={0}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="parcego-claims-location">Incident Location</Label>
                <Input
                  id="parcego-claims-location"
                  placeholder="City, State or Country"
                  value={formData.incidentLocation}
                  onChange={(e) => handleInputChange("incidentLocation", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="parcego-claims-description">Detailed Description *</Label>
              <Textarea
                id="parcego-claims-description"
                placeholder="Please provide a detailed description of what happened, including any relevant circumstances... (minimum 10 characters)"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={`mt-2 min-h-[120px] ${
                  formData.description.length > 0 && formData.description.length < 10 
                    ? 'border-red-300 focus:border-red-500' 
                    : ''
                }`}
              />
              <p className={`text-xs mt-1 ${
                formData.description.length > 0 && formData.description.length < 10 
                  ? 'text-red-600' 
                  : 'text-gray-500'
              }`}>
                {formData.description.length}/10 characters minimum
                {formData.description.length > 0 && formData.description.length < 10 && (
                  <span className="ml-2 font-medium">(Minimum 10 characters required)</span>
                )}
              </p>
            </div>

            <div>
              <Label htmlFor="parcego-claims-value">Estimated Value of Items *</Label>
              <Input
                id="parcego-claims-value"
                type="number"
                placeholder="0.00"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange("estimatedValue", e.target.value)}
                className="mt-2"
              />
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <strong>Value Declaration:</strong> Please provide an accurate estimate of the item&apos;s value. 
                This helps us process your claim efficiently and determine appropriate coverage.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="parcego-claims-documents">Upload Supporting Documents *</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="mt-4">
                  <label htmlFor="parcego-claims-file-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>
                    <span className="text-sm text-gray-500"> or drag and drop</span>
                  </label>
                  <input
                    id="parcego-claims-file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, JPG, PNG, DOC up to 10MB each
                </p>
              </div>
            </div>

            {formData.documents.length > 0 && (
              <div className="space-y-3">
                <Label>Uploaded Documents</Label>
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                <strong>Required Documents:</strong> Proof of value (receipt, invoice, appraisal), 
                photos of damage (if applicable), and any other supporting evidence.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {profileError && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  <strong>Profile Loading Error:</strong> {profileError}. You can still fill out the form manually.
                </AlertDescription>
              </Alert>
            )}
            
            {profileLoading && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  <strong>Loading Profile:</strong> Automatically filling contact information from your profile...
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parcego-claims-contact-name">Contact Name *</Label>
                <Input
                  id="parcego-claims-contact-name"
                  placeholder={profileLoading ? "Loading..." : "Full name"}
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                  className="mt-2"
                  disabled={profileLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="parcego-claims-business-name">Business Name</Label>
                <Input
                  id="parcego-claims-business-name"
                  placeholder={profileLoading ? "Loading..." : "Your business name"}
                  value={formData.business_name}
                  onChange={(e) => handleInputChange("business_name", e.target.value)}
                  className="mt-2"
                  disabled={profileLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parcego-claims-phone">Phone Number *</Label>
                <Input
                  id="parcego-claims-phone"
                  type="tel"
                  placeholder={profileLoading ? "Loading..." : "+1 (555) 123-4567"}
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  className="mt-2"
                  disabled={profileLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="parcego-claims-email">Email Address *</Label>
                <Input
                  id="parcego-claims-email"
                  type="email"
                  placeholder={profileLoading ? "Loading..." : "your@email.com"}
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  className="mt-2"
                  disabled={profileLoading}
                />
              </div>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                <strong>Contact Information:</strong> We&apos;ll use this information to keep you updated 
                on your claim status and request additional information if needed.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4">Claim Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Shipment Number:</strong> {formData.shipmentNumber}</p>
                  <p><strong>Claim Type:</strong> {claimTypes.find(t => t.value === formData.claimType)?.label}</p>
                  <p><strong>Incident Date:</strong> {formData.incidentDate}</p>
                  <p><strong>Estimated Value:</strong> ${formData.estimatedValue}</p>
                </div>
                <div>
                  <p><strong>Contact:</strong> {formData.contactName}</p>
                  <p><strong>Business:</strong> {formData.business_name}</p>
                  <p><strong>Phone:</strong> {formData.contactPhone}</p>
                  <p><strong>Email:</strong> {formData.contactEmail}</p>
                </div>
              </div>
              <div className="mt-4">
                <p><strong>Documents:</strong> {formData.documents.length} file(s) uploaded</p>
                <p><strong>Description:</strong> {formData.description}</p>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <strong>Processing Time:</strong> Most claims are processed within 5-7 business days. 
                You&apos;ll receive email updates throughout the process.
              </AlertDescription>
            </Alert>

            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                id="parcego-claims-agreement"
                className="rounded mt-0.5"
                checked={hasAttested}
                onChange={(e) => setHasAttested(e.target.checked)}
                required
                aria-required="true"
              />
              <label htmlFor="parcego-claims-agreement" className="cursor-pointer">
                I confirm that all information provided is accurate and complete to the best of my knowledge
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render insurance coverage cards
  const renderInsuranceCoverage = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {Object.entries(insuranceCoverage).map(([key, coverage]) => (
        <Card key={key} className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {coverage.name}
            </CardTitle>
            <CardDescription>{coverage.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Coverage Includes:</p>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  {coverage.coverage.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Deductible</p>
                  <p className="font-medium">{coverage.deductible}</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Coverage</p>
                  <p className="font-medium">{coverage.maxCoverage}</p>
                </div>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="w-full">
                  Premium: {coverage.premium}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl text-green-800">Claim Submitted Successfully!</CardTitle>
            <CardDescription className="text-green-700">
              Your claim has been received and is now under review
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600">Claim Reference Number</p>
              <p className="text-lg font-mono font-bold text-green-800">{claimNumber}</p>
            </div>
            <p className="text-green-700">
              We&apos;ll review your claim within 5-7 business days and contact you with updates. 
              You can track your claim status in the notifications section.
            </p>
            <Button onClick={() => window.location.href = '/dashboard'} className="bg-green-600 hover:bg-green-700">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              File an Insurance Claim
            </h1>
            <p className="mt-2 text-base text-gray-600 max-w-3xl">
              Ready to claim an insured shipment? We&apos;ve got your back.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => router.push('/claims/history')}
              id="parcego-claims-view-history-btn"
            >
              View Claims History
            </Button>
          </div>
        </div>
      </div>

      {/* Insurance Coverage Information - Hidden */}
      {/* <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Insurance Coverage Options</h2>
        {renderInsuranceCoverage()}
      </div> */}

      {/* Claims Form */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Form</CardTitle>
          <CardDescription>
            Complete all steps to submit your claim. Required fields are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stepper */}
          <div className="mb-8">
            <Stepper steps={stepperSteps} />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <span>Previous</span>
            </Button>

            <div className="flex space-x-3">
              {currentStep === stepperSteps.length - 1 ? (
                <div className="flex flex-col items-end gap-1">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={isSubmitting || !hasAttested}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Claim"}
                      </Button>
                    </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Submit Your Claim</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit this claim? Please review all information 
                        carefully as changes cannot be made after submission.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {/* Error Display */}
                    {submitError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                          {submitError}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting || !hasAttested}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Claim"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {!hasAttested && (
                  <p className="text-xs text-gray-500">
                    Confirm the accuracy attestation above to submit.
                  </p>
                )}
              </div>
              ) : (
                <Button 
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">What You Need:</h4>
              <ul className="space-y-2 text-sm">
                <li>Shipment tracking number</li>
                <li>Proof of value (receipt, invoice, appraisal)</li>
                <li>Supporting documentation and photos</li>
              </ul>
            </div>
            <div className="space-y-3">
             
         
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, FileText, Upload, AlertTriangle, CheckCircle, Clock, DollarSign, Package, MapPin, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Eye, Download, ExternalLink } from "lucide-react";

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
  businessName: string;
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

// Claim types
const claimTypes = [
  { value: "loss", label: "Loss", description: "Package lost during transit" },
  { value: "damage", label: "Damage", description: "Package damaged during shipping" },
  { value: "theft", label: "Theft", description: "Package stolen during delivery" },
  { value: "delay", label: "Delay", description: "Significant delivery delay" },
  { value: "weather", label: "Weather Damage", description: "Damage due to weather conditions" },
  { value: "handling", label: "Handling Damage", description: "Damage due to improper handling" }
];

// Stepper steps
const stepperSteps: StepperStep[] = [
  { id: "shipment", title: "Shipment Details", status: "current" },
  { id: "incident", title: "Incident Information", status: "upcoming" },
  { id: "documents", title: "Documents & Proof", status: "upcoming" },
  { id: "contact", title: "Contact Information", status: "upcoming" },
  { id: "review", title: "Review & Submit", status: "upcoming" }
];

// Mock claims data for the modal
const mockClaimsHistory = [
  {
    id: "CLM-001",
    shipmentNumber: "ASH-20250101-ABC123",
    claimType: "Damage",
    status: "approved",
    submittedDate: "2025-01-10",
    resolvedDate: "2025-01-15",
    amount: "$150.00",
    description: "Package damaged during transit - corner crushed",
    payoutAmount: "$150.00",
    documents: ["receipt.pdf", "damage_photos.zip"]
  },
  {
    id: "CLM-002",
    shipmentNumber: "ASH-20250102-DEF456",
    claimType: "Loss",
    status: "under_investigation",
    submittedDate: "2025-01-12",
    resolvedDate: null,
    amount: "$75.00",
    description: "Package lost during delivery - never received",
    payoutAmount: "Pending",
    documents: ["invoice.pdf", "proof_of_value.pdf"]
  },
  {
    id: "CLM-003",
    shipmentNumber: "ASH-20250103-GHI789",
    claimType: "Delay",
    status: "pending_review",
    submittedDate: "2025-01-14",
    resolvedDate: null,
    amount: "$25.00",
    description: "Significant delivery delay - 5 days late",
    payoutAmount: "Pending",
    documents: ["delivery_confirmation.pdf"]
  },
  {
    id: "CLM-004",
    shipmentNumber: "ASH-20250104-JKL012",
    claimType: "Theft",
    status: "rejected",
    submittedDate: "2025-01-08",
    resolvedDate: "2025-01-13",
    amount: "$200.00",
    description: "Package stolen from doorstep - insufficient evidence",
    payoutAmount: "$0.00",
    documents: ["police_report.pdf", "security_footage.zip"]
  },
  {
    id: "CLM-005",
    shipmentNumber: "ASH-20250105-MNO345",
    claimType: "Damage",
    status: "approved",
    submittedDate: "2025-01-06",
    resolvedDate: "2025-01-11",
    amount: "$300.00",
    description: "Package contents damaged due to improper handling",
    payoutAmount: "$300.00",
    documents: ["damage_assessment.pdf", "repair_quotes.pdf"]
  }
];

// Status configuration for claims
const claimStatusConfig = {
  approved: { label: "Approved", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
  pending_review: { label: "Pending Review", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  under_investigation: { label: "Under Investigation", color: "bg-blue-50 text-blue-700 border-blue-200", icon: AlertTriangle },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle }
};

// Claim type configuration
const claimTypeConfig = {
  damage: { label: "Damage", color: "bg-orange-50 text-orange-700" },
  loss: { label: "Loss", color: "bg-red-50 text-red-700" },
  delay: { label: "Delay", color: "bg-yellow-50 text-yellow-700" },
  theft: { label: "Theft", color: "bg-purple-50 text-purple-700" },
  handling: { label: "Handling", color: "bg-yellow-50 text-yellow-700" }
};

export default function ClaimsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
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
    businessName: "",
    documents: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isClaimsHistoryOpen, setIsClaimsHistoryOpen] = useState(false);
  const [claimNumber, setClaimNumber] = useState<string>("");

  useEffect(() => {
    if (!claimNumber) {
      setClaimNumber(`CLM-${Date.now().toString().slice(-8)}`);
    }
  }, [claimNumber]);

  // Handle form data updates
  const handleInputChange = (field: keyof ClaimFormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  // Handle claims history modal open/close
  const handleClaimsHistoryOpen = () => {
    setIsClaimsHistoryOpen(true);
  };

  const handleClaimsHistoryClose = () => {
    setIsClaimsHistoryOpen(false);
  };

  // Get status configuration for claims
  const getClaimStatusConfig = (status: string) => {
    return claimStatusConfig[status as keyof typeof claimStatusConfig] || claimStatusConfig.pending_review;
  };

  // Get claim type configuration
  const getClaimTypeConfig = (type: string) => {
    return claimTypeConfig[type as keyof typeof claimTypeConfig] || claimTypeConfig.damage;
  };

  // Calculate processing time for claims
  const getClaimProcessingTime = (submittedDate: string, resolvedDate: string | null) => {
    if (!resolvedDate) return "In Progress";
    
    const submitted = new Date(submittedDate);
    const resolved = new Date(resolvedDate);
    const diffTime = Math.abs(resolved.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="parcego-claims-shipment-number">Shipment Number *</Label>
                <Input
                  id="parcego-claims-shipment-number"
                  placeholder="Enter your shipment tracking number"
                  value={formData.shipmentNumber}
                  onChange={(e) => handleInputChange("shipmentNumber", e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="parcego-claims-type">Type of Claim *</Label>
                <Select value={formData.claimType} onValueChange={(value) => handleInputChange("claimType", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select claim type" />
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
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
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
                <Input
                  id="parcego-claims-incident-date"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => handleInputChange("incidentDate", e.target.value)}
                  className="mt-2"
                />
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
                placeholder="Please provide a detailed description of what happened, including any relevant circumstances..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="mt-2 min-h-[120px]"
              />
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
              <p className="text-sm text-gray-500 mt-1">
                Please provide the actual value of the lost or damaged items
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="parcego-claims-documents">Upload Supporting Documents *</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
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
                      <FileText className="h-5 w-5 text-gray-400" />
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
              <AlertTriangle className="h-4 w-4 text-amber-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parcego-claims-contact-name">Contact Name *</Label>
                <Input
                  id="parcego-claims-contact-name"
                  placeholder="Full name"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="parcego-claims-business-name">Business Name</Label>
                <Input
                  id="parcego-claims-business-name"
                  placeholder="Your business name"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parcego-claims-phone">Phone Number *</Label>
                <Input
                  id="parcego-claims-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="parcego-claims-email">Email Address *</Label>
                <Input
                  id="parcego-claims-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
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
                  <p><strong>Business:</strong> {formData.businessName}</p>
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
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Processing Time:</strong> Most claims are processed within 5-7 business days. 
                                      You&apos;ll receive email updates throughout the process.
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <input type="checkbox" id="parcego-claims-agreement" className="rounded" />
              <label htmlFor="parcego-claims-agreement">
                I confirm that all information provided is accurate and complete to the best of my knowledge
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
            <CardTitle className="text-lg flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>{coverage.name}</span>
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
      <div className="max-w-4xl mx-auto p-6">
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
                          <h1 className="text-2xl font-bold text-gray-900">File an Insurance Claim</h1>
        </div>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ready to make a claim for an insured shipment? We&apos;ve got your back. Before you start, 
            check out our insurance coverage details and claim requirements below. Have your shipment 
            number, proof of value, and supporting documents handy.
          </p>
        <div className="flex justify-center">
          <Dialog open={isClaimsHistoryOpen} onOpenChange={setIsClaimsHistoryOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={handleClaimsHistoryOpen}
                className="flex items-center space-x-2"
                id="parcego-claims-view-history-btn"
              >
                <FileText className="h-4 w-4" />
                <span>View Claims History</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto sm:max-w-7xl lg:max-w-[85vw] xl:max-w-[80vw]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Claims History</span>
                </DialogTitle>
                <DialogDescription>
                  Track the status and progress of all your insurance claims. View supporting documents and payout information.
                </DialogDescription>
              </DialogHeader>
              
              {/* Claims History Table */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {mockClaimsHistory.length} claims
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search claims..."
                      className="w-full sm:w-64"
                      id="parcego-claims-history-search"
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                {/* Responsive Table Container with Horizontal Scroll */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[800px] lg:min-w-[1000px] xl:min-w-[1200px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px] min-w-[120px]">Claim ID</TableHead>
                          <TableHead className="w-[180px] min-w-[180px]">Shipment</TableHead>
                          <TableHead className="w-[100px] min-w-[100px]">Type</TableHead>
                          <TableHead className="w-[140px] min-w-[140px]">Status</TableHead>
                          <TableHead className="w-[100px] min-w-[100px]">Amount</TableHead>
                          <TableHead className="w-[100px] min-w-[100px]">Payout</TableHead>
                          <TableHead className="w-[120px] min-w-[120px]">Submitted</TableHead>
                          <TableHead className="w-[120px] min-w-[120px]">Processing</TableHead>
                          <TableHead className="w-[140px] min-w-[140px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockClaimsHistory.map((claim) => {
                          const statusConfig = getClaimStatusConfig(claim.status);
                          const typeConfig = getClaimTypeConfig(claim.claimType);
                          const StatusIcon = statusConfig.icon;
                          
                          return (
                            <TableRow key={claim.id} className="hover:bg-gray-50">
                              <TableCell className="font-mono font-medium whitespace-nowrap">{claim.id}</TableCell>
                              <TableCell className="font-mono whitespace-nowrap">{claim.shipmentNumber}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge className={typeConfig.color}>
                                  {typeConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge className={`${statusConfig.color} border`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium whitespace-nowrap">{claim.amount}</TableCell>
                              <TableCell className="font-medium whitespace-nowrap">
                                <span className={claim.payoutAmount === "Pending" ? "text-yellow-600" : 
                                                 claim.payoutAmount === "$0.00" ? "text-red-600" : "text-green-600"}>
                                  {claim.payoutAmount}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{new Date(claim.submittedDate).toLocaleDateString()}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {getClaimProcessingTime(claim.submittedDate, claim.resolvedDate)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    title="View Details"
                                    id={`parcego-claims-history-view-${claim.id}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    title="Download Documents"
                                    id={`parcego-claims-history-download-${claim.id}`}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Summary Statistics - Responsive Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4">
                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-xl md:text-3xl font-bold text-green-600">
                            ${mockClaimsHistory.filter(c => c.status === 'approved').reduce((sum, c) => 
                              sum + parseFloat(c.payoutAmount.replace('$', '')), 0
                            ).toFixed(2)}
                          </div>
                          <div className="text-sm md:text-base font-normal text-gray-600">Total Approved Payouts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xl md:text-3xl font-bold text-blue-600">
                            {mockClaimsHistory.filter(c => c.status === 'pending_review' || c.status === 'under_investigation').length}
                          </div>
                          <div className="text-sm md:text-base font-normal text-gray-600">Claims In Progress</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-xl md:text-3xl font-bold text-green-600">
                            {mockClaimsHistory.filter(c => c.status === 'approved').length}
                          </div>
                          <div className="text-sm md:text-base font-normal text-gray-600">Claims Approved</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 rounded-lg p-2 flex-shrink-0">
                          <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <div className="text-xl md:text-3xl font-bold text-red-600">
                            {mockClaimsHistory.filter(c => c.status === 'rejected').length}
                          </div>
                          <div className="text-sm md:text-base font-normal text-gray-600">Claims Rejected</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons - Responsive Layout */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/claims/history')}
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Full History</span>
                  </Button>
                  <Button
                    onClick={handleClaimsHistoryClose}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Insurance Coverage Information */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Insurance Coverage Options</h2>
        {renderInsuranceCoverage()}
      </div>

      {/* Claims Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Claim Form</span>
          </CardTitle>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={isSubmitting}
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
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                        Submit Claim
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
          <CardTitle className="text-blue-900 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Important Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">What You Need:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <Package className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Shipment tracking number</span>
                </li>
                <li className="flex items-start space-x-2">
                  <DollarSign className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Proof of value (receipt, invoice, appraisal)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Supporting documentation and photos</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Process Timeline:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Initial review: 1-2 business days</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Investigation: 3-5 business days</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Final decision: 5-7 business days</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

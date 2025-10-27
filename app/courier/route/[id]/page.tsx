"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { authService, driverService, routeOptimizationService } from "@/lib/api";
import type { DriverAssignment, DriverShipment, DriverAssignmentsResponse } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scanner } from "@yudiel/react-qr-scanner";
import { create } from "zustand";
import confetti from 'canvas-confetti';

// Navigation state store for active tab management
interface NavigationState {
  activeTab: 'home' | 'deliveries' | 'performance' | 'profile';
  setActiveTab: (tab: 'home' | 'deliveries' | 'performance' | 'profile') => void;
}

const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'deliveries', // Default to deliveries for route simulation
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

// SVG Icon Components for Navigation Apps
const GoogleMapsIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
  >
    <path
      d="M20 2h-.5L0 21.5v.5c0 1.103.897 2 2 2h.66L22 4.404V4c0-1.103-.897-2-2-2z"
      fill="#FDDC49"
    />
    <path
      d="M2 2C.897 2 0 2.897 0 4v17.5L19.5 2z"
      fill="#56A959"
    />
    <path
      d="M2.66 24H19.5l-8.475-8.475z"
      fill="#5796FF"
    />
    <path
      d="M13.508 13.008 22 21.5V4.404z"
      fill="#CCCCCC"
    />
    <path
      d="M11.025 15.525 19.5 24h.5c1.103 0 2-.897 2-2v-.5l-8.492-8.492z"
      fill="#F2F2F2"
    />
    <path
      d="M18 0c-3.309 0-6 2.691-6 6 0 .234.016.463.042.682.208 2.132 1.348 3.888 2.556 5.747 1.187 1.828 2.414 3.717 2.912 6.17a.5.5 0 0 0 .98 0c.498-2.453 1.725-4.342 2.912-6.17 1.208-1.859 2.348-3.615 2.556-5.74.026-.226.042-.455.042-.689 0-3.309-2.691-6-6-6z"
      fill="#E53935"
    />
    <circle cx="18" cy="6" r="2" fill="#B71C1C" />
  </svg>
);

const WazeIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
  >
    <path
      d="M91.064 202.468c0 1.714-.034 3.371-.103 4.974-1.389 32.583-16.799 42.855-42.22 54.406-12.902 5.862-15.564 21.975-9.969 31.666 23.108 37.298 56.813 65.665 95.531 84.435 9.069-12.682 23.918-20.947 40.698-20.947 26.418 0 48.051 20.488 49.872 46.442 20.758 2.126 41.736 1.91 62.311-.725a257.515 257.515 0 0 0 27.969-5.152c21.592-5.235 41.685-13.007 59.843-23.067 61.653-34.159 101.005-94.714 101.005-172.031C476.001 96.175 389.826 10 283.533 10c-60.804 0-115.025 28.199-150.297 72.232a192.256 192.256 0 0 0-28.953 50.002c-8.534 21.759-13.219 45.45-13.219 70.234z"
      fill="#66E0F7"
    />
    <path
      d="M175.001 357.002c-16.78 0-31.629 8.266-40.698 20.947a49.77 49.77 0 0 0-9.302 29.053c0 27.614 22.386 50 50 50s50-22.386 50-50c0-1.196-.042-2.383-.125-3.558-1.824-25.954-23.457-46.442-49.875-46.442zM287.001 407.002c0 27.614 22.386 50 50 50s50-22.386 50-50a50.002 50.002 0 0 0-12.005-32.502c-18.159 10.061-38.251 17.832-59.843 23.067a258.03 258.03 0 0 1-27.968 5.154 49.723 49.723 0 0 0-.184 4.281z"
      fill="#8690AF"
    />
    <circle cx="256" cy="207" r="12" fill="#000000" />
    <circle cx="386" cy="207" r="12" fill="#000000" />
  </svg>
);

const AppleMapsIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
  >
    <path
      d="M407 512H105C47.103 512 0 464.897 0 407V105C0 47.103 47.103 0 105 0h302c57.897 0 105 47.103 105 105v302c0 57.897-47.103 105-105 105z"
      fill="#F2F2F2"
    />
    <path
      d="M407 0H256v512h151c57.897 0 105-47.103 105-105V105C512 47.103 464.897 0 407 0z"
      fill="#E5E5E5"
    />
    <path
      d="M407 0H130v148l356.429 327.6C502.354 457.186 512 433.199 512 407V105C512 47.103 464.897 0 407 0z"
      fill="#87E694"
    />
    <path
      d="M407 0H256v263.809L486.429 475.6C502.354 457.186 512 433.199 512 407V105C512 47.103 464.897 0 407 0z"
      fill="#66CC70"
    />
    <path
      d="M347 472c-68.925 0-125-56.075-125-125 0-25.508 7.648-50.058 22.118-70.998l12.504-18.096 21.729 3.417A55.61 55.61 0 0 0 287 262a54.885 54.885 0 0 0 36.656-14.002L347 227.101l23.344 20.896A54.881 54.881 0 0 0 407 262c2.89 0 5.8-.227 8.649-.675l21.729-3.418 12.504 18.096C464.352 296.942 472 321.492 472 347c0 68.925-56.075 125-125 125z"
      fill="#FFFFFF"
    />
    <path
      d="M135 391c-41.355 0-75-33.645-75-75s33.645-75 75-75 75 33.645 75 75-33.645 75-75 75z"
      fill="#00C3FF"
    />
    <path
      d="m105 346 30-71 30 71-30-10z"
      fill="#FFFFFF"
    />
  </svg>
);

// API Data will replace mock data
// Real delivery data will be fetched from driverService.getTodaysAssignments()

type DeliveryStatus = "assigned" | "route_started" | "arrived" | "scanned" | "photo_taken" | "delivered" | "failed";

interface RouteStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "current" | "completed" | "failed";
  required: boolean;
}

export default function CourierRouteSimulation() {
  const router = useRouter();
  const params = useParams();
  const deliveryId = params.id as string;
  
  // Navigation state management
  const { activeTab, setActiveTab } = useNavigationStore();
  
  // API Data States
  const [assignments, setAssignments] = useState<DriverAssignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<DriverAssignment | null>(null);
  const [nextAssignment, setNextAssignment] = useState<DriverAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [optimizedRouteUrl, setOptimizedRouteUrl] = useState<string | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  
  // Route simulation state - Load from localStorage if available
  const [routeStatus, setRouteStatus] = useState<DeliveryStatus>(() => {
    if (typeof window !== 'undefined') {
      const savedStatus = localStorage.getItem(`parcego_route_status_${deliveryId}`);
      return (savedStatus as DeliveryStatus) || "assigned";
    }
    return "assigned";
  });
  const [currentLocation, setCurrentLocation] = useState({ lat: 43.6426, lng: -79.3871 }); // Will be replaced with real GPS
  
  // Modal states
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [problemNote, setProblemNote] = useState("");
  const [undeliveredReason, setUndeliveredReason] = useState<'customer_not_available' | 'incorrect_address' | 'access_denied' | 'customer_refused' | 'damaged_package' | 'other'>('other');
  
  // Auto-close timeout reference for cleanup
  const [successModalTimeout, setSuccessModalTimeout] = useState<number | null>(null);

  // Fetch assignments data from API
  useEffect(() => {
    const fetchAssignmentsData = async () => {
      console.log('🔍 [ROUTE] Starting assignments data fetch...');
      
      try {
        // Check authentication
        const authenticated = localStorage.getItem("courier_authenticated");
        const authToken = localStorage.getItem("auth_token");
        const loginTime = localStorage.getItem("courier_login_time");

        if (authenticated !== "true" || !authToken || !loginTime) {
          console.log('❌ [ROUTE] No authentication found, redirecting to login');
          router.push("/courier-login");
          return;
        }

        // Check token expiry
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const timeSinceLogin = Date.now() - parseInt(loginTime);
        if (timeSinceLogin >= twentyFourHours) {
          console.log('❌ [ROUTE] Token expired, redirecting to login');
          localStorage.clear();
          router.push("/courier-login");
          return;
        }

        console.log('✅ [ROUTE] Authentication valid, fetching user data and assignments...');

        // Fetch current user data
        const userResponse = await authService.getCurrentUser();
        setCurrentUser(userResponse.data);
        console.log('✅ [ROUTE] User data received:', userResponse.data);

        // Fetch today's assignments
        const assignmentsResponse = await driverService.getTodaysAssignments();
        console.log('✅ [ROUTE] Assignments data received:', assignmentsResponse);
        
        setAssignments(assignmentsResponse.assignments);

        // Find current assignment by deliveryId
        // Handle PCG-DEL-{id} format by extracting the numeric ID
        const numericId = deliveryId.startsWith('PCG-DEL-') 
          ? deliveryId.replace('PCG-DEL-', '') 
          : deliveryId;
        
        console.log('🔍 [ROUTE] Searching for assignment:', {
          deliveryId,
          numericId,
          availableAssignments: assignmentsResponse.assignments.map(a => ({
            id: a.id,
            shipment_id: a.shipment_id,
            tracking_code: a.tracking_code,
            status: a.status
          }))
        });
        
        const current = assignmentsResponse.assignments.find(
          assignment => assignment.id.toString() === numericId || 
          assignment.tracking_code === deliveryId ||
          assignment.tracking_code === numericId
        );
        
        if (current) {
          // Validate that the assignment has a valid shipment_id
          if (!current.shipment_id || current.shipment_id <= 0) {
            console.error('❌ [ROUTE] Assignment found but missing shipment_id:', current);
            setError(`Assignment found but missing shipment ID. Please contact support.`);
            return;
          }
          
          setCurrentAssignment(current);
          console.log('✅ [ROUTE] Current assignment found:', {
            id: current.id,
            shipment_id: current.shipment_id,
            tracking_code: current.tracking_code,
            status: current.status
          });
          
          // Find next assignment
          const currentIndex = assignmentsResponse.assignments.findIndex(a => a.id === current.id);
          const next = assignmentsResponse.assignments[currentIndex + 1] || null;
          setNextAssignment(next);
          
          if (next) {
            console.log('✅ [ROUTE] Next assignment found:', next);
          } else {
            console.log('ℹ️ [ROUTE] No next assignment - this is the last delivery');
          }
        } else {
          console.error('❌ [ROUTE] Assignment not found for deliveryId:', deliveryId);
          setError(`Assignment not found for ID: ${deliveryId}`);
        }

        setIsLoading(false);
        console.log('✅ [ROUTE] Route page loaded successfully');

      } catch (error: any) {
        console.error('❌ [ROUTE] Error fetching assignments data:', error);
        
        if (error.message?.includes('Authentication') || error.response?.status === 401) {
          console.log('❌ [ROUTE] Authentication error, redirecting to login');
          localStorage.clear();
          router.push("/courier-login");
        } else {
          setError("Failed to load assignments: " + (error.message || "Unknown error"));
          setIsLoading(false);
        }
      }
    };

    fetchAssignmentsData();
  }, [deliveryId, router]);

  // Fetch optimized route when user data is available
  useEffect(() => {
    const fetchOptimizedRoute = async () => {
      if (!currentUser?.id) return;

      try {
        setIsLoadingRoute(true);
        console.log('🔍 [ROUTE] Fetching optimized route for driver:', currentUser.id);
        
        const today = new Date().toISOString().split('T')[0];
        const routeUrl = await routeOptimizationService.getGoogleMapsRoute(currentUser.id, { date: today });
        
        setOptimizedRouteUrl(routeUrl);
        console.log('✅ [ROUTE] Optimized route URL received:', routeUrl);
      } catch (error: any) {
        console.error('❌ [ROUTE] Error fetching optimized route:', error);
        // Don't set error state, just log it - user can still use individual navigation
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchOptimizedRoute();
  }, [currentUser?.id]);

  // Body scroll lock when modals are open with scroll position preservation
  useEffect(() => {
    const isAnyModalOpen = isMapModalOpen || isBarcodeModalOpen || isPhotoModalOpen || isConfirmModalOpen || isSuccessModalOpen;
    
    if (isAnyModalOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Prevent body scroll and maintain position
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`; // Set top to negative scroll position
      
      // Store the scroll position as a data attribute
      document.body.setAttribute('data-scroll-position', scrollY.toString());
    } else {
      // Get saved scroll position
      const scrollY = parseInt(document.body.getAttribute('data-scroll-position') || '0');
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isMapModalOpen, isBarcodeModalOpen, isPhotoModalOpen, isConfirmModalOpen, isSuccessModalOpen]);
  
  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (successModalTimeout) {
        clearTimeout(successModalTimeout);
      }
    };
  }, [successModalTimeout]);
  
  // Enhanced photo capture state
  const [capturedPhotos, setCapturedPhotos] = useState<Array<{
    id: string;
    dataUrl: string;
    uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
  }>>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lowLightDetected, setLowLightDetected] = useState(false);
  const [uploadFromDevice, setUploadFromDevice] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Form states
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeError, setBarcodeError] = useState("");
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [gpsError, setGpsError] = useState("");
  
  // Barcode validation states
  const [isBarcodeValid, setIsBarcodeValid] = useState(false);
  const [barcodeValidationMessage, setBarcodeValidationMessage] = useState("");
  const [scannedBarcodeType, setScannedBarcodeType] = useState<string>("");
  
  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Development testing states
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isTestingSuccess, setIsTestingSuccess] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);

  // Local storage database for barcode validation
  const initializeBarcodeDatabase = () => {
    if (typeof window !== 'undefined') {
      const existingData = localStorage.getItem('parcego_barcode_database');
      if (!existingData) {
        // Initialize with sample valid barcodes for testing
        const sampleBarcodes = [
          { code: 'PCG789123456SCAN', type: 'code_128', valid: true, description: 'Package PCG789123456' },
          { code: 'PCG789123457SCAN', type: 'code_128', valid: true, description: 'Package PCG789123457' },
          { code: 'PCG789123458SCAN', type: 'code_128', valid: true, description: 'Package PCG789123458' },
          { code: 'QR123456789', type: 'qr_code', valid: true, description: 'QR Code Package 123456789' },
          { code: 'QR987654321', type: 'qr_code', valid: true, description: 'QR Code Package 987654321' },
          { code: '1234567890123', type: 'ean_13', valid: true, description: 'EAN-13 Package 1234567890123' },
          { code: '12345678', type: 'ean_8', valid: true, description: 'EAN-8 Package 12345678' },
          { code: '123456789012', type: 'upc_a', valid: true, description: 'UPC-A Package 123456789012' },
          { code: '1234567', type: 'upc_e', valid: true, description: 'UPC-E Package 1234567' },
          { code: 'ABC123', type: 'code_39', valid: true, description: 'Code 39 Package ABC123' },
          { code: 'DEF456', type: 'code_93', valid: true, description: 'Code 93 Package DEF456' },
          { code: '12345-67890', type: 'codabar', valid: true, description: 'Codabar Package 12345-67890' },
          { code: '1234567890', type: 'itf', valid: true, description: 'ITF Package 1234567890' }
        ];
        localStorage.setItem('parcego_barcode_database', JSON.stringify(sampleBarcodes));
      }
    }
  };

  // Validate barcode against local database
  const validateBarcode = (barcode: string, type: string): { valid: boolean; message: string; description?: string } => {
    if (typeof window === 'undefined') {
      return { valid: false, message: 'Validation not available' };
    }
    
    try {
      const database = JSON.parse(localStorage.getItem('parcego_barcode_database') || '[]');
      
      // For manual input, try to find by code only (ignore type)
      if (type === 'manual_input') {
        const foundBarcode = database.find((item: { code: string; valid: boolean }) => 
          item.code === barcode && item.valid === true
        );
        
        if (foundBarcode) {
          return { 
            valid: true, 
            message: 'Barcode verified successfully!', 
            description: foundBarcode.description 
          };
        } else {
          return { 
            valid: false, 
            message: 'Barcode not found in database' 
          };
        }
      }
      
      // For scanned barcodes, match both code and type
      const foundBarcode = database.find((item: { code: string; type: string; valid: boolean }) => 
        item.code === barcode && item.type === type && item.valid === true
      );
      
      if (foundBarcode) {
        return { 
          valid: true, 
          message: 'Barcode verified successfully!', 
          description: foundBarcode.description 
        };
      } else {
        return { 
          valid: false, 
          message: 'Barcode not found in database or invalid format' 
        };
      }
    } catch (error) {
      return { valid: false, message: 'Database error occurred' };
    }
  };

  // Initialize database on component mount
  useEffect(() => {
    initializeBarcodeDatabase();
  }, []);

  // Initialize audio context for shutter sound
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContext) {
      try {
        const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        setAudioContext(context);
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }, [audioContext]);

  // Enable audio on first user interaction
  const enableAudio = async () => {
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
        setAudioEnabled(true);
        console.log('Audio context resumed successfully');
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    } else if (audioContext && audioContext.state === 'running') {
      setAudioEnabled(true);
    }
  };

  // Set active tab to deliveries when component mounts
  useEffect(() => {
    setActiveTab('deliveries');
  }, [setActiveTab]);
  
  
  // Route steps configuration
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([
    {
      id: "start_route",
      title: "Start Route",
      description: "Begin navigation to delivery location",
      status: "pending",
      required: true
    },
    {
      id: "arrive_location",
      title: "Arrive at Location", 
      description: "Confirm arrival at delivery address",
      status: "pending",
      required: true
    },
    {
      id: "scan_barcode",
      title: "Scan Package",
      description: "Scan the package barcode for verification",
      status: "pending", 
      required: true
    },
    {
      id: "take_photo",
      title: "Take Photo",
      description: "Capture proof of delivery photo",
      status: "pending",
      required: true
    },
    {
      id: "confirm_delivery",
      title: "Confirm Delivery",
      description: "Complete the delivery process",
      status: "pending",
      required: true
    }
  ]);

  // Update route steps based on status
  useEffect(() => {
    setRouteSteps(prevSteps => prevSteps.map(step => {
      switch (routeStatus) {
        case "assigned":
          return { ...step, status: step.id === "start_route" ? "current" : "pending" };
        case "route_started":
          return { 
            ...step, 
            status: step.id === "start_route" ? "completed" : 
                   step.id === "arrive_location" ? "current" : "pending" 
          };
        case "arrived":
          return {
            ...step,
            status: step.id === "start_route" ? "completed" :
                   step.id === "arrive_location" ? "completed" :
                   step.id === "scan_barcode" ? "current" : "pending"
          };
        case "scanned":
          return {
            ...step,
            status: step.id === "start_route" ? "completed" :
                   step.id === "arrive_location" ? "completed" :
                   step.id === "scan_barcode" ? "completed" :
                   step.id === "take_photo" ? "current" : "pending"
          };
        case "photo_taken":
          return {
            ...step,
            status: step.id === "confirm_delivery" ? "current" :
                   step.id === "take_photo" ? "completed" :
                   ["start_route", "arrive_location", "scan_barcode"].includes(step.id) ? "completed" : "pending"
          };
        case "delivered":
          return { ...step, status: "completed" };
        case "failed":
          return { ...step, status: step.status === "current" ? "failed" : step.status };
        default:
          return step;
      }
    }));
  }, [routeStatus]);

  // Save route status to localStorage whenever it changes
  useEffect(() => {
    if (routeStatus && deliveryId) {
      localStorage.setItem(`parcego_route_status_${deliveryId}`, routeStatus);
      console.log(`💾 [ROUTE] Saved route status to localStorage: ${routeStatus} for ${deliveryId}`);
    }
  }, [routeStatus, deliveryId]);

  // Cleanup camera and audio context on component unmount
  useEffect(() => {
    return () => {
      if (isCameraActive) {
        handleCameraStop();
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [isCameraActive, audioContext]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading Route...</h2>
            <p className="text-gray-600">
              Fetching your delivery assignments...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Icon name="AlertTriangle" size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error Loading Route</h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <Button onClick={() => router.push('/courier')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect if assignment not found
  if (!currentAssignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Icon name="AlertTriangle" size={48} className="text-orange-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Assignment Not Found</h2>
            <p className="text-gray-600 mb-4">
              The assignment with ID "{deliveryId}" could not be found.
            </p>
            <Button onClick={() => router.push('/courier')} className="w-full">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartRoute = async () => {
    if (!currentAssignment) {
      console.error('❌ [ROUTE] No current assignment available');
      alert('No assignment data available. Please refresh the page.');
      return;
    }
    
    // Validate shipment_id
    if (!currentAssignment.shipment_id || currentAssignment.shipment_id <= 0) {
      console.error('❌ [ROUTE] Invalid shipment_id:', currentAssignment.shipment_id);
      console.error('❌ [ROUTE] Current assignment data:', currentAssignment);
      alert('Invalid shipment data. Please refresh the page and try again.');
      return;
    }
    
    try {
      console.log('🚛 [ROUTE] Starting route for assignment:', {
        assignmentId: currentAssignment.id,
        shipmentId: currentAssignment.shipment_id,
        trackingCode: currentAssignment.tracking_code,
        currentStatus: currentAssignment.status,
        statusData: {
          status: 'IN_TRANSIT',
          notes: 'Driver started route'
        }
      });
      
      // Check current status and determine appropriate transition
      let targetStatus = 'IN_TRANSIT';
      let notes = 'Driver started route';
      
      if (currentAssignment.status === 'IN_WAREHOUSE') {
        targetStatus = 'IN_TRANSIT';
        notes = 'Driver started route';
      } else if (currentAssignment.status === 'IN_TRANSIT') {
        // Already in transit, no need to change status
        console.log('ℹ️ [ROUTE] Shipment already in transit, skipping status update');
        setRouteStatus("route_started");
        setIsMapModalOpen(true);
        console.log('✅ [ROUTE] Route started successfully (already in transit)');
        return;
      } else if (currentAssignment.status === 'DELIVERED') {
        // Already delivered, skip status update and proceed to delivery steps
        console.log('ℹ️ [ROUTE] Shipment already delivered, proceeding to delivery steps');
        setRouteStatus("delivered");
        console.log('✅ [ROUTE] Route started successfully (already delivered)');
        return;
      } else {
        console.warn('⚠️ [ROUTE] Unexpected current status:', currentAssignment.status);
        targetStatus = 'IN_TRANSIT';
      }
      
      await driverService.updateShipmentStatus(currentAssignment.shipment_id, {
        status: targetStatus,
        notes: notes
      });
      
      setRouteStatus("route_started");
      setIsMapModalOpen(true);
      console.log('✅ [ROUTE] Route started successfully');
    } catch (error: any) {
      console.error('❌ [ROUTE] Error starting route:', error);
      console.error('❌ [ROUTE] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to start route: ';
      if (error.message?.includes('Invalid status transition')) {
        errorMessage += error.message;
      } else if (error.message?.includes('Validation error')) {
        errorMessage += 'Invalid shipment data. Please refresh the page.';
      } else if (error.message?.includes('Authentication')) {
        errorMessage += 'Please log in again.';
      } else if (error.message?.includes('not found')) {
        errorMessage += 'Shipment not found. Please refresh the page.';
      } else {
        errorMessage += error.message || 'Unknown error';
      }
      
      alert(errorMessage);
    }
  };

  const handleArriveAtLocation = async () => {
    if (!currentAssignment) return;
    
    try {
      console.log('📍 [ROUTE] Arriving at location for assignment:', currentAssignment.id);
      // No status update to backend here, status remains IN_TRANSIT until Confirm Delivery
      setRouteStatus("arrived");
      setGpsError(""); // Clear any GPS errors
      console.log('✅ [ROUTE] Arrived at location successfully (status remains IN_TRANSIT)');
    } catch (error: any) {
      console.error('❌ [ROUTE] Error updating arrival status:', error);
      alert('Failed to update arrival status: ' + (error.message || 'Unknown error'));
    }
  };

  const handleBarcodeSubmit = async () => {
    if (!barcodeInput || !currentAssignment) {
      setBarcodeError("Please enter a barcode");
      return;
    }

    try {
      console.log('📱 [ROUTE] Scanning barcode:', barcodeInput);
      
      // Search for shipment using the barcode
      const searchResponse = await driverService.searchShipments(barcodeInput);
      
      if (searchResponse.shipments.length === 0) {
        setBarcodeError("No shipment found with this tracking code");
        return;
      }

      // Check if the found shipment matches current assignment
      const foundShipment = searchResponse.shipments.find(
        shipment => shipment.tracking_code === currentAssignment.tracking_code
      );

      if (!foundShipment) {
        setBarcodeError("Barcode does not match this delivery");
        return;
      }

      // Package scanned successfully - no status update needed as it's already DELIVERED
      console.log('✅ [ROUTE] Package scanned successfully');

      setBarcodeError("");
      setRouteStatus("scanned");
      setIsBarcodeModalOpen(false);
      setBarcodeInput("");
      setIsBarcodeValid(false);
      setBarcodeValidationMessage("");
      setScannedBarcodeType("");
      
      console.log('✅ [ROUTE] Barcode scanned successfully');
    } catch (error: any) {
      console.error('❌ [ROUTE] Error scanning barcode:', error);
      setBarcodeError('Failed to scan barcode: ' + (error.message || 'Unknown error'));
    }
  };

  const handlePhotoCapture = async () => {
    if (!currentAssignment) return;
    
    try {
      console.log('📸 [ROUTE] Capturing photo for assignment:', currentAssignment.id);
      
      // Simulate photo capture success (in real implementation, this would capture actual photo)
      const photoSuccess = Math.random() > 0.1; // 90% success rate
      
      if (photoSuccess) {
        setPhotoTaken(true);
        setPhotoError("");
        setRouteStatus("photo_taken");
        setIsPhotoModalOpen(false);
        console.log('✅ [ROUTE] Photo captured successfully');
      } else {
        setPhotoError("Failed to capture photo. Please try again.");
        console.log('❌ [ROUTE] Photo capture failed');
      }
    } catch (error: any) {
      console.error('❌ [ROUTE] Error capturing photo:', error);
      setPhotoError('Failed to capture photo: ' + (error.message || 'Unknown error'));
    }
  };
  
  // Play camera shutter sound using Web Audio API
  const playShutterSound = async () => {
    if (!audioContext) return;
    
    try {
      // Resume audio context if suspended (required for user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create oscillator for shutter sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure shutter sound (short click sound)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Start at 800Hz
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1); // Drop to 400Hz
      
      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1); // Quick decay
      
      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
    } catch (error) {
      console.warn('Failed to play shutter sound:', error);
    }
  };

  // Toggle camera flash/torch
  const toggleFlash = async () => {
    if (!streamRef.current) return;
    
    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (!videoTrack) return;
      
      // Check if torch is supported (using type assertion for experimental API)
      const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      if (!capabilities.torch) {
        console.warn('Torch not supported on this device');
        setCameraError('Flash control not available on this device');
        return;
      }
      
      // Toggle torch
      const newFlashState = !flashEnabled;
      await videoTrack.applyConstraints({
        advanced: [{ torch: newFlashState }] as any
      });
      
      setFlashEnabled(newFlashState);
      
    } catch (error) {
      console.warn('Failed to toggle flash:', error);
      setCameraError('Flash control not available on this device');
    }
  };

  // Enhanced Camera Functions
  const startCamera = async () => {
    try {
      setCameraError("");
      setCameraActive(true);
      
      // Enable audio context on user interaction
      await enableAudio();
      
      // Request camera permissions with torch support
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          torch: false // Initialize with torch off (experimental API)
        } as MediaTrackConstraints
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Play startup sound to confirm audio is working
        setTimeout(() => {
          playShutterSound();
        }, 500);
        
        // Start auto-capture after camera is ready
        setTimeout(() => {
          if (capturedPhotos.length === 0) {
            setIsAutoCapturing(true);
            autoCapturePhotos();
          }
        }, 2000);
      }
    } catch (error: unknown) {
      console.error('Camera error:', error);
      setCameraActive(false);
      
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      
      if (errorName === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please enable camera access in your browser settings.');
      } else if (errorName === 'NotFoundError') {
        setCameraError('No camera found. Please ensure your device has a camera.');
      } else if (errorName === 'NotReadableError') {
        setCameraError('Camera is already in use. Please close other apps using the camera.');
      } else {
        setCameraError('Failed to access camera. Please try again or upload from device.');
      }
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsAutoCapturing(false);
  };
  
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    if (capturedPhotos.length >= 3) return;
    
    setIsCapturing(true);
    setShowFlash(true);
    
    // Play shutter sound
    await playShutterSound();
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Check for low light (simple brightness detection)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const brightness = calculateBrightness(imageData);
      if (brightness < 50) {
        setLowLightDetected(true);
      }
      
      // Convert to base64 with compression
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const newPhoto = {
              id: Date.now().toString(),
              dataUrl,
              uploadStatus: 'pending' as const
            };
            
            setCapturedPhotos(prev => [...prev, newPhoto]);
            
            // Stop auto-capture if we have 3 photos
            if (capturedPhotos.length >= 2) {
              setIsAutoCapturing(false);
              stopCamera();
            }
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', 0.8); // Compress to 80% quality
    }
    
    // Hide flash effect
    setTimeout(() => {
      setShowFlash(false);
      setIsCapturing(false);
    }, 200);
  };
  
  const autoCapturePhotos = () => {
    let captureCount = 0;
    const captureInterval = setInterval(() => {
      if (captureCount >= 3 || !cameraActive) {
        clearInterval(captureInterval);
        setIsAutoCapturing(false);
        return;
      }
      
      capturePhoto();
      captureCount++;
    }, 1500); // Capture every 1.5 seconds
  };
  
  const calculateBrightness = (imageData: ImageData): number => {
    const data = imageData.data;
    let brightness = 0;
    
    // Sample every 100th pixel for performance
    for (let i = 0; i < data.length; i += 400) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      brightness += (r + g + b) / 3;
    }
    
    return brightness / (data.length / 400);
  };
  
  const removePhoto = (photoId: string) => {
    setCapturedPhotos(prev => prev.filter(p => p.id !== photoId));
  };
  
  const retakeAllPhotos = () => {
    setCapturedPhotos([]);
    setPhotoUploaded(false);
    startCamera();
  };
  
  const uploadPhotos = async () => {
    if (!currentAssignment || capturedPhotos.length === 0) return;
    
    setIsUploading(true);
    
    try {
      console.log('📤 [ROUTE] Uploading photos for assignment:', currentAssignment.id);
      
      // Upload each photo using the API
      for (let i = 0; i < capturedPhotos.length; i++) {
        const photo = capturedPhotos[i];
        
        // Update status to uploading
        setCapturedPhotos(prev => prev.map(p => 
          p.id === photo.id ? { ...p, uploadStatus: 'uploading' } : p
        ));
        
        try {
          // Convert data URL to File
          const response = await fetch(photo.dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `delivery_photo_${i + 1}.jpg`, { type: 'image/jpeg' });
          
          // Upload photo using API
          await driverService.uploadDeliveryPhoto(currentAssignment.shipment_id, {
            photo: file,
            notes: `Proof of delivery photo ${i + 1}`
          });
          
          // Update status to completed
          setCapturedPhotos(prev => prev.map(p => 
            p.id === photo.id ? { ...p, uploadStatus: 'completed' } : p
          ));
          
          console.log(`✅ [ROUTE] Photo ${i + 1} uploaded successfully`);
        } catch (error: any) {
          console.error(`❌ [ROUTE] Error uploading photo ${i + 1}:`, error);
          
          // Update status to failed
          setCapturedPhotos(prev => prev.map(p => 
            p.id === photo.id ? { ...p, uploadStatus: 'failed' } : p
          ));
        }
      }
      
      setIsUploading(false);
      setPhotoUploaded(true);
      setRouteStatus("photo_taken");
      
      // Show success toast
      setTimeout(() => {
        alert("Proof of delivery uploaded successfully!");
        setIsPhotoModalOpen(false);
      }, 500);
      
      console.log('✅ [ROUTE] All photos uploaded successfully');
    } catch (error: any) {
      console.error('❌ [ROUTE] Error uploading photos:', error);
      setIsUploading(false);
      alert('Failed to upload photos: ' + (error.message || 'Unknown error'));
    }
  };
  
  const handleClosePhotoModal = () => {
    stopCamera();
    if (!photoUploaded) {
      setCapturedPhotos([]);
    }
    setCameraError("");
    setLowLightDetected(false);
    setFlashEnabled(false);
    setAudioEnabled(false);
    setIsPhotoModalOpen(false);
  };

  // Celebratory confetti animation - 40% reduction with 15% increased intensity
  const triggerCelebrationConfetti = () => {
    // Extended duration for more dynamic celebration (1.8 seconds)
    // This duration is used to calculate the modal auto-close timing
    const duration = 1800;
    const end = Date.now() + duration;

    // Enhanced color palette - 8 vibrant colors for more energy
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#FF8A80', '#80CBC4', '#90CAF9', '#A5D6A7'
    ];

    // 40% reduction in particle counts (60% of original) + 15% intensity boost
    const centerBurstCount = Math.floor(40 * 0.6); // 24 particles (40% reduction)
    const sideBurstCount = Math.floor(20 * 0.6);   // 12 particles (40% reduction)

    // Multi-burst approach for increased intensity and volatility
    const launchConfetti = () => {
      // Primary center burst - more energetic
      confetti({
        particleCount: centerBurstCount,
        spread: 70, // Wider spread for more dramatic effect
        origin: { y: 0.3 }, // Higher origin for better visual impact
        colors: colors,
        gravity: 1.0, // Reduced gravity for more floating effect
        drift: 0.2, // Increased drift for more dynamic movement
        startVelocity: 28, // Higher velocity for more explosive effect
        ticks: 250, // Longer particle lifetime for more visibility
        scalar: 1.1, // Larger particles for more impact
        shapes: ['square', 'circle', 'star'], // More shape variety
        disableForReducedMotion: true // Respect accessibility preferences
      });

      // Dual side bursts for more intensity
      confetti({
        particleCount: sideBurstCount,
        angle: 60,
        spread: 45, // Wider spread
        origin: { x: 0, y: 0.4 },
        colors: colors,
        gravity: 1.0,
        drift: 0.15,
        startVelocity: 22, // Higher velocity
        ticks: 250,
        scalar: 1.0
      });
      
      confetti({
        particleCount: sideBurstCount,
        angle: 120,
        spread: 45, // Wider spread
        origin: { x: 1, y: 0.4 },
        colors: colors,
        gravity: 1.0,
        drift: 0.15,
        startVelocity: 22, // Higher velocity
        ticks: 250,
        scalar: 1.0
      });
    };

    // Launch immediately for instant feedback
    launchConfetti();

    // Enhanced follow-up bursts for more intensity
    setTimeout(() => {
      if (Date.now() < end) {
        // Second wave burst
        confetti({
          particleCount: Math.floor(centerBurstCount * 0.7), // More particles
          spread: 60,
          origin: { y: 0.4 },
          colors: colors,
          gravity: 1.1,
          startVelocity: 20,
          ticks: 200,
          scalar: 0.9
        });
      }
    }, 400); // Slightly delayed follow-up

    // Third wave burst for maximum celebration
    setTimeout(() => {
      if (Date.now() < end) {
        confetti({
          particleCount: Math.floor(centerBurstCount * 0.5),
          spread: 80,
          origin: { y: 0.5 },
          colors: colors,
          gravity: 1.2,
          startVelocity: 18,
          ticks: 180,
          scalar: 0.8
        });
      }
    }, 800); // Final burst
  };

  const handleConfirmDelivery = async () => {
    if (!currentAssignment) return;
    
    try {
      console.log('✅ [ROUTE] Confirming delivery for assignment:', currentAssignment.id);
      
      // Update shipment status to delivered
      await driverService.updateShipmentStatus(currentAssignment.shipment_id, {
        status: 'DELIVERED',
        notes: 'Package successfully delivered'
      });
      
      setRouteStatus("delivered");
      setIsConfirmModalOpen(false);

      // Clear saved route status since delivery is complete
      localStorage.removeItem(`parcego_route_status_${deliveryId}`);
      console.log(`🗑️ [ROUTE] Cleared saved route status for ${deliveryId}`);

      // Update delivery status in persistent storage for main courier page
      try {
        const completedDeliveries = JSON.parse(localStorage.getItem('parcego_completed_deliveries') || '[]');
        if (!completedDeliveries.includes(deliveryId)) {
          completedDeliveries.push(deliveryId);
          localStorage.setItem('parcego_completed_deliveries', JSON.stringify(completedDeliveries));

          // Update remaining deliveries count
          const currentRemaining = parseInt(localStorage.getItem('parcego_remaining_deliveries') || '0');
          if (currentRemaining > 0) {
            localStorage.setItem('parcego_remaining_deliveries', String(currentRemaining - 1));
          }
        }
        console.log('✅ [ROUTE] Delivery status saved to localStorage');
      } catch (storageError) {
        console.error('❌ [ROUTE] Error saving to localStorage:', storageError);
      }

      // Trigger celebratory confetti immediately
      setTimeout(() => {
        triggerCelebrationConfetti();
      }, 200); // Small delay to allow modal to render
      
      // Show success achievement modal with 1.0 second delay
      setTimeout(() => {
        setIsSuccessModalOpen(true);
        
        // Auto-close modal after confetti animation finishes + additional 1.5 seconds
        // Confetti duration: 1.8 seconds + 1.5 seconds additional = 3.3 seconds total
        const timeoutId = setTimeout(() => {
          setIsSuccessModalOpen(false);
          setSuccessModalTimeout(null);
          // Auto-advance to next delivery after modal dismisses
          setTimeout(() => {
            if (nextAssignment) {
              router.push(`/courier/route/PCG-DEL-${nextAssignment.id}`);
            } else {
              router.push('/courier');
            }
          }, 300); // Small delay after modal closes
        }, 3300); // 1.8s confetti + 1.5s additional display time
        
        setSuccessModalTimeout(timeoutId as any);
      }, 1000); // 1.0 second delay for better UX flow
      
      console.log('✅ [ROUTE] Delivery confirmed successfully');
    } catch (error: any) {
      console.error('❌ [ROUTE] Error confirming delivery:', error);
      alert('Failed to confirm delivery: ' + (error.message || 'Unknown error'));
    }
  };

  const handleReportProblem = async () => {
    if (!currentAssignment) return;
    
    // Validate reason selection
    if (!undeliveredReason) {
      alert('Please select a reason for the delivery problem.');
      return;
    }
    
    // Validate additional notes if "other" is selected
    if (undeliveredReason === 'other' && !problemNote.trim()) {
      alert('Please provide additional details for "Other" reason.');
      return;
    }
    
    try {
      console.log('⚠️ [ROUTE] Reporting delivery problem for assignment:', currentAssignment.id);
      
      // Update shipment status to undelivered
      await driverService.updateShipmentStatus(currentAssignment.shipment_id, {
        status: 'UNDELIVERED',
        undelivered_reason: undeliveredReason,
        notes: problemNote.trim() || undefined
      });
      
      setRouteStatus("failed");
      setIsProblemModalOpen(false);
      setProblemNote("");
      setUndeliveredReason('other');

      // Clear localStorage for this route
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`parcego_route_status_${currentAssignment.id}`);
        localStorage.removeItem(`parcego_assignment_${currentAssignment.id}`);
      }

      console.log('✅ [ROUTE] Problem reported successfully');
      
      // Show alert and redirect back to dashboard
      alert('Delivery problem reported. You will be redirected to the dashboard.');
      
      // Redirect to courier dashboard with force refresh
      router.push('/courier');
      router.refresh();
      
    } catch (error: any) {
      console.error('❌ [ROUTE] Error reporting problem:', error);
      alert('Failed to report problem: ' + (error.message || 'Unknown error'));
    }
  };

  // Manual close handler for success modal
  const handleSuccessModalClose = () => {
    if (successModalTimeout) {
      clearTimeout(successModalTimeout);
      setSuccessModalTimeout(null);
    }
    setIsSuccessModalOpen(false);
  };

  // Camera handlers
  const handleCameraStart = () => {
    // Check if we're in a secure context
    if (!window.isSecureContext) {
      setCameraError("Camera access requires HTTPS. Please use the HTTPS version of this app or access via localhost.");
      setIsCameraActive(false);
      setIsScanning(false);
      return;
    }

    setIsCameraActive(true);
    setIsScanning(true);
    setCameraError("");
    setBarcodeError("");
  };

  const handleCameraStop = () => {
    setIsCameraActive(false);
    setIsScanning(false);
  };

  const handleBarcodeDetected = (result: { rawValue: string }[]) => {
    if (result && result.length > 0) {
      const detectedCode = result[0].rawValue;
      const detectedType = (result[0] as any).format || 'unknown';
      
      setBarcodeInput(detectedCode);
      setScannedBarcodeType(detectedType);
      setBarcodeError("");
      setIsScanning(false);
      
      // Validate the barcode
      const validation = validateBarcode(detectedCode, detectedType);
      setIsBarcodeValid(validation.valid);
      setBarcodeValidationMessage(validation.message);
      
      // Show success feedback with validation status
      const successOverlay = document.createElement('div');
      successOverlay.className = `absolute inset-0 flex items-center justify-center rounded-lg ${
        validation.valid ? 'bg-green-500/20' : 'bg-orange-500/20'
      }`;
      
      const iconColor = validation.valid ? 'text-green-500' : 'text-orange-500';
      const bgColor = validation.valid ? 'bg-green-500' : 'bg-orange-500';
      
      successOverlay.innerHTML = `
        <div class="${bgColor} text-white px-4 py-3 rounded-lg flex items-center space-x-2 shadow-lg">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <div class="text-center">
            <div class="font-semibold">${detectedType.toUpperCase()} Detected!</div>
            <div class="text-xs opacity-90">${validation.valid ? 'Valid barcode' : 'Invalid barcode'}</div>
          </div>
        </div>
      `;
      
      if (scannerRef.current) {
        scannerRef.current.appendChild(successOverlay);
        setTimeout(() => {
          if (scannerRef.current && successOverlay.parentNode) {
            scannerRef.current.removeChild(successOverlay);
          }
        }, 3000);
      }
      
      // Auto-submit only if barcode is valid
      if (validation.valid) {
        setTimeout(() => {
          handleBarcodeSubmit();
        }, 1000);
      }
    }
  };

  // Development testing function to simulate successful barcode scan
  const handleTestScanSuccess = () => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    setIsTestingSuccess(true);
    setShowSuccessOverlay(true);
    setBarcodeError("");
    
    // Simulate successful scan with visual feedback
    const mockBarcodeData = "PCC517463RII";
    const mockBarcodeType = "CODE_128";
    
    // Set the input and validation
    setBarcodeInput(mockBarcodeData);
    setScannedBarcodeType(mockBarcodeType);
    
    // Simulate validation success
    const validation = validateBarcode(mockBarcodeData, mockBarcodeType);
    setIsBarcodeValid(true);
    setBarcodeValidationMessage("Barcode Verified Successfully");
    
    // Show enhanced success overlay
    const successOverlay = document.createElement('div');
    successOverlay.className = 'absolute inset-0 flex items-center justify-center rounded-lg bg-green-500/80 animate-in fade-in duration-300';
    successOverlay.style.zIndex = '20';
    
    successOverlay.innerHTML = `
      <div class="bg-white/10 backdrop-blur-sm text-white px-6 py-4 rounded-lg flex flex-col items-center space-y-2 shadow-2xl border border-white/20">
        <div class="bg-white/20 rounded-full p-3 mb-2">
          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="text-center">
          <div class="font-bold text-lg">Barcode Verified Successfully</div>
          <div class="text-sm opacity-90">Development Test Mode</div>
          <div class="text-xs opacity-75 mt-1">${mockBarcodeType} • ${mockBarcodeData}</div>
        </div>
      </div>
    `;
    
    if (scannerRef.current) {
      scannerRef.current.appendChild(successOverlay);
      setTimeout(() => {
        if (scannerRef.current && successOverlay.parentNode) {
          scannerRef.current.removeChild(successOverlay);
        }
        setShowSuccessOverlay(false);
        setIsTestingSuccess(false);
      }, 2000);
    }
    
    console.log("🧪 Development: Simulated successful barcode scan");
  };

  const handleCameraError = (error: unknown) => {
    console.error("Camera error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for specific secure context error
    if (errorMessage.includes("secure context") || errorMessage.includes("HTTPS")) {
      setCameraError("Camera access requires HTTPS. Please use the HTTPS version of this app or access via localhost.");
    } else if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
      setCameraError("Camera permission denied. Please allow camera access and try again.");
    } else if (errorMessage.includes("NotFoundError") || errorMessage.includes("No camera")) {
      setCameraError("No camera found. Please ensure a camera is connected and try again.");
    } else {
      setCameraError("Camera access denied or unavailable. Please use manual entry.");
    }
    
    setIsCameraActive(false);
    setIsScanning(false);
  };

  const handleManualBarcodeEntry = () => {
    setIsCameraActive(false);
    setIsScanning(false);
    setCameraError("");
  };

  // Handle camera retry/rescan
  const handleCameraRetry = async () => {
    setIsRetrying(true);
    setCameraError("");
    
    try {
      // Stop current camera
      handleCameraStop();
      
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Restart camera
      handleCameraStart();
      
      // Show success feedback
      const successOverlay = document.createElement('div');
      successOverlay.className = 'absolute top-12 right-3 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg z-10';
      successOverlay.innerHTML = `
        <div class="flex items-center space-x-2 text-sm">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <span>Camera restarted</span>
        </div>
      `;
      
      if (scannerRef.current) {
        scannerRef.current.appendChild(successOverlay);
        setTimeout(() => {
          if (scannerRef.current && successOverlay.parentNode) {
            scannerRef.current.removeChild(successOverlay);
          }
        }, 2000);
      }
      
      // Reset retry state after a short delay
      setTimeout(() => {
        setIsRetrying(false);
      }, 1000);
    } catch (error) {
      console.error("Camera retry error:", error);
      setCameraError("Failed to restart camera. Please try again.");
      setIsRetrying(false);
    }
  };

  const calculateProgress = () => {
    const completedSteps = routeSteps.filter(step => step.status === "completed").length;
    const totalSteps = routeSteps.length;
    return (completedSteps / totalSteps) * 100;
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case "assigned": return "bg-gray-500";
      case "route_started": return "bg-blue-500";
      case "arrived": return "bg-yellow-500";
      case "scanned": return "bg-purple-500";
      case "photo_taken": return "bg-orange-500";
      case "delivered": return "bg-green-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: DeliveryStatus) => {
    switch (status) {
      case "assigned": return "Ready to Start";
      case "route_started": return "En Route";
      case "arrived": return "Arrived";
      case "scanned": return "Package Scanned";
      case "photo_taken": return "Photo Captured";
      case "delivered": return "Delivered";
      case "failed": return "Failed";
      default: return "Unknown";
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50"
      id="parcego-courier-route-simulation-container"
      style={{ 
        paddingTop: '4rem', // Space for fixed header
        paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))', // Space for fixed bottom nav
        minHeight: '100dvh' // Use dynamic viewport height on mobile
      }}
    >
      {/* Fixed Header with Back Button */}
      <div 
        className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 z-[100]"
        id="parcego-route-fixed-header"
        style={{
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/courier')}
                className="h-9 w-9 flex-shrink-0"
                id="parcego-route-back-btn"
              >
                <Icon name="ArrowLeft" size={18} />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold text-gray-900 truncate">Route Progress</h1>
                {/* <p className="text-sm text-gray-500 truncate">{currentDelivery.trackingNumber}</p> */}
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Badge className={`${getStatusColor(routeStatus)} text-white text-xs`}>
                {getStatusText(routeStatus)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-full overflow-x-hidden">


        {/* Progress Bar */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold text-gray-900">Delivery Progress</span>
              <span className="text-lg font-bold text-gray-700">{Math.round(calculateProgress())}%</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 transition-all duration-300 ease-in-out"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
            {nextAssignment && (
              <p className="text-xs font-bold text-gray-600 mt-2">
                Next: {nextAssignment.receiver_name} - {nextAssignment.receiver_address}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Current Delivery Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Package" size={20} className="text-blue-600" />
              <span>Current Delivery</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{currentAssignment.receiver_name}</p>
              <p className="text-sm text-gray-600 flex items-center">
                <Icon name="MapPin" size={16} className="mr-2 text-gray-400" />
                {currentAssignment.receiver_address}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Icon name="Package" size={12} className="mr-1" />
                  {currentAssignment.package_type}
                </span>
                <span className="flex items-center">
                  <Icon name="Scale" size={12} className="mr-1" />
                  {currentAssignment.weight} kg
                </span>
              </div>
            </div>
            
            {currentAssignment.special_instructions && (
              <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 ">
                <Icon name="Info" size={18} className="text-amber-600  flex-shrink-0" />
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="Info" size={16} className="text-amber-600" />
                    <span className="text-sm font-semibold text-amber-900">Special Instructions</span>
                  </div>
                  <AlertDescription className="text-amber-800 leading-relaxed font-medium">
                    {currentAssignment.special_instructions}
                  </AlertDescription>
                  <div className="flex items-center space-x-1 text-xs text-amber-700">
                    <Icon name="AlertTriangle" size={12} />
                    <span>Please follow these instructions carefully</span>
                  </div>
                </div>
              </Alert>
            )}

            {gpsError && (
              <Alert variant="destructive">
                <Icon name="AlertTriangle" size={16} />
                <AlertDescription>{gpsError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Route Steps */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Icon name="Route" size={20} className="text-green-600" />
              <span>Delivery Steps</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routeSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${step.status === "completed" ? "bg-green-500 text-white" :
                        step.status === "current" ? "bg-blue-500 text-white" :
                        step.status === "failed" ? "bg-red-500 text-white" :
                        "bg-gray-200 text-gray-400"
                      }
                    `}>
                      {step.status === "completed" ? (
                        <Icon name="Check" size={16} />
                      ) : step.status === "failed" ? (
                        <Icon name="X" size={16} />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`${
                      step.status === "current" ? "font-bold text-blue-600" : "font-medium text-gray-900"
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  {step.status === "current" && (
                    <div className="flex-shrink-0">
                        {step.id === "start_route" && routeStatus === "assigned" && (
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={handleStartRoute}
                              size="sm"
                              id="parcego-route-start-btn"
                            >
                              <Icon name="Navigation" size={16} className="mr-2" />
                              Start
                            </Button>
                          </div>
                        )}
                      {step.id === "arrive_location" && routeStatus === "route_started" && (
                        <Button
                          onClick={handleArriveAtLocation}
                          size="sm"
                          id="parcego-route-arrive-btn"
                        >
                          <Icon name="MapPin" size={16} className="mr-2" />
                          Arrive
                        </Button>
                      )}
                      {step.id === "scan_barcode" && routeStatus === "arrived" && (
                        <Button
                          onClick={() => setIsBarcodeModalOpen(true)}
                          size="sm"
                          id="parcego-route-scan-btn"
                        >
                          <Icon name="Camera" size={16} className="mr-2" />
                          Scan
                        </Button>
                      )}
                      {step.id === "take_photo" && routeStatus === "scanned" && (
                        <Button
                          onClick={() => setIsPhotoModalOpen(true)}
                          size="sm"
                          id="parcego-route-photo-btn"
                        >
                          <Icon name="Camera" size={16} className="mr-2" />
                          Photo
                        </Button>
                      )}
                      {step.id === "confirm_delivery" && routeStatus === "photo_taken" && (
                        <Button
                            onClick={() => setIsConfirmModalOpen(true)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            id="parcego-route-confirm-btn"
                          >
                            <Icon name="CheckCircle" size={16} className="mr-2" />
                            Confirm
                          </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Problem Reporting Section */}
        {routeStatus !== "delivered" && routeStatus !== "failed" && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Icon name="AlertTriangle" size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-900">Having Issues?</h3>
                    <p className="text-sm text-red-700">
                      Report any delivery problems or issues
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsProblemModalOpen(true)}
                  id="parcego-route-report-problem-btn"
                >
                  <Icon name="AlertTriangle" size={16} className="mr-2" />
                  Report Problem
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {routeStatus === "delivered" && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900">Delivery Completed!</h3>
                  <p className="text-sm text-green-700">
                    Package successfully delivered to {currentAssignment.receiver_name}
                    {nextAssignment ? ". Redirecting to next delivery..." : ". All deliveries complete!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg shadow-gray-900/10 z-[100]"
        id="parcego-route-bottom-nav"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex justify-around items-center px-2 pt-2 pb-1">
          <button
            onClick={() => {
              setActiveTab('home');
              router.push('/courier');
            }}
            className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out parcego-nav-btn parcego-nav-btn--home group hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95 ${
              activeTab === 'home' 
                ? 'text-blue-600 bg-blue-50/80' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            id="parcego-nav-home-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out group-active:scale-95">
              <Icon name="Home" size={20} className="text-current" />
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Home
            </span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('deliveries');
              router.push('/courier');
            }}
            className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out parcego-nav-btn parcego-nav-btn--deliveries group hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95 ${
              activeTab === 'deliveries' 
                ? 'text-blue-600 bg-blue-50/80' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            id="parcego-nav-deliveries-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out group-active:scale-95 relative">
              <Icon name="Package" size={20} className="text-current" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {Math.max((assignments.length - 0), 0)}
              </div>
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Deliveries
            </span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('performance');
              router.push('/courier/performance');
            }}
            className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out parcego-nav-btn parcego-nav-btn--performance group hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95 ${
              activeTab === 'performance' 
                ? 'text-blue-600 bg-blue-50/80' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            id="parcego-nav-performance-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out group-active:scale-95">
              <Icon name="BarChart3" size={20} className="text-current" />
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Performance
            </span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('profile');
              router.push('/courier/profile');
            }}
            className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out parcego-nav-btn parcego-nav-btn--profile group hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95 ${
              activeTab === 'profile' 
                ? 'text-blue-600 bg-blue-50/80' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            id="parcego-nav-profile-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out group-active:scale-95">
              <Icon name="User" size={20} className="text-current" />
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Profile
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Map Modal */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-lg bg-white max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="flex items-center space-x-2">
              <Icon name="Map" size={20} className="text-blue-600" />
              <span>Navigate to Delivery</span>
            </DialogTitle>
            <DialogDescription className="font-medium text-left">
              Choose your preferred navigation app
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4">
            {/* Delivery Address Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <Icon name="MapPin" size={20} className="text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Delivery Address</p>
                  <p className="text-sm text-gray-700">{currentAssignment.receiver_address}, {currentAssignment.receiver_city}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto transition-all duration-200"
                onClick={() => {
                  if (optimizedRouteUrl) {
                    window.open(optimizedRouteUrl, '_blank');
                  } else {
                    // Fallback to individual address if no optimized route
                    window.open(`https://maps.google.com/maps?q=${encodeURIComponent(currentAssignment.receiver_address)}`, '_blank');
                  }
                }}
                disabled={isLoadingRoute}
                id="parcego-navigation-google-maps-btn"
              >
                <div className="mb-2">
                  {isLoadingRoute ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <GoogleMapsIcon />
                  )}
                </div>
                <span className="text-xs font-bold">
                  {isLoadingRoute ? 'Loading...' : 'Google Maps'}
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto transition-all duration-200 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => {
                  // Build full address for Waze with start and destination
                  const startAddress = "3883 Quartz Rd, Mississauga, ON L5B 0M4, Canada";
                  const fullAddress = `${currentAssignment.receiver_address}, ${currentAssignment.receiver_city}`;
                  
                  // Waze URL with start and destination
                  let wazeUrl = `https://waze.com/ul?navigate=yes&from=${encodeURIComponent(startAddress)}&to=${encodeURIComponent(fullAddress)}`;
                  
                  // Add next delivery as waypoint if available
                  if (nextAssignment) {
                    const nextFullAddress = `${nextAssignment.receiver_address}, ${nextAssignment.receiver_city}`;
                    wazeUrl += `&waypoint=1&lat=${encodeURIComponent(nextFullAddress)}`;
                  }
                  
                  window.open(wazeUrl, '_blank');
                }}
                id="parcego-navigation-waze-btn"
              >
                <div className="mb-2">
                  <WazeIcon />
                </div>
                <span className="text-xs font-bold">Waze</span>
              </Button>
              <Button
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto transition-all duration-200 hover:bg-green-50 hover:border-green-300"
                onClick={() => {
                  // Build full address for Apple Maps with start and destination
                  const startAddress = "3883 Quartz Rd, Mississauga, ON L5B 0M4, Canada";
                  const fullAddress = `${currentAssignment.receiver_address}, ${currentAssignment.receiver_city}`;
                  
                  // Apple Maps URL with start (saddr) and destination (daddr)
                  let appleMapsUrl = `http://maps.apple.com/?saddr=${encodeURIComponent(startAddress)}&daddr=${encodeURIComponent(fullAddress)}&dirflg=d`;
                  
                  window.open(appleMapsUrl, '_blank');
                }}
                id="parcego-navigation-apple-maps-btn"
              >
                <div className="mb-2">
                  <AppleMapsIcon />
                </div>
                <span className="text-xs font-bold">Apple Maps</span>
              </Button>
            </div>
            
            <Button
              onClick={() => setIsMapModalOpen(false)}
              className="w-full h-12 text-base font-medium hover:shadow-lg transition-all duration-200"
              id="parcego-continue-navigation-btn"
            >
              Continue with Navigation
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barcode Scan Modal */}
      <Dialog open={isBarcodeModalOpen} onOpenChange={(open) => {
        setIsBarcodeModalOpen(open);
        if (!open) {
          handleCameraStop();
          // Reset retry state when modal is closed
          setIsRetrying(false);
        }
      }}>
        <DialogContent className="max-w-lg bg-white max-h-[90vh] flex flex-col overflow-hidden sm:max-w-lg sm:max-h-[90vh] sm:flex sm:flex-col sm:overflow-hidden max-[430px]:w-screen max-[430px]:h-screen max-[430px]:max-w-none max-[430px]:max-h-none max-[430px]:rounded-none max-[430px]:border-none max-[430px]:fixed max-[430px]:inset-0 max-[430px]:top-0 max-[430px]:left-0 max-[430px]:right-0 max-[430px]:bottom-0 max-[430px]:translate-x-0 max-[430px]:translate-y-0">
          <DialogHeader className="flex-shrink-0 pb-4 max-[430px]:px-6 max-[430px]:py-4 max-[430px]:bg-white max-[430px]:border-b">
            <DialogTitle className="flex items-center space-x-2">
              <Icon name="Camera" size={20} className="text-purple-600" />
              <span className="font-bold">Scan Package Barcode</span>
            </DialogTitle>
            <DialogDescription className="text-left font-medium">
              Scan QR codes or 1D barcodes (Code 128, EAN-13, UPC-A, etc.) to verify package
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1 max-[430px]:flex-1 max-[430px]:overflow-y-auto">
            <div className="space-y-4 max-[430px]:p-6 max-[430px]:space-y-4">
            {/* Camera Scanner Interface */}
            <div className="relative">
              {!isCameraActive ? (
                <div className="bg-gray-900 rounded-lg h-92 flex items-center justify-center relative max-[430px]:h-full max-[430px]:rounded-none">
                  <div className="text-center text-white">
                    <Icon name="Camera" size={48} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold mb-2">Click to start camera scanning</p>
                    <p className="text-xs font-medium text-gray-300 mb-4">Supports QR codes, Code 128, EAN-13, UPC-A, and more</p>
                    {!window.isSecureContext && (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4 text-xs">
                        <p className="text-yellow-200 font-medium">⚠️ Camera requires HTTPS</p>
                        <p className="text-yellow-300">Use HTTPS version or localhost for camera access</p>
                      </div>
                    )}
                    <Button
                      onClick={handleCameraStart}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                      id="parcego-start-camera-btn"
                    >
                      <Icon name="Camera" size={16} className="mr-2" />
                      Start Camera
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative bg-gray-900 rounded-lg h-92 overflow-hidden max-[430px]:h-full max-[430px]:rounded-none">
                  <div ref={scannerRef} className="w-full h-full">
                    <Scanner
                      onScan={handleBarcodeDetected}
                      onError={handleCameraError}
                      constraints={{
                        facingMode: "environment", // Use back camera on mobile
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                      }}
                      formats={['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'codabar', 'itf', 'code_93', 'data_matrix', 'pdf417', 'aztec']}
                      components={{
                        onOff: false,
                        torch: true,
                        zoom: true,
                        finder: true
                      }}
                      styles={{
                        container: { width: '100%', height: '100%' },
                        video: { width: '100%', height: '100%', objectFit: 'cover' }
                      }}
                      paused={!isScanning}
                    />
                  </div>
                  
                  {/* Action Buttons - Top Right */}
                  <div className="absolute top-3 right-3 flex space-x-1">
                    {/* Development Test Button */}
                    {process.env.NODE_ENV === 'development' && (
                      <button
                        onClick={handleTestScanSuccess}
                        disabled={isTestingSuccess}
                        className={`w-8 h-8 bg-green-500/95 hover:bg-green-500 text-white rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group border border-green-400/50 backdrop-blur-sm ${
                          isTestingSuccess ? 'animate-pulse' : ''
                        }`}
                        id="parcego-camera-test-success-btn"
                        title={isTestingSuccess ? "Testing scan success..." : "Test scan success (Dev)"}
                        type="button"
                        aria-label={isTestingSuccess ? "Testing scan success" : "Test successful scan"}
                        style={{
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)'
                        }}
                      >
                        {isTestingSuccess ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <Icon name="RefreshCw" size={14} className="group-hover:scale-110 transition-transform duration-200" />
                        )}
                      </button>
                    )}
                    
                    {/* Retry/Rescan Button */}
                    <button
                      onClick={handleCameraRetry}
                      disabled={isRetrying}
                      className={`w-8 h-8 bg-white/95 hover:bg-white text-gray-700 hover:text-gray-900 rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group border border-gray-200/50 backdrop-blur-sm ${
                        cameraError ? 'animate-pulse' : ''
                      }`}
                      id="parcego-camera-retry-btn"
                      title={isRetrying ? "Restarting camera..." : "Retry/Rescan camera"}
                      type="button"
                      aria-label={isRetrying ? "Restarting camera" : "Retry camera scan"}
                      style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                      }}
                    >
                      {isRetrying ? (
                        <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                      ) : (
                        <Icon name="RotateCcw" size={16} className="group-hover:scale-110 transition-transform duration-200" />
                      )}
                    </button>
                  </div>
                  
                  {/* Scanning overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-lg p-4 text-white text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm font-semibold">Scanning for barcode...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Camera controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {/* <Button
                      onClick={handleCameraStop}
                      variant="outline"
                      size="sm"
                      className="bg-white/90 text-black hover:bg-white"
                    >
                      <Icon name="X" size={16} className="mr-1" />
                      Stop
                    </Button> */}
                    {/* <Button
                      onClick={handleManualBarcodeEntry}
                      variant="outline"
                      size="sm"
                      className="bg-white/90 text-black hover:bg-white"
                    >
                      <Icon name="Edit" size={16} className="mr-1" />
                      Manual Entry
                    </Button> */}
                  </div>
                </div>
              )}
              
              {/* Camera error display */}
              {cameraError && (
                <Alert variant="destructive" className="mt-2">
                  <Icon name="AlertTriangle" size={16} />
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}
            </div>
            
            {/* Manual input section */}
            <div className="space-y-2">
              <label htmlFor="barcode-input" className="text-sm font-semibold text-gray-700">
                Or enter barcode manually:
              </label>
              <Input
                id="barcode-input"
                value={barcodeInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setBarcodeInput(value);
                  setBarcodeError("");
                  
                  // Auto-validate as user types (with debounce)
                  if (value.trim().length > 0) {
                    // Simple validation for common barcode patterns
                    const validation = validateBarcode(value, 'manual_input');
                    setIsBarcodeValid(validation.valid);
                    setBarcodeValidationMessage(validation.message);
                    setScannedBarcodeType('manual_input');
                  } else {
                    // Reset validation when input is empty
                    setIsBarcodeValid(false);
                    setBarcodeValidationMessage("");
                    setScannedBarcodeType("");
                  }
                }}
                placeholder="Enter barcode (QR, Code 128, EAN-13, etc.)"
                className="w-full"
              />
              
              {/* Validation status display */}
              {barcodeInput && (
                <div className="space-y-2">
                  {isBarcodeValid ? (
                    <Alert className="border-green-200 bg-green-50">
                      <Icon name="CheckCircle" size={16} className="text-green-600" />
                      <AlertDescription className="text-green-800">
                        <div className="font-bold">{barcodeValidationMessage}</div>
                        {scannedBarcodeType && scannedBarcodeType !== 'manual_input' && (
                          <div className="text-sm text-green-600 mt-1">
                            Type: {scannedBarcodeType.toUpperCase()}
                          </div>
                        )}
                        {scannedBarcodeType === 'manual_input' && (
                          <div className="text-sm font-semibold text-green-600 mt-1">
                            Manual Entry
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : barcodeValidationMessage && !isBarcodeValid ? (
                    <Alert variant="destructive">
                      <Icon name="AlertTriangle" size={16} />
                      <AlertDescription>{barcodeValidationMessage}</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center mb-1">
                        <Icon name="Info" size={14} className="mr-1" />
                        <span className="font-medium">Enter a barcode to validate</span>
                      </div>
                      <div className="text-xs font-medium text-gray-400 ml-5">
                        Supported: QR codes, Code 128, EAN-13, UPC-A, Code 39, etc.
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {barcodeError && (
                <Alert variant="destructive">
                  <Icon name="AlertTriangle" size={16} />
                  <AlertDescription>{barcodeError}</AlertDescription>
                </Alert>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-2 pt-4 max-[430px]:px-6 max-[430px]:py-4 max-[430px]:bg-white max-[430px]:border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsBarcodeModalOpen(false);
                  handleCameraStop();
                  // Reset states when closing
                  setBarcodeInput("");
                  setIsBarcodeValid(false);
                  setBarcodeValidationMessage("");
                  setScannedBarcodeType("");
                  setBarcodeError("");
                  setIsRetrying(false);
                }}
                className="flex-1 h-12 font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBarcodeSubmit}
                className={`flex-1 h-12 transition-all duration-200 font-bold ${
                  isBarcodeValid 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={!barcodeInput || barcodeInput.trim().length === 0}
              >
                <div className="flex items-center space-x-2">
                  {isBarcodeValid ? (
                    <>
                      <Icon name="CheckCircle" size={16} />
                      <span>Verify & Continue</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Search" size={16} />
                      <span>Verify Barcode</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Capture Modal */}
      {/* Enhanced Photo Modal with Native Camera Access */}
      <Dialog open={isPhotoModalOpen} onOpenChange={(open) => {
        // Confirm discard if closing with photos
        if (!open && capturedPhotos.length > 0 && !photoUploaded) {
          if (window.confirm("Discard captured photos?")) {
            handleClosePhotoModal();
          }
        } else {
          setIsPhotoModalOpen(open);
          if (!open) {
            handleClosePhotoModal();
          }
        }
      }}>
        <DialogContent className="max-w-2xl p-0 max-h-[95vh] flex flex-col overflow-hidden sm:max-w-2xl sm:max-h-[95vh] sm:flex sm:flex-col sm:overflow-hidden max-[430px]:w-screen max-[430px]:h-screen max-[430px]:max-w-none max-[430px]:max-h-none max-[430px]:rounded-none max-[430px]:border-none max-[430px]:fixed max-[430px]:inset-0 max-[430px]:top-0 max-[430px]:left-0 max-[430px]:right-0 max-[430px]:bottom-0 max-[430px]:translate-x-0 max-[430px]:translate-y-0">
          {/* Modal Header - Matches Scan Modal Style */}
          <div className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-lg font-semibold">
              Proof of Delivery
            </DialogTitle>
            {/* <p className="text-sm text-gray-600 mt-1">
              Position the package and location in frame
            </p> */}
            <p className="text-xs text-gray-500 mt-1">
              Make sure the address/door number and label are clearly visible
            </p>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden max-[430px]:flex-1 max-[430px]:bg-black">
            {/* Camera/Photo Viewport */}
            <div className="relative flex-shrink-0 max-[430px]:flex-1 max-[430px]:relative">
            {!cameraActive && !cameraError && capturedPhotos.length === 0 && (
              // Initial State - Request Camera Access
              <div className="bg-gray-900 h-96 flex items-center justify-center max-[430px]:h-full">
                <div className="text-center text-white">
                  <Icon name="Camera" size={64} className="mx-auto mb-3" />
                  <p className="text-sm mb-4">Position the package and location in frame</p>
                  <div className="space-y-3">
                    <Button
                      onClick={startCamera}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <Icon name="Camera" size={20} className="mr-2" />
                      <span className="font-extrabold">Enable Camera</span>
                    </Button>
                    {/* <div className="text-xs text-gray-400">
                      <p>📸 Shutter sound will play on capture</p>
                      <p>💡 Flash toggle available in camera mode</p>
                    </div> */}
                  </div>
                </div>
              </div>
            )}
            
            {cameraActive && !cameraError && (
              // Camera Active State
              <div className="relative h-96 bg-black max-[430px]:h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Auto-capture indicator */}
                {isAutoCapturing && (
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    <Icon name="Loader2" size={14} className="inline mr-2 animate-spin" />
                    Auto-capturing...
                  </div>
                )}
                
                {/* Flash effect for photo capture */}
                {showFlash && (
                  <div className="absolute inset-0 bg-white animate-flash" />
                )}
                
                {/* Camera Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-center justify-between">
                    {/* Flash Toggle Button */}
                    <Button
                      size="lg"
                      onClick={toggleFlash}
                      className={`rounded-full h-12 w-12 shadow-lg transition-all duration-200 ${
                        flashEnabled 
                          ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      title={flashEnabled ? "Flash On" : "Flash Off"}
                    >
                      <Icon name={flashEnabled ? "Zap" : "ZapOff"} size={24} />
                    </Button>
                    
                    {/* Manual Shutter Button */}
                    <Button
                      size="lg"
                      onClick={capturePhoto}
                      disabled={capturedPhotos.length >= 3 || isCapturing}
                      className="rounded-full bg-white text-black hover:bg-gray-100 h-16 w-16 shadow-lg"
                    >
                      <Icon name="Camera" size={48} />
                    </Button>
                    
                    {/* Placeholder for symmetry */}
                    <div className="w-12 h-12"></div>
                  </div>
                </div>
                
                {/* Photo count indicator */}
                {capturedPhotos.length > 0 && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {capturedPhotos.length}/3 photos
                  </div>
                )}
                
                {/* Flash status indicator */}
                {flashEnabled && (
                  <div className="absolute top-4 left-4 bg-yellow-500/90 text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Icon name="Zap" size={14} />
                    <span>Flash On</span>
                  </div>
                )}
                
                {/* Audio status indicator */}
                {audioEnabled && (
                  <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Icon name="Volume2" size={14} />
                    <span>Audio On</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Camera Error State */}
            {cameraError && (
              <div className="bg-gray-900 h-96 flex items-center justify-center max-[430px]:h-full">
                <div className="text-center text-white px-6">
                  <Icon name="AlertTriangle" size={48} className="mx-auto mb-3 text-yellow-500" />
                  <p className="text-sm font-medium mb-2">Camera Access Required</p>
                  <p className="text-xs mb-4 text-gray-300">{cameraError}</p>
                  {cameraError.includes('Flash') && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4 text-xs">
                      <p className="text-yellow-200 font-medium">💡 Flash Note</p>
                      <p className="text-yellow-300">Flash control may not be available on all devices</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button
                      onClick={startCamera}
                      className="w-full bg-white text-black hover:bg-gray-100"
                    >
                      <Icon name="RefreshCw" size={16} className="mr-2" />
                      Try Again
                    </Button>
                    {cameraError.includes("permission") && (
                      <Button
                        variant="outline"
                        onClick={() => alert("Please enable camera permissions in your browser settings")}
                        className="w-full text-white border-white hover:bg-white/10"
                      >
                        <Icon name="Settings" size={16} className="mr-2" />
                        Open Settings
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => setUploadFromDevice(true)}
                      className="w-full text-white hover:bg-white/10"
                    >
                      <Icon name="Upload" size={16} className="mr-2" />
                      Upload from Device
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Photo Preview State */}
            {capturedPhotos.length > 0 && !cameraActive && !cameraError && (
              <div className="bg-gray-100 h-96 p-4 max-[430px]:h-full">
                <div className="h-full flex items-center justify-center">
                  {capturedPhotos.length === 1 ? (
                    <img
                      src={capturedPhotos[0].dataUrl}
                      alt="Captured photo"
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-w-lg">
                      {capturedPhotos.slice(0, 4).map((photo, index) => (
                        <img
                          key={photo.id}
                          src={photo.dataUrl}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg shadow"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Scrollable Bottom Section */}
          <div className="flex-1 overflow-y-auto max-[430px]:flex-shrink-0 max-[430px]:bg-white">
            {/* Photo Thumbnails */}
            {capturedPhotos.length > 0 && (
              <div className="px-6 py-3 border-t bg-gray-50">
              <div className="flex items-center space-x-2">
                {capturedPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.dataUrl}
                      alt="Thumbnail"
                      className="w-16 h-16 object-cover rounded border-2 border-gray-300"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-100 hover:bg-red-600 transition-colors shadow-lg"
                      title="Delete photo"
                    >
                      <Icon name="Trash" size={14} />
                    </button>
                    {photo.uploadStatus === 'uploading' && (
                      <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                        <Icon name="Loader2" size={16} className="text-white animate-spin" />
                      </div>
                    )}
                    {photo.uploadStatus === 'failed' && (
                      <div className="absolute inset-0 bg-red-500/50 rounded flex items-center justify-center">
                        <Icon name="AlertTriangle" size={16} className="text-white" />
                      </div>
                    )}
                    {photo.uploadStatus === 'completed' && (
                      <div className="absolute inset-0 bg-green-500/50 rounded flex items-center justify-center">
                        <Icon name="CheckCircle" size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {capturedPhotos.length < 3 && cameraActive && (
                  <button
                    onClick={() => setIsAutoCapturing(false)}
                    className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Icon name="Plus" size={20} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          )}
          
            {/* Action Buttons */}
            <div className="px-6 py-4 border-t bg-white max-[430px]:px-6 max-[430px]:py-4 max-[430px]:border-t max-[430px]:bg-white">
            <div className="flex space-x-2">
              {capturedPhotos.length > 0 && !photoUploaded && (
                <>
                  <Button
                    variant="outline"
                    onClick={retakeAllPhotos}
                    className="flex-1"
                  >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Retake All
                  </Button>
                  {capturedPhotos.length < 3 && !cameraActive && (
                    <Button
                      variant="outline"
                      onClick={startCamera}
                      className="flex-1"
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Add Another
                    </Button>
                  )}
                  <Button
                    onClick={uploadPhotos}
                    disabled={isUploading || capturedPhotos.length === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isUploading ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={16} className="mr-2" />
                        Send Proof ({capturedPhotos.length})
                      </>
                    )}
                  </Button>
                </>
              )}
              {capturedPhotos.length === 0 && !cameraActive && (
                <Button
                  variant="outline"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
              {photoUploaded && (
                <Button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Icon name="CheckCircle" size={16} className="mr-2" />
                  Done
                </Button>
              )}
            </div>
          </div>
          
            {/* Low Light Warning */}
            {lowLightDetected && (
              <div className="px-6 pb-4 max-[430px]:px-6 max-[430px]:pb-4">
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Icon name="Lightbulb" size={16} className="text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Low light detected. Try to improve lighting for better photo quality.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] bg-white flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={20} className="text-green-600" />
              <span>Confirm Delivery</span>
            </DialogTitle>
            <DialogDescription>
              Please confirm that the delivery has been completed successfully
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4 ">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Package Scanned</span>
                <Icon name="Check" size={16} className="text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Photo Captured</span>
                <Icon name="Check" size={16} className="text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Location Verified</span>
                <Icon name="Check" size={16} className="text-green-600" />
              </div>
            </div>
            
            <Alert>
              <Icon name="Info" size={16} />
              <AlertDescription>
                By confirming, you acknowledge that the package has been successfully delivered to {currentAssignment.receiver_name}.
              </AlertDescription>
            </Alert>
            
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelivery}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirm Delivery
              </Button>
            </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Problem Reporting Modal */}
      <Dialog open={isProblemModalOpen} onOpenChange={setIsProblemModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] bg-white flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={20} className="text-red-600" />
              <span>Report Delivery Problem</span>
            </DialogTitle>
            <DialogDescription>
              Please describe the issue that prevented successful delivery
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="undelivered-reason" className="text-sm font-medium">
                  Reason for Undelivered *
                </Label>
                <Select value={undeliveredReason} onValueChange={(value: any) => setUndeliveredReason(value)}>
                  <SelectTrigger id="undelivered-reason" className="w-full">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_not_available">Customer Not Available</SelectItem>
                    <SelectItem value="incorrect_address">Incorrect Address</SelectItem>
                    <SelectItem value="access_denied">Access Denied</SelectItem>
                    <SelectItem value="customer_refused">Customer Refused</SelectItem>
                    <SelectItem value="damaged_package">Damaged Package</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(undeliveredReason === 'other' || undeliveredReason === 'damaged_package') && (
                <div className="space-y-2">
                  <Label htmlFor="problem-note" className="text-sm font-medium">
                    Additional Details {undeliveredReason === 'other' ? '*' : ''}
                  </Label>
                  <textarea
                    id="problem-note"
                    placeholder={undeliveredReason === 'other' ? "Please provide additional details..." : "Describe the damage..."}
                    value={problemNote}
                    onChange={(e) => setProblemNote(e.target.value)}
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {problemNote.length}/500 characters
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsProblemModalOpen(false);
                  setProblemNote("");
                  setUndeliveredReason('other');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReportProblem}
                className="flex-1"
                disabled={!undeliveredReason || (undeliveredReason === 'other' && !problemNote.trim())}
              >
                <Icon name="AlertTriangle" size={16} className="mr-2" />
                Report Problem
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Achievement Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={handleSuccessModalClose}>
        <DialogContent 
          className="max-w-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 max-h-[90vh] flex flex-col overflow-hidden"
          showCloseButton={false}
        >
          {/* Custom Close Button with White Background */}
          <button
            onClick={handleSuccessModalClose}
            className="absolute top-3 right-3 z-10 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-all duration-200 rounded-md opacity-80 hover:opacity-100 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none p-1.5 w-7 h-7 flex items-center justify-center shadow-sm border border-gray-200"
            aria-label="Close delivery complete modal"
            id="parcego-delivery-success-close-btn"
          >
            <Icon name="X" size={16} className="text-current" />
          </button>
          
          <div className="relative text-center py-8 px-6">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Icon name="CheckCircle" size={48} className="text-white drop-shadow-sm" />
            </div>
            
            {/* Main Content */}
            <DialogHeader className="space-y-4">
              {/* Primary Title - More compact spacing */}
              <DialogTitle className="text-3xl font-extrabold text-green-900 leading-tight text-center tracking-tight">
                <span className="inline-flex items-center">
                  <span className="mx-2">Delivery Complete!</span>
                </span>
              </DialogTitle>
              
              {/* Achievement Message - Reduced spacing */}
              <div className="space-y-3">
                <div className="text-lg text-center font-medium text-green-800 leading-tight border-b border-green-200 pb-2">
                  Outstanding Achievement!
                </div>
                
                {/* Delivery Confirmation - More compact */}
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <span className="block text-sm text-green-700 mb-1 leading-tight">
                    Package successfully delivered to:
                  </span>
                  <span className="block font-bold text-green-900 text-xl leading-tight">
                    {currentAssignment.receiver_name}
                  </span>
                </div>
                
                {/* Next Action - Reduced padding */}
                <div className="pt-2">
                  {nextAssignment ? (
                    <div className="text-sm text-green-600 font-medium text-center flex items-center justify-center bg-green-50 py-2 rounded-md leading-tight">
                      <span className="text-lg mr-2">🚛</span>
                      <span>Moving to next delivery...</span>
                    </div>
                  ) : (
                    <div className="text-sm text-green-600 font-medium text-center flex items-center justify-center bg-green-50 py-2 rounded-md leading-tight">
                      <span className="text-lg mr-2">🏆</span>
                      <span>All deliveries completed!</span>
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            {/* Success Animation Effect - Adjusted for smaller icon */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[92px] left-1/2 transform -translate-x-1/2 w-32 h-32 bg-green-300 rounded-full opacity-15 animate-ping"></div>
              <div className="absolute top-[92px] left-1/2 transform -translate-x-1/2 w-24 h-24 bg-green-400 rounded-full opacity-20 animate-ping animation-delay-300"></div>
              <div className="absolute top-[92px] left-1/2 transform -translate-x-1/2 w-20 h-20 bg-green-500 rounded-full opacity-25 animate-ping animation-delay-500"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { authService, driverService } from "@/lib/api";
import type { User, DriverAssignment } from "@/lib/api";

// Mock data removed - using real API data only




const getStatusColor = (status: string) => {
  switch (status) {
    case "ready_for_pickup":
      return "bg-blue-600";
    case "in_transit":
      return "bg-amber-600";
    case "delivered":
      return "bg-emerald-600";
    case "assigned":
      return "bg-slate-600";
    default:
      return "bg-slate-600";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ready_for_pickup":
      return "Ready for Pickup";
    case "in_transit":
      return "In Transit";
    case "delivered":
      return "Delivered";
    case "assigned":
      return "Assigned";
    default:
      return "Unknown";
  }
};

// const getPriorityColor = (priority: string) => {
//   switch (priority) {
//     case "high":
//       return "bg-red-600";
//     case "medium":
//       return "bg-amber-600";
//     case "low":
//       return "bg-emerald-600";
//     default:
//       return "bg-slate-600";
//   }
// };

// Client-only wrapper to prevent hydration mismatches
const ClientOnlyCourierDashboard = dynamic(() => Promise.resolve(CourierDashboard), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
});

function CourierDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isScanPackageModalOpen, setIsScanPackageModalOpen] = useState(false);
  
  // API Data state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<DriverAssignment[]>([]);
  
  // Notification banner state
  const [showNotificationBanner, setShowNotificationBanner] = useState(true);
  const [notificationBanner, setNotificationBanner] = useState({
    type: "warning" as "info" | "success" | "warning" | "error",
    title: "Delivery Status Update",
    message: "Loading your assignments...",
  });
  
  // Deliveries & Stats state (sequential by priority) - now based on API data
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [stats, setStats] = useState({
    deliveriesToday: 0,
    completed: 0,
    remaining: 0,
    earnings: 0,
    efficiency: 0,
    onTimeRate: 0
  });
  const priorityOrder = React.useMemo(() => ({ high: 3, medium: 2, low: 1 } as const), []);
  const activeDeliveryId = React.useMemo(() => {
    const pending = deliveries.filter(d => d.status !== 'delivered');
    if (pending.length === 0) return null;
    const next = [...pending].sort((a, b) => (priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]))[0];
    return next.id;
  }, [deliveries, priorityOrder]);
  const sortedDeliveries = React.useMemo(() => {
    const list = [...deliveries].sort((a, b) => {
      const aDelivered = a.status === 'delivered' ? 1 : 0;
      const bDelivered = b.status === 'delivered' ? 1 : 0;
      if (aDelivered !== bDelivered) return aDelivered - bDelivered; // delivered last
      return (priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]);
    });
    if (activeDeliveryId) {
      const idx = list.findIndex(d => d.id === activeDeliveryId);
      if (idx > 0) {
        const [active] = list.splice(idx, 1);
        list.unshift(active);
      }
    }
    return list;
  }, [deliveries, activeDeliveryId, priorityOrder]);

  // Calculate delivery progress from route status stored in localStorage
  const deliveryProgress = React.useMemo(() => {
    if (!activeDeliveryId || typeof window === 'undefined') return 0;
    
    const savedStatus = localStorage.getItem(`parcego_route_status_${activeDeliveryId}`);
    if (!savedStatus) return 0;
    
    // Map route status to progress percentage
    const statusToProgress: Record<string, number> = {
      'assigned': 0,
      'route_started': 20,
      'arrived_location': 40,
      'scan_barcode': 60,
      'photo_taken': 80,
      'delivered': 100
    };
    
    return statusToProgress[savedStatus] || 0;
  }, [activeDeliveryId]);
  
  // Notification state management
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Scan package state management
  interface ScannedPackageData {
    trackingNumber: string;
    customerName: string;
    address: string;
    packageType: string;
    weight: string;
    estimatedDelivery: string;
    currentStatus: string;
    specialInstructions: string;
  }
  
  const [scannedPackageData, setScannedPackageData] = useState<ScannedPackageData | null>(null);
  const [scanInput, setScanInput] = useState("");
  const [isScanValid, setIsScanValid] = useState(false);
  const [scanValidationMessage, setScanValidationMessage] = useState("");
  const [scanError, setScanError] = useState("");
  
  // Camera scanning state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [html5QrcodeScanner, setHtml5QrcodeScanner] = useState<any | null>(null);
  // Fallback ZXing and overlay state
  const zxingControlsRef = useRef<any | null>(null);
  const zxingReaderRef = useRef<any | null>(null);
  const zxingVideoElRef = useRef<HTMLVideoElement | null>(null);
  const [scanBoxSize, setScanBoxSize] = useState<number>(0);
  

  // Camera scanning functions - defined early to avoid hoisting issues
  const handleCameraStop = async () => {
    console.log("⏹ Stopping camera...");
    
    try {
      // Clean up html5-qrcode instance
      if (html5QrcodeScanner) {
        if (typeof html5QrcodeScanner.stop === 'function') {
          await html5QrcodeScanner.stop();
        }
        if (typeof html5QrcodeScanner.clear === 'function') {
          await html5QrcodeScanner.clear();
        }
        setHtml5QrcodeScanner(null);
        console.log("✅ Camera scanner cleaned up successfully");
      }
      // Clean up ZXing fallback if present
      if (zxingControlsRef.current) {
        try { await (zxingControlsRef.current as any).stop(); } catch (_) {}
        zxingControlsRef.current = null;
      }
      zxingReaderRef.current = null;
      if (zxingVideoElRef.current && zxingVideoElRef.current.srcObject) {
        try {
          const stream = zxingVideoElRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(t => t.stop());
        } catch (_) {}
      }
      if (zxingVideoElRef.current && zxingVideoElRef.current.parentElement) {
        try { zxingVideoElRef.current.parentElement.removeChild(zxingVideoElRef.current); } catch (_) {}
        zxingVideoElRef.current = null;
      }
    } catch (error) {
      console.warn("⚠️ Error cleaning up scanner:", error);
    }
    
    setIsCameraActive(false);
    setIsScanning(false);
    setCameraError("");
  };

  // Extract data fetching logic to avoid duplication
  const fetchDashboardData = async (userData: any) => {
    try {
      // Fetch today's assignments
      const assignmentsResponse = await driverService.getTodaysAssignments();
      setAssignments(assignmentsResponse.assignments || []);

      // Update deliveries based on assignments
      let mappedDeliveries: any[] = [];
      if (assignmentsResponse.assignments && assignmentsResponse.assignments.length > 0) {
        mappedDeliveries = assignmentsResponse.assignments
          .map((assignment) => {
            // Map assignment status to delivery status
            let deliveryStatus: string;
            const status = assignment.status?.toUpperCase();
            const assignmentStatus = assignment.assignment_status?.toLowerCase();
            
            // Skip UNDELIVERED assignments
            if (status === 'UNDELIVERED') {
              return null;
            }
            
            if (assignmentStatus === 'completed' || status === 'DELIVERED') {
              deliveryStatus = 'delivered';
            } else if (status === 'OUT_FOR_DELIVERY') {
              deliveryStatus = 'ready_for_pickup';
            } else if (status === 'IN_TRANSIT' || assignmentStatus === 'in_progress') {
              deliveryStatus = 'in_transit';
            } else if (status === 'IN_WAREHOUSE') {
              deliveryStatus = 'assigned';
            } else {
              deliveryStatus = 'assigned';
            }

            return {
              id: `PCG-DEL-${assignment.id}`,
              trackingNumber: assignment.tracking_code,
              customerName: assignment.receiver_name,
              address: `${assignment.receiver_address}, ${assignment.receiver_city}`,
              timeWindow: "N/A",
              estimatedTime: assignment.estimated_delivery_date || "TBD",
              status: deliveryStatus,
              packageType: assignment.package_type || 'Standard',
              weight: `${assignment.weight} kg`,
              specialInstructions: assignment.special_instructions || '',
              priority: 'medium' as const
            };
          })
          .filter((delivery) => delivery !== null) as any[];
        setDeliveries(mappedDeliveries);
      } else {
        setDeliveries([]);
        mappedDeliveries = [];
      }

      // Calculate stats from assignments (primary source)
      const totalAssignments = mappedDeliveries.length || 0;
      const completed = mappedDeliveries.filter(d => d.status === 'delivered').length || 0;
      const remaining = totalAssignments - completed;

      // Set stats (assignment-based only)
      const finalStats = {
        deliveriesToday: totalAssignments,
        completed: completed,
        remaining: remaining,
        earnings: 0,
        efficiency: totalAssignments > 0 
          ? Math.round((completed / totalAssignments) * 100) 
          : 0,
        onTimeRate: 0
      };
      
      setStats(finalStats);

      // Update notification banner
      setNotificationBanner({
        type: remaining > 0 ? "warning" : "success",
        title: remaining > 0 ? "Delivery Status Update" : "All Deliveries Complete",
        message: remaining > 0 
          ? `You have ${remaining} pending deliveries that need attention`
          : "Great job! All deliveries are complete for today."
      });
      
    } catch (error: any) {
      console.error('❌ [DASHBOARD] Error:', error);
      throw error;
    }
  };

  // Check authentication and fetch data on component mount
  useEffect(() => {
    const checkAuthenticationAndFetchData = async () => {
      // Only run on client side to prevent hydration mismatch
      if (typeof window === 'undefined') {
        console.log('⚠️ [DASHBOARD] Running on server side, skipping auth check');
        setIsLoading(false);
        return;
      }

      console.log('🔍 [DASHBOARD] Starting authentication check...');
      console.log('🔍 [DASHBOARD] Current URL:', window.location.href);

      try {
        const authenticated = localStorage.getItem("courier_authenticated");
        const authToken = localStorage.getItem("auth_token");
        const loginTime = localStorage.getItem("courier_login_time");
        const courierEmail = localStorage.getItem("courier_email");
        const courierUser = localStorage.getItem("courier_user");

        console.log('🔍 [DASHBOARD] LocalStorage check:', {
          courier_authenticated: authenticated,
          auth_token_exists: !!authToken,
          auth_token_length: authToken?.length || 0,
          auth_token_preview: authToken?.substring(0, 20) + '...',
          courier_login_time: loginTime,
          courier_email: courierEmail,
          courier_user_exists: !!courierUser,
          all_keys: Object.keys(localStorage)
        });

        console.log('🍪 [DASHBOARD] Cookies:', document.cookie);

        // Check if authentication exists and is not expired (24 hours)
        // Only check localStorage - if it's empty, redirect to login
        const hasLocalStorageAuth = authenticated === "true" && authToken && loginTime;
        
        console.log('🔍 [DASHBOARD] Authentication check:', {
          hasLocalStorageAuth,
          localStorageData: { authenticated, authToken: !!authToken, loginTime },
          cookieData: document.cookie
        });

        if (!hasLocalStorageAuth) {
          console.log('❌ [DASHBOARD] No valid authentication found in localStorage');
          console.log('❌ [DASHBOARD] Missing authentication data:', {
            courier_authenticated: authenticated,
            auth_token_exists: !!authToken,
            courier_login_time: loginTime,
            required: 'All three must be present'
          });
          router.push("/login");
          return;
        }

        // Check token expiration based on remember me option
        const rememberMe = localStorage.getItem("courier_remember_me") === "true";
        const timeSinceLogin = Date.now() - parseInt(loginTime);
        const expirationTime = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 24 hours

        if (timeSinceLogin >= expirationTime) {
          // Session expired, clear storage and redirect
          localStorage.removeItem("courier_authenticated");
          localStorage.removeItem("courier_email");
          localStorage.removeItem("courier_login_time");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("courier_user");
          localStorage.removeItem("courier_remember_me");
          document.cookie = "courier_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          
          const currentPath = window.location.pathname;
          const redirectUrl = currentPath !== '/login' ? `/login?redirect=${encodeURIComponent(currentPath)}` : '/login';
          router.push(redirectUrl);
          return;
        }

        console.log('✅ [DASHBOARD] Token not expired, proceeding with API verification...');

        try {
          // Verify token and get current user
          console.log('🔍 [DASHBOARD] Calling authService.getCurrentUser()...');
          console.log('🔍 [DASHBOARD] Auth token being used:', authToken.substring(0, 20) + '...');
          
          const userResponse = await authService.getCurrentUser();
          
          console.log('✅ [DASHBOARD] User data fetched successfully:', {
            userId: userResponse.data.id,
            email: userResponse.data.email,
            firstName: userResponse.data.first_name,
            lastName: userResponse.data.last_name,
            role: userResponse.data.role,
            isActive: userResponse.data.is_active,
            isVerified: userResponse.data.is_verified
          });

          // Check if user has courier/driver role
          if (userResponse.data.role !== 'courier' && userResponse.data.role !== 'driver') {
            console.error('❌ [DASHBOARD] User does not have courier/driver role:', userResponse.data.role);
            localStorage.removeItem("courier_authenticated");
            localStorage.removeItem("auth_token");
          router.push("/login");
            return;
          }

          console.log('✅ [DASHBOARD] Role validation passed');
          setCurrentUser(userResponse.data);
          setIsAuthenticated(true);

          // Fetch dashboard data using the extracted function
          await fetchDashboardData(userResponse.data);

        } catch (apiError: any) {
          console.error('❌ [DASHBOARD] API error during data fetch:', apiError);
          console.error('❌ [DASHBOARD] API error details:', {
            message: apiError.message,
            response: apiError.response,
            status: apiError.response?.status,
            data: apiError.response?.data
          });
          
          // Token might be invalid, redirect to login
          console.log('❌ [DASHBOARD] Token appears invalid, clearing storage and redirecting...');
          localStorage.removeItem("courier_authenticated");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("courier_email");
          localStorage.removeItem("courier_login_time");
          localStorage.removeItem("courier_user");
          router.push("/login");
          return;
        }
      } catch (error: any) {
        console.error('❌ [DASHBOARD] Error during authentication check:', error);
        console.error('❌ [DASHBOARD] Error stack:', error.stack);
        router.push("/login");
      }
      
      setIsLoading(false);
    };

    checkAuthenticationAndFetchData();
  }, [router]);

  // Keyboard support for modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isScanPackageModalOpen) {
          // Inline the close logic to avoid circular dependency
          if (isCameraActive || html5QrcodeScanner) {
            handleCameraStop();
          }
          setIsScanPackageModalOpen(false);
          setScanInput("");
          setIsScanValid(false);
          setScanValidationMessage("");
          setScanError("");
          setScannedPackageData(null);
          setCameraError("");
          setScanMode('camera');
          setIsCameraActive(false);
          setIsScanning(false);
        } else if (isNotificationModalOpen) {
          handleNotificationClose();
        }
      }
    };

    if (isNotificationModalOpen || isScanPackageModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isNotificationModalOpen, isScanPackageModalOpen, isCameraActive, html5QrcodeScanner]);

  // Cleanup camera scanner on component unmount
  useEffect(() => {
    return () => {
      // Clean up scanner when component unmounts
      if (html5QrcodeScanner) {
        try {
          // Prefer stopping first if available
          if (typeof html5QrcodeScanner.stop === 'function') {
            // Stop returns a promise; fire and forget to avoid blocking unmount
            Promise.resolve(html5QrcodeScanner.stop()).then(() => {
              if (typeof html5QrcodeScanner.clear === 'function') {
                return html5QrcodeScanner.clear();
              }
            }).catch(() => {
              // Swallow errors silently to avoid unmount crashes
            });
          } else if (typeof html5QrcodeScanner.clear === 'function') {
            // Fallback if stop is not available
            Promise.resolve(html5QrcodeScanner.clear()).catch(() => {});
          }
        } catch (_) {
          // No-op
        }
      }
      // ZXing cleanup on unmount
      if (zxingControlsRef.current) {
        try { (zxingControlsRef.current as any).stop(); } catch (_) {}
        zxingControlsRef.current = null;
      }
      if (zxingVideoElRef.current && zxingVideoElRef.current.parentElement) {
        try { zxingVideoElRef.current.parentElement.removeChild(zxingVideoElRef.current); } catch (_) {}
        zxingVideoElRef.current = null;
      }
    };
  }, [html5QrcodeScanner]);

  const unreadNotificationsCount = notifications.filter(n => n.status === 'unread').length;
  // Expose remaining deliveries for other pages' bottom nav badge (simple UI-only state share)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const remaining = String(stats.remaining ?? 0);
        localStorage.setItem('parcego_remaining_deliveries', remaining);
      }
    } catch (_) {}
  }, [stats.remaining]);

  // Scan package functions
  const handleScanPackageClose = React.useCallback(async () => {
    // Stop camera if active
    if (isCameraActive || html5QrcodeScanner) {
      await handleCameraStop();
    }
    
    setIsScanPackageModalOpen(false);
    setScanInput("");
    setIsScanValid(false);
    setScanValidationMessage("");
    setScanError("");
    setScannedPackageData(null);
    setCameraError("");
    setScanMode('camera');
    setIsCameraActive(false);
    setIsScanning(false);
  }, [isCameraActive, html5QrcodeScanner, handleCameraStop]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading Courier Dashboard...</p>
          <p className="text-xs text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Icon name="AlertCircle" size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the courier dashboard.</p>
          <Button 
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleScanPackage = (deliveryId: string) => {
    console.log(`📦 Opening scan package modal for delivery ${deliveryId}`);
    
    // Reset all scan states
    setScanInput("");
    setIsScanValid(false);
    setScanValidationMessage("");
    setScanError("");
    setScannedPackageData(null);
    setCameraError("");
    setScanMode('camera');
    setIsScanning(false);
    
    // Open the scan package modal and attempt to start camera
    setIsScanPackageModalOpen(true);
    
    // Start camera automatically when modal opens
    setTimeout(() => {
      handleCameraStart();
    }, 300); // Small delay to ensure modal is fully rendered
  };

  const handleStartRoute = (deliveryId: string) => {
    router.push(`/courier/route/${deliveryId}`);
  };




  const handleLogout = async () => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return;

    try {
      // Call API logout endpoint
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    }

    // Clear all authentication data
    localStorage.removeItem("courier_authenticated");
    localStorage.removeItem("courier_email");
    localStorage.removeItem("courier_login_time");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("courier_user");
    
    // Clear authentication cookie with proper attributes
    document.cookie = "courier_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    
    // Reset authentication state
    setIsAuthenticated(false);
    
    // Redirect to login page
    router.push("/login");
  };

  // Notification functions
  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleNotificationClose = () => {
    setIsNotificationModalOpen(false);
  };

  const handleNotificationItemClick = (notificationId: string) => {
    // Mark notification as read
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'read' as const }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.status === 'unread' 
          ? { ...notification, status: 'read' as const }
          : notification
      )
    );
    console.log('All notifications marked as read');
  };

  // Clear all notifications
  const handleClearAll = () => {
    setNotifications([]);
    console.log('All notifications cleared');
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (iconName: string) => {
    return iconName;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "normal":
        return "text-blue-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  

  // Utility: wait for an element to be present in DOM
  const waitForElementById = async (id: string, timeoutMs: number = 3000): Promise<HTMLElement | null> => {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    while (((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start) < timeoutMs) {
      const el = document.getElementById(id);
      if (el) return el as HTMLElement;
      await new Promise(requestAnimationFrame);
    }
    return null;
  };

  // Camera scanning functions
  const handleCameraStart = async () => {
    console.log("🎥 Starting camera for barcode scanning...");
    
    try {
      // Check if browser supports camera access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }
      
      // Check secure context for camera access
      if (!window.isSecureContext) {
        throw new Error("Camera requires HTTPS or localhost. Please use a secure connection.");
      }
      
      // Ensure we're in camera mode and modal is open so the container mounts
      if (scanMode !== 'camera') {
        setScanMode('camera');
      }
      if (!isScanPackageModalOpen) {
        console.warn('Scan modal not open during camera start; delaying until open...');
      }

      // Request camera permission and start stream automatically
      setIsScanning(true);
      setCameraError("");
      
      // Ensure the container exists before rendering
      const containerEl = await waitForElementById("parcego-camera-scanner-container", 3500);
      if (!containerEl) {
        throw new Error("Scanner container not mounted yet");
      }
      // Clear any previous content
      containerEl.innerHTML = "";
      
      // Dynamically import html5-qrcode to avoid SSR issues
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
      
      const formatsToSupport = [
        // Focus on QR for faster, more reliable detection; add common 1D if needed
        Html5QrcodeSupportedFormats.QR_CODE
      ];
      
      // Enable native BarcodeDetector if supported for speed & accuracy
      const html5QrCode = new Html5Qrcode(
        "parcego-camera-scanner-container",
        {
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
          formatsToSupport,
          verbose: false
        }
      );
      
      const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
      const config: any = {
        fps: 15,
        // square box sized to ~66% of shortest edge
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minEdge * 0.8);
          setScanBoxSize(size);
          return { width: size, height: size };
        },
        aspectRatio: isMobile ? 1.777778 : 1.333333,
        disableFlip: true,
        // Prefer environment camera and hint autofocus/zoom to the browser
        videoConstraints: ({
          facingMode: { ideal: "environment" },
          advanced: [
            // Best-effort hints; browsers ignore unsupported ones
            { focusMode: "continuous" },
            { exposureMode: "continuous" }
          ]
        } as unknown) as MediaTrackConstraints
      };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText: string) => {
          console.log("✅ Code scanned successfully:", decodedText);
          handleBarcodeDetected(decodedText);
        },
        (errorMessage: string) => {
          if (!errorMessage.includes("No MultiFormat Readers") && !errorMessage.includes("No valid barcode")) {
            console.warn("🔍 Scan error:", errorMessage);
          }
        }
      );
      
      // Try to improve focus/zoom after stream starts (best-effort)
      try {
        await html5QrCode.applyVideoConstraints(({
          advanced: [
            { focusMode: "continuous" },
            { exposureMode: "continuous" }
          ]
        } as unknown) as MediaTrackConstraints);
      } catch (_) {
        // Ignore if not supported
      }
      
      setHtml5QrcodeScanner(html5QrCode);
      setIsCameraActive(true);
      setIsScanning(false);
      console.log("✅ Camera scanner initialized successfully");
      
    } catch (error) {
      console.error("❌ Camera initialization failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Camera access failed";
      // If the container wasn't present yet, try once more after waiting briefly
      if (errorMessage.toLowerCase().includes('container not mounted') || errorMessage.toLowerCase().includes('element with id')) {
        const el = await waitForElementById('parcego-camera-scanner-container', 2000);
        if (el) {
          try {
            console.warn('Container became available, retrying camera start...');
            await handleCameraStart();
            return;
          } catch (_) { /* fallthrough to fallback */ }
        }
      }
      // Try ZXing fallback when not a secure-context failure
      if (!errorMessage.toLowerCase().includes('https') && !errorMessage.toLowerCase().includes('secure')) {
        try {
          const containerEl = document.getElementById('parcego-camera-scanner-container');
          if (containerEl) {
            containerEl.innerHTML = '';
            const video = document.createElement('video');
            video.setAttribute('playsinline', 'true');
            video.muted = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            containerEl.appendChild(video);
            zxingVideoElRef.current = video;

            const ZXing = await import('@zxing/browser');
            const reader = new ZXing.BrowserMultiFormatReader();
            const devices = await ZXing.BrowserMultiFormatReader.listVideoInputDevices();
            const backCam = devices.find((d: MediaDeviceInfo) => /back|rear|environment/i.test(d.label)) || devices[devices.length - 1];
            const selectedId = backCam ? backCam.deviceId : undefined;
            const controls = await reader.decodeFromVideoDevice(selectedId, video, (result, err) => {
              if (result) {
                handleBarcodeDetected(result.getText());
              }
            });
            zxingReaderRef.current = reader;
            zxingControlsRef.current = controls;
            setHtml5QrcodeScanner(null);
            setIsCameraActive(true);
            setIsScanning(false);
            setCameraError('');
            console.log('✅ ZXing fallback initialized');
            return;
          }
        } catch (zxErr) {
          console.warn('ZXing fallback failed:', zxErr);
        }
      }

      setCameraError(errorMessage);
      setIsScanning(false);
      setIsCameraActive(false);
      setScanMode('manual');
    }
  };
  
  const handleBarcodeDetected = async (detectedCode: string) => {
    console.log("📱 Barcode detected:", detectedCode);
    
    // Stop scanning after successful detection
    setIsScanning(false);
    
    // Set scan input and validate
    setScanInput(detectedCode);
    const validation = validateScan(detectedCode);
    setIsScanValid(validation.valid);
    setScanValidationMessage(validation.message);
    
    if (validation.valid) {
      // Automatically process successful scan with API
      try {
        console.log('🔍 Auto-searching for shipment:', detectedCode);
        const searchResponse = await driverService.searchShipments(detectedCode);
        console.log('✅ Auto-search results:', searchResponse);

        if (searchResponse.shipments && searchResponse.shipments.length > 0) {
          const shipment = searchResponse.shipments[0];
          const packageData = {
            trackingNumber: shipment.tracking_code,
            customerName: shipment.receiver_name,
            address: `${shipment.receiver_address}, ${shipment.receiver_city}, ${shipment.receiver_province} ${shipment.receiver_postal_code}`,
            packageType: shipment.package_type || "Standard",
            weight: `${shipment.weight} kg`,
            estimatedDelivery: shipment.estimated_delivery_date || "TBD",
            currentStatus: shipment.status as any,
            specialInstructions: shipment.special_instructions || ""
          };
          setScannedPackageData(packageData);
        } else {
          setScanError("Package not found. Please check the tracking number.");
        }
      } catch (error: any) {
        console.error('❌ Auto-search error:', error);
        setScanError(error.message || "Failed to search for package.");
      }
    }
  };
  
  const handleCameraError = (error: Error) => {
    console.error("📹 Camera error:", error);
    setCameraError(error.message || "Camera error occurred");
    setIsCameraActive(false);
    setIsScanning(false);
    // Auto-fallback to manual input
    setScanMode('manual');
  };

  const handleCameraRefresh = async () => {
    try {
      setIsScanning(true);
      // Ensure camera mode so the container mounts
      if (scanMode !== 'camera') {
        setScanMode('camera');
        // Wait for the container to mount
        await waitForElementById('parcego-camera-scanner-container', 3000);
      }
      await handleCameraStop();
      await handleCameraStart();
    } catch (err) {
      console.warn("⚠️ Camera refresh failed:", err);
      setIsScanning(false);
    }
  };

  // Scan package functions will be defined after handleCameraStop

  const handleScanSubmit = async () => {
    if (!scanInput || scanInput.trim().length === 0) {
      setScanError("Please enter or scan a barcode");
      return;
    }

    try {
      // Set loading state
      setIsScanning(true);
      setScanError("");

      // Search for the shipment using the API
      console.log('🔍 Searching for shipment:', scanInput.trim());
      const searchResponse = await driverService.searchShipments(scanInput.trim());
      console.log('✅ Shipment search results:', searchResponse);

      // Check if any shipments were found
      if (!searchResponse.shipments || searchResponse.shipments.length === 0) {
        setScanError("Package not found. Please check the tracking number and try again.");
        setIsScanning(false);
        return;
      }

      // Get the first matching shipment
      const shipment = searchResponse.shipments[0];

      // Map API data to scanned package data
      const packageData = {
        trackingNumber: shipment.tracking_code,
        customerName: shipment.receiver_name,
        address: `${shipment.receiver_address}, ${shipment.receiver_city}, ${shipment.receiver_province} ${shipment.receiver_postal_code}`,
        packageType: shipment.package_type || "Standard",
        weight: `${shipment.weight} kg`,
        estimatedDelivery: shipment.estimated_delivery_date || "TBD",
        currentStatus: shipment.status as any,
        specialInstructions: shipment.special_instructions || ""
      };

      setScannedPackageData(packageData);
    setScanError("");
      setIsScanning(false);
      console.log(`✅ Package scanned successfully: ${scanInput}`);
    } catch (error: any) {
      console.error('❌ Error searching for shipment:', error);
      setScanError(error.message || "Failed to search for package. Please try again.");
      setIsScanning(false);
    }
  };

  const validateScan = (input: string) => {
    if (!input || input.trim().length === 0) {
      return { valid: false, message: "" };
    }

    // Basic validation for tracking numbers
    if (input.length >= 6) {
      return { 
        valid: true, 
        message: "Valid tracking number format" 
      };
    }

    return { 
      valid: false, 
      message: "Tracking number too short (minimum 6 characters)" 
    };
  };


  return (
    <div 
      className="min-h-screen bg-gray-50 pb-24 md:pb-28"
      id="parcego-courier-dashboard-container"
      style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
    >
      {/* Glass Blur Notification Banner */}
      <NotificationBanner
        id="parcego-courier-dashboard-notification-banner"
        type={notificationBanner.type}
        title={notificationBanner.title}
        message={notificationBanner.message}
        isVisible={showNotificationBanner}
        onDismiss={() => setShowNotificationBanner(false)}
        showDismissButton={true}
        className="animate-in slide-in-from-top duration-500 ease-out"
      />

      {/* Enhanced Courier Header */}
      <div 
        className={`bg-white shadow-sm border-b px-4 py-3 transition-all duration-300 ease-out ${
          showNotificationBanner ? 'mt-16' : 'mt-0'
        }`}
        id="parcego-courier-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/Logo/Horizontal-logo.svg"
              alt="Parcego Logo"
              width={120}
              height={24}
              className="h-6 w-auto"
              id="parcego-courier-logo"
              priority
            />
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="parcego-header__notification-btn h-9 w-9 md:h-10 md:w-10 relative"
              id="parcego-courier-notifications-btn"
              onClick={handleNotificationClick}
              aria-label={`Notifications ${unreadNotificationsCount > 0 ? `(${unreadNotificationsCount} unread)` : ''}`}
            >
              <Icon name="Bell" size={18} className="md:w-5 md:h-5" />
              {unreadNotificationsCount > 0 && (
                <div 
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] parcego-notification-badge"
                  id="parcego-courier-notification-badge"
                >
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </div>
              )}
            </Button>
            
            {/* Profile Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="parcego-header__profile-btn h-9 w-9 md:h-10 md:w-10 rounded-full"
                  id="parcego-courier-profile-menu-btn"
                  aria-label="Profile menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-medium">
                      {currentUser 
                        ? `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser 
                        ? `${currentUser.first_name} ${currentUser.last_name}`
                        : 'Courier'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email || ''}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => router.push('/courier/profile')}
                  className="cursor-pointer"
                  id="parcego-courier-profile-menu-item"
                >
                  <Icon name="User" size={16} className="mr-2" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  id="parcego-courier-logout-menu-item"
                >
                  <Icon name="LogOut" size={16} className="mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Greeting & Progress Banner */}
        <Card 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow"
          id="parcego-courier-greeting-banner"
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-blue-100 rounded-full flex-shrink-0">
                <Icon name="Sun" size={20} className="md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg/7 md:text-xl/8 font-bold text-blue-900 mb-1 tracking-tight antialiased">
                  Good Morning, {currentUser?.first_name || 'Courier'}!
                </h3>
                <p className="text-sm md:text-base text-blue-700">
                  You have {stats.remaining} deliveries remaining today. 
                  {stats.completed > 0 ? ` Great job completing ${stats.completed} deliveries!` : ' Ready to start your deliveries!'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl md:text-2xl font-bold text-blue-900">{stats.completed}/{stats.deliveriesToday}</p>
                <p className="text-xs md:text-sm text-blue-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>




        {/* Main Content */}
        <div 
          className="space-y-4"
          id="parcego-courier-main-content"
        >
          {/* Overview Content */}
          {activeTab === "overview" && (
            <div className="space-y-4">

              {/* Delivery Progress Card */}
              <Card className="border-l-4 border-l-emerald-500 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontWeight: 700 }}>
                      Delivery Progress
                    </h3>
                    <span className="text-2xl font-bold text-gray-900" style={{ fontWeight: 700 }}>
                      {activeDeliveryId ? deliveryProgress : Math.round((stats.completed / stats.deliveriesToday) * 100)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar with Gradient */}
                  <div className="relative w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${activeDeliveryId ? deliveryProgress : Math.round((stats.completed / stats.deliveriesToday) * 100)}%`,
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                      }}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600" style={{ fontWeight: 700 }}>
                    {activeDeliveryId ? (
                      <>Next: {sortedDeliveries[0]?.customerName} - {sortedDeliveries[0]?.address}</>
                    ) : (
                      <>All deliveries completed</>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Progress Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4 text-center">
                    <div className="p-2 bg-blue-100 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Icon name="Package" size={20} className="text-blue-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
                    <p className="text-sm text-gray-500">Completed Today</p>
                    <div className="mt-2 text-xs text-blue-600">
                      <Icon name="CheckCircle" size={12} className="mr-1 inline" />
                      {Math.round((stats.completed / stats.deliveriesToday) * 100)}% of total
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4 text-center">
                    <div className="p-2 bg-orange-100 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Icon name="Clock" size={20} className="text-orange-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stats.remaining}</p>
                    <p className="text-sm text-gray-500">Remaining Today</p>
                    <div className="mt-2 text-xs text-orange-600">
                      <Icon name="Target" size={12} className="mr-1 inline" />
                      Ready to deliver
                    </div>
                  </CardContent>
                </Card>
              </div>


              {/* Quick Tips */}
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg mt-1">
                      <Icon name="Lightbulb" size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-900 mb-1">Today&apos;s Tip</h4>
                      <p className="text-sm text-amber-800">
                        Remember to scan packages before pickup and take photos for proof of delivery. 
                        This helps maintain accurate tracking and customer satisfaction.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {/* Deliveries Content - Redesigned for Courier Efficiency */}
          {activeTab === "deliveries" && (
            <div className="space-y-4">
              <Card 
                className="parcego-deliveries-card shadow-sm"
                id="parcego-courier-deliveries-list"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900">Today&apos;s Deliveries</CardTitle>
                    <Badge 
                      variant="secondary"
                      className="parcego-badge parcego-badge--remaining bg-blue-100 text-blue-700 font-medium"
                      id="parcego-courier-remaining-count"
                    >
                      {stats.remaining} remaining
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-2">
                  {sortedDeliveries.map((delivery, index) => (
                    <div
                      key={delivery.id}
                      className={`border rounded-lg p-4 parcego-delivery-card ${
                        delivery.status === 'delivered' ? 'opacity-60' : (index === 0 ? 'shadow-sm border-blue-200' : 'opacity-60')
                      } ${delivery.status !== 'delivered' && delivery.id !== activeDeliveryId ? 'pointer-events-none select-none' : ''}`}
                      id={`parcego-delivery-card-${delivery.id}`}
                      style={{
                        transition: 'all 0.2s ease-out',
                      }}
                      aria-disabled={delivery.status !== 'delivered' && delivery.id !== activeDeliveryId}
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        {/* Refined Status Indicator */}
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(delivery.status)} ring-2 ring-opacity-30 ${getStatusColor(delivery.status).replace('bg-', 'ring-')}`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <h3 
                              className="text-lg font-bold text-gray-900 mr-auto"
                              id={`parcego-delivery-customer-${delivery.id}`}
                            >
                              {delivery.customerName}
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              <Badge 
                                className={`text-xs ${getStatusColor(delivery.status)} text-white parcego-status-badge`}
                                id={`parcego-delivery-status-${delivery.id}`}
                              >
                                {getStatusText(delivery.status)}
                              </Badge>
                              <Badge 
                                className={`text-xs ${getPriorityColor(delivery.priority)} text-white`}
                                variant="secondary"
                              >
                                {delivery.priority}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2.5">
                            <p 
                              className="text-sm text-gray-700 flex items-center font-medium"
                              id={`parcego-delivery-address-${delivery.id}`}
                            >
                              <Icon name="MapPin" size={16} className="mr-2 text-blue-500" />
                              {delivery.address}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 font-medium mt-1">
                              <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                <Icon name="Package" size={12} className="mr-1.5 text-gray-500" />
                                {delivery.packageType}
                              </span>
                              <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                <Icon name="Scale" size={12} className="mr-1.5 text-gray-500" />
                                {delivery.weight}
                              </span>
                              <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                <Icon name="Barcode" size={12} className="mr-1.5 text-gray-500" />
                                {delivery.trackingNumber.slice(-6)}
                              </span>
                            </div>
                          </div>
                          
                          {delivery.specialInstructions && (
                            <div className="mt-3 p-3 bg-amber-50 rounded-md border border-amber-200">
                              <p 
                                className="text-sm text-amber-800 flex items-start"
                                id={`parcego-delivery-instructions-${delivery.id}`}
                              >
                                <Icon name="AlertCircle" size={14} className="mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                                <span><span className="font-semibold">Special Instructions:</span> {delivery.specialInstructions}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex justify-center">
                        {delivery.status === 'delivered' ? (
                          <div className="flex-1 flex items-center justify-center h-11 bg-emerald-50 border-2 border-emerald-200 rounded-md">
                            <div className="flex items-center text-emerald-700 font-medium">
                              <Icon name="CheckCircle" size={16} className="mr-2" />
                              Delivered
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="default"
                            onClick={() => handleStartRoute(delivery.id)}
                            className={`w-full h-11 parcego-delivery-action-btn ${delivery.id === activeDeliveryId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 text-gray-500'} `}
                            id={`parcego-route-btn-${delivery.id}`}
                            disabled={delivery.id !== activeDeliveryId}
                            aria-disabled={delivery.id !== activeDeliveryId}
                          >
                            <Icon name="Route" size={16} className="mr-2" />
                            Navigate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>

      {/* Native-Style Bottom Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg shadow-gray-900/10 z-[100]"
        id="parcego-courier-bottom-nav"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex justify-around items-center px-2 pt-2 pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`
              flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out
              parcego-nav-btn parcego-nav-btn--overview group
              ${activeTab === "overview" 
                ? "bg-blue-100/80 text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
              }
            `}
            id="parcego-nav-overview-btn"
            type="button"
          >
            <div className={`
              transition-all duration-200 ease-out
              ${activeTab === "overview" ? "transform scale-110" : "group-active:scale-95"}
            `}>
              <Icon 
                name="Home" 
                size={20} 
                className={`
                  ${activeTab === "overview" ? "text-blue-600" : "text-current"}
                `} 
              />
            </div>
            <span className={`
              text-xs font-medium mt-1 transition-all duration-200 ease-out
              ${activeTab === "overview" ? "text-blue-600" : "text-current"}
            `}>
              Overview
            </span>
            {activeTab === "overview" && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("deliveries")}
            className={`
              flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out
              parcego-nav-btn parcego-nav-btn--deliveries group
              ${activeTab === "deliveries" 
                ? "bg-blue-100/80 text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
              }
            `}
            id="parcego-nav-deliveries-btn"
            type="button"
          >
            <div className={`
              relative transition-all duration-200 ease-out
              ${activeTab === "deliveries" ? "transform scale-110" : "group-active:scale-95"}
            `}>
              <Icon 
                name="Package" 
                size={20} 
                className={`
                  ${activeTab === "deliveries" ? "text-blue-600" : "text-current"}
                `} 
              />
              {/* Delivery count badge */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {stats.remaining}
              </div>
            </div>
            <span className={`
              text-xs font-medium mt-1 transition-all duration-200 ease-out
              ${activeTab === "deliveries" ? "text-blue-600" : "text-current"}
            `}>
              Deliveries
            </span>
            {activeTab === "deliveries" && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => router.push('/courier/performance')}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out parcego-nav-btn parcego-nav-btn--performance group text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
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
            onClick={() => router.push('/courier/profile')}
            className={`
              flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out
              parcego-nav-btn parcego-nav-btn--profile group
              text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95
            `}
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

      {/* Off-Canvas Notification Modal */}
      {isNotificationModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-[200] transition-opacity duration-300 ease-out"
            id="parcego-courier-notification-backdrop"
            onClick={handleNotificationClose}
            aria-hidden="true"
          />
          <div 
            className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-[201] transform transition-transform duration-300 ease-out animate-in slide-in-from-left flex flex-col"
            id="parcego-courier-notification-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="parcego-notification-modal-title"
          >
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <h2 
                className="text-lg font-semibold text-gray-900"
                id="parcego-notification-modal-title"
              >
                Notifications
                {unreadNotificationsCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {unreadNotificationsCount} new
                  </span>
                )}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                id="parcego-courier-notification-close-btn"
                onClick={handleNotificationClose}
                aria-label="Close notifications"
              >
                <Icon name="X" size={18} />
              </Button>
            </div>
            
            {/* Scrollable Content Area with Hidden Scrollbar */}
            <div 
              className="flex-1 overflow-y-auto overflow-x-hidden"
              style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* Internet Explorer 10+ */
                WebkitOverflowScrolling: 'touch', /* iOS smooth scrolling */
              }}
              id="parcego-courier-notification-scroll-area"
            >
              <style jsx>{`
                #parcego-courier-notification-scroll-area::-webkit-scrollbar {
                  display: none; /* Safari and Chrome */
                }
              `}</style>
              
              {notifications.length === 0 ? (
                <div 
                  className="flex flex-col items-center justify-center p-8 text-center"
                  id="parcego-notification-empty-state"
                >
                  <div className="p-3 bg-gray-100 rounded-full mb-4">
                    <Icon name="Bell" size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-sm text-gray-500">You&apos;re all caught up! New notifications will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                        notification.status === 'unread' ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      id={`parcego-notification-item-${notification.id}`}
                      onClick={() => handleNotificationItemClick(notification.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNotificationItemClick(notification.id);
                        }
                      }}
                      aria-label={`Notification: ${notification.title}. ${notification.status === 'unread' ? 'Unread' : 'Read'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          notification.priority === 'high' 
                            ? 'bg-red-100' 
                            : notification.priority === 'normal' 
                            ? 'bg-blue-100' 
                            : 'bg-gray-100'
                        }`}>
                          <Icon 
                            name={getNotificationIcon(notification.icon)} 
                            size={16} 
                            className={getPriorityColor(notification.priority)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className={`text-sm font-medium ${
                              notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            {notification.status === 'unread' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1" />
                            )}
                          </div>
                          <p className={`text-sm ${
                            notification.status === 'unread' ? 'text-gray-700' : 'text-gray-500'
                          } line-clamp-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatNotificationTime(notification.timestamp)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.category === 'assignment' 
                                ? 'bg-orange-100 text-orange-700'
                                : notification.category === 'status'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {notification.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Fixed Action Buttons at Bottom */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0 relative z-[100]">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    id="parcego-courier-mark-all-read-btn"
                    onClick={handleMarkAllRead}
                    disabled={unreadNotificationsCount === 0}
                  >
                    <Icon name="CheckCircle" size={16} className="mr-2" />
                    Mark All Read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    id="parcego-courier-clear-all-btn"
                    onClick={handleClearAll}
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Scan Package Modal */}
      {isScanPackageModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-[200] transition-opacity duration-300 ease-out"
            id="parcego-courier-scan-package-backdrop"
            onClick={handleScanPackageClose}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div 
            className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-[201] transform transition-transform duration-300 ease-out animate-in slide-in-from-left"
            id="parcego-courier-scan-package-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="parcego-scan-package-modal-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 
                className="text-lg font-semibold text-gray-900 flex items-center"
                id="parcego-scan-package-modal-title"
              >
                <Icon name="Camera" size={20} className="text-purple-600 mr-2" />
                Scan Package
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                  id="parcego-courier-scan-package-refresh-btn"
                  onClick={handleCameraRefresh}
                  aria-label="Refresh camera"
                >
                  <Icon name="RotateCcw" size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                  id="parcego-courier-scan-package-close-btn"
                  onClick={handleScanPackageClose}
                  aria-label="Close scan package modal"
                >
                  <Icon name="X" size={18} />
                </Button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {!scannedPackageData ? (
                /* Camera/Scan Interface */
                <div className="flex flex-col h-full">
                  {scanMode === 'camera' ? (
                    /* Camera Scanning Interface */
                    <div className="flex flex-col">
                      {/* Camera Container - Fixed Height */}
                      <div className="relative bg-gray-900 h-[45vh] overflow-hidden rounded-t-lg">
                        {/* HTML5-QRCode Scanner Container */}
                        <div 
                          id="parcego-camera-scanner-container"
                          className={`w-full h-full bg-gray-900 ${(!isCameraActive && !isScanning) ? 'hidden' : ''}`}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            flexDirection: 'column'
                          }}
                        >
                          {/* Fallback content while scanner loads */}
                          <div className="text-center text-gray-300 p-4">
                            <Icon name="Camera" size={48} className="mx-auto mb-3 animate-pulse text-white" />
                            <p className="text-lg font-semibold mb-2 text-white">Initializing Camera...</p>
                            <p className="text-sm opacity-75 text-gray-300">Please allow camera access when prompted</p>
                          </div>
                        </div>

                        {/* Scanning Instructions - Fixed Position */}
                        {isCameraActive && (
                          <div className="absolute top-4 left-4 right-4 z-20">
                            <div className="bg-blue-600/95 backdrop-blur-sm text-white px-4 py-3 rounded-lg text-sm font-medium shadow-lg">
                              <div className="flex items-center">
                                <Icon name="Info" size={16} className="mr-2 flex-shrink-0" />
                                <span>Position the barcode or QR code within the scanning area below</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Scanning Area Overlay - Centered and Clear */}
                        {isCameraActive && !isScanning && !cameraError && (
                          <div
                            id="parcego-camera-scan-overlay"
                            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-10"
                            aria-hidden="true"
                          >
                            {/* Scanning Area Box */}
                            <div
                              className="relative border-2 border-blue-500 bg-blue-500/10 rounded-2xl shadow-2xl"
                              style={{ width: `${scanBoxSize}px`, height: `${scanBoxSize}px` }}
                              aria-hidden="true"
                            >
                              {/* Corner markers - Enhanced */}
                              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl" />
                              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl" />
                              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl" />
                              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-2xl" />
                              
                              {/* Scanning animation line */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
                              </div>
                            </div>
                            
                            {/* Scanning Status - Below the box */}
                            <div className="mt-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm font-medium text-gray-800">Scanning for barcode...</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Loading Overlay while scanning starts */}
                        {isScanning && (
                          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-20">
                            <div className="text-center py-8">
                              <div className="p-4 bg-blue-100 rounded-full mb-4 w-20 h-20 mx-auto flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2">Starting Camera...</h3>
                              <p className="text-sm text-gray-300">Please allow camera access when prompted</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Error State */}
                      {cameraError && (
                        <div className="flex-1 flex items-center justify-center p-6">
                          <div className="text-center">
                            <div className="p-4 bg-red-100 rounded-full mb-4 w-20 h-20 mx-auto flex items-center justify-center">
                              <Icon name="AlertTriangle" size={36} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-red-600 mb-2">Camera Unavailable</h3>
                            <p className="text-sm text-gray-600 mb-6">{cameraError}</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button
                                onClick={handleCameraStart}
                                variant="outline"
                                className="w-full sm:w-auto"
                              >
                                <Icon name="RotateCcw" size={16} className="mr-2" />
                                Retry Camera
                              </Button>
                              <Button
                                onClick={() => setScanMode('manual')}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Icon name="Edit" size={16} className="mr-2" />
                                Enter Manually
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Section - Actions */}
                      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
                        {/* Action Buttons - Consistent styling */}
                        <div className="flex flex-col gap-3">
                          {!cameraError && !isScanning && (
                            <Button
                              onClick={() => setScanMode('manual')}
                              variant="outline"
                              className="w-full justify-center py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            >
                              <Icon name="Edit" size={16} className="mr-2" />
                              Enter Tracking Number Manually
                            </Button>
                          )}
                          
                          {cameraError && (
                            <Button
                              onClick={() => {
                                setScanMode('camera');
                                setCameraError('');
                                setTimeout(() => handleCameraStart(), 100);
                              }}
                              variant="outline"
                              className="w-full justify-center py-3 text-blue-700 hover:text-blue-900 hover:bg-blue-50"
                            >
                              <Icon name="Camera" size={16} className="mr-2" />
                              Try Camera Again
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Manual Input Mode */
                    <div className="flex flex-col flex-1">
                      {/* Header Section */}
                      <div className="text-center py-6 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="p-4 bg-blue-100 rounded-full mb-4 w-20 h-20 mx-auto flex items-center justify-center">
                          <Icon name="Edit" size={32} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Manual Entry</h3>
                        <p className="text-sm text-gray-600">Enter the package tracking number manually</p>
                      </div>

                      {/* Input Section */}
                      <div className="flex-1 p-4 space-y-4">
                        <div className="space-y-3">
                          <label htmlFor="scan-input" className="text-sm font-semibold text-gray-700 block">
                            Tracking Number
                          </label>
                          <Input
                            id="scan-input"
                            value={scanInput}
                            onChange={(e) => {
                              const value = e.target.value;
                              setScanInput(value);
                              setScanError("");
                              
                              // Auto-validate as user types
                              const validation = validateScan(value);
                              setIsScanValid(validation.valid);
                              setScanValidationMessage(validation.message);
                            }}
                            placeholder="Enter tracking number (e.g., PCG789123456)"
                            className="w-full text-lg py-4 px-4 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            autoFocus
                          />
                          
                          {/* Validation status display */}
                          {scanInput && (
                            <div className="space-y-2">
                              {isScanValid ? (
                                <Alert className="border-green-200 bg-green-50">
                                  <Icon name="CheckCircle" size={16} className="text-green-600" />
                                  <AlertDescription className="text-green-800">
                                    <div className="font-bold">{scanValidationMessage}</div>
                                  </AlertDescription>
                                </Alert>
                              ) : scanValidationMessage && !isScanValid ? (
                                <Alert variant="destructive">
                                  <Icon name="AlertTriangle" size={16} />
                                  <AlertDescription>{scanValidationMessage}</AlertDescription>
                                </Alert>
                              ) : (
                                <div className="text-sm text-gray-500">
                                  <div className="flex items-center mb-1">
                                    <Icon name="Info" size={14} className="mr-1" />
                                    <span className="font-medium">Enter a tracking number to validate</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {scanError && (
                            <Alert variant="destructive">
                              <Icon name="AlertTriangle" size={16} />
                              <AlertDescription>{scanError}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                      
                      {/* Bottom Section - Actions */}
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex flex-col gap-3">
                          <Button
                            onClick={() => {
                              setScanMode('camera');
                              setScanInput("");
                              setScanError("");
                              setTimeout(() => handleCameraStart(), 100);
                            }}
                            variant="outline"
                            className="w-full justify-center py-3 text-blue-700 hover:text-blue-900 hover:bg-blue-50"
                          >
                            <Icon name="Camera" size={16} className="mr-2" />
                            Switch to Camera Scanning
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Package Details Display */
                <div className="flex flex-col flex-1">
                  {/* Success Header */}
                  <div className="text-center py-6 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="p-4 bg-green-100 rounded-full mb-4 w-20 h-20 mx-auto flex items-center justify-center">
                      <Icon name="CheckCircle" size={36} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-600 mb-2">Package Found!</h3>
                    <p className="text-sm text-gray-600">Package details loaded successfully</p>
                  </div>

                  {/* Package Details Card */}
                  <div className="flex-1 p-4">
                    <Card className="border-green-200 bg-green-50/30 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="flex items-center">
                            <Icon name="Package" size={20} className="mr-2 text-green-600" />
                            Package Details
                          </span>
                          <Badge className="bg-blue-600 text-white px-3 py-1">
                            {scannedPackageData.currentStatus.replace(/_/g, " ").toUpperCase()}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4">
                          <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                            <Icon name="Hash" size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700">Tracking Number</p>
                              <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded mt-1">{scannedPackageData.trackingNumber}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                            <Icon name="User" size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700">Customer</p>
                              <p className="text-sm text-gray-600 mt-1">{scannedPackageData.customerName}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                            <Icon name="MapPin" size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700">Delivery Address</p>
                              <p className="text-sm text-gray-600 mt-1">{scannedPackageData.address}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                            <Icon name="Package" size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700">Package Type</p>
                              <p className="text-sm text-gray-600 mt-1">{scannedPackageData.packageType}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                            <Icon name="Scale" size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700">Weight</p>
                              <p className="text-sm text-gray-600 mt-1">{scannedPackageData.weight}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                            <Icon name="Clock" size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700">Estimated Delivery</p>
                              <p className="text-sm text-gray-600 mt-1">{scannedPackageData.estimatedDelivery}</p>
                            </div>
                          </div>

                          {scannedPackageData.specialInstructions && (
                            <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <Icon name="AlertCircle" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-amber-800">Special Instructions</p>
                                <p className="text-sm text-amber-700 mt-1">{scannedPackageData.specialInstructions}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bottom Section - Actions */}
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={handleScanPackageClose}
                        className="w-full justify-center py-3 bg-green-600 hover:bg-green-700 text-white font-semibold"
                      >
                        <Icon name="CheckCircle" size={16} className="mr-2" />
                        Continue with Delivery
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Only for Manual Mode Submit */}
            {!scannedPackageData && scanMode === 'manual' && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleScanPackageClose}
                    className="flex-1 h-12 font-semibold"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={handleScanSubmit}
                    className="flex-1 h-12 transition-all duration-200 font-bold bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!scanInput || scanInput.trim().length === 0}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon name="Search" size={16} />
                      <span>Find Package</span>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}

export default ClientOnlyCourierDashboard;
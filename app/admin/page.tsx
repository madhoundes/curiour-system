"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RangeCalendar } from "@/components/ui/range-calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import type { DateRange } from "react-day-picker";
import { exportAnalyticsToCSV, AnalyticsData } from "@/lib/export-utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { exportAnalyticsToPDF as exportPDF } from "@/lib/pdf-export";
import { useToast, ToastContainer } from "@/components/ui/toast";
import NotificationDropdown from "@/components/admin/NotificationDropdown";
import CourierCreationModal from "@/components/admin/CourierCreationModal";
import { adminService } from "@/lib/api/admin";
import type { User, UserStatisticsResponse } from "@/lib/api/types";

// Zod schema for courier edit form validation
const courierEditSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number").min(10, "Phone number must be at least 10 characters"),
  status: z.enum(["active", "inactive", "suspended"]).refine(val => val, {
    message: "Please select a status"
  }),
  city: z.string().min(2, "City must be at least 2 characters").max(50, "City must be less than 50 characters"),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional()
});

type CourierEditFormData = z.infer<typeof courierEditSchema>;

// Responsive hook for detecting screen sizes
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLandscape: false,
  });

  const updateScreenSize = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    setScreenSize({
      width,
      height,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isLandscape: width > height,
    });
  }, []);

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, [updateScreenSize]);

  return screenSize;
};

export default function SuperAdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const [merchantSearchQuery, setMerchantSearchQuery] = useState("");
  const [isMerchantSearchLoading, setIsMerchantSearchLoading] = useState(false);
  const [merchants, setMerchants] = useState<User[]>([]);
  const [merchantsLoading, setMerchantsLoading] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<User | null>(null);
  const [merchantStats, setMerchantStats] = useState<{
    totalShipments: number;
    delivered: number;
    inTransit: number;
    inWarehouse: number;
  } | null>(null);
  
  // Admin statistics from API
  const [adminStats, setAdminStats] = useState<{
    totalShipments: number;
    deliveredShipments: number;
    inTransitShipments: number;
    inWarehouseShipments: number;
    cancelledShipments: number;
    undeliveredShipments: number;
    draftShipments: number;
    paidShipments: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Assignments state
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<any>(null);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [selectedAssignmentDate, setSelectedAssignmentDate] = useState<Date>(new Date());
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isManualAssignmentOpen, setIsManualAssignmentOpen] = useState(false);
  
  // Warehouse state
  const [isMovingToWarehouse, setIsMovingToWarehouse] = useState(false);
  const [isRunningAutomation, setIsRunningAutomation] = useState(false);

  // Modal state for merchant approval/suspension
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'suspend' | null>(null);
  const [selectedMerchantForAction, setSelectedMerchantForAction] = useState<User | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Merchant details modal state
  const [isEditingMerchant, setIsEditingMerchant] = useState(false);
  const [editFormData, setEditFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    status: 'active' as 'active' | 'pending' | 'suspended',
    joinDate: ''
  });
  const [isSavingMerchant, setIsSavingMerchant] = useState(false);
  const [merchantFormErrors, setMerchantFormErrors] = useState<Record<string, string>>({});

  // Shopify integration state
  const [isConnectingShopify, setIsConnectingShopify] = useState(false);
  const [isDisconnectingShopify, setIsDisconnectingShopify] = useState(false);
  const [isSyncingShopify, setIsSyncingShopify] = useState(false);


  const router = useRouter();

  // Responsive hook
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Toast management
  const { toasts, showSuccessToast, showErrorToast, dismissToast } = useToast();
  
  // Admin user information from localStorage
  const [adminName, setAdminName] = useState<string>("Admin User");
  const [adminEmail, setAdminEmail] = useState<string>("admin@parcego.com");

  // Mock data for merchants
  // Helper function to get merchant properties
  const getMerchantProperty = (merchant: User, property: string): string | number | boolean => {
    switch (property) {
      case 'businessName':
        return merchant.business_name;
      case 'contactName':
        return `${merchant.first_name} ${merchant.last_name}`.trim();
      case 'status':
        return merchant.is_active ? (merchant.is_verified ? 'active' : 'pending') : 'suspended';
      case 'joinDate':
        return merchant.created_at;
      case 'totalShipments':
        return 0; // TODO: Will come from shipment stats API
      default:
        return '';
    }
  };
  
  // Removed merchants - now using real data from API
  
  // Merchant search functionality
  const [filteredMerchants, setFilteredMerchants] = useState<User[]>([]);
  
  // Load merchants from API
  useEffect(() => {
    const loadMerchants = async () => {
      if (!isAuthenticated) return;
      
      try {
        setMerchantsLoading(true);
        const response = await adminService.listUsers({});
        const merchantsList = response.data.filter(u => u.role === 'user');
        setMerchants(merchantsList);
        setFilteredMerchants(merchantsList);
      } catch (error) {
        console.error('Failed to load merchants:', error);
        showErrorToast(
          "Unable to fetch merchant data. Please try refreshing the page."
        );
      } finally {
        setMerchantsLoading(false);
      }
    };

    loadMerchants();
  }, [isAuthenticated]);
  
  // Load admin statistics from API
  useEffect(() => {
    const loadAdminStats = async () => {
      if (!isAuthenticated) return;
      
      try {
        setStatsLoading(true);
        const response = await adminService.getAdminStatistics();
        const stats = response.data;
        
        setAdminStats({
          totalShipments: stats.total_shipments,
          deliveredShipments: stats.delivered_shipments,
          inTransitShipments: stats.in_transit_shipments,
          inWarehouseShipments: stats.in_warehouse_shipments,
          cancelledShipments: stats.cancelled_shipments,
          undeliveredShipments: stats.undelivered_shipments,
          draftShipments: stats.draft_shipments,
          paidShipments: stats.paid_shipments
        });
      } catch (error) {
        console.error('Failed to load admin statistics:', error);
        showErrorToast(
          "Unable to fetch admin statistics. Please try refreshing the page."
        );
      } finally {
        setStatsLoading(false);
      }
    };

    loadAdminStats();
  }, [isAuthenticated]);
  
  // Load assignments when date changes
  useEffect(() => {
    const loadAssignments = async () => {
      if (!isAuthenticated) return;
      
      try {
        setAssignmentsLoading(true);
        const dateStr = format(selectedAssignmentDate, 'yyyy-MM-dd');
        
        // Fetch assignments for the selected date
        const assignmentsResponse = await adminService.getAssignmentsByDate(dateStr);
        setAssignments(assignmentsResponse.data.assignments || []);
        
        // Fetch statistics for the selected date
        const statsResponse = await adminService.getAssignmentStatistics(dateStr);
        setAssignmentStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to load assignments:', error);
        showErrorToast("Unable to fetch assignment data. Please try again.");
      } finally {
        setAssignmentsLoading(false);
      }
    };

    loadAssignments();
  }, [isAuthenticated, selectedAssignmentDate]);

  // Real courier data from API
  const [couriers, setCouriers] = useState<User[]>([]);
  const [couriersLoading, setCouriersLoading] = useState(false);
  const [couriersError, setCouriersError] = useState<string | null>(null);

  // Compatibility helper for legacy property names
  const getCourierProperty = (courier: User, property: string): string | number | boolean | string[] | null => {
    switch (property) {
      case 'completedDeliveries':
        return 0; // Will be updated when statistics API is integrated
      case 'vehicle':
        return 'car'; // Default value, will be updated when vehicle info is available
      case 'lastLogin':
        return courier.created_at;
      case 'joinDate':
        return courier.created_at;
      case 'tags':
        return [];
      case 'fullName':
        return `${courier.first_name || ''} ${courier.last_name || ''}`.trim() || 'Unknown User';
      case 'phone':
        return '+1 (555) 000-0000'; // Placeholder until phone field is available
      case 'city':
        return 'Vancouver'; // Default city, will be updated when location info is available
      case 'rating':
        return 0;
      case 'notes':
        return '';
      case 'status':
        return courier.is_active ? 'active' : 'inactive';
      default:
        const value = courier[property as keyof User];
        return value !== undefined && value !== null ? String(value) : '';
    }
  };
  
  // Merchant search functionality

  // Courier state management
  const [courierSearchQuery, setCourierSearchQuery] = useState("");
  const [isCourierSearchLoading, setIsCourierSearchLoading] = useState(false);
  const [filteredCouriers, setFilteredCouriers] = useState<User[]>([]);
  const [expandedCourierCards, setExpandedCourierCards] = useState<Set<string>>(new Set());

  // Modal state for courier approval/suspension
  const [courierActionModalOpen, setCourierActionModalOpen] = useState(false);
  const [courierActionType, setCourierActionType] = useState<'approve' | 'suspend' | null>(null);
  const [selectedCourierForAction, setSelectedCourierForAction] = useState<User | null>(null);
  const [courierActionNotes, setCourierActionNotes] = useState("");
  const [isProcessingCourierAction, setIsProcessingCourierAction] = useState(false);

  // Undo functionality state
  const [lastCourierAction, setLastCourierAction] = useState<{
    courier: User;
    previousStatus: string;
    newStatus: string;
    notes?: string;
    timestamp: number;
  } | null>(null);

  // Animation state for status changes
  const [recentlyUpdatedCourierId, setRecentlyUpdatedCourierId] = useState<string | null>(null);

  // Courier edit modal state
  const [isCourierEditOpen, setIsCourierEditOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<User | null>(null);
  const [isSavingCourier, setIsSavingCourier] = useState(false);

  // Courier creation modal state
  const [isCourierCreationOpen, setIsCourierCreationOpen] = useState(false);

  // Debounced search handler
  const handleMerchantSearch = useMemo(() => {
    return (query: string) => {
      setIsMerchantSearchLoading(true);

      // Search merchants
      setTimeout(() => {
        if (!query.trim()) {
          setFilteredMerchants(merchants);
        } else {
          const filtered = merchants.filter((merchant) => {
            const searchTerm = query.toLowerCase();
            const businessName = String(getMerchantProperty(merchant, 'businessName')).toLowerCase();
            const contactName = String(getMerchantProperty(merchant, 'contactName')).toLowerCase();
            const email = merchant.email.toLowerCase();
            const status = String(getMerchantProperty(merchant, 'status')).toLowerCase();
            
            return (
              businessName.includes(searchTerm) ||
              contactName.includes(searchTerm) ||
              email.includes(searchTerm) ||
              status.includes(searchTerm)
            );
          });
          setFilteredMerchants(filtered);
        }
        setIsMerchantSearchLoading(false);
      }, query.trim() ? 300 : 0); // Add delay for actual searches, instant for clearing
    };
  }, [merchants]);

  // Debounced courier search handler
  const handleCourierSearch = useMemo(() => {
    return (query: string) => {
      setIsCourierSearchLoading(true);

      // Simulate async search operation
      setTimeout(() => {
        if (!query.trim()) {
          setFilteredCouriers(couriers);
        } else {
          const filtered = couriers.filter((courier) => {
            const searchTerm = query.toLowerCase();
            const fullName = getCourierProperty(courier, 'fullName');
            const phone = getCourierProperty(courier, 'phone');
            const city = getCourierProperty(courier, 'city');
            const status = courier.is_active ? 'active' : 'inactive';
            
            return (
              (typeof fullName === 'string' && fullName.toLowerCase().includes(searchTerm)) ||
              courier.email.toLowerCase().includes(searchTerm) ||
              (typeof phone === 'string' && phone.toLowerCase().includes(searchTerm)) ||
              status.toLowerCase().includes(searchTerm) ||
              (typeof city === 'string' && city.toLowerCase().includes(searchTerm)) ||
              courier.id.toString().toLowerCase().includes(searchTerm) ||
              (courier.first_name && courier.first_name.toLowerCase().includes(searchTerm)) ||
              (courier.last_name && courier.last_name.toLowerCase().includes(searchTerm)) ||
              (courier.business_name && courier.business_name.toLowerCase().includes(searchTerm))
            );
          });
          setFilteredCouriers(filtered);
        }
        setIsCourierSearchLoading(false);
      }, query.trim() ? 300 : 0); // Add delay for actual searches, instant for clearing
    };
  }, [couriers]);

  // Handle courier search input changes with debouncing
  const handleCourierSearchInputChange = (value: string) => {
    setCourierSearchQuery(value);
    handleCourierSearch(value);
  };

  // Handle search input changes with debouncing
  const handleSearchInputChange = (value: string) => {
    setMerchantSearchQuery(value);
    handleMerchantSearch(value);
  };

  // Clear search functionality
  const handleClearSearch = () => {
    setMerchantSearchQuery("");
    setFilteredMerchants(merchants);
  };

  // Clear courier search functionality
  const handleClearCourierSearch = () => {
    setCourierSearchQuery("");
    setFilteredCouriers(couriers);
  };

  // Handle courier card expansion toggle
  const handleCourierCardToggle = (courierId: string) => {
    setExpandedCourierCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courierId)) {
        newSet.delete(courierId);
      } else {
        newSet.add(courierId);
      }
      return newSet;
    });
  };

  // Handle merchant action modal
  const handleMerchantAction = (merchant: User, action: 'approve' | 'suspend') => {
    setSelectedMerchantForAction(merchant);
    setActionType(action);
    setActionNotes("");
    setActionModalOpen(true);
  };

  // Process merchant approval/suspension
  const processMerchantAction = async () => {
    if (!selectedMerchantForAction || !actionType) return;

    setIsProcessingAction(true);

    try {
      // Update local merchants array (API endpoint not available)
      const updatedMerchants = merchants.map(m =>
        m.id === selectedMerchantForAction.id 
          ? { ...m, is_active: actionType === 'approve', is_verified: actionType === 'approve' }
          : m
      );
      setMerchants(updatedMerchants);
      
      // Update filtered merchants
      const updatedFilteredMerchants = filteredMerchants.map(m =>
        m.id === selectedMerchantForAction.id 
          ? { ...m, is_active: actionType === 'approve', is_verified: actionType === 'approve' }
          : m
      );
      setFilteredMerchants(updatedFilteredMerchants);

      // Close modal and reset state
      setActionModalOpen(false);
      setSelectedMerchantForAction(null);
      setActionType(null);
      setActionNotes("");

      // Show success toast
      const merchantName = `${selectedMerchantForAction.first_name} ${selectedMerchantForAction.last_name}`.trim();
      showSuccessToast(
        `${merchantName} has been ${actionType === 'approve' ? 'approved' : 'suspended'} successfully!`
      );

    } catch (error) {
      showErrorToast(
        `Failed to ${actionType} merchant. Please try again.`,
        {
          duration: 5000,
          showCloseButton: true
        }
      );
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Cancel action
  const cancelMerchantAction = () => {
    setActionModalOpen(false);
    setSelectedMerchantForAction(null);
    setActionType(null);
    setActionNotes("");
  };

  // Courier action handlers

  const processCourierAction = async () => {
    if (!selectedCourierForAction || !courierActionType) return;

    setIsProcessingCourierAction(true);

    try {
      // Store previous state for undo functionality
      const previousStatus = String(getCourierProperty(selectedCourierForAction, 'status'));

      // Update courier status locally (API endpoint not available)
      const isActive = courierActionType === 'suspend' ? false : selectedCourierForAction.is_active;
      const updatedCourier = { ...selectedCourierForAction, is_active: isActive };

      // Update local couriers array
      const updatedCouriers = couriers.map(c =>
        c.id === selectedCourierForAction.id 
          ? updatedCourier
          : c
      );
      setCouriers(updatedCouriers);
      setFilteredCouriers(updatedCouriers);

      // Store action for undo functionality
      setLastCourierAction({
        courier: updatedCourier,
        previousStatus: previousStatus,
        newStatus: String(getCourierProperty(updatedCourier, 'status')),
        notes: courierActionType === 'suspend' ? courierActionNotes : undefined,
        timestamp: Date.now()
      });

      // Set animation state for visual feedback
      setRecentlyUpdatedCourierId(updatedCourier.id.toString());
      setTimeout(() => setRecentlyUpdatedCourierId(null), 3000); // Clear after 3 seconds

      // Close modal and reset state
      setCourierActionModalOpen(false);
      setSelectedCourierForAction(null);
      setCourierActionType(null);
      setCourierActionNotes("");

      // Show success toast
      showSuccessToast(
        'Courier suspended successfully!'
      );

    } catch (error) {
      console.error('Failed to process courier action:', error);
      showErrorToast(
        'Failed to suspend courier. Please try again.'
      );
    } finally {
      setIsProcessingCourierAction(false);
    }
  };

  const cancelCourierAction = () => {
    setCourierActionModalOpen(false);
    setSelectedCourierForAction(null);
    setCourierActionType(null);
    setCourierActionNotes("");
  };

  // Undo functionality
  const undoLastCourierAction = async () => {
    if (!lastCourierAction) return;

    try {
      // Revert the courier status locally (API endpoint not available)
      const isActive = lastCourierAction.previousStatus === 'active';
      const revertedCourier = { ...lastCourierAction.courier, is_active: isActive };

      // Update local couriers array
      const updatedCouriers = couriers.map(c =>
        c.id === lastCourierAction.courier.id 
          ? revertedCourier
          : c
      );
      setCouriers(updatedCouriers);
      setFilteredCouriers(updatedCouriers);

      // Set animation state for visual feedback
      setRecentlyUpdatedCourierId(lastCourierAction.courier.id.toString());
      setTimeout(() => setRecentlyUpdatedCourierId(null), 3000); // Clear after 3 seconds

      // Clear last action
      setLastCourierAction(null);

      showSuccessToast(
        'Action undone successfully!'
      );

    } catch (error) {
      console.error('Failed to undo courier action:', error);
      showErrorToast(
        'Failed to undo action. Please refresh the page.'
      );
    }
  };

  // Courier edit modal handlers
  const handleCourierEdit = (courier: User) => {
    setEditingCourier(courier);
    setIsCourierEditOpen(true);
  };

  const handleCourierEditSave = async (formData: CourierEditFormData) => {
    if (!editingCourier) return;

    setIsSavingCourier(true);
    try {
      // Update courier status locally (API endpoint not available)
      const isActive = formData.status === 'active';
      const updatedCourier = { ...editingCourier, is_active: isActive };

      // Update local couriers array
      const updatedCouriers = couriers.map(c =>
        c.id === editingCourier.id 
          ? updatedCourier
          : c
      );
      setCouriers(updatedCouriers);
      setFilteredCouriers(updatedCouriers);
      
      setRecentlyUpdatedCourierId(updatedCourier.id.toString());
      setTimeout(() => setRecentlyUpdatedCourierId(null), 3000);

      const courierFullName = String(getCourierProperty(updatedCourier, 'fullName'));
      showSuccessToast(
        `Successfully updated ${courierFullName}'s information`
      );
      setIsCourierEditOpen(false);
      setEditingCourier(null);
    } catch (error) {
      console.error('Failed to update courier:', error);
      showErrorToast(
        "Failed to update courier. Please try again."
      );
    } finally {
      setIsSavingCourier(false);
    }
  };

  const handleCourierEditCancel = () => {
    setIsCourierEditOpen(false);
    setEditingCourier(null);
  };

  // Courier creation handlers
  const handleCourierCreationSuccess = async (newCourier: any) => {
    try {
      // Build the full name from the response
      const firstName = newCourier.first_name || '';
      const lastName = newCourier.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'New User';
      
      // Refresh the courier list from API to ensure we have the latest data
      const response = await adminService.listUsers({});
      const couriersList = response.data.filter(u => u.role === 'driver');
      setFilteredCouriers(couriersList);
      
      // Show success feedback
      showSuccessToast(
        `${fullName} has been added to the system and is pending verification.`
      );
    } catch (error) {
      console.error('Failed to refresh courier list after creation:', error);
      
      // Build the full name from the response
      const firstName = newCourier.first_name || '';
      const lastName = newCourier.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'New User';
      
      // Show success feedback even if refresh failed
      showSuccessToast(
        `${fullName} has been added to the system and is pending verification.`
      );
    }
  };
  
  // Warehouse operations
  const handleMoveToWarehouse = async () => {
    try {
      setIsMovingToWarehouse(true);
      await adminService.moveShipmentsToWarehouse();
      
      showSuccessToast("Paid shipments successfully moved to warehouse!");
      
      // Reload admin stats to reflect changes
      const response = await adminService.getAdminStatistics();
      setAdminStats({
        totalShipments: response.data.total_shipments,
        deliveredShipments: response.data.delivered_shipments,
        inTransitShipments: response.data.in_transit_shipments,
        inWarehouseShipments: response.data.in_warehouse_shipments,
        cancelledShipments: response.data.cancelled_shipments,
        undeliveredShipments: response.data.undelivered_shipments,
        draftShipments: response.data.draft_shipments,
        paidShipments: response.data.paid_shipments
      });
    } catch (error) {
      console.error('Failed to move shipments to warehouse:', error);
      showErrorToast("Failed to move shipments to warehouse. Please try again.");
    } finally {
      setIsMovingToWarehouse(false);
    }
  };
  
  // Run automated assignment
  const handleRunAutomation = async () => {
    try {
      setIsRunningAutomation(true);
      const dateStr = format(selectedAssignmentDate, 'yyyy-MM-dd');
      await adminService.runAutomatedAssignment({ assignment_date: dateStr });
      
      showSuccessToast("Automated assignment completed successfully!");
      
      // Reload assignments to show updated data
      const assignmentsResponse = await adminService.getAssignmentsByDate(dateStr);
      setAssignments(assignmentsResponse.data.assignments || []);
      
      const statsResponse = await adminService.getAssignmentStatistics(dateStr);
      setAssignmentStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to run automated assignment:', error);
      showErrorToast("Failed to run automated assignment. Please try again.");
    } finally {
      setIsRunningAutomation(false);
    }
  };
  
  // Reassign assignment
  const handleReassignAssignment = async (newDriverId: number, notes?: string) => {
    if (!selectedAssignment) return;
    
    // Debug: Check authentication before making API call
    const authToken = localStorage.getItem("auth_token");
    console.log("🔄 Reassign Assignment Debug:", {
      assignmentId: selectedAssignment.id,
      newDriverId,
      notes,
      hasAuthToken: !!authToken,
      tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : "No token"
    });
    
    try {
      await adminService.reassignAssignment(selectedAssignment.id, {
        new_driver_id: newDriverId,
        notes: notes || ''
      });
      
      showSuccessToast("Assignment successfully reassigned!");
      setIsReassignModalOpen(false);
      setSelectedAssignment(null);
      
      // Reload assignments
      const dateStr = format(selectedAssignmentDate, 'yyyy-MM-dd');
      const assignmentsResponse = await adminService.getAssignmentsByDate(dateStr);
      setAssignments(assignmentsResponse.data.assignments || []);
    } catch (error) {
      console.error('Failed to reassign assignment:', error);
      showErrorToast("Failed to reassign assignment. Please try again.");
    }
  };

  // Authentication check
  useEffect(() => {
    const checkAdminAuth = () => {
      if (typeof window !== 'undefined') {
        const adminAuth = localStorage.getItem("admin_authenticated");
        const adminCookie = document.cookie.includes("admin_authenticated=true");
        const authToken = localStorage.getItem("auth_token");
        
        console.log("🔐 Admin Auth Debug:", {
          adminAuth,
          adminCookie,
          hasAuthToken: !!authToken,
          tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : "No token"
        });
        
        if (adminAuth === "true" || adminCookie) {
          setIsAuthenticated(true);
          
          // Load admin user information from localStorage
          const name = localStorage.getItem("admin_name");
          const email = localStorage.getItem("admin_email");
          
          if (name) setAdminName(name);
          if (email) setAdminEmail(email);
          
          // Debug: Check if we have a valid auth token
          if (!authToken) {
            console.warn("⚠️ Admin authenticated but no auth_token found in localStorage");
          }
        } else {
          console.log("Admin not authenticated, redirecting to login...");
          router.push("/admin-login");
        }
      }
    };

    checkAdminAuth();
  }, [router]);

  // Load couriers from API
  useEffect(() => {
    const loadCouriers = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsCourierSearchLoading(true);
        const response = await adminService.listUsers({});
        const couriersList = response.data.filter(u => u.role === 'driver');
        setFilteredCouriers(couriersList);
      } catch (error) {
        console.error('Failed to load couriers:', error);
        showErrorToast(
          "Unable to fetch courier data. Please try refreshing the page."
        );
      } finally {
        setIsCourierSearchLoading(false);
      }
    };

    loadCouriers();
  }, [isAuthenticated]);

  // Handle timeframe selection
  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    
    if (timeframe === "custom") {
      setCustomRangeOpen(true);
      return;
    }
    
    setCustomRangeOpen(false);
    
    const now = new Date();
    let from: Date;
    
    switch (timeframe) {
      case "7d":
        from = subDays(now, 7);
        break;
      case "30d":
        from = subDays(now, 30);
        break;
      case "90d":
        from = subDays(now, 90);
        break;
      default:
        from = subDays(now, 30);
    }
    
    setDateRange({ from, to: now });
  };

  // Handle custom date range selection
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setSelectedTimeframe("custom");
    }
  };

  // Mock data for platform overview
  // Compute platform stats from real data
  const platformStats = useMemo(() => {
    const totalMerchants = merchants.length;
    const activeCouriers = couriers.filter(c => c.is_active).length;
    const totalShipments = adminStats?.totalShipments || 0;
    const pendingApprovals = merchants.filter(m => !m.is_verified).length + 
                            couriers.filter(c => !c.is_verified).length;
    
    return {
      totalMerchants,
      activeCouriers,
      totalShipments,
      pendingApprovals,
      // These are not available in the current API, kept for export compatibility
      monthlyRevenue: 0,
      systemHealth: 99.0
    };
  }, [merchants, couriers, adminStats]);


  // Mock data generators for analytics
  const generateRevenueData = (days: number) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const baseRevenue = 15000 + Math.random() * 10000;
      const trend = Math.sin(i * 0.1) * 2000;
      const seasonal = Math.sin((i / 30) * 2 * Math.PI) * 1500;

      data.push({
        date: format(date, 'MMM dd'),
        fullDate: date,
        revenue: Math.max(0, baseRevenue + trend + seasonal),
        target: 20000,
        growth: (Math.random() - 0.5) * 0.1
      });
    }
    return data;
  };

  const generateShipmentData = (days: number) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const baseShipments = 150 + Math.random() * 100;
      const trend = Math.sin(i * 0.15) * 30;

      data.push({
        date: format(date, 'MMM dd'),
        fullDate: date,
        totalShipments: Math.max(0, Math.round(baseShipments + trend)),
        delivered: Math.round((baseShipments + trend) * 0.85),
        pending: Math.round((baseShipments + trend) * 0.12),
        failed: Math.round((baseShipments + trend) * 0.03)
      });
    }
    return data;
  };

  const generateGeographicData = () => [
    { region: 'New York', shipments: 2450, revenue: 48750, growth: 12.5 },
    { region: 'California', shipments: 1890, revenue: 35680, growth: 8.3 },
    { region: 'Texas', shipments: 1340, revenue: 28900, growth: -2.1 },
    { region: 'Florida', shipments: 980, revenue: 19200, growth: 15.7 },
    { region: 'Illinois', shipments: 756, revenue: 15800, growth: 5.2 },
    { region: 'Other', shipments: 2340, revenue: 41200, growth: 7.8 }
  ];

  const generateCourierPerformanceData = () => [
    { name: 'David Rodriguez', deliveries: 245, rating: 4.8, earnings: 1840, status: 'active' },
    { name: 'Lisa Thompson', deliveries: 198, rating: 4.9, earnings: 1560, status: 'active' },
    { name: 'James Mitchell', deliveries: 176, rating: 4.6, earnings: 1420, status: 'active' },
    { name: 'Maria Garcia', deliveries: 167, rating: 4.7, earnings: 1380, status: 'active' },
    { name: 'Robert Chen', deliveries: 145, rating: 4.5, earnings: 1210, status: 'pending' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const chartConfig = {
    revenue: { label: "Revenue", color: "#22c55e" },
    target: { label: "Target", color: "#94a3b8" },
    totalShipments: { label: "Total Shipments", color: "#3b82f6" },
    delivered: { label: "Delivered", color: "#22c55e" },
    pending: { label: "Pending", color: "#f59e0b" },
    failed: { label: "Failed", color: "#ef4444" }
  };

  // Generate data based on selected timeframe
  const days = selectedTimeframe === "7d" ? 7 : selectedTimeframe === "30d" ? 30 : 90;
  const revenueData = useMemo(() => generateRevenueData(days), [days]);
  const shipmentData = useMemo(() => generateShipmentData(days), [days]);
  const geographicData = useMemo(() => generateGeographicData(), []);
  const courierData = useMemo(() => generateCourierPerformanceData(), []);

  // Calculate KPIs
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalShipments = shipmentData.reduce((sum, item) => sum + item.totalShipments, 0);
  const avgDeliveryRate = (shipmentData.reduce((sum, item) => sum + item.delivered, 0) / totalShipments) * 100;
  const activeCouriers = courierData.filter(c => c.status === 'active').length;

  // Calculate trends
  const revenueTrend = revenueData.length > 1 ?
    ((revenueData[revenueData.length - 1].revenue - revenueData[0].revenue) / revenueData[0].revenue) * 100 : 0;

  // Analytics utility functions

  const handleExport = async (format: 'csv' | 'pdf' | 'image') => {
    try {
      setIsLoading(true);
      
      // Prepare analytics data for export
      const analyticsData: AnalyticsData = {
        revenueData,
        shipmentData,
        geographicData,
        courierData,
        platformStats,
        kpis: {
          totalRevenue,
          totalShipments,
          avgDeliveryRate,
          activeCouriers,
          revenueTrend
        },
        dateRange: {
          from: dateRange?.from || new Date(),
          to: dateRange?.to || new Date()
        },
        timeframe: selectedTimeframe
      };

      if (format === 'csv') {
        // CSV export is synchronous and doesn't need loading state
        exportAnalyticsToCSV(analyticsData);
        showSuccessToast('CSV report downloaded successfully!', {
          duration: 3000,
          showProgressBar: true,
          showCloseButton: true
        });
        setIsLoading(false);
      } else if (format === 'pdf') {
        // PDF export with proper error handling and no UI flicker
        const result = await exportPDF(analyticsData);
        if (!result.success) {
          console.error('PDF export failed:', result.message);
          showErrorToast(`PDF export failed: ${result.message}`, {
            duration: 5000,
            showCloseButton: true
          });
        } else {
          console.log('PDF exported successfully:', result.filename);
        showSuccessToast('PDF report downloaded successfully!', {
          duration: 3000,
          showProgressBar: true,
          showCloseButton: true
        });
        }
      } else if (format === 'image') {
        // For future implementation - could export charts as images
        console.log('Image export not yet implemented');
        showErrorToast('Image export not yet implemented', {
          duration: 3000,
          showCloseButton: true
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      showErrorToast(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 5000,
        showCloseButton: true
      });
    } finally {
      // Only set loading to false if it's not already false (for CSV)
      if (format !== 'csv') {
        setIsLoading(false);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Navigation sections for sidebar
  const navigationSections = [
    {
      id: "dashboard",
      title: "",
      items: [
        { id: "overview", label: "Overview", icon: "BarChart3", description: "Platform statistics" },
      ]
    },
    {
      id: "users",
      title: "Users",
      items: [
        { id: "merchants", label: "Merchants", icon: "Users", description: "Manage merchant accounts" },
        { id: "couriers", label: "Drivers", icon: "Truck", description: "Manage driver accounts" },
      ]
      },
      {
        id: "operations",
        title: "Operations",
        items: [
          { id: "assignments", label: "Assignments", icon: "ClipboardList", description: "Manage driver assignments" },
          { id: "warehouse", label: "Warehouse", icon: "Warehouse", description: "Warehouse operations" },
      ]
    },
    {
      id: "system",
      title: "System",
      items: [
        { id: "settings", label: "Settings", icon: "Settings", description: "Platform configuration" },
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200" id={`parcego-status-badge-${status}`}>Active</Badge>;
      case "suspended":
      case "inactive":
        return <Badge className="bg-red-50 text-red-800 border-red-200" id={`parcego-status-badge-${status}`}>Suspended</Badge>;
      default:
        return <Badge className="bg-slate-50 text-slate-700 border-slate-300" id={`parcego-status-badge-${status}`}>{status}</Badge>;
    }
  };

  // Check if navigation item is active
  const isActiveNavItem = (id: string) => {
    return activeSection === id;
  };

  // Handle navigation
  const handleNavigate = (id: string) => {
    setActiveSection(id);
    setSidebarOpen(false); // Close mobile sidebar after navigation
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate(id);
    }
  };

  const renderOverview = () => (
    <div className="space-y-4 xl:space-y-6" id="parcego-admin-overview-section">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        <Card id="parcego-admin-stat-merchants" className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bold">Total Merchants</CardTitle>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="Users" size={24} className="text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading || merchantsLoading ? (
              <Skeleton className="h-9 w-24 mb-2" />
            ) : (
              <>
            <div className="text-2xl xl:text-3xl font-bold">{platformStats.totalMerchants.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All registered merchants</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card id="parcego-admin-stat-couriers" className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bold">Active Couriers</CardTitle>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="Truck" size={24} className="text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading || couriersLoading ? (
              <Skeleton className="h-9 w-24 mb-2" />
            ) : (
              <>
            <div className="text-2xl xl:text-3xl font-bold">{platformStats.activeCouriers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Currently active drivers</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card id="parcego-admin-stat-shipments" className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bold">Total Shipments</CardTitle>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="Package" size={24} className="text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-9 w-24 mb-2" />
            ) : (
              <>
            <div className="text-2xl xl:text-3xl font-bold">{platformStats.totalShipments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time shipments</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue card hidden - not available in current API */}
        {/* <Card id="parcego-admin-stat-revenue" className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bold">Monthly Revenue</CardTitle>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="DollarSign" size={24} className="text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl xl:text-3xl font-bold">${platformStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card> */}

        {/* <Card id="parcego-admin-stat-health" className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bold">System Health</CardTitle>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="Activity" size={24} className="text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{platformStats.systemHealth}%</div>
            <p className="text-xs text-green-600">All systems operational</p>
          </CardContent>
        </Card> */}

        <Card id="parcego-admin-stat-approvals" className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bold">Pending Approvals</CardTitle>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="AlertCircle" size={24} className="text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading || merchantsLoading || couriersLoading ? (
              <Skeleton className="h-9 w-24 mb-2" />
            ) : (
              <>
            <div className="text-2xl xl:text-3xl font-bold">{platformStats.pendingApprovals}</div>
                <p className="text-xs text-amber-600">{platformStats.pendingApprovals > 0 ? 'Requires attention' : 'All verified'}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );

  const renderMerchants = () => {
    // Mobile Card Component
    const MerchantCard = ({ merchant }: { merchant: typeof merchants[0] }) => {
      const [isExpanded, setIsExpanded] = useState(false);

      return (
        <Card className="mb-3 border border-gray-200 hover:shadow-md transition-all duration-200" id={`parcego-merchant-card-${merchant.id}`}>
          <CardContent className="py-0 px-4">
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-gray-900 truncate leading-tight">{getMerchantProperty(merchant, 'businessName')}</h3>
                <p className="text-sm text-gray-500">ID: {merchant.id}</p>
              </div>
              <div className="ml-3 flex items-center gap-2">
                {getStatusBadge(String(getMerchantProperty(merchant, 'status')))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 p-0"
                  aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  aria-expanded={isExpanded}
                >
                  <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
                </Button>
              </div>
            </div>

            {/* Primary Info - Always Visible */}
            <div className="grid grid-cols-2 gap-2.5 mb-1.5">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">Contact</p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{getMerchantProperty(merchant, 'contactName')}</p>
                <p className="text-xs text-gray-600 truncate">{merchant.email}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">Shipments</p>
                <p className="text-base font-bold text-blue-600">{getMerchantProperty(merchant, 'totalShipments').toLocaleString()}</p>
              </div>
            </div>

            {/* Expandable Details */}
            {isExpanded && (
              <div className="border-t border-gray-200 pt-1.5 mt-1.5 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                <div>
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">Join Date</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(merchant.created_at).toLocaleDateString()}</p>
                </div>

                {/* Action Buttons - Only visible when expanded */}
                <div className="pt-1.5 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    };

    return (
      <div className="space-y-4 xl:space-y-6" id="parcego-admin-merchants-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Manage Merchants</h2>
            {merchantSearchQuery && (
              <p className="text-sm text-gray-600 mt-1 transition-all duration-200 ease-out">
                <span className="font-medium text-gray-900">{filteredMerchants.length}</span> of {merchants.length} merchants
                <span className="ml-1 text-gray-500">for &ldquo;{merchantSearchQuery}&rdquo;</span>
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Search Input - Enhanced for Mobile */}
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search merchants..."
                value={merchantSearchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleClearSearch();
                  }
                }}
                className={cn(
                  "pl-10 pr-10 h-10 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  "touch-manipulation", // Better touch target
                  isMobile ? "text-base" : "text-sm" // Larger text on mobile
                )}
                id="parcego-merchants-search-input"
                aria-label="Search merchants by business name, contact, email, or status"
              />
              {merchantSearchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 touch-manipulation"
                  aria-label="Clear search"
                  id="parcego-merchants-clear-search-btn"
                >
                  <Icon name="X" size={14} />
                </Button>
              )}
              {isMerchantSearchLoading && (
                <div className="absolute right-9 top-1/2 transform -translate-y-1/2">
                  <Icon name="Loader2" size={16} className="animate-spin text-blue-500" />
                </div>
              )}
            </div>

            {/* Filter Button - Touch Friendly */}
            <Button
              variant="outline"
              size="sm"
              id="parcego-merchants-filter-btn"
              className={cn(
                "touch-manipulation",
                isMobile ? "h-10 px-4" : "h-9 px-3"
              )}
            >
              <Icon name="Filter" size={16} className="mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Card id="parcego-merchants-table-card">
          <CardContent className="p-0">
            {/* Mobile Layout - Cards */}
            {isMobile && (
              <div className="p-4" id="parcego-merchants-mobile-view">
                {filteredMerchants.length === 0 && merchantSearchQuery && !isMerchantSearchLoading ? (
                  <div className="text-center py-12">
                    <Icon name="Search" size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                      No merchants match your search for &ldquo;{merchantSearchQuery}&rdquo;. Try searching for a different business name, contact, email, or status.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSearch}
                      className="touch-manipulation h-10 px-4"
                      id="parcego-merchants-clear-search-alt-btn"
                    >
                      <Icon name="X" size={16} className="mr-2" />
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredMerchants.map((merchant) => (
                      <MerchantCard key={merchant.id} merchant={merchant} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tablet Layout - Condensed Table */}
            {isTablet && (
              <div className="overflow-x-auto transition-all duration-300 ease-out">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold">Business & Contact</th>
                      <th className="text-left p-3 text-sm font-semibold">Status</th>
                      <th className="text-left p-3 text-sm font-semibold">Shipments</th>
                      <th className="text-left p-3 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMerchants.length === 0 && merchantSearchQuery && !isMerchantSearchLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Icon name="Search" size={48} className="text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                            <p className="text-sm text-gray-500 max-w-sm">
                              No merchants match your search for &ldquo;{merchantSearchQuery}&rdquo;. Try searching for a different business name, contact, email, or status.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleClearSearch}
                              className="mt-2 touch-manipulation h-9 px-3"
                              id="parcego-merchants-clear-search-alt-btn"
                            >
                              <Icon name="X" size={14} className="mr-2" />
                              Clear search
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredMerchants.map((merchant) => (
                        <tr key={merchant.id} className="border-b hover:bg-gray-50" id={`parcego-merchant-row-${merchant.id}`}>
                          <td className="p-3">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{getMerchantProperty(merchant, 'businessName')}</p>
                              <p className="text-xs text-gray-500 truncate">{getMerchantProperty(merchant, 'contactName')}</p>
                              <p className="text-xs text-gray-400 truncate">{merchant.email}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            {getStatusBadge(String(getMerchantProperty(merchant, 'status')))}
                          </td>
                          <td className="p-3">
                            <span className="text-sm font-medium">{getMerchantProperty(merchant, 'totalShipments').toLocaleString()}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                id={`parcego-merchant-edit-${merchant.id}`}
                                onClick={() => {
                                  setSelectedMerchant(merchant);
                                  setIsEditingMerchant(true);
                                }}
                                className="h-8 w-8 p-0 touch-manipulation"
                                aria-label={`Edit ${getMerchantProperty(merchant, 'businessName')}`}
                              >
                                <Icon name="Edit" size={14} />
                              </Button>
                              {getMerchantProperty(merchant, 'status') === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 h-8 w-8 p-0 touch-manipulation"
                                  id={`parcego-merchant-approve-${merchant.id}`}
                                  onClick={() => handleMerchantAction(merchant, 'approve')}
                                  aria-label={`Approve ${getMerchantProperty(merchant, 'businessName')}`}
                                >
                                  <Icon name="UserCheck" size={14} />
                                </Button>
                              )}
                              {getMerchantProperty(merchant, 'status') === "active" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 h-8 w-8 p-0 touch-manipulation"
                                  id={`parcego-merchant-suspend-${merchant.id}`}
                                  onClick={() => handleMerchantAction(merchant, 'suspend')}
                                  aria-label={`Suspend ${getMerchantProperty(merchant, 'businessName')}`}
                                >
                                  <Icon name="Ban" size={14} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Desktop Layout - Full Table */}
            {isDesktop && (
              <div className="overflow-x-auto transition-all duration-300 ease-out">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Business</th>
                      <th className="text-left p-4 font-semibold">Contact</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Shipments</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMerchants.length === 0 && merchantSearchQuery && !isMerchantSearchLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Icon name="Search" size={48} className="text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                            <p className="text-sm text-gray-500 max-w-sm">
                              No merchants match your search for &ldquo;{merchantSearchQuery}&rdquo;. Try searching for a different business name, contact, email, or status.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleClearSearch}
                              className="mt-2"
                              id="parcego-merchants-clear-search-alt-btn"
                            >
                              <Icon name="X" size={14} className="mr-2" />
                              Clear search
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredMerchants.map((merchant) => (
                        <tr key={merchant.id} className="border-b hover:bg-gray-50" id={`parcego-merchant-row-${merchant.id}`}>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{getMerchantProperty(merchant, 'businessName')}</p>
                              <p className="text-sm text-gray-500">ID: {merchant.id}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{getMerchantProperty(merchant, 'contactName')}</p>
                              <p className="text-sm text-gray-500">{merchant.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(String(getMerchantProperty(merchant, 'status')))}
                          </td>
                          <td className="p-4">{getMerchantProperty(merchant, 'totalShipments').toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                id={`parcego-merchant-edit-${merchant.id}`}
                                onClick={() => {
                                  setSelectedMerchant(merchant);
                                  setIsEditingMerchant(true);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Icon name="Edit" size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCouriers = () => {
    // Mobile Card Component
    const CourierCard = ({ courier, isExpanded, onToggle }: { courier: User, isExpanded: boolean, onToggle: () => void }) => (
      <Card
        className={cn(
          "transition-all duration-300 touch-manipulation",
          recentlyUpdatedCourierId === courier.id.toString() && "ring-2 ring-green-200 bg-green-50"
        )}
        id={`parcego-courier-card-${courier.id}`}
      >
        <CardContent className="p-4">
          {/* Main Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarFallback className="text-sm font-medium">
                  {String(getCourierProperty(courier, 'fullName')).split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base text-gray-900 truncate">
                  {getCourierProperty(courier, 'fullName')}
                </h3>
                <p className="text-sm text-gray-500 truncate">ID: {courier.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(String(getCourierProperty(courier, 'status')))}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0 touch-manipulation"
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
              >
                <Icon
                  name={isExpanded ? "ChevronUp" : "ChevronDown"}
                  size={16}
                  className="transition-transform duration-200"
                />
              </Button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {Number(getCourierProperty(courier, 'completedDeliveries')).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Deliveries</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">
                  {Number(getCourierProperty(courier, 'rating')).toFixed(1) || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                id={`parcego-courier-edit-mobile-${courier.id}`}
                onClick={() => handleCourierEdit(courier)}
                className="h-9 px-3 touch-manipulation min-w-[44px] hover:bg-gray-50"
                aria-label={`Edit courier ${getCourierProperty(courier, 'fullName')}`}
              >
                <Icon name="Edit" size={16} />
                <span className="hidden sm:inline ml-1">Edit</span>
              </Button>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</p>
                  <p className="text-sm text-gray-900 mt-1">{courier.email}</p>
                  <p className="text-sm text-gray-600">{getCourierProperty(courier, 'phone')}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</p>
                  <p className="text-sm text-gray-900 mt-1">{getCourierProperty(courier, 'city')}, BC</p>
                  <p className="text-sm text-gray-600">{getCourierProperty(courier, 'vehicle')}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Login</p>
                <p className="text-sm text-gray-900 mt-1">
                  {(() => {
                    const lastLogin = getCourierProperty(courier, 'lastLogin');
                    return lastLogin && typeof lastLogin === 'string' ? new Date(lastLogin).toLocaleDateString() : 'Never';
                  })()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );

    return (
      <div className="space-y-4 xl:space-y-6" id="parcego-admin-couriers-section">
        {/* Sticky Header with Search */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 -mx-4 px-4 py-4 lg:-mx-6 lg:px-6 xl:-mx-8 xl:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Couriers</h2>
              {courierSearchQuery && (
                <p className="text-sm text-gray-600 mt-1 transition-all duration-200 ease-out">
                  <span className="font-medium text-gray-900">{filteredCouriers.length}</span> of {couriers.length} couriers
                  <span className="ml-1 text-gray-500">for &ldquo;{courierSearchQuery}&rdquo;</span>
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Enhanced Search Input */}
              <div className="relative flex-1 sm:flex-initial sm:w-80">
                <Icon name="Search" size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search couriers..."
                  value={courierSearchQuery}
                  onChange={(e) => handleCourierSearchInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleClearCourierSearch();
                    }
                  }}
                  className={cn(
                    "pl-12 pr-12 h-12 text-base border-2 transition-all duration-200",
                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "touch-manipulation placeholder:text-gray-400",
                    "bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  )}
                  id="parcego-couriers-search-input"
                  aria-label="Search couriers by name, email, phone, status, city, or vehicle"
                />
                {courierSearchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCourierSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 touch-manipulation rounded-full"
                    aria-label="Clear search"
                    id="parcego-couriers-clear-search-btn"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                )}
                {isCourierSearchLoading && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <Icon name="Loader2" size={18} className="animate-spin text-blue-500" />
                  </div>
                )}
              </div>

              {/* Create Courier Button */}
              <Button
                onClick={() => setIsCourierCreationOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                id="parcego-couriers-create-btn"
                aria-label="Create new courier account"
              >
                <Icon name="UserPlus" size={18} className="mr-2" />
                Create Courier
              </Button>

            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {/* Mobile/Tablet Card View */}
          <div className="block lg:hidden space-y-3" id="parcego-couriers-mobile-view">
            {filteredCouriers.length === 0 && courierSearchQuery && !isCourierSearchLoading ? (
              <Card className="p-8">
                <div className="text-center">
                  <Icon name="Search" size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                    No couriers match your search for &ldquo;{courierSearchQuery}&rdquo;. Try searching for a different name, email, phone, status, city, or vehicle.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCourierSearch}
                    className="touch-manipulation h-10 px-4"
                    id="parcego-couriers-clear-search-alt-btn"
                  >
                    <Icon name="X" size={14} className="mr-2" />
                    Clear search
                  </Button>
                </div>
              </Card>
            ) : (
              filteredCouriers.map((courier) => (
                <CourierCard
                  key={courier.id}
                  courier={courier}
                  isExpanded={expandedCourierCards.has(String(courier.id))}
                  onToggle={() => handleCourierCardToggle(String(courier.id))}
                />
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block" id="parcego-couriers-desktop-view">
            <Card id="parcego-couriers-table-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Courier</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Contact</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Deliveries</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCouriers.length === 0 && courierSearchQuery && !isCourierSearchLoading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3">
                              <Icon name="Search" size={48} className="text-gray-300" />
                              <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                              <p className="text-sm text-gray-500 max-w-md text-center">
                                No couriers match your search for &ldquo;{courierSearchQuery}&rdquo;. Try searching for a different name, email, phone, status, city, or vehicle.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearCourierSearch}
                                className="mt-2 touch-manipulation h-9 px-3"
                                id="parcego-couriers-clear-search-alt-btn"
                              >
                                <Icon name="X" size={14} className="mr-2" />
                                Clear search
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCouriers.map((courier) => (
                        <tr
                          key={courier.id}
                          className={cn(
                            "border-b hover:bg-gray-50 transition-all duration-200",
                            recentlyUpdatedCourierId === courier.id.toString() && "bg-green-50 animate-pulse border-green-200"
                          )}
                          id={`parcego-courier-row-${courier.id}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm font-medium">
                                  {(() => {
                                    const fullName = String(getCourierProperty(courier, 'fullName'));
                                    return fullName.split(' ').map(n => n.charAt(0)).join('');
                                  })()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{getCourierProperty(courier, 'fullName')}</p>
                                <p className="text-sm text-gray-500">ID: {courier.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm text-gray-900">{courier.email}</p>
                              <p className="text-sm text-gray-500">{getCourierProperty(courier, 'phone')}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(String(getCourierProperty(courier, 'status')))}
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-gray-900">
                              {Number(getCourierProperty(courier, 'completedDeliveries')).toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                id={`parcego-courier-edit-${courier.id}`}
                                onClick={() => handleCourierEdit(courier)}
                                className="h-8 w-8 p-0 touch-manipulation"
                                aria-label={`Edit courier ${getCourierProperty(courier, 'fullName')}`}
                              >
                                <Icon name="Edit" size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Action Bar for Mobile */}
        <div className="fixed bottom-4 right-4 lg:hidden z-50">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg touch-manipulation bg-blue-600 hover:bg-blue-700"
            id="parcego-couriers-quick-add"
          >
            <Icon name="Plus" size={24} />
          </Button>
        </div>
      </div>
    );
  };

  const renderAssignments = () => {
    return (
      <div className="space-y-4 xl:space-y-6" id="parcego-admin-assignments-section">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Driver Assignments</h2>
            <p className="text-sm text-gray-600 mt-1">Manage and optimize driver assignments</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="touch-manipulation">
                  <Icon name="Calendar" size={16} className="mr-2" />
                  {format(selectedAssignmentDate, 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedAssignmentDate}
                  onSelect={(date) => date && setSelectedAssignmentDate(date)}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAutomation}
              disabled={isRunningAutomation}
              className="touch-manipulation"
            >
              {isRunningAutomation ? (
                <>
                  <Icon name="Loader" size={16} className="mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Icon name="Zap" size={16} className="mr-2" />
                  Run Automation
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setIsManualAssignmentOpen(true)}
              className="touch-manipulation"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Manual Assignment
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {assignmentStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignmentStats.total_assignments || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Assigned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{assignmentStats.assigned || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{assignmentStats.in_progress || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{assignmentStats.completed || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle>Assignments for {format(selectedAssignmentDate, 'MMMM dd, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon name="ClipboardList" size={48} className="mx-auto mb-4 opacity-50" />
                <p>No assignments found for this date</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsManualAssignmentOpen(true)}
                  className="mt-4"
                >
                  Create Manual Assignment
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Driver</th>
                      <th className="text-left p-4 font-semibold">Shipment</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Priority</th>
                      <th className="text-right p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment: any) => (
                      <tr key={assignment.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{assignment.driver_name || 'Unassigned'}</div>
                          <div className="text-sm text-gray-500">{assignment.driver_email}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{assignment.shipment_tracking_number}</div>
                          <div className="text-sm text-gray-500">{assignment.destination}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant={
                            assignment.status === 'completed' ? 'default' :
                            assignment.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }>
                            {assignment.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={assignment.priority === 'high' ? 'destructive' : 'outline'}>
                            {assignment.priority || 'normal'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          {assignment.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setIsReassignModalOpen(true);
                              }}
                            >
                              Reassign
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWarehouse = () => {
    return (
      <div className="space-y-4 xl:space-y-6" id="parcego-admin-warehouse-section">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Warehouse Operations</h2>
            <p className="text-sm text-gray-600 mt-1">Manage shipment warehouse operations</p>
          </div>
        </div>

        {/* Warehouse Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {adminStats?.inWarehouseShipments || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Shipments in warehouse</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Paid Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {adminStats?.paidShipments || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Ready to move to warehouse</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Draft Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {adminStats?.draftShipments || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Warehouse Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Icon name="Info" size={16} className="mr-2" />
              <AlertDescription>
                This action will move all paid shipments to the warehouse, making them available for driver assignment.
              </AlertDescription>
            </Alert>
            
            <Button
              size="lg"
              onClick={handleMoveToWarehouse}
              disabled={isMovingToWarehouse || (adminStats?.paidShipments || 0) === 0}
              className="w-full sm:w-auto"
            >
              {isMovingToWarehouse ? (
                <>
                  <Icon name="Loader" size={20} className="mr-2 animate-spin" />
                  Moving to Warehouse...
                </>
              ) : (
                <>
                  <Icon name="Warehouse" size={20} className="mr-2" />
                  Move {adminStats?.paidShipments || 0} Paid Shipments to Warehouse
                </>
              )}
            </Button>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4">Warehouse Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Shipments:</span>
                  <span className="font-semibold">{adminStats?.totalShipments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivered:</span>
                  <span className="font-semibold text-green-600">{adminStats?.deliveredShipments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Transit:</span>
                  <span className="font-semibold text-blue-600">{adminStats?.inTransitShipments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Undelivered:</span>
                  <span className="font-semibold text-red-600">{adminStats?.undeliveredShipments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cancelled:</span>
                  <span className="font-semibold text-gray-600">{adminStats?.cancelledShipments || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 p-6" id="parcego-analytics-loading">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 xl:space-y-6 p-4 xl:p-6" id="parcego-admin-analytics-container">

        {/* Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 xl:gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time insights into your courier platform performance</p>
          </div>

          {/* Controls Container - Responsive Layout */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 xl:gap-4">
            {/* Filter Controls Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
              {/* Quick Timeframe Presets */}
              <Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
                <SelectTrigger className="w-full sm:w-40 h-9" id="parcego-analytics-timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>

              {/* Range Calendar */}
              <RangeCalendar
                id="parcego-analytics-range-calendar"
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                placeholder="Select date range"
                className="w-full sm:w-64"
              />
            </div>

            {/* Export Actions Group */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                id="parcego-analytics-export-csv"
                className="h-9 px-3"
                disabled={isLoading}
              >
                <Icon name={isLoading ? "Loader2" : "Download"} size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLoading ? 'Exporting...' : 'CSV'}</span>
                <span className="sm:hidden">{isLoading ? '...' : 'CSV'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                id="parcego-analytics-export-pdf"
                className="h-9 px-3"
                disabled={isLoading}
              >
                <Icon name={isLoading ? "Loader2" : "FileText"} size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLoading ? 'Generating...' : 'PDF'}</span>
                <span className="sm:hidden">{isLoading ? '...' : 'PDF'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6" id="parcego-analytics-kpis">
          <Card className="relative overflow-hidden border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="DollarSign" size={20} className="text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl xl:text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
              <div className="flex items-center mt-1">
                <Badge
                  variant={revenueTrend >= 0 ? "default" : "destructive"}
                  className={cn(
                    "text-xs",
                    revenueTrend >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}
                >
                  <Icon name={revenueTrend >= 0 ? "TrendingUp" : "TrendingDown"} size={12} className="mr-1" />
                  {Math.abs(revenueTrend).toFixed(1)}%
                </Badge>
                <span className="text-xs text-gray-500 ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Shipments</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="Package" size={20} className="text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl xl:text-2xl font-bold text-gray-900">{formatNumber(totalShipments)}</div>
              <div className="flex items-center mt-1">
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  <Icon name="Clock" size={12} className="mr-1" />
                  {formatNumber(Math.round(totalShipments / days))} daily avg
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Delivery Rate</CardTitle>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl xl:text-2xl font-bold text-gray-900">{avgDeliveryRate.toFixed(1)}%</div>
              <Progress value={avgDeliveryRate} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Target: 95%</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Couriers</CardTitle>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon name="Truck" size={20} className="text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl xl:text-2xl font-bold text-gray-900">{activeCouriers}</div>
              <div className="flex items-center mt-1">
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <Icon name="Users" size={12} className="mr-1" />
                  {Math.round((activeCouriers / courierData.length) * 100)}% utilization
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>


          {/* Analytics Overview */}
          <div className="space-y-4 xl:space-y-6">
            <div className="text-left">
              <h2 className="text-2xl font-semibold text-gray-800">Overview</h2>
              <p className="text-gray-600 mt-1">Key performance indicators and analytics</p>
            </div>

            {/* Charts Grid - Fully Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 xl:gap-6">
              {/* Revenue Trend Chart */}
              <Card id="parcego-analytics-revenue-chart" className="sm:col-span-2 lg:col-span-2 xl:col-span-3">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <Icon name="TrendingUp" size={18} className="mr-2 text-green-600 sm:w-5 sm:h-5" />
                    <span className="truncate">Revenue Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-6">
                  <div className="w-full overflow-hidden">
                    <ChartContainer config={chartConfig} className="h-64 sm:h-72 lg:h-80 w-full">
                      <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                          dataKey="date"
                          fontSize={11}
                          fontWeight={500}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          fontSize={11}
                          fontWeight={500}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          width={50}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent
                            formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                            labelFormatter={(label) => `Date: ${label}`}
                          />}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#22c55e"
                          strokeWidth={2}
                          fill="url(#revenueGradient)"
                        />
                        <Line
                          type="monotone"
                          dataKey="target"
                          stroke="#94a3b8"
                          strokeDasharray="5 5"
                          strokeWidth={1}
                          dot={false}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Shipment Status Pie Chart */}
              <Card id="parcego-analytics-shipment-status" className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <Icon name="PieChart" size={18} className="mr-2 text-blue-600 sm:w-5 sm:h-5" />
                    <span className="truncate">Shipping Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-6">
                  <div className="w-full overflow-hidden">
                    <ChartContainer config={chartConfig} className="h-64 sm:h-72 xl:h-80 w-full">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Delivered', value: shipmentData.reduce((sum, item) => sum + item.delivered, 0), fill: '#22c55e' },
                            { name: 'Pending', value: shipmentData.reduce((sum, item) => sum + item.pending, 0), fill: '#f59e0b' },
                            { name: 'Failed', value: shipmentData.reduce((sum, item) => sum + item.failed, 0), fill: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {[
                            { name: 'Delivered', value: shipmentData.reduce((sum, item) => sum + item.delivered, 0), fill: '#22c55e' },
                            { name: 'Pending', value: shipmentData.reduce((sum, item) => sum + item.pending, 0), fill: '#f59e0b' },
                            { name: 'Failed', value: shipmentData.reduce((sum, item) => sum + item.failed, 0), fill: '#ef4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={<ChartTooltipContent
                            formatter={(value) => [formatNumber(Number(value)), "Shipments"]}
                          />}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '13px', fontWeight: '500' }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Distribution Chart */}
              <Card id="parcego-analytics-distribution" className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <Icon name="BarChart3" size={18} className="mr-2 text-purple-600 sm:w-5 sm:h-5" />
                    <span className="truncate">Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-6">
                  <div className="w-full overflow-hidden">
                    <ChartContainer config={chartConfig} className="h-64 sm:h-72 xl:h-80 w-full">
                      <BarChart 
                        data={shipmentData} 
                        margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                        barCategoryGap="10%"
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                          dataKey="date"
                          fontSize={11}
                          fontWeight={500}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          fontSize={11}
                          fontWeight={500}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => formatNumber(value)}
                          width={50}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent
                            formatter={(value, name) => [formatNumber(Number(value)), name]}
                          />}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '13px', fontWeight: '500' }}
                          iconType="rect"
                        />
                        <Bar dataKey="delivered" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-4 xl:space-y-6" id="parcego-admin-settings-section">
      <h2 className="text-xl font-bold">Platform Settings</h2>
      
      <div className="max-w-2xl">
        <Card id="parcego-settings-support">
          <CardHeader>
            <CardTitle>Support & Help</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Help Documentation</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Manage help documentation')} className="h-9 px-3">Manage</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Support Tickets</span>
              <Button variant="outline" size="sm" onClick={() => console.log('View support ticket queue')} className="h-9 px-3">View Queue</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>System Status Page</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Configure system status page')} className="h-9 px-3">Configure</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Handle merchant form input changes
  const handleMerchantInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (merchantFormErrors[field]) {
      setMerchantFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Merchant form validation
  const validateMerchantForm = () => {
    const errors: Record<string, string> = {};

    if (!editFormData.businessName.trim()) {
      errors.businessName = 'Business name is required';
    }

    if (!editFormData.contactName.trim()) {
      errors.contactName = 'Contact name is required';
    }

    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!editFormData.joinDate) {
      errors.joinDate = 'Join date is required';
    }

    setMerchantFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle merchant save
  const handleMerchantSave = async () => {
    if (!validateMerchantForm() || !selectedMerchant) return;

    setIsSavingMerchant(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update merchant data
      const updatedMerchant = { ...selectedMerchant, ...editFormData };

      // Update in mock data
      const updatedMerchants = merchants.map(m =>
        m.id === selectedMerchant.id ? updatedMerchant : m
      );
      setFilteredMerchants(prev =>
        prev.map(m => m.id === selectedMerchant.id ? updatedMerchant : m)
      );

      showSuccessToast('Merchant details updated successfully!', {
        duration: 4000,
        showProgressBar: true,
        showCloseButton: true
      });

      setIsEditingMerchant(false);
      setSelectedMerchant(updatedMerchant);
    } catch (error) {
      showErrorToast('Failed to update merchant details. Please try again.', {
        duration: 5000,
        showCloseButton: true
      });
    } finally {
      setIsSavingMerchant(false);
    }
  };

  // Handle merchant cancel edit
  const handleMerchantCancelEdit = () => {
    if (!selectedMerchant) return;

    setEditFormData({
      businessName: selectedMerchant.business_name,
      contactName: `${selectedMerchant.first_name} ${selectedMerchant.last_name}`,
      email: selectedMerchant.email,
      status: (selectedMerchant.is_active ? (selectedMerchant.is_verified ? 'active' : 'pending') : 'suspended') as 'active' | 'pending' | 'suspended',
      joinDate: selectedMerchant.created_at
    });
    setMerchantFormErrors({});
    setIsEditingMerchant(false);
  };

  // Shopify OAuth modal state
  const [shopifyOAuthModal, setShopifyOAuthModal] = useState<{
    open: boolean;
    merchant: typeof merchants[0] | null;
    step: 'install' | 'credentials' | 'webhooks' | 'authorize' | 'complete';
  }>({
    open: false,
    merchant: null,
    step: 'install'
  });

  // Shopify integration form state
  const [shopifyFormData, setShopifyFormData] = useState({
    apiKey: 'a1b2c3d4e5f6789012345678901234ab',
    apiSecret: 'b2c3d4e5f6789012345678901234abcd',
    webhookSecret: 'c3d4e5f6789012345678901234abcdef',
    webhookUrl: '',
    apiVersion: '2024-10',
    scopes: ['read_orders', 'write_orders', 'read_products', 'write_products', 'read_inventory', 'write_inventory'],
    selectedWebhooks: ['orders/create', 'orders/update', 'products/create', 'products/update', 'inventory/update']
  });

  const [shopifyFormErrors, setShopifyFormErrors] = useState<Record<string, string>>({});
  const [isValidatingCredentials, setIsValidatingCredentials] = useState(false);
  const [isTestingWebhooks, setIsTestingWebhooks] = useState(false);

  // Shopify integration functions
  const handleShopifyConnect = async (merchant: typeof merchants[0]) => {
    // Reset form data and open OAuth modal
    setShopifyFormData({
      apiKey: 'a1b2c3d4e5f6789012345678901234ab',
      apiSecret: 'b2c3d4e5f6789012345678901234abcd',
      webhookSecret: 'c3d4e5f6789012345678901234abcdef',
      webhookUrl: `${window.location.origin}/api/shopify/webhooks`,
      apiVersion: '2024-10',
      scopes: ['read_orders', 'write_orders', 'read_products', 'write_products', 'read_inventory', 'write_inventory'],
      selectedWebhooks: ['orders/create', 'orders/update', 'products/create', 'products/update', 'inventory/update']
    });
    setShopifyFormErrors({});
    setShopifyOAuthModal({
      open: true,
      merchant,
      step: 'install'
    });
  };

  // Handle form input changes
  const handleShopifyFormChange = (field: string, value: string | string[]) => {
    setShopifyFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (shopifyFormErrors[field]) {
      setShopifyFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate Shopify credentials
  const validateShopifyCredentials = async () => {
    const errors: Record<string, string> = {};

    if (!shopifyFormData.apiKey.trim()) {
      errors.apiKey = 'API Key is required';
    } else if (!/^[a-f0-9]{32}$/.test(shopifyFormData.apiKey)) {
      errors.apiKey = 'API Key must be 32 characters long and contain only letters and numbers';
    }

    if (!shopifyFormData.apiSecret.trim()) {
      errors.apiSecret = 'API Secret is required';
    } else if (!/^[a-f0-9]{32}$/.test(shopifyFormData.apiSecret)) {
      errors.apiSecret = 'API Secret must be 32 characters long and contain only letters and numbers';
    }

    if (!shopifyFormData.webhookSecret.trim()) {
      errors.webhookSecret = 'Webhook Secret is required';
    } else if (shopifyFormData.webhookSecret.length < 16) {
      errors.webhookSecret = 'Webhook Secret must be at least 16 characters long';
    }

    if (!shopifyFormData.webhookUrl.trim()) {
      errors.webhookUrl = 'Webhook URL is required';
    } else if (!/^https?:\/\/.+/.test(shopifyFormData.webhookUrl)) {
      errors.webhookUrl = 'Webhook URL must be a valid HTTPS URL';
    }

    setShopifyFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Test webhook configuration
  const testWebhookConfiguration = async () => {
    setIsTestingWebhooks(true);
    try {
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccessToast('Webhook configuration test successful!', {
        duration: 3000,
        showProgressBar: true,
        showCloseButton: true
      });
    } catch (error) {
      showErrorToast('Webhook test failed. Please check your configuration.', {
        duration: 5000,
        showCloseButton: true
      });
    } finally {
      setIsTestingWebhooks(false);
    }
  };

  const handleShopifyOAuthFlow = async () => {
    if (!shopifyOAuthModal.merchant) return;

    const { merchant, step } = shopifyOAuthModal;

    try {
      if (step === 'install') {
        // Step 1: Install app
        setShopifyOAuthModal(prev => ({ ...prev, step: 'credentials' }));

      } else if (step === 'credentials') {
        // Step 2: Validate credentials
        const isValid = await validateShopifyCredentials();
        if (isValid) {
          setShopifyOAuthModal(prev => ({ ...prev, step: 'webhooks' }));
        } else {
          showErrorToast('Please fix the validation errors before proceeding.', {
            duration: 4000,
            showCloseButton: true
          });
        }

      } else if (step === 'webhooks') {
        // Step 3: Configure webhooks - Add validation
        if (shopifyFormData.selectedWebhooks.length === 0) {
          showErrorToast('Please select at least one webhook event to continue.', {
            duration: 4000,
            showCloseButton: true
          });
          return;
        }
        setShopifyOAuthModal(prev => ({ ...prev, step: 'authorize' }));

      } else if (step === 'authorize') {
        // Step 4: Authorize permissions
        setShopifyOAuthModal(prev => ({ ...prev, step: 'complete' }));
        await new Promise(resolve => setTimeout(resolve, 2000));

      } else if (step === 'complete') {
        // Step 5: Complete setup and connect
        const shopDomain = `${String(getMerchantProperty(merchant, 'businessName')).toLowerCase().replace(/[^a-z0-9]/g, '-')}.myshopify.com`;
        const updatedMerchant = {
          ...merchant,
          shopifyIntegration: {
            connected: true,
            shopDomain: shopDomain as string,
            lastSync: new Date().toISOString(),
            syncStatus: 'success' as const,
            productsSynced: Math.floor(Math.random() * 50) + 10,
            ordersSynced: Math.floor(Math.random() * 20) + 5,
            webhooks: {
              ordersCreate: { registered: true, lastTriggered: new Date().toISOString() },
              ordersUpdate: { registered: true, lastTriggered: new Date().toISOString() },
              productsUpdate: { registered: true, lastTriggered: new Date(Date.now() - 3600000).toISOString() },
              inventoryUpdate: { registered: true, lastTriggered: new Date(Date.now() - 7200000).toISOString() }
            }
          }
        } as unknown as typeof merchants[0];

        // Update merchant data
        const updatedMerchants = merchants.map(m =>
          m.id === merchant.id ? updatedMerchant : m
        );
        setFilteredMerchants(prev =>
          prev.map(m => m.id === merchant.id ? updatedMerchant : m)
        );

        // Close modal
        setShopifyOAuthModal({ open: false, merchant: null, step: 'install' });

        showSuccessToast(`Shopify store connected successfully!`, {
          duration: 4000,
          showProgressBar: true,
          showCloseButton: true
        });
      }
    } catch (error) {
      setShopifyOAuthModal({ open: false, merchant: null, step: 'install' });
      showErrorToast('Failed to connect Shopify store. Please try again.', {
        duration: 5000,
        showCloseButton: true
      });
    }
  };

  const handleShopifyDisconnect = async (merchant: typeof merchants[0]) => {
    setIsDisconnectingShopify(true);

    try {
      // Mock disconnection process
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedMerchant = {
        ...merchant,
        shopifyIntegration: {
          connected: false,
          shopDomain: null,
          lastSync: null,
          syncStatus: null,
          productsSynced: 0,
          ordersSynced: 0
        }
      } as unknown as typeof merchants[0];

      // Update merchant data
      const updatedMerchants = merchants.map(m =>
        m.id === merchant.id ? updatedMerchant : m
      );
      setFilteredMerchants(prev =>
        prev.map(m => m.id === merchant.id ? updatedMerchant : m)
      );

      showSuccessToast(`Shopify integration disconnected successfully!`, {
        showCloseButton: true,
        duration: 4000,
        showProgressBar: true
      });

    } catch (error) {
      showErrorToast('Failed to disconnect Shopify integration. Please try again.', {
        duration: 5000,
        showCloseButton: true
      });
    } finally {
      setIsDisconnectingShopify(false);
    }
  };

  const handleShopifySync = async (merchant: typeof merchants[0]) => {
    setIsSyncingShopify(true);

    try {
      // Mock sync process
      await new Promise(resolve => setTimeout(resolve, 3000));

        const updatedMerchant = {
          ...merchant,
          shopifyIntegration: {
            connected: true,
            shopDomain: merchant.shopifyIntegration.shopDomain || 'example.myshopify.com',
            lastSync: new Date().toISOString(),
            syncStatus: 'success' as const,
            productsSynced: merchant.shopifyIntegration.productsSynced + Math.floor(Math.random() * 10),
            ordersSynced: merchant.shopifyIntegration.ordersSynced + Math.floor(Math.random() * 5),
            webhooks: {
              ordersCreate: {
                registered: true,
                lastTriggered: new Date().toISOString()
              },
              ordersUpdate: {
                registered: true,
                lastTriggered: new Date().toISOString()
              },
              productsUpdate: {
                registered: true,
                lastTriggered: new Date().toISOString()
              },
              inventoryUpdate: {
                registered: true,
                lastTriggered: new Date().toISOString()
              }
            }
          }
        } as unknown as typeof merchants[0];

      // Update merchant data
      const updatedMerchants = merchants.map(m =>
        m.id === merchant.id ? updatedMerchant : m
      );
      setFilteredMerchants(prev =>
        prev.map(m => m.id === merchant.id ? updatedMerchant : m)
      );

      showSuccessToast(`Shopify data synced successfully!`, {
        duration: 4000,
        showProgressBar: true,
        showCloseButton: true
      });

    } catch (error) {
      showErrorToast('Failed to sync Shopify data. Please try again.', {
        duration: 5000,
        showCloseButton: true
      });
    } finally {
      setIsSyncingShopify(false);
    }
  };

  // Fetch merchant statistics when selected
  useEffect(() => {
    const fetchMerchantStats = async () => {
      if (!selectedMerchant) {
        setMerchantStats(null);
        return;
      }
      
      try {
        const response = await adminService.getUserStatistics(selectedMerchant.id);
        const stats = response.data;
        
        setMerchantStats({
          totalShipments: stats.delivered_shipments + stats.in_transit_shipments + 
                         stats.in_warehouse_shipments + stats.undelivered_shipments + 
                         stats.unfulfilled_shipments,
          delivered: stats.delivered_shipments,
          inTransit: stats.in_transit_shipments,
          inWarehouse: stats.in_warehouse_shipments
        });
      } catch (error) {
        console.error('Failed to fetch merchant statistics:', error);
        setMerchantStats({
          totalShipments: 0,
          delivered: 0,
          inTransit: 0,
          inWarehouse: 0
        });
      }
    };

    fetchMerchantStats();
  }, [selectedMerchant]);

  // Initialize form data when merchant is selected
  useEffect(() => {
    if (selectedMerchant && !isEditingMerchant) {
      setEditFormData({
        businessName: selectedMerchant.business_name,
        contactName: `${selectedMerchant.first_name} ${selectedMerchant.last_name}`,
        email: selectedMerchant.email,
        status: (selectedMerchant.is_active ? (selectedMerchant.is_verified ? 'active' : 'pending') : 'suspended') as 'active' | 'pending' | 'suspended',
        joinDate: selectedMerchant.created_at
      });
    }
  }, [selectedMerchant, isEditingMerchant]);

  // Merchant Details Modal - Now Editable
  const renderMerchantDetailsModal = () => {
    if (!selectedMerchant) return null;

    const stats = [
      {
        label: "Total Shipments",
        value: merchantStats ? merchantStats.totalShipments.toLocaleString() : '0',
        icon: "Package",
        color: "text-blue-600 bg-blue-100"
      },
      {
        label: "Member Since",
        value: new Date(selectedMerchant.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        icon: "Calendar",
        color: "text-purple-600 bg-purple-100"
      }
    ];

    return (
      <Dialog open={!!selectedMerchant} onOpenChange={() => {
        setSelectedMerchant(null);
        setIsEditingMerchant(false);
        setMerchantFormErrors({});
      }}>
        <DialogContent
          className={cn(
            "bg-white max-h-[90vh] overflow-y-auto w-[95vw] max-w-none",
            "sm:w-[90vw] sm:max-w-2xl",
            "md:w-[85vw] md:max-w-3xl",
            "lg:w-[80vw] lg:max-w-4xl"
          )}
          id={`parcego-merchant-details-${selectedMerchant.id}`}
        >
          <DialogHeader className="space-y-3 sm:space-y-4">
            <DialogTitle className={cn(
              "flex flex-col sm:flex-row sm:items-center justify-between gap-2",
              "text-lg sm:text-xl"
            )}>
              <div className="flex items-center gap-2">
                <span className="truncate">Merchant Details</span>
                <div className="flex-shrink-0">
                  {getStatusBadge(String(getMerchantProperty(selectedMerchant, 'status')))}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {isEditingMerchant ? 'Edit merchant information below' : `Detailed information about ${getMerchantProperty(selectedMerchant, 'businessName')}`}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* Business Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
                Business Information
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor={`business-name-${selectedMerchant.id}`}>
                    Business Name{isEditingMerchant && ' *'}
                  </label>
                  {isEditingMerchant ? (
                    <Input
                      id={`business-name-${selectedMerchant.id}`}
                      value={editFormData.businessName}
                      onChange={(e) => handleMerchantInputChange('businessName', e.target.value)}
                      className={cn(
                        "transition-colors focus:ring-2 focus:ring-blue-500",
                        merchantFormErrors.businessName && "border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Enter business name"
                      aria-describedby={isEditingMerchant && merchantFormErrors.businessName ? `business-name-error-${selectedMerchant.id}` : undefined}
                    />
                  ) : (
                    <p className="font-medium py-2">{getMerchantProperty(selectedMerchant, 'businessName')}</p>
                  )}
                  {isEditingMerchant && merchantFormErrors.businessName && (
                    <p id={`business-name-error-${selectedMerchant.id}`} className="text-sm text-red-600" role="alert">
                      {merchantFormErrors.businessName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Merchant ID
                  </label>
                  <p className="font-medium py-2 text-gray-500">{selectedMerchant.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor={`status-${selectedMerchant.id}`}>
                    Status{isEditingMerchant && ' *'}
                  </label>
                  {isEditingMerchant ? (
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) => handleMerchantInputChange('status', value)}
                    >
                      <SelectTrigger
                        id={`status-${selectedMerchant.id}`}
                        className={cn(
                          "transition-colors focus:ring-2 focus:ring-blue-500",
                          merchantFormErrors.status && "border-red-500 focus:ring-red-500"
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="py-2">{getStatusBadge(String(getMerchantProperty(selectedMerchant, 'status')))}</div>
                  )}
                  {isEditingMerchant && merchantFormErrors.status && (
                    <p className="text-sm text-red-600" role="alert">
                      {merchantFormErrors.status}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor={`join-date-${selectedMerchant.id}`}>
                    Join Date{isEditingMerchant && ' *'}
                  </label>
                  {isEditingMerchant ? (
                    <Input
                      id={`join-date-${selectedMerchant.id}`}
                      type="date"
                      value={editFormData.joinDate}
                      onChange={(e) => handleMerchantInputChange('joinDate', e.target.value)}
                      className={cn(
                        "transition-colors focus:ring-2 focus:ring-blue-500",
                        merchantFormErrors.joinDate && "border-red-500 focus:ring-red-500"
                      )}
                      aria-describedby={isEditingMerchant && merchantFormErrors.joinDate ? `join-date-error-${selectedMerchant.id}` : undefined}
                    />
                  ) : (
                    <p className="font-medium py-2">
                      {new Date(selectedMerchant.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  {isEditingMerchant && merchantFormErrors.joinDate && (
                    <p id={`join-date-error-${selectedMerchant.id}`} className="text-sm text-red-600" role="alert">
                      {merchantFormErrors.joinDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor={`contact-name-${selectedMerchant.id}`}>
                    Contact Name{isEditingMerchant && ' *'}
                  </label>
                  {isEditingMerchant ? (
                    <Input
                      id={`contact-name-${selectedMerchant.id}`}
                      value={editFormData.contactName}
                      onChange={(e) => handleMerchantInputChange('contactName', e.target.value)}
                      className={cn(
                        "transition-colors focus:ring-2 focus:ring-blue-500",
                        merchantFormErrors.contactName && "border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Enter contact name"
                      aria-describedby={isEditingMerchant && merchantFormErrors.contactName ? `contact-name-error-${selectedMerchant.id}` : undefined}
                    />
                  ) : (
                    <p className="font-medium py-2">{getMerchantProperty(selectedMerchant, 'contactName')}</p>
                  )}
                  {isEditingMerchant && merchantFormErrors.contactName && (
                    <p id={`contact-name-error-${selectedMerchant.id}`} className="text-sm text-red-600" role="alert">
                      {merchantFormErrors.contactName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor={`email-${selectedMerchant.id}`}>
                    Email{isEditingMerchant && ' *'}
                  </label>
                  {isEditingMerchant ? (
                    <Input
                      id={`email-${selectedMerchant.id}`}
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => handleMerchantInputChange('email', e.target.value)}
                      className={cn(
                        "transition-colors focus:ring-2 focus:ring-blue-500",
                        merchantFormErrors.email && "border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Enter email address"
                      aria-describedby={isEditingMerchant && merchantFormErrors.email ? `email-error-${selectedMerchant.id}` : undefined}
                    />
                  ) : (
                    <p className="font-medium py-2">{selectedMerchant.email}</p>
                  )}
                  {isEditingMerchant && merchantFormErrors.email && (
                    <p id={`email-error-${selectedMerchant.id}`} className="text-sm text-red-600" role="alert">
                      {merchantFormErrors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${stat.color}`}>
                        <Icon name={stat.icon} size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="font-bold text-base sm:text-lg truncate">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shopify Integration Section */}
            {!isEditingMerchant && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
                  Shopify Integration
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {selectedMerchant.shopifyIntegration.connected ? (
                    <div className="space-y-4">
                      {/* Connected Status - Mobile Optimized */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon name="CheckCircle" size={20} className="text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">Shopify Connected</p>
                            <p className="text-sm text-gray-500 truncate">{selectedMerchant.shopifyIntegration.shopDomain}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShopifySync(selectedMerchant)}
                            disabled={isSyncingShopify}
                            className={cn(
                              "h-9 px-3 touch-manipulation",
                              "min-w-[100px] sm:min-w-[120px]"
                            )}
                            id={`parcego-merchant-shopify-sync-${selectedMerchant.id}`}
                          >
                            {isSyncingShopify ? (
                              <>
                                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                                <span className="hidden sm:inline">Syncing...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <Icon name="RefreshCw" size={16} className="mr-2" />
                                <span className="hidden sm:inline">Sync Data</span>
                                <span className="sm:hidden">Sync</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShopifyDisconnect(selectedMerchant)}
                            disabled={isDisconnectingShopify}
                            className={cn(
                              "h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation",
                              "min-w-[120px] sm:min-w-[140px]"
                            )}
                            id={`parcego-merchant-shopify-disconnect-${selectedMerchant.id}`}
                          >
                            {isDisconnectingShopify ? (
                              <>
                                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                                <span className="hidden sm:inline">Disconnecting...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <Icon name="X" size={16} className="mr-2" />
                                <span className="hidden sm:inline">Disconnect</span>
                                <span className="sm:hidden">Remove</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Sync Statistics - Mobile Optimized */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Sync Statistics</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon name="Package" size={16} className="text-blue-600" />
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Products</p>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-blue-600">{selectedMerchant.shopifyIntegration.productsSynced.toLocaleString()}</p>
                          </div>
                          <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon name="ShoppingCart" size={16} className="text-green-600" />
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Orders</p>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-green-600">{selectedMerchant.shopifyIntegration.ordersSynced.toLocaleString()}</p>
                          </div>
                          <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm col-span-2 sm:col-span-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon name="Clock" size={16} className="text-purple-600" />
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Last Sync</p>
                            </div>
                            <p className="text-sm sm:text-base font-medium text-gray-900 leading-tight">
                              {selectedMerchant.shopifyIntegration.lastSync
                                ? new Date(selectedMerchant.shopifyIntegration.lastSync).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Never'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sync Status */}
                      <div className="flex items-center gap-2">
                        <Icon
                          name={selectedMerchant.shopifyIntegration.syncStatus === 'success' ? 'CheckCircle' : 'AlertCircle'}
                          size={16}
                          className={selectedMerchant.shopifyIntegration.syncStatus === 'success' ? 'text-green-500' : 'text-yellow-500'}
                        />
                        <span className="text-sm text-gray-600">
                          {selectedMerchant.shopifyIntegration.syncStatus === 'success'
                            ? 'All data synced successfully'
                            : 'Sync in progress...'
                          }
                        </span>
                      </div>

                      {/* Webhook Status - Mobile Optimized */}
                      {selectedMerchant.shopifyIntegration.webhooks && (
                        <div className="border-t border-gray-200 pt-3 sm:pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Icon name="Webhook" size={16} className="text-indigo-600" />
                            Webhook Status
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(selectedMerchant.shopifyIntegration.webhooks).map(([webhookType, webhookData]) => (
                              <div key={webhookType} className="bg-white rounded-lg border p-3 sm:p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Icon
                                      name={webhookData.registered ? 'CheckCircle' : 'XCircle'}
                                      size={16}
                                      className={webhookData.registered ? 'text-green-500' : 'text-red-500'}
                                    />
                                    <span className="text-sm font-medium capitalize truncate">
                                      {webhookType.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-xs text-gray-500 leading-tight">
                                      {webhookData.lastTriggered
                                        ? new Date(webhookData.lastTriggered).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                          })
                                        : 'Never'
                                      }
                                    </div>
                                    {webhookData.lastTriggered && (
                                      <div className="text-xs text-gray-400">
                                        {new Date(webhookData.lastTriggered).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-800 leading-relaxed">
                              <Icon name="Info" size={14} className="inline mr-1" />
                              Webhooks automatically sync orders, products, and inventory changes from Shopify to ensure real-time data consistency.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Not Connected Status - Mobile Optimized */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon name="ShoppingCart" size={20} className="text-gray-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">Shopify Not Connected</p>
                            <p className="text-sm text-gray-500">Connect your Shopify store to enable order syncing</p>
                          </div>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleShopifyConnect(selectedMerchant)}
                          disabled={isConnectingShopify}
                          className={cn(
                            "h-10 px-4 bg-green-600 hover:bg-green-700 touch-manipulation",
                            "w-full sm:w-auto min-w-[160px]"
                          )}
                          id={`parcego-merchant-shopify-connect-${selectedMerchant.id}`}
                        >
                          {isConnectingShopify ? (
                            <>
                              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                              <span className="hidden sm:inline">Connecting...</span>
                              <span className="sm:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <Icon name="ShoppingCart" size={16} className="mr-2" />
                              <span className="hidden sm:inline">Connect Shopify</span>
                              <span className="sm:hidden">Connect Store</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Benefits List - Mobile Optimized */}
                      <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
                          <Icon name="Star" size={16} className="text-blue-600" />
                          Benefits of Shopify Integration
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-start gap-2">
                            <Icon name="ArrowRight" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-blue-800">Automatic order import</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Icon name="ArrowRight" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-blue-800">Real-time inventory sync</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Icon name="ArrowRight" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-blue-800">Customer data consistency</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Icon name="ArrowRight" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-blue-800">Streamlined shipping workflow</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 sm:pt-6 border-t bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 mt-6 rounded-b-lg">
              {/* Left side - Integration buttons */}
              <div className="flex items-center gap-2">
                {/* Future: Integration action buttons can go here */}
              </div>

              {/* Right side - Edit/Save/Cancel buttons */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {isEditingMerchant && (
                  <Button
                    variant="default"
                    onClick={handleMerchantSave}
                    disabled={isSavingMerchant}
                    className={cn(
                      "bg-blue-600 hover:bg-blue-700 text-white font-medium",
                      "h-10 px-4 sm:px-6 py-2 touch-manipulation",
                      "flex-1 sm:flex-initial"
                    )}
                    id={`parcego-merchant-details-save-${selectedMerchant.id}`}
                  >
                    {isSavingMerchant ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="Save" size={16} className="mr-2" />
                        <span className="hidden sm:inline">Save Changes</span>
                        <span className="sm:hidden">Save</span>
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                  if (isEditingMerchant) {
                    handleMerchantCancelEdit();
                  } else {
                    setSelectedMerchant(null);
                  }
                  }}
                  disabled={isSavingMerchant}
                  className={cn(
                    "h-10 px-4 sm:px-6 py-2 touch-manipulation",
                    "flex-1 sm:flex-initial"
                  )}
                  id={`parcego-merchant-details-close-${selectedMerchant.id}`}
                >
                  {isEditingMerchant ? (
                    <span className="hidden sm:inline">Cancel</span>
                  ) : (
                    <span className="hidden sm:inline">Close</span>
                  )}
                  <span className="sm:hidden">
                    {isEditingMerchant ? 'Cancel' : 'Close'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Courier Action Modal (Approve/Suspend)
  const renderCourierActionModal = () => {
    if (!selectedCourierForAction || !courierActionType) return null;

    const actionTitle = 'Suspend Courier';
    const actionIcon = 'Ban';
    const actionColor = 'text-red-600';
    const actionBgColor = 'bg-red-50';
    const actionBorderColor = 'border-red-200';

    return (
      <Dialog
        open={courierActionModalOpen}
        onOpenChange={(open) => {
          if (!open) cancelCourierAction();
        }}
      >
        <DialogContent
          className={cn(
            "sm:max-w-lg bg-white",
            isMobile ? "w-[95vw] max-w-none" : "sm:max-w-lg"
          )}
          id="parcego-courier-action-modal"
        >
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full",
                actionBgColor
              )}>
                <Icon name={actionIcon} size={24} className={actionColor} />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {actionTitle}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Confirm action for {getCourierProperty(selectedCourierForAction, 'fullName')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Action Information */}
            <Alert className={cn(actionBorderColor, actionBgColor)}>
              <Icon name={actionIcon} size={16} className={actionColor} />
              <AlertDescription className="font-medium">
                <span>
                  Suspending this courier will temporarily disable their account.
                  They will lose access to all delivery assignments until their account is reactivated.
                </span>
              </AlertDescription>
            </Alert>

            {/* Courier Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">Courier Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <p className="font-medium">{getCourierProperty(selectedCourierForAction, 'fullName')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{selectedCourierForAction.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">ID:</span>
                  <p className="font-medium">{selectedCourierForAction.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Vehicle:</span>
                  <p className="font-medium">{getCourierProperty(selectedCourierForAction, 'vehicle')}</p>
                </div>
                <div>
                  <span className="text-gray-500">City:</span>
                  <p className="font-medium">{getCourierProperty(selectedCourierForAction, 'city')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Status:</span>
                  {getStatusBadge(String(getCourierProperty(selectedCourierForAction, 'status')))}
                </div>
              </div>
            </div>

            {/* Notes Field */}
            <div className="space-y-2">
              <label
                htmlFor="courier-action-notes"
                className="text-sm font-medium text-gray-700"
              >
                Suspension Reason (Optional)
              </label>
              <Textarea
                id="courier-action-notes"
                placeholder="Provide reason for suspension and any relevant details..."
                value={courierActionNotes}
                onChange={(e) => setCourierActionNotes(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isProcessingCourierAction}
                aria-describedby="courier-notes-help"
              />
              <p id="courier-notes-help" className="text-xs text-gray-500">
                These notes will be recorded for audit purposes and may be visible to the courier.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={cancelCourierAction}
                disabled={isProcessingCourierAction}
                className="w-full sm:w-auto"
                id="parcego-courier-action-cancel"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={processCourierAction}
                disabled={isProcessingCourierAction}
                className="w-full sm:w-auto"
                id="parcego-courier-action-confirm"
              >
                {isProcessingCourierAction ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon name={actionIcon} size={16} className="mr-2" />
                    Suspend Courier
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Courier Edit Modal (as component to preserve parent hook order)
  const CourierEditModal = () => {
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm<CourierEditFormData>({
      resolver: zodResolver(courierEditSchema),
      defaultValues: editingCourier ? {
        fullName: String(getCourierProperty(editingCourier, 'fullName')),
        email: editingCourier.email,
        phone: String(getCourierProperty(editingCourier, 'phone')),
        status: getCourierProperty(editingCourier, 'status') as "active" | "inactive" | "suspended",
        city: String(getCourierProperty(editingCourier, 'city')),
        notes: String(getCourierProperty(editingCourier, 'notes') || "")
      } : undefined
    });


    const onSubmit = (data: any) => {
      handleCourierEditSave(data as CourierEditFormData);
    };

    if (!editingCourier) return null;

    return (
      <Dialog open={isCourierEditOpen} onOpenChange={(open) => {
        if (!open) handleCourierEditCancel();
      }}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-gray-100">
                <AvatarFallback className="text-lg bg-indigo-100 text-indigo-600">
                  {(() => {
                    const fullName = String(getCourierProperty(editingCourier, 'fullName'));
                    return fullName.split(' ').map((n: string) => n.charAt(0)).join('');
                  })()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold text-gray-900 mb-1">
                  Edit Courier Information
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Update {getCourierProperty(editingCourier, 'fullName')}'s profile information and settings
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="font-normal">
                    ID: {editingCourier.id}
                  </Badge>
                  <Badge className="font-normal bg-blue-50 text-blue-700">
                    {getCourierProperty(editingCourier, 'completedDeliveries')} deliveries
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-fullName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <Input
                    id="edit-fullName"
                    {...register("fullName")}
                    className={cn(
                      "transition-all duration-200",
                      errors.fullName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    )}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <Input
                    id="edit-email"
                    type="email"
                    {...register("email")}
                    className={cn(
                      "transition-all duration-200",
                      errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    )}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <Input
                    id="edit-phone"
                    {...register("phone")}
                    className={cn(
                      "transition-all duration-200",
                      errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    )}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-city" className="text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <Input
                    id="edit-city"
                    {...register("city")}
                    className={cn(
                      "transition-all duration-200",
                      errors.city ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    )}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-status" className="text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <Select
                    value={watch("status")}
                    onValueChange={(value) => reset({ ...watch(), status: value as any })}
                  >
                    <SelectTrigger className="transition-all duration-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {errors.status.message}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <label htmlFor="edit-notes" className="text-sm font-medium text-gray-700">
                Notes
              </label>
              <Textarea
                id="edit-notes"
                {...register("notes")}
                className={cn(
                  "transition-all duration-200 min-h-[80px]",
                  errors.notes ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                )}
                placeholder="Add any additional notes about this courier..."
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
                {errors.notes && (
                  <p className="text-red-600 flex items-center gap-1">
                    <Icon name="AlertCircle" size={14} />
                    {errors.notes.message}
                  </p>
                )}
                <span className="ml-auto">{watch("notes")?.length || 0}/500</span>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCourierEditCancel}
                disabled={isSavingCourier}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingCourier || !isDirty}
                className="px-6 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSavingCourier ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Merchant Action Modal (Approve/Suspend)

  const renderMerchantActionModal = () => {
    if (!selectedMerchantForAction || !actionType) return null;

    const isApprove = actionType === 'approve';
    const actionTitle = isApprove ? 'Approve Merchant' : 'Suspend Merchant';
    const actionIcon = isApprove ? 'UserCheck' : 'Ban';
    const actionColor = isApprove ? 'text-green-600' : 'text-red-600';
    const actionBgColor = isApprove ? 'bg-green-50' : 'bg-red-50';
    const actionBorderColor = isApprove ? 'border-green-200' : 'border-red-200';

    return (
      <Dialog
        open={actionModalOpen}
        onOpenChange={(open) => {
          if (!open) cancelMerchantAction();
        }}
      >
        <DialogContent
          className={cn(
            "sm:max-w-lg bg-white",
            isMobile ? "w-[95vw] max-w-none" : "sm:max-w-lg"
          )}
          id="parcego-merchant-action-modal"
        >
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full",
                actionBgColor
              )}>
                <Icon name={actionIcon} size={24} className={actionColor} />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {actionTitle}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Confirm action for {getMerchantProperty(selectedMerchantForAction, 'businessName')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Action Information */}
            <Alert className={cn(actionBorderColor, actionBgColor)}>
              <Icon name={actionIcon} size={16} className={actionColor} />
              <AlertDescription className="font-medium">
                {isApprove ? (
                  <span>
                    Approving this merchant will grant them full access to the platform.
                    They will be able to create shipments, track packages, and access all merchant features.
                  </span>
                ) : (
                  <span>
                    Suspending this merchant will temporarily disable their account.
                    They will lose access to all platform features until their account is reactivated.
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Merchant Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">Merchant Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Business:</span>
                  <p className="font-medium">{getMerchantProperty(selectedMerchantForAction, 'businessName')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Contact:</span>
                  <p className="font-medium">{getMerchantProperty(selectedMerchantForAction, 'contactName')}</p>
                </div>
                <div>
                  <span className="text-gray-500">ID:</span>
                  <p className="font-medium">{selectedMerchantForAction.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Status:</span>
                  {getStatusBadge(String(getMerchantProperty(selectedMerchantForAction, 'status')))}
                </div>
              </div>
            </div>

            {/* Notes Field */}
            <div className="space-y-2">
              <label
                htmlFor="action-notes"
                className="text-sm font-medium text-gray-700"
              >
                {isApprove ? 'Approval Notes' : 'Suspension Reason'} (Optional)
              </label>
              <Textarea
                id="action-notes"
                placeholder={
                  isApprove
                    ? "Add any notes about this approval (e.g., verification method, special conditions)..."
                    : "Provide reason for suspension and any relevant details..."
                }
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isProcessingAction}
                aria-describedby="notes-help"
              />
              <p id="notes-help" className="text-xs text-gray-500">
                These notes will be recorded for audit purposes and may be visible to the merchant.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={cancelMerchantAction}
                disabled={isProcessingAction}
                className="w-full sm:w-auto"
                id="parcego-merchant-action-cancel"
              >
                Cancel
              </Button>
              <Button
                variant={isApprove ? "default" : "destructive"}
                onClick={processMerchantAction}
                disabled={isProcessingAction}
                className={cn(
                  "w-full sm:w-auto",
                  isApprove && "bg-green-600 hover:bg-green-700"
                )}
                id="parcego-merchant-action-confirm"
              >
                {isProcessingAction ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon name={actionIcon} size={16} className="mr-2" />
                    {isApprove ? 'Approve Merchant' : 'Suspend Merchant'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Shopify OAuth Modal
  const renderShopifyOAuthModal = () => {
    if (!shopifyOAuthModal.open || !shopifyOAuthModal.merchant) return null;

    const { merchant, step } = shopifyOAuthModal;

    const getStepContent = () => {
      switch (step) {
        case 'install':
          return {
            title: 'Install Parcego App',
            description: 'Install the Parcego app on your Shopify store to enable order synchronization.',
            icon: 'Download',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            content: (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">What will be installed:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Order synchronization webhook</li>
                    <li>• Product inventory tracking</li>
                    <li>• Customer data integration</li>
                    <li>• Shipping label generation</li>
                  </ul>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Icon name="Info" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-900 mb-1">Before you begin:</h4>
                      <p className="text-sm text-amber-800">
                        Make sure you have your Shopify app credentials ready. You&apos;ll need your API Key, API Secret, and Webhook Secret from your Shopify Partner Dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
            buttonText: 'Continue to Setup',
            buttonColor: 'bg-blue-600 hover:bg-blue-700'
          };
        case 'credentials':
          return {
            title: 'API Credentials',
            description: 'Enter your Shopify app credentials to establish secure connection.',
            icon: 'Key',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            content: (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="shopify-api-key">
                      API Key *
                    </label>
                    <Input
                      id="shopify-api-key"
                      type="text"
                      value={shopifyFormData.apiKey}
                      onChange={(e) => handleShopifyFormChange('apiKey', e.target.value)}
                      placeholder="Enter your Shopify API Key"
                      className={cn(
                        "transition-colors focus:ring-2 focus:ring-purple-500",
                        shopifyFormErrors.apiKey && "border-red-500 focus:ring-red-500"
                      )}
                    />
                    {shopifyFormErrors.apiKey && (
                      <p className="text-sm text-red-600">{shopifyFormErrors.apiKey}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Found in your Shopify Partner Dashboard under App setup
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="shopify-api-secret">
                      API Secret *
                    </label>
                    <Input
                      id="shopify-api-secret"
                      type="password"
                      value={shopifyFormData.apiSecret}
                      onChange={(e) => handleShopifyFormChange('apiSecret', e.target.value)}
                      placeholder="Enter your Shopify API Secret"
                      className={cn(
                        "transition-colors focus:ring-2 focus:ring-purple-500",
                        shopifyFormErrors.apiSecret && "border-red-500 focus:ring-red-500"
                      )}
                    />
                    {shopifyFormErrors.apiSecret && (
                      <p className="text-sm text-red-600">{shopifyFormErrors.apiSecret}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Keep this secret secure - it&apos;s used to authenticate API requests
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="shopify-webhook-secret">
                      Webhook Secret *
                    </label>
                    <Input
                      id="shopify-webhook-secret"
                      type="password"
                      value={shopifyFormData.webhookSecret}
                      onChange={(e) => handleShopifyFormChange('webhookSecret', e.target.value)}
                      placeholder="Enter your Webhook Secret"
                      className={cn(
                        "transition-colors focus:ring-2 focus:ring-purple-500",
                        shopifyFormErrors.webhookSecret && "border-red-500 focus:ring-red-500"
                      )}
                    />
                    {shopifyFormErrors.webhookSecret && (
                      <p className="text-sm text-red-600">{shopifyFormErrors.webhookSecret}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Used to verify webhook authenticity from Shopify
                    </p>
                  </div>

                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900 mb-1">Security Note:</h4>
                      <p className="text-sm text-green-800">
                        All credentials are encrypted and stored securely. We never store your API secrets in plain text.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
            buttonText: 'Validate & Continue',
            buttonColor: 'bg-purple-600 hover:bg-purple-700'
          };
        case 'webhooks':
          return {
            title: 'Webhook Configuration',
            description: 'Configure webhooks to receive real-time updates from your Shopify store.',
            icon: 'Webhook',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            content: (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="webhook-url">
                      Webhook URL *
                    </label>
                    <Input
                      id="webhook-url"
                      type="url"
                      value={shopifyFormData.webhookUrl}
                      onChange={(e) => handleShopifyFormChange('webhookUrl', e.target.value)}
                      placeholder="https://your-domain.com/api/shopify/webhooks"
                      className={cn(
                        "transition-colors focus:ring-2 focus:ring-orange-500",
                        shopifyFormErrors.webhookUrl && "border-red-500 focus:ring-red-500"
                      )}
                    />
                    {shopifyFormErrors.webhookUrl && (
                      <p className="text-sm text-red-600">{shopifyFormErrors.webhookUrl}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      This URL will receive webhook notifications from Shopify
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Select Webhook Events
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'orders/create', label: 'Order Created', description: 'When a new order is placed' },
                        { id: 'orders/update', label: 'Order Updated', description: 'When an order is modified' },
                        { id: 'orders/paid', label: 'Order Paid', description: 'When an order payment is completed' },
                        { id: 'products/create', label: 'Product Created', description: 'When a new product is added' },
                        { id: 'products/update', label: 'Product Updated', description: 'When product details change' },
                        { id: 'inventory/update', label: 'Inventory Updated', description: 'When stock levels change' },
                        { id: 'customers/create', label: 'Customer Created', description: 'When a new customer registers' },
                        { id: 'customers/update', label: 'Customer Updated', description: 'When customer details change' }
                      ].map((webhook) => (
                        <div key={webhook.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            id={`webhook-${webhook.id}`}
                            checked={shopifyFormData.selectedWebhooks.includes(webhook.id)}
                            onChange={(e) => {
                              const newWebhooks = e.target.checked
                                ? [...shopifyFormData.selectedWebhooks, webhook.id]
                                : shopifyFormData.selectedWebhooks.filter(w => w !== webhook.id);
                              handleShopifyFormChange('selectedWebhooks', newWebhooks);
                            }}
                            className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <label htmlFor={`webhook-${webhook.id}`} className="text-sm font-medium text-gray-900 cursor-pointer">
                              {webhook.label}
                            </label>
                            <p className="text-xs text-gray-500">{webhook.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testWebhookConfiguration}
                        disabled={isTestingWebhooks}
                        className="h-9 px-3"
                      >
                        {isTestingWebhooks ? (
                          <>
                            <Icon name="Loader2" size={14} className="mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Icon name="TestTube" size={14} className="mr-2" />
                            Test Configuration
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500">
                        Test your webhook endpoint to ensure it&apos;s working correctly
                      </p>
                    </div>
                    
                    {/* Continue Button for Webhooks Step */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {shopifyFormData.selectedWebhooks.length > 0 ? (
                          <span className="text-emerald-600 font-medium">
                            <Icon name="CheckCircle" size={14} className="inline mr-1" />
                            {shopifyFormData.selectedWebhooks.length} webhook{shopifyFormData.selectedWebhooks.length !== 1 ? 's' : ''} selected
                          </span>
                        ) : (
                          <span className="text-amber-600">
                            <Icon name="AlertCircle" size={14} className="inline mr-1" />
                            Please select at least one webhook event
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={handleShopifyOAuthFlow}
                        className="bg-orange-600 hover:bg-orange-700 text-white h-9 px-4 transition-all duration-200"
                        disabled={shopifyFormData.selectedWebhooks.length === 0}
                      >
                        <Icon name="ArrowRight" size={14} className="mr-2" />
                        Continue to Authorization
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Webhook Security:</h4>
                      <p className="text-sm text-blue-800">
                        All webhooks are signed with your webhook secret to ensure authenticity. Make sure your endpoint can verify these signatures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
            buttonText: 'Configure Webhooks',
            buttonColor: 'bg-orange-600 hover:bg-orange-700'
          };
        case 'authorize':
          return {
            title: 'Authorize Permissions',
            description: 'Grant Parcego access to your Shopify store data.',
            icon: 'Shield',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            content: (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Required permissions:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Read orders and create fulfillments</li>
                    <li>• Read and update products</li>
                    <li>• Read customer information</li>
                    <li>• Manage inventory levels</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Selected Scopes:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {shopifyFormData.scopes.map((scope) => (
                      <div key={scope} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <Icon name="Check" size={14} className="text-green-600" />
                        <span className="text-gray-700">{scope.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Icon name="AlertTriangle" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-900 mb-1">Important:</h4>
                      <p className="text-sm text-amber-800">
                        You&apos;ll be redirected to Shopify to authorize these permissions. Only grant access if you trust this application.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
            buttonText: 'Authorize Access',
            buttonColor: 'bg-green-600 hover:bg-green-700'
          };
        case 'complete':
          return {
            title: 'Setup Complete',
            description: 'Your Shopify store has been successfully connected to Parcego.',
            icon: 'CheckCircle',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            content: (
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-emerald-900 mb-2">Connection established for:</h4>
                  <p className="text-sm text-emerald-800">{getMerchantProperty(merchant, 'businessName')}</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Store: {String(getMerchantProperty(merchant, 'businessName')).toLowerCase().replace(/[^a-z0-9]/g, '-')}.myshopify.com
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Integration Summary:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Webhook Events:</span>
                      <span className="font-medium">{shopifyFormData.selectedWebhooks.length} configured</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Scopes:</span>
                      <span className="font-medium">{shopifyFormData.scopes.length} permissions</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Icon name="CheckCircle" size={48} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Ready to sync orders and products!</p>
                </div>
              </div>
            ),
            buttonText: 'Complete Setup',
            buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
          };
        default:
          return null;
      }
    };

    const stepContent = getStepContent();
    if (!stepContent) return null;

    const getStepNumber = (step: string) => {
      const stepMap = { 'install': 1, 'credentials': 2, 'webhooks': 3, 'authorize': 4, 'complete': 5 };
      return stepMap[step as keyof typeof stepMap] || 1;
    };

    const currentStep = getStepNumber(step);

    return (
      <Dialog
        open={shopifyOAuthModal.open}
        onOpenChange={(open) => {
          if (!open) setShopifyOAuthModal({ open: false, merchant: null, step: 'install' });
        }}
      >
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto" id="parcego-shopify-oauth-modal">
          <DialogHeader className="space-y-6 pb-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-full ${stepContent.bgColor} flex items-center justify-center shadow-lg transition-all duration-300`}>
                <Icon name={stepContent.icon} size={28} className={stepContent.color} />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {stepContent.title}
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-base leading-relaxed">
                  {stepContent.description}
                </DialogDescription>
              </div>
            </div>

            {/* Enhanced Progress Indicator with Better Alignment */}
            <div className="w-full">
              <div className="flex items-center justify-between relative">
                {/* Progress Line Background */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 rounded-full" />
                
                {/* Progress Line Active */}
                <div 
                  className="absolute top-4 left-4 h-0.5 bg-emerald-600 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${((currentStep - 1) / 4) * 100}%` 
                  }}
                />
                
                {/* Step Indicators */}
                {[1, 2, 3, 4, 5].map((stepNum) => (
                  <div key={stepNum} className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      stepNum < currentStep ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' :
                      stepNum === currentStep ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {stepNum < currentStep ? <Icon name="Check" size={14} /> : stepNum}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-xs font-medium transition-colors duration-300 ${
                        stepNum <= currentStep ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {['Install', 'Credentials', 'Webhooks', 'Authorize', 'Complete'][stepNum - 1]}
                      </div>
                      <div className={`text-xs mt-0.5 transition-colors duration-300 ${
                        stepNum < currentStep ? 'text-emerald-600' :
                        stepNum === currentStep ? 'text-blue-600' :
                        'text-gray-400'
                      }`}>
                        {stepNum < currentStep ? 'Completed' :
                         stepNum === currentStep ? 'In Progress' :
                         'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogHeader>

          <div className="mt-8 px-1">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              {stepContent.content}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 'install') {
                  setShopifyOAuthModal({ open: false, merchant: null, step: 'install' });
                } else {
                  // Go back to previous step
                  const stepOrder = ['install', 'credentials', 'webhooks', 'authorize', 'complete'];
                  const currentIndex = stepOrder.indexOf(step);
                  const prevStep = currentIndex > 0 ? stepOrder[currentIndex - 1] : 'install';
                  setShopifyOAuthModal(prev => ({ ...prev, step: prevStep as any }));
                }
              }}
              disabled={step === 'complete'}
              className="h-10 px-6 transition-all duration-200 hover:bg-gray-50"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              {step === 'install' ? 'Cancel' : 'Back'}
            </Button>
            
            <div className="flex items-center gap-3">
              {/* Step Progress Indicator */}
              <div className="text-sm text-gray-500">
                Step {currentStep} of 5
              </div>
              
              <Button
                onClick={handleShopifyOAuthFlow}
                className={cn(
                  stepContent.buttonColor, 
                  "h-10 px-6 transition-all duration-200 font-medium",
                  "hover:shadow-lg hover:scale-105 active:scale-95"
                )}
                disabled={step === 'webhooks' && shopifyFormData.selectedWebhooks.length === 0}
              >
                {stepContent.buttonText}
                {step !== 'complete' && (
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Manual Assignment Modal
  const renderManualAssignmentModal = () => {
    if (!isManualAssignmentOpen) return null;

    return (
      <Dialog open={isManualAssignmentOpen} onOpenChange={setIsManualAssignmentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Manual Assignment</DialogTitle>
            <DialogDescription>
              Assign a shipment to a driver manually.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shipment_id" className="text-right">
                Shipment ID
              </Label>
              <Input
                id="shipment_id"
                type="number"
                placeholder="Enter shipment ID"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driver_id" className="text-right">
                Driver ID
              </Label>
              <Input
                id="driver_id"
                type="number"
                placeholder="Enter driver ID"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes *
              </Label>
              <Textarea
                id="notes"
                placeholder="Assignment notes (required)"
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualAssignmentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              const shipmentId = (document.getElementById('shipment_id') as HTMLInputElement)?.value;
              const driverId = (document.getElementById('driver_id') as HTMLInputElement)?.value;
              const notes = (document.getElementById('notes') as HTMLTextAreaElement)?.value;

              if (!shipmentId || !driverId) {
                showErrorToast('Please fill in all required fields');
                return;
              }

              if (!notes || notes.trim() === '') {
                showErrorToast('Please provide assignment notes');
                return;
              }

              try {
                await adminService.createManualAssignment({
                  shipment_id: parseInt(shipmentId),
                  driver_id: parseInt(driverId),
                  notes: notes.trim()
                });
                
                showSuccessToast('Manual assignment created successfully!');
                setIsManualAssignmentOpen(false);
                
                // Reload assignments
                const dateStr = format(selectedAssignmentDate, 'yyyy-MM-dd');
                const assignmentsResponse = await adminService.getAssignmentsByDate(dateStr);
                setAssignments(assignmentsResponse.data.assignments || []);
              } catch (error) {
                console.error('Failed to create manual assignment:', error);
                showErrorToast('Failed to create assignment. Please try again.');
              }
            }}>
              Create Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Reassign Assignment Modal
  const renderReassignModal = () => {
    if (!isReassignModalOpen || !selectedAssignment) return null;

    return (
      <Dialog open={isReassignModalOpen} onOpenChange={setIsReassignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reassign Assignment</DialogTitle>
            <DialogDescription>
              Reassign this assignment to a different driver.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_driver_id" className="text-right">
                New Driver ID
              </Label>
              <Input
                id="new_driver_id"
                type="number"
                placeholder="Enter new driver ID"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reassign_notes" className="text-right">
                Notes *
              </Label>
              <Textarea
                id="reassign_notes"
                placeholder="Reassignment notes (required)"
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              const newDriverId = (document.getElementById('new_driver_id') as HTMLInputElement)?.value;
              const notes = (document.getElementById('reassign_notes') as HTMLTextAreaElement)?.value;

              if (!newDriverId) {
                showErrorToast('Please enter a new driver ID');
                return;
              }

              if (!notes || notes.trim() === '') {
                showErrorToast('Please provide reassignment notes');
                return;
              }

              if (!selectedAssignment) {
                showErrorToast('No assignment selected');
                return;
              }

              try {
                await handleReassignAssignment(parseInt(newDriverId), notes.trim());
              } catch (error) {
                console.error('Failed to reassign assignment:', error);
                showErrorToast('Failed to reassign assignment. Please try again.');
              }
            }}>
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" id="parcego-admin-dashboard-container">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      {/* Merchant Details Modal */}
      {renderMerchantDetailsModal()}

      {/* Merchant Action Modal */}
      {renderMerchantActionModal()}

      {/* Courier Action Modal */}
      {renderCourierActionModal()}


      {/* Courier Edit Modal */}
      {(isCourierEditOpen || !!editingCourier) && <CourierEditModal />}

      {/* Courier Creation Modal */}
      <CourierCreationModal
        isOpen={isCourierCreationOpen}
        onClose={() => setIsCourierCreationOpen(false)}
        onSuccess={handleCourierCreationSuccess}
      />

      {/* Shopify OAuth Modal */}
      {renderShopifyOAuthModal()}

      {/* Manual Assignment Modal */}
      {renderManualAssignmentModal()}

      {/* Reassign Assignment Modal */}
      {renderReassignModal()}
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-[100] shadow-sm" id="parcego-admin-header">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left Section - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              id="parcego-admin-mobile-menu-btn"
            >
              <Icon name="Menu" size={20} />
            </Button>

            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Image
                src="/Logo/Horizontal-logo.svg"
                alt="Parcego Logo"
                width={150}
                height={30}
                className="h-8 w-auto"
                unoptimized
                priority
              />
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Admin</Badge>
            </div>
          </div>
          
          {/* Right Section - Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell - Hidden */}
            {/* <NotificationDropdown /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 p-2"
                  aria-label="User menu"
                  id="parcego-admin-user-menu-btn"
                >
                  <Avatar className="h-8 w-8" id="parcego-admin-avatar">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm font-medium">SA</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{adminName}</p>
                    <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{adminName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{adminEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Icon name="User" size={16} className="mr-2" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Icon name="Settings" size={16} className="mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => {
                    // Clear admin authentication
                    localStorage.removeItem("admin_authenticated");
                    localStorage.removeItem("admin_email");
                    localStorage.removeItem("admin_login_time");
                    document.cookie = "admin_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    
                    // Redirect to admin login
                    router.push("/admin-login");
                  }}
                >
                  <Icon name="LogOut" size={16} className="mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-x-0 top-16 bottom-0 bg-black bg-opacity-75 z-[90] lg:hidden transition-opacity duration-300 ease-out motion-reduce:transition-none"
          onClick={() => setSidebarOpen(false)}
          onTouchStart={() => setSidebarOpen(false)}
          aria-hidden="true"
          style={{
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 90,
          }}
        />
      )}

      <div className="flex pt-16">
        {/* Sidebar */}
        <div 
          className={cn(
            "fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-out z-[95] motion-reduce:transition-none shadow-lg",
            "lg:translate-x-0 lg:fixed lg:inset-0 lg:shadow-none lg:z-[95]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          id="parcego-admin-sidebar"
        >
          <nav className="pt-12 px-4 pb-4 space-y-6" aria-label="Admin navigation">
            {navigationSections.map((section, index) => (
              <div 
                key={section.id} 
                id={`parcego-admin-nav-section-${section.id}`}
                className={`space-y-2 ${index === 0 ? 'pt-2' : ''}`}
              >
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = isActiveNavItem(item.id);
                    return (
                      <button
                        key={item.id}
                        id={`parcego-admin-nav-btn-${item.id}`}
                        onClick={() => handleNavigate(item.id)}
                        onKeyDown={(e) => handleKeyDown(e, item.id)}
                        className={cn(
                          "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-out group motion-reduce:transition-none",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                          isActive
                            ? "bg-indigo-50 text-indigo-700 border border-[#eee] shadow-[inset_5px_0_0_#5c83ff]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                        )}
                        aria-label={`${item.label} - ${item.description}`}
                        aria-current={isActive ? "page" : undefined}
                        tabIndex={0}
                      >
                        <Icon 
                          name={item.icon} 
                          size={18} 
                          className={cn(
                            "mr-3 transition-colors duration-200",
                            isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"
                          )} 
                        />
                        <div className="flex-1 text-left">
                          <div className={cn(isActive ? "font-bold" : "font-medium")}>{item.label}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div 
          className={cn(
            "flex-1 transition-all duration-300 ease-out motion-reduce:transition-none relative z-10",
            "lg:ml-64" // Add left margin on large screens to account for fixed sidebar
          )}
          id="parcego-admin-main-container"
        >
          <main className="p-4 xl:p-6" id="parcego-admin-main-content">
            {activeSection === "overview" && renderOverview()}
            {activeSection === "merchants" && renderMerchants()}
            {activeSection === "couriers" && renderCouriers()}
            {activeSection === "assignments" && renderAssignments()}
            {activeSection === "warehouse" && renderWarehouse()}
            {activeSection === "settings" && renderSettings()}
          </main>
        </div>
      </div>
    </div>
  );
}
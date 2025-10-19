"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authService, driverService, profileService } from "@/lib/api";
import type { User, UserProfile, DriverStatisticsResponse, UpdateProfileRequest, ChangePasswordRequest } from "@/lib/api/types";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import { NotificationBanner } from "@/components/ui/notification-banner";

type NotificationFrequency = "immediate" | "hourly" | "daily";

// Geolocation types for TypeScript compatibility
interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface GeolocationPositionError {
  code: number;
  message: string;
}

// User profile state will be populated from API
// No more mock data

const StatsCard: React.FC<{ label: string; value: string; icon: string; id: string }> = ({ label, value, icon, id }) => {
  return (
    <div className="parcego-courier-profile__stats-card bg-white border rounded-xl p-5 shadow-sm transition-all duration-200 ease-[var(--easing-smooth)] hover:shadow-lg hover:-translate-y-0.5" id={id}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name={icon} size={20} className="text-primary" />
        </div>
      </div>
    </div>
  );
};

export default function CourierProfilePage() {
  const router = useRouter();

  // API Data States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [driverStats, setDriverStats] = useState<DriverStatisticsResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("profile");
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit mode state management
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Track original values for change detection
  const [originalProfileForm, setOriginalProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [availability, setAvailability] = useState<boolean>(true);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [showMobileCameraButton, setShowMobileCameraButton] = useState(false);
  const [notifItems, setNotifItems] = useState<Array<{
    id: string;
    type: string;
    priority: 'high' | 'normal' | 'low';
    status: 'unread' | 'read';
    title: string;
    message: string;
    timestamp: string;
    icon: string;
    category: string;
  }>>([
    {
      id: 'notif-prof-001',
      type: 'account',
      priority: 'normal',
      status: 'unread',
      title: 'Profile reminder',
      message: 'Update your vehicle photo to complete your profile.',
      timestamp: new Date().toISOString(),
      icon: 'User',
      category: 'system'
    }
  ]);

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    inapp: true,
    sound: true,
    vibration: false,
    frequency: "immediate" as NotificationFrequency,
  });

  // Notification banner state
  const [showNotificationBanner, setShowNotificationBanner] = useState(true);
  const [notificationBanner, setNotificationBanner] = useState({
    type: "info" as "info" | "success" | "warning" | "error",
    title: "Profile Update Required",
    message: "Please complete your vehicle information to start receiving delivery requests",
  });

  const [vehicleForm, setVehicleForm] = useState({
    type: "",
    plate: "",
    color: "",
    notes: "",
    photoUrl: "",
  });

  // Vehicle photo upload state - support up to 3 photos
  const [vehiclePhotos, setVehiclePhotos] = useState<(File | null)[]>([null, null, null]);
  const [vehiclePhotoPreviews, setVehiclePhotoPreviews] = useState<(string | null)[]>([null, null, null]);
  const [vehiclePhotoError, setVehiclePhotoError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [passwordFields, setPasswordFields] = useState({
    current: "",
    next: "",
    confirm: "",
    showCurrent: false,
    showNext: false,
    showConfirm: false,
  });

  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string>('');
  const [deliveriesCount, setDeliveriesCount] = useState<number>(0);

  // Fetch user profile and statistics from API
  useEffect(() => {
    const fetchProfileData = async () => {
      console.log('🔍 [PROFILE] Starting profile data fetch...');
      
      try {
        // Check authentication
        const authenticated = localStorage.getItem("courier_authenticated");
        const authToken = localStorage.getItem("auth_token");
        const loginTime = localStorage.getItem("courier_login_time");

        if (authenticated !== "true" || !authToken || !loginTime) {
          console.log('❌ [PROFILE] No authentication found, redirecting to login');
          router.push("/courier-login");
          return;
        }

        // Check token expiry
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const timeSinceLogin = Date.now() - parseInt(loginTime);
        if (timeSinceLogin >= twentyFourHours) {
          console.log('❌ [PROFILE] Token expired, redirecting to login');
          localStorage.clear();
          router.push("/courier-login");
          return;
        }

        console.log('✅ [PROFILE] Authentication valid, fetching profile...');

        // Fetch user profile
        const profileResponse = await profileService.getProfile();
        console.log('✅ [PROFILE] Profile data received:', profileResponse);
        setCurrentUser(profileResponse);

        // Build full address from profile
        const addressParts = [
          profileResponse.street_address,
          profileResponse.street_address_2,
          profileResponse.city,
          profileResponse.province,
          profileResponse.postal_code,
          profileResponse.country
        ].filter(Boolean);
        const fullAddress = addressParts.join(', ') || '';

        // Set profile form data
        const profileData = {
          fullName: `${profileResponse.first_name} ${profileResponse.last_name}`,
          email: profileResponse.email,
          phone: profileResponse.phone_number || '',
          address: fullAddress,
        };
        
        setProfileForm(profileData);
        setOriginalProfileForm(profileData);

        // Fetch driver statistics
        console.log('🔍 [PROFILE] Fetching driver statistics...');
        const statsResponse = await driverService.getDriverStatistics();
        console.log('✅ [PROFILE] Statistics data received:', statsResponse);
        setDriverStats(statsResponse);

        setIsLoading(false);
        console.log('✅ [PROFILE] Profile page loaded successfully');

      } catch (error: any) {
        console.error('❌ [PROFILE] Error fetching profile data:', error);
        
        if (error.message?.includes('Authentication') || error.response?.status === 401) {
          console.log('❌ [PROFILE] Authentication error, redirecting to login');
          localStorage.clear();
          router.push("/courier-login");
        } else {
          setShowToast("Failed to load profile data");
          setIsLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [router]);

  const notifUnreadCount = useMemo(() => notifItems.filter(n => n.status === 'unread').length, [notifItems]);
  const handleNotificationClick = () => setIsNotificationModalOpen(true);
  const handleNotificationClose = () => setIsNotificationModalOpen(false);
  const handleNotificationItemClick = (notificationId: string) => {
    setNotifItems(prev => prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n));
  };
  const handleMarkAllRead = () => setNotifItems(prev => prev.map(n => n.status === 'unread' ? { ...n, status: 'read' } : n));
  const handleClearAll = () => setNotifItems([]);
  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };
  const getNotificationIcon = (iconName: string) => iconName;
  const getNotifPriorityColor = (priority: 'high' | 'normal' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
      default:
        return 'text-gray-600';
    }
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const v =
          localStorage.getItem('parcego_unread_notifications') ||
          localStorage.getItem('parcego_unread_notifications_count');
        setUnreadNotificationsCount(v ? parseInt(v, 10) : 0);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const v = localStorage.getItem('parcego_remaining_deliveries');
        setDeliveriesCount(v ? parseInt(v, 10) : 0);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(null), 2000);
    return () => clearTimeout(t);
  }, [showToast]);

  useEffect(() => {
    if (availability) {
      setAvailabilityMessage("Status updated: Available");
      return;
    }
    setAvailabilityMessage("Status updated: Unavailable");
  }, [availability]);

  // Detect changes in profile form
  useEffect(() => {
    const hasChanges = JSON.stringify(profileForm) !== JSON.stringify(originalProfileForm);
    setHasUnsavedChanges(hasChanges);
  }, [profileForm, originalProfileForm]);

  const handleGoBack = useCallback(() => {
    router.push("/courier");
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      console.log("🔐 [PROFILE] Logout initiated");
      
      // Call API logout endpoint to invalidate session on backend
      try {
        await authService.logout();
        console.log("✅ [PROFILE] API logout successful");
      } catch (logoutError) {
        console.error("❌ [PROFILE] API logout failed:", logoutError);
        // Continue with client-side cleanup even if API call fails
      }
      
      // Clear all authentication data from client
      if (typeof window !== 'undefined') {
        localStorage.removeItem("courier_authenticated");
        localStorage.removeItem("courier_email");
        localStorage.removeItem("courier_login_time");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("courier_user");
        
        // Clear authentication cookie with proper attributes
        document.cookie = "courier_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        console.log("✅ [PROFILE] Authentication data cleared");
      }
      
      // Close the logout confirm dialog
      setShowLogoutConfirm(false);
      
      // Add a small delay to ensure state is cleared before navigation
      setTimeout(() => {
        console.log("🔐 [PROFILE] Navigating to courier login");
        router.push("/courier-login");
      }, 100);
    } catch (error) {
      console.error("❌ [PROFILE] Logout error:", error);
      // Fallback: still try to navigate even if clearing state fails
      router.push("/courier-login");
    }
  }, [router]);

  const handleAvatarBrowse = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarSelected = useCallback((file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setShowToast("Avatar updated");
  }, []);

  const handleAvatarInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleAvatarSelected(file);
  }, [handleAvatarSelected]);

  const handleAvatarDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    handleAvatarSelected(file);
  }, [handleAvatarSelected]);

  const handleAvatarKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAvatarBrowse();
    }
  }, [handleAvatarBrowse]);

  const handleProfileFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleSaveProfile = useCallback(async () => {
    console.log('💾 [PROFILE] Saving profile data...');
    
    try {
      // Parse the full name into first and last name
      const nameParts = profileForm.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

      // Parse address into components
      // For now, we'll save the full address in street_address
      // In a production app, you'd want a more sophisticated address parser
      const updateData: UpdateProfileRequest = {
        first_name: firstName,
        last_name: lastName,
        phone_number: profileForm.phone || undefined,
        street_address: profileForm.address || undefined,
      };

      console.log('💾 [PROFILE] Update data:', updateData);

      // Call API to update profile
      const updatedProfile = await profileService.updateProfile(updateData);
      console.log('✅ [PROFILE] Profile updated successfully:', updatedProfile);

      // Update current user state
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          first_name: firstName,
          last_name: lastName,
          phone_number: profileForm.phone,
          street_address: profileForm.address,
        });
      }

      // Update original form values to reflect saved data
      setOriginalProfileForm(profileForm);

      // Check if vehicle photos are uploaded
      const hasVehiclePhotos = vehiclePhotoPreviews.some(preview => preview !== null);

      if (hasVehiclePhotos) {
        // Vehicle photos are uploaded - profile is complete
        setShowNotificationBanner(false);
        setNotificationBanner(prev => ({
          ...prev,
          type: "success" as const,
          title: "Profile Complete",
          message: "Your profile has been successfully updated with vehicle photos",
        }));
        setShowToast("Profile saved successfully! Vehicle photos uploaded.");
      } else {
        setShowToast("Profile saved successfully");
      }

      setIsEditMode(false);
      setHasUnsavedChanges(false);
      setShowMobileCameraButton(false);

    } catch (error: any) {
      console.error('❌ [PROFILE] Error saving profile:', error);
      setShowToast("Failed to save profile: " + (error.message || "Unknown error"));
    }
  }, [profileForm, vehiclePhotoPreviews, currentUser]);

  const handleCancelProfile = useCallback(() => {
    // Reset form to original values
    setProfileForm(originalProfileForm);
    // Reset location status
    setLocationStatus('idle');
    setLocationError('');
    setShowToast("Changes cancelled");
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setShowMobileCameraButton(false); // Hide camera button when cancelling edit mode
  }, [originalProfileForm]);

  const handleUseCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      // Mock reverse geocoding - in real app, you'd call a geocoding service
      const mockAddress = `GPS Coordinates: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
      
      setProfileForm(prev => ({
        ...prev,
        address: mockAddress
      }));
      
      setLocationStatus('success');
      setShowToast('Location detected and address updated');
      
      // Reset status after 3 seconds
      setTimeout(() => setLocationStatus('idle'), 3000);
      
    } catch (error: unknown) {
      setLocationStatus('error');
      const geoError = error as GeolocationPositionError;
      if (geoError.code === 1) {
        setLocationError('Location access denied. Please enable location permissions.');
      } else if (geoError.code === 2) {
        setLocationError('Location unavailable. Please try again.');
      } else if (geoError.code === 3) {
        setLocationError('Location request timed out. Please try again.');
      } else {
        setLocationError('Failed to get location. Please try again.');
      }
    }
  }, []);

  const handleToggleAvailability = useCallback(() => {
    setAvailability((prev) => !prev);
  }, []);

  // Haptic feedback function
  const triggerHapticFeedback = useCallback(() => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(50); // 50ms vibration for subtle feedback
    }
  }, []);

  const handleEnterEditMode = useCallback(() => {
    setIsEditMode(true);
    setSelectedTab("profile");
    setShowMobileCameraButton(true); // Reveal camera button when edit mode is activated
    triggerHapticFeedback(); // Add haptic feedback
  }, [triggerHapticFeedback]);

  const handleNotificationsToggle = useCallback((key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleFrequencyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as NotificationFrequency;
    setNotifications((prev) => ({ ...prev, frequency: value }));
  }, []);

  const handleVehicleFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setVehicleForm((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleVehicleTypeChange = useCallback((value: string) => {
    setVehicleForm((prev) => ({ ...prev, type: value }));
  }, []);

  // Vehicle photo upload handlers
  const validateVehiclePhoto = useCallback((file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image.';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB.';
    }

    return null;
  }, []);

  const handleVehiclePhotoDrop = useCallback((acceptedFiles: File[], rejectedFiles: { errors: { code: string; message: string }[] }[], slotIndex?: number) => {
    setVehiclePhotoError(null);

    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setVehiclePhotoError('File size must be less than 5MB.');
      } else if (error.code === 'file-invalid-type') {
        setVehiclePhotoError('Please upload a JPEG, PNG, or WebP image.');
      } else {
        setVehiclePhotoError('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validationError = validateVehiclePhoto(file);

    if (validationError) {
      setVehiclePhotoError(validationError);
      return;
    }

    // Find the first available slot or use the specified slot
    let targetIndex = slotIndex !== undefined ? slotIndex : -1;
    if (targetIndex === -1) {
      targetIndex = vehiclePhotos.findIndex(photo => photo === null);
      if (targetIndex === -1) {
        setVehiclePhotoError('Maximum of 3 photos allowed. Please remove a photo first.');
        return;
      }
    }

    // Update the photo array
    setVehiclePhotos(prev => {
      const newPhotos = [...prev];
      newPhotos[targetIndex] = file;
      return newPhotos;
    });

    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setVehiclePhotoPreviews(prev => {
        const newPreviews = [...prev];
        newPreviews[targetIndex] = reader.result as string;
        return newPreviews;
      });
      setIsUploading(false);
      setShowToast("Vehicle photo uploaded successfully");
    };
    reader.onerror = () => {
      setVehiclePhotoError("Failed to read file. Please try again.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, [validateVehiclePhoto, setShowToast, vehiclePhotos]);

  const removeVehiclePhoto = useCallback((index: number) => {
    const currentPreview = vehiclePhotoPreviews[index];
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview);
    }

    setVehiclePhotos(prev => {
      const newPhotos = [...prev];
      newPhotos[index] = null;
      return newPhotos;
    });

    setVehiclePhotoPreviews(prev => {
      const newPreviews = [...prev];
      newPreviews[index] = null;
      return newPreviews;
    });

    setVehiclePhotoError(null);
    setShowToast("Vehicle photo removed");
  }, [vehiclePhotoPreviews, setShowToast]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      vehiclePhotoPreviews.forEach(preview => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [vehiclePhotoPreviews]);

  const availabilityLabel = useMemo(() => (availability ? "Available" : "Unavailable"), [availability]);

  // Password change handler
  const handlePasswordChange = useCallback(async () => {
    console.log('🔐 [PROFILE] Password change initiated');

    // Validate password fields
    if (!passwordFields.current || !passwordFields.next || !passwordFields.confirm) {
      setShowToast("Please fill in all password fields");
      return;
    }

    if (passwordFields.next !== passwordFields.confirm) {
      setShowToast("New passwords do not match");
      return;
    }

    if (passwordFields.next.length < 8) {
      setShowToast("Password must be at least 8 characters");
      return;
    }

    try {
      const changeData: ChangePasswordRequest = {
        current_password: passwordFields.current,
        new_password: passwordFields.next,
      };

      console.log('🔐 [PROFILE] Calling password change API...');
      await authService.changePassword(changeData);
      console.log('✅ [PROFILE] Password changed successfully');

      // Clear password fields
      setPasswordFields({
        current: "",
        next: "",
        confirm: "",
        showCurrent: false,
        showNext: false,
        showConfirm: false,
      });

      setShowPasswordDialog(false);
      setShowToast("Password updated successfully");

    } catch (error: any) {
      console.error('❌ [PROFILE] Password change failed:', error);
      setShowToast("Failed to update password: " + (error.message || "Unknown error"));
    }
  }, [passwordFields]);

  // Vehicle Photo Frame Component
  const VehiclePhotoFrame: React.FC<{
    index: number;
    preview: string | null;
    onDrop: (acceptedFiles: File[], rejectedFiles: any[], slotIndex: number) => void;
    onRemove: (index: number) => void;
    isUploading: boolean;
    disabled?: boolean;
  }> = ({ index, preview, onDrop, onRemove, isUploading, disabled = false }) => {
    const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragAccept,
      isDragReject
    } = useDropzone({
      onDrop: (acceptedFiles, rejectedFiles) => onDrop(acceptedFiles, rejectedFiles, index),
      accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp']
      },
      maxSize: 5 * 1024 * 1024, // 5MB
      multiple: false,
      disabled: isUploading || preview !== null || disabled
    });

    const getFrameClassName = () => {
      const baseClasses = "relative w-32 h-32 rounded-lg border-2 transition-all duration-200 flex items-center justify-center";

      if (disabled) {
        return `${baseClasses} border-gray-200 bg-gray-50 cursor-not-allowed opacity-60`;
      }

      if (preview) {
        return `${baseClasses} border-gray-200 overflow-hidden cursor-pointer`;
      }

      if (isDragAccept) {
        return `${baseClasses} border-dashed border-green-400 bg-green-50 cursor-pointer`;
      }
      if (isDragReject) {
        return `${baseClasses} border-dashed border-red-400 bg-red-50 cursor-pointer`;
      }
      if (isDragActive) {
        return `${baseClasses} border-dashed border-primary bg-primary/5 cursor-pointer`;
      }

      return `${baseClasses} border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer`;
    };

    return (
      <div
        {...getRootProps()}
        className={`${getFrameClassName()} flex-shrink-0`}
        role="button"
        tabIndex={0}
        aria-label={preview ? `Vehicle photo ${index + 1}` : `Upload vehicle photo ${index + 1} - drag and drop or click to select`}
      >
        <input {...getInputProps()} aria-hidden />

        {preview ? (
          <>
            <Image
              src={preview}
              alt={`Vehicle photo ${index + 1}`}
              fill
              className="object-cover max-w-full"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {disabled ? null : (
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="absolute top-1 right-1 bg-white/70 hover:bg-white/80 text-gray-700 shadow-sm rounded-full w-6 h-6 opacity-70 hover:opacity-100 transition-opacity duration-200"
                aria-label={`Remove vehicle photo ${index + 1}`}
              >
                <Icon name="Trash2" size={12} />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="p-2 rounded-full bg-gray-100 text-gray-500">
              <Icon name="Plus" size={16} />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Photo {index + 1}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Vehicle Photo Dropzone Component (for initial upload area)
  const VehiclePhotoDropzone: React.FC<{
    onDrop: (acceptedFiles: File[], rejectedFiles: any[], slotIndex?: number) => void;
    error: string | null;
    isUploading: boolean;
    disabled?: boolean;
  }> = ({ onDrop, error, isUploading, disabled = false }) => {
    const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragAccept,
      isDragReject
    } = useDropzone({
      onDrop: (acceptedFiles, rejectedFiles) => onDrop(acceptedFiles, rejectedFiles, 0),
      accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp']
      },
      maxSize: 5 * 1024 * 1024, // 5MB
      multiple: false,
      disabled: isUploading || disabled
    });

    const getDropzoneClassName = () => {
      const baseClasses = "mt-4 h-40 rounded-lg border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center";

      if (disabled) {
        return `${baseClasses} border-gray-200 bg-gray-50 cursor-not-allowed opacity-60`;
      }

      if (isDragAccept) {
        return `${baseClasses} border-green-400 bg-green-50 cursor-pointer`;
      }
      if (isDragReject || error) {
        return `${baseClasses} border-red-400 bg-red-50 cursor-pointer`;
      }
      if (isDragActive) {
        return `${baseClasses} border-primary bg-primary/5 cursor-pointer`;
      }

      return `${baseClasses} border-gray-300 cursor-pointer hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20`;
    };

    return (
      <div
        {...getRootProps()}
        className={getDropzoneClassName()}
        id="parcego-vehicle-photo-dropzone"
        role="button"
        tabIndex={0}
        aria-label="Upload vehicle photo - drag and drop or click to select"
      >
        <input {...getInputProps()} aria-hidden />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className={`p-3 rounded-full ${isDragAccept ? 'bg-green-100 text-green-600' : isDragReject || error ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
              <Icon
                name={isDragAccept ? 'CheckCircle' : isDragReject || error ? 'XCircle' : 'Upload'}
                size={24}
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                {isDragActive
                  ? (isDragAccept ? 'Drop the image here' : 'File not supported')
                  : 'Drag & drop your vehicle photo here'
                }
              </p>
              <p className="text-xs text-gray-500">
                or <span className="text-primary font-medium hover:underline">click to browse</span>
              </p>
              <p className="text-xs text-gray-400">
                JPEG, PNG, WebP up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gray-50 pb-20 md:pb-24 overflow-x-hidden"
      id="parcego-courier-profile-container"
      style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
    >
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 w-auto max-w-sm">
            <Icon name="Check" className="text-emerald-700 flex-shrink-0" size={18} />
            <span className="text-sm font-medium whitespace-nowrap">{showToast}</span>
          </div>
        </div>
      )}

      {/* Glass Blur Notification Banner */}
      <NotificationBanner
        id="parcego-courier-profile-notification-banner"
        type={notificationBanner.type}
        title={notificationBanner.title}
        message={notificationBanner.message}
        isVisible={showNotificationBanner}
        onDismiss={() => setShowNotificationBanner(false)}
        showDismissButton={true}
        className="animate-in slide-in-from-top duration-500 ease-out"
      />

      {/* Unified Courier Header - Match Overview/Deliveries: Logo left, Notifications + Avatar right */}
      <div
        className={`bg-white shadow-sm border-b px-4 py-2 transition-all duration-300 ease-out ${
          showNotificationBanner ? 'mt-16' : 'mt-0'
        }`}
        id="parcego-courier-profile-header"
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
              id="parcego-courier-profile-notifications-btn"
              onClick={handleNotificationClick}
              aria-label={`Notifications ${notifUnreadCount > 0 ? `(${notifUnreadCount} unread)` : ''}`}
            >
              <Icon name="Bell" size={18} className="md:w-5 md:h-5" />
              {notifUnreadCount > 0 && (
                <div
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] parcego-notification-badge"
                  id="parcego-courier-notification-badge"
                  suppressHydrationWarning={true}
                >
                  {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
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
                    <AvatarImage src={avatarObjectUrl} alt="Courier avatar" />
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-medium">
                      {currentUser ? `${currentUser.first_name[0]}${currentUser.last_name[0]}` : 'CR'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Courier'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser ? `PCG-CR-${String(currentUser.id).padStart(4, '0')}` : 'Loading...'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => router.push('/courier')}
                  className="cursor-pointer"
                  id="parcego-courier-profile-dashboard-menu-item"
                >
                  <Icon name="Home" size={16} className="mr-2" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  id="parcego-courier-profile-logout-menu-item"
                >
                  <Icon name="LogOut" size={16} className="mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                {notifUnreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {notifUnreadCount} new
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
              
              {notifItems.length === 0 ? (
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
                  {notifItems.map((notification) => (
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
                            className={getNotifPriorityColor(notification.priority)}
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
            {notifItems.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0 relative z-[100]">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    id="parcego-courier-mark-all-read-btn"
                    onClick={handleMarkAllRead}
                    disabled={notifUnreadCount === 0}
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

      {/* Content */}
      <div className="mx-auto w-full max-w-7xl pt-3 pb-4 px-4 md:pt-4 md:pb-6 md:px-6 grid gap-6 md:gap-8 lg:grid-cols-12 grid-cols-1">
        {/* Left Column: Overview + Stats */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="parcego-courier-profile__card" id="parcego-courier-profile-overview-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Overview</span>
                <Badge className={availability ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-gray-100 text-gray-800 border-gray-200"}>{availabilityLabel}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Overview Section */}
              <div className="flex items-start gap-4 sm:gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    id="parcego-courier-profile-avatar"
                    className="relative"
                  >
                    <div
                      className="w-[108px] h-[108px] sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-200 bg-white shadow-sm"
                      role="button"
                      tabIndex={0}
                      aria-label="Upload avatar"
                      onKeyDown={handleAvatarKeyDown}
                      onClick={handleAvatarBrowse}
                      onDrop={handleAvatarDrop}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
                      {isLoading ? (
                        <div className="w-full h-full animate-pulse bg-gray-200" />
                      ) : (
                        <Avatar className="w-full h-full">
                          <AvatarImage src={avatarObjectUrl} alt="Courier avatar" className="object-cover" />
                          <AvatarFallback className="text-sm sm:text-base font-semibold bg-gray-100">AM</AvatarFallback>
                        </Avatar>
                      )}

                      {/* Mobile edit overlay button - visible only on screens <= 524px */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnterEditMode();
                        }}
                        className="absolute bottom-1 left-1 w-10 h-10 rounded-full bg-black/80 border border-gray-600 shadow-md backdrop-blur-sm hover:bg-black hover:shadow-lg transition-all duration-200 [@media(max-width:524px)]:flex [@media(min-width:525px)]:hidden"
                        aria-label="Edit profile"
                        id="parcego-courier-profile-avatar-mobile-edit-overlay-btn"
                      >
                        <Icon name="PenLine" size={16} className="text-white" />
                      </Button>

                      {/* Mobile camera overlay button - visible only on screens <= 524px when showMobileCameraButton is true */}
                      {showMobileCameraButton && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAvatarBrowse();
                          }}
                          className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-black/80 border border-gray-600 shadow-md backdrop-blur-sm hover:bg-black hover:shadow-lg transition-all duration-200 [@media(max-width:524px)]:flex [@media(min-width:525px)]:hidden"
                          aria-label="Change avatar"
                          id="parcego-courier-profile-avatar-mobile-overlay-btn"
                        >
                          <Icon name="Camera" size={16} className="text-white" />
                        </Button>
                      )}

                      {/* Desktop camera overlay - hidden on all screens */}
                      <div className="absolute bottom-1 right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-black/80 items-center justify-center shadow-lg backdrop-blur-sm hidden">
                        <Icon name="Camera" size={12} className="text-white sm:w-3.5 sm:h-3.5" />
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      aria-hidden
                      onChange={handleAvatarInputChange}
                    />
                  </div>

                </div>

                {/* User Info Section */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="space-y-1">
                    <h2 className="font-semibold text-[27px] sm:text-xl md:text-2xl text-gray-900 leading-tight">
                      {profileForm.fullName || 'Loading...'}
                    </h2>
                    <p className="text-[21px] sm:text-base text-gray-600 font-medium">
                      {currentUser ? `PCG-CR-${String(currentUser.id).padStart(4, '0')}` : 'Loading...'}
                    </p>
                  </div>

                  {/* Action buttons below user info - visible on desktop >= 525px */}
                  <div className="flex items-center gap-2 mt-2 [@media(max-width:524px)]:hidden">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAvatarBrowse}
                      className="w-10 h-10 rounded-full hover:bg-accent/80 transition-colors duration-200"
                      aria-label="Change avatar"
                      id="parcego-courier-profile-avatar-change-btn"
                    >
                      <Icon name="Camera" size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleEnterEditMode}
                      className="w-10 h-10 rounded-full hover:bg-accent/80 transition-colors duration-200"
                      aria-label="Edit profile"
                      id="parcego-courier-profile-edit-btn"
                    >
                      <Icon name="PenLine" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {isLoading ? (
              <>
                <div className="h-20 rounded-xl bg-gray-200 animate-pulse" />
                <div className="h-20 rounded-xl bg-gray-200 animate-pulse" />
              </>
            ) : (
              <>
                <StatsCard 
                  id="parcego-courier-profile-stats-deliveries" 
                  label="Deliveries" 
                  value={driverStats ? driverStats.total_deliveries.toLocaleString() : "0"} 
                  icon="Package" 
                />
                <StatsCard 
                  id="parcego-courier-profile-stats-hours" 
                  label="In Transit" 
                  value={driverStats ? driverStats.items_in_transit.toString() : "0"} 
                  icon="Truck" 
                />
              </>
            )}
          </div>

          <Button
            variant="destructive"
            className="w-full h-10 min-h-[40px] font-medium transition-colors duration-200"
            onClick={() => setShowLogoutConfirm(true)}
            id="parcego-courier-profile-logout-btn"
            aria-label="Log out"
          >
            <Icon name="LogOut" size={18} className="mr-2" /> Log out
          </Button>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-8">
          <Card className="parcego-courier-profile__card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Settings</span>
                {isEditMode && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    <Icon name="PenLine" size={14} />
                    Edit Mode
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <Tabs id="parcego-courier-profile-tabs" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-4 h-12 p-0.5 bg-gray-100/80 rounded-xl border overflow-hidden">
                  <TabsTrigger
                    value="profile"
                    className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50/80 min-h-[36px] touch-manipulation"
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50/80 min-h-[36px] touch-manipulation"
                  >
                    Security
                  </TabsTrigger>
                  <TabsTrigger
                    value="availability"
                    className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50/80 min-h-[36px] touch-manipulation"
                  >
                    Availability
                  </TabsTrigger>
                  <TabsTrigger
                    value="vehicle"
                    className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50/80 min-h-[36px] touch-manipulation"
                  >
                    Vehicle
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 w-full">
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 mb-2 block">Full Name</Label>
                      <Input
                        id="fullName"
                        value={isEditMode ? profileForm.fullName : ""}
                        onChange={handleProfileFieldChange}
                        placeholder={isEditMode ? "Enter your full name" : profileForm.fullName}
                        className={`h-11 transition-all duration-200 ${!isEditMode ? 'opacity-60 hover:opacity-100 focus:opacity-100' : ''}`}
                        readOnly={!isEditMode}
                      />
                    </div>
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditMode ? profileForm.email : ""}
                        onChange={handleProfileFieldChange}
                        placeholder={isEditMode ? "name@company.com" : profileForm.email}
                        className={`h-11 transition-all duration-200 ${!isEditMode ? 'opacity-60 hover:opacity-100 focus:opacity-100' : ''}`}
                        readOnly={!isEditMode}
                      />
                    </div>
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number</Label>
                      <Input
                        id="phone"
                        value={isEditMode ? profileForm.phone : ""}
                        onChange={handleProfileFieldChange}
                        placeholder={isEditMode ? "+1 (555) 123-4567" : profileForm.phone}
                        className={`h-11 transition-all duration-200 ${!isEditMode ? 'opacity-60 hover:opacity-100 focus:opacity-100' : ''}`}
                        readOnly={!isEditMode}
                      />
                    </div>
                    <div className="parcego-courier-profile__form-field sm:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="address">Address</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleUseCurrentLocation}
                          disabled={locationStatus === 'loading' || !isEditMode}
                          className="flex items-center gap-2 text-xs"
                          aria-label="Use current GPS location"
                        >
                          <Icon 
                            name={locationStatus === 'loading' ? 'Loader2' : 'MapPin'} 
                            size={14} 
                            className={locationStatus === 'loading' ? 'animate-spin' : ''} 
                          />
                          {locationStatus === 'loading' ? 'Detecting...' : 'Use Current Location'}
                        </Button>
                      </div>
                      
                      <Textarea
                        id="address"
                        value={isEditMode ? profileForm.address : ""}
                        onChange={handleProfileFieldChange}
                        aria-describedby="address_help"
                        placeholder={isEditMode ? "Street, City, ZIP or click 'Use Current Location' for GPS coordinates" : profileForm.address}
                        className={`h-11 transition-all duration-200 ${!isEditMode ? 'opacity-60 hover:opacity-100 focus:opacity-100' : ''} ${locationStatus === 'success' ? 'border-green-500 bg-green-50' : ''}`}
                        readOnly={!isEditMode}
                      />
                      
                      {/* Location status feedback */}
                      {locationStatus === 'success' && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Icon name="CheckCircle" size={14} />
                          Location detected successfully
                        </p>
                      )}
                      
                      {locationStatus === 'error' && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <Icon name="AlertCircle" size={14} />
                          {locationError}
                        </p>
                      )}
                      
                      <p id="address_help" className="text-xs text-muted-foreground mt-1">
                        For internal records only. You can enter manually or use GPS location.
                      </p>
                    </div>
                  </div>
                  {isEditMode && (
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-6 border-t w-full">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={handleCancelProfile}
                        className="h-10 px-6 font-medium hover:bg-gray-50 transition-colors duration-200 min-h-[40px] w-full sm:w-auto"
                        aria-label="Cancel profile changes"
                        id="parcego-courier-profile-form-cancel-btn"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        size="default"
                        onClick={handleSaveProfile}
                        disabled={!hasUnsavedChanges}
                        className="h-10 px-6 font-medium bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200 min-h-[40px] w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Save profile changes"
                        id="parcego-courier-profile-form-save-btn"
                      >
                        <Icon name="Save" size={18} className="mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-3">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)} aria-label="Open change password dialog">
                        <Icon name="PenLine" size={16} className="mr-2" /> Change Password
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="font-medium mb-2">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">UI only for now. 2FA setup will be available later.</p>
                  </div>
                </TabsContent>


                {/* Availability Tab */}
                <TabsContent value="availability" className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Master Availability</p>
                      <p className="text-sm text-muted-foreground">Toggle your availability to receive new tasks.</p>
                    </div>
                    <button
                      id="parcego-courier-profile-availability-switch"
                      role="switch"
                      aria-checked={availability}
                      onClick={handleToggleAvailability}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${availability ? "bg-emerald-500" : "bg-gray-300"}`}
                    >
                      <span className={`inline-block size-6 transform rounded-full bg-white transition-transform duration-200 ${availability ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>

                  <div aria-live="polite" className="text-sm text-muted-foreground">
                    {availabilityMessage}
                  </div>
                </TabsContent>

                {/* Vehicle Tab */}
                <TabsContent value="vehicle" className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2 w-full">
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="parcego-vehicle-type-select" className="text-sm font-semibold text-gray-700 mb-1.5 block">Vehicle Type</Label>
                      <Select
                        value={isEditMode ? vehicleForm.type : ""}
                        onValueChange={handleVehicleTypeChange}
                        disabled={!isEditMode}
                      >
                        <SelectTrigger
                          id="parcego-vehicle-type-select"
                          className={`h-11 w-full transition-all duration-200 ${!isEditMode ? 'opacity-60' : ''}`}
                          aria-label="Select vehicle type"
                        >
                          <SelectValue placeholder={isEditMode ? "Select vehicle type" : vehicleForm.type || "Not specified"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bike" className="cursor-pointer">
                            Bike
                          </SelectItem>
                          <SelectItem value="motorbike" className="cursor-pointer">
                            Motorbike
                          </SelectItem>
                          <SelectItem value="car" className="cursor-pointer">
                            Car
                          </SelectItem>
                          <SelectItem value="van" className="cursor-pointer">
                            Van
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="plate" className="text-sm font-semibold text-gray-700 mb-1.5 block">License Plate</Label>
                      <Input
                        id="plate"
                        value={isEditMode ? vehicleForm.plate : ""}
                        onChange={handleVehicleFieldChange}
                        placeholder={isEditMode ? "ABC-123" : vehicleForm.plate || "Not specified"}
                        className={`h-11 transition-all duration-200 ${!isEditMode ? 'opacity-60 hover:opacity-100 focus:opacity-100' : ''}`}
                        readOnly={!isEditMode}
                      />
                    </div>
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="color" className="text-sm font-semibold text-gray-700 mb-1.5 block">Vehicle Color</Label>
                      <Input
                        id="color"
                        value={isEditMode ? vehicleForm.color : ""}
                        onChange={handleVehicleFieldChange}
                        placeholder={isEditMode ? "Black" : vehicleForm.color || "Not specified"}
                        className={`h-11 transition-all duration-200 ${!isEditMode ? 'opacity-60 hover:opacity-100 focus:opacity-100' : ''}`}
                        readOnly={!isEditMode}
                      />
                    </div>
                    <div className="parcego-courier-profile__form-field sm:col-span-2">
                      <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 mb-1.5 block">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={isEditMode ? vehicleForm.notes : ""}
                        onChange={handleVehicleFieldChange}
                        placeholder={isEditMode ? "Add any additional information about your vehicle" : vehicleForm.notes || "No additional notes"}
                        className={`min-h-[90px] transition-all duration-200 ${!isEditMode ? 'opacity-60 hover:opacity-100 focus:opacity-100' : ''}`}
                        readOnly={!isEditMode}
                      />
                    </div>
                  </div>

                  <div className={`rounded-lg border p-6 transition-all duration-200 ${!isEditMode ? 'opacity-60' : ''}`}>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Vehicle Photo Upload</Label>

                    {/* Vehicle Photo Frames */}
                    <div className="mb-4">
                      <div className="flex items-start justify-start gap-4 flex-wrap w-full">
                        {vehiclePhotoPreviews.map((preview, index) => {
                          // Show all frames if any photo is uploaded, otherwise show only the first frame
                          const hasAnyPhoto = vehiclePhotoPreviews.some(p => p !== null);
                          if (!hasAnyPhoto && index > 0) return null;

                          return (
                            <VehiclePhotoFrame
                              key={index}
                              index={index}
                              preview={preview}
                              onDrop={handleVehiclePhotoDrop}
                              onRemove={removeVehiclePhoto}
                              isUploading={isUploading}
                              disabled={!isEditMode}
                            />
                          );
                        })}
                      </div>
                      {vehiclePhotoPreviews.some(p => p !== null) && (
                        <p className="text-xs text-gray-500 text-left mt-3">
                          Upload up to 3 photos of your vehicle for verification
                        </p>
                      )}
                    </div>

                    {/* Initial Upload Area - only show when no photos uploaded */}
                    {!vehiclePhotoPreviews.some(p => p !== null) && (
                      <VehiclePhotoDropzone
                        onDrop={handleVehiclePhotoDrop}
                        error={vehiclePhotoError}
                        isUploading={isUploading}
                        disabled={!isEditMode}
                      />
                    )}

                    {/* Error Message */}
                    {vehiclePhotoError && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                        <Icon name="AlertCircle" size={14} />
                        <span>{vehiclePhotoError}</span>
                      </div>
                    )}
                  </div>

                  {isEditMode && (
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-6 border-t w-full">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={handleCancelProfile}
                        className="h-10 px-6 font-medium hover:bg-gray-50 transition-colors duration-200 min-h-[40px] w-full sm:w-auto"
                        aria-label="Cancel vehicle changes"
                        id="parcego-courier-vehicle-form-cancel-btn"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        size="default"
                        onClick={handleSaveProfile}
                        className="h-10 px-6 font-medium bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200 min-h-[40px] w-full sm:w-auto"
                        aria-label="Save vehicle changes"
                        id="parcego-courier-vehicle-form-save-btn"
                      >
                        <Icon name="Save" size={18} className="mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog (simple headless) */}
      {showPasswordDialog && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPasswordDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md border p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Change Password</h2>
                <p className="text-sm text-muted-foreground">Enter your current and new password.</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setShowPasswordDialog(false)}>
                <Icon name="X" />
              </Button>
            </div>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pw_current" className="text-sm font-medium text-gray-700">Current Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="pw_current"
                    type={passwordFields.showCurrent ? "text" : "password"}
                    value={passwordFields.current}
                    onChange={(e) => setPasswordFields((p) => ({ ...p, current: e.target.value }))}
                    className="flex-1 h-11"
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPasswordFields((p) => ({ ...p, showCurrent: !p.showCurrent }))}
                    aria-label="Toggle current password visibility"
                    className="h-11 w-11 shrink-0"
                  >
                    <Icon name={passwordFields.showCurrent ? "EyeOff" : "Eye"} size={16} />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw_next" className="text-sm font-medium text-gray-700">New Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="pw_next"
                    type={passwordFields.showNext ? "text" : "password"}
                    value={passwordFields.next}
                    onChange={(e) => setPasswordFields((p) => ({ ...p, next: e.target.value }))}
                    className="flex-1 h-11"
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPasswordFields((p) => ({ ...p, showNext: !p.showNext }))}
                    aria-label="Toggle new password visibility"
                    className="h-11 w-11 shrink-0"
                  >
                    <Icon name={passwordFields.showNext ? "EyeOff" : "Eye"} size={16} />
                  </Button>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      Include a number and a symbol
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      Use upper and lower case letters
                    </li>
                  </ul>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw_confirm" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="pw_confirm"
                    type={passwordFields.showConfirm ? "text" : "password"}
                    value={passwordFields.confirm}
                    onChange={(e) => setPasswordFields((p) => ({ ...p, confirm: e.target.value }))}
                    className="flex-1 h-11"
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPasswordFields((p) => ({ ...p, showConfirm: !p.showConfirm }))}
                    aria-label="Toggle confirm password visibility"
                    className="h-11 w-11 shrink-0"
                  >
                    <Icon name={passwordFields.showConfirm ? "EyeOff" : "Eye"} size={16} />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                className="flex-1 h-11 font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                className="flex-1 h-11 font-medium"
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm (simple headless) */}
      {showLogoutConfirm && (
        <div role="alertdialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md border p-6">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="AlertTriangle" className="text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Log out?</h2>
                <p className="text-sm text-muted-foreground">You can log back in anytime. This is a UI-only action.</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleLogout}>Log out</Button>
            </div>
          </div>
        </div>
      )}

      {/* Native-Style Bottom Navigation - Unified with Dashboard */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg shadow-gray-900/10 z-[100]"
        id="parcego-courier-profile-bottom-nav"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex justify-around items-center px-2 pt-2 pb-1">
          <button
            onClick={() => router.push('/courier')}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
            id="parcego-nav-overview-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out">
              <Icon name="Home" size={20} className="text-current" />
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Overview
            </span>
          </button>
          
          <button
            onClick={() => router.push('/courier')}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
            id="parcego-nav-deliveries-btn"
            type="button"
          >
            <div className="relative transition-all duration-200 ease-out">
              <Icon name="Package" size={20} className="text-current" />
              {deliveriesCount > 0 && (
                <div
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  suppressHydrationWarning={true}
                >
                  {deliveriesCount > 9 ? '9+' : deliveriesCount}
                </div>
              )}
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Deliveries
            </span>
          </button>
          
          <button
            onClick={() => router.push('/courier/performance')}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
            id="parcego-nav-performance-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out">
              <Icon name="BarChart3" size={20} className="text-current" />
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Performance
            </span>
          </button>
          
          <button
            onClick={() => router.push('/courier/profile')}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out bg-blue-100/80 text-blue-600 shadow-sm"
            id="parcego-nav-profile-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out transform scale-110">
              <Icon name="User" size={20} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-blue-600">
              Profile
            </span>
            <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
          </button>
        </div>
      </div>
    </div>
  );
}



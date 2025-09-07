"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

const MOCK_PROFILE = {
  fullName: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 123-4567",
  address: "221B Baker Street, London, NW1 6XE",
  courierId: "PCG-CR-1029",
  avatarUrl: "",
  available: true,
};

const MOCK_VEHICLE = {
  type: "bike",
  plate: "NYC-7K21",
  color: "Black",
  notes: "Rear basket installed; bring rain cover.",
  photoUrl: "",
};

const StatsCard: React.FC<{ label: string; value: string; icon: string; id: string }> = ({ label, value, icon, id }) => {
  return (
    <div className="parcego-courier-profile__stats-card bg-white border rounded-xl p-4 shadow-sm transition-all duration-200 ease-[var(--easing-smooth)] hover:shadow-md" id={id}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name={icon} size={18} className="text-primary" />
        </div>
      </div>
    </div>
  );
};

export default function CourierProfilePage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("profile");
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileForm, setProfileForm] = useState({
    fullName: MOCK_PROFILE.fullName,
    email: MOCK_PROFILE.email,
    phone: MOCK_PROFILE.phone,
    address: MOCK_PROFILE.address,
  });

  const [availability, setAvailability] = useState<boolean>(MOCK_PROFILE.available);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    inapp: true,
    sound: true,
    vibration: false,
    frequency: "immediate" as NotificationFrequency,
  });

  const [vehicleForm, setVehicleForm] = useState({
    type: MOCK_VEHICLE.type,
    plate: MOCK_VEHICLE.plate,
    color: MOCK_VEHICLE.color,
    notes: MOCK_VEHICLE.notes,
    photoUrl: MOCK_VEHICLE.photoUrl,
  });

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

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
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

  const handleGoBack = useCallback(() => {
    router.push("/courier");
  }, [router]);

  const handleLogout = useCallback(() => {
    try {
      console.log("Logout initiated");
      
      // Clear all authentication data
      if (typeof window !== 'undefined') {
        localStorage.removeItem("courier_authenticated");
        localStorage.removeItem("courier_email");
        localStorage.removeItem("courier_login_time");
        
        // Clear authentication cookie with proper attributes
        document.cookie = "courier_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        console.log("Authentication data cleared");
      }
      
      // Close the dropdown menu first
      setShowLogoutConfirm(false);
      
      // Add a small delay to ensure state is cleared before navigation
      setTimeout(() => {
        console.log("Navigating to courier login");
        if (router && typeof router.push === 'function') {
          router.push("/courier-login");
        } else {
          console.error("Router not available, using window.location");
          window.location.href = "/courier-login";
        }
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: still try to navigate even if clearing state fails
      if (router && typeof router.push === 'function') {
        router.push("/courier-login");
      } else {
        console.error("Router not available in fallback, using window.location");
        window.location.href = "/courier-login";
      }
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
    setShowToast("Avatar updated (mock)");
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

  const handleSaveProfile = useCallback(() => {
    setShowToast("Profile saved (mock)");
  }, []);

  const handleCancelProfile = useCallback(() => {
    // Reset form to original values
    setProfileForm({
      fullName: MOCK_PROFILE.fullName,
      email: MOCK_PROFILE.email,
      phone: MOCK_PROFILE.phone,
      address: MOCK_PROFILE.address,
    });
    // Reset location status
    setLocationStatus('idle');
    setLocationError('');
    setShowToast("Changes cancelled");
  }, []);

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

  const availabilityLabel = useMemo(() => (availability ? "Available" : "Unavailable"), [availability]);

  return (
    <div 
      className="min-h-screen bg-gray-50 pb-24 md:pb-28"
      id="parcego-courier-profile-container"
      style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
    >
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
            <Icon name="Check" className="text-emerald-700" size={18} />
            <span className="text-sm font-medium">{showToast}</span>
          </div>
        </div>
      )}

      {/* Enhanced Courier Header - Unified with Dashboard */}
      <div 
        className="bg-white shadow-sm border-b px-4 py-3"
        id="parcego-courier-profile-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="h-9 w-9 md:h-10 md:w-10"
              id="parcego-courier-profile-back-btn"
              aria-label="Go back to courier home"
            >
              <Icon name="ArrowLeft" size={18} className="text-gray-700" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Account Profile</h1>
              <p className="text-sm text-gray-500">Manage your courier account details, security, and preferences.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="parcego-header__notification-btn h-9 w-9 md:h-10 md:w-10"
              id="parcego-courier-profile-notifications-btn"
              onClick={() => router.push('/notifications')}
            >
              <Icon name="Bell" size={18} className="md:w-5 md:h-5" />
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
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarObjectUrl} alt="Courier avatar" />
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-medium">
                        {MOCK_PROFILE.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-white ${availability ? "bg-emerald-500" : "bg-gray-400"}`} aria-hidden />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{MOCK_PROFILE.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {MOCK_PROFILE.courierId}
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

      {/* Content */}
      <div className="mx-auto max-w-6xl p-4 grid gap-6 lg:grid-cols-12">
        {/* Left Column: Overview + Stats */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="parcego-courier-profile__card" id="parcego-courier-profile-overview-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Overview</span>
                <Badge className={availability ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-gray-100 text-gray-800 border-gray-200"}>{availabilityLabel}</Badge>
              </CardTitle>
              <CardDescription>Upload a photo, see your status, and quick actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar upload area */}
              <div className="space-y-4">
                {/* Avatar and user info */}
                <div className="flex items-center gap-4">
                  <div
                    id="parcego-courier-profile-avatar"
                    className="relative"
                  >
                    <div
                      className="size-20 rounded-full overflow-hidden border bg-white shadow-sm relative"
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
                        <Avatar className="size-20">
                          <AvatarImage src={avatarObjectUrl} alt="Courier avatar" />
                          <AvatarFallback className="text-base font-semibold">AM</AvatarFallback>
                        </Avatar>
                      )}
                      {/* Camera icon overlay - properly contained within avatar bounds */}
                      <div className="absolute bottom-0 right-0 size-6 rounded-full bg-black flex items-center justify-center shadow-sm transform translate-x-1/4 translate-y-1/4">
                        <Icon name="Camera" size={12} className="text-white" />
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

                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{profileForm.fullName}</p>
                    <p className="text-sm text-muted-foreground">{MOCK_PROFILE.courierId}</p>
                  </div>
                </div>

                {/* Action buttons - responsive row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAvatarBrowse}
                    className="flex items-center gap-2"
                    aria-label="Change avatar"
                    id="parcego-courier-profile-avatar-change-btn"
                  >
                    <Icon name="Camera" size={16} /> Change
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedTab("profile")}
                    className="flex items-center gap-2"
                  >
                    <Icon name="PenTool" size={16} /> Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowPasswordDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Icon name="Shield" size={16} /> Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push("/courier/performance")}
                    className="flex items-center gap-2"
                  >
                    <Icon name="BarChart3" size={16} /> View Performance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {isLoading ? (
              <>
                <div className="h-20 rounded-xl bg-gray-200 animate-pulse" />
                <div className="h-20 rounded-xl bg-gray-200 animate-pulse" />
              </>
            ) : (
              <>
                <StatsCard id="parcego-courier-profile-stats-deliveries" label="Deliveries" value="1,248" icon="Package" />
                <StatsCard id="parcego-courier-profile-stats-hours" label="Hours Online" value="732h" icon="Clock" />
              </>
            )}
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowLogoutConfirm(true)}
            id="parcego-courier-profile-logout-btn"
            aria-label="Log out"
          >
            <Icon name="LogOut" size={18} className="mr-2" /> Log out
          </Button>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-8">
          <Card className="parcego-courier-profile__card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Settings</span>
                <CardAction>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">UI only</Badge>
                </CardAction>
              </CardTitle>
              <CardDescription>All changes are local and not persisted.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs id="parcego-courier-profile-tabs" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-4 overflow-x-auto">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                  <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={profileForm.fullName} onChange={handleProfileFieldChange} aria-describedby="fullName_help" placeholder="Enter your full name" />
                      <p id="fullName_help" className="text-xs text-muted-foreground mt-1">This will be shown to merchants on deliveries.</p>
                    </div>
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={profileForm.email} onChange={handleProfileFieldChange} aria-describedby="email_help" placeholder="name@company.com" />
                      <p id="email_help" className="text-xs text-muted-foreground mt-1">Used for account notifications only.</p>
                    </div>
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={profileForm.phone} onChange={handleProfileFieldChange} aria-describedby="phone_help" placeholder="+1 (555) 123-4567" />
                      <p id="phone_help" className="text-xs text-muted-foreground mt-1">Shown to recipients if necessary for coordination.</p>
                    </div>
                    <div className="parcego-courier-profile__form-field sm:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="address">Address</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleUseCurrentLocation}
                          disabled={locationStatus === 'loading'}
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
                        value={profileForm.address} 
                        onChange={handleProfileFieldChange} 
                        aria-describedby="address_help" 
                        placeholder="Street, City, ZIP or click 'Use Current Location' for GPS coordinates"
                        className={locationStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
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
                  <div className="flex items-center justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelProfile} 
                      aria-label="Cancel profile changes"
                      id="parcego-courier-profile-form-cancel-btn"
                    >
                      Cancel
                    </Button>
                    <Button id="parcego-courier-profile-form-save-btn" onClick={handleSaveProfile} aria-label="Save profile">
                      <Icon name="Save" size={18} className="mr-2" /> Save Changes
                    </Button>
                  </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)} aria-label="Open change password dialog">
                        <Icon name="Shield" size={16} className="mr-2" /> Change Password
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="font-medium mb-2">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">UI only for now. 2FA setup will be available later.</p>
                  </div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="notif_push" className="cursor-pointer select-none">Push Notifications</Label>
                      <button
                        id="notif_push"
                        role="switch"
                        aria-checked={notifications.push}
                        onClick={() => handleNotificationsToggle("push")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${notifications.push ? "bg-emerald-500" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block size-5 transform rounded-full bg-white transition-transform duration-200 ${notifications.push ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="notif_email" className="cursor-pointer select-none">Email Notifications</Label>
                      <button
                        id="notif_email"
                        role="switch"
                        aria-checked={notifications.email}
                        onClick={() => handleNotificationsToggle("email")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${notifications.email ? "bg-emerald-500" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block size-5 transform rounded-full bg-white transition-transform duration-200 ${notifications.email ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="notif_inapp" className="cursor-pointer select-none">In-app Banners</Label>
                      <button
                        id="notif_inapp"
                        role="switch"
                        aria-checked={notifications.inapp}
                        onClick={() => handleNotificationsToggle("inapp")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${notifications.inapp ? "bg-emerald-500" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block size-5 transform rounded-full bg-white transition-transform duration-200 ${notifications.inapp ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="notif_sound" className="cursor-pointer select-none">Sound</Label>
                      <button
                        id="notif_sound"
                        role="switch"
                        aria-checked={notifications.sound}
                        onClick={() => handleNotificationsToggle("sound")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${notifications.sound ? "bg-emerald-500" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block size-5 transform rounded-full bg-white transition-transform duration-200 ${notifications.sound ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="notif_vibration" className="cursor-pointer select-none">Vibration</Label>
                      <button
                        id="notif_vibration"
                        role="switch"
                        aria-checked={notifications.vibration}
                        onClick={() => handleNotificationsToggle("vibration")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${notifications.vibration ? "bg-emerald-500" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block size-5 transform rounded-full bg-white transition-transform duration-200 ${notifications.vibration ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>

                  <fieldset className="rounded-lg border p-4">
                    <legend className="text-sm font-medium px-1">Frequency</legend>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(["immediate", "hourly", "daily"] as NotificationFrequency[]).map((f) => (
                        <label key={f} className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-all ${notifications.frequency === f ? "border-primary bg-primary/5" : "hover:bg-gray-50"}`}>
                          <input type="radio" name="notif_frequency" value={f} checked={notifications.frequency === f} onChange={handleFrequencyChange} className="accent-primary" />
                          <span className="capitalize text-sm font-medium">{f === "daily" ? "Daily Digest" : f}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </TabsContent>

                {/* Availability Tab */}
                <TabsContent value="availability" className="space-y-5">
                  <div className="flex items-center justify-between rounded-lg border p-4">
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
                <TabsContent value="vehicle" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="type">Vehicle Type</Label>
                      <select id="type" value={vehicleForm.type} onChange={handleVehicleFieldChange} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none">
                        <option value="bike">Bike</option>
                        <option value="motorbike">Motorbike</option>
                        <option value="car">Car</option>
                        <option value="van">Van</option>
                      </select>
                    </div>
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="plate">Plate Number</Label>
                      <Input id="plate" value={vehicleForm.plate} onChange={handleVehicleFieldChange} placeholder="ABC-123" />
                    </div>
                    <div className="parcego-courier-profile__form-field">
                      <Label htmlFor="color">Color</Label>
                      <Input id="color" value={vehicleForm.color} onChange={handleVehicleFieldChange} placeholder="Black" />
                    </div>
                    <div className="parcego-courier-profile__form-field sm:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" value={vehicleForm.notes} onChange={handleVehicleFieldChange} placeholder="Extra info about your vehicle (UI only)" />
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Vehicle photo upload (mock)</p>
                    <div className="mt-3 h-28 rounded-lg border-dashed border flex items-center justify-center text-sm text-muted-foreground">
                      <Icon name="Image" size={18} className="mr-2" /> Drag & drop or click to upload
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog (simple headless) */}
      {showPasswordDialog && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPasswordDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Change Password</h2>
                <p className="text-sm text-muted-foreground">Enter your current and new password.</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setShowPasswordDialog(false)}>
                <Icon name="X" />
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="pw_current">Current Password</Label>
                <div className="flex gap-2">
                  <Input id="pw_current" type={passwordFields.showCurrent ? "text" : "password"} value={passwordFields.current} onChange={(e) => setPasswordFields((p) => ({ ...p, current: e.target.value }))} />
                  <Button type="button" variant="outline" onClick={() => setPasswordFields((p) => ({ ...p, showCurrent: !p.showCurrent }))} aria-label="Toggle password visibility">
                    <Icon name={passwordFields.showCurrent ? "EyeOff" : "Eye"} />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="pw_next">New Password</Label>
                <div className="flex gap-2">
                  <Input id="pw_next" type={passwordFields.showNext ? "text" : "password"} value={passwordFields.next} onChange={(e) => setPasswordFields((p) => ({ ...p, next: e.target.value }))} />
                  <Button type="button" variant="outline" onClick={() => setPasswordFields((p) => ({ ...p, showNext: !p.showNext }))} aria-label="Toggle password visibility">
                    <Icon name={passwordFields.showNext ? "EyeOff" : "Eye"} />
                  </Button>
                </div>
                <ul className="mt-2 text-xs text-muted-foreground list-disc pl-5">
                  <li>At least 8 characters</li>
                  <li>Include a number and a symbol</li>
                  <li>Use upper and lower case letters</li>
                </ul>
              </div>
              <div>
                <Label htmlFor="pw_confirm">Confirm New Password</Label>
                <div className="flex gap-2">
                  <Input id="pw_confirm" type={passwordFields.showConfirm ? "text" : "password"} value={passwordFields.confirm} onChange={(e) => setPasswordFields((p) => ({ ...p, confirm: e.target.value }))} />
                  <Button type="button" variant="outline" onClick={() => setPasswordFields((p) => ({ ...p, showConfirm: !p.showConfirm }))} aria-label="Toggle password visibility">
                    <Icon name={passwordFields.showConfirm ? "EyeOff" : "Eye"} />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowPasswordDialog(false); setShowToast("Password updated (mock)"); }}>Update Password</Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm (simple headless) */}
      {showLogoutConfirm && (
        <div role="alertdialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogoutConfirm(false)} />
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



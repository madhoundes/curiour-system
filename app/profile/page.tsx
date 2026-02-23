"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileService } from "@/lib/api/profile";
import { notificationService } from "@/lib/api/notifications";
import { shopifyService } from "@/lib/api/shopify";
import type { ShopifyAccount } from "@/lib/api/types";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";

// Postal code validation helpers
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

const BusinessInfoSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\d{10,}$/, "Phone number must have at least 10 digits"),
  addressLine1: z.string().min(2, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.enum(["Toronto", "Mississauga"], {
    message: "City must be Toronto or Mississauga"
  }),
  state: z.string().min(2, "State is required"),
  zip: z.string()
    .min(6, "Postal code is required")
    .refine((postalCode) => {
      // More flexible regex that handles spaces, dashes, or no separator
      const cleaned = postalCode.trim().replace(/[\s-]/g, '');
      const regex = /^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/;
      return regex.test(cleaned);
    }, {
      message: "Invalid postal code format. Use Canadian format: A1A 1A1 (e.g., M5V 3A8 or L4T 1A1)"
    })
    .refine((postalCode) => {
      const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, '').replace(/-/g, '');
      return isTorontoPostalCode(normalized) || isMississaugaPostalCode(normalized);
    }, {
      message: "Postal code must be in Downtown Toronto (M prefix) or Mississauga (L4T-L5W prefix)"
    }),
  country: z.string().min(2, "Country is required"),
}).refine((data) => {
  // Normalize postal code: remove spaces and dashes, convert to uppercase
  const normalized = data.zip.trim().toUpperCase().replace(/[\s-]/g, '');
  
  if (data.city === "Toronto" && !isTorontoPostalCode(normalized)) {
    return false;
  }
  
  if (data.city === "Mississauga" && !isMississaugaPostalCode(normalized)) {
    return false;
  }
  
  return true;
}, {
  message: "Postal code does not match the selected city. Toronto postal codes start with M, Mississauga postal codes start with L4T-L5W",
  path: ["zip"]
});

const AccountSettingsSchema = z.object({
  language: z.enum(["en", "fr"]),
  timezone: z.string().min(2, { error: "Timezone is required" }),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
  twoFactorEnabled: z.boolean(),
});

const NotificationPrefsSchema = z.object({
  emailUpdates: z.boolean(),
});

const ThirdPartyIntegrationSchema = z.object({
  shopify: z.object({
    shopDomain: z.string().min(1, "Shop domain is required").refine(
      (val) => {
        // Allow formats like: mystore, mystore.myshopify.com, https://mystore.myshopify.com
        const cleanDomain = val.replace(/^https?:\/\//, '').replace(/\/$/, '');
        return cleanDomain.includes('.') || cleanDomain.length > 0;
      },
      { message: "Please enter a valid shop domain (e.g., mystore.myshopify.com)" }
    ),
  }),
});

type BusinessInfo = z.infer<typeof BusinessInfoSchema>;
type AccountSettings = z.infer<typeof AccountSettingsSchema>;
type NotificationPrefs = z.infer<typeof NotificationPrefsSchema>;
type ThirdPartyIntegration = z.infer<typeof ThirdPartyIntegrationSchema>;

const STORAGE_KEYS = {
  business: "parcego_profile_business",
  settings: "parcego_profile_settings",
  notifications: "parcego_profile_notifications",
  integrations: "parcego_profile_integrations",
} as const;

function ProfileAccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  // Get active tab from URL query parameter, default to "business"
  const tabParam = searchParams?.get('tab');
  const validTabs = ['business', 'settings', 'notifications', 'api'];
  const activeTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'business';
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  
  // Shopify integration states
  const [shopifyAccounts, setShopifyAccounts] = useState<ShopifyAccount[]>([]);
  const [isLoadingShopify, setIsLoadingShopify] = useState(false);
  const [isConnectingShopify, setIsConnectingShopify] = useState(false);
  const [isDisconnectingShopify, setIsDisconnectingShopify] = useState<number | null>(null);
  
  // Store email in state to avoid calling getValues() in render (hydration issue)
  const [userEmail, setUserEmail] = useState<string>("");

  const defaultBusiness: BusinessInfo = useMemo(
    () => ({
      business_name: "",
      contactName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "Toronto", // Default to Toronto (service area requirement)
      state: "Ontario", // Default to Ontario (service area requirement)
      zip: "",
      country: "Canada", // Default to Canada (service area requirement)
    }),
    []
  );

  const defaultSettings: AccountSettings = useMemo(
    () => ({
      language: "en",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      twoFactorEnabled: false,
    }),
    []
  );

  const defaultNotifications: NotificationPrefs = useMemo(
    () => ({
      emailUpdates: true,
    }),
    []
  );

  const defaultIntegrations: ThirdPartyIntegration = useMemo(
    () => ({
      shopify: {
        shopDomain: "",
      },
    }),
    []
  );

  const businessForm = useForm<BusinessInfo>({
    resolver: zodResolver(BusinessInfoSchema),
    defaultValues: defaultBusiness,
    mode: "onChange", // Changed to onChange for better real-time validation
  });
  const settingsForm = useForm<AccountSettings>({
    resolver: zodResolver(AccountSettingsSchema),
    defaultValues: defaultSettings,
    mode: "onBlur",
  });
  const notificationsForm = useForm<NotificationPrefs>({
    resolver: zodResolver(NotificationPrefsSchema),
    defaultValues: defaultNotifications,
    mode: "onBlur",
  });

  const integrationsForm = useForm<ThirdPartyIntegration>({
    resolver: zodResolver(ThirdPartyIntegrationSchema),
    defaultValues: defaultIntegrations,
    mode: "onBlur",
  });

  // Handle search params separately in a useEffect to avoid hydration issues
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    
    if (connected === 'true') {
      toast.success("Shopify store connected successfully!");
      loadShopifyAccounts();
    }
  }, []);

  // Watch form changes to update email state
  useEffect(() => {
    const subscription = businessForm.watch((value) => {
      if (value.email) {
        setUserEmail(value.email);
      }
    });
    return () => subscription.unsubscribe();
  }, [businessForm]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setProfileError(null);
        
        const profileData = await profileService.getProfile();
        
        // Map API response to form data
        // Normalize city to match schema enum (Toronto or Mississauga)
        let normalizedCity = profileData.city || "";
        const originalCity = normalizedCity;
        
        if (normalizedCity.toLowerCase().includes('toronto') || normalizedCity.toLowerCase().includes('downtown')) {
          normalizedCity = "Toronto";
        } else if (normalizedCity.toLowerCase() === 'mississauga') {
          normalizedCity = "Mississauga";
        } else if (!normalizedCity) {
          normalizedCity = "Toronto"; // Default to Toronto if empty
        } else {
          // City is not in service area - set to Toronto as default but show warning
          normalizedCity = "Toronto";
          if (originalCity) {
            setProfileError(`Your current address city "${originalCity}" is not in our service area. Please update it to Toronto or Mississauga.`);
          }
        }
        
        // Validate postal code if present
        if (profileData.postal_code) {
          const postalCode = profileData.postal_code.trim().toUpperCase().replace(/\s+/g, '');
          const isValidToronto = isTorontoPostalCode(postalCode);
          const isValidMississauga = isMississaugaPostalCode(postalCode);
          
          if (!isValidToronto && !isValidMississauga) {
            setProfileError(`Your current postal code "${profileData.postal_code}" is not in our service area. Please update it to a Toronto (M prefix) or Mississauga (L4T-L5W prefix) postal code.`);
          } else if (normalizedCity === "Toronto" && !isValidToronto) {
            setProfileError(`Your postal code "${profileData.postal_code}" does not match Toronto. Please update your address.`);
          } else if (normalizedCity === "Mississauga" && !isValidMississauga) {
            setProfileError(`Your postal code "${profileData.postal_code}" does not match Mississauga. Please update your address.`);
          }
        }
        
        // Ensure province is Ontario for service area
        const normalizedProvince = "Ontario";
        
        const businessData: BusinessInfo = {
          business_name: profileData.business_name || "",
          contactName: `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim(),
          email: profileData.email || "",
          phone: profileData.phone_number || "",
          addressLine1: profileData.street_address || "",
          addressLine2: profileData.street_address_2 || "",
          city: normalizedCity as "Toronto" | "Mississauga",
          state: normalizedProvince,
          zip: profileData.postal_code || "",
          country: profileData.country || "Canada",
        };
        
        businessForm.reset(businessData);
        
        // Store original data for cancel functionality
        setOriginalBusinessData(businessData);
        
        // Update email state
        setUserEmail(profileData.email || "");
        
        // Check notification subscription status for the email
        if (profileData.email) {
          await checkSubscriptionStatus(profileData.email);
        }
        
        // Load Shopify accounts
        await loadShopifyAccounts();
        
        // Load other data from localStorage as fallback for now
        const s = localStorage.getItem(STORAGE_KEYS.settings);
        const i = localStorage.getItem(STORAGE_KEYS.integrations);
        if (s) {
          const settingsData = JSON.parse(s);
          settingsForm.reset(settingsData);
          setOriginalSettingsData(settingsData);
        }
        if (i) integrationsForm.reset(JSON.parse(i));
        
      } catch (error: any) {
        console.error('Failed to load profile:', error);
        setProfileError(error.message || 'Failed to load profile data');
        
        // Fallback to localStorage for all data if API fails
        try {
          const b = localStorage.getItem(STORAGE_KEYS.business);
          const s = localStorage.getItem(STORAGE_KEYS.settings);
          const n = localStorage.getItem(STORAGE_KEYS.notifications);
          const i = localStorage.getItem(STORAGE_KEYS.integrations);
          if (b) {
            const businessData = JSON.parse(b);
            businessForm.reset(businessData);
            setOriginalBusinessData(businessData);
          }
          if (s) {
            const settingsData = JSON.parse(s);
            settingsForm.reset(settingsData);
            setOriginalSettingsData(settingsData);
          }
          if (n) notificationsForm.reset(JSON.parse(n));
          if (i) integrationsForm.reset(JSON.parse(i));
        } catch {}
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadShopifyAccounts = async () => {
    try {
      setIsLoadingShopify(true);
      const response = await shopifyService.getAccounts();
      if (response.data && response.data.accounts) {
        setShopifyAccounts(response.data.accounts);
      }
    } catch (error: any) {
      console.error('Failed to load Shopify accounts:', error);
      // Don't show error to user if no accounts exist yet (401 or 404 is expected for new users)
      if (error.status !== 401 && error.status !== 404) {
        toast.error('Failed to load Shopify stores');
      }
      setShopifyAccounts([]);
    } finally {
      setIsLoadingShopify(false);
    }
  };

  const [businessMsg, setBusinessMsg] = useState<string | null>(null);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);
  const [notificationsMsg, setNotificationsMsg] = useState<string | null>(null);
  const [integrationsMsg, setIntegrationsMsg] = useState<string | null>(null);
  const [integrationsMsgType, setIntegrationsMsgType] = useState<'success' | 'error' | null>(null);
  
  // Store original form values for cancel functionality
  const [originalBusinessData, setOriginalBusinessData] = useState<BusinessInfo | null>(null);
  const [originalSettingsData, setOriginalSettingsData] = useState<AccountSettings | null>(null);

  const handleSave = async <T,>(key: string, data: T, onOk: (msg: string) => void, label: string) => {
    // For business info, use API; for others, use localStorage for now
    if (key === STORAGE_KEYS.business) {
      try {
        const businessData = data as BusinessInfo;
        
        // Map form data to API format
        const nameParts = businessData.contactName.split(' ');
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(' ') || "";
        
        const updateData: any = {
          business_name: businessData.business_name,
          first_name: firstName,
          last_name: lastName,
          phone_number: businessData.phone,
          street_address: businessData.addressLine1,
          city: businessData.city,
          province: "ON", // Always set to Ontario for service area
          postal_code: businessData.zip,
          country: businessData.country || "Canada",
        };

        // Only include optional fields if they have values
        if (businessData.addressLine2 && businessData.addressLine2.trim()) {
          updateData.street_address_2 = businessData.addressLine2;
        }
        
        await profileService.updateProfile(updateData);
        
        // Also save to localStorage as backup
        localStorage.setItem(key, JSON.stringify(data));
        
        // Update original data after successful save
        if (key === STORAGE_KEYS.business) {
          setOriginalBusinessData(data as BusinessInfo);
        } else if (key === STORAGE_KEYS.settings) {
          setOriginalSettingsData(data as AccountSettings);
        }
        
        onOk(`${label} saved successfully`);
        
        // Redirect to create shipment page after successful business info save
        if (key === STORAGE_KEYS.business) {
          router.push('/create-shipment');
        }
      } catch (error: any) {
        console.error('Failed to save profile:', error);
        onOk(`Failed to save ${label}: ${error.message || 'Unknown error'}`);
      }
    } else {
      // For other data types, use localStorage
      try {
        localStorage.setItem(key, JSON.stringify(data));
        
        // Update original data after successful save
        if (key === STORAGE_KEYS.settings) {
          setOriginalSettingsData(data as AccountSettings);
        }
        
        onOk(`${label} saved`);
      } catch {
        onOk(`Could not save ${label}`);
      }
    }
  };

  const handleCancel = (formType: 'business' | 'settings') => {
    if (formType === 'business' && originalBusinessData) {
      businessForm.reset(originalBusinessData);
      setBusinessMsg(null); // Clear any existing messages
    } else if (formType === 'settings' && originalSettingsData) {
      settingsForm.reset(originalSettingsData);
      setSettingsMsg(null); // Clear any existing messages
    }
  };

  const handleShopifyConnect = async () => {
    const shopDomain = integrationsForm.getValues("shopify.shopDomain");
    
    if (!shopDomain || shopDomain.trim() === "") {
      setIntegrationsMsg("Please enter a shop domain (e.g., mystore.myshopify.com)");
      setIntegrationsMsgType('error');
      return;
    }

    // Normalize shop domain
    let normalizedShop = shopDomain.trim();
    // Remove protocol if present
    normalizedShop = normalizedShop.replace(/^https?:\/\//, '');
    // Remove trailing slash
    normalizedShop = normalizedShop.replace(/\/$/, '');
    // If no .myshopify.com suffix, add it
    if (!normalizedShop.includes('.')) {
      normalizedShop = `${normalizedShop}.myshopify.com`;
    }

    try {
      setIsConnectingShopify(true);
      setIntegrationsMsg("Initiating Shopify connection...");

      // Call the authenticated install endpoint
      const response = await shopifyService.installAuthenticated({
        shop: normalizedShop,
      });

      // If we get a redirect URL, navigate to it
      if (response.data?.auth_url || response.data?.redirect_url) {
        const authUrl = response.data.auth_url || response.data.redirect_url;
        if (authUrl) {
          window.location.href = authUrl;
        } else {
          setIntegrationsMsg("Failed to get authorization URL. Please try again.");
          setIntegrationsMsgType('error');
        }
      } else {
        setIntegrationsMsg("Failed to get authorization URL. Please try again.");
        setIntegrationsMsgType('error');
      }
    } catch (error: any) {
      console.error("Shopify OAuth initiation failed:", error);
      
      // Handle 409 Conflict - Store already connected (not an error state)
      if (error.response?.status === 409 || error.status === 409) {
        // Store is already connected, just reload the accounts list
        setIntegrationsMsg(null);
        setIntegrationsMsgType(null);
        await loadShopifyAccounts();
        setIsConnectingShopify(false);
        return;
      }
      
      // For other errors, show error message
      setIntegrationsMsg(
        error.message || "Failed to connect to Shopify. Please check your shop domain and try again."
      );
      setIntegrationsMsgType('error');
      setIsConnectingShopify(false);
    }
  };

  const handleShopifyDisconnect = async (accountId: number) => {
    if (!confirm("Are you sure you want to disconnect this Shopify store? This will stop automatic order syncing.")) {
      return;
    }

    try {
      setIsDisconnectingShopify(accountId);
      await shopifyService.disconnect(accountId);

      // apiClient throws for non-2xx, so reaching here always means success
      setIntegrationsMsg("Shopify store disconnected successfully");
      setIntegrationsMsgType('success');
      toast.success("Shopify store disconnected successfully");
      await loadShopifyAccounts();
    } catch (error: any) {
      console.error("Shopify disconnect failed:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to disconnect Shopify store";
      setIntegrationsMsg(errorMsg);
      setIntegrationsMsgType('error');
      toast.error(errorMsg);
    } finally {
      setIsDisconnectingShopify(null);
    }
  };

  const handleShopifySync = async (accountId: number) => {
    try {
      setIsLoadingShopify(true);
      const response = await shopifyService.syncAccount(accountId);

      // apiClient throws for non-2xx, so reaching here always means success
      const successMsg = response.data?.message || "Shopify store synced successfully";
      setIntegrationsMsg(successMsg);
      setIntegrationsMsgType('success');
      toast.success(successMsg);
      await loadShopifyAccounts();
    } catch (error: any) {
      console.error("Shopify sync failed:", error);
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Failed to sync Shopify store. Please check your connection and try again.";
      setIntegrationsMsg(errorMsg);
      setIntegrationsMsgType('error');
      toast.error(errorMsg);
    } finally {
      setIsLoadingShopify(false);
    }
  };

  const checkSubscriptionStatus = async (email: string, showError = true) => {
    if (!email) return;
    
    try {
      setIsLoadingSubscription(true);
      if (showError) {
        setNotificationsMsg(null);
      }
      const status = await notificationService.getSubscriptionStatus(email);
      setSubscriptionStatus(status.subscribed);
      notificationsForm.setValue("emailUpdates", status.subscribed);
    } catch (error: any) {
      console.error('Failed to check subscription status:', error);
      if (showError) {
        const errorMsg = error.response?.data?.message || error.message || "Unable to verify subscription status";
        setNotificationsMsg(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const handleNotificationToggle = async (email: string, wantSubscribed: boolean) => {
    try {
      setIsLoadingSubscription(true);
      setNotificationsMsg(null);
      
      if (wantSubscribed) {
        await notificationService.resubscribeEmail({ email });
        setNotificationsMsg("Successfully subscribed to email notifications");
        toast.success("You will now receive email notifications");
        // Refresh status from server to ensure UI matches server state (silently, no error messages)
        await checkSubscriptionStatus(email, false);
      } else {
        await notificationService.unsubscribeEmail({ email });
        setNotificationsMsg("Successfully unsubscribed from email notifications");
        toast.success("You have been unsubscribed from email notifications");
        // Refresh status from server to ensure UI matches server state (silently, no error messages)
        await checkSubscriptionStatus(email, false);
      }
    } catch (error: any) {
      console.error('Failed to update notification subscription:', error);
      const errorMsg = error.message || "Failed to update subscription";
      setNotificationsMsg(errorMsg);
      toast.error(errorMsg);
      // If the operation failed, refresh status to show actual server state
      try {
        await checkSubscriptionStatus(email, false);
      } catch (refreshError) {
        console.error('Failed to refresh status after error:', refreshError);
      }
    } finally {
      setIsLoadingSubscription(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <PageHeader
          title="Profile & Account"
          description="Manage business details, preferences, notifications, and API settings"
        />

        {/* Tabs - Below PageHeader as intended */}
        <div
          className={`${
            prefersReducedMotion ? "" : "animate-in fade-in slide-in-from-bottom-1 duration-300"
          }`}
        >
          <Tabs 
            value={activeTab}
            id="parcego-profile-tabs" 
            className="w-full mb-8"
          >
            <TabsList 
              className="flex w-full h-9 sm:h-10 p-1 bg-gray-100 rounded-lg overflow-hidden justify-between"
              style={{ padding: '1.68rem .75rem' }}
            >
              <TabsTrigger 
                value="business" 
                className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
              >
                Business
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
              >
                Settings
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="api" 
                className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
              >
                Shopify Integration
              </TabsTrigger>
            </TabsList>

            {/* Business */}
            <TabsContent value="business">
              <Card id="parcego-profile-business-card">
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Keep your company and contact info up to date.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Loading State */}
                  {isLoading && (
                    <Alert className="mb-3" role="status" aria-live="polite">
                      <AlertTitle>Loading</AlertTitle>
                      <AlertDescription>Loading your profile information...</AlertDescription>
                    </Alert>
                  )}

                  {/* Error State */}
                  {profileError && (
                    <Alert className="mb-3 border-red-200 bg-red-50" role="alert" aria-live="assertive">
                      <AlertTitle className="text-red-800">Error</AlertTitle>
                      <AlertDescription className="text-red-700">{profileError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Success/Info Messages */}
                  {businessMsg && (
                    <Alert className="mb-3" variant="success" role="status" aria-live="polite">
                      <AlertTitle>Business</AlertTitle>
                      <AlertDescription>{businessMsg}</AlertDescription>
                    </Alert>
                  )}

                  <Form {...businessForm}>
                    <form
                      id="parcego-profile-business-form"
                      className="grid grid-cols-1 gap-4 md:grid-cols-2"
                      onSubmit={businessForm.handleSubmit((data) =>
                        handleSave(STORAGE_KEYS.business, data, setBusinessMsg, "Business info")
                      )}
                      aria-label="Business information form"
                    >
                      <FormField
                        control={businessForm.control}
                        name="business_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your company LLC" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Merchant" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="name@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 111-2222" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="addressLine1"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address Line 1</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Commerce Ave" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="addressLine2"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address Line 2</FormLabel>
                            <FormControl>
                              <Input placeholder="Suite, unit, etc." {...field} />
                            </FormControl>
                            <FormDescription>Optional</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Service Area Notice */}
                      <div className="md:col-span-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start space-x-3">
                            <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Service Area Restriction
                              </p>
                              <p className="text-sm text-blue-700">
                                Your business address must be in <strong>Downtown Toronto</strong> or <strong>Mississauga</strong>, Ontario. This is required for pickup service availability.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <FormField
                        control={businessForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  // Auto-set province to Ontario when city changes
                                  businessForm.setValue("state", "Ontario", { shouldValidate: false });
                                  // Auto-set country to Canada
                                  businessForm.setValue("country", "Canada", { shouldValidate: false });
                                  // Clear postal code validation error if city changes
                                  setTimeout(() => businessForm.trigger("zip"), 100);
                                }}
                              >
                                <SelectTrigger id="parcego-profile-city">
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Toronto">Toronto</SelectItem>
                                  <SelectItem value="Mississauga">Mississauga</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="state"
                        render={({ field }) => {
                          // Ensure field value is always "Ontario"
                          if (field.value !== "Ontario") {
                            field.onChange("Ontario");
                          }
                          return (
                            <FormItem>
                              <FormLabel>Province <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ontario" 
                                  value="Ontario" 
                                  readOnly 
                                  className="bg-gray-50 cursor-not-allowed"
                                  onChange={() => {}} // Prevent changes
                                  onFocus={(e) => e.target.blur()} // Prevent focus
                                  tabIndex={-1} // Remove from tab order
                                />
                              </FormControl>
                              <FormDescription>Service area is limited to Ontario</FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={businessForm.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={businessForm.watch("city") === "Toronto" ? "M5V 3A8" : businessForm.watch("city") === "Mississauga" ? "L5A 1B2" : "A1A 1A1"} 
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value);
                                  // Only trigger validation if postal code looks complete (6+ characters without spaces)
                                  const cleaned = value.trim().replace(/[\s-]/g, '');
                                  if (cleaned.length >= 6) {
                                    // Delay validation slightly to allow user to finish typing
                                    setTimeout(() => businessForm.trigger("zip"), 300);
                                  } else if (cleaned.length === 0) {
                                    // Clear validation errors if field is empty
                                    businessForm.clearErrors("zip");
                                  }
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              {businessForm.watch("city") === "Toronto" 
                                ? "Enter a Toronto postal code (starts with M)"
                                : businessForm.watch("city") === "Mississauga"
                                ? "Enter a Mississauga postal code (starts with L4T-L5W)"
                                : "Enter a postal code in Toronto (M prefix) or Mississauga (L4T-L5W prefix)"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="country"
                        render={({ field }) => {
                          // Ensure field value is always "Canada"
                          if (field.value !== "Canada") {
                            field.onChange("Canada");
                          }
                          return (
                            <FormItem>
                              <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Canada" 
                                  value="Canada"
                                  readOnly 
                                  className="bg-gray-50 cursor-not-allowed"
                                  onChange={() => {}} // Prevent changes
                                  onFocus={(e) => e.target.blur()} // Prevent focus
                                  tabIndex={-1} // Remove from tab order
                                />
                              </FormControl>
                              <FormDescription>Service area is limited to Canada</FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <div className="col-span-full mt-4 flex items-center gap-2">
                        <Button type="submit" aria-label="Save business information">
                          Save changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleCancel('business')}
                          aria-label="Cancel changes and revert to last saved values"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings">
              <Card id="parcego-profile-settings-card">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Preferences for language, timezone, date format, and security.</CardDescription>
                </CardHeader>
                <CardContent>
                  {settingsMsg && (
                    <Alert className="mb-3" role="status" aria-live="polite">
                      <AlertTitle>Settings</AlertTitle>
                      <AlertDescription>{settingsMsg}</AlertDescription>
                    </Alert>
                  )}

                  <Form {...settingsForm}>
                    <form
                      id="parcego-profile-settings-form"
                      className="grid grid-cols-1 gap-4 md:grid-cols-2"
                      onSubmit={settingsForm.handleSubmit((data) =>
                        handleSave(STORAGE_KEYS.settings, data, setSettingsMsg, "Settings")
                      )}
                      aria-label="Account settings form"
                    >
                      <FormField
                        control={settingsForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <FormControl>
                              <Input placeholder="en or fr" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., America/New_York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/DD/YYYY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="twoFactorEnabled"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="parcego-profile-2fa-toggle"
                                checked={field.value}
                                onCheckedChange={(v) => field.onChange(!!v)}
                                aria-label="Enable two-factor authentication"
                              />
                              <Label htmlFor="parcego-profile-2fa-toggle">Enable 2FA</Label>
                            </div>
                            <FormDescription>UI-only toggle</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="col-span-full mt-4 flex items-center gap-2">
                        <Button type="submit" aria-label="Save account settings">
                          Save changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleCancel('settings')}
                          aria-label="Cancel changes and revert to last saved values"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications">
              <Card id="parcego-profile-notifications-card">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive updates and notifications from Parcego.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {notificationsMsg && (
                    <Alert className="mb-4" role="status" aria-live="polite">
                      <AlertTitle>Notifications</AlertTitle>
                      <AlertDescription>{notificationsMsg}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email Address Check */}
                  {!userEmail && (
                    <Alert className="mb-4 border-yellow-200 bg-yellow-50" role="alert">
                      <AlertTitle className="text-yellow-800">Email Required</AlertTitle>
                      <AlertDescription className="text-yellow-700">
                        Please enter your email address in the <strong>Business</strong> tab to manage email notifications.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Email Notifications Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                          {isLoadingSubscription && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <span className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                              Checking status...
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Receive email updates about shipment status, delivery confirmations, and important account notifications.
                        </p>
                        {userEmail && (
                          <p className="text-xs text-gray-500">
                            Email address: <span className="font-medium">{userEmail}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4 min-w-[140px]">
                        {subscriptionStatus !== null && !isLoadingSubscription ? (
                          <>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              subscriptionStatus 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {subscriptionStatus ? "Subscribed" : "Unsubscribed"}
                            </div>
                            <Button
                              type="button"
                              variant={subscriptionStatus ? "destructive" : "default"}
                              size="sm"
                              onClick={() => {
                                if (userEmail) {
                                  handleNotificationToggle(userEmail, !subscriptionStatus);
                                } else {
                                  setNotificationsMsg("Please enter your email address in the Business tab first");
                                  toast.error("Email address required");
                                }
                              }}
                              disabled={isLoadingSubscription}
                              aria-label={subscriptionStatus ? "Unsubscribe from email notifications" : "Subscribe to email notifications"}
                            >
                              {subscriptionStatus ? "Unsubscribe" : "Subscribe"}
                            </Button>
                          </>
                        ) : isLoadingSubscription ? (
                          <div className="flex flex-col items-end gap-2">
                            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              Checking...
                            </div>
                            <div className="text-xs text-gray-500">Please wait</div>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (userEmail) {
                                checkSubscriptionStatus(userEmail);
                              } else {
                                setNotificationsMsg("Please enter your email address in the Business tab first");
                                toast.error("Email address required");
                              }
                            }}
                            disabled={isLoadingSubscription}
                            aria-label="Check subscription status"
                          >
                            Check Status
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Additional Notification Types - Placeholder for future */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 text-sm">What you'll receive:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Shipment status updates and tracking information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Delivery confirmations and proof of delivery</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Account alerts and important notifications</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Billing and payment reminders</span>
                        </li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    {userEmail && subscriptionStatus !== null && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (userEmail) {
                              await checkSubscriptionStatus(userEmail, true);
                              toast.success("Subscription status refreshed");
                            }
                          }}
                          disabled={isLoadingSubscription}
                          aria-label="Refresh subscription status"
                        >
                          {isLoadingSubscription ? "Refreshing..." : "Refresh Status"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API & Integrations */}
            <TabsContent value="api">
              <Card id="parcego-profile-integrations-card">
                <CardHeader>
                  <CardTitle>Shopify Integration</CardTitle>
                  <CardDescription>Connect your Shopify store to enable seamless order management and fulfillment automation.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Setup Instructions */}
                  {shopifyAccounts.length === 0 && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Icon name="Info" size={16} />
                        Getting Started
                      </h3>
                      <ol className="space-y-3 text-sm text-blue-800">
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            1
                          </span>
                          <span className="pt-0.5">Install the Parcego app in your Shopify store</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            2
                          </span>
                          <span className="pt-0.5">Login to Parcego when prompted</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            3
                          </span>
                          <span className="pt-0.5">
                            Your orders will automatically sync every 10 minutes or you can manually sync in your profile tab
                          </span>
                        </li>
                      </ol>
                    </div>
                  )}

                  {integrationsMsg && (
                    <Alert 
                      className={`mb-3 ${
                        integrationsMsgType === 'success' 
                          ? 'border-green-200 bg-green-50' 
                          : integrationsMsgType === 'error'
                          ? 'border-red-200 bg-red-50'
                          : ''
                      }`}
                      role="status" 
                      aria-live="polite"
                    >
                      <AlertTitle className={integrationsMsgType === 'success' ? 'text-green-800' : integrationsMsgType === 'error' ? 'text-red-800' : ''}>
                        {integrationsMsgType === 'success' ? 'Success' : integrationsMsgType === 'error' ? 'Error' : 'Integration'}
                      </AlertTitle>
                      <AlertDescription className={integrationsMsgType === 'success' ? 'text-green-700' : integrationsMsgType === 'error' ? 'text-red-700' : ''}>
                        {integrationsMsg}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Connected Shopify Stores */}
                  {shopifyAccounts.length > 0 && (
                    <div className="mb-6 space-y-4">
                      <h3 className="text-lg font-medium">Connected Stores</h3>
                      {shopifyAccounts.map((account) => (
                        <Card key={account.id} className="border-l-4 border-l-green-500">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{account.shop_name || account.shop_domain}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    account.status === 'active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : account.status === 'error'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {account.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{account.shop_domain}</p>
                                {account.last_sync_at && (
                                  <p className="text-xs text-gray-500">
                                    Last synced: {new Date(account.last_sync_at).toLocaleString()}
                                  </p>
                                )}
                                {account.error_message && (
                                  <Alert className="mt-2 border-red-200 bg-red-50">
                                    <AlertDescription className="text-red-700 text-sm">
                                      {account.error_message}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleShopifySync(account.id)}
                                  disabled={isLoadingShopify}
                                  aria-label={`Sync ${account.shop_domain}`}
                                >
                                  Sync
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleShopifyDisconnect(account.id)}
                                  disabled={isDisconnectingShopify === account.id}
                                  aria-label={`Disconnect ${account.shop_domain}`}
                                >
                                  {isDisconnectingShopify === account.id ? "Disconnecting..." : "Disconnect"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Loading Shopify Accounts */}
                  {isLoadingShopify && shopifyAccounts.length === 0 && (
                    <Alert className="mb-4" role="status" aria-live="polite">
                      <AlertDescription>Loading Shopify stores...</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function ProfileAccountPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function ProfileAccountPage() {
  return (
    <Suspense fallback={<ProfileAccountPageLoading />}>
      <ProfileAccountPageContent />
    </Suspense>
  );
}


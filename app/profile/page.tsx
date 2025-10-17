"use client";

import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileService } from "@/lib/api/profile";
import { notificationService } from "@/lib/api/notifications";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
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

const BusinessInfoSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\d{10,}$/, "Phone number must have at least 10 digits"),
  addressLine1: z.string().min(2, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().regex(/^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/, "Invalid postal code format. Use Canadian format: A1A 1A1"),
  country: z.string().min(2, "Country is required"),
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
    enabled: z.boolean(),
    shopDomain: z.string().optional(),
    accessToken: z.string().optional(),
    webhookSecret: z.string().optional(),
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

export default function ProfileAccountPage() {
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

  const defaultBusiness: BusinessInfo = useMemo(
    () => ({
      business_name: "",
      contactName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zip: "",
      country: "",
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
        enabled: false,
        shopDomain: "",
        accessToken: "",
        webhookSecret: "",
      },
    }),
    []
  );

  const businessForm = useForm<BusinessInfo>({
    resolver: zodResolver(BusinessInfoSchema),
    defaultValues: defaultBusiness,
    mode: "onBlur",
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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setProfileError(null);
        
        const profileData = await profileService.getProfile();
        
        // Map API response to form data
        const businessData: BusinessInfo = {
          business_name: profileData.business_name || "",
          contactName: `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim(),
          email: profileData.email || "",
          phone: profileData.phone_number || "",
          addressLine1: profileData.street_address || "",
          addressLine2: profileData.street_address_2 || "",
          city: profileData.city || "",
          state: profileData.province || "",
          zip: profileData.postal_code || "",
          country: profileData.country || "",
        };
        
        businessForm.reset(businessData);
        
        // Check notification subscription status for the email
        if (profileData.email) {
          await checkSubscriptionStatus(profileData.email);
        }
        
        // Load other data from localStorage as fallback for now
        const s = localStorage.getItem(STORAGE_KEYS.settings);
        const i = localStorage.getItem(STORAGE_KEYS.integrations);
        if (s) settingsForm.reset(JSON.parse(s));
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
          if (b) businessForm.reset(JSON.parse(b));
          if (s) settingsForm.reset(JSON.parse(s));
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

  const [businessMsg, setBusinessMsg] = useState<string | null>(null);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);
  const [notificationsMsg, setNotificationsMsg] = useState<string | null>(null);
  const [integrationsMsg, setIntegrationsMsg] = useState<string | null>(null);

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
          province: businessData.state,
          postal_code: businessData.zip,
          country: businessData.country,
        };

        // Only include optional fields if they have values
        if (businessData.addressLine2 && businessData.addressLine2.trim()) {
          updateData.street_address_2 = businessData.addressLine2;
        }
        
        await profileService.updateProfile(updateData);
        
        // Also save to localStorage as backup
        localStorage.setItem(key, JSON.stringify(data));
        onOk(`${label} saved successfully`);
      } catch (error: any) {
        console.error('Failed to save profile:', error);
        onOk(`Failed to save ${label}: ${error.message || 'Unknown error'}`);
      }
    } else {
      // For other data types, use localStorage
      try {
        localStorage.setItem(key, JSON.stringify(data));
        onOk(`${label} saved`);
      } catch {
        onOk(`Could not save ${label}`);
      }
    }
  };

  const handleReset = <T,>(resetFn: (v: T) => void, defaults: T, onOk: (msg: string) => void, label: string) => {
    resetFn(defaults);
    onOk(`${label} reset`);
  };

  const handleShopifyConnect = () => {
    // Mock Shopify OAuth flow - in real implementation, this would redirect to Shopify
    setIntegrationsMsg("Shopify integration initiated (UI-only demo)");
    integrationsForm.setValue("shopify.enabled", true);
    integrationsForm.setValue("shopify.shopDomain", "demo-store.myshopify.com");
    integrationsForm.setValue("shopify.accessToken", "shpat_••••••••••••••••••");
  };

  const checkSubscriptionStatus = async (email: string) => {
    if (!email) return;
    
    try {
      setIsLoadingSubscription(true);
      const status = await notificationService.getSubscriptionStatus(email);
      setSubscriptionStatus(status.subscribed);
      notificationsForm.setValue("emailUpdates", status.subscribed);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      // Default to subscribed if we can't check
      setSubscriptionStatus(true);
      notificationsForm.setValue("emailUpdates", true);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const handleNotificationToggle = async (email: string, isSubscribed: boolean) => {
    try {
      if (isSubscribed) {
        await notificationService.unsubscribeEmail({ email });
        setNotificationsMsg("Successfully unsubscribed from email notifications");
      } else {
        await notificationService.resubscribeEmail({ email });
        setNotificationsMsg("Successfully subscribed to email notifications");
      }
      setSubscriptionStatus(isSubscribed);
    } catch (error: any) {
      console.error('Failed to update notification subscription:', error);
      setNotificationsMsg(`Failed to update subscription: ${error.message}`);
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
          <Tabs defaultValue="business" id="parcego-profile-tabs" className="w-full mb-8">
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
                    <Alert className="mb-3" role="status" aria-live="polite">
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
                      <FormField
                        control={businessForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="USA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="col-span-full mt-4 flex items-center gap-2">
                        <Button type="submit" aria-label="Save business information">
                          Save changes
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleReset(businessForm.reset, defaultBusiness, setBusinessMsg, "Business info")}
                          aria-label="Reset business information to defaults"
                        >
                          Reset
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
                          variant="ghost"
                          onClick={() => handleReset(settingsForm.reset, defaultSettings, setSettingsMsg, "Settings")}
                          aria-label="Reset account settings to defaults"
                        >
                          Reset
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
                  <CardDescription>Choose when and how we keep you informed.</CardDescription>
                </CardHeader>
                <CardContent>
                  {notificationsMsg && (
                    <Alert className="mb-3" role="status" aria-live="polite">
                      <AlertTitle>Notifications</AlertTitle>
                      <AlertDescription>{notificationsMsg}</AlertDescription>
                    </Alert>
                  )}

                  <Form {...notificationsForm}>
                    <form
                      id="parcego-profile-notifications-form"
                      className="grid grid-cols-1 gap-3"
                      onSubmit={notificationsForm.handleSubmit((data) => {
                        const email = businessForm.getValues("email");
                        if (email) {
                          handleNotificationToggle(email, data.emailUpdates);
                        } else {
                          setNotificationsMsg("Please enter your email address in the Business tab first");
                        }
                      })}
                      aria-label="Notification preferences form"
                    >
                      <FormField
                        control={notificationsForm.control}
                        name="emailUpdates"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="parcego-profile-notif-email"
                                  checked={field.value as boolean}
                                  onCheckedChange={(v) => field.onChange(!!v)}
                                  aria-label="Email updates"
                                  disabled={isLoadingSubscription}
                                />
                                <Label htmlFor="parcego-profile-notif-email">Email updates</Label>
                              </div>
                              {isLoadingSubscription && (
                                <span className="text-sm text-gray-500">Checking status...</span>
                              )}
                              {subscriptionStatus !== null && !isLoadingSubscription && (
                                <span className="text-sm text-gray-500">
                                  {subscriptionStatus ? "Subscribed" : "Unsubscribed"}
                                </span>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="mt-4 flex items-center gap-2">
                        <Button 
                          type="submit" 
                          aria-label="Update notification preferences"
                          disabled={isLoadingSubscription}
                        >
                          {isLoadingSubscription ? "Checking..." : "Update Subscription"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            const email = businessForm.getValues("email");
                            if (email) {
                              checkSubscriptionStatus(email);
                            }
                          }}
                          aria-label="Refresh subscription status"
                          disabled={isLoadingSubscription}
                        >
                          Refresh Status
                        </Button>
                      </div>
                    </form>
                  </Form>
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
                  {integrationsMsg && (
                    <Alert className="mb-3" role="status" aria-live="polite">
                      <AlertTitle>Integration</AlertTitle>
                      <AlertDescription>{integrationsMsg}</AlertDescription>
                    </Alert>
                  )}

                  <Form {...integrationsForm}>
                    <form
                      id="parcego-profile-integrations-form"
                      className="space-y-6"
                      onSubmit={integrationsForm.handleSubmit((data) =>
                        handleSave(STORAGE_KEYS.integrations, data, setIntegrationsMsg, "Shopify integration")
                      )}
                      aria-label="Shopify integration form"
                    >
                      {/* Shopify Integration */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Shopify Store Connection</h3>
                            <p className="text-sm text-gray-600">Connect your Shopify store for seamless order management and fulfillment</p>
                          </div>
                          <Button
                            type="button"
                            variant={integrationsForm.watch("shopify.enabled") ? "outline" : "default"}
                            onClick={handleShopifyConnect}
                            aria-label="Connect Shopify integration"
                          >
                            {integrationsForm.watch("shopify.enabled") ? "Connected" : "Connect"}
                          </Button>
                        </div>
                        
                        {integrationsForm.watch("shopify.enabled") && (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                              control={integrationsForm.control}
                              name="shopify.shopDomain"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Shop Domain</FormLabel>
                                  <FormControl>
                                    <Input placeholder="your-store.myshopify.com" {...field} />
                                  </FormControl>
                                  <FormDescription>Your Shopify store&apos;s domain (e.g., mystore.myshopify.com)</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={integrationsForm.control}
                              name="shopify.accessToken"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Access Token</FormLabel>
                                  <FormControl>
                                    <Input placeholder="shpat_••••••••••••••••••" {...field} />
                                  </FormControl>
                                  <FormDescription>Your Shopify private app access token</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={integrationsForm.control}
                              name="shopify.webhookSecret"
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel>Webhook Secret</FormLabel>
                                  <FormControl>
                                    <Input placeholder="whsec_••••••••••••••••••" {...field} />
                                  </FormControl>
                                  <FormDescription>Secret key for verifying webhook authenticity from Shopify</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>

                      {integrationsForm.watch("shopify.enabled") && (
                        <div className="pt-4 border-t">
                          <Button type="submit" aria-label="Save Shopify integration settings">
                            Save Shopify Settings
                          </Button>
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}



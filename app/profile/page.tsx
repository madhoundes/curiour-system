"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const BusinessInfoSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  addressLine1: z.string().min(2, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(3, "ZIP is required"),
  country: z.string().min(2, "Country is required"),
});

const AccountSettingsSchema = z.object({
  language: z.enum(["en", "fr"]),
  timezone: z.string().min(2, { error: "Timezone is required" }),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
  twoFactorEnabled: z.boolean().default(false),
});

const NotificationPrefsSchema = z.object({
  emailUpdates: z.boolean().default(true),
  smsUpdates: z.boolean().default(false),
  pushUpdates: z.boolean().default(true),
  deliveryAlerts: z.boolean().default(true),
  weeklySummary: z.boolean().default(true),
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
  const router = useRouter();
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const defaultBusiness: BusinessInfo = useMemo(
    () => ({
      businessName: "Acme Electronics LLC",
      contactName: "Jane Merchant",
      email: "jane@acme.com",
      phone: "(555) 111-2222",
      addressLine1: "123 Commerce Ave",
      addressLine2: "",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
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
      smsUpdates: false,
      pushUpdates: true,
      deliveryAlerts: true,
      weeklySummary: true,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [businessMsg, setBusinessMsg] = useState<string | null>(null);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);
  const [notificationsMsg, setNotificationsMsg] = useState<string | null>(null);
  const [integrationsMsg, setIntegrationsMsg] = useState<string | null>(null);

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleSave = <T,>(key: string, data: T, onOk: (msg: string) => void, label: string) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      onOk(`${label} saved`);
    } catch {
      onOk(`Could not save ${label}`);
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



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                id="parcego-profile-back-btn"
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                aria-label="Back to Dashboard"
              >
                <span aria-hidden className="mr-2">←</span>
                Back to Dashboard
              </Button>
              <div className="h-6 border-l" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Profile & Account</h1>
                <p className="text-sm text-gray-500">Manage business details, preferences, notifications, and API settings.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main
        className={`mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 ${
          prefersReducedMotion ? "" : "animate-in fade-in slide-in-from-bottom-1 duration-300"
        }`}
      >
        <Tabs defaultValue="business" id="parcego-profile-tabs" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="api">Shopify Integration</TabsTrigger>
          </TabsList>

          {/* Business */}
          <TabsContent value="business">
            <Card id="parcego-profile-business-card">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Keep your company and contact info up to date.</CardDescription>
              </CardHeader>
              <CardContent>
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
                      name="businessName"
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
                            <input
                              id="parcego-profile-2fa-toggle"
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              aria-label="Enable two-factor authentication"
                              className="h-4 w-4 rounded border"
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
                    onSubmit={notificationsForm.handleSubmit((data) =>
                      handleSave(
                        STORAGE_KEYS.notifications,
                        data,
                        setNotificationsMsg,
                        "Notifications"
                      )
                    )}
                    aria-label="Notification preferences form"
                  >
                    {[
                      ["emailUpdates", "Email updates"],
                      ["smsUpdates", "SMS updates"],
                      ["pushUpdates", "Push notifications"],
                      ["deliveryAlerts", "Delivery alerts"],
                      ["weeklySummary", "Weekly summary"],
                    ].map(([key, text]) => (
                      <FormField
                        key={key}
                        control={notificationsForm.control}
                        // @ts-expect-error index access is safe here
                        name={key}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <input
                                id={`parcego-profile-notif-${key}`}
                                type="checkbox"
                                checked={field.value as boolean}
                                onChange={field.onChange}
                                aria-label={text as string}
                                className="h-4 w-4 rounded border"
                              />
                              <Label htmlFor={`parcego-profile-notif-${key}`}>{text as string}</Label>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    <div className="mt-4 flex items-center gap-2">
                      <Button type="submit" aria-label="Save notification preferences">
                        Save changes
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          handleReset(
                            notificationsForm.reset,
                            defaultNotifications,
                            setNotificationsMsg,
                            "Notifications"
                          )
                        }
                        aria-label="Reset notification preferences to defaults"
                      >
                        Reset
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
      </main>
    </div>
  );
}



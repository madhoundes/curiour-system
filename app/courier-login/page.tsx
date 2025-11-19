"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/lib/api";
import { clearShipmentFormData } from "@/lib/shipment-cache-utils";

// Form validation schema
const courierLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type CourierLoginFormData = z.infer<typeof courierLoginSchema>;

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper function to set cookie
const setCookie = (name: string, value: string, days: number) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
};

const CourierLoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form
  const form = useForm<CourierLoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    resolver: zodResolver(courierLoginSchema),
  });

  // Check for remembered email on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedEmail = getCookie('courier_remembered_email');
      if (rememberedEmail) {
        form.setValue('email', rememberedEmail);
        form.setValue('rememberMe', true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: CourierLoginFormData) => {
    setError("");
    setIsLoading(true);

    console.log('🔐 [LOGIN] Starting login process...');
    console.log('🔐 [LOGIN] Email:', data.email);

    try {
      // Call the actual API login endpoint
      console.log('🔐 [LOGIN] Calling API login endpoint...');
      const response = await authService.login({
        username: data.email, // API expects username field
        password: data.password,
      });

      // Log the full response structure
      console.log('✅ [LOGIN] Full API Response:', response);
      console.log('✅ [LOGIN] Response data:', response.data);
      console.log('✅ [LOGIN] Response keys:', Object.keys(response.data || {}));
      
      // Extract token from response
      const accessToken = response.data.access_token;
      
      // Validate we have access token
      if (!accessToken) {
        console.error('❌ [LOGIN] No access token in response');
        setError("Login failed: No access token received.");
        setIsLoading(false);
        return;
      }

      console.log('✅ [LOGIN] Access token received:', accessToken.substring(0, 20) + '...');

      // Clear shipment form cache on login to prevent data from previous user
      await clearShipmentFormData();

      // Token is stored by authService automatically, now get user data
      console.log('🔍 [LOGIN] Fetching user data with token...');
      const userResponse = await authService.getCurrentUser();
      
      console.log('✅ [LOGIN] User data fetched:', {
        userId: userResponse.data.id,
        email: userResponse.data.email,
        firstName: userResponse.data.first_name,
        lastName: userResponse.data.last_name,
        role: userResponse.data.role,
        isActive: userResponse.data.is_active
      });

      const userData = userResponse.data;

      // Check if user has courier/driver role
      if (userData.role !== 'courier' && userData.role !== 'driver') {
        console.error('❌ [LOGIN] Invalid role:', userData.role);
        setError("Access denied. Courier credentials required.");
        setIsLoading(false);
        return;
      }

      console.log('✅ [LOGIN] Role validation passed:', userData.role);

      // Only run on client side to prevent hydration mismatch
      if (typeof window !== 'undefined') {
        const rememberMe = data.rememberMe || false;
        
        // Store login time as timestamp (number) for easier expiration checking
        const loginTime = Date.now().toString();
        
        // Store authentication state
        localStorage.setItem("courier_authenticated", "true");
        localStorage.setItem("courier_email", data.email);
        localStorage.setItem("courier_login_time", loginTime);
        localStorage.setItem("auth_token", accessToken);
        localStorage.setItem("courier_user", JSON.stringify(userData));
        localStorage.setItem("courier_remember_me", rememberMe ? "true" : "false");
        
        // Enhanced cookie setting for LAN network compatibility
        const isSecure = window.location.protocol === 'https:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isLAN = window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('192.168.');
        
        // Set cookie expiration based on remember me option
        // 30 days if remember me is checked, 24 hours if not
        const maxAge = rememberMe ? 2592000 : 86400; // 30 days or 24 hours in seconds
        
        // Set cookie with appropriate security settings based on environment
        const cookieOptions = [
          'courier_authenticated=true',
          'path=/',
          `max-age=${maxAge}`,
          'SameSite=Lax'
        ];
        
        // Only add Secure flag for HTTPS or localhost
        if (isSecure || isLocalhost) {
          cookieOptions.push('Secure');
        }
        
        // For LAN networks, ensure cookie is accessible
        if (isLAN) {
          cookieOptions.push('domain=' + window.location.hostname);
        }
        
        const cookieValue = cookieOptions.join('; ');
        document.cookie = cookieValue;
        
        // Store email in cookie if remember me is checked
        if (rememberMe) {
          setCookie('courier_remembered_email', data.email, 30);
        } else {
          // Clear remembered email cookie if not checked
          document.cookie = 'courier_remembered_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        
        // Get redirect URL from search params, default to /courier
        const redirectUrl = searchParams.get('redirect') || '/courier';
        
        // Redirect to courier dashboard
        const delay = isLAN ? 500 : 300;
        setTimeout(() => {
          router.push(redirectUrl);
        }, delay);
      }
    } catch (err: any) {
      console.error("❌ [LOGIN] Login error:", err);
      console.error("❌ [LOGIN] Error details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // Handle specific API errors
      if (err.message) {
        setError(err.message);
      } else if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Courier credentials required.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // In a real app, this would open a forgot password modal or redirect
    alert("Forgot password functionality would be implemented here. Please contact support for assistance.");
  };

  const handleContactSupport = () => {
    router.push("/support");
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4"
      id="parcego-courier-login-container"
    >
      <div className="w-full max-w-md space-y-[13.5px]">
        {/* Header with Logo and Branding */}
        <div className="text-center space-y-[4.6px]">
          <div className="flex justify-center">
            <img
              src="/Logo/Master-logo.svg"
              alt="Parcego Logo"
              className="w-[140px] h-[140px]"
              width={125}
              height={125}
              id="parcego-courier-login-logo"
            />
          </div>
          <div>
            {/* <h1 
              className="text-2xl font-bold text-gray-900"
              id="parcego-courier-login-title"
            >
              Courier Portal
            </h1> */}
            <p 
              className="text-gray-600 mt-0.5"
              id="parcego-courier-login-subtitle"
            >
              Sign in to access your delivery dashboard
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <Card 
          className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          id="parcego-courier-login-card"
        >
          <CardHeader className="space-y-1 pb-6 pt-8">
            <CardTitle 
              className="text-xl text-center"
              id="parcego-courier-login-form-title"
            >
              Welcome Back
            </CardTitle>
            <CardDescription 
              className="text-center"
              id="parcego-courier-login-form-description"
            >
              Enter your credentials to access your courier account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email/Username Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                  id="parcego-courier-login-email-label"
                >
                  Email or Username
                </Label>
                <div className="relative">
                  <Input
                    id="parcego-courier-login-email-input"
                    type="email"
                    placeholder="courier@parcego.com"
                    className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    disabled={isLoading}
                    {...form.register("email")}
                  />
                  <Icon 
                    name="Mail" 
                    size={18} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                  id="parcego-courier-login-password-label"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="parcego-courier-login-password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="password123"
                    className="pl-10 pr-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    disabled={isLoading}
                    {...form.register("password")}
                  />
                  <Icon 
                    name="Lock" 
                    size={18} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                    id="parcego-courier-login-password-toggle"
                  >
                    <Icon 
                      name={showPassword ? "EyeOff" : "Eye"} 
                      size={18} 
                    />
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <Controller
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="courier-remember-me"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      aria-label="Remember me"
                    />
                    <Label
                      htmlFor="courier-remember-me"
                      className="text-sm font-normal cursor-pointer"
                      onClick={() => field.onChange(!field.value)}
                    >
                      Remember me
                    </Label>
                  </div>
                )}
              />

              {/* Error Message */}
              {error && (
                <Alert 
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                  id="parcego-courier-login-error-alert"
                >
                  <Icon name="AlertCircle" size={16} className="text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                id="parcego-courier-login-submit-btn"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Icon name="LogIn" size={18} />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Help Links */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              {/* <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors text-center sm:text-left"
                  disabled={isLoading}
                  id="parcego-courier-login-forgot-password"
                >
                  Forgot your password?
                </button>
                <button
                  type="button"
                  onClick={handleContactSupport}
                  className="text-sm text-gray-600 hover:text-gray-700 hover:underline transition-colors text-center sm:text-right"
                  disabled={isLoading}
                  id="parcego-courier-login-contact-support"
                >
                  Contact Support
                </button>
              </div> */}
            </div>
          </CardContent>
        </Card>



        {/* Footer */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>© 2025 Parcego. All rights reserved.</p>
          <p>Secure courier portal for delivery professionals</p>
          
          {/* Footer Links */}
          <div className="flex items-center justify-center space-x-4 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/support')}
              className="text-xs text-gray-500 hover:text-gray-700 h-auto py-1 px-2"
              id="parcego-courier-login-footer-support-btn"
            >
              Help & Support
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/privacy-policy')}
              className="text-xs text-gray-500 hover:text-gray-700 h-auto py-1 px-2"
              id="parcego-courier-login-footer-privacy-btn"
            >
              Privacy Policy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/terms-conditions')}
              className="text-xs text-gray-500 hover:text-gray-700 h-auto py-1 px-2"
              id="parcego-courier-login-footer-terms-btn"
            >
              Terms & Conditions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading component for Suspense fallback
const CourierLoginLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Main page component with Suspense boundary
const CourierLogin = () => {
  return (
    <Suspense fallback={<CourierLoginLoadingFallback />}>
      <CourierLoginContent />
    </Suspense>
  );
};

export default CourierLogin;

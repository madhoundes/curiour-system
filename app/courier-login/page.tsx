"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/lib/api";

// Form validation schema
const courierLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function CourierLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form with empty credentials (remove demo data for security)
  const form = useForm<z.infer<typeof courierLoginSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(courierLoginSchema),
  });

  const onSubmit = async (data: z.infer<typeof courierLoginSchema>) => {
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
        console.log('🔐 [LOGIN] Storing authentication data...');
        
        // Store authentication state
        localStorage.setItem("courier_authenticated", "true");
        localStorage.setItem("courier_email", data.email);
        localStorage.setItem("courier_login_time", Date.now().toString());
        localStorage.setItem("auth_token", accessToken);
        localStorage.setItem("courier_user", JSON.stringify(userData));
        
        console.log('✅ [LOGIN] LocalStorage items set:', {
          courier_authenticated: localStorage.getItem("courier_authenticated"),
          courier_email: localStorage.getItem("courier_email"),
          courier_login_time: localStorage.getItem("courier_login_time"),
          auth_token_length: localStorage.getItem("auth_token")?.length || 0,
          courier_user_stored: !!localStorage.getItem("courier_user")
        });
        
        // Enhanced cookie setting for LAN network compatibility
        const isSecure = window.location.protocol === 'https:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isLAN = window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('192.168.');
        
        console.log('🔐 [LOGIN] Environment check:', {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          isSecure,
          isLocalhost,
          isLAN
        });
        
        // Set cookie with appropriate security settings based on environment
        const cookieOptions = [
          'courier_authenticated=true',
          'path=/',
          'max-age=86400',
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
        
        console.log('🍪 [LOGIN] Cookie set:', cookieValue);
        console.log('🍪 [LOGIN] All cookies:', document.cookie);
        
        // Verify storage before redirect
        console.log('✅ [LOGIN] Final verification before redirect:');
        console.log('   - courier_authenticated:', localStorage.getItem("courier_authenticated"));
        console.log('   - auth_token exists:', !!localStorage.getItem("auth_token"));
        console.log('   - cookie set:', document.cookie.includes('courier_authenticated=true'));
        
        // Redirect to courier dashboard
        const delay = isLAN ? 500 : 100;
        console.log(`🔐 [LOGIN] Redirecting to /courier in ${delay}ms...`);
        
        setTimeout(() => {
          console.log('🔐 [LOGIN] Executing redirect now...');
          router.push("/courier");
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
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/lib/api/auth";
import { apiClient } from "@/lib/api/client";

// Form validation schema
const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

/**
 * Authenticate admin through backend API
 * 
 * NOTE: To create an admin user in the backend, use the admin creation endpoint:
 * POST /auth/admin/create-user with role: 'admin' or 'courier'
 * 
 * This function:
 * 1. Authenticates the user via the backend API
 * 2. Fetches the current user information
 * 3. Verifies the user has admin or courier role
 * 4. Returns the JWT token for subsequent API calls
 */
const authenticateAdmin = async (email: string, password: string) => {
  try {
    // Step 1: Call the authentication API to get the token
    const loginResponse = await authService.login({
      username: email, // OAuth2PasswordRequestForm expects 'username'
      password: password,
      grant_type: "password"
    });
    
    // Step 2: Get the JWT token
    const token = loginResponse.data.access_token;
    if (!token) {
      return { 
        success: false, 
        error: "Authentication failed. No token received." 
      };
    }
    
    // Step 3: Fetch current user information using the token
    // The token is already set by authService.login(), so we can make authenticated requests
    const userResponse = await authService.getCurrentUser();
    const user = userResponse.data;
    
    // Step 4: Check if user has admin or courier role (both can access admin panel)
    if (user.role !== 'admin' && user.role !== 'courier') {
      // Remove the token since user doesn't have proper permissions
      apiClient.removeAuthToken();
      return { 
        success: false, 
        error: "Access denied. Administrator privileges required." 
      };
    }
    
    return { 
      success: true, 
      token: token,
      user: user
    };
  } catch (error: any) {
    console.error('Admin authentication error:', error);
    
    // Clean up token on error
    apiClient.removeAuthToken();
    
    if (error.status === 401) {
      return { 
        success: false, 
        error: "Invalid admin credentials. Access denied." 
      };
    }
    
    return { 
      success: false, 
      error: error.message || "Authentication failed. Please try again." 
    };
  }
};

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

const AdminLoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form
  const form = useForm<AdminLoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    resolver: zodResolver(adminLoginSchema),
  });

  // Check for remembered email on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedEmail = getCookie('admin_remembered_email');
      if (rememberedEmail) {
        form.setValue('email', rememberedEmail);
        form.setValue('rememberMe', true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: AdminLoginFormData) => {
    setError("");
    setIsLoading(true);

    try {
      const result = await authenticateAdmin(data.email, data.password);
      
      if (result.success && result.token && result.user) {
        // Token is already set by authService.login(), but we'll ensure it's set
        apiClient.setAuthToken(result.token);
        
        // Store admin authentication state
        if (typeof window !== 'undefined') {
          const rememberMe = data.rememberMe || false;
          
          // Store login time as timestamp (number) for easier expiration checking
          const loginTime = Date.now().toString();
          
          localStorage.setItem("admin_authenticated", "true");
          localStorage.setItem("admin_email", data.email);
          localStorage.setItem("admin_user_id", String(result.user.id));
          localStorage.setItem("admin_role", result.user.role);
          localStorage.setItem("admin_name", `${result.user.first_name} ${result.user.last_name}`);
          localStorage.setItem("admin_login_time", loginTime);
          localStorage.setItem("admin_remember_me", rememberMe ? "true" : "false");
          
          // Set cookie expiration based on remember me option
          // 30 days if remember me is checked, 24 hours if not
          const maxAge = rememberMe ? 2592000 : 86400; // 30 days or 24 hours in seconds
          
          // Set admin authentication cookie
          document.cookie = `admin_authenticated=true; path=/; max-age=${maxAge}; SameSite=Lax`;
          
          // Store email in cookie if remember me is checked
          if (rememberMe) {
            setCookie('admin_remembered_email', data.email, 30);
          } else {
            // Clear remembered email cookie if not checked
            document.cookie = 'admin_remembered_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
          
          console.log('✅ Admin authentication successful!');
          console.log('User:', result.user.first_name, result.user.last_name);
          console.log('Role:', result.user.role);
          console.log('Token stored:', result.token.substring(0, 20) + '...');
          console.log('Remember me:', rememberMe);
          console.log('Login time:', loginTime);
          
          // Get redirect URL from search params, default to /admin
          const redirectUrl = searchParams.get('redirect') || '/admin';
          
          // Redirect to admin dashboard or redirect URL
          setTimeout(() => {
            console.log('Redirecting to:', redirectUrl);
            router.push(redirectUrl);
          }, 300);
        }
      } else {
        setError(result.error || "Admin login failed. Please try again.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // In a real app, this would open a secure admin password reset flow
    alert("Please contact the system administrator for password reset assistance.\n\nFor security purposes, admin password resets require manual verification.");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4"
      id="parcego-admin-login-container"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Header with Logo */}
        <div className="text-center space-y-4" id="parcego-admin-login-header">
          <div className="flex justify-center items-center">
            <Image
              src="/Logo/Horizontal-logo.svg"
              alt="Parcego Logo"
              width={180}
              height={40}
              className="h-10 w-auto"
              unoptimized
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administrator Login</h1>
            <p className="text-sm text-gray-600 mt-1">
              Secure access to platform management
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm" id="parcego-admin-login-card">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-xl text-center text-gray-800">
              System Access
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your administrator credentials to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50" id="parcego-admin-login-error">
                <Icon name="AlertCircle" className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="parcego-admin-login-form">
              {/* Email Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="admin-email" 
                  className="text-sm font-medium text-gray-700"
                >
                  Administrator Email
                </Label>
                <div className="relative">
                  <Icon 
                    name="Mail" 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
                  />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="Enter your admin email"
                    className={`pl-10 h-11 ${form.formState.errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    {...form.register("email")}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <Icon name="AlertCircle" className="h-3 w-3" />
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="admin-password" 
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Icon 
                    name="Lock" 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
                  />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`pl-10 pr-10 h-11 ${form.formState.errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    {...form.register("password")}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    id="parcego-admin-password-toggle"
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} className="h-4 w-4" />
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <Icon name="AlertCircle" className="h-3 w-3" />
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <Controller
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="admin-remember-me"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      aria-label="Remember me"
                    />
                    <Label
                      htmlFor="admin-remember-me"
                      className="text-sm font-normal cursor-pointer"
                      onClick={() => field.onChange(!field.value)}
                    >
                      Remember me
                    </Label>
                  </div>
                )}
              />

              {/* Security Notice */}
            

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white font-medium transition-all duration-200"
                disabled={isLoading}
                id="parcego-admin-login-submit"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleForgotPassword}
                className="w-full text-gray-600 hover:text-gray-800"
                disabled={isLoading}
                id="parcego-admin-forgot-password"
              >
                <Icon name="HelpCircle" className="mr-2 h-4 w-4" />
                Forgot Password?
              </Button>
              
              {/* <Button
                variant="outline"
                size="sm"
                onClick={handleBackToDashboard}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
                id="parcego-admin-back-to-dashboard"
              >
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                Back to Merchant Dashboard
              </Button> */}
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Info */}
       

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>© 2025 Parcego. All rights reserved.</p>
          <p>Administrator access is subject to terms and conditions.</p>
        </div>
      </div>
    </div>
  );
};

// Loading component for Suspense fallback
const AdminLoginLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Main page component with Suspense boundary
const AdminLogin = () => {
  return (
    <Suspense fallback={<AdminLoginLoadingFallback />}>
      <AdminLoginContent />
    </Suspense>
  );
};

export default AdminLogin;

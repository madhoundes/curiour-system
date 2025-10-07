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

// Form validation schema
const courierLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Mock authentication function
const mockAuthenticate = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock authentication logic - multiple test accounts
  const validCredentials = [
    { email: "courier@parcego.com", password: "password123" },
    { email: "driver@parcego.com", password: "driver123" },
    { email: "test@parcego.com", password: "test123" },
    { email: "demo@parcego.com", password: "demo123" },
    { email: "admin@parcego.com", password: "admin123" }
  ];
  
  const isValid = validCredentials.some(cred => 
    cred.email === email && cred.password === password
  );
  
  if (isValid) {
    return { success: true };
  } else if (!email || !password) {
    return { success: false, error: "Please enter both email and password" };
  } else {
    return { success: false, error: "Invalid email or password. Please try again." };
  }
};

export default function CourierLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form with placeholder demo credentials
  const form = useForm<z.infer<typeof courierLoginSchema>>({
    defaultValues: {
      email: "courier@parcego.com",
      password: "password123",
    },
    resolver: zodResolver(courierLoginSchema),
  });

  const onSubmit = async (data: z.infer<typeof courierLoginSchema>) => {
    setError("");
    setIsLoading(true);

    try {
      const result = await mockAuthenticate(data.email, data.password);
      
      if (result.success) {
        // Only run on client side to prevent hydration mismatch
        if (typeof window !== 'undefined') {
          // Store authentication state (in real app, this would be a JWT token)
          localStorage.setItem("courier_authenticated", "true");
          localStorage.setItem("courier_email", data.email);
          localStorage.setItem("courier_login_time", Date.now().toString());
          
          // Enhanced cookie setting for LAN network compatibility
          const isSecure = window.location.protocol === 'https:';
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const isLAN = window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('192.168.');
          
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
          
          // Debug logging for LAN troubleshooting
          console.log('Cookie set:', cookieValue);
          console.log('Current location:', window.location.href);
          console.log('Protocol:', window.location.protocol);
          console.log('Hostname:', window.location.hostname);
          
          // Verify cookie was set before redirect
          const cookieCheck = document.cookie.includes('courier_authenticated=true');
          console.log('Cookie verification:', cookieCheck);
          
          if (cookieCheck) {
            // Add a longer delay for LAN networks to ensure cookie propagation
            const delay = isLAN ? 500 : 100;
            setTimeout(() => {
              console.log('Redirecting to /courier...');
              router.push("/courier");
            }, delay);
          } else {
            console.error('Cookie not set properly, using fallback method...');
            // Fallback: Use URL parameter for LAN networks
            if (isLAN) {
              const fallbackUrl = `/courier?auth=temp&email=${encodeURIComponent(data.email)}&time=${Date.now()}`;
              console.log('Using fallback URL:', fallbackUrl);
              router.push(fallbackUrl);
            } else {
              // Retry cookie setting for non-LAN networks
              document.cookie = cookieValue;
              setTimeout(() => {
                router.push("/courier");
              }, 200);
            }
          }
        } else {
          // Fallback for server-side rendering
          router.push("/courier");
        }
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
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

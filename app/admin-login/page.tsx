"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form validation schema
const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

// Mock authentication function for admin
const mockAdminAuthenticate = async (email: string, password: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Mock admin authentication logic - predefined admin accounts
  const validAdminCredentials = [
    { email: "admin@parcego.com", password: "admin123" },
    { email: "superadmin@parcego.com", password: "super123" },
    { email: "system@parcego.com", password: "system123" },
    { email: "root@parcego.com", password: "root123" },
  ];
  
  const isValid = validAdminCredentials.some(cred => 
    cred.email === email && cred.password === password
  );
  
  if (isValid) {
    return { success: true };
  } else if (!email || !password) {
    return { success: false, error: "Please enter both email and password" };
  } else {
    return { success: false, error: "Invalid admin credentials. Access denied." };
  }
};

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form with auto-filled admin credentials for quick access
  const form = useForm<AdminLoginFormData>({
    defaultValues: {
      email: "admin@parcego.com",
      password: "admin123",
    },
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    setError("");
    setIsLoading(true);

    try {
      const result = await mockAdminAuthenticate(data.email, data.password);
      
      if (result.success) {
        // Store admin authentication state
        if (typeof window !== 'undefined') {
          localStorage.setItem("admin_authenticated", "true");
          localStorage.setItem("admin_email", data.email);
          localStorage.setItem("admin_login_time", new Date().toISOString());
          
          // Set admin authentication cookie
          const adminCookieValue = `admin_authenticated=true; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = adminCookieValue;
          
          console.log('Admin authentication successful');
          
          // Redirect to admin dashboard
          setTimeout(() => {
            console.log('Redirecting to admin dashboard...');
            router.push("/admin");
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
                    placeholder="admin@parcego.com"
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
}

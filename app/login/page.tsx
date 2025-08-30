"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const signupFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const Login03Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    defaultValues: {
      email: "merchant@business.com",
      password: "password123",
    },
    resolver: zodResolver(loginFormSchema),
  });

  const signupForm = useForm<z.infer<typeof signupFormSchema>>({
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(signupFormSchema),
  });

  // Function to set mock authentication cookie and redirect
  const handleSuccessfulAuth = () => {
    // Set a mock authentication cookie
    document.cookie = "mock-auth=true; path=/; max-age=86400"; // 24 hours
    
    // Redirect to dashboard
    router.push("/dashboard");
  };

  const onLoginSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);
    console.log("Login data:", data);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login successful - redirect to dashboard");
      handleSuccessfulAuth();
    }, 2000);
  };

  const onSignupSubmit = async (data: z.infer<typeof signupFormSchema>) => {
    setIsLoading(true);
    console.log("Signup data:", data);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      console.log("Signup successful - redirect to dashboard");
      handleSuccessfulAuth();
    }, 2000);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      console.log("Guest login successful - redirect to dashboard");
      handleSuccessfulAuth();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Login Form */}
        <div className="max-w-md m-auto w-full flex flex-col items-center px-6">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <Image 
              src="/Logo/Master-logo.svg" 
              alt="Parcego Logo" 
              width={80}
              height={80}
              className="h-20 w-auto mx-auto mb-4"
            />
            {/* Removed Parcego text under logo */}
          </div>

          {/* Sample Credentials */}
          {/* <div className="mb-5 w-full rounded-lg border border-border bg-muted/50 p-4 text-left text-sm text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Sample Credentials</p>
            <p>
              Email: <span className="select-all font-medium text-foreground">merchant@business.com</span>
            </p>
            <p>
              Password: <span className="select-all font-medium text-foreground">password123</span>
            </p>
          </div> */}

          {/* Tabs for Login/Signup */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2 gap-2 bg-transparent p-0 overflow-hidden">
              <TabsTrigger
                value="login"
                aria-label="Sign in tab"
                className="h-10 rounded-md bg-accent text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                aria-label="Create account tab"
                className="h-10 rounded-md bg-accent text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <Form {...loginForm}>
                <form
                  className="w-full space-y-4"
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="merchant@business.com"
                            className="w-full h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="w-full h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="mt-2 h-11 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In Securely"}
                  </Button>
                  
                  {/* Guest Login Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 w-full"
                    disabled={isLoading}
                    onClick={handleGuestLogin}
                  >
                    {isLoading ? "Logging in as Guest..." : "Guest Login"}
                  </Button>
                </form>
              </Form>

              <div className="mt-3 space-y-2">
                <Link
                  href="#"
                  className="text-sm block underline text-muted-foreground text-center"
                >
                  Forgot your password?
                </Link>
                <p className="text-sm text-center">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="underline text-muted-foreground hover:text-foreground"
                  >
                    Create account
                  </button>
                </p>
              </div>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4">
              <Form {...signupForm}>
                <form
                  className="w-full space-y-4"
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={signupForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" className="w-full h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" className="w-full h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={signupForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Business LLC" className="w-full h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="merchant@business.com"
                            className="w-full h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="w-full h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="h-11 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <p className="text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="underline text-muted-foreground hover:text-foreground"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Background/Info */}
        <div className="bg-muted hidden lg:flex relative min-h-screen items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90"></div>
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
            <div className="text-center max-w-md">
              {/* Removed box icon above headline */}
              <h2 className="text-2xl font-bold mb-4">
                Streamline Your Shipping Operations
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Create shipments, track deliveries, and grow your business with Parcego.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-row justify-center items-center space-x-6 text-center">
                <div className="flex flex-col items-center space-y-1">
                  <Icon name="Shield" size={24} className="text-blue-200" />
                  <span className="text-base">SSL Encrypted</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Icon name="Clock" size={24} className="text-blue-200" />
                  <span className="text-base">24/7 Support</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Icon name="Package" size={24} className="text-blue-200" />
                  <span className="text-base">99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links - Hidden as requested */}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-6 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/support')}
            className="text-gray-500 hover:text-gray-700"
          >
            Help & Support
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-gray-700"
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/create-shipment')}
            className="text-gray-500 hover:text-gray-700"
          >
            Create Shipment
          </Button>
        </div>
      </div> */}
    </div>
  );
};

export default Login03Page;

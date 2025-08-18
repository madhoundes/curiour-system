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

  const onLoginSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);
    console.log("Login data:", data);
    
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login successful - redirect to dashboard");
      router.push("/dashboard");
    }, 2000);
  };

  const onSignupSubmit = async (data: z.infer<typeof signupFormSchema>) => {
    setIsLoading(true);
    console.log("Signup data:", data);
    
    setTimeout(() => {
      setIsLoading(false);
      console.log("Signup successful - redirect to dashboard");
      router.push("/dashboard");
    }, 2000);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Guest login successful - redirect to dashboard");
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-full h-full grid lg:grid-cols-2">
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
          <div className="mb-6 p-3 rounded-md bg-gray-50 border border-gray-200 text-left text-xs text-gray-600 w-full">
            <span className="font-semibold">Sample Credentials:</span><br />
            Email: <span className="select-all">merchant@business.com</span><br />
            Password: <span className="select-all">password123</span>
          </div>

          {/* Tabs for Login/Signup */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
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
                            className="w-full"
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
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="mt-4 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In Securely"}
                  </Button>
                  
                  {/* Guest Login Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                    onClick={handleGuestLogin}
                  >
                    {isLoading ? "Logging in as Guest..." : "Guest Login"}
                  </Button>
                </form>
              </Form>

              <div className="space-y-3">
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
                            <Input placeholder="John" className="w-full" {...field} />
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
                            <Input placeholder="Doe" className="w-full" {...field} />
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
                          <Input placeholder="Your Business LLC" className="w-full" {...field} />
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
                            className="w-full"
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
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
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
        <div className="bg-muted hidden lg:block relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90"></div>
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-12">
            <div className="text-center max-w-md">
              {/* Removed box icon above headline */}
              <h2 className="text-3xl font-bold mb-4">
                Streamline Your Shipping Operations
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Create shipments, track deliveries, and grow your business with our comprehensive courier platform.
              </p>
              
              {/* Trust Indicators */}
              <div className="space-y-4 flex flex-col">
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="Shield" size={20} className="text-blue-200" />
                  <span className="text-sm">SSL Encrypted</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="Clock" size={20} className="text-blue-200" />
                  <span className="text-sm">24/7 Support</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="Package" size={20} className="text-blue-200" />
                  <span className="text-sm">99.9% Uptime</span>
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

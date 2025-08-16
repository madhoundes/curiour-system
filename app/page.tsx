"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";

export default function MerchantLandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login successful - redirect to dashboard");
      router.push("/dashboard");
    }, 2000);
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      console.log("Signup successful - redirect to email verification");
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

  const landingSubtitle = "Experience the platform instantly — sign in, create an account, or try as a guest.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 pt-4 pb-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/Logo/Master-logo.svg" 
              alt="Curiour Logo" 
              width={128}
              height={128}
              className="h-32 w-auto"
            />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6 hidden">
            The affordable, efficient, and transparent delivery solution for small businesses. 
            Create shipments, track deliveries, and grow your business with confidence.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 hidden">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-250">
                              <div className="flex justify-center mb-4">
                  <Icon name="Package" size={48} className="text-blue-600" />
                </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Shipment Creation</h3>
              <p className="text-gray-600 text-sm">Generate shipping labels with real-time quotes in seconds</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-250">
                              <div className="flex justify-center mb-4">
                  <Icon name="MapPin" size={48} className="text-green-600" />
                </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">Track your packages with GPS precision and photo proof</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-250">
                              <div className="flex justify-center mb-4">
                  <Icon name="BarChart3" size={48} className="text-purple-600" />
                </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Analytics</h3>
              <p className="text-gray-600 text-sm">Comprehensive insights to optimize your shipping operations</p>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Get Started Today</CardTitle>
              <CardDescription className="text-gray-600">
                {landingSubtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Sample Credentials for Dev Testing */}
              <div className="mb-4 p-3 rounded-md bg-gray-50 border border-gray-200 text-left text-xs text-gray-600">
                <span className="font-semibold">Sample Credentials:</span><br />
                Email: <span className="select-all">merchant@business.com</span><br />
                Password: <span className="select-all">password123</span>
              </div>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="merchant@business.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In Securely"}
                    </Button>
                    {/* Guest Login Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-2"
                      disabled={isLoading}
                      onClick={handleGuestLogin}
                    >
                      {isLoading ? "Logging in as Guest..." : "Guest Login"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input id="first-name" placeholder="John" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input id="last-name" placeholder="Doe" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input id="business-name" placeholder="Your Business LLC" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <Input id="signup-email" type="email" placeholder="merchant@business.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" placeholder="••••••••" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by 1,000+ businesses worldwide</p>
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={20} />
              <span className="text-sm">SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={20} />
              <span className="text-sm">24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Package" size={20} />
              <span className="text-sm">99.9% Uptime</span>
            </div>
          </div>
          
          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-sm">
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
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function MerchantLandingPage() {
  const router = useRouter();

  // Redirect to login page after a brief delay to show the landing content
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000); // Show landing page for 3 seconds then redirect

    return () => clearTimeout(timer);
  }, [router]);

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handleLearnMore = () => {
    // Scroll to features section or show more info
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 pt-4 pb-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/Logo/Master-logo.svg" 
              alt="Parcego Logo" 
              width={128}
              height={128}
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to Parcego
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            The affordable, efficient, and transparent delivery solution for small businesses. 
            Create shipments, track deliveries, and grow your business with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="text-lg px-8 py-3"
            >
              Get Started Today
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleLearnMore}
              className="text-lg px-8 py-3"
            >
              Learn More
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" id="features">
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-all duration-250">
              <div className="flex justify-center mb-4">
                <Icon name="Package" size={48} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Shipment Creation</h3>
              <p className="text-gray-600 text-sm">Generate shipping labels with real-time quotes in seconds</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-all duration-250">
              <div className="flex justify-center mb-4">
                <Icon name="MapPin" size={48} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">Track your packages with GPS precision and photo proof</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-all duration-250">
              <div className="flex justify-center mb-4">
                <Icon name="BarChart3" size={48} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Analytics</h3>
              <p className="text-gray-600 text-sm">Comprehensive insights to optimize your shipping operations</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Ready to Transform Your Shipping?</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Join thousands of businesses already using Parcego to streamline their delivery operations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-blue-100 mb-6">
                Experience the platform instantly — sign in, create an account, or try as a guest.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleGetStarted}
                className="text-lg px-8 py-3"
              >
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
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

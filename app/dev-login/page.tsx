"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export default function DevLogin() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});

  useEffect(() => {
    // Gather debug information
    const info = {
      protocol: window.location.protocol,
      host: window.location.host,
      hostname: window.location.hostname,
      isSecureContext: window.isSecureContext,
      userAgent: navigator.userAgent,
      localStorage: typeof Storage !== 'undefined' ? 'Available' : 'Not Available',
      cookies: document.cookie || 'No cookies'
    };
    setDebugInfo(info);
  }, []);

  const handleQuickLogin = async (email: string) => {
    setIsLoggingIn(true);
    
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set authentication in localStorage
      localStorage.setItem("courier_authenticated", "true");
      localStorage.setItem("courier_email", email);
      localStorage.setItem("courier_login_time", Date.now().toString());
      
      // Set authentication cookie
      const isSecure = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isLAN = window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('192.168.');
      
      const cookieOptions = [
        'courier_authenticated=true',
        'path=/',
        'max-age=86400',
        'SameSite=Lax'
      ];
      
      if (isSecure || isLocalhost) {
        cookieOptions.push('Secure');
      }
      
      if (isLAN) {
        cookieOptions.push('domain=' + window.location.hostname);
      }
      
      document.cookie = cookieOptions.join('; ');
      
      console.log('✅ Development login successful');
      console.log('🔍 Debug info:', debugInfo);
      
      // Redirect to courier dashboard
      router.push("/courier");
      
    } catch (error) {
      console.error('❌ Development login failed:', error);
      setIsLoggingIn(false);
    }
  };

  const testAccounts = [
    { email: "courier@parcego.com", role: "Courier", color: "bg-blue-100 text-blue-800" },
    { email: "driver@parcego.com", role: "Driver", color: "bg-green-100 text-green-800" },
    { email: "test@parcego.com", role: "Test User", color: "bg-purple-100 text-purple-800" },
    { email: "demo@parcego.com", role: "Demo User", color: "bg-orange-100 text-orange-800" },
    { email: "admin@parcego.com", role: "Admin", color: "bg-red-100 text-red-800" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Icon name="Settings" size={24} className="text-blue-600" />
              Development Login Helper
            </CardTitle>
            <CardDescription>
              Quick login for testing the courier dashboard without manual authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Debug Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">🔍 Debug Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {Object.entries(debugInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-gray-900 font-mono text-xs">
                      {String(value).length > 50 ? String(value).substring(0, 50) + '...' : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Login Buttons */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">🚀 Quick Login Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testAccounts.map((account) => (
                  <Button
                    key={account.email}
                    onClick={() => handleQuickLogin(account.email)}
                    disabled={isLoggingIn}
                    className="h-auto p-4 flex flex-col items-start space-y-2"
                    variant="outline"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{account.email}</span>
                      <Badge className={account.color}>
                        {account.role}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      Click to login as {account.role}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Manual Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Or use the manual login form for testing authentication flow
              </p>
              <Button
                onClick={() => router.push("/courier-login")}
                variant="ghost"
                className="text-blue-600 hover:text-blue-700"
              >
                <Icon name="LogIn" size={16} className="mr-2" />
                Go to Manual Login
              </Button>
            </div>

            {/* Loading State */}
            {isLoggingIn && (
              <div className="text-center py-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Logging you in...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📋 Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">For HTTPS Testing:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Make sure you&apos;re using HTTPS (not HTTP)</li>
                <li>Accept the self-signed certificate if prompted</li>
                <li>Check that &quot;Is Secure Context&quot; shows &quot;true&quot; above</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">For Authentication Testing:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Click any of the quick login buttons above</li>
                <li>You&apos;ll be automatically logged in and redirected to the courier dashboard</li>
                <li>Check browser console for authentication debug messages</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Troubleshooting:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>If you see a white screen, check browser console for errors</li>
                <li>Clear browser cache and cookies if needed</li>
                <li>Try a different browser (Chrome, Firefox, Safari)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

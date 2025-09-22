"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HTTPSTestPage() {
  const [testResults, setTestResults] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runTests = () => {
      const results: Record<string, unknown> = {};

      // Test 1: Basic environment info
      results.protocol = window.location.protocol;
      results.host = window.location.host;
      results.href = window.location.href;
      results.isSecureContext = window.isSecureContext;

      // Test 2: LocalStorage access
      try {
        localStorage.setItem('https-test', 'test-value');
        const testValue = localStorage.getItem('https-test');
        results.localStorage = testValue === 'test-value' ? 'Working' : 'Failed';
        localStorage.removeItem('https-test');
      } catch (error) {
        results.localStorage = `Error: ${error}`;
      }

      // Test 3: Camera API availability
      results.cameraAPI = 'navigator.mediaDevices' in navigator ? 'Available' : 'Not Available';
      
      if ('navigator' in window && 'mediaDevices' in navigator) {
        results.getUserMedia = typeof navigator.mediaDevices.getUserMedia === 'function' ? 'Available' : 'Not Available';
      } else {
        results.getUserMedia = 'Not Available';
      }

      // Test 4: HTTPS specific features
      results.serviceWorker = 'serviceWorker' in navigator ? 'Available' : 'Not Available';
      results.geolocation = 'geolocation' in navigator ? 'Available' : 'Not Available';
      results.notifications = 'Notification' in window ? 'Available' : 'Not Available';

      // Test 5: Network connectivity
      results.online = navigator.onLine ? 'Online' : 'Offline';
      results.connection = 'connection' in navigator ? 'Available' : 'Not Available';

      // Test 6: Console access
      results.console = typeof console !== 'undefined' ? 'Available' : 'Not Available';

      setTestResults(results);
      setIsLoading(false);
    };

    runTests();
  }, []);

  const getStatusColor = (value: unknown) => {
    if (typeof value === 'string') {
      if (value.includes('Error') || value === 'Failed' || value === 'Not Available') {
        return 'bg-red-100 text-red-800';
      }
      if (value === 'Working' || value === 'Available' || value === 'Online') {
        return 'bg-green-100 text-green-800';
      }
      if (value === 'https:') {
        return 'bg-green-100 text-green-800';
      }
      if (value === 'http:') {
        return 'bg-yellow-100 text-yellow-800';
      }
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Running HTTPS tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 HTTPS Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(testResults).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <Badge className={getStatusColor(value)}>
                      {String(value)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔧 Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">If you see a white screen on the courier page:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Check that the protocol shows &quot;https:&quot; above</li>
                <li>Verify that &quot;Is Secure Context&quot; shows &quot;true&quot;</li>
                <li>Open browser developer tools (F12) and check the Console tab for errors</li>
                <li>Look for any red error messages in the console</li>
                <li>Try refreshing the page after accepting the SSL certificate</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">If camera access doesn&apos;t work:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Ensure you&apos;re using HTTPS (not HTTP)</li>
                <li>Check that &quot;Camera API&quot; shows &quot;Available&quot;</li>
                <li>Make sure you&apos;ve accepted the self-signed certificate</li>
                <li>Try accessing the site from your phone&apos;s browser</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Common fixes:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Clear browser cache and cookies</li>
                <li>Try a different browser (Chrome, Firefox, Safari)</li>
                <li>Restart the development server</li>
                <li>Check that port 3001 is not blocked by firewall</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button 
            onClick={() => window.location.href = '/courier'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Test Courier Page
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Tests
          </Button>
        </div>
      </div>
    </div>
  );
}

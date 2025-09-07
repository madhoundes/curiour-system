'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CourierTestPage() {
  const router = useRouter();

  useEffect(() => {
    // Set authentication cookies for testing
    document.cookie = 'courier_authenticated=true; path=/; secure; samesite=lax; max-age=86400';
    document.cookie = 'mock-auth=true; path=/; secure; samesite=lax; max-age=86400';
    
    // Force reload to ensure cookies are set
    setTimeout(() => {
      window.location.href = '/courier';
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up authentication...</h2>
        <p className="text-gray-600">Redirecting to courier dashboard...</p>
      </div>
    </div>
  );
}

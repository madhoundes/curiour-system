import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api/config';

/**
 * Next.js API Route Proxy for Shopify OAuth Install Authenticated
 * 
 * This proxy route solves the CORS issue by:
 * 1. Frontend calls this route (same-origin, no CORS)
 * 2. This route calls the backend API with Authorization header
 * 3. Returns the redirect URL to frontend
 * 4. Frontend navigates to Shopify using window.location.href
 */
export async function GET(request: NextRequest) {
  try {
    // Get shop parameter from query string
    const searchParams = request.nextUrl.searchParams;
    const shop = searchParams.get('shop');
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop parameter is required' },
        { status: 400 }
      );
    }
    
    // Get Authorization header from request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }
    
    // Call the backend API
    const backendUrl = `${API_CONFIG.BASE_URL}/shopify/auth/install-authenticated?shop=${encodeURIComponent(shop)}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || response.statusText };
      }
      
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Failed to connect to Shopify' },
        { status: response.status }
      );
    }
    
    // Parse the response
    const data = await response.json();
    
    // Extract redirect URL from various possible response formats
    const redirectUrl = data.auth_url || 
                       data.redirect_url || 
                       data.data?.auth_url || 
                       data.data?.redirect_url;
    
    if (!redirectUrl) {
      return NextResponse.json(
        { error: 'No redirect URL in response from backend' },
        { status: 500 }
      );
    }
    
    // Return the redirect URL to frontend
    return NextResponse.json({
      auth_url: redirectUrl,
      redirect_url: redirectUrl,
    });
    
  } catch (error: any) {
    console.error('Shopify OAuth proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


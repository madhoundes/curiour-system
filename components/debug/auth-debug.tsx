"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authService, profileService } from "@/lib/api"

export function AuthDebug() {
  const [authState, setAuthState] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const checkAuthState = () => {
    if (typeof window === 'undefined') return

    const state = {
      authToken: localStorage.getItem('auth_token'),
      mockAuthCookie: document.cookie.includes('mock-auth=true'),
      isAuthenticated: authService.isAuthenticated(),
      cookies: document.cookie,
      localStorage: {
        auth_token: localStorage.getItem('auth_token'),
        courier_authenticated: localStorage.getItem('courier_authenticated'),
        courier_email: localStorage.getItem('courier_email'),
      }
    }
    
    setAuthState(state)
    console.log('🔍 Auth Debug State:', state)
  }

  const testProfileCall = async () => {
    setIsLoading(true)
    try {
      const profile = await profileService.getProfile()
      console.log('✅ Profile call successful:', profile)
      alert('Profile call successful! Check console for details.')
    } catch (error) {
      console.error('❌ Profile call failed:', error)
      alert(`Profile call failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAuth = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('courier_authenticated')
    localStorage.removeItem('courier_email')
    localStorage.removeItem('courier_login_time')
    document.cookie = "mock-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "courier_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    checkAuthState()
    alert('Authentication cleared!')
  }

  useEffect(() => {
    checkAuthState()
  }, [])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
        <CardDescription>Debug authentication state and API calls</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button onClick={checkAuthState} variant="outline">
            Refresh State
          </Button>
          <Button onClick={testProfileCall} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Profile API'}
          </Button>
          <Button onClick={clearAuth} variant="destructive">
            Clear Auth
          </Button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Authentication State:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
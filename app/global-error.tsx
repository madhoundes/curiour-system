'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle as AlertTriangleIcon, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const handleReset = () => {
    // Attempt to recover by trying to re-render the segment
    reset()
  }

  const handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/'
  }

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-red-200">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-red-900">
                Critical Error
              </CardTitle>
              <CardDescription className="text-red-700">
                A critical error occurred that prevented the application from loading.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && (
                <div className="p-3 bg-gray-100 rounded-md text-xs text-gray-600 font-mono">
                  <div className="font-semibold mb-1">Error Details:</div>
                  <div>{error.message}</div>
                  {error.digest && (
                    <div className="mt-1">Digest: {error.digest}</div>
                  )}
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={handleReset}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleGoHome}
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                If this problem persists, please contact support or refresh the page.
              </p>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
